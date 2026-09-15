# XTRAGRID interaction and motion audit

Baseline audited: `main` at `e3e7417`, plus the live GitHub Pages build on 15 September 2026.

## Site-wide systems

- **Sticky navigation:** stays fixed, changes surface after 40px of scroll, and switches to a full-screen clip-path menu below the desktop breakpoint. Opening the menu locks page scroll. Retained, with a compact X mark in the condensed/mobile state and a lighter blurred surface.
- **Navigation and CTA hovers:** underline strokes grow leftward; circular arrow controls rotate or recolor; footer links pick up the page accent. Retained and upgraded with pointer-aware magnetic motion on fine-pointer devices.
- **Anchor scrolling:** native smooth scrolling is enhanced by Lenis on the homepage. Retained and extended consistently to every page.
- **Scroll reveals:** `.reveal` elements use IntersectionObserver to move upward and fade into view. Retained as an accessible fallback; upgraded headings use scroll-linked word movement while remaining visible in static screenshots.
- **Reduced motion:** existing CSS disables smooth scrolling, hero entrances, ticker motion, and complex homepage sequences. Retained and expanded to every new transform, tilt, snap, and connecting-thread effect.
- **Responsive behavior:** desktop navigation collapses to a menu; large grids collapse; the homepage horizontal track becomes a vertical stack when motion is reduced. Retained, with the same static behavior also used on small touch screens where pinned effects would be costly.

## Homepage

1. **Opening experience:** a timed XTRA GRID title and rule animate before the page is revealed. Purpose: brand arrival and asset-loading cover. Retained with the new light lockup and softer exit.
2. **Hero image and headline:** the background slowly settles from a slight zoom; four headline lines rise into place. Purpose: establish the energy/infrastructure world immediately. Retained; the headline becomes the requested script statement, and the media receives scroll depth plus desktop pointer tilt.
3. **POWER portal / WebGL globes:** two Three.js canvases render a rotating, gridded Earth. Scroll expands a POWER-shaped SVG aperture, crossfades to a large XTRA GRID title, then moves into a location globe with a Kerala marker. Pointer movement subtly tilts the globe; IntersectionObserver pauses rendering when off-screen; CSS supplies a texture fallback. Purpose: connect global energy systems to XTRAGRID and Kerala. Retained and recolored for the light editorial system, with blue/green lighting and gentler depth.
4. **Demand curve:** ScrollTrigger draws the SVG line and moves its marker from off-peak storage toward peak deployment. Purpose: explain demand shifting. Retained with the new brand gradient and soft panel elevation.
5. **Horizontal solutions:** one pinned GSAP timeline moves six full-width solution panels horizontally while a counter and progress line update. Purpose: preserve the 01/06 through 06/06 solution narrative in a deliberate sideways journey. Retained; wheel motion remains Lenis-smoothed, plus soft magnetic snap points and independent image/text parallax.
6. **BESS energy story:** a pinned seven-step GSAP timeline crossfades generation, storage, charge, time, demand, deploy, and power copy. In parallel it fills the battery meter, advances a dashed energy path, and updates the phase/counter. Purpose: explain the system flow without changing the diagram. Retained; transitions receive eased blur/depth and the global brand thread carries through the pin.
7. **Store the day:** a pinned timeline moves a sun marker, darkens the solar photograph, tightens the image scale, and updates phase labels from day through powering load. Purpose: show generation, storage, and later deployment over time. Retained with smoother interpolation and a framed white-surface handoff.
8. **Company statement:** staggered reveal and offset lines create a typographic change of pace. Purpose: state the integrated company position. Retained with scroll-linked transforms on the light system.
9. **Director preview cards:** portrait color/contrast changes on hover and the cards lift against a darker panel. Purpose: humanize leadership while keeping equal hierarchy. Retained on a light editorial grid, with cursor-aware highlight and subtle image depth.
10. **Contact handoff:** oversized statement plus underlined circular CTA. Purpose: close the narrative with a clear business action. Retained, with its own magnetic interaction and no hard background cut.

## Solution, Company, and Contact pages

- **Energy-storage exploded cabinet:** the enclosure sits in a perspective scene; hovering opens the cabinet door, rotates the body, and separates five battery modules in depth. Purpose: reveal the modular system architecture without replacing the existing explanatory list. Retained and upgraded with scroll-reactive depth, the original hover inspection, and a static reduced-motion state.
- **Hero entrance:** split lines rise while the hero image slowly settles from a slight zoom. Retained; media gains pointer depth on desktop and the layout uses the shared warm-white system.
- **Capability cards:** accent color wipes upward on hover. Retained as a restrained blue-to-green wash with elevation and cursor-aware highlight.
- **Ticker:** repeated capability labels move continuously. Retained, softened, and disabled under reduced motion.
- **Process rows and content reveals:** rows reveal on entry and keep their numbered sequence. Retained with scroll-linked word motion on major statements.
- **Company director cards:** portraits scale and regain saturation on hover; tags and equal-width layout communicate equal standing. Retained with consistent white cards and soft shadows.
- **Page progress line:** width follows document scroll. Retained using the brand gradient.
- **Contact form:** submission prevents network sending, copies a formatted enquiry to the clipboard, shows status text, and resets. Retained unchanged.

No audited interaction is removed. Where touch or reduced-motion settings make continuous motion inappropriate, the same content remains fully visible in a static, vertical presentation.
