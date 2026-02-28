# Product Requirements Document
# Interactive 3D Portfolio Landing Page

**Version:** 1.1
**Date:** 2026-02-28
**Stack:** React · Three.js · @react-three/fiber · @react-three/drei

> **v1.1 changes:** Incorporates all decisions from the design-interview session.
> Open questions Q1–Q3, Q5 are now closed; Q4 (KTX2) is deferred to v2.

---

## 1. Overview

Build a high-performance, interactive 3D landing page that serves as a portfolio hub. The centrepiece is a 3×3×3 Rubik's-cube-like assembly of 27 distinct cubic nodes rendered in a sandstone aesthetic. Visitors navigate the portfolio entirely through 3D interaction — no traditional nav bars, text boxes, or UI overlays. Clicking a node expands it in-place (it scales up to fill the viewport) revealing a dark-glass rich card with the project's details.

---

## 2. Goals & Success Criteria

| # | Goal | Measurable Criterion |
|---|------|----------------------|
| G1 | Immersive first impression | Assembly visible and animating within 1 s of page load (LCP < 2.5 s) |
| G2 | Intuitive 3D navigation | Users can rotate and click nodes without tutorial prompts |
| G3 | Responsive across devices | Cube occupies ~70 % of the narrowest screen dimension on all viewports |
| G4 | Smooth interactivity | Hover glow and expand animations run at ≥ 60 fps |
| G5 | Extensible content | Adding a new project requires editing only `/src/data/projects.ts` |

---

## 3. Tech Stack & Dependencies

### 3.1 Core
- **React 18** — component tree and state
- **Three.js (r160+)** — 3D primitives, materials, lighting
- **@react-three/fiber (v8)** — React renderer for Three.js
- **@react-three/drei (v9)** — `OrbitControls`, `RoundedBox`, `Text`, `Html`, `useTexture`

### 3.2 Supporting Libraries
- **@react-spring/three** — spring-based scale, opacity, and glow transitions
- **@react-three/postprocessing** — SSAO pass
- **zustand** — global state (hovered/expanded node, idle flag)
- **lucide-react** — SVG icon source for glyph textures
- **Vite** — build tool and dev server
- **TypeScript** — type safety throughout

### 3.3 Assets
- **Textures:** CC0 sandstone textures from Poly Haven — diffuse, normal, and AO maps at 512×512 PNG stored in `/public/textures/`
- **Glyphs:** Lucide SVG icons rendered at runtime to `CanvasTexture` (256×256); no external glyph PNG files required

---

## 4. Visual Specification

### 4.1 The 3D Assembly

#### 4.1.1 Geometry
- Construct a **3×3×3 grid** of 27 individual `<RoundedBox>` nodes.
- Each node occupies a **1-unit³** cell.
- Apply a **uniform gap of 0.06 units** between adjacent nodes on every axis.
  - Effective spacing per step: `1.0 + 0.06 = 1.06 units`
  - Assembly span per axis: `3 × 1.06 − 0.06 ≈ 3.12 units`
- Centre the entire assembly at the scene origin `(0, 0, 0)`.
- Wrap all 27 nodes inside a single `<group>` so they rotate as one rigid unit.

#### 4.1.2 Sizing & Scaling
- **Desktop (viewport width ≥ 1024 px):** Assembly bounding sphere fits within 2/3 of both viewport height and width.
  - Camera FOV: 45°.
- **Tablet / Mobile:** Assembly scales to approximately **70 % of the narrowest screen dimension**.
  - `useResponsiveScale()` hook reads viewport dimensions, debounced 100 ms on resize, returns a `scale` multiplier applied to the root `<group>`.

#### 4.1.3 Material — Sandstone Nodes
| Property | Value |
|----------|-------|
| Type | `MeshStandardMaterial` |
| Base colour | `#E8DDD0` (off-white / warm sand) |
| Roughness | `0.85` |
| Metalness | `0.0` |
| Map | Poly Haven sandstone diffuse (512×512) |
| Normal map | Poly Haven normal map, `normalScale: (0.4, 0.4)` |
| AO map | Poly Haven AO map |

