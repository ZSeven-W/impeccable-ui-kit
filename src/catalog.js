const frameworks = ['react', 'vue', 'svelte'];

const componentDefinitions = [
  {
    slug: 'button',
    title: 'Aurora Button',
    description: 'Gradient CTA button tuned for AI product surfaces.',
    previewLabel: 'Upgrade your action surface',
    previewExample: {
      kind: 'button',
      label: 'Upgrade your action surface',
      supportingText: 'Gradient CTA tuned for pricing pages, AI copilots, and launch flows.'
    },
    tokens: {
      radius: '999px',
      paddingX: '18px',
      paddingY: '12px',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
      text: '#f8fafc',
      shadow: '0 18px 40px rgba(76, 29, 149, 0.28)'
    }
  },
  {
    slug: 'feature-card',
    title: 'Orbit Feature Card',
    description: 'Glassmorphism feature card for product value storytelling.',
    previewLabel: 'AI-ready design system',
    previewExample: {
      kind: 'feature-card',
      eyebrow: 'Launch faster',
      title: 'AI-ready design system',
      body: 'Ship a polished feature story with gradients, trust cues, and strong hierarchy.'
    },
    tokens: {
      radius: '24px',
      border: '1px solid rgba(255,255,255,0.16)',
      background: 'rgba(15, 23, 42, 0.72)',
      text: '#e2e8f0',
      accent: '#22d3ee',
      shadow: '0 20px 48px rgba(15, 23, 42, 0.38)'
    }
  },
  {
    slug: 'stat-card',
    title: 'Signal Stat Card',
    description: 'Metric-forward proof card for launch dashboards and AI trust surfaces.',
    previewLabel: '99.982% automation success',
    previewExample: {
      kind: 'stat-card',
      label: 'Automation success',
      value: '99.982%',
      delta: '+12.4%',
      detail: 'Backed by replayable launch flows and fast rollback guardrails.'
    },
    tokens: {
      radius: '28px',
      border: '1px solid rgba(45, 212, 191, 0.24)',
      background: 'linear-gradient(145deg, rgba(15,23,42,0.92), rgba(17,24,39,0.72))',
      text: '#f8fafc',
      accent: '#5eead4',
      shadow: '0 24px 70px rgba(13, 148, 136, 0.22)',
      stat: '#ccfbf1'
    }
  }
];

function getDefinition(component) {
  const definition = componentDefinitions.find((entry) => entry.slug === component);
  if (!definition) {
    throw new Error(`Unsupported component: ${component}`);
  }
  return definition;
}

function ensureFramework(framework) {
  if (!frameworks.includes(framework)) {
    throw new Error(`Unsupported framework: ${framework}`);
  }
}

function renderReact(definition) {
  if (definition.slug === 'button') {
    return `const tokens = ${JSON.stringify(definition.tokens, null, 2)};

export function ImpeccableButton({ children = 'Upgrade your action surface' }) {
  return (
    <button
      type="button"
      style={{
        border: 'none',
        borderRadius: tokens.radius,
        padding: tokens.paddingY + ' ' + tokens.paddingX,
        background: tokens.gradient,
        color: tokens.text,
        boxShadow: tokens.shadow,
        fontWeight: 700,
        letterSpacing: '-0.01em'
      }}
    >
      {children}
    </button>
  );
}
`;
  }

  if (definition.slug === 'feature-card') {
    return `const tokens = ${JSON.stringify(definition.tokens, null, 2)};

export function OrbitFeatureCard({ eyebrow = 'Launch faster', title = 'AI-ready design system', body = 'Ship a polished feature story with gradients, trust cues, and strong hierarchy.' }) {
  return (
    <article
      style={{
        border: tokens.border,
        borderRadius: tokens.radius,
        background: tokens.background,
        color: tokens.text,
        boxShadow: tokens.shadow,
        padding: '24px'
      }}
    >
      <p style={{ color: tokens.accent, fontWeight: 700 }}>{eyebrow}</p>
      <h3 style={{ margin: '10px 0 8px' }}>{title}</h3>
      <p style={{ margin: 0, lineHeight: 1.6 }}>{body}</p>
    </article>
  );
}
`;
  }

  return `const tokens = ${JSON.stringify(definition.tokens, null, 2)};

export function SignalStatCard({ label = 'Automation success', value = '99.982%', delta = '+12.4%', detail = 'Backed by replayable launch flows and fast rollback guardrails.' }) {
  return (
    <article
      style={{
        border: tokens.border,
        borderRadius: tokens.radius,
        background: tokens.background,
        color: tokens.text,
        boxShadow: tokens.shadow,
        padding: '24px'
      }}
    >
      <p style={{ color: tokens.accent, fontWeight: 700, margin: 0 }}>{label}</p>
      <h3 style={{ color: tokens.stat, fontSize: '2.4rem', margin: '10px 0 6px' }}>{value} automation success</h3>
      <p style={{ color: tokens.accent, fontWeight: 700, margin: '0 0 10px' }}>{delta} vs last launch</p>
      <p style={{ margin: 0, lineHeight: 1.6 }}>{detail}</p>
    </article>
  );
}
`;
}

