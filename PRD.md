# Product Requirements Document
# Interactive 3D Portfolio Landing Page

**Version:** 1.0
**Date:** 2026-02-28
**Stack:** React · Three.js · @react-three/fiber · @react-three/drei

---

## 1. Overview

Build a high-performance, interactive 3D landing page that serves as a portfolio hub. The centrepiece is a 3×3×3 Rubik's-cube-like assembly of 27 distinct cubic nodes rendered in a sandstone aesthetic. Visitors navigate the portfolio entirely through 3D interaction — no traditional nav bars, text boxes, or UI overlays. Each outer face of the assembly maps to a project category; clicking a node zooms the camera to that node's face and presents its associated project.

---

## 2. Goals & Success Criteria

| # | Goal | Measurable Criterion |
|---|------|----------------------|
| G1 | Immersive first impression | Assembly visible and animating within 1 s of page load (LCP < 2.5 s) |
| G2 | Intuitive 3D navigation | Users can rotate and click nodes without tutorial prompts |
| G3 | Responsive across devices | Cube occupies ~70 % of the narrowest screen dimension on all viewports |
| G4 | Smooth interactivity | Hover glow and camera transitions run at ≥ 60 fps |
| G5 | Extensible content | Adding a new project requires editing only a data file |

---

## 3. Tech Stack & Dependencies

### 3.1 Core
- **React 18** — component tree and state
- **Three.js (r160+)** — 3D primitives, materials, lighting
- **@react-three/fiber (v8)** — React renderer for Three.js
- **@react-three/drei (v9)** — helpers: `OrbitControls`, `Environment`, `Text`, `RoundedBox`, `useTexture`, `Html`

### 3.2 Supporting Libraries
- **@react-spring/three** — spring-based camera and glow transitions
- **Vite** — build tool and dev server
- **TypeScript** — type safety throughout

### 3.3 Assets
- Custom sandstone-style texture map (512×512 PNG, off-white base + subtle grain)
- Normal map for embossed glyph depth illusion
- A set of SVG glyphs (one per face type) baked into a texture atlas

---

## 4. Visual Specification

### 4.1 The 3D Assembly

#### 4.1.1 Geometry
- Construct a **3×3×3 grid** of 27 individual `<RoundedBox>` nodes.
- Each node occupies a **1-unit³** cell.
- Apply a **uniform gap of 0.06 units** (≈ 2–3 mm at scene scale) between adjacent nodes on every axis.
  - Effective spacing per step: `nodeSize + gap = 1.0 + 0.06 = 1.06 units`
  - The assembly spans `3 × 1.06 - 0.06 ≈ 3.12 units` on each axis.
- Centre the entire assembly at the scene origin `(0, 0, 0)`.
- Wrap all 27 nodes inside a single `<group>` so they rotate as one rigid unit.

#### 4.1.2 Sizing & Scaling
- **Desktop (viewport width ≥ 1024 px):** The assembly bounding sphere must fit within 2/3 of both viewport height and width.
  - Camera FOV: 45°; camera Z position calculated as `(assemblyDiameter / 2) / tan(FOV/2) × scaleFactor`.
  - `scaleFactor` computed so the projected assembly radius ≤ `min(vw, vh) × 0.333`.
- **Tablet (640–1023 px) & Mobile (< 640 px):** Assembly scales down uniformly so it occupies approximately **70 % of the narrowest screen dimension**.
  - Implement a `useResponsiveScale()` hook that reads `window.innerWidth` / `window.innerHeight`, re-runs on resize (debounced 100 ms), and returns a `scale` multiplier applied to the root `<group>`.

#### 4.1.3 Material — Sandstone Nodes
| Property | Value |
|----------|-------|
| Type | `MeshStandardMaterial` |
| Base colour | `#E8DDD0` (off-white / warm sand) |
| Roughness | `0.85` |
| Metalness | `0.0` |
| Map | Sandstone grain texture (512×512) |
| Normal map | Subtle stone normal map, `normalScale: (0.4, 0.4)` |
| AO map | Baked ambient-occlusion map for crevice depth |

#### 4.1.4 Embossed Glyphs
- Each **visible outer face** displays a bright-white geometric glyph.
- Glyph implementation: overlay a `<Decal>` or a `<mesh>` plane slightly offset (0.01 units) from the node face, using a `MeshStandardMaterial` with `color: #FFFFFF`, `roughness: 0.3`, `emissive: #FFFFFF`, `emissiveIntensity: 0.15`.
- Glyph designs per category face:
  | Category Face | Glyph Motif |
  |---------------|-------------|
  | ML | Neural network node graph |
  | Website Tools | `< / >` angle-bracket icon |
  | Mathematical Curiosities | Sigma (Σ) or fractal spiral |
  | Physics | Atom / orbit rings |
  | Apps | Grid of 9 rounded squares |
  | Unassigned faces | Simple diamond / crosshatch |
