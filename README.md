<a href="https://layerwise.app" target="_blank" rel="noopener"><img src="https://layerwise.app/powered-by-dark.png" alt="Powered by Layerwise" width="174" height="28" /></a>

# Nitpick

A landing page template for Nitpick, an AI code reviewer made by the fictional
Fernhill Labs in Toronto. It has a home page with a pull request that gets
reviewed live, a changelog, privacy and terms pages, a 404 page, and a "Book a
demo" form that saves requests to the project database.

Built with TanStack Start, React, Tailwind CSS, and Cloudflare D1, and runs on
Layerwise. Layerwise runs the dev server for you; open the project in Layerwise
to see the preview.

## Where things live

| To change…                                   | Edit                                     |
| -------------------------------------------- | ---------------------------------------- |
| Names, tagline, nav, button labels, colors, fonts, social links, the address that gets demo requests | `src/site.config.ts` |
| Every section of the home page, in page order | `src/content/home.ts`                   |
| The pull request reviewed in the hero        | `src/content/demo-pr.ts`                 |
| Changelog entries, one file each             | `src/content/changelog/<slug>.ts`        |
| Privacy and terms                            | `src/content/legal.ts`                   |
| Images added with `pnpm add-images`          | `src/content/images.json` (written by the script) |

Pages are in `src/routes/`, and the drawn product screens are in
`src/components/screens/`. You shouldn't need to touch either to change copy.

The site doesn't use shadcn/ui components, so they're not included, which keeps
the CSS small. `components.json` and the theme mapping in `src/styles/app.css`
are still set up, so `pnpm dlx shadcn@latest add <component>` adds one that
matches the palette.

## Rewrite the copy

1. Open `src/content/home.ts`. The exports follow the page from top to bottom:
   `hero`, `customers`, `rules`, `timeline`, `workflow`, `security`, `numbers`,
   `quotes`, `pricing`, `demo`.
2. Change the strings. The preview updates as you save.
3. In `hero.title`, a `\n` sets where the headline breaks on wide screens.
   Phones wrap it naturally.
4. The hero pull request (title, author, diff, and the three comments) is in
   `src/content/demo-pr.ts`. Keep each suggestion the same number of lines as
   the lines it replaces, and keep code lines under about 56 characters, so the
   diff doesn't shift when a suggestion is applied.
5. Button labels (`Book a demo`, `See it review a PR`) and the nav are in
   `src/site.config.ts`. Every pricing button and CTA leads to the form.
