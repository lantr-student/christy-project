"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloudSun, MessageCircle, LayoutDashboard } from "lucide-react";

const LINKS = [
  { href: "/", label: "Chat", icon: MessageCircle },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-hairline)] bg-[var(--surface-1)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
          <CloudSun size={22} className="text-[var(--series-1)]" />
          <span>AirAware</span>
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--series-1)] text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--gridline)]/40 hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