- Glyph textures are pre-rendered SVG → PNG at 256×256, stored in `/public/glyphs/`.

#### 4.1.5 Gap Accents (Internal Core)
- The gap between nodes reveals the scene background plus **accent plane meshes** positioned at each gap intersection:
  - Place thin `<mesh><planeGeometry /></mesh>` strips (thickness 0.02 units) along each internal X, Y, Z seam.
  - Accent colours (cycle per axis):
    | Axis | Colour |
    |------|--------|
    | X seams | Muted purple `#7B68A0` |
    | Y seams | Muted green `#5A8A6A` |
    | Z seams | Muted red `#A05555` |
  - Material: `MeshBasicMaterial` (unlit) so accents always read against the dark background.

### 4.2 Background
- **Primary option:** Solid dark-red `#1A0505`.
- **Secondary option (radial gradient fallback):** CSS `radial-gradient(ellipse at center, #2D0A0A 0%, #0D0000 100%)` applied to the `<canvas>` wrapper `div`.
- The Three.js scene `background` colour should match: `scene.background = new THREE.Color('#1A0505')`.

### 4.3 Lighting

#### 4.3.1 Directional Light (Key Light)
- Position: `(2, 8, 4)` — top-down, slightly front-right.
- Intensity: `3.5`.
- Cast shadows: `true`.
  - Shadow map size: `2048×2048`.
  - Shadow bias: `-0.0005`.

#### 4.3.2 Ambient Light
- Intensity: `0.6`, colour `#FFE8D0` (warm white).

#### 4.3.3 Fill Light
- `<pointLight>` at `(-4, 2, -4)`, intensity `0.8`, colour `#C0A8FF` (cool purple) to echo the gap accent.

#### 4.3.4 Ambient Occlusion
- Use `@react-three/postprocessing` `<SSAO>` pass:
  - radius `0.4`, intensity `30`, luminanceInfluence `0.6`, bias `0.035`.
  - Enable only on devices with `devicePixelRatio ≥ 1.5` to avoid mobile performance hit.

---

## 5. Interactive Logic

### 5.1 Orbit / Rotation Controls

#### 5.1.1 OrbitControls Setup
- Use `<OrbitControls>` from `@react-three/drei`.
- Settings:
  | Property | Value |
  |----------|-------|
  | `enableZoom` | `false` (zoom handled separately) |
  | `enablePan` | `false` |
  | `rotateSpeed` | `0.6` |
  | `dampingFactor` | `0.08` |
  | `enableDamping` | `true` |
  | `minPolarAngle` | `Math.PI * 0.1` |
  | `maxPolarAngle` | `Math.PI * 0.9` |

#### 5.1.2 Touch Support
- OrbitControls handles touch drag natively.
- Pinch-to-zoom: override default Three.js pinch to do nothing (zoom locked).

#### 5.1.3 Auto-Rotate (Idle)
- When no pointer interaction has occurred for **4 seconds**, resume gentle auto-rotation:
  - `autoRotate: true`, `autoRotateSpeed: 0.4`.
  - Detect idle via `pointerdown` / `pointermove` event; reset idle timer on each event.

### 5.2 Node Hover Effect

#### 5.2.1 Detection
- Use `@react-three/fiber` `onPointerOver` / `onPointerOut` on each node mesh.
- Maintain `hoveredNodeId: string | null` in a Zustand store (or React context).

#### 5.2.2 Visual Feedback
- On hover, animate the hovered node's material:
  - `emissive` colour: `#FFFFFF`
  - `emissiveIntensity`: spring from `0.0` → `0.25` over 200 ms using `@react-spring/three`.
- Scale the node up slightly: spring from `scale(1,1,1)` → `scale(1.04, 1.04, 1.04)`.
- Cursor CSS: `canvas { cursor: pointer }` when any node is hovered.

### 5.3 Node Click — Camera Focus

#### 5.3.1 Click Handler
- Attach `onClick` to each node mesh.
- On click, determine:
  1. The **world-space position** of the clicked node centre.
  2. The **face normal** of the specific face that was intersected (from `event.face.normal` transformed to world space).

