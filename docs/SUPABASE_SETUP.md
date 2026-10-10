# Backend preparation — Supabase (NOT DEPLOYED)

The live Aura Farmer currently stores achievements, scores and characters locally. **No Supabase project has been linked and no production SQL migration has been applied.**

## Owner action before activation

Connect a Supabase project through the ChatGPT Supabase app or supply its project reference using a secure connection. Confirm the correct environment and region, intended privacy policy and operational owner. **Never paste `service_role` or secret API keys into GitHub, client code or chat.** Store server keys in Vercel environment variables (server-only), and publish only Supabase's public anon key when RLS is confirmed.

## Staged migration

Run `supabase/migrations/20261010_001_meta_game.sql` on a test project first, with migration rollback and trigger tests. It creates:
- private profiles, progress, unlocks, achievements and history;
- future seasonal leaderboard tables and indexes;
- RLS and read-only player APIs;
- a **read-only** leaderboard RPC that shows *only approved, opted-in nicknames from verified runs*.

Do not add a client-side "submit score" endpoint. Browser gameplay on phones can be modified, and checking that `kills` is numerically plausible is **not enough**. A trusted replay validator or server-authoritative run results must exist before setting `runs.verified=true` or accepting entries for public rankings.

## Security and functional tests required before connecting

1. Authenticated player A can read A's progress, but not player B's.
2. Player A cannot write `verified`, score, achievements, unlocks or create leaderboard entries directly.
3. An anonymous guest account can be upgraded/linked to an identity; cloud sync is optional and offline play continues.
4. Public `get_aura_leaderboard` returns zero entries before verified runs. Unapproved/non-opted-in names stay hidden.
5. Service functions enforce version/seed/run uniqueness and verified score constraints; server-side rate limiting.
6. Nickname moderation, minimum data collection, privacy/export/delete workflows and anti-abuse protections exist before public launch.
7. Reconnection and merging local progress must be reviewed (union achievements, max records, dedupe run IDs, never grant verified scores from a local save).
8. Mobile/desktop regression CI green; no secrets in web build artifacts.

**Next milestone:** connect Supabase, run migration on a test backend, implement optional anonymous auth and profile sync, then build a trusted run verifier. Only after that publish Global Leaderboards.
