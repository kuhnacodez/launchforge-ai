"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, Wand2, FolderOpen, CreditCard,
  User, Settings, LogOut, ChevronLeft, ChevronRight, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/generate", icon: Wand2, label: "Generate" },
  { href: "/projects", icon: FolderOpen, label: "Projects" },
  { href: "/pricing", icon: CreditCard, label: "Billing" },
];

const BOTTOM_ITEMS = [
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useUser();

  const displayName = profile?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const email = user?.email ?? "";
  const avatarUrl = profile?.avatar_url ?? undefined;
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={cn(
        "flex flex-col h-full bg-background border-r border-border/50 transition-all duration-300",
        mobile ? "w-64" : collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-16 px-4 border-b border-border/50", !collapsed && "gap-2")}>
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        {(!collapsed || mobile) && (
          <span className="font-bold text-base tracking-tight ml-2">
            Launch<span className="text-violet-500">Forge</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-violet-500/10 text-violet-500 shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && !mobile && "justify-center px-2"
              )}
              title={collapsed && !mobile ? item.label : undefined}
            >
              <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-violet-500")} />
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Bottom items */}
      <div className="p-3 space-y-1">
        {BOTTOM_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all",
              collapsed && !mobile && "justify-center px-2"
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {(!collapsed || mobile) && <span>{item.label}</span>}
          </Link>
        ))}

        {/* User info */}
        <div className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 mt-1",
          collapsed && !mobile && "justify-center px-2"
        )}>
          <Avatar className="h-7 w-7 flex-shrink-0">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-xs bg-violet-500/20 text-violet-400">{initials}</AvatarFallback>
          </Avatar>
          {(!collapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all",
            collapsed && !mobile && "justify-center px-2"
          )}
          title={collapsed && !mobile ? "Sign Out" : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {(!collapsed || mobile) && <span>{signingOut ? "Signing out…" : "Sign Out"}</span>}
        </button>

        {/* Collapse toggle (desktop only) */}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-all",
              collapsed && "justify-center px-2"
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : (
              <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>
            )}
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 h-full z-50 lg:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex h-16 items-center gap-4 px-4 border-b border-border/50 bg-background">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-bold">LaunchForge</span>
        </div>

        <main className="flex-1 overflow-y-auto bg-background/50">
          {children}
        </main>
      </div>
    </div>
  );
}
