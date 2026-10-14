"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarClock,
  CalendarHeart,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Stethoscope,
  Sun,
  User,
  ShieldCheck,
} from "lucide-react";
import { type ReactNode } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/providers/theme-provider";

const doctorNav = [
  { title: "Overview", url: "/doctor" as const, icon: LayoutDashboard },
  { title: "Appointments", url: "/doctor/appointments" as const, icon: CalendarHeart },
  { title: "Availability", url: "/doctor/availability" as const, icon: CalendarClock },
  { title: "Profile", url: "/doctor/profile" as const, icon: User },
];

function DoctorSidebar() {
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
        <Link href="/doctor" className="flex items-center gap-2.5 px-2 py-1.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <Stethoscope className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 truncate font-display text-base font-semibold group-data-[collapsible=icon]:hidden">
            LifeLedger <span className="text-muted-foreground">Care</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Doctor Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {doctorNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
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
              tooltip="Settings"
              isActive={pathname === "/doctor/settings"}
            >
              <Link href="/doctor/settings">
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

export function DoctorShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const doctorName = user
    ? `Dr. ${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "Doctor"
    : "Doctor";

  const doctorSub =
    user && "specialization" in user && user.specialization
      ? `${user.specialization}${user.hospital ? ` · ${user.hospital}` : ""}`
      : "Medical Practitioner";

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "DR"
    : "DR";

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-surface">
        <DoctorSidebar />
        <SidebarInset className="bg-surface">
          <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-xl lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger className="min-h-11 min-w-11 shrink-0" />
              <p className="min-w-0 truncate font-display text-sm font-semibold text-foreground">
                {doctorName}
                <span className="ml-2 font-sans text-xs font-normal text-muted-foreground">
                  {doctorSub}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <ThemeToggle />
              <Link
                href="/doctor/profile"
                className="ml-1 rounded-full transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="View Doctor Profile"
              >
                <Avatar className="size-9 border border-border/80">
                  {user?.profilePhoto || user?.avatar ? (
                    <AvatarImage
                      src={user.profilePhoto || user.avatar}
                      alt={doctorName}
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

export function DoctorPageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="pt-6 pb-2">
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
    </div>
  );
}
