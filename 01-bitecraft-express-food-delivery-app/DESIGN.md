---
name: BiteCraft Express
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#5c4037'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#916f65'
  outline-variant: '#e6beb2'
  surface-tint: '#ae3200'
  primary: '#aa3000'
  on-primary: '#ffffff'
  primary-container: '#d43f00'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59e'
  secondary: '#b6171e'
  on-secondary: '#ffffff'
  secondary-container: '#da3433'
  on-secondary-container: '#fffbff'
  tertiary: '#845000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a56600'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59e'
  on-primary-fixed: '#3a0b00'
  on-primary-fixed-variant: '#852400'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb3ac'
  on-secondary-fixed: '#410003'
  on-secondary-fixed-variant: '#930010'
  tertiary-fixed: '#ffddba'
  tertiary-fixed-dim: '#ffb865'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#663d00'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '800'
    lineHeight: 12px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-sm: 0.75rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an energetic, high-velocity culinary commerce experience built for rapid conversion and appetite appeal. Tailored for dynamic, fast-casual ordering workflows, the interface balances precision transactional utility with hyper-sensory food merchandising. 

The aesthetic style merges **Modern High-Contrast** typography with tactile, layered **Tonal Warmth**:
- High-contrast visual hierarchy prioritizing hero food photography, clear delivery tracking metrics, and immediate order actions.
- Uncluttered, high-gloss micro-surfaces with fluid feedback that convey speed, freshness, and reliability.
- Purposeful micro-interactions with spring-based dampening for cart increments, status updates, and checkout velocity.

## Colors

The palette employs an appetite-stimulating spectrum anchored by high-visibility functional hues:

- **Primary (`#FF4D00` - Electric Orange):** Drives the primary purchase funnel, including sticky checkout triggers, quantity selectors, live delivery route progress, and critical promotional banners.
- **Secondary (`#D32F2F` - Deep Crimson):** Reserved for urgent order escalations, high-priority discounts, spice heat ratings, and destructive or cancellation actions.
- **Tertiary (`#FFA000` - Warm Amber):** Highlights rewards milestones, star ratings, express courier badges, and preparation stage alerts.
- **Neutral Palette:** 
  - Pure Ground: `#FFFFFF` for pristine card elevation and maximum contrast against food imagery.
  - Base Canvas: `#F8F9FA` for clean page separation without harsh glare.
  - Deep Surface / Typography: `#111111` ensures WCAG AAA text contrast and establishes bottom navigation chrome.
  - Dark Surface Variant: `#1A1A1A` provides contrast containers, order receipts, and driver tracking sheets.

## Typography

The typographic hierarchy utilizes **Plus Jakarta Sans** across all roles to ensure geometric clarity and approachable warmth. 

- **Display & Headlines:** Heavy weights (700–800) with slight negative tracking create dense, readable food menu titles and pricing callouts that command immediate attention on mobile viewports.
- **Body:** Neutral weights (400–500) provide high legibility for meal modifiers, ingredient manifests, and address details.
- **Labels & Numbers:** Bold, slightly tracked uppercase and title-cased labels standardise delivery ETAs, calorie counts, dietary badges, and cart tallies.

## Layout & Spacing

The layout is built around a mobile-first 4-column grid (transitioning to 8 columns on tablet and 12 columns on desktop web instances), optimized for thumb navigation and rapid vertical scanning:

- **Mobile Rhythm:** 16px screen margins ensure dense spatial utility while preventing clipped tap targets. Feed lists and horizontal carousels bleed to the edge with trailing edge padding.
- **Vertical Hierarchy:** Strict 8px baseline rhythm across layout gaps (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 16px, `space-lg` = 24px, `space-xl` = 32px).
- **Safe Areas & Chrome:** Fixed bottom surfaces reserve dynamic bottom-padding for hardware home bars and sticky order trays.

## Elevation & Depth

Visual hierarchy uses warm, ambient diffusion paired with subtle border containment:

- **Level 0 (Base Canvas):** Flat `#F8F9FA`.
- **Level 1 (Menu Item Cards):** Pure `#FFFFFF` surface accompanied by a hairline 1px border (`rgba(17, 17, 17, 0.06)`) and an ultra-soft ambient shadow (`box-shadow: 0 4px 16px -2px rgba(17, 17, 17, 0.05)`).
- **Level 2 (Floating Cart Bar & Modal Sheets):** `#FFFFFF` or `#1A1A1A` elevated via deep directional diffusion (`box-shadow: 0 8px 32px -4px rgba(17, 17, 17, 0.12), 0 2px 8px -2px rgba(17, 17, 17, 0.04)`).
- **Level 3 (Primary CTAs & Toast Overlays):** Dynamic orange-tinted drop-shadows on interactive states (`box-shadow: 0 8px 24px -4px rgba(255, 77, 0, 0.35)`).

## Shapes

The design system utilizes rounded geometric profiles that mirror the friendly, approachable nature of food culture:

- **Product & Restaurant Cards:** Standardized on `rounded-lg` (16px) for standard menu cards and `rounded-xl` (24px) for hero promotional cards and bottom sheet drawers.
- **Controls & Buttons:** 12px for compact actionable controls; full-radius pill styling (`9999px`) for floating quick-action buttons, filter chips, and primary sticky CTAs.
- **Status Badges & Steppers:** Fully rounded pill shapes to accentuate fluid, non-destructive data presentation.

## Components

### Buttons
- **Primary Action (Add to Cart / Checkout):** Solid `#FF4D00` fill, white text, 52px height, full pill radius (`9999px`), bold label. Active press yields a 0.98 scale transform with an orange ambient glow.
- **Secondary Action (Customization / Add Instructions):** Flat `#F8F9FA` fill with `#111111` text, 44px height, 12px corner radius.
- **Destructive Action:** `#D32F2F` background or text variant with crimson tinted focus states.

### Chips & Filter Pills
- **Filter Chips:** 36px height, pill radius. Unselected: `#FFFFFF` fill with 1px `rgba(17,17,17,0.1)` border. Selected: `#111111` fill with `#FFFFFF` text and active counter dot.
- **Dietary & Spicy Badges:** Compact 24px height, light tinted background fills (`#FF4D00` at 10% opacity) with solid contrasting iconography.

### Cards
- **Meal Cards:** White background, 16px–24px corner radius, full-bleed 16:9 or 1:1 image container with rounded upper boundaries. Bottom metadata section houses item title, price in bold, prep time, and a floating `+` quick-add button.
- **Live Tracker Cards:** High-contrast `#1A1A1A` card with `#FFFFFF` text, showcasing an animated progress ring in `#FF4D00` and live ETA readout.

### Input Fields & Steppers
- **Search Inputs:** Pill-shaped, 48px height, `#FFFFFF` surface with subtle border, leading search icon, trailing microphone or filter shortcut.
- **Quantity Steppers:** Integrated pill container (`#F8F9FA`), containing subtle circular tap surfaces with bold minus/plus iconography and centered quantity counter.

### Checkboxes & Radio Buttons
- Custom circular selection nodes featuring `#FF4D00` active fill with crisp white checkmark or inner dot; inactive borders feature low-contrast 1.5px `#111111` at 20% opacity.

### Chrome & Navigation
- **Bottom Navigation Bar:** Grounded on a deep `#111111` surface or frosted pure white acrylic (`backdrop-filter: blur(20px)`), with 64px content height, centered express order bubble, and minimal stroke icons.
- **Live Status Header Bar:** Top notification banner in `#FFA000` or `#FF4D00` featuring micro-pulsing delivery vehicle animations.