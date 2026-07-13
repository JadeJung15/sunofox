# SunoFox Concept 02 Design QA

- source visual truth path: `docs/design-references/selected-concept-02-balanced-reading-rhythm.png`
- desktop implementation screenshot path: `docs/design-references/implementation-concept-02-desktop-1440.png`
- mobile implementation screenshot path: `docs/design-references/implementation-concept-02-mobile-390.png`
- desktop comparison evidence: `docs/design-references/comparison-concept-02-desktop.png`
- mobile focused comparison evidence: `docs/design-references/comparison-concept-02-mobile.png`
- desktop viewport: 1440px comparison export from the in-app browser desktop render
- mobile viewport: 390 × 844 in-app browser segments, assembled only to show the complete page flow
- state: public homepage, unauthenticated, default dark theme

## Full-view comparison evidence

The desktop comparison places the selected second concept on the left and the final browser-rendered implementation on the right. Both preserve the same section order, timeline alignment, split narrative imagery, open four-step production flow, 3 × 2 landscape filmography, producer-only Studio panel, and legal-only footer.

The implementation is about 5.6% taller after width normalization. This is an acceptable P3 difference caused by real Korean copy, the complete six-item metadata, and the production footer rather than a change in layout hierarchy. The section proportions and transitions remain visually equivalent.

## Focused region comparison evidence

The mobile comparison contains four 390 × 844 reference/current pairs in this order: Hero/Novel, About/production flow, Filmography, Studio. A separate focused pass was necessary because the desktop selected concept does not define every mobile scroll state and small card typography cannot be judged reliably from the desktop full-view image.

The in-app browser adds its own scrollbar and bottom control pill to screenshots. Those browser-surface marks are not part of the page and were excluded from design findings.

## Required fidelity surfaces

- Fonts and typography: Noto Sans KR and Noto Serif KR are retained. Desktop card titles are 18px and metadata 13px; mobile titles are 12px and metadata/actions 10px. Heading wrapping, line height, and optical weight match the selected hierarchy without truncation.
- Spacing and layout rhythm: Hero and narrative chapters were compacted to the selected proportions. The filmography is a three-column, two-row desktop grid and a two-column mobile poster grid. The timeline, chapter dots, margins, card gaps, and Studio closing rhythm remain aligned.
- Colors and visual tokens: `#050509`, `#ff5f96`, `#f6b86a`, off-white, and the existing muted neutrals map directly to the source. Contrast and focus-ring colors remain unchanged.
- Image quality and asset fidelity: Existing high-resolution SunoFox images are used. Hero, novel, About, and all six work images have intentional object-fit crops. The Studio panel now uses the existing warm headphone desk image and a close crop matching the selected concept. No placeholder, custom SVG art, CSS drawing, or fake asset was introduced.
- Copy and content: All six real titles, dates, content types, external/internal destinations, producer-only Studio notice, and legal footer remain complete and coherent.
- Icons: Official Phosphor bold Music Notes, Book Open, Image, Video, Play, Arrow Right, and Arrow Up Right icons are used consistently.
- Responsiveness: The 390px render has no visible horizontal overflow, clipped text, off-screen CTA, or collapsed grid. The 900px and 600px breakpoints preserve tablet and mobile layouts.
- Accessibility and interaction: Navigation and Studio links remain semantic anchors; the About menu link was clicked successfully and reached `/#about`. Studio resolves to `/login?next=/mv-studio`. Focus-visible, reduced-motion, alt text, touch-target, and external-link treatment remain present.
- Console: only Vite connection debug messages were recorded; no browser console errors were present.

## Comparison history

### Iteration 1 — blocked

- Earlier P1: six narrow desktop filmography columns made titles and metadata difficult to scan.
- Earlier P2: About flow, card metadata, and mobile card type were too small.
- Earlier P2: the Studio panel did not identify its producer-only audience.
- Fixes: changed desktop filmography to 3 × 2, increased card and flow typography, added numbered production steps, and added the producer-only Studio label and primary login CTA.
- Post-fix evidence: initial browser captures showed the intended information hierarchy, but the page remained about 19% taller than the selected composition.

### Iteration 2 — blocked

- Earlier P2: oversized chapter padding made the narrative and About sections materially taller than the selected composition.
- Earlier P2: the generic control-deck Studio image did not match the selected headphone subject.
- Fixes: compacted Hero and chapter heights, reduced image/section padding, tightened the filmography and closing rhythm, and switched the Studio background to the existing warm headphone desk asset with a close crop.
- Post-fix evidence: `comparison-concept-02-desktop.png` reduced normalized full-page height drift to about 5.6% and aligned all major section boundaries and image subjects.

### Iteration 3 — passed

- No actionable P0, P1, or P2 findings remain.
- Residual P3: the generated desktop concept shows a static pink underline under the Novel menu while the production header keeps neutral navigation across scroll states.
- Residual P3: real copy and footer make the implementation about 5.6% taller after width normalization.

## Primary interactions tested

- Four navigation links expose the exact approved destinations.
- Clicking `채널 소개` moved to `/#about` and aligned the section below the fixed header.
- Studio CTA exposes `/login?next=/mv-studio`.
- External content links retain new-tab security attributes.

## Implementation checklist

- [x] Selected second concept preserved in the repository.
- [x] Desktop 3 × 2 filmography and readable metadata.
- [x] Mobile 2 × 2 flow and two-column poster cards.
- [x] Producer-only Studio label and login destination.
- [x] Source and implementation opened together for full-view comparison.
- [x] Focused mobile regions opened together for comparison.
- [x] P0/P1/P2 issues fixed and recaptured.
- [x] Browser interactions and console checked.

final result: passed
