# Hair & Co — Newport, Sydney

A monochrome editorial website, CMS and appointment booking system for Hair & Co, a hair salon at 1/371 Barrenjoey Rd, Newport NSW 2107.

## Stack

- Next.js 16 (App Router, Cache Components, Turbopack)
- React 19 + TypeScript
- Tailwind CSS 4
- Neon Postgres + Drizzle ORM
- Vercel Blob for CMS image uploads
- Resend for booking emails
- Custom parallax, no animation or UI libraries

## What is included

- Home, About, Services, Contact and Privacy pages, with editable copy and per-page SEO.
- Services with prices, durations, inclusions and booking links.
- Capacity-based live booking with closures, lead time, 60-day window and Sydney timezone.
- Admin at `/admin` for pages, SEO, site settings, hours, services, closures, bookings and CSV export.
- `HairSalon`, `Service`, `WebSite` and `BreadcrumbList` structured data.
- Sitemap, robots, Open Graph metadata, favicons and a web manifest.
- Resend owner notifications + customer confirmation, with the admin inbox as the source of truth.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Neon Postgres database and a Vercel Blob store. Copy `.env.example` to `.env.local` and fill in:

   - `DATABASE_URL` (pooled; add `?sslmode=require` if Neon asks)
   - `DATABASE_URL_UNPOOLED` (for migrations)
   - `BLOB_READ_WRITE_TOKEN`
   - `AUTH_SECRET` (random 32+ bytes; `openssl rand -base64 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD_HASH` (see below)
   - `NEXT_PUBLIC_SITE_URL` (use `http://localhost:3000` locally)
   - Resend variables when you want live email

3. Generate the admin password hash:

   ```bash
   npm run hash-password -- "a-long-strong-password"
   ```

   Copy the printed `ADMIN_PASSWORD_HASH` into `.env.local`.

4. Create the database tables and seed defaults:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

   The seed inserts site settings, all five pages and a **sample service menu**. Sample services are clearly marked in the admin, are excluded from the public site and booking API, and only become public after you review and save them.

5. Generate the brand assets from `/salon` (only needed if the source images change):

   ```bash
   npm run assets
   ```

6. Start the dev server:

   ```bash
   npm run dev
   ```

   Public site: http://localhost:3000
   Admin: http://localhost:3000/admin

## Booking behaviour

- Opening hours and capacity come from **Admin → Settings**.
- Capacity is salon-wide, not per stylist. Choose the number of appointments that can overlap.
- Slot starts use the configured interval (default 30 minutes), and the service duration must fit before closing.
- Bookings inside the minimum notice period or outside the booking window are rejected.
- Closures block any overlapping slot.
- Submissions re-check capacity inside a Postgres transaction with a per-date advisory lock, so two people cannot take the same last slot.
- Payment is in salon. No card details are collected.
- Customers receive a confirmation email when Resend is configured. The admin booking page can resend either email.

## Resend

1. Create a free Resend account.
2. Verify your sending domain (SPF + DKIM; DMARC recommended).
3. Set `RESEND_API_KEY` and `BOOKING_FROM_EMAIL`.
4. Set the booking notification address in **Admin → Settings → Booking rules**, or via `BOOKING_NOTIFY_EMAIL`.
5. Make a test booking and confirm both emails. If email fails, the booking is still saved and flagged in the admin.

## SEO

Per-page SEO is edited in **Admin → Pages → [page] → SEO & social**. Site-wide defaults and Google/Bing verification codes are in **Admin → Settings → SEO defaults**.

After deploying:

1. Set `NEXT_PUBLIC_SITE_URL` to the production domain and redeploy.
2. Add the domain to Google Search Console and submit `/sitemap.xml`.
3. Check `HairSalon`, `Service` and `BreadcrumbList` in the Rich Results Test.
4. Update the Google Business Profile website, NAP and hours to match the site.
5. Request reviews and keep the service menu/prices current.

Preview deployments are automatically `noindex`.

## Deployment to Vercel

1. Push the repository to GitHub/GitLab and import it in Vercel.
2. Add the Neon integration and a Blob store from the Vercel Marketplace.
3. Add all environment variables from `.env.example` in Vercel. A production Vercel build intentionally fails if `DATABASE_URL` is missing.
4. Run migrations and seed against the production database from your machine:

   ```bash
   vercel env pull .env.local
   npm run db:migrate
   npm run db:seed
   ```

   `vercel env pull .env.local` overwrites your local env file with the production values, so keep a copy of your development values first if you need them.

5. Deploy, add the custom domain, set `NEXT_PUBLIC_SITE_URL`, and redeploy.
6. Replace the sample services with the real menu, set capacity/closures, and run a live booking test.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run test` | Unit tests |
| `npm run assets` | Rebuild logo, favicons, OG image and photos |
| `npm run db:generate` | Generate a Drizzle migration |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed settings, pages and sample services |
| `npm run db:studio` | Drizzle Studio |
| `npm run hash-password -- "password"` | Generate `ADMIN_PASSWORD_HASH` |

## Notes

- The about/services copy is based on the supplied photos and Google listing. Do not add awards, years in business, staff names or testimonials without confirmation.
- The privacy policy is a starting template; have it reviewed for Australian Privacy Act compliance.
- The supplied salon photos are compressed phone images. Professional photography will improve the site further.
- The map is a link, not an embedded iframe, to protect performance and privacy.
- The admin uses a single account configured by environment variables. Changing the password requires updating `ADMIN_PASSWORD_HASH` and redeploying.
