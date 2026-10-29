"""
La Zuricata v3 "minimalista": helper de estilo para placas sociales (Pillow + numpy).

Dirección: negro puro, tipografía blanca, grises, mucho aire, editorial
(referencia: PDF "campamento-de-agentes"). Acento sunset (gradiente 135° de
SUNSET_START a SUNSET_END, el mismo de Travelsats) como tercer color de apoyo,
máximo un acento por placa (en placas de herramientas Carlos acepta más de uno).

Acento: pasá fill="sunset" (o el alias viejo "gold") a text/title/rule/card/pill/bar/line
y se pinta con el gradiente. Para dibujos directos con ImageDraw o matplotlib, donde no se
puede usar gradiente, PALETTE["gold"] / PALETTE["sunset"] devuelven el sólido SUNSET_SOLID.
Helpers sueltos: linear_gradient, paint_gradient_mask, text_gradient, rect_gradient.
Línea bajo el título (regla de plantilla): 75% del ancho real del título, alineada a su
izquierda; Placa.title_rule(title_bbox, y) o draw_title_rule(im, title_bbox, y), con text_ink_bbox.

    import zuricata_style_v3 as zs
    p = zs.Placa("feed")                       # 1080x1080 ("story" 1080x1920)
    p.header("privacidad", "01 / 08")          # rótulo mono espaciado + contador
    y = p.title(p.M, 220, "Tus datos\\nvalen más\\nque tu clave.", size=120)
    p.footer()
    p.save("out/placa.png")

Fotos: zs.photo_bg(path, size, focus=(0.5,0.5), zoom=1.0, overlay=[...]) devuelve una imagen
B&N oscurecida con degradé y grano, lista para usar como fondo (Placa(bg=...)).
Reglas editoriales (sin raya, sin hora del día) se validan en cada texto dibujado.
"""
from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

HERE = Path(__file__).resolve().parent
FONTS = HERE / "fonts"
AVATAR = HERE / "assets" / "zuricata-avatar.png"
HANDLE = "@LaZuricata"

FORMATS = {"feed": (1080, 1080), "story": (1080, 1920), "landscape": (1600, 900)}

# ── Paleta ──────────────────────────────────────────────────────────────────
# Acento sunset (oct 2026, opción B elegida por Carlos): reemplaza al oro #e6b45c.
SUNSET_START = "#fbbf24"   # ámbar, arriba a la izquierda (tour-amber de Travelsats), 12.6:1 sobre negro
SUNSET_END = "#ea580c"     # naranja, abajo a la derecha (tour-orange de Travelsats), 5.9:1 sobre negro
SUNSET_ANGLE = 135         # grados, como CSS linear-gradient(135deg, ...)
SUNSET_SOLID = "#f59e0b"   # respaldo sólido para trazos finos o dibujos sin gradiente, 9.8:1 sobre negro
SUNSET_MIN_STROKE = 2      # trazos de menos px que esto van en sólido
TITLE_RULE_RATIO = 0.75   # regla de plantilla: la línea bajo el título mide el 75% del ancho real del título
TITLE_RULE_WIDTH = 6      # grosor en px de esa línea
LEGACY_GOLD = "#e6b45c"    # oro anterior, solo como referencia histórica (no usar)
# Nombres de color que se pintan con el gradiente (los "gold*" quedan como alias para scripts viejos).
ACCENT_NAMES = ("sunset", "accent", "gold", "gold_ref")

# Monocromo muestreado del PDF + acento sunset.
PALETTE = {
    "black":     "#000000",  # fondo
    "surface":   "#0b0b0b",  # tarjeta apenas elevada (opcional)
    "white":     "#ffffff",  # títulos, números
    "body":      "#d8d8d8",  # texto de cuerpo
    "secondary": "#bebebe",  # bajadas
    "label":     "#8e8e8e",  # rótulos chicos, ejes
    "faint":     "#555555",  # contador, datos apagados
    "border":    "#2f2f2f",  # bordes de tarjeta, reglas, grilla
    "track":     "#1c1c1c",  # pista de barras
    # Acento: un solo acento por placa. Como hex suelto vale el sólido de respaldo;
    # pasado por nombre a los métodos de Placa se pinta con el gradiente.
    "sunset":       SUNSET_SOLID,
    "accent":       SUNSET_SOLID,
    "sunset_solid": SUNSET_SOLID,   # forzar sólido (no cuenta distinto: también es acento)
    "sunset_start": SUNSET_START,
    "sunset_end":   SUNSET_END,
    "gold":         SUNSET_SOLID,   # alias viejo
    "gold_ref":     SUNSET_SOLID,   # alias viejo
}
GOLD_OPTIONS = {"sunset": SUNSET_SOLID}  # compatibilidad