#### 5.3.2 Camera Transition
- Compute the target camera position: `nodeWorldPos + faceNormal × focusDistance` where `focusDistance ≈ 2.5 units`.
- Animate camera `position` and `lookAt` target using `@react-spring/three` `useSpring`:
  - Duration: `600 ms`, easing: `easeInOutCubic`.
- While transitioning, disable `OrbitControls` (`enabled: false`).
- Re-enable OrbitControls after transition completes.

#### 5.3.3 Back / Defocus
- Clicking the background (no rayhit) or pressing `Escape` springs the camera back to its default position over `400 ms`.

### 5.4 No External UI
- There are **no HTML overlays, modals, text inputs, or nav bars**.
- All navigation is entirely 3D-driven.
- Project labels rendered with `<Text>` from `@react-three/drei` directly on or near node faces (visible only when camera is close).

---

## 6. Content & Data Model

### 6.1 Data File (`/src/data/projects.ts`)

```ts
export type CategoryId = 'ml' | 'tools' | 'math' | 'physics' | 'apps';

export interface Project {
  id: string;
  label: string;
  category: CategoryId | null;
  faceIndex: number; // 0–5: +X, -X, +Y, -Y, +Z, -Z
  nodeIndex: number; // 0–26 within the 3×3×3 grid
}
```

### 6.2 Category–Face Mapping
Each **outer face direction** of the entire assembly is dedicated to one category:

| Assembly Face | Direction | Category |
|---------------|-----------|----------|
| Front | +Z | Website Tools |
| Back | −Z | ML |
| Top | +Y | Physics |
| Bottom | −Y | Mathematical Curiosities |
| Right | +X | Apps |
| Left | −X | *(reserved / future)* |

### 6.3 Pre-Labelled Projects

| Node Index | Category | Label |
|------------|----------|-------|
| 7 (top-centre of +Y face) | Physics | 1D Elastic Collision Simulator |
| 13 (centre of +Z face) | Website Tools | Geographical Midpoint Tool |
| All remaining 25 | Varies | Project Placeholder |

### 6.4 In-Scene Labels
- Project labels appear as `<Text>` meshes floating 0.1 units in front of the relevant face.
- Font: monospace (Roboto Mono, loaded via `@react-three/drei` font loader).
- Font size: `0.12 units`; colour `#FFFFFF`; max-width `0.9 units` with wrapping.
- Labels are **opacity 0** by default and fade in (`opacity: 0 → 1`, 300 ms) only when the camera is within `3.5 units` of the node.

---

## 7. Scene Architecture

### 7.1 Component Tree

```
<App>
 └─ <Canvas>  (Vite + R3F)
     ├─ <Suspense fallback={<LoadingSpinner />}>
     │   ├─ <AssemblyGroup>          ← root <group> for the 27 nodes
     │   │   └─ <CubeNode /> × 27   ← individual node mesh + label + glyph
     │   ├─ <GapAccents />           ← thin seam planes
     │   ├─ <SceneLighting />        ← directional + ambient + point lights
     │   └─ <Environment preset="night" />
     ├─ <OrbitControls ref={...} />
     ├─ <CameraController />         ← manages focus transitions
     └─ <EffectComposer>
         └─ <SSAO />
```

### 7.2 State Management

```
usePortfolioStore (Zustand)
  ├─ hoveredNodeId: string | null
  ├─ focusedNodeId: string | null
  ├─ cameraState: 'idle' | 'transitioning' | 'focused'
  └─ isIdle: boolean            ← drives auto-rotate
```

### 7.3 File Structure

```
/
├─ public/
│   ├─ textures/
│   │   ├─ sandstone_diffuse.png
│   │   ├─ sandstone_normal.png
│   │   └─ sandstone_ao.png
│   └─ glyphs/
│       ├─ glyph_ml.png
│       ├─ glyph_tools.png
│       ├─ glyph_math.png
│       ├─ glyph_physics.png
│       ├─ glyph_apps.png
│       └─ glyph_default.png
├─ src/
│   ├─ components/
│   │   ├─ AssemblyGroup.tsx
│   │   ├─ CubeNode.tsx
│   │   ├─ GapAccents.tsx
│   │   ├─ SceneLighting.tsx
│   │   ├─ CameraController.tsx
│   │   └─ LoadingSpinner.tsx
│   ├─ data/
│   │   └─ projects.ts
│   ├─ hooks/
│   │   ├─ useResponsiveScale.ts
│   │   └─ useIdleTimer.ts
│   ├─ store/
│   │   └─ usePortfolioStore.ts
│   ├─ App.tsx
│   └─ main.tsx
├─ index.html
├─ vite.config.ts
├─ tsconfig.json
└─ package.json
```

