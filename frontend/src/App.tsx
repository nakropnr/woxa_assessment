import { useState, useEffect } from "react";
import { fetchBrokers, fetchBroker, createBroker } from "./api";
import type { Broker, BrokerType } from "./types";

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const c = {
  bg: "#070d1a",
  bgCard: "#0d1629",
  bgCardHover: "#111e35",
  bgInput: "#0a1220",
  border: "#1a2a45",
  borderActive: "#2a4070",
  accent: "#3b82f6",
  text: "#e8edf5",
  textMuted: "#7a92b0",
  textDim: "#4a6080",
  premium: "#c9a84c",
  green: "#22c55e",
  red: "#ef4444",
};

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${c.bg}; color: ${c.text}; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px);} to { opacity:1; transform:translateY(0);} }
  @keyframes spin    { to { transform: rotate(360deg); } }
  .fade-up    { animation: fadeUp 0.5s ease both; }
  .fade-up-d1 { animation: fadeUp 0.5s 0.08s ease both; }
  .fade-up-d2 { animation: fadeUp 0.5s 0.16s ease both; }
  .fade-up-d3 { animation: fadeUp 0.5s 0.24s ease both; }
  ::-webkit-scrollbar { width:6px; }
  ::-webkit-scrollbar-track { background:${c.bg}; }
  ::-webkit-scrollbar-thumb { background:${c.border}; border-radius:3px; }
`;

// ─── SHARED ───────────────────────────────────────────────────────

function Spinner() {
  return (
    <div
      style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `2px solid ${c.border}`,
          borderTopColor: c.accent,
          animation: "spin 0.7s linear infinite",
        }}
      />
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      style={{
        background: `${c.red}15`,
        border: `1px solid ${c.red}40`,
        borderRadius: 8,
        padding: "14px 18px",
        color: c.red,
        fontSize: 13,
        margin: "16px 0",
      }}
    >
      {message}
    </div>
  );
}

type AppRoute =
  | { kind: "brokers" }
  | { kind: "submit" }
  | { kind: "detail"; slug: string };

function getRouteFromLocation(pathname: string): AppRoute {
  if (pathname === "/submit") {
    return { kind: "submit" };
  }

  const detailMatch = pathname.match(/^\/brokers\/([^/]+)$/);
  if (detailMatch) {
    return { kind: "detail", slug: decodeURIComponent(detailMatch[1]) };
  }

  return { kind: "brokers" };
}

function getPathFromRoute(route: AppRoute) {
  switch (route.kind) {
    case "submit":
      return "/submit";
    case "detail":
      return `/brokers/${encodeURIComponent(route.slug)}`;
    case "brokers":
    default:
      return "/";
  }
}

function Nav({
  route,
  onNavigate,
}: {
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
}) {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: 56,
        borderBottom: `1px solid ${c.border}`,
        background: "rgba(7,13,26,0.92)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <span
        onClick={() => onNavigate({ kind: "brokers" })}
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 20,
          color: c.text,
          cursor: "pointer",
          letterSpacing: "-0.02em",
        }}
      >
        Woxa
      </span>

      <div style={{ display: "flex", gap: 32 }}>
        {["Brokers", "Markets", "Analysis", "Education"].map((label) => {
          const active =
            label === "Brokers" &&
            (route.kind === "brokers" ||
              route.kind === "detail" ||
              route.kind === "submit");
          return (
            <span
              key={label}
              onClick={() =>
                label === "Brokers" && onNavigate({ kind: "brokers" })
              }
              style={{
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                color: active ? c.text : c.textMuted,
                borderBottom: active
                  ? `2px solid ${c.accent}`
                  : "2px solid transparent",
                paddingBottom: 2,
                transition: "color 0.2s",
              }}
            >
              {label}
            </span>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {["🔔", "👤"].map((icon, i) => (
          <div
            key={i}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: `1px solid ${c.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 14,
              background: c.bgCard,
            }}
          >
            {icon}
          </div>
        ))}
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${c.border}`,
        padding: "24px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18 }}>
        Woxa
      </span>
      <div style={{ display: "flex", gap: 24 }}>
        {[
          "Privacy Policy",
          "Terms of Service",
          "Risk Disclosure",
          "Contact",
        ].map((l) => (
          <span
            key={l}
            style={{
              fontSize: 11,
              color: c.textDim,
              cursor: "pointer",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {l}
          </span>
        ))}
      </div>
      <span style={{ fontSize: 11, color: c.textDim }}>
        © 2024 STERLING MIDNIGHT. ALL RIGHTS RESERVED.
      </span>
    </footer>
  );
}

// ─── BROKERS LIST PAGE ────────────────────────────────────────────

const FILTER_TYPES: Array<{ label: string; value: BrokerType | "" }> = [
  { label: "All Partners", value: "" },
  { label: "CFD", value: "cfd" },
  { label: "Bond", value: "bond" },
  { label: "Stock", value: "stock" },
  { label: "Crypto", value: "crypto" },
];

const FALLBACK_IMAGES: Record<string, string> = {
  cfd: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
  bond: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  stock:
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80",
  crypto:
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80",
};

function BrokerCard({
  broker,
  onClick,
}: {
  broker: Broker;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const img =
    broker.logo_url ||
    FALLBACK_IMAGES[broker.broker_type] ||
    FALLBACK_IMAGES.cfd;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: c.bgCard,
        border: `1px solid ${hovered ? c.borderActive : c.border}`,
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.5)" : "none",
      }}
    >
      <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
        <img
          src={img}
          alt={broker.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.7) grayscale(0.3)",
            transform: hovered ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.4s ease",
          }}
        />
      </div>
      <div style={{ padding: "20px 20px 16px" }}>
        <h3
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 20,
            marginBottom: 8,
          }}
        >
          {broker.name}
        </h3>
        <p
          style={{
            fontSize: 13,
            color: c.textMuted,
            lineHeight: 1.6,
            marginBottom: 16,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {broker.description}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${c.border}`,
            paddingTop: 14,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              color: c.textDim,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            ◈ {broker.broker_type}
          </span>
          <span style={{ fontSize: 13, color: c.accent }}>View Details →</span>
        </div>
      </div>
    </div>
  );
}

