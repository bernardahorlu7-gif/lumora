---
name: Architectural Precision
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#e9c176'
  on-secondary: '#412d00'
  secondary-container: '#604403'
  on-secondary-container: '#dab36a'
  tertiary: '#cfcece'
  on-tertiary: '#2f3131'
  tertiary-container: '#b3b3b3'
  on-tertiary-container: '#444546'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 80px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0.05em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.1em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  grid-column-count: '12'
---

## Brand & Style

This design system embodies the intersection of high-end real estate and technical architectural mastery. The personality is authoritative, precise, and unapologetically premium, designed to evoke a sense of structural integrity and modern luxury for a discerning Ghanaian and international clientele.

The visual style is **Corporate Modern with Architectural Minimalism**. It utilizes a "Blueprint Aesthetic"—leveraging fine lines, grid-based alignments, and technical detailing to communicate the company's dual nature as both a developer and a builder. The UI should feel like a high-end physical portfolio: tactile yet digital, spacious yet structured. Use generous whitespace (negative space) to frame high-resolution photography of masonry, concrete textures, and finished structural steel.

## Colors

The palette is rooted in a deep, nocturnal foundation to emphasize the "Metallic Gold" accents, mimicking the way light hits a finished building at dusk.

- **Foundations:** Use `#0B0B0B` (Matte Black) for the primary canvas. Use `#121212` (Deep Charcoal) for elevated containers and `#181818` (Secondary Charcoal) for subtle section differentiation or hover states.
- **Accents:** Gold is used exclusively as a "Precision Element." It should appear in thin 1px borders, iconography, and small UI highlights. Avoid using Gold for large surface areas to maintain sophistication.
- **Typography:** Primary information uses `#FFFFFF`. Secondary body text uses `#E8E8E8` for better readability on dark backgrounds. Technical labels, metadata, and captions use `#A5A5A5` (Muted Silver).

## Typography

The typography strategy mirrors a modern architectural blueprint. **Plus Jakarta Sans** provides a geometric, high-impact presence for headings, suggesting strength and structural balance. **Manrope** is used for body text to ensure maximum legibility and a contemporary, technical feel.

For titles and section headers, utilize `uppercase` styling with increased `letter-spacing` (tracking) to evoke the feel of professional architectural labels. Display sizes should be used sparingly for hero sections to make a bold, ambitious statement.

## Layout & Spacing

The layout is governed by a **Fixed Grid System** that mimics an architectural drafting board. 

- **Grid:** Use a 12-column grid for desktop with 24px gutters. All elements should align strictly to these columns to reinforce the "precise" brand personality.
- **Margins:** Generous outer margins (64px+) on desktop create a "framed" gallery feel for property listings and corporate information.
- **Rhythm:** Use an 8px base unit for all internal padding and vertical rhythm. 
- **Architectural Lines:** Integrate 1px horizontal and vertical lines in `#C5A059` at 10-20% opacity to act as "guide wires" between major sections, visually connecting elements as if they are part of a singular structure.

## Elevation & Depth

In this design system, depth is not achieved through shadows, but through **Tonal Layering and Materiality**.

1.  **Base Layer:** `#0B0B0B` (The Foundation).
2.  **Raised Layer:** `#121212` with a subtle 1px border of `#181818` or a very faint `#C5A059` (15% opacity).
3.  **Glassmorphism:** For overlays or navigation bars, use a backdrop-blur (20px) with a semi-transparent `#121212` fill to maintain a sense of lightness and technical sophistication.
4.  **Lines over Shadows:** Use crisp, 1px gold lines to indicate interactive boundaries instead of heavy drop shadows. If a shadow must be used for a floating element (like a Modal), use a very large, ultra-soft, neutral-black shadow with 0% offset.

## Shapes

The shape language is **Strictly Geometric and Sharp (0px)**. 

To reflect the precision of construction and the hard edges of modern architecture, all buttons, input fields, cards, and image containers must have a 0px border radius. This creates a professional, "un-softened" aesthetic that differentiates the brand from casual consumer apps. Use 1px "technical corner" accents—small Gold L-shapes at the corners of high-profile images—to emphasize the architectural theme.

## Components

- **Buttons:** Primary buttons should be Ghost-style with a `#D4AF37` 1px border and White text. On hover, the button fills with `#D4AF37` and text changes to `#0B0B0B`. All transitions should be instantaneous or very fast (150ms) to feel "mechanical."
- **Input Fields:** Bottom-border only (1px `#A5A5A5`). When focused, the border transitions to `#D4AF37`. Floating labels should use the `label-sm` typography style.
- **Cards:** No shadows. Use a subtle `#121212` background. Include a "Tech Label" in the top right (e.g., "REF: LDM-004") using `label-sm` typography to enhance the professional tone.
- **Chips/Badges:** Rectangular with 0px radius. Use `#181818` background with `#E8E8E8` text.
- **Progress Indicators:** Use thin Gold lines. For property development stages, use a "Blueprint Trace" animation where the line appears to be drawn manually.
- **Iconography:** Use "Stroke" icons (Line icons) with a 1px weight. Never use filled icons.