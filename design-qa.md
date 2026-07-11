# SunoFox Official Site Design QA

- source visual truth (desktop): `docs/design-references/exec-74d198d4-6540-492d-b792-fe9732d0732b.png`
- source visual truth (mobile): `docs/design-references/exec-e539dbb9-585a-4655-b4e2-8760bc6180a4.png`
- desktop implementation evidence:
  - `docs/design-references/implementation-desktop-top-final-1440.png`
  - `docs/design-references/implementation-desktop-novel-about-final-1280.png`
  - `docs/design-references/implementation-desktop-about-final-1280.png`
  - `docs/design-references/implementation-desktop-filmography-final-1280.png`
- mobile implementation evidence:
  - `docs/design-references/implementation-mobile-top-final-390.png`
  - `docs/design-references/implementation-mobile-about-final-390.png`
  - `docs/design-references/implementation-mobile-flow-final-390.png`
- viewport: desktop 1440 × 900 and 1280 × 720; mobile 390 × 844; resilience checks at 768 × 844 and 1024 × 844
- state: public home, no authentication; login screen separately checked at `/login.html?next=/mv-studio`

## Full-view comparison evidence

The complete desktop and mobile source images were opened together with sequential browser captures covering the hero, novel, about/production flow, all six filmography cards, Studio panel, and footer. The in-app browser's fixed-layer full-page capture repeats compositor tiles, so the final evidence uses clean sequential viewport captures rather than retaining a misleading tiled image. Together the focused captures cover the full scroll range and preserve the actual fixed-header state.

Macro composition matches the selected direction:

- fixed black header with four compact links
- dark full-bleed hero with left-aligned SunoFox wordmark and two CTAs
- continuous pink numbered timeline from chapter 02 through 05
- desktop image/copy cross-layout and one-row six-work filmography
- mobile edge-to-edge black surface, copy-before-image ordering, open 2 × 2 production flow, and two-column vertical work cards
- dark Studio banner and legal-only footer

## Focused region comparison evidence

- Hero: `implementation-desktop-top-final-1440.png` and `implementation-mobile-top-final-390.png` verify header height, key-visual crop, wordmark scale, serif lead, CTA hierarchy, and scroll cue.
- Novel/About: `implementation-desktop-novel-about-final-1280.png` and `implementation-mobile-about-final-390.png` verify timeline alignment, heading wrap, copy density, image order, and production-flow icon rhythm.
- Filmography/Studio: `implementation-desktop-filmography-final-1280.png` and `implementation-mobile-flow-final-390.png` verify exactly six works, desktop single row, mobile 2-column posters, dark Studio panel, and footer.

## Required fidelity surfaces

- Fonts and typography: Noto Sans KR is used for navigation/body/UI and Noto Serif KR for narrative headings. Weight, line height, tracking, Korean word wrapping, and mobile truncation were checked. No clipped or off-screen text was found.
- Spacing and layout rhythm: header, hero, section boundaries, chapter rail, image widths, card ratios, Studio banner, and footer follow the reference hierarchy. The 390px layout has no horizontal overflow.
- Colors and visual tokens: `#050509`, `#ff5f96`, `#f6b86a`, off-white, and muted gray map directly to the approved palette. Focus indicators retain adequate contrast.
- Image quality and asset fidelity: all visible imagery uses real SunoFox raster assets or official YouTube thumbnails. No CSS art, inline SVG, emoji, or placeholder image replaces a reference asset. Actual project artwork differs where the plan explicitly permits real content substitution; crop, density, and placement remain faithful.
- Copy and content: the required real titles, dates, types, channel description, novel facts, and Studio copy are present. Differences from the concept board are limited to approved real content.
- Icons: Phosphor Bold Music Notes, Book Open, Image, Video, Play, and Arrow Up Right are loaded from `@phosphor-icons/web` and align consistently.
- Accessibility and behavior: semantic landmarks/headings, alt text, keyboard focus, external-link rel values, reduced motion, touch-safe login control, and responsive overflow were checked.

## Comparison history

### Iteration 1

- [P1] Shared legacy CSS changed the fixed header to a light surface.
- [P2] About used a still-life image rather than an animation character visual.
- [P2] Desktop narrative heading could wrap a Korean word onto an isolated line at 1280px.
- [P2] Studio artwork remained too light compared with the dark reference banner.

Fixes:

- Added the final-load `official-shell.css` layer so the black fixed header and legal footer cannot be overridden by legacy page rules.
- Replaced the about still-life with the approved SunoFox animation key visual and matched the crop.
- Reduced the desktop narrative heading scale while preserving the 26px mobile scale.
- Darkened and desaturated the Studio raster under the content layer.

### Iteration 2

- Post-fix captures show the correct black header, two-line narrative hierarchy, character-led about imagery, six-card layout, and dark Studio banner.
- 390px, 768px, 1024px, and 1440px checks found no horizontal overflow, clipped heading, off-screen control, or console warning/error.
- No actionable P0, P1, or P2 findings remain.

## Primary interactions tested

- all four header links and four home anchors are present with the exact planned destinations
- novel and external OST/YouTube links expose valid destinations
- Google-only login forwards `next=/mv-studio`
- login contains no password field, Kakao action, signup action, or account-edit action
- browser console warning/error count: 0

## Follow-up polish

- None required for this release. Real artwork/title-length variation is an accepted content difference, not layout drift.

final result: passed