def hex2rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rel_lum(h: str) -> float:
    c = [x / 255 for x in hex2rgb(h)]
    c = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contrast(a: str, b: str = "#000000") -> float:
    la, lb = sorted((rel_lum(a), rel_lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


# ── Gradiente sunset ────────────────────────────────────────────────────────
def is_accent(c) -> bool:
    return isinstance(c, str) and c in ACCENT_NAMES


def linear_gradient(size, c0=SUNSET_START, c1=SUNSET_END, angle=SUNSET_ANGLE) -> Image.Image:
    """Gradiente como CSS linear-gradient(angle, c0, c1) sobre una caja (w, h).
    135°: c0 arriba a la izquierda, c1 abajo a la derecha."""
    w, h = max(1, int(size[0])), max(1, int(size[1]))
    a = np.deg2rad(angle)
    dx, dy = np.sin(a), -np.cos(a)            # 0° = hacia arriba, como CSS
    L = abs(w * dx) + abs(h * dy)             # largo de la línea de gradiente CSS
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    t = ((xx + 0.5 - w / 2) * dx + (yy + 0.5 - h / 2) * dy) / max(L, 1e-6) + 0.5
    t = np.clip(t, 0, 1)[..., None]
    rgb = np.array(hex2rgb(c0), float) * (1 - t) + np.array(hex2rgb(c1), float) * t
    return Image.fromarray(np.uint8(np.round(rgb)), "RGB")


def paint_gradient_mask(im: Image.Image, mask: Image.Image, box=None, c0=SUNSET_START, c1=SUNSET_END,
                        angle=SUNSET_ANGLE):
    """Pinta el gradiente sobre im a través de mask (L, mismo tamaño que im).
    box: caja (x0, y0, x1, y1) sobre la que corre el gradiente; por defecto, la tinta de la máscara."""
    box = box or mask.getbbox()
    if not box:
        return None
    x0, y0, x1, y1 = [int(round(v)) for v in box]
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(im.width, max(x1, x0 + 1)), min(im.height, max(y1, y0 + 1))
    g = linear_gradient((x1 - x0, y1 - y0), c0, c1, angle)
    im.paste(g, (x0, y0), mask.crop((x0, y0, x1, y1)))
    return (x0, y0, x1, y1)


def text_gradient(im, xy, s, f, anchor="ls", tracking=0.0, c0=SUNSET_START, c1=SUNSET_END, angle=SUNSET_ANGLE):
    """Texto relleno con el gradiente (máscara del texto). tracking en em."""
    m = Image.new("L", im.size, 0)
    d = ImageDraw.Draw(m)
    if not tracking:
        d.text(xy, s, font=f, fill=255, anchor=anchor)
    else:
        x, y = xy
        for ch in s:
            d.text((x, y), ch, font=f, fill=255, anchor=anchor)
            x += f.getlength(ch) + tracking * f.size
    return paint_gradient_mask(im, m, None, c0, c1, angle)


def rect_gradient(im, box, radius=0, c0=SUNSET_START, c1=SUNSET_END, angle=SUNSET_ANGLE):
    """Rectángulo (o rectángulo redondeado) relleno con el gradiente."""
    m = Image.new("L", im.size, 0)
    d = ImageDraw.Draw(m)
    if radius:
        d.rounded_rectangle(box, radius, fill=255)
    else:
        d.rectangle(box, fill=255)
    return paint_gradient_mask(im, m, (box[0], box[1], box[2] + 1, box[3] + 1), c0, c1, angle)


def text_ink_bbox(s, f, xy=(0, 0), anchor="ls", tracking=0.0):
    """Caja (x0, y0, x1, y1) de la tinta real de un texto dibujado en xy con su fuente
    (tracking en em, igual que Placa.text). x1 e y1 son exclusivos."""
    x, y = xy
    pad = f.size * 2
    w = int(sum(f.getlength(ch) for ch in s) + abs(tracking) * f.size * len(s)) + 2 * pad
    m = Image.new("L", (w, f.size * 4), 0)
    d = ImageDraw.Draw(m)
    ox, oy = pad, f.size * 2
    if not tracking:
        d.text((ox, oy), s, font=f, fill=255, anchor=anchor)
    else:
        cx = ox
        for ch in s:
            d.text((cx, oy), ch, font=f, fill=255, anchor=anchor)
            cx += f.getlength(ch) + tracking * f.size
    bb = m.point(lambda v: 255 if v > 10 else 0).getbbox()
    if not bb:
        return None
    return (x + bb[0] - ox, y + bb[1] - oy, x + bb[2] - ox, y + bb[3] - oy)


def title_rule_box(title_bbox, y, width=TITLE_RULE_WIDTH, ratio=TITLE_RULE_RATIO):
    """Regla de plantilla: caja de la línea bajo el título. Arranca en el borde izquierdo de la
    tinta del título y mide ratio (75%) de su ancho real. y = borde superior de la línea."""
    x0, _, x1, _ = title_bbox
    length = max(1, round((x1 - x0) * ratio))
    return (int(round(x0)), int(y), int(round(x0)) + length - 1, int(y) + width - 1)


def draw_title_rule(im, title_bbox, y, width=TITLE_RULE_WIDTH, ratio=TITLE_RULE_RATIO):
    """Dibuja la línea bajo el título con el gradiente sunset (para renderers sin Placa)."""
    return rect_gradient(im, title_rule_box(title_bbox, y, width, ratio))


# ── Tipografía ──────────────────────────────────────────────────────────────
_FONT_FILES = {
    "mono":        "IosevkaCharonMono-Regular.ttf",
    "mono-light":  "IosevkaCharonMono-Light.ttf",
    "mono-medium": "IosevkaCharonMono-Medium.ttf",
    "mono-bold":   "IosevkaCharonMono-Bold.ttf",
    "sans":        "Manrope-Regular.ttf",
    "sans-light":  "Manrope-Light.ttf",
    "sans-medium": "Manrope-Medium.ttf",
    "sans-semi":   "Manrope-SemiBold.ttf",
    "sans-bold":   "Manrope-Bold.ttf",
    "sans-xbold":  "Manrope-ExtraBold.ttf",
}


@lru_cache(maxsize=None)
def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / _FONT_FILES[name]), size)


