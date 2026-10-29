---
slug: "contrasenas-aleatorias-unicas"
title: "Filtraron datos de clientes de Personal: por qué tus contraseñas tienen que ser aleatorias y únicas"
summary: "Una base con datos de clientes de Personal apareció en la dark web. Por qué tus contraseñas tienen que ser aleatorias y únicas, y cómo resolverlo con un gestor autoalojado."
cover: "https://npub12ehepccx7dudmcdlegw9k6acjdyj4xyz5wrxsy3snac4fjlsrldq2tq6hm.blossom.band/b953a5c581e4183bf82a81059e9b700d536791c848738719f64dd3b21dbae321.png"
tags:
  - "seguridad"
  - "privacidad"
  - "contrasenas"
  - "vaultwarden"
  - "selfhosted"
  - "argentina"
xUrl: "https://x.com/LaZuricata/status/2113716170742202828"
publishedAt: "2026-10-23T19:36:20.000Z"
---
En **octubre 2026** apareció en un foro de la dark web una base con unos **129 mil registros** que un actor atribuye a clientes de **Personal**, la marca móvil de Telecom Argentina. Según la publicación, trae celular, DNI, nombre completo, plan contratado, IPs y hasta nombres de redes WiFi. Telecom todavía no confirmó nada, así que lo tomo como un reclamo sin verificar. Igual alcanza para hacerse una pregunta incómoda: si alguien ya tiene tu DNI y tu número, qué tan lejos está de tus cuentas?

![](https://npub12ehepccx7dudmcdlegw9k6acjdyj4xyz5wrxsy3snac4fjlsrldq2tq6hm.blossom.band/660a1511b37a98d8009ff124a6696f086008d6ffabafe3627a9069dcbc7bdfa4.png)

## Tus datos ya andan sueltos

Hasta donde se sabe, esa base **no trae contraseñas**. Trae algo que sirve para conseguirlas: datos para hacerse pasar por vos o por la empresa. Con DNI y celular se arma un SMS o una llamada creíble, se intenta un **SIM swapping** para recibir tus códigos o se pide una recuperación de cuenta.

El Data Breach Investigations Report 2026 de Verizon marca que la ingeniería social por celular (mensajes y llamadas falsas) tiene un **40% más de éxito** que el phishing por email. Y las contraseñas llegan de otras filtraciones: el mismo informe encontró **credenciales robadas en el 36% de las brechas**.

## Una filtración, todas tus cuentas

Acá entra el **credential stuffing**: agarran usuarios y contraseñas de una filtración y los prueban de forma automática en bancos, billeteras, redes y correos. Funciona porque repetimos claves. Verizon analizó datos de infostealers y vio que, en el caso típico, **solo el 49% de las contraseñas de una persona eran distintas entre sí**. En los registros de inicio de sesión que estudió, el credential stuffing fue en promedio **el 19% de todos los intentos diarios**.

Si usás la misma clave en todos lados, alcanza con que se filtre la tienda más chica donde te registraste.

![](https://npub12ehepccx7dudmcdlegw9k6acjdyj4xyz5wrxsy3snac4fjlsrldq2tq6hm.blossom.band/f59ab73fd348d008a054bf89962e27aa35264075142fb311a3226075aaf6bbe2.png)

## Por qué tu cerebro es un mal generador de claves

Una contraseña es fuerte cuando es **impredecible**. Eso se mide en **bits de entropía**: cada bit duplica la cantidad de intentos que necesita un atacante. Solo el azar genera entropía. Lo que a vos te parece raro suele ser un patrón conocido.

Los humanos somos predecibles. Usamos palabras, nombres, fechas y el clásico símbolo al final. El NIST lo explica con un ejemplo: si te obligan a meter mayúscula, número y símbolo, quien iba a usar "password" termina en **"Password1!"**. Los atacantes prueban esos patrones primero.

Hive Systems lo midió en **julio 2026**: una clave **aleatoria** de 12 caracteres con mayúsculas, minúsculas, números y símbolos llevaría unos **3 mil millones de años** de fuerza bruta con un clúster de 16 GPUs. Una de 12 caracteres armada por una persona, tipo *Mendoza2024!*, cumple con todo y aun así puede caer muy rápido, porque los ataques con diccionario y reglas prueban esos patrones primero. En su prueba, una clave predecible cayó en **unos tres segundos** con una sola GPU.

Dos ideas que cambian todo:

- **La longitud pesa más que la complejidad.** En la misma tabla, 18 minúsculas al azar aguantan más que 12 caracteres con de todo. Por eso el NIST pide a los servicios **15 caracteres como mínimo** cuando la clave es el único factor, y les prohíbe exigir mezclas de tipos de caracteres.
- **Las passphrases funcionan.** Seis palabras elegidas al azar de la lista de la EFF dan unos **77 bits de entropía**, y se pueden recordar. Es lo ideal para tu contraseña maestra.

![](https://npub12ehepccx7dudmcdlegw9k6acjdyj4xyz5wrxsy3snac4fjlsrldq2tq6hm.blossom.band/4f53600ffdadfa5861d3c7d3de395f8a62aaaddb0cdb7ad98c00272ecb97fa12.png)

## 2FA: el cinturón de seguridad

Aunque tu clave se filtre, un segundo factor frena la mayoría de los intentos. El orden de preferencia:

1. **Llave física o passkey (FIDO2/WebAuthn).** Resiste phishing porque queda atada al dominio real.
2. **App de códigos (TOTP).** Buena, aunque te pueden pedir el código con engaños.
3. **SMS.** Mejor que nada, pero es justo lo que ataca un SIM swap. El NIST lo trata como un método restringido.

## Cómo hacerlo de verdad: Vaultwarden

Nadie recuerda cien claves aleatorias. Para eso está el gestor: **genera, guarda y completa** por vos, y vos recordás una sola passphrase.

La herramienta que recomiendo es **Vaultwarden**, un servidor compatible con Bitwarden, escrito en Rust y open source (**AGPL-3.0**), con casi **70 mil estrellas en GitHub**.

- **Generás** con las apps oficiales de Bitwarden, que usan el generador criptográfico del sistema y passphrases con la lista de la EFF.
- **Guardás** todo cifrado en tu dispositivo antes de que viaje.
- **Se sincroniza** entre extensión, escritorio, Android e iOS.
- **Todo vive en tu servidor**: claves, códigos 2FA, notas y passkeys.

Montarlo es sencillo. Es un contenedor liviano que corre hasta en una Raspberry Pi, y si usás **Coolify** está como servicio de un clic. Lo único que pide es HTTPS y que vos te hagas cargo de los backups, porque es un proyecto independiente de Bitwarden.

![](https://npub12ehepccx7dudmcdlegw9k6acjdyj4xyz5wrxsy3snac4fjlsrldq2tq6hm.blossom.band/a2e98e66b19cebc972dd6311ebe2270a02ff4caa1a767dde79aeed24ae9c0cee.png)

## Cierre

Las filtraciones van a seguir pasando y no dependen de vos. Lo que sí depende de vos es que una base filtrada no te abra todas las puertas: **una clave aleatoria por sitio, una passphrase larga como maestra y 2FA** en lo importante.

Y si sos cliente de Personal, desconfiá de cualquier llamado o mensaje que use tus datos para pedirte un código.

Cuántas de tus contraseñas aguantarían una filtración?

## Fuentes

- Reclamo de la filtración (Brinztech)
- Verizon DBIR 2026
- Verizon, credential stuffing (DBIR 2025)
- Hive Systems Password Table 2026
- NIST SP 800-63B
- EFF, passphrases
- Vaultwarden

