import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Polar } from "@polar-sh/sdk";
import { z } from "zod";
import { Webhook } from 'standardwebhooks'
import { Buffer as BufferPolyfill } from "buffer";

globalThis.Buffer = BufferPolyfill;

const envSchema = z.object({
  PORT: z.number().default(3000),
  POLAR_MODE: z.enum(['sandbox', 'production']).default('production'),
  POLAR_ACCESS_TOKEN: z.string().min(1, 'POLAR_ACCESS_TOKEN is required'),
  POLAR_WEBHOOK_SECRET: z.string().min(1, 'POLAR_WEBHOOK_SECRET is required'),
  POLAR_SUCCESS_URL: z.url({ message: 'POLAR_SUCCESS_URL is missing' }).optional(),
})

const http = httpRouter();

// Home page - list products
http.route({
  path: "/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    console.log('Home page');
    const env = envSchema.parse(process.env);
    const polar = new Polar({
      server: env.POLAR_MODE,
      accessToken: env.POLAR_ACCESS_TOKEN,
    });
    const products = await polar.products.list({ isArchived: false });
    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-white flex flex-col items-center justify-center gap-16 min-h-screen">
    <div class="w-[360px] max-w-[90%] flex flex-col gap-3">
      ${products.result.items
        .map(
          (p) => `
          <a 
            href="/checkout?products=${p.id}" 
            target="_blank"
            class="block text-center px-4 py-3 border rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-900 transition"
          >
            Buy ${p.name}
          </a>
        `,
        )
        .join("")}
    </div>
    <form action="/portal" method="get" class="flex gap-2">
      <input 
        required
        type="email" 
        name="email" 
        placeholder="Email"
        class="px-4 py-2 text-base border rounded-lg w-[260px] focus:outline-none focus:border-black"
      />
      <button 
        type="submit" 
        class="px-6 py-2 text-base bg-black text-white rounded-lg hover:opacity-80 transition"
      >
        Continue
      </button>
    </form>
  </body>
</html>
    `;
    return new Response(html, { headers: { "Content-Type": "text/html" } });
  }),
});

// Checkout endpoint
http.route({
  method: "GET",
  path: "/checkout",
  handler: httpAction(async (ctx, request) => {
    const env = envSchema.parse(process.env);
    const polar = new Polar({
      server: env.POLAR_MODE,
      accessToken: env.POLAR_ACCESS_TOKEN,
    });
    const url = new URL(request.url);
    const productIds = url.searchParams.getAll("products");
    const checkoutSession = await polar.checkouts.create({
      products: productIds,
      ...(env.POLAR_SUCCESS_URL ? { successUrl: env.POLAR_SUCCESS_URL } : {}),
    });
    return new Response(null, {
      status: 302,
      headers: { Location: checkoutSession.url },
    });
  }),
});

// Customer portal endpoint
http.route({
  path: "/portal",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const env = envSchema.parse(process.env);
    const polar = new Polar({
      server: env.POLAR_MODE,
      accessToken: env.POLAR_ACCESS_TOKEN,
    });
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    if (!email)
      return new Response("Missing email parameter", { status: 400 });
    const customer = await polar.customers.list({ email });
    if (!customer.result.items.length)
      return new Response("Customer not found", { status: 404 });
    const session = await polar.customerSessions.create({
      customerId: customer.result.items[0].id,
    });
    return new Response(null, {
      status: 302,
      headers: { Location: session.customerPortalUrl },
    });
  }),
});

// Webhook endpoint
http.route({
  method: "POST",
  path: "/polar/webhooks",
  handler: httpAction(async (ctx, request) => {
    const env = envSchema.parse(process.env);
    try {
      const body = await request.text();
      const webhookHeaders = {
        'webhook-id': request.headers.get('webhook-id'),
        'webhook-timestamp': request.headers.get('webhook-timestamp'),
        'webhook-signature': request.headers.get('webhook-signature'),
      }
      const base64Secret = Buffer.from(env.POLAR_WEBHOOK_SECRET, 'utf-8').toString('base64')
      const webhook = new Webhook(base64Secret)
      try {
        // @ts-ignore
        webhook.verify(body, webhookHeaders)
        return new Response(body, {
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (error) {
        // @ts-ignore
        console.log(error.message || error.toString())
        return new Response(null, {
          status: 403,
          // @ts-ignore
          statusText: error.message || error.toString(),
        })
      }
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response(
        error instanceof Error ? error.message : "Internal error",
        { status: 403 }
      );
    }
  }),
});

export default http;
