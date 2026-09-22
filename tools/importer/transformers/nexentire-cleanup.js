/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: nexentire site-wide cleanup.
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content (the .media-container hero + article).
 * All selectors verified against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / modals / promo interstitials that block or distract from parsing.
    // cleaned.html: .top-banner (line 68) promo slider modal + its .close (line 129),
    // .global-search overlay (line 618), .sizeFinder modal (line 703).
    WebImporter.DOMUtils.remove(element, [
      '.top-banner',
      '.global-search',
      '.sizeFinder',
    ]);

    // cleaned.html: leading social-link <span> wrapper (lines 2-10) with a stray
    // <link> + facebook/instagram/youtube anchors, non-authorable site head fragment.
    element.querySelectorAll('body > span, main > span').forEach((span) => {
      if (span.querySelector('a[href*="facebook.com"], a[href*="instagram.com"], a[href*="youtube.com"]')) {
        span.remove();
      }
    });

    // Non-authorable widgets inside the authorable region:
    // .sns-button — per-article social share + print icons (analysis flagged as exclude).
    // .right-floot-banner-wrap — right-hand floating quick-links banner (내 차에 맞는 타이어,
    //   1:1 상담, 가까운 판매점 …) that otherwise bleeds into the prev-next section.
    WebImporter.DOMUtils.remove(element, [
      '.sns-button',
      '.right-floot-banner-wrap',
    ]);

    // The article body lives inside a layout-only <table class="table-view">
    // (row 0 = title/category/date header cells, row 1 = the prose + images).
    // Helix Importer would otherwise treat any <table> as a block and use its first
    // cell text as the block name (producing a spurious "ai-ai" block). Per the page
    // analysis this is default content, so unwrap the table into flat block-level
    // content before parsing runs.
    element.querySelectorAll('table.table-view').forEach((table) => {
      const frag = element.ownerDocument.createDocumentFragment();
      table.querySelectorAll('th, td').forEach((cell) => {
        // Keep each cell's block-level children; wrap loose text/inline runs in <p>.
        if (cell.querySelector('p, div, ul, ol, picture, img, h1, h2, h3, h4, h5, h6')) {
          while (cell.firstChild) frag.appendChild(cell.firstChild);
        } else {
          const text = cell.textContent.replace(/\s+/g, ' ').trim();
          if (text) {
            const p = element.ownerDocument.createElement('p');
            p.textContent = text;
            frag.appendChild(p);
          }
        }
      });
      table.replaceWith(frag);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome (verified in cleaned.html):
    // .navbar-wrap header/nav (line 140), .navbar-sub-shadow (line 390),
    // .footer-v2 footer (line 508), tracking iframe (line 137),
    // form#LinkTarget hidden helper (line 964), plus stray link/noscript.
    WebImporter.DOMUtils.remove(element, [
      '.navbar-wrap',
      '.navbar-sub-shadow',
      '.footer-v2',
      'iframe',
      'form#LinkTarget',
      'link',
      'noscript',
    ]);
  }
}
