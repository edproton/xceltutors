"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  GalleryVerticalEnd,
  LogOut,
  LucideIcon,
  Moon,
  Sun,
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
import { navigationData } from "./data";
import { RoleType, SelectRole } from "@/db/schemas/roleSchema";
import { useUser } from "@/providers/user-provider";

interface CustomSidebarProps {
  children: React.ReactNode;
}

type MenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  roles?: RoleType[];
  items?: {
    title: string;
    url: string;
  }[];
};

const hasRequiredRoles = (userRoles: SelectRole[], roles?: RoleType[]) => {
  if (!roles?.length) return true;
  return userRoles.some((userRole) => roles.includes(userRole.name));
};

const renderSidebarMenuItem = (
  state: "expanded" | "collapsed",
  isActive: boolean,
  item: MenuItem,
  roles: SelectRole[]
) => {
  // Check main item roles
  if (!hasRequiredRoles(roles, item.roles)) {
    return null;
  }

  const baseMenu = (
    <SidebarMenuButton
      tooltip={item.title}
      className={
        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
      }
    >
      <MenuItemInfo
        icon={item.icon}
        title={item.title}
        url={item.url}
        items={item.items}
      />
    </SidebarMenuButton>
  );

  if (state === "collapsed" || !item.items) {
    return <Link href={item.url}>{baseMenu}</Link>;
  }
  if (state === "expanded") {
    return baseMenu;
  }
};

const CustomSidebarMenu = ({ roles }: { roles: SelectRole[] }) => {
  const { state } = useSidebar();
  const pathname = usePathname();
  const isActive = (url: string) => pathname.startsWith(url);

  return (
    <>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarGroup>
        <SidebarMenu>
          {navigationData.navMain.map((item) => {
            // Skip if user doesn't have required roles for main item
            if (!hasRequiredRoles(roles, item.roles)) {
              return null;
            }

            // Filter sub-items based on roles
            const filteredSubItems = item.items?.filter((subItem) =>
              hasRequiredRoles(roles, subItem.roles)
            );

            // If no sub-items left after filtering and main item has items,
            // skip rendering this menu item completely
            if (
              item.items &&
              (!filteredSubItems || filteredSubItems.length === 0)
            ) {
              return null;
            }

            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isActive(item.url)}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    {renderSidebarMenuItem(
                      state,
                      isActive(item.url),
                      item,
                      roles
                    )}
                  </CollapsibleTrigger>
                  {filteredSubItems && filteredSubItems.length > 0 && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {filteredSubItems.map((subItem) => (
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
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="mt-auto">
        <SidebarGroupContent>
          <SidebarMenu>
            {navigationData.navSecondary.map((item) => (
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
    </>
  );
};

export default function CustomSidebar({ children }: CustomSidebarProps) {
  const { theme, setTheme } = useTheme();
  const { user, roles } = useUser();

  const { picture, email } = user;
  const name = `${user.firstName} ${user.lastName}`;

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
          <CustomSidebarMenu roles={roles} />
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
