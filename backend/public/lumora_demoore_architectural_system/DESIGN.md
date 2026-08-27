---
name: Lumora DeMoore Architectural System
colors:
  surface: '#fcf8f8'
  surface-dim: '#ddd9d9'
  surface-bright: '#fcf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f1eded'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#44474a'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#75777a'
  outline-variant: '#c5c6ca'
  surface-tint: '#5d5e61'
  primary: '#000101'
  on-primary: '#ffffff'
  primary-container: '#1a1c1e'
  on-primary-container: '#838486'
  inverse-primary: '#c6c6c9'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#000101'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1e'
  on-tertiary-container: '#838486'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e5'
  primary-fixed-dim: '#c6c6c9'
  on-primary-fixed: '#1a1c1e'
  on-primary-fixed-variant: '#454749'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e2e2e5'
  tertiary-fixed-dim: '#c6c6c9'
  on-tertiary-fixed: '#1a1c1e'
  on-tertiary-fixed-variant: '#454749'
  background: '#fcf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  headline-sm:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  data-tabular:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max-width: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The visual identity is anchored in the concept of "Structural Elegance." This design system balances the heritage and stability of a premier construction firm with the precision of modern architectural practice. It is designed to evoke trust through meticulous alignment, intentional whitespace, and a high-contrast editorial aesthetic.

The style is **Premium Minimalist**. It avoids superfluous decoration, instead using fine lines (1px), generous gutters, and sophisticated typography to communicate value. The interface should feel like a high-end architectural blueprint: organized, deliberate, and expensive.

For the **Public Website**, the system prioritizes immersive, full-bleed imagery and "breathing room" to showcase property scale. For the **Staff Portal**, the system shifts into a high-density utilitarian mode, maintaining the same color and typographic DNA while optimizing for data clarity and administrative efficiency.

## Colors

The palette is rooted in architectural materials: charcoal steel, slate stone, and metallic gold accents.

*   **Primary (#1A1C1E):** Deep Charcoal. Used for headlines, primary navigation, and high-impact UI elements. It provides the "weight" of the brand.
*   **Secondary (#C5A059):** Refined Gold. Used sparingly for primary calls to action, active states, and highlights of excellence. It represents the premium nature of the service.
*   **Tertiary (#454749):** Architectural Slate. Used for secondary text, borders, and icon states to provide a softer contrast than the primary charcoal.
*   **Neutral/Background (#FFFFFF & #F8F9FA):** A "Blueprint White" foundation. Surfaces use the off-white tint to differentiate between the page background and containerized content in the Staff Portal.

## Typography

This design system utilizes a high-contrast typographic pairing to reflect the firm's dual nature: traditional stability and modern precision.

*   **Headlines (Libre Caslon Text):** A classic serif that brings a literary, authoritative tone to the brand. Use for all major section headings and property titles.
*   **Body & UI (Hanken Grotesk):** A sharp, contemporary sans-serif. It is used for all functional text, body copy, and data-heavy tables. Its high x-height ensures legibility in the Staff Portal's complex quotation builders.
*   **Labels:** Use `label-caps` for small identifiers, table headers, and overlines. The increased letter spacing adds an architectural, "stamped" feel to the interface.

## Layout & Spacing

The layout is built on a **12-column grid** with a strict 8px rhythmic scale. 

*   **Public Site:** Employs a "fixed-centered" grid with wide margins (64px+) to create an editorial feel. Vertical spacing between sections should be aggressive (120px - 160px) to maintain the premium architectural aesthetic.
*   **Staff Portal:** Transitions to a "fluid" grid with reduced margins (24px) and tighter vertical rhythm (32px - 48px). This allows for maximum data density without sacrificing the clean, professional look.
*   **Alignment:** All elements must align to the baseline grid. Tables should use a consistent 12px or 16px cell padding to ensure financial data is scannable.

## Elevation & Depth

This system uses **Tonal Layers** and **Soft Depth Shadows** rather than aggressive elevation.

*   **Flat Foundation:** The primary interface remains flat, using 1px borders in Slate (#454749) at 20% opacity to define boundaries.
*   **Subtle Elevation:** For cards and floating modals, use an "Ambient Shadow": a very soft, multi-layered shadow with a large blur radius and low opacity (e.g., `box-shadow: 0 10px 30px rgba(26, 28, 30, 0.05)`).
*   **Depth through Tone:** Use the off-white surface color (#F8F9FA) to sit "behind" white content cards in the portal, creating visual hierarchy without relying on shadows.

## Shapes

The shape language is **precise and geometric**. 

The default roundedness is set to `1` (4px / 0.25rem). This subtle softening prevents the UI from feeling "sharp" or "hostile" while maintaining the rigid professional integrity of an architectural firm. 

*   **Buttons & Inputs:** Use the standard 4px radius. 
*   **Property Image Containers:** May remain at 0px (sharp) for a more "framed" gallery effect.
*   **Selection States:** Use subtle background fills with the same 4px radius to highlight active rows in the Staff Portal.

## Components

*   **Buttons:** 
    *   *Primary:* Solid Charcoal (#1A1C1E) with White text.
    *   *Secondary:* Ghost style with a 1px Gold (#C5A059) border and Gold text.
    *   *Tertiary:* Text-only with an underline on hover.
*   **Inputs & Forms:** Field labels use `label-caps`. Input borders are 1px Slate (#454749) at 30% opacity. On focus, the border transitions to Gold (#C5A059).
*   **Staff Portal Tables:** Use a "zebra-striping" approach with the off-white surface color. Headers use `label-caps` in the Slate color. Columns containing currency should use the `data-tabular` font variant for perfect alignment.
*   **Quotation Builder:** A multi-step stepper component using the Gold accent for the "active" step and Charcoal for "completed" steps.
*   **Property Cards:** Use a minimal layout with a large image, a Libre Caslon headline, and a Slate-colored `body-sm` for the location/price. No heavy borders; use white space to separate cards.
*   **Chips/Status Tags:** Small, rectangular tags with 2px radius. Use low-saturation background tints (e.g., light sage for "Active", light amber for "Pending") to keep the focus on the data.