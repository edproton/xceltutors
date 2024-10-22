import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

const formatSegmentName = (segment: string): string => {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const routeNameMap: { [key: string]: string } = {
  "": "Home",
  tutors: "Tutors",
  students: "Students",
  sessions: "Sessions",
  admin: "Admin",
  applications: "Applications",
  ratings: "Ratings",
  progress: "Progress",
  upcoming: "Upcoming",
  past: "Past",
  reports: "Reports",
  users: "Users",
};

export function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === pathSegments.length - 1;
          const name = formatSegmentName(routeNameMap[segment] || segment);

          return (
            <BreadcrumbItem key={url}>
              {isLast ? (
                <BreadcrumbPage>{name}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink href={url}>{name}</BreadcrumbLink>
                  <ChevronRight className="h-4 w-4 mx-2" />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
