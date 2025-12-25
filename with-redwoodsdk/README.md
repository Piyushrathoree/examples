![](../logo.svg)

# Getting started with Polar and RedwoodSDK

A minimal example demonstrating Polar payments integration using RedwoodSDK (React on Cloudflare Workers).

## Clone the repository

```bash
npx degit polarsource/examples/with-redwoodsdk ./with-redwoodsdk
```

## How to use

1. Update the `wrangler.jsonc` file with the environment variables:

```jsonc
"vars": {
  "POLAR_MODE": "sandbox",
  "POLAR_ACCESS_TOKEN": "polar_oat_...",
  "POLAR_WEBHOOK_SECRET": "polar_whs_...",
  "POLAR_SUCCESS_URL": "http://localhost:5173/"
}
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open `http://localhost:5173/` to see your products and checkout links.

## Features

- **Checkout** - Redirect to Polar checkout (`/api/checkout?product=PRODUCT_ID`)
- **Customer Portal** - Access customer portal by email (`/api/portal?email=EMAIL`)
- **Webhooks** - Receive Polar events at `/polar/webhooks`

## Learn More

- [Polar Documentation](https://docs.polar.sh/)
- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)
