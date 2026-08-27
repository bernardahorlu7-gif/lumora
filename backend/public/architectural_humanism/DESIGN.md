---
name: Architectural Humanism
colors:
  surface: '#fcf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fcf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0ede9'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e5e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#444748'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c1b1a'
  on-tertiary-container: '#868382'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e6e2df'
  tertiary-fixed-dim: '#cac6c4'
  on-tertiary-fixed: '#1c1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
  ivory-surface: '#FDFCFB'
  sand-container: '#F2EDE4'
  deep-charcoal: '#121212'
  clay-muted: '#8C7E6D'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 56px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.4'
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 80px
  section-gap: 120px
---

## Brand & Style

The visual identity is defined by **Architectural Humanism**—a philosophy that balances the rigorous precision of structural design with the warmth of human-centric experience. It is professional and authoritative, yet grounded in the earthy textures of Ghana. The design avoids the sterile coldness of typical modernism, opting instead for a "premium-earthy" aesthetic that feels both established and inviting.

The style is a blend of **Minimalism** and **Tactile Humanism**. It utilizes generous whitespace and a strict architectural grid to convey expertise, while softening the experience through organic surface tones and high-end typography. The target audience is a discerning clientele who values both the legacy of craftsmanship and the efficiency of modern technology. The emotional response should be one of "Sturdy Comfort"—the feeling of being in a well-built, sun-drenched stone home.

## Colors

The palette draws inspiration from Ghanaian landscapes and premium architectural materials, moving away from stark digital whites toward warmer, more natural tones.

*   **Primary (Deep Charcoal/Black):** Used for primary text and structural elements. It provides the "weight" and permanence of the brand.
*   **Secondary (Architectural Gold):** A rich, non-metallic gold (#C5A059) used as a symbol of value and excellence. It is applied to key actions, accents, and brand moments.
*   **Neutral (Sand/Ivory):** The foundation of the system. Instead of pure white, the design system uses `#F9F6F1` and `#FDFCFB` to create a "warm-light" environment that reduces eye strain and feels more hospitable.
*   **Muted Clay:** A utility color used for borders and secondary information, ensuring the UI remains grounded and softer than a traditional grey.

## Typography

Typography is used to express the "Humanist" narrative. **Libre Caslon Text** provides an editorial, literary quality that feels established and refined. It is reserved for headlines to create a premium hierarchy.

**DM Sans** is used for all body copy and UI elements. Its low-contrast, geometric forms offer a modern, understated texture that balances the historical weight of the Caslon serifs. By using a modern sans-serif for functional text, the design system remains approachable and highly legible, even in data-heavy contexts. Label styles are set in uppercase with generous tracking to mimic architectural stamps and blueprints.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model for editorial content and a **Fluid Grid** for functional dashboards, both anchored by a 12-column system.

Spacing is "Generous and Welcoming." We intentionally use larger-than-standard margins and section gaps to give the content room to breathe, suggesting luxury through the "waste" of space. 

- **Desktop:** 80px margins create a centered, framed aesthetic. 
- **Mobile:** 20px margins ensure content doesn't feel cramped on smaller screens.
- **Rhythm:** An 8px linear scale governs all internal component spacing, while section headers utilize a "Double-Gap" (120px+) to clearly delineate different chapters of the user journey.

## Elevation & Depth

This design system eschews heavy shadows in favor of **Tonal Layers** and **Subtle Contrast**. 

Depth is primarily achieved through color stepping:
- **Level 0 (Background):** The Sand/Ivory base (#F9F6F1).
- **Level 1 (Cards/Surface):** The lighter Ivory Surface (#FDFCFB), creating a subtle lift.
- **Level 2 (Active Elements):** Architectural Gold or Deep Charcoal.

When shadows are necessary (such as for floating navigation or modals), use **Ambient Shadows**. These are extra-diffused, low-opacity (5-8%) shadows tinted with the primary Deep Charcoal color to ensure they feel like natural light falling on a physical surface rather than a digital effect. No harsh borders or high-contrast shadows are permitted.

## Shapes

The shape language is **Rounded**, reflecting the "Human" touch of the brand. By moving away from sharp, technical corners, the UI feels more organic and less "industrial."

- **Standard Elements:** Buttons, inputs, and cards use a `0.5rem` (8px) radius.
- **Large Containers:** Hero sections or large property images use `rounded-lg` (1rem) or `rounded-xl` (1.5rem) to create a soft, framed window effect.
- **Pill Elements:** Status indicators and tags may use fully rounded (pill) shapes to provide a distinct visual contrast to the otherwise rectangular grid.

## Components

### Buttons
Primary buttons are solid Deep Charcoal with Ivory text, featuring the standard 8px corner radius. Secondary buttons use an Architectural Gold border (1px) with Gold text. Hover states should involve a subtle shift in background warmth rather than aggressive color changes.

### Input Fields
Inputs use the Sand-toned background to blend into the layout. They feature a 1px border in Clay-Muted. On focus, the border transitions to Architectural Gold, and the label (in `label-caps`) provides clear guidance.

### Cards
Cards are the primary vehicle for property listings and portal data. They should have no visible borders; instead, they rely on the subtle shift from the Sand background to the Ivory surface and a very soft ambient shadow.

### Chips & Tags
Used for status (e.g., "Available", "Under Construction"). These should use muted, earthy tones—sage greens, terracotta oranges, or slate blues—to maintain the "Ghanaian Humanism" aesthetic without introducing "neon" digital colors.

### Lists & Tables
In the staff portal, lists use generous row heights (at least 56px) and thin, 1px horizontal dividers in a 10% opacity Charcoal. The `body-md` type provides clear legibility for data.