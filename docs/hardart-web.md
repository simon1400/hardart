# HARDART, single page website

Build spec and final copy. Everything here is design and content. No technical decisions are made in this document, the stack is yours.

Domain: **hardart.cz**
Language: **English only**, no localisation
Scope: **one page**, no navigation menu, scrolling is the navigation

---

## 1. Brand

Two people, ten years, no departments. Daniel does brand, design, UX and marketing. Dmytro does full stack engineering. We position as **creative developers**, an army of two.

**Tone of voice:** rebellious, slightly arrogant, creative, bold. Short sentences. Statements, not apologies. No agency newspeak. No em dashes anywhere in the copy, use commas or full stops.

The name is never explained anywhere on the site. No origin story, no wordplay, no footnote.

---

## 2. Visual system

### Logo
Existing typographic wordmark **hardart**, lowercase, heaviest weight, tight tracking. SVG supplied. No symbol, no lockup variants, no effects. Never redraw it, never outline it, never put it in a box.

### Colours

| Token | Value | Use |
|---|---|---|
| Accent | `#00FFC8` | hero ground, then accents only |
| Paper | `#FFFFFF` | page background below the hero |
| Ink | `#1A1A1A` (black at 90 %) | all text, logo, client logos |

Pure `#000000` is never used.

### Colour structure of the page
One turquoise screen, then white for the rest, the Love and Money model. The hero is a full viewport of `#00FFC8` with the logo and claim in ink. Everything below it is ink on paper. After the hero, turquoise appears only as an accent: link hover, tags, a rule, a single highlighted word. Never again as a large field.

**Contrast rule.** Turquoise on white is close to unreadable at small sizes. Turquoise is therefore allowed only as: a fill behind ink text, a large display element, or an interactive state. Never as small text on white, never as body copy.

The footer is the one permitted inversion: ink ground, paper text, turquoise accent. It closes the page the way the hero opened it.

### Typefaces
| Face | Use |
|---|---|
| **Mont** | logo, claim, all headings, all body copy |
| **Archia** | tags, labels, small caps details, footer meta, anything technical |

Archia is the minority voice. If a piece of text is longer than a line, it is Mont.

### Type rules
- Hero claim and section headings: Mont Heavy, uppercase, tight tracking, tight leading. Leading below 1.0 is wanted on the claim.
- Body copy: Mont Book or Regular, generous size. Body text on this site is big, closer to 24 px than 16 px on desktop.
- Tags and labels: Archia, uppercase, small, wide tracking.
- No italics anywhere.
- No text centred except the hero claim.

### Layout
- Wide margins are not the point, the type is. Content goes close to the edges, with a consistent side gutter.
- Sections are separated by space, not by lines or boxes. Hairline rules are allowed only in the footer.
- Mobile: everything stacks to one column. The claim must still fill the screen, it never shrinks to a polite paragraph.

### Motion
Motion is a feature of this site, not a decoration on top of it. The goal is wow: bold, scroll driven, precise, awwwards level. Full system in part 3.

---

## 3. Motion system

### Principles
Updated 2026-09-13 (Dmytro): the earlier restrictions on motion are lifted. No limit on the number of animations, loops, distances, combined transforms or kinds of move. The aim is that the site feels wow. What stays:

1. **Never block reading.** Text is in the markup from the start and readable with animation disabled.
2. **Smooth.** Every move holds 60 fps on an average phone; anything that cannot is cut or simplified.
3. **Reduced motion is respected.** With `prefers-reduced-motion` the page loses movement and nothing else.
4. **Off screen is paused.** Loops stop while they are not visible.

The moves below are the ones designed so far. They are a starting point, not a limit; more can be added.

### The moves, in page order

**A. Hero, on load.**
The claim arrives line by line, each line fading up, roughly 80 ms apart. The logo is already there, it does not animate in. Total under one second.

**B. The logo, on scroll.**
The signature move. As the hero leaves, the wordmark scales down and travels into the top left corner, where it stays fixed for the rest of the page. One continuous movement tied to scroll position, not a delayed animation that plays on its own. In the corner it is small and always a link back to the top.
As it shrinks, the wordmark changes smoothly from ink to turquoise, tied to the same scroll; in the corner it stays turquoise, over the footer too (Dmytro and Daniel, 2026-09-13).

**C. Paragraph reveal.**
Body copy reveals **line by line**, not word by word and not as a whole block. Roughly 60 ms between lines. This is the Apple move and it is the backbone of the whole page. Use it for the perex and for project texts.

**D. The word swap.** The one deliberate attention grabber.
A statement line where one word replaces another on a loop. It sits at the end of "What we do", full width, largest type on the page after the claim.

```
TWO PEOPLE.
ZERO [ MEETINGS / HANDOVERS / ACCOUNT MANAGERS / EXCUSES ].
```