#### 4.1.4 Embossed Glyphs
- Each outer face displays a bright-white geometric glyph rendered from Lucide icons via `CanvasTexture`.
- Glyph plane offset: `0.01 units` from face surface.
- Glyph material: `MeshStandardMaterial`, `color: #FFFFFF`, `roughness: 0.3`, `emissive: #FFFFFF`, `emissiveIntensity: 0.15`.

| Category Face | Lucide Icon |
|---------------|-------------|
| ML | `Brain` |
| Website Tools | `Code2` |
| Mathematical Curiosities | `Sigma` |
| Physics | `Atom` |
| Apps | `LayoutGrid` |
| Game Development | `Gamepad2` |
| Unassigned / default | `Diamond` |

#### 4.1.5 Gap Accents (Internal Core)
- Thin unlit plane strips along each internal seam:

| Axis | Colour |
|------|--------|
| X seams | Muted purple `#7B68A0` |
| Y seams | Muted green `#5A8A6A` |
| Z seams | Muted red `#A05555` |

- Material: `MeshBasicMaterial` (unlit).

### 4.2 Background
- **Primary:** Solid dark-red `#1A0505` set on the Three.js scene.
- **CSS fallback:** `radial-gradient(ellipse at center, #2D0A0A 0%, #0D0000 100%)` on the canvas wrapper `<div>`.

### 4.3 Lighting

| Light | Settings |
|-------|----------|
| Directional (key) | position `(2, 8, 4)`, intensity `3.5`, cast shadows, shadow map 2048×2048, bias `−0.0005` |
| Ambient | intensity `0.6`, colour `#FFE8D0` |
| Point (fill) | position `(−4, 2, −4)`, intensity `0.8`, colour `#C0A8FF` |

#### 4.3.1 Ambient Occlusion
- `<SSAO>` via `@react-three/postprocessing`: radius `0.4`, intensity `30`, luminanceInfluence `0.6`, bias `0.035`.
- **Only enabled** when `window.devicePixelRatio ≥ 1.5`.

---

## 5. Interactive Logic

### 5.1 Orbit / Rotation Controls

- Use `<OrbitControls>` from `@react-three/drei`.

| Property | Value |
|----------|-------|
| `enableZoom` | `false` |
| `enablePan` | `false` |
| `rotateSpeed` | `0.6` |
| `dampingFactor` | `0.08` |
| `enableDamping` | `true` |
| Polar / azimuth limits | **None** — fully unconstrained rotation |

- Disabled (`enabled={false}`) while any node is expanded.
- Touch drag handled natively; pinch-to-zoom overridden to no-op.

#### 5.1.1 Auto-Rotate (Idle)
- After **4 seconds** of no pointer activity: `autoRotate: true`, `autoRotateSpeed: 0.4`.
- Any `pointerdown` / `pointermove` resets the timer.

### 5.2 Node Hover Effect (Desktop Only)
- `onPointerOver` / `onPointerOut` on each node mesh.
- Spring `emissiveIntensity`: `0.0 → 0.25` over 200 ms.
- Spring `scale`: `1.0 → 1.04` over 200 ms.
- Canvas cursor: `pointer` when hovered.
- On touch devices hover state is skipped; tap goes directly to expand.

### 5.3 Node Expand — Click Interaction

#### 5.3.1 Mechanic
- On click, the clicked node's **3D mesh scale** springs from `1` → `8` over 500 ms (`easeInOutCubic`).
- All other 26 nodes spring to `opacity: 0` over 300 ms.
- **Camera does not move** — the node expands in place relative to the existing camera view.
- `<OrbitControls>` disabled during expansion.

#### 5.3.2 Rich Card (Expanded State)
- Rendered via drei `<Html>` mounted on the expanded node face.
- Visual style — **dark glass / frosted:**
  - `background: rgba(10, 0, 0, 0.85)`
  - `backdropFilter: blur(12px)`
  - `border: 1px solid rgba(255, 255, 255, 0.1)`
  - `borderRadius: 12px`, `padding: 24px`
- Content layout:
  1. Category badge pill (muted accent colour)
  2. Project title — bold, white, large
  3. Description — 1–2 sentences, grey text
  4. Tech-stack pill tags (e.g. React, Python)
  5. "Visit Project →" button — `target="_blank" rel="noopener noreferrer"`
