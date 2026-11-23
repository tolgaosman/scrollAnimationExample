import Link from "next/link";

/** Fallback for requests that never reach a locale (rare: the proxy localizes almost everything). */
export default function GlobalNotFound() {
  return (
    <html lang="tr">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#efeae0", color: "#1c1814", padding: "4rem" }}>
        <p style={{ letterSpacing: "0.2em", fontSize: 12 }}>404 · CYPRUS ROASTERS</p>
        <h1 style={{ fontWeight: 300, fontSize: "3rem" }}>Bu sokak çıkmaz. / This street is a dead end.</h1>
        <Link href="/" style={{ color: "#b4643a" }}>
          Ana sayfa / Home
        </Link>
      </body>
    </html>
  );
}
