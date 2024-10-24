import {
  Calendar,
  GraduationCap,
  LifeBuoy,
  LucideIcon,
  Send,
  Settings2,
  SquareTerminal,
  Users,
} from "lucide-react";
import { RoleType } from "@/db/schemas/roleSchema";

// Interface for sub-items in navigation
export interface NavigationSubItem {
  title: string;
  url: string;
  roles?: RoleType[];
}

// Interface for main navigation items
export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: NavigationSubItem[];
  roles?: RoleType[];
}

// Interface for the complete navigation data structure
export interface NavigationData {
  navMain: NavigationItem[];
  navSecondary: NavigationItem[];
}

export const navigationData: NavigationData = {
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
          roles: [RoleType.Admin],
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
          roles: [RoleType.Admin],
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
        {
          title: "Mail Tester",
          url: "/admin/mail",
        },
      ],
      // roles: [RoleType.Admin],
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
