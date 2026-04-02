"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Receipt,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Products", href: "/products", icon: Package },
  { name: "Quotes", href: "/quotes", icon: FileText },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center border-b border-border px-5">
        <span className="text-base font-semibold tracking-tight text-primary">
          InvoGen
        </span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-accent/8 text-accent"
                  : "text-text-secondary hover:bg-surface-alt hover:text-text"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
