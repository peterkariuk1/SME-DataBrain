"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  FileUp,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/reports", icon: BarChart3, label: "Reports" },
  { href: "/dashboard/data", icon: FileUp, label: "Data" },
  { href: "/dashboard/assistant", icon: Bot, label: "AI Assistant" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    className="justify-start"
                    tooltip={item.label}
                  >
                    <item.icon className={cn(
                        "h-5 w-5 transition-colors text-muted-foreground group-hover:text-foreground",
                        pathname === item.href && "text-primary [text-shadow:0_0_8px_hsl(var(--primary))]"
                    )} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2">
             <Avatar className="h-8 w-8">
              <AvatarImage data-ai-hint="person avatar" src="https://picsum.photos/seed/user/100/100" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm truncate group-data-[collapsible=icon]:hidden">
                <span className="font-semibold">SME Owner</span>
                <span className="text-muted-foreground text-xs">user@example.com</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
              </Button>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
