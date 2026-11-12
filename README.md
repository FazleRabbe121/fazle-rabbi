# Fazle Rabbi — Personal Brand Website & Private Recipe Dashboard

Public portfolio for a professional Bartender, Barista and Mixologist, plus an owner-only cocktail recipe vault.

- **Stack:** TanStack Start (React 19 + TypeScript), Tailwind CSS v4, Lovable Cloud (Postgres, Auth, Storage).
- **Public:** `/` (all portfolio sections), `/login`, `/reset-password`.
- **Private:** `/dashboard` — the private recipe book. A 4-digit passcode screen opens first, then sign in / create account. Every account sees only its own recipes (Row Level Security).

## Local setup

```bash
bun install          # or npm install
cp .env.example .env # if you are not running inside Lovable
bun run dev          # http://localhost:8080
bun run test         # unit tests (calculators, scaling)
```

### Environment variables (public values only)

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Backend URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public anon/publishable key (safe for the browser) |
| `VITE_BASE_PATH` | Base path, default `/`. Use `/<repo>/` for GitHub Pages project sites |
| `STATIC_SPA` | `true` builds a static single-page shell (used by the GitHub Pages workflow) |

No secret keys are used in the frontend. All access control lives in the database.

## Backend setup (one time)

Database tables, roles, policies and the private `recipe-images` bucket are already created by the migration in `drizzle/migrations`.

1. **Passcode gate:** `/dashboard` (the "Recipes" menu link) first shows *Private Recipe Book* and asks for the 4-digit passcode. Only the SHA-256 hash of `frabbi:<code>` is in the code (`src/lib/passcode.ts`). The unlock lasts for the browser tab session (sessionStorage). To change the code, put the new hash in `PASSCODE_HASH`. This is a convenience gate only — a 4-digit hash can be guessed by anyone who reads the code; real protection is the login and database rules below.
2. **Sign-up is open:** `/login` has *Sign in* and *Create account* tabs plus *Forgot password*. New accounts confirm their email before signing in. Add your site URL (and `https://<user>.github.io/<repo>/`) to the auth redirect URLs.
3. **Per-account recipes:** each recipe row has `user_id` (default `auth.uid()`); RLS allows select/insert/update/delete only on your own rows. Images live in the private `recipe-images` bucket under a folder named with your user id, and RLS only allows your own folder. Categories are readable by any signed-in user. Contact messages stay admin-only (`user_roles` + `has_role`).
4. **Drink pictures:** `src/components/recipes/DrinkPicture.tsx` draws each drink as SVG from glassware, ice, garnish and ingredients (rules in `src/lib/drink.ts`) — no AI or external service. It appears in the form, cards, detail, print and PDF. Pick a colour in the form to override the automatic one.

Security model: roles are stored in `user_roles` (never on a profile), checked through the security-definer function `has_role(uid, 'admin')`. `contact_messages` allows public insert only (no public read), with a database trigger that rate-limits submissions; the form also has a honeypot field, a minimum fill time and a per-browser cooldown.

## Editing content

All text (bio, experience, skills, certifications, highlights, contact details, social links) lives in **`src/content/site.ts`**. Search for `[PLACEHOLDER]`.

### Hero video
Put your video at **`public/hero.mp4`** (H.264 MP4, ideally < 8 MB, 1920×1080, no audio). The path is defined once in `src/lib/media.ts` (`HERO_VIDEO_SRC`). If the file is missing, the poster image is shown automatically.

### CV and images
- CV: replace `public/Fazle-Rabbi-CV.pdf` (keep the file name).
- Photos: replace files in `src/assets/` keeping the same names, or change the imports at the top of `src/content/site.ts` (gallery items, signature cocktails, hero poster). The About/Contact portrait is hosted media: replace it with `lovable-assets create --file <your-photo> --filename fazle-rabbi-portrait.jpg > src/assets/fazle-rabbi-portrait.jpg.asset.json`.
- SEO: set `siteUrl` in `site.ts`, and update the domain in `public/robots.txt` and `public/sitemap.xml`.

### Venue logos
Employer logos live in **`public/logos/`** and are referenced from `src/content/site.ts`:
- `experience[].logos` — shown on each job in the Experience timeline (a job can carry more than one, e.g. Epsilon Restro Bar + Gazebo Mare).
- `venues[].logo` — shown in the "Where I have worked" rolling strip; `trainedWith[].logo` in the second row.

To add one: drop the official file in `public/logos/` and set its path (e.g. `logo: "/logos/oneills-irish-pub.jpg"`). Without a file, an elegant gold text wordmark is shown instead — never hotlink logos from other websites or draw imitations. Still missing: O'Neill's Irish Pub has no logo file yet.

## Dashboard features
Add / edit / duplicate / delete recipes, image upload (resized & compressed in the browser, stored privately and shown via signed URLs), search by name/ingredient/category, category filter, sort by name/date, favourites, detail view, print, branded PDF export, JSON/CSV backup and validated JSON import with duplicate handling, measurement converter, cost calculator (cost per serving, margin %, pour cost %), recipe scaling with “save as new”.

## Deploying

### Lovable
Click **Publish** in Lovable. Nothing else is required.

### GitHub Pages
1. Push the repo to GitHub. In **Settings → Pages**, set **Source = GitHub Actions**.
2. In **Settings → Secrets and variables → Actions** add secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, and a variable `VITE_BASE_PATH` (e.g. `/my-repo/`, or `/` for a user site / custom domain).
3. Push to `main`. `.github/workflows/deploy.yml` builds with Node 20 as a static SPA and copies `index.html` to `404.html`, so deep links like `/dashboard` and `/reset-password` load correctly.
4. Add the GitHub Pages `/reset-password` URL to the auth redirect URLs (see above).

Note: the GitHub Pages build is a client-only version of the site, so search engines see less pre-rendered content than on Lovable hosting.
