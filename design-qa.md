# SunoFox Official Site Design QA

- source visual truth (desktop): `docs/design-references/exec-74d198d4-6540-492d-b792-fe9732d0732b.png`
- source visual truth (mobile): `docs/design-references/exec-e539dbb9-585a-4655-b4e2-8760bc6180a4.png`
- combined desktop comparison: `docs/design-references/comparison-desktop-improved.png`
- combined mobile comparison: `docs/design-references/comparison-mobile-improved.png`
- viewports: 1440 × 900, 1024 × 844, 768 × 844, 390 × 844
- state: public home, no authentication

## Full-view comparison evidence

The approved desktop/mobile references and the matching implementation captures were placed in the same comparison images before judgment. Sequential captures cover the fixed header, hero, novel, channel/production flow, all six filmography cards, Studio panel, and footer without the compositor repetition caused by a fixed-header full-page capture.

Implementation evidence:

- `implementation-desktop-top-improved-1440.png`
- `implementation-desktop-novel-improved-1440.png`
- `implementation-desktop-about-improved-1440.png`
- `implementation-desktop-filmography-improved-1440.png`
- `implementation-desktop-studio-improved-1440.png`
- `implementation-mobile-top-improved-390.png`
- `implementation-mobile-about-improved-390.png`
- `implementation-mobile-filmography-improved-390.png`
- `implementation-mobile-studio-improved-390.png`

## Required fidelity surfaces

- Layout: fixed black header, full-bleed dark hero, continuous numbered timeline, alternating image/copy chapters, six-work desktop row, two-column mobile posters, dark Studio panel, and legal-only footer match the approved hierarchy.
- Typography: Noto Sans KR and Noto Serif KR remain the only families. The novel and channel headings use deliberate line spans, so no Korean orphan syllable or concatenated word remains.
- Spacing: anchor targets now land 72px below the viewport top; the previous double offset is removed. At the document end, the Studio anchor follows the browser's normal end-of-page clamp.
- Colors: the complete page canvas, including the footer gutters, resolves to `rgb(5, 5, 9)` / `#050509`; pink, amber, off-white, and muted gray retain the approved palette.
- Assets: visible imagery uses real SunoFox artwork and official thumbnails. Content-image and title differences from the concept board are the explicitly permitted production-content substitutions.
- Responsive behavior: 390px, 768px, 1024px, and 1440px have no horizontal overflow, clipped heading, or off-screen control. Mobile navigation uses 10px labels with 44px touch targets.
- Accessibility: semantic landmarks/headings, keyboard focus, external-link rel values, reduced-motion behavior, and touch target sizing remain present.

## Comparison history

### Audit findings before remediation

- [P1] Header anchors landed 144px below the viewport because `scroll-padding-top` and `scroll-margin-top` were both applied.
- [P1] The desktop channel title wrapped to four lines instead of the approved two-line composition.
- [P1] Mobile copy rendered `완성하는감정의` because a structural line break was hidden.
- [P1] A legacy paper background produced light gutters outside the dark footer.
- [P2] The VIDEO flow description wrapped differently from the other three items.
- [P2] Mobile header labels were 9px with 40px targets.
- [P2] The novel title could leave an isolated final syllable at some desktop widths.

### Remediation and final pass

- Forced the official-home canvas to the brand black without affecting other pages.
- Removed the duplicate chapter scroll offset.
- Added stable, semantic title-line spans and widened only the About narrative column.
- Balanced all four production-flow description measures.
- Increased mobile navigation readability and target height.
- Added `scripts/check-official-layout-contract.mjs` so these regressions fail the test suite.
- Rechecked the combined desktop/mobile comparisons and intermediate responsive widths after the fixes.
- Browser console warning/error count: 0.
- No actionable P0, P1, or P2 visual differences remain. Real artwork/title variation is the approved content exception.

## Primary interactions checked

- all four header destinations and home section IDs
- exact six-work filmography contract
- direct Studio login destination with `next=/mv-studio`
- keyboard-visible focus treatment
- no horizontal scroll at all required viewports

final result: passed
