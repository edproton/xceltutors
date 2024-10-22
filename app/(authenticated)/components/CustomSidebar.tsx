"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  BadgeCheck,
  Bell,
  Calendar,
  ChevronsUpDown,
  CreditCard,
  GalleryVerticalEnd,
  GraduationCap,
  LifeBuoy,
  LogOut,
  Moon,
  Send,
  Settings2,
  SquareTerminal,
  Sun,
  Users,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { DynamicBreadcrumbs } from "./DynamicBreadcrumbs";
import { MenuItemInfo } from "./MenuItemInfo";
import { MenuAvatar } from "./MenuAvatar";

const data = {
  user: {
    name: "John Doe",
    email: "john@xceltutors.com",
    avatar: "/avatars/john-doe.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
    },
    {
      title: "Tutors",
      url: "/tutors",
      icon: GraduationCap,
      items: [
        {
          title: "All Tutors",
          url: "/tutors",
        },
        {
          title: "Tutor Applications",
          url: "/tutors/applications",
        },
        {
          title: "Tutor Ratings",
          url: "/tutors/ratings",
        },
      ],
    },
    {
      title: "Students",
      url: "/students",
      icon: Users,
      items: [
        {
          title: "All Students",
          url: "/students",
        },
        {
          title: "Student Progress",
          url: "/students/progress",
        },
      ],
    },
    {
      title: "Sessions",
      url: "/sessions",
      icon: Calendar,
      items: [
        {
          title: "Upcoming Sessions",
          url: "/sessions/upcoming",
        },
        {
          title: "Past Sessions",
          url: "/sessions/past",
        },
        {
          title: "Session Reports",
          url: "/sessions/reports",
        },
      ],
    },
    {
      title: "Admin",
      url: "/admin",
      icon: Settings2,
      items: [
        {
          title: "Users",
          url: "/admin/users",
        },
        {
          title: "Sessions",
          url: "/admin/sessions",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
    },
  ],
};

interface CustomSidebarProps {
  children: React.ReactNode;
  name: string;
  picture: string | null;
  email: string;
}

export default function CustomSidebar({
  children,
  name,
  picture,
  email,
}: CustomSidebarProps) {
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
  const pathname = usePathname();

  const isActive = (url: string) => {
    if (url === "/dashboard" && pathname === "/") return true;
    return pathname.startsWith(url);
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">XcelTutors</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={isActive(item.url)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      {state == "collapsed" ? (
                        <Link href={item.url}>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className={
                              isActive(item.url)
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : ""
                            }
                          >
                            <MenuItemInfo
                              icon={item.icon}
                              title={item.title}
                              url={item.url}
                              items={item.items}
                            />
                          </SidebarMenuButton>
                        </Link>
                      ) : (
                        <SidebarMenuButton
                          tooltip={item.title}
                          className={
                            isActive(item.url)
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : ""
                          }
                        >
                          <MenuItemInfo
                            icon={item.icon}
                            title={item.title}
                            url={item.url}
                            items={item.items}
                          />
                        </SidebarMenuButton>
                      )}
                    </CollapsibleTrigger>
                    {item.items && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className={
                                  isActive(subItem.url)
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : ""
                                }
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {data.navSecondary.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      size="sm"
                      className={
                        isActive(item.url)
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : ""
                      }
                    >
                      <Link href={item.url}>
                        <item.icon />
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <MenuAvatar name={name} picture={picture} />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{name}</span>
                      <span className="truncate text-xs">{email}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <MenuAvatar name={name} picture={picture} />
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{name}</span>
                        <span className="truncate text-xs">{email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      <span>Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Notifications</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                    >
                      {theme === "dark" ? (
                        <Sun className="mr-2 h-4 w-4" />
                      ) : (
                        <Moon className="mr-2 h-4 w-4" />
                      )}
                      <span>{theme === "dark" ? "Light" : "Dark"} mode</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <div className="flex-1 overflow-auto">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />
          <DynamicBreadcrumbs />
        </header>
        <main className="flex-1 p-4">{children}</main>
      </div>
    </>
  );
}
