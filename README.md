# Rowan Glade: Landing page · Vercel (sign-in)

The `landing-vercel` page on **Vercel**, with preview links **public**, but the whole page sits
**behind a sign-in**: every page sends a signed-out visitor to a login page. Static Vite +
TypeScript, no framework, signing in through Supabase Auth. After signing in, the page reads a
live list from the shared Supabase test project. Spec: impeccable-reviews#408. Row in the support
matrix: impeccable-reviews#302.

## Deployment links

Filled in at prep time.

| Production | Preview gate |
|---|---|
| _not deployed_ | no (the site's own sign-in) |

## Routes

| Route | Page | Signed out | Signed in |
|---|---|---|---|
| `/` | The landing page (`index.html`) | Sent to `/login` | The page, with the account's email, role and a Sign out button |
| `/login` | Customer login (`login.html`) | The form | Sent to `/` if the account is a customer |
| `/admin` | Admin login (`admin.html`) | The form | Sent to `/` if the account is an admin |
| `/manager` | Manager login (`manager.html`) | The form | Sent to `/` if the account is a manager |

`vercel.json` has `cleanUrls`, so `/admin` serves `admin.html`. A wrong password shows "Wrong email
or password." under the form. Each login page takes only its own role: an admin's account on
`/login` is signed out again with "That isn't a customer account."

## Roles

One test account per role, each in Supabase Auth with its role in the user's `app_metadata.role`
(only the project's secret key can write it, unlike `user_metadata`). All three land on the same
landing page after signing in.

| Role | Login page | Email (after the rename) |
|---|---|---|
| Admin | `/admin` | `admin@<name>.test` |
| Manager | `/manager` | `manager@<name>.test` |
| Customer | `/login` | `customer@<name>.test` |

`fixtures/users.json` lists each account's email, role and login page, **never a password**: the
wizard reads the usernames from it. The emails carry the repo name because every prepared repo
shares one Supabase project.

## Names

Every prepared repository gets a random name of its own, never reused, for example
`amber-falcon-7k2q`.

## Prepare it for an eval

1. Copy (don't move) this folder to `tmp/eval-repos/<name>/`, `<name>` being the new random name.
2. Replace `template-landing` (package name and the fixture emails) and `Template Landing` (page
   titles) everywhere. Run `npm install` so `package-lock.json` has the new name.
3. `npm run build` passes, then `git init -b main`, commit, and push to a new repository
   `pristine-test-org/<name>` (`gh repo create`; push with the token on the URL). Then add a plain `origin`,
   `git remote add origin https://github.com/pristine-test-org/<name>.git`, with no token in it: the
   command quits without one.
4. **Create the three accounts:** in the clone, run
   `node /Users/abdulwahab/impeccable-reviews/tmp/eval-templates/create-signin-users.mjs .`.
   It reads `fixtures/users.json`, generates a password per account, creates each user confirmed
   with its role (Supabase's admin API, with the project's secret key from
   `supabase projects api-keys --reveal`), and writes the clone's gitignored `.eval-passwords`
   (mode 600), one `<role> <email> <password>` line each. Never print, commit or paste a password.
5. Create a Git-connected Vercel project named `<name>` in the `rg-test` team:
   `vercel api "/v11/projects?teamId=team_iuofJm6Q925kcDS0oDMTk9pb" --method POST --input body.json --scope rg-test`,
   body: `name`, `"framework": "vite"`, `"gitRepository": {"type": "github", "repo": "pristine-test-org/<name>"}`.
6. Right after, PATCH `/v9/projects/<id>?teamId=team_iuofJm6Q925kcDS0oDMTk9pb` with
   `gitProviderOptions={"createDeployments":"enabled"}` and `"ssoProtection": null` (one body).
   Projects made through the API start with deployments off and Vercel Authentication on. Check a
   deployment URL opens without a Vercel login: the site's own `/login`, not Vercel's.
7. Push a commit to `main`. That starts the first production build; creating a project deploys
   nothing.
8. Open the production URL signed out: it lands on `/login`. Sign in with each role on its page:
   each lands on the landing page, and its "Live from the shared list" strip shows rows.
9. Write the production URL into **Deployment links** above, delete the template notice at the
   top, and push that to `main`.

## Supabase

The same shared test project as every template (`https://hszqtfynyogshhltamep.supabase.co`). The URL
and publishable key are defaults in `src/supabase.ts`, so a host needs no environment variables.

- **Auth:** email and password sign-in (`signInWithPassword`), which is on for the project. Public
  sign-up leaves accounts unconfirmed (no auto-confirm), so prep creates them with the admin API,
  already confirmed. The session lives in the browser's local storage.
- **Data:** the signed-in page reads the latest five rows of `todos` with the user's token; the
  table's policy lets signed-in users read it (checked 2026-10-20: three rows for each role).
- **Auth URLs:** password sign-in has no redirect, so Auth → URL Configuration needs nothing for
  a new deployment or preview URL. Don't `supabase config push`: it writes the shared project's
  whole auth config.

## Run the eval

A repo eval, not `npm run eval`: the steps are in `REPO-EVAL.md` beside the templates. In short:
open the repo's app on impeccable.reviews, wait for the scan (Rescan if apps are missing), click
Setup, run the command it gives in `tmp/eval-repos/<name>/`, and wait for Impeccable's review on
the test PR. The preview shows the login page until signed in: the review's screenshots must
show the landing page, signed in.
