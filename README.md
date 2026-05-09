# Impeccable UI Kit

Impeccable UI Kit is a local-first browser catalog for a tiny multi-framework UI starter pack inspired by impeccable-style AI product design language. The first MVP slice ships three copy-ready components across React, Vue, and Svelte:

- **Aurora Button** — gradient CTA button for high-contrast action surfaces
- **Orbit Feature Card** — glassy feature card for launch pages and product highlights
- **Signal Stat Card** — metric-forward proof card for launch dashboards and AI trust surfaces

## Why this slice

The heartbeat task asked for the first concrete slice of an AI design-language component kit. Instead of stopping at ideation, this MVP ships a usable catalog with framework-specific starter code and a zero-build browser preview.

## Run

```bash
npm test
npm start
```

Then open `http://127.0.0.1:4492`.

## API

- `GET /api/packs` — list all framework/component entries in the launch catalog
- `GET /api/catalog/launch-kit.json` — fetch the full multi-framework starter matrix, including every framework kit plus per-component starter references in one payload
- `GET /api/packs/:framework/:component` — fetch the starter pack with tokens, live-preview payload, snippet, and starter bundle manifest
- `GET /api/packs/:framework/:component/starter.json` — fetch only the machine-readable starter bundle manifest for copy/paste or automation handoff
- `GET /api/frameworks/:framework/starter-kit.json` — fetch one machine-readable framework kit that bundles all current starters for that framework into a single export surface
- `GET /api/components/:component/starter-kit.json` — fetch one machine-readable cross-framework kit that bundles the same component surface across React, Vue, and Svelte
- `GET /` — zero-build browser catalog with a query-selectable starter preview

### Live preview + token inspector

The browser catalog now renders the selected pack as a live visual preview next to the framework snippet, plus a token pill inspector for quick design review.

The pack API also exposes a `preview` payload so future automation or export flows can reuse the same copy-ready sample content without scraping HTML.

### Copy-ready CSS variables

Each pack now also includes a `cssVariables` block that turns the component tokens into framework-agnostic CSS custom properties, for example via `GET /api/packs/react/button`.

The browser catalog renders the same CSS variable block next to the starter snippet so you can copy both the component code and its design-token surface in one pass.

### Starter file manifest

Each pack now also exposes a `files` array with a ready-to-drop starter bundle:

- framework component file (`ImpeccableButton.jsx`, `AuroraButton.vue`, `SignalStatCard.svelte`, etc.)
- matching `*.tokens.css` export
- minimal `Demo.*` usage example wired to the token file

The browser catalog renders the same file manifest inline so you can review every copy-ready file before pasting a starter into a real app.

### Starter bundle manifest

Each pack now also includes a `starterBundle` object with a stable bundle id, target directory suggestion, install steps, and the same starter files bundled into one machine-readable payload.

Use `GET /api/packs/react/button/starter.json` (or any framework/component pair) when you want a single export payload for automation, copy/paste handoff, or review without manually stitching together the component, token CSS, and demo files.

The browser catalog renders the same starter bundle manifest plus install steps inline so the packaging shape stays visible during design review.

### Framework starter kit export

The catalog now also exposes `GET /api/frameworks/:framework/starter-kit.json`, which groups every currently shipped starter bundle for a framework into one machine-readable kit.

For example, `GET /api/frameworks/react/starter-kit.json` returns Button, Feature Card, and Signal Stat Card starter bundles together with a shared target directory and install checklist, so a downstream tool can seed an entire React design-language slice in one fetch instead of walking each pack separately.

The browser catalog mirrors the same framework kit summary and bundled file list inline under the active preview so the multi-component export shape stays reviewable without leaving the page.

### Cross-framework component kit

The catalog now also exposes `GET /api/components/:component/starter-kit.json`, which groups the same component surface across every shipped framework into one machine-readable kit.

For example, `GET /api/components/button/starter-kit.json` returns the Aurora Button starter bundles for React, Vue, and Svelte together with per-framework starter export paths, so a downstream reviewer can compare implementation shapes for one component before committing to a stack.

The browser catalog mirrors the same cross-framework component kit inline under the active preview so you can inspect the same button/card/stat slice across frameworks without manually hopping between endpoints.

### Launch kit catalog

The catalog now also exposes `GET /api/catalog/launch-kit.json`, which aggregates all three framework starter kits plus a per-component index of starter bundle ids and export paths.

Use that launch-kit payload when a downstream tool needs the whole cross-framework matrix in one fetch — for example to review React/Vue/Svelte coverage, queue bulk starter exports, or map one component concept across every supported framework without walking each endpoint separately.

The browser catalog mirrors the same launch-kit summary inline with framework cards, starter-bundle counts, and a component-to-framework matrix so the full multi-framework export surface stays reviewable in one screen.

### Query-selectable preview

The browser catalog now honors `framework` and `component` query parameters so you can deep-link to a specific starter pack:

- `/?framework=react&component=button`
- `/?framework=vue&component=feature-card`
- `/?framework=svelte&component=stat-card`

Invalid combinations gracefully fall back to the default React Aurora Button preview.
