const http = require('node:http');
const { URL } = require('node:url');

const {
  frameworks,
  listComponentPacks,
  buildComponentPack,
  buildFrameworkStarterKit,
  buildCrossFrameworkComponentKit,
  buildLaunchKitCatalog
} = require('./catalog');

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload, null, 2));
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, { 'content-type': 'text/html; charset=utf-8' });
  res.end(html);
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function titleCase(value) {
  return value[0].toUpperCase() + value.slice(1);
}

function resolveActivePack(searchParams) {
  const requestedFramework = searchParams.get('framework');
  const requestedComponent = searchParams.get('component');

  try {
    if (requestedFramework && requestedComponent) {
      return buildComponentPack(requestedFramework, requestedComponent);
    }
  } catch (error) {
    // fall back to the default preview below
  }

  return buildComponentPack('react', 'button');
}

function renderTokenPills(tokens) {
  return Object.entries(tokens).map(([token, value]) => `<span class="token-pill"><strong>${escapeHtml(token)}</strong><span>${escapeHtml(String(value))}</span></span>`).join('');
}

function renderLivePreview(pack) {
  const { preview } = pack;

  if (preview.kind === 'button') {
    return `<div class="live-preview" data-preview-kind="button">
      <button class="preview-button" type="button">${escapeHtml(preview.label)}</button>
      <p class="preview-supporting-text">${escapeHtml(preview.supportingText)}</p>
    </div>`;
  }

  if (preview.kind === 'feature-card') {
    return `<article class="live-preview preview-card" data-preview-kind="feature-card">
      <p class="preview-eyebrow">${escapeHtml(preview.eyebrow)}</p>
      <h3>${escapeHtml(preview.title)}</h3>
      <p class="preview-copy">${escapeHtml(preview.body)}</p>
    </article>`;
  }

  return `<article class="live-preview preview-card preview-stat-card" data-preview-kind="stat-card">
    <p class="preview-eyebrow">${escapeHtml(preview.label)}</p>
    <h3 class="preview-stat-value">${escapeHtml(preview.value)} automation success</h3>
    <p class="preview-delta">${escapeHtml(preview.delta)} vs last launch</p>
    <p class="preview-copy">${escapeHtml(preview.detail)}</p>
  </article>`;
}

function renderFileManifest(pack) {
  return pack.files.map((file) => `<article class="file-card">
    <div class="file-card-header">
      <span class="file-kind">${escapeHtml(file.kind)}</span>
      <strong>${escapeHtml(file.path)}</strong>
    </div>
    <p class="file-description">${escapeHtml(file.description)}</p>
    <pre><code>${escapeHtml(file.content)}</code></pre>
  </article>`).join('');
}

function renderInstallSteps(steps) {
  return `<ol class="install-steps">${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>`;
}

function renderFrameworkBundleCards(starterKit) {
  return starterKit.bundles.map((bundle) => `<article class="file-card framework-bundle-card">
    <div class="file-card-header">
      <span class="file-kind">bundle</span>
      <strong>${escapeHtml(bundle.title)}</strong>
    </div>
    <p class="file-description">${escapeHtml(bundle.bundleId)} → <code>${escapeHtml(bundle.targetDirectory)}</code></p>
    <ul class="bundle-file-list">${bundle.files.map((file) => `<li>${escapeHtml(file.path)}</li>`).join('')}</ul>
  </article>`).join('');
}

function renderComponentFrameworkCards(componentKit) {
  return componentKit.frameworks.map((frameworkEntry) => `<article class="file-card framework-bundle-card">
    <div class="file-card-header">
      <span class="file-kind">${escapeHtml(frameworkEntry.framework)}</span>
      <strong>${escapeHtml(frameworkEntry.bundle.title)}</strong>
    </div>
    <p class="file-description">Export: <code>${escapeHtml(frameworkEntry.starterPath)}</code></p>
    <p class="file-description">${escapeHtml(frameworkEntry.bundle.bundleId)} → <code>${escapeHtml(frameworkEntry.bundle.targetDirectory)}</code></p>
    <ul class="bundle-file-list">${frameworkEntry.bundle.files.map((file) => `<li>${escapeHtml(file.path)}</li>`).join('')}</ul>
  </article>`).join('');
}

function renderLaunchCatalogFrameworkCards(launchCatalog) {
  return launchCatalog.frameworks.map((frameworkEntry) => `<article class="file-card launch-framework-card">
    <div class="file-card-header">
      <span class="file-kind">framework</span>
      <strong>${escapeHtml(titleCase(frameworkEntry.framework))}</strong>
    </div>
    <p class="file-description">${escapeHtml(frameworkEntry.componentCount.toString())} starters → <code>${escapeHtml(frameworkEntry.targetDirectory)}</code></p>
    <p class="file-description">Export: <code>${escapeHtml(frameworkEntry.starterKitPath)}</code></p>
    <ul class="bundle-file-list">${frameworkEntry.componentSlugs.map((componentSlug) => `<li>${escapeHtml(componentSlug)}</li>`).join('')}</ul>
  </article>`).join('');
}

