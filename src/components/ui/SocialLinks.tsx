import { SOCIAL_LINKS } from "@/lib/site";

/** Crisp, optically centered official brand silhouettes (24×24 viewBox). */
export function WhatsAppIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.03 2C6.51 2 2.02 6.49 2.02 12c0 1.76.46 3.48 1.34 5l-1.42 5.18 5.3-1.39a9.97 9.97 0 0 0 4.79 1.22h.01c5.52 0 10.01-4.49 10.01-10.01S17.55 2 12.03 2Zm5.83 14.17c-.25.7-1.44 1.33-2.01 1.42-.52.08-1.18.11-1.91-.12-.44-.14-1.01-.33-1.74-.64-3.06-1.32-5.06-4.42-5.21-4.62-.15-.2-1.24-1.65-1.24-3.15 0-1.5.78-2.24 1.06-2.55.28-.3.61-.38.81-.38h.58c.19 0 .44-.07.69.52.25.6.86 2.1.94 2.25.08.15.13.33.03.53-.1.2-.15.33-.3.5-.15.18-.32.4-.46.53-.15.15-.31.32-.13.62.18.3.79 1.31 1.7 2.12 1.17 1.04 2.16 1.37 2.46 1.52.3.15.48.13.66-.08.18-.2.76-.89.96-1.19.2-.3.41-.25.69-.15.28.1 1.78.84 2.08.99.3.15.51.23.58.35.08.13.08.73-.17 1.43Z" />
    </svg>
  );
}

export function InstagramIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.81.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.81-.41 2.23a3.7 3.7 0 0 1-.9 1.38 3.7 3.7 0 0 1-1.38.9c-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.81-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.81.41-2.23a3.7 3.7 0 0 1 .9-1.38 3.7 3.7 0 0 1 1.38-.9c.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.87 5.87 0 0 0-2.12 1.39A5.87 5.87 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.71 1.46 1.39 2.12a5.87 5.87 0 0 0 2.12 1.39c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.87 5.87 0 0 0 2.12-1.39 5.87 5.87 0 0 0 1.39-2.12c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.87 5.87 0 0 0-1.39-2.12A5.87 5.87 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
    </svg>
  );
}

export function FacebookIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}

interface SocialLinksProps {
  tone?: "dark" | "light";
  compact?: boolean;
  className?: string;
  /** Marks the WhatsApp button as the dock target of the floating WhatsApp button. */
  waTarget?: boolean;
}

export function SocialLinks({ tone = "light", compact = false, className = "", waTarget = false }: SocialLinksProps) {
  const baseBtn =
    tone === "dark"
      ? "border-paper/20 text-paper/85 hover:border-copper-light hover:bg-copper hover:text-paper"
      : "border-ink/20 bg-paper text-ink hover:border-copper hover:bg-ink hover:text-paper";

  const items = [
    { name: "WhatsApp", href: SOCIAL_LINKS.whatsapp(), Icon: WhatsAppIcon },
    { name: "Instagram", href: SOCIAL_LINKS.instagram, Icon: InstagramIcon },
    { name: "Facebook", href: SOCIAL_LINKS.facebook, Icon: FacebookIcon },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {items.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          data-wa-target={waTarget && name === "WhatsApp" ? "" : undefined}
          className={`inline-flex items-center gap-2 rounded-full border transition-all duration-300 active:scale-95 ${
            compact ? "size-9 justify-center" : "h-9 px-3.5 text-xs tracking-wide"
          } ${baseBtn}`}
        >
          <Icon className="size-3.5 shrink-0" />
          {!compact && <span className="num text-xs font-medium">{name}</span>}
        </a>
      ))}
    </div>
  );
}
