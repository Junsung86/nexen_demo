import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Decorate the hero-keyvisual block.
 * Full-bleed photographic background with a single centered heading overlaid on top.
 * Author structure (rows, single column):
 *   row 1: background image
 *   row 2: heading (H1) [+ optional subheading]
 * Cells may be omitted/added by authors — decorate defensively.
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Locate the background image cell (first cell containing a picture/img).
  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  if (imageRow) {
    imageRow.classList.add('hero-keyvisual-bg');
    const img = imageRow.querySelector('img');
    if (img && !imageRow.querySelector('picture')) {
      const optimized = createOptimizedPicture(img.src, img.alt, true);
      img.closest('p')?.replaceWith(optimized);
    }
  } else {
    // No background image authored — render on neutral background.
    block.classList.add('no-image');
  }

  // Everything that is not the image row is treated as overlay content.
  const contentRows = rows.filter((row) => row !== imageRow);
  if (contentRows.length) {
    const content = document.createElement('div');
    content.className = 'hero-keyvisual-content';
    contentRows.forEach((row) => content.append(...row.childNodes));
    contentRows.forEach((row) => row.remove());
    block.append(content);
  }
}
