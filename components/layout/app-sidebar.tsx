"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, PanelLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { navigation } from "@/components/layout/nav-config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-3">
        <div
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-occdo-700 text-xs font-semibold tracking-wide text-white"
        >
          OC
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">OCCDO</p>
            <p className="truncate text-xs text-slate-500">LGU Ormoc</p>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-end px-2 py-2">
        <Button
          aria-controls="app-sidebar-nav"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-full justify-center"
          onClick={() => {
            setCollapsed((current) => !current);
          }}
          variant="ghost"
        >
          <PanelLeft className="h-4 w-4" />
          {!collapsed ? <span>Collapse sidebar</span> : null}
        </Button>
      </div>

      <nav
        aria-label="Primary"
        className="flex-1 overflow-y-auto px-2 pb-4"
        id="app-sidebar-nav"
      >
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const hasChildren = Boolean(item.children?.length) && !collapsed;

            if (!hasChildren) {
              return (
                <li key={item.href + item.label}>
                  <Link
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700",
                      active
                        ? "bg-occdo-50 font-medium text-occdo-800"
                        : "text-slate-700 hover:bg-slate-100",
                      collapsed && "justify-center px-0",
                    )}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                    {!collapsed ? <span>{item.label}</span> : <span className="sr-only">{item.label}</span>}
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.href + item.label}>
                <Collapsible.Root defaultOpen={active}>
                  <div
                    className={cn(
                      "flex items-center rounded-md",
                      active ? "bg-occdo-50 text-occdo-800" : "text-slate-700",
                    )}
                  >
                    <Link
                      className={cn(
                        "flex min-w-0 flex-1 items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700",
                        active ? "font-medium" : "hover:bg-slate-100",
                      )}
                      href={item.href}
                    >
                      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                    <Collapsible.Trigger asChild>
                      <Button
                        aria-label={`Toggle ${item.label} submenu`}
                        className="mr-1 h-8 w-8 shrink-0 px-0"
                        variant="ghost"
                      >
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </Button>
                    </Collapsible.Trigger>
                  </div>
                  <Collapsible.Content>
                    <ul className="mt-1 space-y-0.5 border-l border-slate-200 ml-4 pl-3">
                      {item.children?.map((child) => (
                        <li key={child.label}>
                          <Link
                            className="block rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
                            href={child.href}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Collapsible.Content>
                </Collapsible.Root>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
