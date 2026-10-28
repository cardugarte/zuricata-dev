const FIRST_IMAGE = /!\[[^\]]*\]\(\s*<?([^\s)>]+)>?/;

/** True when the first Markdown image in the body is the cover, so the page must not render it again. */
export function bodyLeadsWithCover(body: string | undefined, cover: string): boolean {
  if (!body) return false;
  const match = FIRST_IMAGE.exec(body);
  return match?.[1] === cover;
}