# Escala tipográfica (px) para 1080 de ancho
TYPE = {
    "display": 132,   # título enorme de placa solo tipográfica
    "title": 104,     # título feed
    "title_story": 120,
    "number": 300,    # número gigante
    "body": 34,
    "small": 26,
    "label": 20,      # rótulos mono espaciados
}
TRACK_LABEL = 0.32   # em extra por carácter en rótulos (el PDF va muy espaciado)
TRACK_TITLE = -0.03  # títulos apretados

# ── Reglas editoriales ──────────────────────────────────────────────────────
_EM_DASH = "\u2014"
_TIME_RE = re.compile(r"\b\d{1,2}[:h]\d{2}\b|\b\d{1,2}\s?(am|pm|hs)\b|\b\d{1,2}\s?[ap]\.\s?m\.", re.I)


def check_text(t: str) -> None:
    if _EM_DASH in t:
        raise ValueError(f"Sin raya (em dash): {t!r}")
    if _TIME_RE.search(t):
        raise ValueError(f"Sin hora del día: {t!r}")


# ── Fotos ───────────────────────────────────────────────────────────────────
def _cover(im: Image.Image, size, focus=(0.5, 0.5), zoom=1.0) -> Image.Image:
    W, H = size
    s = max(W / im.width, H / im.height) * zoom
    nw, nh = round(im.width * s), round(im.height * s)
    im = im.resize((nw, nh), Image.LANCZOS)
    x = int(np.clip(focus[0] * nw - W / 2, 0, nw - W))
    y = int(np.clip(focus[1] * nh - H / 2, 0, nh - H))
    return im.crop((x, y, x + W, y + H))


