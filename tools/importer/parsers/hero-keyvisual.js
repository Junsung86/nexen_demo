/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-keyvisual.
 * Base block: hero
 * Source: https://www.nexentire.com/kr/media/news/1282283_1224.php (.keyvisual)
 * Generated: 2026-09-22
 *
 * Library structure (Hero): 1 column, 3 rows.
 *   Row 1: block name (handled by createBlock)
 *   Row 2: background image (optional)
 *   Row 3: title (heading) + optional subheading + optional CTA
 *
 * Source variations handled:
 *   - Background image in .visual img, with fallbacks for other image placements
 *   - Heading in .title (h1) with fallbacks to h2/h3
 *   - Optional subheading paragraph(s) and CTA links if present
 */
export default function parse(element, { document }) {
  // Background image (optional) → row 2
  const bgImage = element.querySelector('.visual img, .keyvisual-visual img, img');

  // Heading (optional) → row 3
  const heading = element.querySelector('.title h1, .title h2, h1, h2, .keyvisual-title');

  // Optional subheading text (paragraphs that are not inside the title block)
  const subheadings = Array.from(
    element.querySelectorAll('.title p, .desc, .keyvisual-desc'),
  );

  // Optional CTA links
  const ctaLinks = Array.from(
    element.querySelectorAll('.title a, .btn a, a.button, a.cta'),
  );

  // Empty-block guard: if nothing meaningful, unwrap children
  if (!bgImage && !heading && subheadings.length === 0 && ctaLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (optional)
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 3: title + optional subheading + optional CTA (single cell)
  const contentCell = [];
  if (heading) contentCell.push(heading);
  subheadings.forEach((el) => contentCell.push(el));
  ctaLinks.forEach((el) => contentCell.push(el));
  if (contentCell.length > 0) {
    cells.push([contentCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-keyvisual', cells });
  element.replaceWith(block);
}