- **Placeholder / Coming Soon nodes:** show `"Coming Soon"` description; hide the link button.
- **Placeholder nodes still expand** when clicked (camera effect + Coming Soon card).

#### 5.3.3 Collapse / Defocus
- Press `Escape` key → expand collapses, all nodes return to `scale: 1, opacity: 1`.
- Click canvas background (no rayhit) → same collapse.
- Transition out: scale springs back over 400 ms; sibling opacity springs back over 300 ms.

### 5.4 Mobile Touch
- Single tap = immediate expand (no two-step hover intermediate).
- Same code path as desktop click (`onClick` handler unified).

### 5.5 No External UI
- No HTML nav bars, modals, text inputs, or overlays (except the `<Html>` rich card rendered within the 3D scene).
- All navigation is 3D-driven.

---

## 6. Content & Data Model

### 6.1 Data File (`/src/data/projects.ts`)

```ts
export type CategoryId = 'ml' | 'tools' | 'math' | 'physics' | 'apps' | 'games';

export interface Project {
  id: string;
  label: string;
  description: string;          // 1–2 sentences for rich card
  category: CategoryId | null;
  faceDirection: '+x'|'-x'|'+y'|'-y'|'+z'|'-z';
  nodeIndex: number;            // 0–26 within the 3×3×3 grid
  techTags: string[];           // e.g. ['React', 'Physics.js']
  url: string;                  // '#' until project is live
}
```

### 6.2 Category–Face Mapping

| Assembly Face | Direction | Category |
|---------------|-----------|----------|
| Front | +Z | Website Tools |
| Back | −Z | ML |
| Top | +Y | Physics |
| Bottom | −Y | Mathematical Curiosities |
| Right | +X | Apps |
| Left | −X | Game Development |

### 6.3 Pre-Labelled Projects

| Node Index | Category | Label |
|------------|----------|-------|
| 7 (top-centre of +Y face) | Physics | 1D Elastic Collision Simulator |
| 13 (centre of +Z face) | Website Tools | Geographical Midpoint Tool |
| All remaining 25 | varies | Project Placeholder |

- All project `url` fields are `'#'` as placeholders to be updated when projects go live.

### 6.4 In-Scene Labels
- `<Text>` (Roboto Mono) floats 0.1 units in front of the relevant outer face.
- Size: `0.12 units`, colour `#FFFFFF`, max-width `0.9` with wrapping.
- Opacity `0` by default; fades in (300 ms) only when `expandedNodeId === nodeId`.

---

## 7. Scene Architecture

### 7.1 Component Tree

```
<App>
 └─ <Canvas>
     ├─ <color attach="background" args={['#1A0505']} />
     ├─ <Suspense fallback={<LoadingSpinner />}>
     │   ├─ <AssemblyGroup>           ← root group + responsive scale + intro anim
     │   │   └─ <CubeNode /> × 27    ← mesh + hover + expand + glyph + label
     │   ├─ <GapAccents />            ← coloured seam planes
     │   └─ <SceneLighting />         ← dir + ambient + fill lights
     ├─ <OrbitControls ref={...} />
     ├─ <CameraController />          ← Escape / bg-click collapse handler
     └─ <EffectComposer>
         └─ <SSAO />                  ← gated on devicePixelRatio ≥ 1.5
```

### 7.2 State (Zustand)

```
usePortfolioStore
  ├─ hoveredNodeId:  string | null
  ├─ expandedNodeId: string | null    ← drives scale-up + sibling fade
  ├─ cameraState:    'idle' | 'transitioning'
  └─ isIdle:         boolean          ← drives autoRotate
```

### 7.3 File Structure

```
/
├─ public/
│   └─ textures/
│       ├─ sandstone_diffuse.png
│       ├─ sandstone_normal.png
│       └─ sandstone_ao.png
├─ src/
│   ├─ components/
│   │   ├─ AssemblyGroup.tsx
│   │   ├─ CubeNode.tsx
│   │   ├─ ExpandedCard.tsx
│   │   ├─ GapAccents.tsx
│   │   ├─ SceneLighting.tsx
│   │   ├─ CameraController.tsx
│   │   └─ LoadingSpinner.tsx
│   ├─ data/
│   │   └─ projects.ts
│   ├─ hooks/
│   │   ├─ useResponsiveScale.ts
│   │   ├─ useIdleTimer.ts
│   │   └─ useIntroAnimation.ts
│   ├─ store/
│   │   └─ usePortfolioStore.ts
│   ├─ utils/
│   │   └─ glyphTextures.ts
│   ├─ App.tsx
│   └─ main.tsx
├─ index.html
├─ vercel.json
├─ vite.config.ts
├─ tsconfig.json
└─ package.json
```

