import { SOCIAL_LINKS } from "@/lib/site";

export function WhatsAppIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20.5 11.8a8.5 8.5 0 0 1-12.5 7.5L3.5 20.5l1.3-4.3A8.5 8.5 0 1 1 20.5 11.8Z" />
      <path d="M9.4 8.9c-.2-.5-.5-.5-.8-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.1 3.1 1.3 3.3c.2.2 2.2 3.4 5.4 4.7 2.6 1 3.2.8 3.8.8.6-.1 1.9-.8 2.1-1.5.3-.7.3-1.3.2-1.5-.1-.1-.3-.2-.6-.4l-2-.9c-.3-.1-.5-.2-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function InstagramIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14 8h2.5V4.5H14a4 4 0 0 0-4 4V11H7.5v3.5H10V20h3.5v-5.5h2.6l.6-3.5h-3.2V8.5c0-.3.2-.5.5-.5Z" />
    </svg>
  );
}

interface SocialLinksProps {
  tone?: "dark" | "light";
  compact?: boolean;
  className?: string;
}

export function SocialLinks({ tone = "light", compact = false, className = "" }: SocialLinksProps) {
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
          className={`inline-flex items-center gap-2 rounded-full border transition-all duration-300 active:scale-95 ${
            compact ? "size-9 justify-center" : "h-9 px-3.5 text-xs tracking-wide"
          } ${baseBtn}`}
        >
          <Icon className="size-4 shrink-0" />
          {!compact && <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em]">{name}</span>}
        </a>
      ))}
    </div>
  );
}