function renderVue(definition) {
  if (definition.slug === 'button') {
    return `<template>
  <button type="button" :style="buttonStyle">
    <slot>Upgrade your action surface</slot>
  </button>
</template>

<script setup>
const tokens = ${JSON.stringify(definition.tokens, null, 2)};
const buttonStyle = {
  border: 'none',
  borderRadius: tokens.radius,
  padding: tokens.paddingY + ' ' + tokens.paddingX,
  background: tokens.gradient,
  color: tokens.text,
  boxShadow: tokens.shadow,
  fontWeight: '700',
  letterSpacing: '-0.01em'
};
</script>
`;
  }

  if (definition.slug === 'feature-card') {
    return `<template>
  <article :style="cardStyle">
    <p :style="eyebrowStyle">{{ eyebrow }}</p>
    <h3>{{ title }}</h3>
    <p>{{ body }}</p>
  </article>
</template>

<script setup>
const tokens = ${JSON.stringify(definition.tokens, null, 2)};
const props = defineProps({
  eyebrow: { type: String, default: 'Launch faster' },
  title: { type: String, default: 'AI-ready design system' },
  body: {
    type: String,
    default: 'Ship a polished feature story with gradients, trust cues, and strong hierarchy.'
  }
});
const cardStyle = {
  border: tokens.border,
  borderRadius: tokens.radius,
  background: tokens.background,
  color: tokens.text,
  boxShadow: tokens.shadow,
  padding: '24px'
};
const eyebrowStyle = { color: tokens.accent, fontWeight: '700' };
</script>
`;
  }

  return `<template>
  <article :style="cardStyle">
    <p :style="labelStyle">{{ label }}</p>
    <h3 :style="valueStyle">{{ value }} automation success</h3>
    <p :style="deltaStyle">{{ delta }} vs last launch</p>
    <p>{{ detail }}</p>
  </article>
</template>

<script setup>
const tokens = ${JSON.stringify(definition.tokens, null, 2)};
const props = defineProps({
  label: { type: String, default: 'Automation success' },
  value: { type: String, default: '99.982%' },
  delta: { type: String, default: '+12.4%' },
  detail: {
    type: String,
    default: 'Backed by replayable launch flows and fast rollback guardrails.'
  }
});
const cardStyle = {
  border: tokens.border,
  borderRadius: tokens.radius,
  background: tokens.background,
  color: tokens.text,
  boxShadow: tokens.shadow,
  padding: '24px'
};
const labelStyle = { color: tokens.accent, fontWeight: '700', margin: 0 };
const valueStyle = { color: tokens.stat, fontSize: '2.4rem', margin: '10px 0 6px' };
const deltaStyle = { color: tokens.accent, fontWeight: '700', margin: '0 0 10px' };
</script>
`;
}

function renderSvelte(definition) {
  if (definition.slug === 'button') {
    return `<script>
  const tokens = ${JSON.stringify(definition.tokens, null, 2)};
  export let label = 'Upgrade your action surface';
  $: buttonStyle = 'border:none;border-radius:' + tokens.radius + ';padding:' + tokens.paddingY + ' ' + tokens.paddingX + ';background:' + tokens.gradient + ';color:' + tokens.text + ';box-shadow:' + tokens.shadow + ';font-weight:700;letter-spacing:-0.01em;';
</script>

<button
  type="button"
  style={buttonStyle}
>
  {label}
</button>
`;
  }

  if (definition.slug === 'feature-card') {
    return `<script>
  const tokens = ${JSON.stringify(definition.tokens, null, 2)};
  export let eyebrow = 'Launch faster';
  export let title = 'AI-ready design system';
  export let body = 'Ship a polished feature story with gradients, trust cues, and strong hierarchy.';
  $: cardStyle = 'border:' + tokens.border + ';border-radius:' + tokens.radius + ';background:' + tokens.background + ';color:' + tokens.text + ';box-shadow:' + tokens.shadow + ';padding:24px;';
  $: eyebrowStyle = 'color:' + tokens.accent + ';font-weight:700;';
</script>

<article style={cardStyle}>
  <p style={eyebrowStyle}>{eyebrow}</p>
  <h3>{title}</h3>
  <p>{body}</p>
</article>
`;
  }

  return `<script>
  const tokens = ${JSON.stringify(definition.tokens, null, 2)};
  export let label = 'Automation success';
  export let value = '99.982%';
  export let delta = '+12.4%';
  export let detail = 'Backed by replayable launch flows and fast rollback guardrails.';
  $: cardStyle = 'border:' + tokens.border + ';border-radius:' + tokens.radius + ';background:' + tokens.background + ';color:' + tokens.text + ';box-shadow:' + tokens.shadow + ';padding:24px;';
  $: labelStyle = 'color:' + tokens.accent + ';font-weight:700;margin:0;';
  $: valueStyle = 'color:' + tokens.stat + ';font-size:2.4rem;margin:10px 0 6px;';
  $: deltaStyle = 'color:' + tokens.accent + ';font-weight:700;margin:0 0 10px;';
</script>

<article style={cardStyle}>
  <p style={labelStyle}>{label}</p>
  <h3 style={valueStyle}>{value} automation success</h3>
  <p style={deltaStyle}>{delta} vs last launch</p>
  <p>{detail}</p>
</article>
`;
}

