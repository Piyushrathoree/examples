import { Polar } from "@polar-sh/sdk";
import { env } from "cloudflare:workers";

// Fetch products on the server (React Server Component)
async function getProducts() {
  const polar = new Polar({
    accessToken: env.POLAR_ACCESS_TOKEN,
    server: env.POLAR_MODE as "sandbox" | "production",
  });

  try {
    const products = await polar.products.list({ isArchived: false });
    return products.result.items;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export const Home = async () => {
  const products = await getProducts();

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Polar + RedwoodSDK</h1>
      <p style={styles.subtitle}>
        A minimal example of Polar payments integration
      </p>

      {/* Customer Portal Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Customer Portal</h2>
        <form action="/api/portal" method="get" style={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Access Portal
          </button>
        </form>
      </section>

      {/* Products Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Products</h2>
        {products.length === 0 ? (
          <p style={styles.note}>
            No products found. Add products in your{" "}
            <a href="https://polar.sh" target="_blank" rel="noopener">
              Polar dashboard
            </a>
            .
          </p>
        ) : (
          <ul style={styles.productList}>
            {products.map((product) => (
              <li key={product.id} style={styles.productItem}>
                <span style={styles.productName}>{product.name}</span>
                <a
                  href={`/api/checkout?product=${product.id}`}
                  style={styles.checkoutLink}
                >
                  Checkout →
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Webhook Info */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Webhook Endpoint</h2>
        <code style={styles.code}>POST /polar/webhooks</code>
        <p style={styles.note}>
          Configure this URL in your Polar dashboard to receive events.
        </p>
      </section>
    </main>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "system-ui, sans-serif",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#666",
    marginBottom: "32px",
  },
  section: {
    marginBottom: "32px",
    padding: "20px",
    border: "1px solid #eee",
    borderRadius: "8px",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    gap: "8px",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
  },
  button: {
    padding: "10px 20px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  productList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  productItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #eee",
  },
  productName: {
    fontWeight: 500,
  },
  checkoutLink: {
    color: "#0070f3",
    textDecoration: "none",
  },
  code: {
    display: "inline-block",
    padding: "8px 12px",
    background: "#f5f5f5",
    borderRadius: "4px",
    fontFamily: "monospace",
  },
  note: {
    color: "#666",
    fontSize: "0.9rem",
    marginTop: "8px",
  },
};