6. Run `pnpm og` to redraw the share images if you changed a title (see
   [Share images](#share-images-icons-and-the-logo)).

## Add an item

### A changelog entry

1. Copy a file in `src/content/changelog/`, for example
   `eu-data-residency.ts`, to `src/content/changelog/<your-slug>.ts`.
2. Set `slug` (it must match the file name and becomes `/changelog/<slug>`),
   `title`, `date` (`YYYY-MM-DD`), `summary`, `body` (paragraphs), and
   `changes` (bullets).
3. Pick its screen:
   - Leave out `screen` and `media` to show a simple title card.
   - Or set `media` to an image or video (see
     [Replace a drawn screen](#replace-a-drawn-screen-with-a-screenshot-or-video)).
   - Or draw one in code: add a component to
     `src/components/screens/changelog/`, register it in `changelogScreens` in
     `src/components/screens/changelog/index.tsx`, and set `screen` to its key.
4. Run `pnpm og` to render its share image to `public/og/changelog/<slug>.png`.

That's all. Entries sort by date, so the newest one becomes the "New" link above
the hero headline, and each entry is added to the changelog list and to
`/sitemap.xml` automatically.

To remove an entry, delete its file and `public/og/changelog/<slug>.png`, then
run `pnpm og` so the changelog share image lists the right entries.

### Other lists

Customers, rules, timeline steps, quotes, pricing plans, and numbers are
arrays in `src/content/home.ts`. Add an object shaped like its neighbours.

- A customer name without a drawn wordmark is set in type. Draw a new one in
  `src/components/home/Wordmarks.tsx` if you want it to match the others.
- A new rule also needs its id added to the `RuleId` type above `rules`, and a
  finding in `rules.sample.findings` so it has something to flag.

## Replace a drawn screen with a screenshot or video

Every product screen sits in one slot component (`ScreenSlot`). Give it media and
it shows your image or video instead of the drawing, at the media's own aspect
ratio so nothing jumps while it loads.

| Screen                     | Its `media` field                  |
| -------------------------- | ---------------------------------- |
| Hero pull request          | `demoPr.media` in `src/content/demo-pr.ts` |
| Rules panel                | `rules.media` in `src/content/home.ts` |
| Pull request timeline      | `timeline.media` in `src/content/home.ts` |
| Workflow comment preview   | `workflow.media` in `src/content/home.ts` |
| A changelog entry          | `media` in its `src/content/changelog/<slug>.ts` |

### An image

1. Export a PNG, JPEG, or WebP, ideally at least 2880 px wide. SVG isn't
   accepted. GIFs are kept as they are so the animation survives.
2. Run:

   ```bash
   pnpm add-images path/to/review-screenshot.png
   ```

   It writes WebP versions 800, 1600, and 2880 px wide (never wider than the
   original) to `public/images/`, and records the size and a tiny blurred
   placeholder in `src/content/images.json` under the file's name in lowercase
   with dashes, here `review-screenshot`. The script prints the name.
3. Set the screen's `media`:

   ```ts
   media: { type: 'image', name: 'review-screenshot', alt: 'Nitpick commenting on a pull request' }
   ```

To undo it, set `media` back to `null` (or delete the line in a changelog
entry). Then delete the image's entry from `src/content/images.json` and its
files from `public/images/`.

### A video

Put an MP4 or WebM in `public/videos/` and set:

```ts
media: {
  type: 'video',
  src: '/videos/review.mp4',
  poster: '/images/review-poster-1600.webp', // optional, from pnpm add-images
  width: 1920,
  height: 1080,
  alt: 'Nitpick reviewing a pull request'
}
```

Videos are muted and loop, play only while on screen, and never play on their
own for visitors who ask for reduced motion.

## Change fonts and colors

**Colors** are hex values in `colors` in `src/site.config.ts`:
- `background` and `surface1`–`surface4` are the near-black steps.
- `text`, `textMuted`, and `textSubtle` are the text colors. Keep body text at
  4.5:1 contrast or better against `background`.
- `accent` is Nitpick's own highlight. It's used only on the product's checks,
  comments, and applied fixes, so keep it to one color.
- `high`, `added`, and `removed` color severity and diffs.

**Fonts** are self-hosted variable WOFF2 files:

1. Put the new font in `public/fonts/`, along with its license.
2. Update `fonts.sans` or `fonts.mono` in `src/site.config.ts`: `family`,
   `file`, and `weights`.
3. Update `fallback`. These overrides size a local font (Arial, Menlo) to
   match yours, so text doesn't move when the web font arrives. Generate them
   with a fallback metrics tool such as
   [Fallback Font Generator](https://screenspan.net/fallback) or
   [Capsize](https://seek-oss.github.io/capsize/). If you skip this step,
   everything still works, but text can shift slightly on first load.
4. The share images use static copies of the same fonts, in `scripts/og-fonts/`.
   Replace those too, then run `pnpm og`.

## Demo requests

The form at the bottom of the home page asks for a work email, company, team
size, and code host.

- **Where submissions show up:** the `demo_requests` table in the project's
  **Database** panel in Layerwise. The local preview and the published site
  have separate databases, so test requests stay local.
- **Email to you:** set `ownerEmail` in `src/site.config.ts` to the address
  that should hear about new requests. Each request then sends one email there
  through Layerwise Email, at most 100 a day; after that, requests are still
  saved, just without email. Visitors are never emailed. In the local preview,
  these emails land in **Email → Local** in Layerwise instead of being sent.
  Email works on the published site after the first publish.
- **What the server checks:**
  - Every field is validated on the server.
  - Free email domains (Gmail, Outlook, and so on) are refused with a clear
    message.
  - A hidden honeypot field catches bots.
  - The same email twice shows "already on the list" and adds no row.
  - Each visitor gets 5 tries an hour.
- **Rate limit storage:** visitors are counted by a salted hash of their IP
  address, and the raw address is never stored. To use your own salt, set a
  secret named `IP_HASH_SALT` in the published Worker's environment. Without
  one, a fixed salt built into the code is used.
- The rules live in `src/lib/demo-request.ts`, with tests in
  `src/lib/demo-request.test.ts`.

## Share images, icons, and the logo

- `pnpm og` renders a 1200×630 share image for every page into `public/og/`
  from the titles in `src/content/`. Run it after you add a changelog entry or
  change a title.
- `public/logo.svg` is the logo. After you change it, run `pnpm icons` to
  rewrite `public/logo.png` and every favicon, including
  `android-chrome-512x512.png`.
- Search settings (the indexed address, Google verification, and the sitemap
  list) are in `src/lib/site.ts`. Pages and changelog entries are added to
  `/sitemap.xml` automatically. If you connect a custom domain, set `url`
  there.

## The Layerwise badge

The "Powered by Layerwise" badge at the top of this file also appears in the
footer of every page (`src/components/site/SiteFooter.tsx`). It links to
https://layerwise.app in a new tab.

## Commands

```bash
pnpm check-types              # TypeScript
pnpm lint                     # Biome
pnpm test                     # Vitest: the demo request rules
pnpm build                    # Production build
pnpm og                       # Share images
pnpm icons                    # Logo PNG and favicons from public/logo.svg
pnpm add-images <files…>      # Responsive images for a screen slot
pnpm db:generate --name <x>   # A migration after changing src/db/schema.ts
pnpm db:migrate               # Apply migrations to the local database
```

## Fonts and licenses

| Font                                                          | Used for          | License                 |
| ------------------------------------------------------------- | ----------------- | ----------------------- |
| [Schibsted Grotesk](https://github.com/schibsted/schibsted-grotesk) | Text and headings | SIL Open Font License 1.1 (`public/fonts/OFL-schibsted-grotesk.txt`) |
| [Geist Mono](https://github.com/vercel/geist-font)            | Code and figures  | SIL Open Font License 1.1 (`public/fonts/OFL-geist-mono.txt`) |

Company names, people, quotes, and numbers on the site are fictional sample
content.
