# Warrantify — Design Guidelines

Extracted from the Figma designs (Dashboard + Mail Reminders screens) with auto-layout details.

---

## 1. Color Palette

### Backgrounds
| Token | Hex | Usage |
|---|---|---|
| `bg-page` | `#f3f1fa` | Page/app background (light lavender) |
| `bg-panel` | `#f8f6ff` | Cards, sidebar groups, content panels |
| `bg-inner` | `#f0eef7` | Inner cards, reminder list items |
| `bg-inner-border` | `#d5d3db` | Border on selected/active inner card (2px solid) |

### Text
| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#000000` | Page titles, section headers, key values |
| `text-secondary` | `#706478` | Product names, body text, brand names |
| `text-muted` | `#9c9ba1` | Labels ("Product", "Price", "Expiring on") |
| `text-chip-inactive` | `#887991` | Inactive filter chip text |

### Status Colors
| Status | Background | Text |
|---|---|---|
| Active | `#d3ebde` | `#009f47` |
| Expiring / Today | `#ffd6d6` | `#e80000` |
| Expired | `#d4d2de` | `#6d6b76` |
| Alert banner | `#ffe4e4` | `#8a898f` (body), `#000` (title) |

### Interactive
| Token | Hex | Usage |
|---|---|---|
| `btn-primary` | `#7d7086` | CTA buttons ("New product"), active nav icon bg |
| `btn-primary-text` | `#ffffff` | CTA button text |
| `chip-active-bg` | `#706478` | Active filter chip ("All") |
| `chip-active-text` | `#ffffff` | Active filter chip text |
| `chip-inactive-bg` | `#e7e4ee` | Inactive filter chip ("Unread", "Read") |
| `filter-icon-bg` | `#e1e0e8` | Filter icon container |
| `reminder-success` | `#009f47` | Reminder sent checkmark icon bg |
| `reminder-danger` | `#e80000` | Warranty expired icon bg |

---

## 2. Typography

**Font families:**
- Brand/logo: `Roboto Medium`
- All UI text: `Inter Medium`

**Scale:**

| Use | Size | Weight | Tracking | Example |
|---|---|---|---|---|
| Brand name | 32px | 500 | -0.64px | "Warrantify" |
| Page title | 32px | 500 | -0.64px | "Dashboard", "Mail Reminder" |
| Section header | 24px | 500 | -0.48px | "Expiring soon", "Active Warranty" |
| Sub-header | 20px | 500 | -0.4px | "Product Information", "200 days" |
| CTA button | 16px | 500 | -0.32px | "New product" |
| Body / values | 15px | 500 | -0.3px | Product names, brand names, detail values |
| Small / labels | 13px | 500 | -0.26px | "Price", "Expiring on", status badges |

> All text uses `font-weight: 500` (medium). No bold, no regular — everything is medium weight.

---

## 3. Border Radius

| Element | Radius |
|---|---|
| Content panels / section cards | `22px` |
| Inner cards, buttons, CTA | `12px` |
| Status badges | `12px` |
| Filter chips | `8px` |
| Alert banners | `8px` |
| Reminder icons | `4px` |
| Nav group (tall) | `41px` |
| Nav group (short) | `28px` |
| Profile avatar outer | `28px` |
| Profile avatar inner | `39px` (full circle) |
| Brand logo circle | `45px` (full circle) |

---

## 4. Spacing & Auto-Layout

### Page-Level Layout (from Figma auto-layout)
| Property | Value | Notes |
|---|---|---|
| Outer padding (horizontal) | `64px` | Left and right page padding |
| Outer padding (vertical) | `60px` | Top and bottom page padding |
| Top bar → Hero section gap | `42px` | Vertical gap between nav bar and content area |
| Sidebar → Content gap | `42px` | Horizontal gap between left nav and main content |

### Sidebar (Left NAV Panel)
| Property | Value |
|---|---|
| Width | `56px` |
| Group gap (between nav groups) | `40px` |
| Nav group padding | `16px` horizontal, `24px` vertical |
| Icon gap (within group) | `24px` |
| Active icon circle | `42px` |
| Inactive icon size | `24px` |
| Group 1 radius | `41px` (tall pill) |
| Group 2 radius | `28px` (short pill) |

### Content Area
| Property | Value |
|---|---|
| Content gap (title → panels) | `24px` |
| Panels gap (between section panels) | `16px` |
| Panel internal padding | `24px` |
| Panel internal gap (header → cards) | `24px` |
| Panel border radius | `22px` |

### Warranty Card (auto-layout)
| Property | Value |
|---|---|
| Card padding | `40px` |
| Gap: primary info → brand info | `40px` |
| Gap within primary info sections | `16px` |
| Gap: label → value | `4px` |
| Gap: expiry info ↔ status badge | `4px` |
| Gap: price column ↔ purchase column | `32px` |
| Price column width | `73px` |
| Purchase date column width | `95px` |
| Brand info gap (logo → name) | `12px` |
| Brand logo size | `24px` circle |
| Card background gradient width | `280px` (full height) |

### Warranty Card Height
| Section | Value |
|---|---|
| Warranty section container height | `292px` |
| Card width | auto (content-based, ~280px) |

---

## 5. Layout

### Computed Offsets (for fixed positioning in web app)

Since the Figma uses a flow layout but we use fixed positioning for the nav/sidebar:

