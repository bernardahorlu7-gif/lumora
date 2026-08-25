---
name: Aethelgard Architectural
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
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#d0cdcd'
  on-tertiary: '#303030'
  tertiary-container: '#b4b2b2'
  on-tertiary-container: '#454545'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Metrophobic
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Metrophobic
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Metrophobic
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.2em
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 32px
  margin-desktop: 80px
  margin-mobile: 24px
  section-gap: 160px
---

## Brand & Style
The design system is engineered for the high-end architectural and property development sector. It evokes a sense of permanent authority, precision, and quiet luxury. The brand personality is "The Master Builder"—knowledgeable, meticulous, and uncompromising.

The visual style is **High-Contrast Minimalism** blended with **Editorial Elegance**. It utilizes expansive negative space to allow high-resolution architectural photography to serve as the primary visual driver. Layouts are governed by a strict structural grid, mirroring the discipline of a blueprint. The emotional response is one of absolute trust, exclusivity, and monumental quality.

## Colors
The palette is rooted in a "Noir-Industrial" aesthetic. 

- **Deep Black (#0F0F0F):** The foundational canvas, providing a sense of infinite depth and premium exclusivity.
- **Metallic Gold (#D4AF37):** Used sparingly as a "precision strike" color for critical CTAs, active states, and brand signatures. It represents excellence and the "specialist finishing" mentioned in the brand pillars.
- **Charcoal & Architectural Grays:** These provide the structural hierarchy for surfaces and borders, preventing the UI from feeling flat while maintaining a monochromatic sophistication.

## Typography
Typography follows a strict hierarchical contrast between the classical Serif and the technical Sans-Serif.

- **Headlines:** Uses *Playfair Display*. This font brings an editorial, high-fashion quality to architectural titles. Large headings should use tight letter spacing for a "locked-in" look.
- **Body & Technical Specs:** Uses *Metrophobic*. This sans-serif is chosen for its geometric, structured feel that mimics technical drawings and architectural plans.
- **Labels:** Always set in uppercase with generous tracking (0.2em) to denote "Categories" or "System Status," reinforcing a sense of organized precision.

## Layout & Spacing
The layout uses a **12-column Fixed Grid** for desktop, centered within the viewport. To reflect architectural grandeur, white space (negative space) is treated as a premium material. 

- **Section Gaps:** Large vertical gaps (160px+) are encouraged between major content blocks to give imagery "room to breathe."
- **Alignment:** All elements must align to the grid edge. Use asymmetrical layouts where imagery occupies 8 columns and text occupies 4 to create a modern, rhythmic flow.
- **Mobile:** Reflow to a single-column stack with 24px side margins. Typography scales down significantly to maintain the "monumental" ratio of whitespace to text.

## Elevation & Depth
In this design system, depth is conveyed through **Tonal Layering** rather than traditional shadows.

- **Level 0 (Base):** Deep Black (#0F0F0F). Used for the main page background.
- **Level 1 (Surfaces):** Charcoal (#1A1A1A). Used for cards and secondary sections.
- **Stroke-based Definition:** Instead of shadows, use 1px "Architectural Outlines" in #2D2D2D to define boundaries. 
- **Hover States:** When a user interacts with a card, the border should transition to Metallic Gold (#D4AF37) with a subtle "inner glow" to simulate lighting hitting a physical material.

## Shapes
The shape language is **Sharp and Structural**. 

All buttons, cards, input fields, and images must have a 0px border radius. This reinforces the architectural theme of "structure" and "beams." Roundness is avoided to maintain an atmosphere of professional rigidity and strength. Decorative elements, such as hairline separators, should be used to define structural axes.

## Components

### Buttons
- **Primary:** Solid Metallic Gold (#D4AF37) with Black text. Sharp corners. No shadows. High-density padding (16px 32px).
- **Secondary:** Transparent with a 1px Gold border. Text is Gold.
- **Tertiary/Ghost:** Text only, followed by a thin horizontal line that extends on hover.

### Service Cards
- **Visuals:** Large background image with a 40% black overlay.
- **Interaction:** On hover, the image scales slightly (1.05x) and the Metallic Gold border fades in. Text transitions from gray to white.

### Process Timelines
- Use a vertical 1px line (Charcoal). 
- Active stages are marked by a small Gold square (not a circle).
- Technical data is displayed in Metrophobic at a small scale (label-caps).

### Form Fields
- Underline-only style. A 1px Charcoal line that turns Gold on focus.
- Labels are persistent and positioned above the line in `label-caps` style.

### Architectural Imagery
- All images should have a slight desaturation to match the Noir aesthetic.
- Aspect ratios should be consistent: 16:9 for banners, 4:5 for project spotlights.