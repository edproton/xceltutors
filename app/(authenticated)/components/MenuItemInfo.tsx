import { ChevronRight, LucideIcon } from "lucide-react";

interface MenuItemInfoProps {
  title: string;
  url: string;
  icon: LucideIcon;
  items:
    | {
        title: string;
        url: string;
      }[]
    | undefined;
}

export const MenuItemInfo = (item: MenuItemInfoProps) => (
  <>
    {item.icon && <item.icon />}
    <span>{item.title}</span>
    {item.items && (
      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
    )}
  </>
);