| Element | Position |
|---|---|
| TopBar | `px-[64px]`, `pt-[60px]`, natural height (~48px content) |
| Sidebar | `left-[64px]`, `top-[150px]` (60px pad + ~48px nav + 42px gap) |
| Content area | `pl-[162px]` (64px + 56px sidebar + 42px gap), `pt-[150px]`, `pr-[64px]`, `pb-[60px]` |

### Top Bar
- Full width, horizontally centered content
- Left: "Warrantify" brand text (Roboto Medium 32px)
- Right: "New product" CTA button + profile avatar (24px gap between them)
- Horizontal padding: `64px`
- Top offset: `60px` from page edge

### Sidebar (Left Nav)
- Icon-only vertical navigation
- Width: `56px` (icon area)
- Left offset: `64px` from screen edge
- Two groups:
  - **Group 1** (top): Home, My Products, Analytics — `rounded-[41px]` pill
  - **Group 2** (below, 40px gap): Reminders, Settings — `rounded-[28px]` pill
- Active state: icon inside a `42px` circle with `bg-[#7d7086]`
- Inactive state: bare `24px` icon, no background
- Group background: `#f8f6ff`
- Group padding: `16px` horizontal, `24px` vertical

### Content Area
- Starts at `162px` from left edge (64px + 56px + 42px)
- Top offset: `150px` (60px + 48px + 42px)
- Right padding: `64px`
- Vertical gap between title and panels: `24px`
- Vertical gap between panels: `16px`

### Mail Reminders — Split Layout
- Left panel: scrollable list of warranty reminder cards (~340px width)
- Right panel: expanded detail view of selected reminder (flex-1)
- Both panels sit side by side with `24px` gap

---

## 6. Component Patterns

### Warranty Card (Dashboard)
```
+------------------------------------------+
| [gradient bg left side, 280px]           |
|                                          |
|  Expiring on/in          [Status Badge]  |
|  Mar 20' 2026 / 200 days                |
|                                          |
|  Product                                 |
|  Turntable Compass Version 12            |
|                                          |
|  Price          Purchased on             |
|  $ 2046.20      Mar 20' 2023            |
|                                          |
|  [Brand Logo]  Brand Name                |
+------------------------------------------+
```
- Card padding: `40px` all sides
- Left gradient background image (280px wide, full height, absolutely positioned)
- Primary info sections separated by `16px` gap
- Brand info separated from primary by `40px` gap
- Status badge top-right of expiry info, `4px` gap
- Expired cards: primary info + brand info at `opacity: 0.50`

### Warranty Card (Mail Reminders — List Item)
```
+---------------------------------------+
|  Expiring on            [Status] [>]  |
|  Mar 20' 2026                         |
|  Product                              |
|  Turntable Compass Version 12         |
+---------------------------------------+
```
- Compact variant, no gradient, no price/brand
- Background: `#f0eef7`
- Selected state: `2px solid #d5d3db` border
- Chevron icon (rotated -90deg) on right
- Padding: `24px` horizontal, `16px` vertical

### Status Badge
- Padding: `8px` horizontal, `4px` vertical
- Radius: `12px`
- Font: Inter Medium 13px
- Color mapped by status (see Status Colors above)

### Filter Chips
- Padding: `12px` horizontal, `7.5px` vertical
- Radius: `8px`
- Font: Inter Medium 13px
- Active: `bg-[#706478]` + white text
- Inactive: `bg-[#e7e4ee]` + `#887991` text

### CTA Button ("New product")
- Background: `#7d7086`
- Text: white, Inter Medium 16px
- Padding: `12px` vertical, `12px` left, `16px` right
- Radius: `12px`
- Icon (20px) + text with `8px` gap

### Reminder History Item
```
[Icon] 30 day reminder sent
       Email sent to user@email.com
       Feb 18' 2026
```
- Icon: `20px` square, `4px` radius
  - Success: `bg-[#009f47]` with white check
  - Danger: `bg-[#e80000]` with white icon
- Text stack: title (15px #706478), subtitle (15px #9c9ba1), date (13px #9c9ba1)
- Padding: `12px`, gap between icon and text: `16px`

### Product Detail Panel (in Mail Reminders)
- Background: `#f8f6ff`, radius `22px`, padding `24px`
- Sections separated by `24px` vertical gap
- Two-column layout for product info fields
- Each field: label (15px #9c9ba1) + value (15px #706478), `8px` gap
- Fields within a column: `12px` gap

---

## 7. Key Design Principles

1. **Soft, muted palette** — Purple-grey tones, no harsh contrasts. The only saturated colors are status indicators (green, red).
2. **Everything is medium weight** — No bold headers, no light body text. Uniform `font-weight: 500` throughout.
3. **Generous radius** — Large rounded corners (22px panels, 12px cards) create a soft, approachable feel.
4. **Icon-only sidebar** — Minimal navigation, no text labels. Active state uses a filled circle.
5. **Label -> Value pattern** — All data is shown as small muted label above the value. Consistent across all screens.
6. **Status is always visible** — Every warranty card shows its status badge prominently.
7. **Opacity for expired** — Expired warranty card content fades to 50% opacity.
8. **No heavy borders** — Panels use background color differentiation, not borders (exception: selected mail item).
9. **Consistent auto-layout gaps** — 4px for tight pairs, 16px for sections, 24px for major blocks, 40-42px for layout divisions.