function renderSnippet(framework, definition) {
  if (framework === 'react') return renderReact(definition);
  if (framework === 'vue') return renderVue(definition);
  return renderSvelte(definition);
}

function tokenNameToCssSuffix(tokenName) {
  return tokenName
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function renderCssVariables(component, tokens) {
  const lines = Object.entries(tokens).map(([token, value]) => `  --impeccable-${component}-${tokenNameToCssSuffix(token)}: ${value};`);
  return [':root {', ...lines, '}'].join('\n');
}

function componentSlugToPascalCase(component) {
  return component
    .split('-')
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join('');
}

function inferComponentExportName(framework, definition) {
  const snippet = renderSnippet(framework, definition);
  const exportMatch = snippet.match(/export function ([A-Za-z0-9_]+)/);
  if (exportMatch) {
    return exportMatch[1];
  }

  return definition.title.replace(/[^A-Za-z0-9]+/g, '');
}

function componentFileExtension(framework) {
  if (framework === 'react') return 'jsx';
  if (framework === 'vue') return 'vue';
  return 'svelte';
}

function frameworkLabel(framework) {
  return framework[0].toUpperCase() + framework.slice(1);
}

function renderUsageSnippet(framework, definition, componentExportName) {
  if (framework === 'react') {
    return `import { ${componentExportName} } from './${componentExportName}.${componentFileExtension(framework)}';
import './${definition.slug}.tokens.css';

export function Demo() {
  return <${componentExportName} />;
}
`;
  }

  if (framework === 'vue') {
    return `<template>
  <${componentExportName} />
</template>

<script setup>
import ${componentExportName} from './${componentExportName}.${componentFileExtension(framework)}';
import './${definition.slug}.tokens.css';
</script>
`;
  }

  return `<script>
  import ${componentExportName} from './${componentExportName}.${componentFileExtension(framework)}';
  import './${definition.slug}.tokens.css';
</script>

<${componentExportName} />
`;
}

function buildStarterFiles(framework, definition) {
  const componentExportName = inferComponentExportName(framework, definition) || componentSlugToPascalCase(definition.slug);
  const extension = componentFileExtension(framework);
  const usageExtension = framework === 'react' ? 'jsx' : extension;

  return [
    {
      path: `${componentExportName}.${extension}`,
      kind: 'component',
      description: `${frameworkLabel(framework)} component starter`,
      content: renderSnippet(framework, definition)
    },
    {
      path: `${definition.slug}.tokens.css`,
      kind: 'tokens',
      description: 'Framework-agnostic CSS variable export',
      content: renderCssVariables(definition.slug, definition.tokens)
    },
    {
      path: `Demo.${usageExtension}`,
      kind: 'usage',
      description: `Minimal ${frameworkLabel(framework)} usage example`,
      content: renderUsageSnippet(framework, definition, componentExportName)
    }
  ];
}

function buildStarterBundle(framework, definition, files) {
  return {
    bundleId: `${framework}-${definition.slug}-starter`,
    title: `${frameworkLabel(framework)} ${definition.title} starter`,
    targetDirectory: `src/components/impeccable/${framework}/${definition.slug}`,
    installSteps: [
      `Create ${frameworkLabel(framework)} component files under src/components/impeccable/${framework}/${definition.slug}.`,
      `Drop in ${files.map((file) => file.path).join(', ')}.`,
      `Import ${files[0].path} plus ${files[1].path} from ${files[2].path} to render the starter immediately.`
    ],
    files
  };
}

function buildFrameworkStarterKit(framework) {
  ensureFramework(framework);

  const bundles = componentDefinitions.map((definition) => {
    const files = buildStarterFiles(framework, definition);
    return buildStarterBundle(framework, definition, files);
  });

  return {
    bundleId: `${framework}-starter-kit`,
    framework,
    title: `${frameworkLabel(framework)} impeccable starter kit`,
    targetDirectory: `src/components/impeccable/${framework}`,
    componentCount: bundles.length,
    componentSlugs: bundles.map((bundle) => bundle.bundleId.replace(`${framework}-`, '').replace(/-starter$/, '')),
    installSteps: [
      `Create ${frameworkLabel(framework)} component folders under src/components/impeccable/${framework}.`,
      `Drop in all ${bundles.length} starter bundles to seed Button, Feature Card, and Signal Stat Card surfaces.`,
      'Import the generated Demo files or individual component files to preview the kit immediately.'
    ],
    bundles
  };
}

function buildCrossFrameworkComponentKit(component) {
  const definition = getDefinition(component);
  const frameworkBundles = frameworks.map((framework) => ({
    framework,
    starterPath: `/api/packs/${framework}/${component}/starter.json`,
    bundle: buildStarterBundle(framework, definition, buildStarterFiles(framework, definition))
  }));

  return {
    bundleId: `${component}-cross-framework-starter-kit`,
    component,
    title: `${definition.title} cross-framework starter kit`,
    description: `Bundle the ${definition.title} starter across every currently shipped framework.`,
    frameworkCount: frameworkBundles.length,
    previewLabel: definition.previewLabel,
    installSteps: [
      `Review the same component surface across all ${frameworkBundles.length} frameworks before choosing an implementation target.`,
      `Fetch one starter.json per framework or inspect the inline bundle payloads below for direct copy/paste handoff.`,
      'Use the shared preview label and token exports to keep the component consistent when mixing frameworks in one launch stack.'
    ],
    frameworks: frameworkBundles
  };
}

function buildLaunchKitCatalog() {
  const starterKits = frameworks.map((framework) => buildFrameworkStarterKit(framework));
  const componentIndex = componentDefinitions.map((definition) => ({
    component: definition.slug,
    title: definition.title,
    description: definition.description,
    previewLabel: definition.previewLabel,
    componentKitPath: `/api/components/${definition.slug}/starter-kit.json`,
    frameworks: frameworks.map((framework) => ({
      framework,
      starterBundleId: `${framework}-${definition.slug}-starter`,
      starterKitPath: `/api/frameworks/${framework}/starter-kit.json`,
      starterPath: `/api/packs/${framework}/${definition.slug}/starter.json`
    }))
  }));

  return {
    bundleId: 'impeccable-launch-kit-catalog',
    title: 'Impeccable multi-framework launch kit catalog',
    frameworkCount: starterKits.length,
    componentCount: componentDefinitions.length,
    totalStarterBundles: starterKits.reduce((sum, kit) => sum + kit.bundles.length, 0),
    frameworks: starterKits.map((kit) => ({
      framework: kit.framework,
      title: kit.title,
      starterKitPath: `/api/frameworks/${kit.framework}/starter-kit.json`,
      targetDirectory: kit.targetDirectory,
      componentCount: kit.componentCount,
      componentSlugs: kit.componentSlugs
    })),
    componentIndex,
    starterKits
  };
}

function buildComponentPack(framework, component) {
  ensureFramework(framework);
  const definition = getDefinition(component);
  const cssVariables = renderCssVariables(component, definition.tokens);
  const snippet = renderSnippet(framework, definition);
  const files = buildStarterFiles(framework, definition);

  return {
    framework,
    component,
    title: definition.title,
    description: definition.description,
    previewLabel: definition.previewLabel,
    preview: definition.previewExample,
    tokens: definition.tokens,
    cssVariables,
    snippet,
    files,
    starterBundle: buildStarterBundle(framework, definition, files)
  };
}

function listComponentPacks() {
  const entries = frameworks.flatMap((framework) => componentDefinitions.map((definition) => ({
    framework,
    component: definition.slug,
    title: definition.title,
    description: definition.description
  })));

  return {
    frameworks,
    components: componentDefinitions.map(({ slug, title, description, previewLabel }) => ({
      slug,
      title,
      description,
      previewLabel
    })),
    entries
  };
}

module.exports = {
  frameworks,
  listComponentPacks,
  buildComponentPack,
  buildFrameworkStarterKit,
  buildCrossFrameworkComponentKit,
  buildLaunchKitCatalog
};
