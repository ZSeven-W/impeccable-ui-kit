const test = require('node:test');
const assert = require('node:assert/strict');

const { listComponentPacks, buildComponentPack, buildFrameworkStarterKit, buildCrossFrameworkComponentKit, buildLaunchKitCatalog } = require('../src/catalog');

test('listComponentPacks exposes the first multi-framework launch catalog', () => {
  const catalog = listComponentPacks();

  assert.equal(catalog.frameworks.length, 3);
  assert.deepEqual(catalog.frameworks, ['react', 'vue', 'svelte']);
  assert.deepEqual(catalog.components.map((component) => component.slug), ['button', 'feature-card', 'stat-card']);
  assert.equal(catalog.entries.length, 9);
  assert.equal(catalog.entries[0].title, 'Aurora Button');
});

test('buildComponentPack renders a React button starter with design tokens', () => {
  const pack = buildComponentPack('react', 'button');

  assert.equal(pack.framework, 'react');
  assert.equal(pack.component, 'button');
  assert.equal(pack.title, 'Aurora Button');
  assert.deepEqual(pack.preview, {
    kind: 'button',
    label: 'Upgrade your action surface',
    supportingText: 'Gradient CTA tuned for pricing pages, AI copilots, and launch flows.'
  });
  assert.match(pack.snippet, /export function ImpeccableButton/);
  assert.match(pack.snippet, /const tokens =/);
  assert.match(pack.snippet, /Upgrade your action surface/);
  assert.match(pack.cssVariables, /:root \{/);
  assert.match(pack.cssVariables, /--impeccable-button-radius: 999px;/);
  assert.match(pack.cssVariables, /--impeccable-button-padding-x: 18px;/);
  assert.equal(pack.files.length, 3);
  assert.deepEqual(pack.files.map((file) => file.path), ['ImpeccableButton.jsx', 'button.tokens.css', 'Demo.jsx']);
  assert.match(pack.files[0].content, /export function ImpeccableButton/);
  assert.match(pack.files[1].content, /--impeccable-button-gradient/);
  assert.match(pack.files[2].content, /import '\.\/button\.tokens\.css';/);
  assert.equal(pack.starterBundle.bundleId, 'react-button-starter');
  assert.equal(pack.starterBundle.targetDirectory, 'src/components/impeccable/react/button');
  assert.equal(pack.starterBundle.files.length, 3);
  assert.match(pack.starterBundle.installSteps[0], /Create React component files/);
  assert.match(pack.starterBundle.installSteps[2], /Demo\.jsx/);
});

test('buildComponentPack renders a Svelte feature card starter', () => {
  const pack = buildComponentPack('svelte', 'feature-card');

  assert.equal(pack.framework, 'svelte');
  assert.equal(pack.component, 'feature-card');
  assert.match(pack.snippet, /<script>/);
  assert.match(pack.snippet, /export let eyebrow/);
  assert.match(pack.snippet, /AI-ready design system/);
});

test('buildComponentPack renders a React stat card starter for launch metrics', () => {
  const pack = buildComponentPack('react', 'stat-card');

  assert.equal(pack.framework, 'react');
  assert.equal(pack.component, 'stat-card');
  assert.equal(pack.title, 'Signal Stat Card');
  assert.match(pack.snippet, /export function SignalStatCard/);
  assert.match(pack.snippet, /value = '99\.982%'/);
  assert.match(pack.snippet, /automation success/);
});

test('buildFrameworkStarterKit aggregates every starter bundle for a framework', () => {
  const starterKit = buildFrameworkStarterKit('react');

  assert.equal(starterKit.bundleId, 'react-starter-kit');
  assert.equal(starterKit.framework, 'react');
  assert.equal(starterKit.componentCount, 3);
  assert.deepEqual(starterKit.componentSlugs, ['button', 'feature-card', 'stat-card']);
  assert.equal(starterKit.targetDirectory, 'src/components/impeccable/react');
  assert.equal(starterKit.bundles.length, 3);
  assert.equal(starterKit.bundles[0].bundleId, 'react-button-starter');
  assert.equal(starterKit.bundles[1].bundleId, 'react-feature-card-starter');
  assert.equal(starterKit.bundles[2].bundleId, 'react-stat-card-starter');
  assert.match(starterKit.installSteps[1], /all 3 starter bundles/);
});

test('buildCrossFrameworkComponentKit aggregates one component across every framework', () => {
  const starterKit = buildCrossFrameworkComponentKit('button');

  assert.equal(starterKit.bundleId, 'button-cross-framework-starter-kit');
  assert.equal(starterKit.component, 'button');
  assert.equal(starterKit.title, 'Aurora Button cross-framework starter kit');
  assert.equal(starterKit.frameworkCount, 3);
  assert.deepEqual(starterKit.frameworks.map((entry) => entry.framework), ['react', 'vue', 'svelte']);
  assert.equal(starterKit.frameworks[0].starterPath, '/api/packs/react/button/starter.json');
  assert.equal(starterKit.frameworks[2].bundle.bundleId, 'svelte-button-starter');
  assert.match(starterKit.installSteps[0], /same component surface/);
});

test('buildLaunchKitCatalog aggregates every framework kit into one export surface', () => {
  const launchCatalog = buildLaunchKitCatalog();

  assert.equal(launchCatalog.bundleId, 'impeccable-launch-kit-catalog');
  assert.equal(launchCatalog.frameworkCount, 3);
  assert.equal(launchCatalog.componentCount, 3);
  assert.equal(launchCatalog.totalStarterBundles, 9);
  assert.equal(launchCatalog.frameworks.length, 3);
  assert.deepEqual(launchCatalog.frameworks.map((entry) => entry.framework), ['react', 'vue', 'svelte']);
  assert.equal(launchCatalog.frameworks[0].starterKitPath, '/api/frameworks/react/starter-kit.json');
  assert.equal(launchCatalog.componentIndex.length, 3);
  assert.equal(launchCatalog.componentIndex[0].frameworks.length, 3);
  assert.equal(launchCatalog.componentIndex[0].frameworks[0].starterPath, '/api/packs/react/button/starter.json');
  assert.equal(launchCatalog.starterKits.length, 3);
  assert.equal(launchCatalog.starterKits[2].bundleId, 'svelte-starter-kit');
});

test('buildComponentPack rejects unsupported frameworks', () => {
  assert.throws(() => buildComponentPack('solid', 'button'), /Unsupported framework/);
  assert.throws(() => buildFrameworkStarterKit('solid'), /Unsupported framework/);
});

