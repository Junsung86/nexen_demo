/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroKeyvisualParser from './parsers/hero-keyvisual.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nexentire-cleanup.js';
import sectionsTransformer from './transformers/nexentire-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'news',
  description: 'News article detail page',
  urls: [
    'https://www.nexentire.com/kr/media/news/1282283_1224.php',
  ],
  blocks: [
    {
      name: 'hero-keyvisual',
      instances: ['.media-container > .keyvisual', '.keyvisual'],
    },
  ],
  sections: [
    {
      id: 'keyvisual-hero',
      name: 'keyvisual-hero',
      selector: ['.media-container > .keyvisual', '.keyvisual'],
      style: 'dark',
      blocks: ['hero-keyvisual'],
      defaultContent: [],
    },
    {
      id: 'news-section-heading',
      name: 'news-section-heading',
      selector: ['.media-cont > .media-title', '.media-title'],
      style: null,
      blocks: [],
      defaultContent: ['.media-title'],
    },
    {
      id: 'news-key-visual-image',
      name: 'news-key-visual-image',
      selector: ['.media-cont > .img_media', '.img_media'],
      style: null,
      blocks: [],
      defaultContent: ['.img_media'],
    },
    {
      id: 'article-body',
      name: 'article-body',
      selector: ['.media-cont > .media-board-list', '.media-board-list'],
      style: null,
      blocks: [],
      defaultContent: ['.media-board-list'],
    },
    {
      id: 'prev-next-nav',
      name: 'prev-next-nav',
      selector: ['.media-cont > .prev-next', '.prev-next'],
      style: null,
      blocks: [],
      defaultContent: ['.prev-next'],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'hero-keyvisual': heroKeyvisualParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        // Avoid duplicate captures when multiple selectors match the same element
        if (pageBlocks.some((b) => b.element === element)) return;
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '')
      .replace(/\.php$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