---

## 8. Performance Requirements

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5 s |
| Largest Contentful Paint | < 2.5 s |
| Frame rate (desktop) | 60 fps sustained |
| Frame rate (mobile mid-range) | ≥ 30 fps |
| JS bundle (gzipped) | < 300 KB initial chunk |
| Texture atlas (total) | < 2 MB |

### 8.1 Optimisation Strategies
- **Instanced geometry** for all 27 nodes (single draw call via `<Instances>` from drei when nodes share material).
- **Texture compression:** convert PNGs to `.ktx2` with Basis compression; use `useKTX2` loader.
- **Level of Detail:** SSAO and shadow maps disabled on `window.devicePixelRatio < 1.5` or on mobile UA detection.
- **Lazy loading:** `<Suspense>` boundary shows a spinner until textures resolve.
- **Memoisation:** `useMemo` for geometry and material objects; avoid recreating on every frame.

---

## 9. Implementation Phases

### Phase 1 — Project Scaffold
1.1 Initialise Vite + React + TypeScript project (`npm create vite@latest`).
1.2 Install dependencies: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `@react-spring/three`, `zustand`.
1.3 Configure `vite.config.ts` with `@vitejs/plugin-react` and asset handling for `.ktx2` / `.glb`.
1.4 Set up `tsconfig.json` with `strict: true`, path aliases (`@/` → `src/`).
1.5 Create the directory structure from Section 7.3.
1.6 Commit initial scaffold.

### Phase 2 — Data & Store
2.1 Author `/src/data/projects.ts` with the full 27-project array (2 named + 25 placeholders).
2.2 Define `CategoryId`, `Project` TypeScript types.
2.3 Create `/src/store/usePortfolioStore.ts` with Zustand; define `hoveredNodeId`, `focusedNodeId`, `cameraState`, `isIdle` slices.
2.4 Write unit tests for the store (optional but recommended).

### Phase 3 — Core 3D Scene
3.1 Build `<App>` with `<Canvas>` (camera at `[0, 0, 8]`, FOV 45).
3.2 Add `<SceneLighting />`:
  - Directional light `(2, 8, 4)`, intensity 3.5, shadow enabled.
  - Ambient light intensity 0.6.
  - Fill point light `(-4, 2, -4)`, intensity 0.8, colour `#C0A8FF`.
3.3 Set scene background to `#1A0505`.
3.4 Add `<OrbitControls />` with settings from Section 5.1.
3.5 Commit working empty scene.

### Phase 4 — Assembly Geometry
4.1 Implement `useResponsiveScale` hook: reads viewport dimensions, returns scale multiplier.
4.2 Build `<AssemblyGroup>`: iterate `i ∈ [0..2]`, `j ∈ [0..2]`, `k ∈ [0..2]`; place each node at `(i×1.06 - 1.06, j×1.06 - 1.06, k×1.06 - 1.06)`.
4.3 Build `<CubeNode>`:
  - `<RoundedBox args={[1, 1, 1]} radius={0.04} smoothness={4}>`
  - Attach sandstone `MeshStandardMaterial` with diffuse, normal, AO maps.
4.4 Verify assembly renders as a 3×3×3 block with correct gaps.
4.5 Build `<GapAccents />`: place coloured seam planes in X / Y / Z gaps.
4.6 Commit geometry milestone.

### Phase 5 — Textures & Glyphs
5.1 Source or generate sandstone textures (`sandstone_diffuse.png`, `sandstone_normal.png`, `sandstone_ao.png`) at 512×512.
5.2 Design or procure 6 glyph PNGs at 256×256 (ML, Tools, Math, Physics, Apps, Default).
5.3 Load textures in `<CubeNode>` using `useTexture`; apply to `MeshStandardMaterial`.
5.4 Implement glyph decals: for each outer face of edge/corner nodes, select the correct glyph and render a slightly offset `<Decal>` or plane mesh.
5.5 Verify glyphs are correctly oriented (face outward) on all six assembly faces.
5.6 Commit texture milestone.

### Phase 6 — Interactivity
6.1 Implement `onPointerOver` / `onPointerOut` on `<CubeNode>`:
  - Dispatch `setHoveredNodeId` to Zustand store.
  - Animate emissive intensity via `@react-spring/three`.