function BrokersPage({
  onOpenDetail,
  onOpenSubmit,
}: {
  onOpenDetail: (slug: string) => void;
  onOpenSubmit: () => void;
}) {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<BrokerType | "">("");
  const [debounced, setDebounced] = useState("");

  // Debounce search input by 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    fetchBrokers({ search: debounced, type: activeType })
      .then((data) => {
        if (!cancelled) {
          setBrokers(data);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError((e as Error).message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, activeType]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 60px" }}>
      <div className="fade-up">
        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 48,
            lineHeight: 1.1,
            marginBottom: 14,
            letterSpacing: "-0.02em",
          }}
        >
          Institutional Brokers
        </h1>
        <p
          style={{
            fontSize: 14,
            color: c.textMuted,
            maxWidth: 340,
            lineHeight: 1.7,
            marginBottom: 32,
          }}
        >
          Access global liquidity through our curated network of elite financial
          institutions and market makers.
        </p>
      </div>

      {/* Search */}
      <div
        className="fade-up-d1"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: c.bgCard,
          border: `1px solid ${c.border}`,
          borderRadius: 8,
          padding: "0 16px",
          marginBottom: 24,
          height: 46,
        }}
      >
        <span style={{ color: c.textDim, fontSize: 16 }}>⌕</span>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setLoading(true);
            setError("");
          }}
          placeholder="Find brokers by name, region, or asset class..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: c.text,
            fontSize: 14,
          }}
        />
        {search && (
          <span
            onClick={() => {
              setSearch("");
              setLoading(true);
              setError("");
            }}
            style={{
              color: c.textDim,
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </span>
        )}
      </div>

      {/* Filters */}
      <div
        className="fade-up-d2"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 32,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: c.textDim,
            letterSpacing: "0.08em",
            marginRight: 4,
          }}
        >
          ASSET FOCUS:
        </span>
        {FILTER_TYPES.map((f) => (
          <button
            key={f.label}
            onClick={() => {
              setActiveType(f.value);
              setLoading(true);
              setError("");
            }}
            style={{
              background: activeType === f.value ? c.text : "transparent",
              color: activeType === f.value ? c.bg : c.textMuted,
              border: `1px solid ${activeType === f.value ? c.text : c.border}`,
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Spinner />
      ) : (
        <div
          className="fade-up-d3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 20,
          }}
        >
          {brokers.map((b) => (
            <BrokerCard
              key={b.id}
              broker={b}
              onClick={() => onOpenDetail(b.slug)}
            />
          ))}

          {/* Partner CTA */}
          <div
            onClick={onOpenSubmit}
            style={{
              background: c.bgCard,
              border: `1px dashed ${c.border}`,
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 32,
              cursor: "pointer",
              transition: "all 0.2s",
              minHeight: 200,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 14 }}>🤝</div>
            <h3
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 18,
                marginBottom: 8,
              }}
            >
              Partner with Us
            </h3>
            <p
              style={{
                fontSize: 13,
                color: c.textMuted,
                textAlign: "center",
                marginBottom: 20,
                lineHeight: 1.6,
              }}
            >
              Are you an institutional broker? Join our exclusive network.
            </p>
            <button
              style={{
                background: "transparent",
                border: `1px solid ${c.border}`,
                color: c.text,
                padding: "9px 22px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Inquire Now
            </button>
          </div>

          {brokers.length === 0 && !loading && (
            <div
              style={{
                gridColumn: "1/-1",
                textAlign: "center",
                padding: "40px 0",
                color: c.textMuted,
              }}
            >
              No brokers found{search ? ` for "${search}"` : ""}
              {activeType ? ` in ${activeType}` : ""}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── BROKER DETAIL PAGE ───────────────────────────────────────────

function DetailPage({
  slug,
  onNavigate,
}: {
  slug: string;
  onNavigate: (route: AppRoute) => void;
}) {
  const [broker, setBroker] = useState<Broker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetchBroker(slug, { signal: controller.signal })
      .then((data) => {
        setBroker(data);
      })
      .catch((e) => {
        if ((e as Error).name !== "AbortError") {
          setError((e as Error).message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [slug]);

  useEffect(() => {
    const defaultTitle = "Woxa";
    const metaDescription = document.querySelector(
      'meta[name="description"]',
    );
    const previousTitle = document.title;
    const previousDescription = metaDescription?.getAttribute("content") ?? "";

    if (broker) {
      document.title = `${broker.name} | Woxa`;
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          broker.description || `Explore ${broker.name} on Woxa.`,
        );
      }
    } else if (error) {
      document.title = `Broker Not Found | Woxa`;
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          `The requested broker could not be found on Woxa.`,
        );
      }
    } else {
      document.title = defaultTitle;
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          "Discover institutional brokers on Woxa.",
        );
      }
    }

    return () => {
      document.title = previousTitle || defaultTitle;
      if (metaDescription) {
        metaDescription.setAttribute("content", previousDescription);
      }
    };
  }, [broker, error]);

  if (loading) return <Spinner />;
  if (error || !broker)
    return (
      <div style={{ maxWidth: 900, margin: "60px auto", padding: "0 24px" }}>
        <ErrorBox message={error || "Broker not found"} />
        <button
          onClick={() => onNavigate({ kind: "brokers" })}
          style={{
            marginTop: 16,
            background: "transparent",
            border: `1px solid ${c.border}`,
            color: c.text,
            padding: "8px 18px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          ← Back to Brokers
        </button>
      </div>
    );

  const heroImg =
    broker.logo_url ||
    FALLBACK_IMAGES[broker.broker_type] ||
    FALLBACK_IMAGES.cfd;

  return (
    <div>
      {/* Hero */}
      <div
        style={{
          position: "relative",
          height: 340,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 48px 36px",
        }}
      >
        <img
          src={heroImg}
          alt={broker.name}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.3) grayscale(0.2)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <span
            style={{
              background: `${c.accent}33`,
              border: `1px solid ${c.accent}66`,
              color: c.accent,
              fontSize: 10,
              letterSpacing: "0.12em",
              padding: "3px 10px",
              borderRadius: 3,
              marginBottom: 14,
              display: "inline-block",
              textTransform: "uppercase",
            }}
          >
            INSTITUTIONAL GRADE · {broker.broker_type.toUpperCase()}
          </span>

          <h1
            className="fade-up"
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 46,
              lineHeight: 1.1,
              marginBottom: 10,
              letterSpacing: "-0.02em",
            }}
          >
            {broker.name}
          </h1>

          <p
            className="fade-up-d1"
            style={{
              fontSize: 14,
              color: c.textMuted,
              maxWidth: 440,
              lineHeight: 1.7,
            }}
          >
            {broker.description}
          </p>

          <div
            className="fade-up-d2"
            style={{ display: "flex", gap: 12, marginTop: 22 }}
          >
            {broker.website && (
              <a
                href={broker.website}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: c.accent,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 22px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                Visit Website
              </a>
            )}
            <button
              onClick={() => onNavigate({ kind: "brokers" })}
              style={{
                background: "transparent",
                color: c.text,
                border: `1px solid ${c.border}`,
                borderRadius: 6,
                padding: "10px 22px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 60px" }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 40 }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 28,
                marginBottom: 20,
              }}
            >
              About {broker.name}
            </h2>
            <p
              style={{
                fontSize: 14,
                color: c.textMuted,
                lineHeight: 1.8,
                marginBottom: 32,
              }}
            >
              {broker.description || "No description available."}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {[
                {
                  icon: "🛡",
                  title: "Regulated Entity",
                  desc: "Operates under institutional-grade compliance and regulatory oversight.",
                },
                {
                  icon: "⚡",
                  title: "Fast Execution",
                  desc: "Proprietary infrastructure built for high-frequency institutional workflows.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: c.bgCard,
                    border: `1px solid ${c.border}`,
                    borderRadius: 10,
                    padding: "20px",
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 10 }}>
                    {item.icon}
                  </div>
                  <div
                    style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: c.textMuted,
                      lineHeight: 1.6,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div>
            <div
              style={{
                background: c.bgCard,
                border: `1px solid ${c.border}`,
                borderRadius: 12,
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: "0.08em",
                  color: c.textDim,
                  marginBottom: 16,
                }}
              >
                BROKER DETAILS
              </div>
              {[
                { label: "Type", value: broker.broker_type.toUpperCase() },
                { label: "Slug", value: broker.slug },
                { label: "Website", value: broker.website || "—" },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: `1px solid ${c.border}`,
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 12, color: c.textDim }}>
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: c.text,
                      wordBreak: "break-all",
                      textAlign: "right",
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SUBMIT PAGE ──────────────────────────────────────────────────

type FormState = {
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website: string;
  broker_type: BrokerType | "";
};

function SubmitPage({ onNavigateHome }: { onNavigateHome: () => void }) {
  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
    description: "",
    logo_url: "",
    website: "",
    broker_type: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setForm((p) => ({ ...p, name, slug }));
  };

  const handleSubmit = async () => {
    if (!form.broker_type) {
      setError("Please select a broker type.");
      return;
    }
    if (!form.name.trim()) {
      setError("Broker name is required.");
      return;
    }
    if (!form.slug.trim()) {
      setError("Slug is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await createBroker({
        ...form,
        broker_type: form.broker_type as BrokerType,
      });
      setSuccess(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: c.bgInput,
    border: `1px solid ${c.border}`,
    borderRadius: 7,
    color: c.text,
    padding: "11px 14px",
    fontSize: 14,
    outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    letterSpacing: "0.1em",
    color: c.textDim,
    marginBottom: 8,
    display: "block",
  };

  if (success)
    return (
      <div
        style={{
          maxWidth: 500,
          margin: "80px auto",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 20 }}>✅</div>
        <h2
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 28,
            marginBottom: 12,
          }}
        >
          Application Submitted
        </h2>
        <p style={{ color: c.textMuted, marginBottom: 28 }}>
          Your broker has been registered successfully.
        </p>
        <button
          onClick={onNavigateHome}
          style={{
            background: c.accent,
            border: "none",
            color: "#fff",
            padding: "10px 28px",
            borderRadius: 7,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          View All Brokers
        </button>
      </div>
    );

  return (
    <div style={{ maxWidth: 660, margin: "0 auto", padding: "44px 24px 60px" }}>
      <div className="fade-up">
        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 40,
            marginBottom: 10,
          }}
        >
          Submit Broker
        </h1>
        <p
          style={{
            fontSize: 14,
            color: c.textMuted,
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          Register a new institutional entity within the Sterling Midnight
          ecosystem.
          <br />
          Please ensure all data points align with regulatory documentation.
        </p>
      </div>

      <div
        className="fade-up-d1"
        style={{
          background: c.bgCard,
          border: `1px solid ${c.border}`,
          borderRadius: 14,
          padding: "32px",
        }}
      >
        {/* Name + Slug */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div>
            <label style={labelStyle}>BROKER NAME</label>
            <input
              value={form.name}
              onChange={handleNameChange}
              placeholder="e.g. Sterling Capital Markets"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>SLUG</label>
            <input
              value={form.slug}
              onChange={handleChange("slug")}
              placeholder="sterling-capital-markets"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Broker Type */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>BROKER TYPE</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 10,
            }}
          >
            {(["cfd", "bond", "stock", "crypto"] as BrokerType[]).map((t) => (
              <button
                key={t}
                onClick={() => setForm((p) => ({ ...p, broker_type: t }))}
                style={{
                  background: form.broker_type === t ? c.accent : c.bgInput,
                  border: `1px solid ${form.broker_type === t ? c.accent : c.border}`,
                  color: form.broker_type === t ? "#fff" : c.textMuted,
                  borderRadius: 7,
                  padding: "10px",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textTransform: "uppercase",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Logo + Website */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div>
            <label style={labelStyle}>LOGO URL</label>
            <input
              value={form.logo_url}
              onChange={handleChange("logo_url")}
              placeholder="https://example.com/logo.png"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>WEBSITE</label>
            <input
              value={form.website}
              onChange={handleChange("website")}
              placeholder="https://example.com"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>BROKER DESCRIPTION</label>
          <textarea
            value={form.description}
            onChange={handleChange("description")}
            placeholder="Provide a comprehensive institutional overview..."
            rows={5}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
          />
        </div>

        {error && <ErrorBox message={error} />}

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            onClick={onNavigateHome}
            style={{
              background: "transparent",
              border: "none",
              color: c.textMuted,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              padding: "10px 20px",
            }}
          >
            Discard Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              background: submitting ? c.bgInput : c.accent,
              border: "none",
              color: submitting ? c.textMuted : "#fff",
              borderRadius: 7,
              padding: "10px 28px",
              fontSize: 14,
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {submitting ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() =>
    getRouteFromLocation(window.location.pathname),
  );

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRouteFromLocation(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = (nextRoute: AppRoute) => {
    const nextPath = getPathFromRoute(nextRoute);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute(nextRoute);
  };

  return (
    <>
      <style>{globalStyle}</style>
      <div
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Nav route={route} onNavigate={navigate} />
        <main style={{ flex: 1 }}>
          {route.kind === "brokers" && (
            <BrokersPage
              onOpenDetail={(slug) => navigate({ kind: "detail", slug })}
              onOpenSubmit={() => navigate({ kind: "submit" })}
            />
          )}
          {route.kind === "detail" && (
            <DetailPage
              key={route.slug}
              slug={route.slug}
              onNavigate={navigate}
            />
          )}
          {route.kind === "submit" && (
            <SubmitPage onNavigateHome={() => navigate({ kind: "brokers" })} />
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