function renderLaunchCatalogComponentRows(launchCatalog) {
  return launchCatalog.componentIndex.map((componentEntry) => `<tr>
    <th scope="row">${escapeHtml(componentEntry.title)}</th>
    <td>${escapeHtml(componentEntry.component)}</td>
    <td>${componentEntry.frameworks.map((frameworkEntry) => `<div class="launch-framework-link"><strong>${escapeHtml(titleCase(frameworkEntry.framework))}</strong> · <code>${escapeHtml(frameworkEntry.starterBundleId)}</code></div>`).join('')}</td>
  </tr>`).join('');
}

function renderCatalogPage(searchParams = new URLSearchParams()) {
  const catalog = listComponentPacks();
  const activePack = resolveActivePack(searchParams);
  const activeStarterKit = buildFrameworkStarterKit(activePack.framework);
  const activeComponentKit = buildCrossFrameworkComponentKit(activePack.component);
  const launchCatalog = buildLaunchKitCatalog();
  const cards = catalog.entries.map((entry) => {
    const isActive = entry.framework === activePack.framework && entry.component === activePack.component;
    const activeClass = isActive ? ' card-active' : '';
    const href = `/?framework=${encodeURIComponent(entry.framework)}&component=${encodeURIComponent(entry.component)}`;

    return `<article class="card${activeClass}">
      <div class="meta">${entry.framework.toUpperCase()} · ${entry.component}</div>
      <h3><a class="card-link" href="${href}">${entry.title}</a></h3>
      <p>${entry.description}</p>
    </article>`;
  }).join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Impeccable UI Kit</title>
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        background: radial-gradient(circle at top, #1e1b4b, #020617 58%);
        color: #e2e8f0;
      }
      main { max-width: 1100px; margin: 0 auto; padding: 56px 24px 72px; }
      h1 { font-size: 3rem; margin-bottom: 12px; }
      h2 { margin: 0; font-size: 1.4rem; }
      .lede { max-width: 760px; line-height: 1.7; color: #cbd5e1; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; margin-top: 28px; }
      .card, pre, .preview-shell {
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(15, 23, 42, 0.7);
        border-radius: 24px;
        box-shadow: 0 24px 80px rgba(15, 23, 42, 0.35);
      }
      .card { padding: 20px; }
      .card-active {
        border-color: rgba(94, 234, 212, 0.72);
        box-shadow: 0 28px 90px rgba(13, 148, 136, 0.28);
      }
      .card-link {
        color: inherit;
        text-decoration: none;
      }
      .card-link:hover { text-decoration: underline; }
      .meta { color: #22d3ee; font-size: 0.84rem; font-weight: 700; letter-spacing: 0.04em; }
      pre { padding: 24px; overflow: auto; margin: 18px 0 0; }
      .pillrow { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
      .pill {
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(124, 58, 237, 0.18);
        border: 1px solid rgba(167, 139, 250, 0.4);
      }
      .preview-shell { margin-top: 32px; padding: 24px; }
      .preview-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 20px; align-items: start; }
      .preview-meta { color: #94a3b8; margin: 8px 0 0; line-height: 1.6; }
      .preview-label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 14px;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(45, 212, 191, 0.14);
        border: 1px solid rgba(94, 234, 212, 0.36);
        color: #ccfbf1;
        font-weight: 700;
      }
      .preview-canvas,
      .snippet-shell {
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 20px;
        background: rgba(2, 6, 23, 0.58);
        padding: 20px;
      }
      .live-preview {
        min-height: 220px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .preview-button {
        align-self: flex-start;
        border: none;
        border-radius: ${activePack.tokens.radius || '999px'};
        padding: ${activePack.tokens.paddingY || '12px'} ${activePack.tokens.paddingX || '18px'};
        background: ${activePack.tokens.gradient || 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)'};
        color: ${activePack.tokens.text};
        box-shadow: ${activePack.tokens.shadow};
        font-weight: 700;
        letter-spacing: -0.01em;
        cursor: pointer;
      }
      .preview-supporting-text, .preview-copy {
        color: #cbd5e1;
        line-height: 1.7;
        margin-bottom: 0;
      }
      .preview-card {
        border: ${activePack.tokens.border || '1px solid rgba(148, 163, 184, 0.18)'};
        border-radius: ${activePack.tokens.radius};
        background: ${activePack.tokens.background || 'rgba(15, 23, 42, 0.72)'};
        color: ${activePack.tokens.text};
        box-shadow: ${activePack.tokens.shadow};
        padding: 24px;
      }
      .preview-eyebrow, .preview-delta {
        color: ${activePack.tokens.accent || '#22d3ee'};
        font-weight: 700;
      }
      .preview-eyebrow { margin: 0 0 8px; }
      .preview-stat-value {
        color: ${activePack.tokens.stat || activePack.tokens.text};
        font-size: 2.4rem;
        margin: 10px 0 6px;
      }
      .token-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 18px;
      }
      .css-variables-shell { margin-top: 20px; }
      .css-variables-shell pre { margin-top: 12px; }
      .starter-files-shell,
      .starter-bundle-shell { margin-top: 24px; }
      .file-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 16px;
      }
      .install-steps {
        margin: 12px 0 0;
        padding-left: 20px;
        color: #cbd5e1;
        line-height: 1.6;
      }
      .file-card {
        border: 1px solid rgba(148, 163, 184, 0.16);
        border-radius: 18px;
        background: rgba(15, 23, 42, 0.72);
        padding: 16px;
      }
      .bundle-file-list {
        margin: 12px 0 0;
        padding-left: 20px;
        color: #cbd5e1;
        line-height: 1.6;
      }
      .framework-kit-shell { margin-top: 24px; }
      .launch-catalog-shell { margin-top: 24px; }
      .launch-catalog-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        margin-top: 12px;
      }
      .launch-summary-pill {
        border: 1px solid rgba(94, 234, 212, 0.2);
        border-radius: 18px;
        background: rgba(15, 23, 42, 0.68);
        padding: 14px 16px;
      }
      .launch-summary-pill strong {
        display: block;
        font-size: 1.2rem;
        margin-top: 6px;
      }
      .launch-matrix-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 18px;
      }
      .launch-matrix-table th,
      .launch-matrix-table td {
        text-align: left;
        vertical-align: top;
        border-top: 1px solid rgba(148, 163, 184, 0.16);
        padding: 12px 0;
      }
      .launch-framework-link + .launch-framework-link { margin-top: 8px; }
      .launch-catalog-export { margin-top: 18px; }
      .file-card pre {
        margin-top: 12px;
        padding: 16px;
        max-height: 260px;
      }
      .file-card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .file-kind {
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(34, 211, 238, 0.14);
        border: 1px solid rgba(34, 211, 238, 0.32);
        color: #67e8f9;
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
      }
      .file-description {
        color: #94a3b8;
        line-height: 1.5;
        margin: 10px 0 0;
      }
      .token-pill {
        display: inline-flex;
        gap: 10px;
        align-items: center;
        padding: 10px 12px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.16);
        font-size: 0.92rem;
      }
      .token-pill strong { color: #e2e8f0; }
      .token-pill span { color: #94a3b8; }
      @media (max-width: 840px) {
        .preview-layout { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Impeccable UI Kit</h1>
      <p class="lede">A local-first launch catalog for polished AI product UI primitives. This MVP ships Button, Feature Card, and Signal Stat Card starters for React, Vue, and Svelte, with impeccable-style gradients, glass surfaces, and proof-heavy metrics ready to copy into product work.</p>
      <div class="pillrow">${frameworks.map((framework) => `<span class="pill">${titleCase(framework)}</span>`).join('')}</div>
      <section class="grid">${cards}</section>
      <section class="preview-shell">
        <div class="preview-label">${titleCase(activePack.framework)} starter</div>
        <h2>${activePack.title}</h2>
        <p class="preview-meta">${activePack.description}</p>
        <div class="preview-layout">
          <div class="preview-canvas">
            <h3>Live preview</h3>
            ${renderLivePreview(activePack)}
            <div class="token-grid">${renderTokenPills(activePack.tokens)}</div>
          </div>
          <div class="snippet-shell">
            <h3>Starter snippet</h3>
            <pre><code>${escapeHtml(activePack.snippet)}</code></pre>
            <div class="css-variables-shell">
              <h3>Copy-ready CSS variables</h3>
              <pre><code>${escapeHtml(activePack.cssVariables)}</code></pre>
            </div>
            <div class="starter-files-shell">
              <h3>Starter file manifest</h3>
              <div class="file-grid">${renderFileManifest(activePack)}</div>
            </div>
            <div class="starter-bundle-shell">
              <h3>Starter bundle manifest</h3>
              <p class="preview-meta">Target directory: <code>${escapeHtml(activePack.starterBundle.targetDirectory)}</code></p>
              ${renderInstallSteps(activePack.starterBundle.installSteps)}
              <pre><code>${escapeHtml(JSON.stringify(activePack.starterBundle, null, 2))}</code></pre>
            </div>
            <div class="framework-kit-shell">
              <h3>Framework starter kit</h3>
              <p class="preview-meta">Bundle every ${titleCase(activePack.framework)} starter into one reviewable export at <code>/api/frameworks/${escapeHtml(activePack.framework)}/starter-kit.json</code>.</p>
              ${renderInstallSteps(activeStarterKit.installSteps)}
              <div class="file-grid">${renderFrameworkBundleCards(activeStarterKit)}</div>
              <pre><code>${escapeHtml(JSON.stringify(activeStarterKit, null, 2))}</code></pre>
            </div>
            <div class="framework-kit-shell">
              <h3>Cross-framework component kit</h3>
              <p class="preview-meta">Review the same ${escapeHtml(activePack.title)} starter across React, Vue, and Svelte at <code>/api/components/${escapeHtml(activePack.component)}/starter-kit.json</code>.</p>
              ${renderInstallSteps(activeComponentKit.installSteps)}
              <div class="file-grid">${renderComponentFrameworkCards(activeComponentKit)}</div>
              <pre><code>${escapeHtml(JSON.stringify(activeComponentKit, null, 2))}</code></pre>
            </div>
            <div class="launch-catalog-shell">
              <h3>Launch kit catalog</h3>
              <p class="preview-meta">Review every framework kit together at <code>/api/catalog/launch-kit.json</code> so downstream tools can fetch the full multi-framework starter matrix in one request.</p>
              <div class="launch-catalog-summary">
                <div class="launch-summary-pill">Frameworks<strong>${escapeHtml(String(launchCatalog.frameworkCount))}</strong></div>
                <div class="launch-summary-pill">Components<strong>${escapeHtml(String(launchCatalog.componentCount))}</strong></div>
                <div class="launch-summary-pill">Starter bundles<strong>${escapeHtml(String(launchCatalog.totalStarterBundles))}</strong></div>
              </div>
              <div class="file-grid launch-catalog-export">${renderLaunchCatalogFrameworkCards(launchCatalog)}</div>
              <table class="launch-matrix-table">
                <thead>
                  <tr>
                    <th scope="col">Component</th>
                    <th scope="col">Slug</th>
                    <th scope="col">Framework bundles</th>
                  </tr>
                </thead>
                <tbody>${renderLaunchCatalogComponentRows(launchCatalog)}</tbody>
              </table>
              <pre><code>${escapeHtml(JSON.stringify(launchCatalog, null, 2))}</code></pre>
            </div>
          </div>
        </div>
      </section>
    </main>
  </body>
</html>`;
}

function createApp() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');

    if (req.method === 'GET' && url.pathname === '/api/packs') {
      return sendJson(res, 200, listComponentPacks());
    }

    if (req.method === 'GET' && url.pathname === '/api/catalog/launch-kit.json') {
      return sendJson(res, 200, buildLaunchKitCatalog());
    }

    if (req.method === 'GET' && url.pathname.startsWith('/api/frameworks/')) {
      const parts = url.pathname.split('/').filter(Boolean);
      const framework = parts[2];

      if (parts[3] === 'starter-kit.json') {
        try {
          return sendJson(res, 200, buildFrameworkStarterKit(framework));
        } catch (error) {
          return sendJson(res, 404, { error: error.message });
        }
      }
    }

    if (req.method === 'GET' && url.pathname.startsWith('/api/components/')) {
      const parts = url.pathname.split('/').filter(Boolean);
      const component = parts[2];

      if (parts[3] === 'starter-kit.json') {
        try {
          return sendJson(res, 200, buildCrossFrameworkComponentKit(component));
        } catch (error) {
          return sendJson(res, 404, { error: error.message });
        }
      }
    }

    if (req.method === 'GET' && url.pathname.startsWith('/api/packs/')) {
      const parts = url.pathname.split('/').filter(Boolean);
      const framework = parts[2];
      const component = parts[3];

      if (parts[4] === 'starter.json') {
        try {
          return sendJson(res, 200, buildComponentPack(framework, component).starterBundle);
        } catch (error) {
          return sendJson(res, 404, { error: error.message });
        }
      }

      try {
        return sendJson(res, 200, buildComponentPack(framework, component));
      } catch (error) {
        return sendJson(res, 404, { error: error.message });
      }
    }

    if (req.method === 'GET' && url.pathname === '/') {
      return sendHtml(res, 200, renderCatalogPage(url.searchParams));
    }

    return sendJson(res, 404, { error: 'Not found' });
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 4492);
  createApp().listen(port, '127.0.0.1', () => {
    console.log(`Impeccable UI Kit listening on http://127.0.0.1:${port}`);
  });
}

module.exports = {
  createApp,
  renderCatalogPage
};