- Only the bracketed word changes, the rest of the line never moves.
- Old word fades out and rises slightly, new word fades in from slightly below. Same move as a paragraph line, just applied to one word.
- Roughly 2.5 seconds per word, looping.
- The line must not reflow when the word changes. Reserve the width of the longest option, or let the line grow from a fixed left edge with the rest of the layout unaffected.
- It only runs while it is in the viewport. Off screen it is paused.
- With animation disabled it shows the first option, `MEETINGS`, and nothing else.

**E. Work rows.**
As a row enters, its media settles from a larger scale while it fades in. Tags appear with the text.

**F. Client logos.**
A running marquee of client logos.

**G. Links and hover.**
Turquoise underline wipes in from the left, 200 ms.

### Reduced motion
If the visitor prefers reduced motion: no travel, no scale, no loops. Everything is simply present, the logo sits in the corner after the hero, the swap line shows its first word. The page must lose nothing but movement. Without motion the corner logo is turquoise.

---

## 4. Sections

### 01 Hero
Full viewport. Turquoise ground, ink type.

- Logo, close to full width, upper area of the screen
- Claim, bottom of the screen, centred, three lines

```
BRAND PEOPLE CAN'T CODE.
DEVELOPERS CAN'T DESIGN.
WE DO BOTH.
```

Nothing else on this screen. No navigation, no scroll hint, no images. The claim arrives line by line on load, move **A** in part 3.

---

### 02 Who we are
White ground. Set as one large paragraph, first line indented (see twks.ch).

```
An independent creative development studio. Two people, ten years,
no departments, no account managers, no handover meetings.

Daniel builds the brand, the interface and everything a visitor judges
in the first four seconds. Dmytro builds the part underneath. Banks trust
him with theirs. You never notice it. That is the point.

We design it and we build it. Nobody else touches it.
```

---

### 03 What we do
Two columns on desktop, stacked on mobile. Names in Mont Heavy, discipline lists in Archia.

```
DANIEL
Everything you can see.

Brand identity. Art direction. UX and UI. Copy.
Research. Analytics. Marketing. SEO.
```

```
DIMITRO
Everything you can't.

Full stack development. Architecture. Integrations.
Performance. Infrastructure. Automation.
```

Full width closing statement below both columns, largest type on the page after the claim. This carries the word swap, move **D** in part 3.

```
TWO PEOPLE.
ZERO [ MEETINGS / HANDOVERS / ACCOUNT MANAGERS / EXCUSES ].
```

Spare line, held back for now in case the swap is cut: `That is the entire company. On purpose.`

---

### 04 Work
**Project copy lives in `docs/hardart-projects.md`** (Daniel, 2026-09-13): 9 featured projects with media and 5 secondary projects without media, titles are claims instead of client names, tags per project. That document replaces the item shape and the tag rule below where they differ.

Item shape:

| Field | Notes |
|---|---|
| `name` | project or client name |
| `url` | optional outbound link |
| `media` | video or image, supplied per project, video is muted, looping, no controls, no sound ever |
| `tags` | 2 to 4 short labels, Archia, uppercase. At least one from the design set and at least one from the engineering set. Design set: `BRAND`, `ART DIRECTION`, `UX`, `UI`, `COPY`, `CAMPAIGN`. Engineering set: `NEXT.JS`, `HEADLESS CMS`, `E-COMMERCE`, `MOTION`, `AI`, `INTEGRATIONS`, `INFRASTRUCTURE` |
| `text` | one to two sentences. Says what was built, not only how it looks |

Behaviour:
- Vertical list, one project per row, not a grid of cards.
- Media is the largest element of the row. Text and tags sit with it, they do not float on top of it.
- On mobile, media on top, then name, then tags, then text.
- The list must survive both 6 projects and 30 without redesign.

Section label above the list: `SELECTED WORK`

---

### 05 Clients
Full width strip of client logos, all in ink on white, all optically equalised in size. No boxes, no borders, no grey placeholders, no colour logos.

Line above the strip:

```
Some of them are household names.
We still answer our own phones.
```

---

### 06 Contact
The main call to action of the page. Large. Still on white.

```
TELL US ABOUT YOUR PROJECT
hello@hardart.cz
```

Below, the two of us:

```
Dmytro    [mail icon] [LinkedIn]
Daniel    [mail icon] [LinkedIn]
```

Personal email addresses appear **only as an icon link**, never as visible text and never as a plain `mailto:` string in the markup. Protect them from scrapers, your call how.

---

### 07 Footer
Inverted: ink ground, paper text, turquoise accents. Three column grid, hairline rules above the column headings, Archia for labels and meta.

```
SOCIAL MEDIA
LinkedIn.

We make digital for a living, which is exactly why
this is the only one we kept.
```

```
CONTACT
hello@hardart.cz
```

```
HARDART
hardart.cz
Czech Republic
Together since 2016
```

Bottom line, small, turquoise:

```
The kind of art that has a deadline.
```

---

## 5. Open items

- Client logo files, to be supplied
- Project content, media and tags, to be supplied by Daniel, tags follow the design set / engineering set rule in section 04
- LinkedIn URLs for both of us
