import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import logo from "../../public/images/logo.png";

const cols = {
  product: [
    { name: "Workflows",       href: "/workflows" },
    { name: "Pricing",         href: "/pricing" },
    { name: "About Workflows", href: "/workflows-guide" },
  ],
  developers: [
    { name: "Documentation", href: "https://support.myapps.ai/aitutor-api/aitutor-api-info", external: true },
    { name: "API Reference", href: "https://support.myapps.ai/aitutor-api/aitutor-api-info", external: true },
  ],
  company: [
    { name: "Support", href: "https://support.myapps.ai/aitutor-api/aitutor-api-info", external: true },
    { name: "Privacy", href: "/#" },
    { name: "Terms",   href: "/#" },
  ],
};

const FooterCol = ({ heading, items }: { heading: string; items: { name: string; href: string; external?: boolean }[] }) => (
  <div>
    <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">{heading}</h3>
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.name}>
          <Link
            href={item.href}
            prefetch={false}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export function Footer({ isHome = false }: { isHome?: boolean }) {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 xl:gap-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <Link href="/" prefetch={false} className="group inline-flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 transition duration-200 group-hover:ring-primary/40">
                <Image src={logo} alt="" width={16} height={16} className="object-contain" />
              </div>
              <span className="text-sm font-bold tracking-tight">AI Tutor</span>
              <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 ring-1 ring-primary/20 px-1.5 py-0.5 rounded-md">API</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
              The multi-model AI gateway for developers who ship fast.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-dot-pulse" />
              <span className="text-[11px] text-muted-foreground">All systems operational</span>
            </div>
          </div>

          <FooterCol heading="Product"    items={cols.product} />
          <FooterCol heading="Developers" items={cols.developers} />
          <FooterCol heading="Company"    items={cols.company} />
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AI Tutor API &mdash; All rights reserved.
          </p>
          <a
            href="https://x.com/myaitutor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            aria-label="Follow on X"
          >
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zM17.083 20.084h1.833L7.084 4.126H5.117L17.083 20.084z" />
            </svg>
            @myaitutor
          </a>
        </div>
      </div>
    </footer>
  );
}