---

## 8. Intro Animation

- **Style:** Grow from centre outward.
- **Shell layers:**
  - Shell 0 (inner core, 8 nodes): `dist = max(|i−1|, |j−1|, |k−1|) = 0` → delay 0 ms
  - Shell 1 (middle ring, 12 nodes): dist = 1 → delay 180 ms
  - Shell 2 (outer shell, 8 corner nodes, 6 face-centre nodes): dist = 2 → delay 360 ms
- **Spring:** `from { scale: 0, opacity: 0 }` → `to { scale: 1, opacity: 1 }`, `tension: 180, friction: 20`
- Triggered once, after textures resolve inside `<Suspense>`.

---

## 9. Performance Requirements

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5 s |
| Largest Contentful Paint | < 2.5 s |
| Frame rate (desktop) | 60 fps sustained |
| Frame rate (mobile mid-range) | ≥ 30 fps |
| JS bundle (gzipped) | < 300 KB initial chunk |
| Texture assets (total) | < 2 MB |

### Optimisation Strategies
- `useMemo` for geometry and material objects.
- SSAO and shadow maps disabled when `devicePixelRatio < 1.5`.
- Migrate to `<Instances>` if mobile fps < 30.
- Dynamic `import()` for heavy chunks if initial bundle > 300 KB.
- `<Suspense>` boundary with spinner until textures resolve.

---

## 10. Implementation Phases

### Phase 1 — Project Scaffold
1.1 `npm create vite@latest` with `react-ts` template in repo root.
1.2 Install: `three @react-three/fiber @react-three/drei @react-three/postprocessing @react-spring/three zustand lucide-react` + `@types/three` (dev).
1.3 `vite.config.ts`: `@vitejs/plugin-react`, `base: './'`, `assetsInclude: ['**/*.ktx2']`.
1.4 `tsconfig.json`: `strict: true`, path alias `@/` → `src/`.
1.5 Create directory structure.
1.6 `index.html`: full-viewport canvas (`margin:0; overflow:hidden`).
1.7 Commit scaffold.

### Phase 2 — Data & Store
2.1 Author `projects.ts` with all 27 entries (2 named + 25 placeholders), full typed fields.
2.2 Create `usePortfolioStore.ts` with Zustand: `hoveredNodeId`, `expandedNodeId`, `cameraState`, `isIdle` + setters.
2.3 Commit.

### Phase 3 — Core 3D Scene
3.1 `<App>` with `<Canvas>` (camera `[0,0,8]`, FOV 45, antialias, shadows).
3.2 Scene background `#1A0505`.
3.3 `<SceneLighting />` with all three lights.
3.4 `<OrbitControls>` (no polar limits, damping, no zoom/pan).
3.5 `<EffectComposer>` + gated `<SSAO>`.
3.6 Commit.

### Phase 4 — Assembly Geometry
4.1 `useResponsiveScale()` hook.
4.2 `<AssemblyGroup>`: 27-node grid with 1.06-unit spacing, centred at origin.
4.3 `<CubeNode>` skeleton: `<RoundedBox>` + base sandstone material + event handlers.
4.4 `<GapAccents />`: coloured seam planes in X/Y/Z gaps.
4.5 Commit.

### Phase 5 — Textures & Glyphs
5.1 Download Poly Haven sandstone textures into `/public/textures/`.
5.2 Load in `<CubeNode>` via `useTexture`; apply diffuse, normal, AO.
5.3 `glyphTextures.ts`: render Lucide SVG to `CanvasTexture` per category.
5.4 Add glyph plane to each outer face of each node.
5.5 Verify orientation on all 6 assembly faces.
5.6 Commit.

