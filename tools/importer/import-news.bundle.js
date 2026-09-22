/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-news.js
  var import_news_exports = {};
  __export(import_news_exports, {
    default: () => import_news_default
  });

  // tools/importer/parsers/hero-keyvisual.js
  function parse(element, { document: document2 }) {
    const bgImage = element.querySelector(".visual img, .keyvisual-visual img, img");
    const heading = element.querySelector(".title h1, .title h2, h1, h2, .keyvisual-title");
    const subheadings = Array.from(
      element.querySelectorAll(".title p, .desc, .keyvisual-desc")
    );
    const ctaLinks = Array.from(
      element.querySelectorAll(".title a, .btn a, a.button, a.cta")
    );
    if (!bgImage && !heading && subheadings.length === 0 && ctaLinks.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    subheadings.forEach((el) => contentCell.push(el));
    ctaLinks.forEach((el) => contentCell.push(el));
    if (contentCell.length > 0) {
      cells.push([contentCell]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-keyvisual", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/nexentire-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".top-banner",
        ".global-search",
        ".sizeFinder"
      ]);
      element.querySelectorAll("body > span, main > span").forEach((span) => {
        if (span.querySelector('a[href*="facebook.com"], a[href*="instagram.com"], a[href*="youtube.com"]')) {
          span.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, [
        ".sns-button",
        ".right-floot-banner-wrap"
      ]);
      element.querySelectorAll("table.table-view").forEach((table) => {
        const frag = element.ownerDocument.createDocumentFragment();
        table.querySelectorAll("th, td").forEach((cell) => {
          if (cell.querySelector("p, div, ul, ol, picture, img, h1, h2, h3, h4, h5, h6")) {
            while (cell.firstChild) frag.appendChild(cell.firstChild);
          } else {
            const text = cell.textContent.replace(/\s+/g, " ").trim();
            if (text) {
              const p = element.ownerDocument.createElement("p");
              p.textContent = text;
              frag.appendChild(p);
            }
          }
        });
        table.replaceWith(frag);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".navbar-wrap",
        ".navbar-sub-shadow",
        ".footer-v2",
        "iframe",
        "form#LinkTarget",
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/nexentire-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-news.js
  var PAGE_TEMPLATE = {
    name: "news",
    description: "News article detail page",
    urls: [
      "https://www.nexentire.com/kr/media/news/1282283_1224.php"
    ],
    blocks: [
      {
        name: "hero-keyvisual",
        instances: [".media-container > .keyvisual", ".keyvisual"]
      }
    ],
    sections: [
      {
        id: "keyvisual-hero",
        name: "keyvisual-hero",
        selector: [".media-container > .keyvisual", ".keyvisual"],
        style: "dark",
        blocks: ["hero-keyvisual"],
        defaultContent: []
      },
      {
        id: "news-section-heading",
        name: "news-section-heading",
        selector: [".media-cont > .media-title", ".media-title"],
        style: null,
        blocks: [],
        defaultContent: [".media-title"]
      },
      {
        id: "news-key-visual-image",
        name: "news-key-visual-image",
        selector: [".media-cont > .img_media", ".img_media"],
        style: null,
        blocks: [],
        defaultContent: [".img_media"]
      },
      {
        id: "article-body",
        name: "article-body",
        selector: [".media-cont > .media-board-list", ".media-board-list"],
        style: null,
        blocks: [],
        defaultContent: [".media-board-list"]
      },
      {
        id: "prev-next-nav",
        name: "prev-next-nav",
        selector: [".media-cont > .prev-next", ".prev-next"],
        style: null,
        blocks: [],
        defaultContent: [".prev-next"]
      }
    ]
  };
  var parsers = {
    "hero-keyvisual": parse
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (pageBlocks.some((b) => b.element === element)) return;
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_news_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "").replace(/\.php$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_news_exports);
})();
