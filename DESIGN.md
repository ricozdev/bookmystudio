# BookMyStudio — Design System & Architecture Specification

Generated & Validated via **UI/UX Pro Max Intelligence**
Target: Creative-Production & Studio Marketplace (Web & Mobile)

---

## 1. Product Identity & Philosophy

**BookMyStudio** is a high-craft creative-production marketplace built for directors, cinematographers (DPs), commercial producers, still photographers, agency art directors, and production coordinators.

It enables verified discovery, spec comparison, and commercial booking for:
1. **Commercial Production Studios**: 1- & 2-wall seamless cycloramas, soundstages with STC 60+ acoustic isolation, daylight lofts with factory sash windows, and culinary kitchen stages.
2. **Filming Locations**: Raw industrial brick warehouses, landmark cast-iron lofts, open deep-water maritime piers, and skyline rooftops permitted for production.
3. **Verified Heads of Department (HOD) & Crew**: Insured IATSE Local 52/600/798 Gaffers, DPs, Sound Mixers, Wardrobe Stylists, and Hair/Makeup Dept Heads.
4. **Turnkey Cinema Packages & Grip**: ARRI Alexa 35 systems, high-output color LEDs (Aputure CS15), Sound Devices multi-track recorders, and hydraulic dollies (J.L. Fisher 10).

> **CRITICAL DIRECTIVE**: This is NOT a movie-ticket booking platform or cinema website.
> Never use cinema seat maps, movie posters, theater showtimes, ticket barcodes, or cinema-booking conventions.
> Every interaction must reflect the physical realities of commercial film and photo production: 10-hour shoot day rules, 3-phase camlock power, rigging grid heights, drive-in truck access, direct production insurance ($2M COI), and union roster credits.

---

## 2. Visual Direction & Brand Tokens

The visual identity is **Editorial, Cinematic, and High-Craft Minimalist**. It draws inspiration from high-end production equipment (ARRI, Cooke, Hasselblad, Sound Devices) and architectural studio environments: deep obsidian slates, crisp gallery whites, micro-textured borders, and a warm tungsten/amber accent (`#D97706` / `#F59E0B` / `#EA580C`) that evokes 3200K tungsten studio lighting, camera recording tallies, and warm analog film stock.

### Strict Anti-Patterns (Enforced)
- ❌ NO generic purple, violet, or cyan AI gradients.
- ❌ NO floating blurred decorative background blobs (`float-blob`).
- ❌ NO randomly tilted floating cards (`-rotate-3`, `rotate-2`).
- ❌ NO fake reviews, fake ratings, or fabricated availability claims.
- ❌ NO repetitive identical card grids copy-pasted across distinct domains.
- ❌ NO oversized headings that push actionable discovery below the fold.
- ❌ NO bloated multi-layer glassmorphism or neon border glow.

---

## 3. Color Tokens (Dark-Only System)

BookMyStudio operates exclusively on a **Dark-Only (Soundstage / Control Room)** palette. Operating system preferences and legacy light-theme caches are permanently unified into this high-craft, cinematic aesthetic to prevent visual fragmentation and contrast inconsistencies.

| Token | Hex | Semantic Role |
|-------|-----|---------------|
| `--bg-page` | `#09090B` | Deep obsidian soundstage floor (primary canvas) |
| `--bg-page-subtle` | `#0E0E12` | Sub-level section backdrop |
| `--bg-surface` | `#121216` | Card, container, and modal surface |
| `--bg-surface-secondary` | `#18181E` | Filter inputs, pill badges, and elevated cards |
| `--bg-surface-elevated` | `#1D1D24` | Menus, popovers, drawers, and floating panels |
| `--bg-surface-hover` | `#22222B` | Interactive hover surface |
| `--text-primary` | `#FAFAFA` | High-contrast crisp white typography (headings & primary body) |
| `--text-secondary` | `#A1A1AA` | Secondary specs, technical parameters, and labels |
| `--text-muted` | `#71717A` | Tertiary helper text and subtle captions |
| `--border-subtle` | `#27272A` | Crisp razor dividers and card perimeters |
| `--border-hover` | `#3F3F46` | Focused and active border enhancement |
| `--accent-primary` | `#F59E0B` | Luminous Tungsten Amber (primary interactive CTA & key highlights) |
| `--accent-hover` | `#FBBF24` | Hover accent state |
| `--accent-subtle` | `#291D0A` | Warm dark badge background |
| `--accent-border` | `#78350F` | Dark amber border |
| `--status-success` | `#10B981` | Verification badges and confirmed status |
| `--status-warning` | `#F59E0B` | Curfews, hold warnings, and alerts |
| `--status-error` | `#EF4444` | Destructive actions and validation errors |

---

## 4. Typography System

