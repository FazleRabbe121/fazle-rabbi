<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- All public-site copy lives in `src/content/site.ts`; components read from it — keeps owner edits in one file.
- The app must stay deployable as a static SPA (GitHub Pages): no `createServerFn` or server routes; all data access goes through the browser client and RLS.
- Recipes and `recipe-images` (folder = user id) are per-user via RLS; contact reads stay admin-only via `user_roles` + `has_role()` — never gate data in the UI alone.
- The recipe passcode gate is client-only (hash in `src/lib/passcode.ts`, sessionStorage) and is UX, not security.
- Drink pictures are pure code: rules in `src/lib/drink.ts` (tested), drawing in `src/components/recipes/DrinkPicture.tsx`.
- Public asset URLs go through `publicAsset()` in `src/lib/media.ts` so `VITE_BASE_PATH` sub-paths work.
- Unit conversion, scaling and cost math live in `src/lib/measure.ts` with tests in `measure.test.ts`.
- Public venue, training and timeline logos use the shared BrandLogo frame and content-defined optical adjustments so original artwork stays contained and consistently presented.
