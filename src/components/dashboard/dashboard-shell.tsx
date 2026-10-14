"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarHeart,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  MapPin,
  Moon,
  Search,
  Settings,
  Siren,
  Sparkles,
  Stethoscope,
  Sun,
  Users,
  FileText,
  ShieldCheck,
  User,
} from "lucide-react";
import { type ReactNode } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/providers/theme-provider";

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Reports", url: "/reports", icon: FileText },
  { title: "Family Vault", url: "/family", icon: Users },
  { title: "Health Timeline", url: "/timeline", icon: HeartPulse },
];

const careNav = [
  { title: "Emergency Hub", url: "/emergency", icon: Siren },
  { title: "Nearby Hospitals", url: "/hospitals", icon: MapPin },
  { title: "Appointments", url: "/appointments", icon: CalendarHeart },
  { title: "Find Doctors", url: "/doctors", icon: Stethoscope },
];

export const notifications: Array<{
  title: string;
  body: string;
  time: string;
  unread: boolean;
}> = [];

function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("Signed out successfully.");
      router.replace("/signin");
    } catch {
      router.replace("/signin");
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-1.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <HeartPulse className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 truncate font-display text-base font-semibold group-data-[collapsible=icon]:hidden">
            LifeLedger
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Health</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Care</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {careNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Profile"
              isActive={pathname === "/profile"}
            >
              <Link href="/profile">
                <User aria-hidden="true" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              isActive={pathname === "/settings"}
            >
              <Link href="/settings">
                <Settings aria-hidden="true" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Sign out"
              className="cursor-pointer text-muted-foreground hover:text-destructive"
            >
              <LogOut aria-hidden="true" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="min-h-11 min-w-11"
      aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }}
    >
      {resolvedTheme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}

export function NotificationsPanel() {
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative min-h-11 min-w-11"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {unread > 0 ? (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display">Notifications</SheetTitle>
          <SheetDescription>Health updates for you and your family.</SheetDescription>
        </SheetHeader>
        <div className="space-y-3 overflow-y-auto px-4 pb-6">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
              <Bell className="size-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-semibold">No notifications</p>
              <p className="mt-1 text-xs text-muted-foreground">You are all caught up.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.title}
                className="rounded-lg border border-border bg-card p-4 data-[unread=true]:border-primary/30 data-[unread=true]:bg-primary-soft/40"
                data-unread={n.unread}
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold">{n.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.body}</p>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "LL"
    : "AS";

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-surface">
        <AppSidebar />
        <SidebarInset className="bg-surface">
          <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-xl lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger className="min-h-11 min-w-11 shrink-0" />
              <div className="relative hidden min-w-0 flex-1 sm:block sm:max-w-sm">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  placeholder="Search reports, doctors, medicines"
                  className="h-10 pl-9"
                  aria-label="Search your health vault"
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Badge variant="secondary" className="hidden gap-1.5 md:inline-flex">
                <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
                AI Vault active
              </Badge>
              <ThemeToggle />
              <NotificationsPanel />
              <Link
                href="/profile"
                className="ml-1 rounded-full transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="View Profile"
              >
                <Avatar className="size-9 border border-border/80">
                  {user?.profilePhoto || user?.avatar ? (
                    <AvatarImage
                      src={user.profilePhoto || user.avatar}
                      alt={user.fullName || user.firstName || "User"}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary-soft text-sm font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>
          <div id="main-content" className="flex-1 bg-aurora-soft px-4 pb-10 lg:px-6">
            {children}
          </div>
          <footer className="border-t border-border px-4 py-6 lg:px-6">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
              End-to-end encrypted · Stored in India · You choose who sees each record, and for how
              long.
            </p>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