def grain(arr: np.ndarray, amount=7.0, seed=7) -> np.ndarray:
    """Grano fino de luminancia (arr float 0..255, HxW o HxWx3)."""
    rng = np.random.default_rng(seed)
    n = rng.normal(0, amount, arr.shape[:2])
    n = np.asarray(Image.fromarray(np.uint8(np.clip(n + 128, 0, 255))).filter(
        ImageFilter.GaussianBlur(0.5))).astype(float) - 128
    n *= amount / max(n.std(), 1e-6)
    return arr + (n[..., None] if arr.ndim == 3 else n)


def vignette(size, strength=0.5, cx=0.5, cy=0.5):
    """Máscara multiplicativa (1 en el centro, 1-strength en las esquinas)."""
    W, H = size
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx / W - cx) / 0.75) ** 2 + ((yy / H - cy) / 0.75) ** 2)
    return 1 - strength * np.clip(d, 0, 1) ** 2


def photo_bg(path, size=(1080, 1080), focus=(0.5, 0.5), zoom=1.0, overlay=None,
             base_dim=0.80, gamma=1.15, contrast_cut=1.0, grain_amt=7.0, blur=0.0, pad=None, vig=0.0, vig_center=(0.5, 0.5)) -> Image.Image:
    """
    Foto -> B&N, recorte cover, curva de contraste, oscurecida y con degradé + grano.
    overlay: lista de degradés ("top"|"bottom"|"left"|"right", inicio 0..1, fin 0..1, alfa_max).
      El degradé va de alfa_max (en el borde indicado) a 0 en 'fin'; entre borde e 'inicio' es plano.
    base_dim: multiplicador global (0.80 = 20% más oscura).
    pad: (izq, arriba, der, abajo) en fracción del ancho/alto de la foto, relleno negro antes del recorte
      (sirve para correr el sujeto hacia un costado y dejar aire para el texto).
    """
    im = Image.open(path)
    if im.mode in ("RGBA", "LA"):
        bgc = Image.new("RGBA", im.size, (0, 0, 0, 255)); bgc.alpha_composite(im.convert("RGBA")); im = bgc
    g = ImageOps.grayscale(im.convert("RGB"))
    g = ImageOps.autocontrast(g, cutoff=contrast_cut)
    if pad:
        l, t, r, b = (round(v * (g.width if i % 2 == 0 else g.height)) for i, v in enumerate(pad))
        ga = np.asarray(g)
        edge = int(np.median(np.concatenate([ga[0], ga[-1], ga[:, 0], ga[:, -1]])))
        canvas = Image.new("L", (g.width + l + r, g.height + t + b), edge)
        # costura suave: la foto se funde con el relleno en sus bordes
        m = Image.new("L", g.size, 255)
        feather = max(8, min(g.size) // 12)
        md = ImageDraw.Draw(m)
        for i in range(feather):
            md.rectangle((i, i, g.width - 1 - i, g.height - 1 - i), outline=int(255 * (i + 1) / feather))
        canvas.paste(g, (l, t), m); g = canvas
    g = _cover(g, size, focus, zoom)
    if blur:
        g = g.filter(ImageFilter.GaussianBlur(blur))
    a = np.asarray(g).astype(float) / 255
    a = a ** gamma * base_dim
    H, W = a.shape
    keep = np.ones_like(a)
    for side, start, end, amax in overlay or []:
        if side in ("top", "bottom"):
            t = np.linspace(0, 1, H)[:, None] * np.ones((1, W))
        else:
            t = np.ones((H, 1)) * np.linspace(0, 1, W)[None, :]
        if side in ("bottom", "right"):
            t = 1 - t
        # t = distancia desde el borde (0) hacia adentro (1)
        ramp = np.clip((end - t) / max(end - start, 1e-6), 0, 1)
        ramp = ramp * ramp * (3 - 2 * ramp)  # smoothstep
        keep *= 1 - amax * ramp
    if vig:
        keep *= vignette((W, H), vig, *vig_center)
    a = a * keep * 255
    a = grain(a, grain_amt)
    rgb = np.repeat(np.clip(a, 0, 255)[..., None], 3, axis=2)
    return Image.fromarray(np.uint8(rgb))


def region_luma(im: Image.Image, box) -> tuple[float, float]:
    """Luma media y p95 de una región (para verificar legibilidad del texto blanco)."""
    a = np.asarray(im.convert("L").crop(box)).astype(float)
    return float(a.mean()), float(np.percentile(a, 95))


# ── Placa ───────────────────────────────────────────────────────────────────
class Placa:
    def __init__(self, fmt="feed", bg: Image.Image | None = None, margin=None):
        self.fmt = fmt
        self.W, self.H = FORMATS[fmt]
        self.M = margin or (88 if fmt == "story" else 80)
        self.im = bg.convert("RGB").copy() if bg is not None else Image.new("RGB", (self.W, self.H), PALETTE["black"])
        self.d = ImageDraw.Draw(self.im)
        self.texts: list[str] = []
        self.gold_used = 0

    # utilidades de texto
    def _c(self, c):
        if isinstance(c, str) and c in PALETTE:
            if c in ACCENT_NAMES or c == "sunset_solid":
                self.gold_used += 1
            return PALETTE[c]
        return c

    def _grad_mask(self):
        m = Image.new("L", self.im.size, 0)
        return m, ImageDraw.Draw(m)

    def _paint(self, mask, box=None):
        """Pinta el acento sunset a través de mask y cuenta un acento."""
        self.gold_used += 1
        return paint_gradient_mask(self.im, mask, box)

    def measure(self, s, f, tracking=0.0) -> float:
        if not s:
            return 0
        tr = tracking * f.size
        return sum(f.getlength(ch) for ch in s) + tr * (len(s) - 1) if tracking else f.getlength(s)

    def text(self, x, y, s, f, fill="white", tracking=0.0, anchor="ls", upper=False):
        """Dibuja texto. anchor: 'ls' (izq, línea base), 'rs', 'ms', 'lt', etc. tracking en em."""
        s = s.upper() if upper else s
        check_text(s); self.texts.append(s)
        if is_accent(fill):
            # Texto con gradiente: se dibuja en una máscara y se pinta con el acento.
            real_d = self.d
            m, self.d = self._grad_mask()
            try:
                bb = self.text(x, y, s, f, 255, tracking, anchor)
            finally:
                self.d = real_d
            self.texts.pop()
            self._paint(m)
            return bb
        fill = self._c(fill) if isinstance(fill, str) else fill
        if not tracking:
            self.d.text((x, y), s, font=f, fill=fill, anchor=anchor)
            return self.d.textbbox((x, y), s, font=f, anchor=anchor)
        w = self.measure(s, f, tracking)
        h = anchor[0]
        x0 = x if h == "l" else (x - w if h == "r" else x - w / 2)
        va = anchor[1]
        cx = x0
        for ch in s:
            self.d.text((cx, y), ch, font=f, fill=fill, anchor="l" + va)
            cx += f.getlength(ch) + tracking * f.size
        return (x0, y - f.size, x0 + w, y)

    def wrap(self, s, f, maxw, tracking=0.0) -> list[str]:
        out = []
        for para in s.split("\n"):
            line = ""
            for word in para.split(" "):
                cand = (line + " " + word).strip()
                if self.measure(cand, f, tracking) <= maxw or not line:
                    line = cand
                else:
                    out.append(line); line = word
            out.append(line)
        return out

    def title(self, x, y_top, s, size=None, fill="white", leading=1.0, maxw=None,
              weight="mono-bold", tracking=TRACK_TITLE, highlight: dict | None = None, anchor="l",
              fills: list | None = None):
        """Título apretado. y_top = borde superior de la versal. Devuelve y de la base de la última línea.
        highlight: {"palabra": "sunset"} pinta esa palabra con el gradiente (alias "gold")."""
        size = size or TYPE["title"]
        f = font(weight, size)
        maxw = maxw or (self.W - x - self.M)
        lines = self.wrap(s, f, maxw, tracking)
        cap = f.getbbox("H")[3] - f.getbbox("H")[1]
        base = y_top + cap
        for i, ln in enumerate(lines):
            col = fills[i] if fills and i < len(fills) else fill
            if highlight:
                self._line_with_highlight(x, base, ln, f, col, tracking, highlight, anchor)
            else:
                self.text(x, base, ln, f, col, tracking, anchor=anchor + "s")
            base += size * leading
        return base - size * leading

    def _line_with_highlight(self, x, y, ln, f, fill, tracking, hl, anchor="l"):
        total = self.measure(ln, f, tracking)
        cx = x if anchor == "l" else x - total / 2
        for i, word in enumerate(ln.split(" ")):
            w = (" " if i else "") + word
            col = fill
            for k, v in hl.items():
                if word.strip(".,:;!?¿¡") == k:
                    col = v
            self.text(cx, y, w, f, col, tracking)
            cx += self.measure(w, f, tracking) + (tracking * f.size if tracking else 0)

    def paragraph(self, x, y_top, s, size=None, fill="body", weight="sans-medium", maxw=None, leading=1.38):
        size = size or TYPE["body"]
        f = font(weight, size)
        maxw = maxw or (self.W - x - self.M)
        lines = self.wrap(s, f, maxw)
        asc = f.getbbox("Hd")[3] - f.getbbox("Hd")[1]
        base = y_top + asc
        for ln in lines:
            self.text(x, base, ln, f, fill)
            base += size * leading
        return base - size * leading

    def label(self, x, y, s, fill="label", size=None, anchor="ls", weight="mono-medium", tracking=TRACK_LABEL):
        return self.text(x, y, s, font(weight, size or TYPE["label"]), fill, tracking, anchor=anchor, upper=True)

    # piezas del PDF
    def header(self, kicker=None, counter=None, y=None, kicker_fill="label", counter_fill="faint"):
        y = y or (118 if self.fmt == "story" else 84)
        if kicker:
            self.label(self.M, y, kicker, fill=kicker_fill)
        if counter:
            self.label(self.W - self.M, y, counter, fill=counter_fill, anchor="rs", tracking=0.18)

    def rule(self, x0, y, x1, fill="border", width=2):
        self.line([(x0, y), (x1, y)], fill=fill, width=width)

    def line(self, pts, fill="white", width=2):
        """Línea; con fill de acento y ancho >= SUNSET_MIN_STROKE va en gradiente, si no en sólido."""
        if is_accent(fill) and width >= SUNSET_MIN_STROKE:
            m, md = self._grad_mask()
            md.line(pts, fill=255, width=width)
            return self._paint(m)
        if is_accent(fill):
            fill = "sunset_solid"
        self.d.line(pts, fill=self._c(fill), width=width)

    def bar(self, box, fill="white", radius=0):
        """Barra o rectángulo relleno (gráficos). Con fill de acento va en gradiente."""
        if is_accent(fill):
            m, md = self._grad_mask()
            if radius:
                md.rounded_rectangle(box, radius, fill=255)
            else:
                md.rectangle(box, fill=255)
            return self._paint(m, (box[0], box[1], box[2] + 1, box[3] + 1))
        col = self._c(fill)
        if radius:
            self.d.rounded_rectangle(box, radius, fill=col)
        else:
            self.d.rectangle(box, fill=col)

    def title_rule(self, title_bbox, y, fill="sunset", width=TITLE_RULE_WIDTH, ratio=TITLE_RULE_RATIO):
        """Línea bajo el título: 75% del ancho real del título, alineada a su izquierda.
        title_bbox: caja de tinta del título (text_ink_bbox o la unión de sus líneas)."""
        return self.bar(title_rule_box(title_bbox, y, width, ratio), fill)

    def underline(self, x0, x1, y, fill="sunset", width=4):
        """Subrayado: borde superior en y, de x0 a x1 (inclusive)."""
        return self.bar((x0, y, x1, y + width - 1), fill)

    def ellipse(self, box, fill=None, outline=None, width=2):
        """Círculo o elipse; fill u outline de acento van en gradiente."""
        if is_accent(fill):
            m, md = self._grad_mask(); md.ellipse(box, fill=255); self._paint(m)
            fill = None
        if is_accent(outline) and width >= SUNSET_MIN_STROKE:
            m, md = self._grad_mask(); md.ellipse(box, outline=255, width=width); self._paint(m)
            outline = None
        elif is_accent(outline):
            outline = "sunset_solid"
        if fill or outline:
            self.d.ellipse(box, fill=self._c(fill) if fill else None,
                           outline=self._c(outline) if outline else None, width=width)

    def card(self, box, inverted=False, radius=10, border="border", width=2, fill=None):
        if inverted:
            self.d.rounded_rectangle(box, radius, fill=PALETTE["white"])
        elif is_accent(border) and width >= SUNSET_MIN_STROKE:
            if fill:
                self.d.rounded_rectangle(box, radius, fill=self._c(fill))
            m, md = self._grad_mask()
            md.rounded_rectangle(box, radius, outline=255, width=width)
            self._paint(m, (box[0], box[1], box[2] + 1, box[3] + 1))
        else:
            border = "sunset_solid" if is_accent(border) else border
            self.d.rounded_rectangle(box, radius, fill=self._c(fill) if fill else None,
                                     outline=self._c(border), width=width)

    def pill(self, x, y, s, inverted=True, size=18, anchor="l", pad=(14, 9), radius=4, outline=None):
        """Etiqueta blanca tipo 'EN FOCO HOY' (texto mono espaciado). y = centro vertical."""
        f = font("mono-bold", size)
        s = s.upper()
        w = self.measure(s, f, 0.2)
        cap = f.getbbox("H")[3] - f.getbbox("H")[1]
        bw, bh = w + pad[0] * 2, cap + pad[1] * 2
        x0 = x if anchor == "l" else (x - bw if anchor == "r" else x - bw / 2)
        box = (x0, y - bh / 2, x0 + bw, y + bh / 2)
        if inverted:
            self.d.rounded_rectangle(box, radius, fill=PALETTE["white"])
            col = PALETTE["black"]
        else:
            if is_accent(outline):
                self.d.rounded_rectangle(box, radius, fill=PALETTE["black"])
                m, md = self._grad_mask()
                md.rounded_rectangle(box, radius, outline=255, width=2)
                self._paint(m, (box[0], box[1], box[2] + 1, box[3] + 1))
            else:
                self.d.rounded_rectangle(box, radius, fill=PALETTE["black"], outline=self._c(outline or "white"), width=2)
            col = PALETTE["white"]
        self.text(x0 + pad[0], y + cap / 2, s, f, col, 0.2)
        return box

    def avatar(self, size=48):
        av = Image.open(AVATAR).convert("RGB")
        av = ImageOps.autocontrast(ImageOps.grayscale(av), cutoff=1)
        av = av.point(lambda v: min(255, int(v * 1.25 + 10))).convert("RGB")
        av = av.resize((size * 4, size * 4), Image.LANCZOS)
        mask = Image.new("L", (size * 4, size * 4), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
        av.putalpha(mask)
        return av.resize((size, size), Image.LANCZOS)

    def footer(self, right=None, y=None, handle_fill="body", rule=False):
        """Pie: avatar gris + @LaZuricata a la izquierda; rótulo opcional a la derecha."""
        size = 48
        y = y or (self.H - (100 if self.fmt == "story" else 66))
        if rule:
            self.rule(self.M, y - size / 2 - 26, self.W - self.M)
        av = self.avatar(size)
        ring = Image.new("RGBA", (size + 4, size + 4), (0, 0, 0, 0))
        ImageDraw.Draw(ring).ellipse((0, 0, size + 3, size + 3), outline=PALETTE["border"], width=2)
        self.im.paste(av, (self.M, int(y - size / 2)), av)
        self.im.paste(ring, (self.M - 2, int(y - size / 2) - 2), ring)
        f = font("mono-bold", 24)
        cap = f.getbbox("H")[3] - f.getbbox("H")[1]
        self.text(self.M + size + 16, y + cap / 2, HANDLE, f, handle_fill)
        if right:
            self.label(self.W - self.M, y + 7, right, fill="label", anchor="rs", size=17, tracking=0.24)

    def save(self, path):
        if self.gold_used > 1:
            print(f"  aviso: {path} usa el acento sunset {self.gold_used} veces (regla: un acento por placa)")
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        self.im.save(path, optimize=True)
        return self.im.size