The typography uses a contemporary, precision sans-serif scale:
- **Display Headings**: `font-extrabold tracking-tight leading-[1.12]` — confident, architectural.
- **Section Headings**: `font-bold tracking-tight text-xl sm:text-2xl lg:text-3xl`.
- **Card Titles**: `font-bold text-sm sm:text-base`.
- **Technical Specs**: `font-mono text-xs tracking-wider uppercase` — power, sq ft, dimensions.
- **Body & Prose**: `text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed`.
- **Captions & Micro-labels**: `text-[11px] font-semibold tracking-wide uppercase`.

---

## 5. Navigation & Information Architecture

### Value-First Landing Page Architecture (Non-Catalogue Model)

> **CORE PRINCIPLE**: The homepage is an editorial narrative explaining the platform's value proposition, not an inventory catalogue. All studio cards, equipment kits, location listings, and crew rosters live exclusively on their dedicated marketplace routes (`/studios`, `/locations`, `/crew`, `/equipment`).

The landing page follows an 8-part narrative sequence:
1. **Landing Hero**: Headline (*"Everything Your Production Needs. In One Connected Place."*), concise value copy, primary action (*"Plan Your Production"* -> `/studios`), secondary action (*"Explore How It Works"* -> `#how-it-works`), and an editorial production visual storytelling anchor showcasing the 4 connected production pillars.
2. **Production Problem Section**: Explains real-world friction (*"Coordinating a Commercial Shoot Shouldn't Require 20 Disconnected Tabs"*) comparing fragmented sourcing, opaque technical specs, and insurance friction with the BookMyStudio unified standard.
3. **Production Workflows Section**: Outlines real creative outcomes rather than catalogue grids (Commercial Film/Video, Fashion Lookbooks, Product/Culinary Tabletop, and Industrial Film Sets) with required stage specs, crew rosters, and turnkey packages.
4. **How It Works (4 Steps)**: Sequential narrative explaining: 01. Define Project Brief -> 02. Compare Verified Specs -> 03. Assemble Crew & Gear -> 04. Request Hold & Direct $2M COI.
5. **Value Propositions Section**: 6 concrete advantages (Connected Ecosystem, Measured Engineering Specs, Standard 10h Day, $2M Direct COI, Comparison Engine, Call Sheet Payroll Math).
6. **Two-Sided Marketplace Section**: Differentiated value propositions for Producers/Directors, Stage Owners/Operators, and Union Crew/Gear Houses with direct onboarding paths.
7. **Technical Clarity & Trust Section**: Verifying real on-set parameters (Camlock power, STC 60 acoustic isolation, true grid clearance, drive-in gates).
8. **Final Call to Action**: Crisp, purposeful closing (*"Your Next Production Starts Here."*) with direct triggers to plan production or list a facility.

### Desktop Header
1. **Brand**: Confident, minimalist vector aperture logo + `BOOKMYSTUDIO` wordmark (uncluttered, uppercase tracking).
2. **Central Navigation**: Airy, centered navigation with hardware-accelerated sliding indicator over 5 distinct marketplace destinations:
   - **Studios** (`/studios`)
   - **Locations** (`/locations`)
   - **Crew** (`/crew`)
   - **Equipment** (`/equipment`)
   - **About** (`/about`)
3. **Right Utility Cluster**:
   - **Host a Space**: Subtle text action for studio owners (`/list-your-studio`).
   - **Production Desk**: Consolidated drawer popover holding:
     - Saved Shortlist (`/saved`)
     - Stage Comparison Matrix (`/compare`)
     - Call Sheet Crew Roster (`/crew-list`)
     - $2M Direct Production Liability Insurance policy modal trigger
   - **Auth Controls**: Seamless account dropdown when authenticated, or crisp `Log In` link + `Get Started` high-contrast action button. (Theme toggle retired; application is permanently dark-only).

### Split Hero & Search Architecture
1. **Left Column (7 Columns)**:
   - Refined monospace category eyebrow: `COMMERCIAL PRODUCTION MARKETPLACE`.
   - Architectural 2-line display headline with controlled rhythm.
   - Concise supporting editorial copy explaining 10-hour day rates and verified cycloramas.
   - Structured Search Matrix with explicit hierarchy:
     - **Field 1 (WHAT)**: Space Archetype selector.
     - **Field 2 (WHERE)**: Production Hub & Market Location.
     - **Field 3 (WHEN)**: Shoot Day Shift call times (10h, 5h, 12h).
     - **Action**: High-contrast, prominent `Search Stages` button with text and icon.
   - Quiet, subordinate quick filter row (600A Camlock, Drive-in Bay, STC 60, North Daylight).
   - Single-line verified insurance policy footnote.
2. **Right Column (5 Columns)**:
   - **Production Visual Storytelling Anchor**: High-resolution editorial showcase of `Apex Soundstage 4` with overhead box truss grid, acoustic panels, and floor reflections.
   - **Anchored Technical Spec Plaque**: Exact dimensions (`5,500 sq ft`), rigging clearance (`24' Clear Grid`), electrical power (`600A 3-Phase Camlock`), acoustic isolation (`STC 60+ Certified`), and commercial day rate (`$2,800 / 10h`).
   - **Overlapping Detail Frame**: Secondary thumbnail preview of `The Greenpoint Cove` 2-wall cyclorama.