### Phase 6 — Intro Animation
6.1 `useIntroAnimation()`: compute shell distance per node, assign delay, return spring values.
6.2 Wrap each `<CubeNode>` in `<animated.group>` driven by spring.
6.3 Trigger on mount after `<Suspense>` resolves.
6.4 Commit.

### Phase 7 — Hover & Idle
7.1 `onPointerOver`/`Out` in `<CubeNode>`: emissive spring + scale spring.
7.2 `useIdleTimer()` hook → `isIdle` → `autoRotate`.
7.3 Commit.

### Phase 8 — Node Expand & Rich Card
8.1 `onClick` in `<CubeNode>`: toggle `expandedNodeId`.
8.2 Scale spring (1→8) on expanded node; opacity spring (1→0) on siblings.
8.3 Disable `<OrbitControls>` during expansion.
8.4 `<ExpandedCard>` via `<Html>`: dark glass layout with category badge, title, description, tech pills, link button.
8.5 Collapse on `Escape` and background click.
8.6 Commit.

### Phase 9 — Labels
9.1 `<Text>` per node; fade in when `expandedNodeId === nodeId`.
9.2 Commit.

### Phase 10 — Polish
10.1 SSAO tuning.
10.2 Shadow softness.
10.3 CSS gradient background fallback.
10.4 Visual QA against reference image (to be provided).
10.5 Commit.

### Phase 11 — Performance
11.1 Mobile profiling → `<Instances>` if needed.
11.2 Device-capability gating (SSAO, shadow maps).
11.3 Lighthouse audit.
11.4 Dynamic imports if bundle > 300 KB.
11.5 Commit.

### Phase 12 — Deployment
12.1 `vercel.json` SPA rewrite rule.
12.2 Verify `vite.config.ts` `base: './'`.
12.3 Push; connect to Vercel; verify build + live URL.
12.4 Cross-browser QA: Chrome, Firefox, Safari (desktop + mobile).

---

## 11. Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-01 | 27 cubic nodes in 3×3×3 grid with visible 2–3 mm gaps |
| AC-02 | Assembly rotates as a single unit on mouse/touch drag |
| AC-03 | Sandstone material with grain texture on all nodes |
| AC-04 | Lucide-based glyphs embossed on each outer face |
| AC-05 | Gap accents in muted purple, green, and red |
| AC-06 | Background is solid dark-red `#1A0505` |
| AC-07 | Assembly occupies 2/3 of viewport on desktop |
| AC-08 | Assembly scales to ~70 % of shortest dimension on mobile |
| AC-09 | Hover triggers glow + subtle scale animation (desktop) |
| AC-10 | Clicking a node springs it to ~8× scale; siblings fade |
| AC-11 | Expanded node shows dark glass rich card (badge, title, desc, tags, link) |
| AC-12 | Placeholder nodes show "Coming Soon"; link button hidden |
| AC-13 | "Visit Project →" opens in new tab |
| AC-14 | Escape / background click collapses the expanded node |
| AC-15 | Intro: assembly grows from centre outward over ~600 ms |
| AC-16 | Game Development face (−X) has Gamepad2 glyph; all 9 nodes are placeholders |
| AC-17 | OrbitControls fully unconstrained (no polar/azimuth limits) |
| AC-18 | Single tap on mobile immediately expands node |
| AC-19 | Auto-rotate resumes after 4 s of inactivity |
| AC-20 | 60 fps desktop; ≥ 30 fps mid-range mobile |
| AC-21 | LCP < 2.5 s on fast 3G |
| AC-22 | Vercel deploy builds clean; live URL renders 3D scene |

---

## 12. Open Questions

| # | Question | Status |
|---|----------|--------|
| Q1 | Glyph artwork source | ✅ Closed — Lucide icons via CanvasTexture |
| Q2 | 6th face category | ✅ Closed — "Game Development" (−X face) |
| Q3 | Placeholder node click behaviour | ✅ Closed — expand + "Coming Soon" card |
| Q4 | KTX2 texture compression | Deferred to v2 |
| Q5 | Post-click content experience | ✅ Closed — expand in-place, rich card via `<Html>` |
| Q6 | Reference image visual spec | Pending — user will share image; PRD text spec used in the meantime |

---

*End of PRD v1.1*
