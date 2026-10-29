/**
 * Mark Markdown images lazy, except an image whose src is the entry cover.
 * The cover stays eager so it can be the LCP when the body already leads with it.
 */
export function rehypeLazyImages() {
  return (tree, file) => {
    const cover = file?.data?.astro?.frontmatter?.cover;
    walk(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'img') return;
      const src = node.properties?.src;
      const srcValue = Array.isArray(src) ? src[0] : src;
      const isCover = typeof cover === 'string' && srcValue === cover;
      node.properties ??= {};
      if (isCover) {
        node.properties.loading = 'eager';
        node.properties.fetchpriority = 'high';
      } else {
        node.properties.loading = 'lazy';
        if ('fetchpriority' in node.properties) delete node.properties.fetchpriority;
      }
      node.properties.decoding = 'async';
    });
  };
}

function walk(node, visit) {
  visit(node);
  if (!node || !Array.isArray(node.children)) return;
  for (const child of node.children) walk(child, visit);
}