### Asymmetric Category Directory
- **Pillar 1 & 2**: Large horizontal cards for Cyclorama Studios (114 stages) and Soundstages (48 stages) with preview photography, technical badges, and direct links.
- **Pillars 3 - 6**: High-density cards for Daylight Lofts, Filming Locations, Union Production Crew, and Equipment Packages.

### Non-Intrusive Comparison Dock
- Fixed at bottom-right (`bottom-20 lg:bottom-6 right-4 sm:right-6`).
- **Collapsed State**: Elegant floating capsule pill with overlapping studio thumbnails, active count, and direct link to `/compare`. Never obstructs bottom navigation or cards.
- **Expanded State**: Opens upward into an accessible mini-drawer showing studio names, rates, and individual remove actions.

### Mobile Experience
1. **Top Bar**: Compact brand mark, search icon, and account avatar/button.
2. **Bottom Navigation**: 5 high-priority touch targets (min 44×44px):
   - **Discover** (`/`)
   - **Studios** (`/studios`)
   - **Locations** (`/locations`)
   - **Crew** (`/crew`)
   - **Saved** (`/saved`)
3. **Contextual Detail Bar**: On studio/location/crew/equipment detail pages, replaces crowded header with a clean "Back" chevron and route title, leaving maximum screen estate for photography and production specs.

---

## 6. Motion & Micro-interaction Tokens

- **Page Transitions**: Smooth route entrance animation (`opacity: 0, transform: translateY(6px)` to `opacity: 1, translateY(0)`) at 220ms.
- **Sliding Indicator**: Bezier curve `cubic-bezier(0.16, 1, 0.3, 1)` at 240ms for desktop navigation and filter tabs.
- **Card Hover**: Subtle `translateY(-3px)` with crisp border enhancement and elevation shadow (180ms).
- **Buttons**: `active:scale-[0.98]` tactile press response.
- **Accessibility**: `@media (prefers-reduced-motion: reduce)` immediately zeroes all transform and duration transitions.

---

## 7. Responsive Breakpoint Matrix

All pages, modals, sheets, and tables must be verified across:
- **320px** — Small iPhone SE / legacy mobile
- **360px** — Android compact
- **375px** — Standard iPhone 13 mini
- **390px** — Standard iPhone 14/15/16
- **414px / 430px** — iPhone Plus / Pro Max
- **768px** — iPad Mini / Tablet portrait
- **1024px** — iPad Pro / Tablet landscape / Small laptop
- **1280px** — Standard desktop
- **1440px+** — Wide desktop displays

---

## 8. Dedicated Authentication Architecture & UX Specification

### A. Distraction-Free Dedicated Shell
- **Suppression of Marketplace Shell**: Global marketplace navigation (`Header`), five-column footer (`Footer`), comparison floating dock (`ComparisonTray`), and mobile bottom bar (`MobileBottomNav`) are strictly suppressed on authentication routes (`/login`, `/create-account`, `/verify-email`, `/forgot-password`, `/reset-password`).
- **Dedicated Auth Top Bar**: Minimalist, high-craft brand aperture mark linking to `/`, accompanied by a direct "Return to Marketplace" route link. (Theme toggle retired; application is permanently dark-only). Eliminates duplicate branding and visual clutter.

### B. Balanced Proportions & Visual Storytelling
- **Form Column (Desktop 7 Cols / Mobile Full Width)**: Centered container (`max-w-[440px]`), balanced vertical padding, accessible field labels, 46px input heights, visible focus rings with tungsten amber brand accent.
- **Editorial Production Visual Column (Desktop 5 Cols)**: High-resolution soundstage photography (`Apex Stage C`) with rich cinematic grading, atmospheric vignette, and verified set engineering parameters (STC 60+ acoustic soundproof rating, 600A 3-phase Camlock power tie-in, $2,000,000 direct production insurance endorsement). No fabricated reviews or fake testimonial quotes.

### C. Developer Diagnostic Isolation
- Raw Supabase environment configuration warnings (`NEXT_PUBLIC_SUPABASE_URL`) are isolated from the normal customer experience.
- End-users receive professional, polite error messaging when backend services are offline.
- Developers in `development` mode have access to an unobtrusive developer diagnostic toggle and clean browser console warnings.

### D. Accessible Form Operations & OTP Verification
- Full autocomplete attributes (`autocomplete="email"`, `autocomplete="current-password"`, `autocomplete="new-password"`, `autocomplete="name"`).
- Accessible password show/hide toggles with descriptive `aria-label` states.
- 6-digit OTP verification input with auto-advance, backspace navigation, arrow key navigation, and full clipboard paste distribution.
- Real-time password strength indicators (8+ characters, numbers or symbols).
- Dynamic error summary blocks with `role="alert"` and `aria-live="polite"`.
