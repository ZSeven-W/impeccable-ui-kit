const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const { createApp } = require('../src/server');

function request(server, path) {
  return new Promise((resolve, reject) => {
    const { port } = server.address();
    const req = http.get({ hostname: '127.0.0.1', port, path }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body });
      });
    });
    req.on('error', reject);
  });
}

test('GET /api/packs returns the launch catalog payload', async (t) => {
  const server = createApp().listen(0);
  t.after(() => server.close());

  const response = await request(server, '/api/packs');
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  const payload = JSON.parse(response.body);
  assert.deepEqual(payload.frameworks, ['react', 'vue', 'svelte']);
  assert.equal(payload.entries.length, 9);
  assert.deepEqual(payload.components.map((component) => component.slug), ['button', 'feature-card', 'stat-card']);
});

test('GET /api/packs/vue/button returns a framework-specific starter pack', async (t) => {
  const server = createApp().listen(0);
  t.after(() => server.close());

  const response = await request(server, '/api/packs/vue/button');
  assert.equal(response.statusCode, 200);
  const payload = JSON.parse(response.body);
  assert.equal(payload.framework, 'vue');
  assert.equal(payload.component, 'button');
  assert.match(payload.snippet, /<template>/);
  assert.match(payload.cssVariables, /--impeccable-button-gradient: linear-gradient\(135deg, #7c3aed 0%, #06b6d4 100%\);/);
  assert.equal(payload.files.length, 3);
  assert.deepEqual(payload.files.map((file) => file.path), ['AuroraButton.vue', 'button.tokens.css', 'Demo.vue']);
  assert.match(payload.files[2].content, /import '\.\/button\.tokens\.css';/);
  assert.equal(payload.starterBundle.bundleId, 'vue-button-starter');
});

test('GET /api/packs/react/button/starter.json returns a starter bundle manifest', async (t) => {
  const server = createApp().listen(0);
  t.after(() => server.close());

  const response = await request(server, '/api/packs/react/button/starter.json');
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  const payload = JSON.parse(response.body);
  assert.equal(payload.bundleId, 'react-button-starter');
  assert.equal(payload.targetDirectory, 'src/components/impeccable/react/button');
  assert.deepEqual(payload.files.map((file) => file.path), ['ImpeccableButton.jsx', 'button.tokens.css', 'Demo.jsx']);
});

test('GET /api/catalog/launch-kit.json returns the full multi-framework starter catalog', async (t) => {
  const server = createApp().listen(0);
  t.after(() => server.close());

  const response = await request(server, '/api/catalog/launch-kit.json');
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  const payload = JSON.parse(response.body);
  assert.equal(payload.bundleId, 'impeccable-launch-kit-catalog');
  assert.equal(payload.frameworkCount, 3);
  assert.equal(payload.componentCount, 3);
  assert.equal(payload.totalStarterBundles, 9);
  assert.equal(payload.frameworks[0].starterKitPath, '/api/frameworks/react/starter-kit.json');
  assert.equal(payload.componentIndex[0].frameworks[0].starterPath, '/api/packs/react/button/starter.json');
});

test('GET /api/frameworks/react/starter-kit.json returns a framework starter kit manifest', async (t) => {
  const server = createApp().listen(0);
  t.after(() => server.close());

  const response = await request(server, '/api/frameworks/react/starter-kit.json');
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  const payload = JSON.parse(response.body);
  assert.equal(payload.bundleId, 'react-starter-kit');
  assert.equal(payload.componentCount, 3);
  assert.deepEqual(payload.componentSlugs, ['button', 'feature-card', 'stat-card']);
  assert.equal(payload.bundles.length, 3);
  assert.equal(payload.bundles[0].bundleId, 'react-button-starter');
});

test('GET /api/components/button/starter-kit.json returns a cross-framework component starter kit manifest', async (t) => {
  const server = createApp().listen(0);
  t.after(() => server.close());

  const response = await request(server, '/api/components/button/starter-kit.json');
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  const payload = JSON.parse(response.body);
  assert.equal(payload.bundleId, 'button-cross-framework-starter-kit');
  assert.equal(payload.component, 'button');
  assert.equal(payload.frameworkCount, 3);
  assert.deepEqual(payload.frameworks.map((entry) => entry.framework), ['react', 'vue', 'svelte']);
  assert.equal(payload.frameworks[0].starterPath, '/api/packs/react/button/starter.json');
  assert.equal(payload.frameworks[1].bundle.bundleId, 'vue-button-starter');
});

test('GET / renders the zero-build browser catalog', async (t) => {
  const server = createApp().listen(0);
  t.after(() => server.close());

  const response = await request(server, '/');
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
  assert.match(response.body, /Impeccable UI Kit/);
  assert.match(response.body, /Aurora Button/);
  assert.match(response.body, /Signal Stat Card/);
  assert.match(response.body, /React/);
  assert.match(response.body, /Live preview/);
  assert.match(response.body, /data-preview-kind="button"/);
  assert.match(response.body, /Gradient CTA tuned for pricing pages, AI copilots, and launch flows\./);
  assert.match(response.body, /token-pill/);
  assert.match(response.body, /Copy-ready CSS variables/);
  assert.match(response.body, /Starter file manifest/);
  assert.match(response.body, /Starter bundle manifest/);
  assert.match(response.body, /Framework starter kit/);
  assert.match(response.body, /\/api\/frameworks\/react\/starter-kit\.json/);
  assert.match(response.body, /react-starter-kit/);
  assert.match(response.body, /Cross-framework component kit/);
  assert.match(response.body, /\/api\/components\/button\/starter-kit\.json/);
  assert.match(response.body, /button-cross-framework-starter-kit/);
  assert.match(response.body, /Launch kit catalog/);
  assert.match(response.body, /\/api\/catalog\/launch-kit\.json/);
  assert.match(response.body, /impeccable-launch-kit-catalog/);
  assert.match(response.body, /Starter bundles<strong>9<\/strong>/);
  assert.match(response.body, /src\/components\/impeccable\/react/);
  assert.match(response.body, /src\/components\/impeccable\/react\/button/);
  assert.match(response.body, /react-button-starter/);
  assert.match(response.body, /ImpeccableButton\.jsx/);
  assert.match(response.body, /Demo\.jsx/);
  assert.match(response.body, /--impeccable-button-gradient: linear-gradient\(135deg, #7c3aed 0%, #06b6d4 100%\);/);
});

test('GET / lets the browser catalog focus a requested framework and component', async (t) => {
  const server = createApp().listen(0);
  t.after(() => server.close());

  const response = await request(server, '/?framework=svelte&component=stat-card');
  assert.equal(response.statusCode, 200);
  assert.match(response.body, /Svelte starter/);
  assert.match(response.body, /Signal Stat Card/);
  assert.match(response.body, /export let value = '99\.982%';/);
  assert.match(response.body, /data-preview-kind="stat-card"/);
  assert.match(response.body, /\+12\.4% vs last launch/);
  assert.match(response.body, /SVELTE · stat-card/);
  assert.match(response.body, /padding: 12px 18px;/);
  assert.match(response.body, /linear-gradient\(135deg, #7c3aed 0%, #06b6d4 100%\)/);
  assert.doesNotMatch(response.body, /padding: undefined undefined;/);
});

test('GET \/ falls back to the default preview when the requested pack does not exist', async (t) => {
  const server = createApp().listen(0);
  t.after(() => server.close());

  const response = await request(server, '/?framework=solid&component=marquee');
  assert.equal(response.statusCode, 200);
  assert.match(response.body, /React starter/);
  assert.match(response.body, /Aurora Button/);
  assert.match(response.body, /export function ImpeccableButton/);
});
