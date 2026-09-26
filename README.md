This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## AI Virtual Try-On

The Virtual Mirror uses FASHN Try-On Max through the server-only `/api/virtual-try-on` route. Set `FASHN_API_KEY` in `.env.local` for local development and in the Vercel project's Environment Variables for deployed environments. Never prefix this variable with `NEXT_PUBLIC_`.

Uploaded photos are sent to FASHN only after the customer selects a photo, accepts the consent checkbox, and presses **GENERATE TRY-ON**. GIRA does not persist source photos or generated results in a database or storage service.

## Customer Account API

The GIRA CLUB account flow uses Shopify Customer Account API OAuth with PKCE. Configure these server-side Vercel Environment Variables for every environment that has a matching Shopify callback URI:

- `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`: the public web app client ID from Shopify Customer Account API.
- `CUSTOMER_SESSION_SECRET`: a 256-bit random value generated with `openssl rand -hex 32`, used to encrypt HttpOnly customer session cookies.
- `NEXT_PUBLIC_SITE_URL`: the public origin used to build the callback URI. Production must be `https://www.giraeyewear.com`.
- `SHOW_GIRA_WELCOME_GIFT`: set to `true` only after Smile.io has been configured to grant the advertised welcome gift. Omit it or set any other value to keep the promotion hidden.

Do not expose `CUSTOMER_SESSION_SECRET` with a `NEXT_PUBLIC_` prefix. The production callback URI is `https://www.giraeyewear.com/account/callback`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