6.2 Implement scale spring on hover (1.0 → 1.04).
6.3 Update canvas cursor CSS based on `hoveredNodeId !== null`.
6.4 Implement `onClick` on `<CubeNode>`:
  - Compute target camera position from face normal.
  - Dispatch `setFocusedNodeId` and `setCameraState('transitioning')`.
6.5 Build `<CameraController>`:
  - Subscribe to `focusedNodeId` and `cameraState`.
  - Execute spring-animated camera move using `useSpring`.
  - Disable OrbitControls during transition; re-enable after.
  - Handle background click and `Escape` key to defocus.
6.6 Implement idle timer in `useIdleTimer` hook; wire auto-rotate to `isIdle`.
6.7 Commit interactivity milestone.

### Phase 7 — Labels & Content
7.1 Add `<Text>` label to each `<CubeNode>` using the project's `label` field from data.
7.2 Implement distance-based opacity fade: compute `camera.position.distanceTo(nodeWorldPos)`; set opacity to `0` when `> 3.5 units`, `1` when `< 2.5 units`, interpolated linearly between.
7.3 Style labels: Roboto Mono, size `0.12`, white, max-width `0.9`.
7.4 Verify "1D Elastic Collision Simulator" and "Geographical Midpoint Tool" labels display correctly at close range.
7.5 Commit content milestone.

### Phase 8 — Post-Processing & Polish
8.1 Add `<EffectComposer>` with `<SSAO>` (conditional on device capability).
8.2 Tune directional light shadow softness; verify crevice shadowing looks natural.
8.3 Add background radial gradient CSS fallback on the `<canvas>` wrapper.
8.4 Perform visual QA against the reference image; adjust roughness, glyph brightness, gap accent colours.
8.5 Commit polish milestone.

### Phase 9 — Performance & Responsiveness
9.1 Migrate node geometry to `<Instances>` if FPS on mobile < 30.
9.2 Add `devicePixelRatio` detection; disable SSAO and reduce shadow map to 1024 on low-DPR devices.
9.3 Run Lighthouse; target LCP < 2.5 s and FID < 100 ms.
9.4 Convert PNGs to `.ktx2` if bundle size exceeds target.
9.5 Commit performance milestone.

### Phase 10 — Final QA & Deployment
10.1 Cross-browser test: Chrome, Firefox, Safari (desktop + mobile).
10.2 Accessibility: add `aria-label` to `<canvas>` element; ensure keyboard `Escape` defocus works.
10.3 Write `README.md` with setup instructions.
10.4 Build production bundle (`npm run build`); verify no console errors.
10.5 Deploy to hosting platform (Vercel / Netlify recommended).

---

## 10. Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-01 | 27 cubic nodes render in a 3×3×3 grid with visible 2–3 mm gaps |
| AC-02 | Assembly rotates as a single unit when dragged with mouse or touch |
| AC-03 | Sandstone off-white material with grain texture visible on all nodes |
| AC-04 | Bright-white geometric glyphs embossed on each outer face |
| AC-05 | Gap accents in muted purple, green, and red visible between nodes |
| AC-06 | Background is solid dark-red or matching radial gradient |
| AC-07 | Assembly occupies 2/3 of viewport on desktop |
| AC-08 | Assembly scales to ~70 % of shortest dimension on mobile |
| AC-09 | Hovering a node triggers glow + subtle scale animation |
| AC-10 | Clicking a node smoothly moves the camera to face that node |
| AC-11 | Escape / background click returns camera to default position |
| AC-12 | Auto-rotate resumes after 4 s of inactivity |
| AC-13 | "1D Elastic Collision Simulator" label visible on its Physics node when focused |
| AC-14 | "Geographical Midpoint Tool" label visible on its Website Tools node when focused |
| AC-15 | No HTML UI overlays; all navigation is 3D-driven |
| AC-16 | 60 fps on desktop; ≥ 30 fps on mid-range mobile |
| AC-17 | LCP < 2.5 s on a fast 3G connection |

---

## 11. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| Q1 | Final glyph artwork — generate procedurally or source from icon library? | Design | Open |
| Q2 | Which face of the assembly maps to "Left / −X"? Reserved or assign a 6th category? | Product | Open |
| Q3 | Should clicking a "Project Placeholder" node trigger any action, or only named projects? | Product | Open |
| Q4 | Is `.ktx2` texture compression in scope for v1, or deferred to a performance pass? | Eng | Open |
| Q5 | What content appears after camera focuses on a node — tooltip only, or a full overlay panel? | Product | Open |

---

*End of PRD*
