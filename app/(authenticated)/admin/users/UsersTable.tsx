"use client";

import { useMemo, useState, useCallback, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  flexRender,
  Column,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import { type SelectUser } from "@/db/schemas/userSchema";
import React from "react";

// Import all UI components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toggleUserStatusAction } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/providers/user-provider";

// Types
interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

interface ActionsColumnProps {
  targetUser: SelectUser;
  currentUser: SelectUser;
  onStatusToggle: (user: SelectUser) => void;
  onViewDetails: (userId: string | number) => void;
}

interface StatusToggleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  user: SelectUser | null;
}

// Reusable components
interface SortButtonProps {
  column: Column<SelectUser, unknown>;
  children: ReactNode;
}

const SortButton = ({ column, children }: SortButtonProps) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    className="p-0 hover:bg-transparent"
  >
    <span>{children}</span>
    {column.getIsSorted() && (
      <span className="ml-1">
        {column.getIsSorted() === "asc" ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </span>
    )}
  </Button>
);

const FilterInput = React.memo(
  ({ value, onChange, placeholder }: FilterInputProps) => (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-8"
        id={placeholder}
      />
      {value && (
        <button
          onClick={() => {
            onChange("");
            document.getElementById(placeholder)?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2"
          aria-label="Clear input"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  )
);
FilterInput.displayName = "FilterInput";

const StatusToggleDialog = ({
  isOpen,
  onClose,
  onConfirm,
  user,
}: StatusToggleDialogProps) => {
  if (!user) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to {user.isActive ? "deactivate" : "activate"}{" "}
            this user?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {user.isActive
              ? `This will prevent user ${user.email} from accessing their account.`
              : `This will allow user ${user.email} to get back to their normal account.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {user.isActive ? "Deactivate" : "Activate"} User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const ActionsCell = ({
  targetUser,
  currentUser,
  onStatusToggle,
  onViewDetails,
}: ActionsColumnProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <span className="sr-only">
          Open menu for User {targetUser.firstName} {targetUser.lastName}
        </span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-[160px]">
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      <DropdownMenuItem
        onClick={() => onViewDetails(targetUser.id)}
        className="cursor-pointer"
      >
        View Details
      </DropdownMenuItem>
      {currentUser.id !== targetUser.id && (
        <DropdownMenuItem
          onClick={() => onStatusToggle(targetUser)}
          className="cursor-pointer"
        >
          {targetUser.isActive ? "Deactivate" : "Activate"} User
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default function UserTable({ users }: { users: SelectUser[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [filtering, setFiltering] = useState({
    id: "",
    name: "",
    email: "",
    type: "All",
    isActive: "All",
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
    picture: false,
    firstName: false,
    lastName: false,
    type: false,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [userToToggle, setUserToToggle] = useState<SelectUser | null>(null);
  const { user: currentUser } = useUser();

  const handleViewDetails = useCallback(
    (userId: string | number) => router.push(`/admin/users/${userId}`),
    [router]
  );

  const handleStatusToggle = useCallback(async () => {
    if (!userToToggle) return;

    const result = await toggleUserStatusAction(
      userToToggle.id,
      !userToToggle.isActive
    );
    if (result.isSuccess) {
      toast({
        title: "Success",
        description: `User ${userToToggle.email} ${
          userToToggle.isActive ? "deactivated" : "activated"
        } successfully`,
      });
    } else {
      toast({
        title: "Error",
        variant: "destructive",
        description: result.error,
      });
    }
  }, [toast, userToToggle]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFiltering((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltering({ id: "", name: "", email: "", type: "All", isActive: "All" });
    setSorting([]);
  }, []);

  useEffect(() => {
    const updateVisibility = () => {
      const isLargeScreen = window.innerWidth >= 1024; // lg breakpoint
      setColumnVisibility({
        id: isLargeScreen,
        picture: isLargeScreen,
        firstName: isLargeScreen,
        lastName: isLargeScreen,
        type: isLargeScreen,
      });
    };

    // Initial update
    updateVisibility();

    // Add event listener with debounce
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateVisibility, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const columns = useMemo<ColumnDef<SelectUser>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => <SortButton column={column}>ID</SortButton>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.getValue("id")}
            {row.getValue("id") === currentUser.id && (
              <Badge variant="default">Me</Badge>
            )}
          </div>
        ),
        enableHiding: true,
      },
      {
        accessorKey: "picture",
        header: "Picture",
        cell: ({ row }) => (
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={row.original.picture || undefined}
              alt={`${row.original.firstName} ${row.original.lastName}`}
            />
            <AvatarFallback>
              {`${row.original.firstName[0]}${row.original.lastName[0]}`.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ),
        enableSorting: false,
        enableHiding: true,
      },
      {
        accessorKey: "firstName",
        header: ({ column }) => (
          <SortButton column={column}>First Name</SortButton>
        ),
        cell: ({ row }) =>
          row.getValue("firstName") ?? <Badge variant="outline">Unknown</Badge>,
        enableHiding: true,
      },
      {
        accessorKey: "lastName",
        header: ({ column }) => (
          <SortButton column={column}>Last Name</SortButton>
        ),
        cell: ({ row }) =>
          row.getValue("lastName") ?? <Badge variant="outline">Unknown</Badge>,
        enableHiding: true,
      },
      {
        accessorKey: "email",
        header: ({ column }) => <SortButton column={column}>Email</SortButton>,
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            {row.getValue("email") ?? <Badge variant="outline">Unknown</Badge>}
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: ({ column }) => <SortButton column={column}>Type</SortButton>,
        cell: ({ row }) => (
          <Badge variant="secondary">{row.getValue("type") ?? "Unknown"}</Badge>
        ),
        enableHiding: true,
      },
      {
        accessorKey: "isActive",
        header: ({ column }) => <SortButton column={column}>Status</SortButton>,
        cell: ({ row }) => {
          const isActive = row.getValue("isActive");
          if (isActive === null || isActive === undefined) {
            return <Badge variant="outline">Unknown</Badge>;
          }

          return (
            <div className="flex items-center gap-2">
              {isActive ? (
                <>
                  <CheckCircle2
                    className="h-5 w-5 text-green-700"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Active</span>
                </>
              ) : (
                <>
                  <XCircle
                    className="h-5 w-5 text-red-700"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Inactive</span>
                </>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ActionsCell
            currentUser={currentUser}
            targetUser={row.original}
            onStatusToggle={setUserToToggle}
            onViewDetails={handleViewDetails}
          />
        ),
        enableSorting: false,
      },
    ],
    [currentUser, handleViewDetails]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesId = filtering.id
        ? user.id.toString().includes(filtering.id)
        : true;
      const matchesName = filtering.name
        ? `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(filtering.name.toLowerCase())
        : true;
      const matchesEmail = filtering.email
        ? user.email.toLowerCase().includes(filtering.email.toLowerCase())
        : true;
      const matchesType =
        filtering.type !== "All" ? user.type === filtering.type : true;
      const matchesStatus =
        filtering.isActive !== "All"
          ? user.isActive === (filtering.isActive === "true")
          : true;

      return (
        matchesId && matchesName && matchesEmail && matchesType && matchesStatus
      );
    });
  }, [users, filtering]);

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      columnVisibility, // Add column visibility state
    },
    onColumnVisibilityChange: setColumnVisibility,
    initialState: {
      pagination: { pageSize: 5 },
    },
  });

  const hasFilters = Object.values(filtering).some(
    (value) => value !== "" && value !== "All"
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={clearFilters}
            disabled={!hasFilters && !sorting.length}
          >
            Clear All Filters & Sorts
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <FilterInput
            placeholder="Filter by ID"
            value={filtering.id}
            onChange={(value) => handleFilterChange("id", value)}
          />
          <FilterInput
            placeholder="Filter by Name"
            value={filtering.name}
            onChange={(value) => handleFilterChange("name", value)}
          />
          <FilterInput
            placeholder="Filter by Email"
            value={filtering.email}
            onChange={(value) => handleFilterChange("email", value)}
          />
          <Select
            value={filtering.type}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="tutor">Tutor</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filtering.isActive}
            onValueChange={(value) => handleFilterChange("isActive", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="p-2 lg:p-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="p-2 lg:p-4">
                        <div
                          className={
                            cell.column.id === "email"
                              ? "w-[40vw] sm:w-auto"
                              : ""
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <span className="text-muted-foreground">
                      No results found
                    </span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <span className="sr-only">Total users count: </span>
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1 ? "user" : "users"}
            </div>
            {sorting.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <span className="sr-only">Current sort order: </span>
                Sorted by:{" "}
                {sorting
                  .map(
                    (sort) =>
                      `${sort.id} (${sort.desc ? "descending" : "ascending"})`
                  )
                  .join(", ")}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground mr-2">
              <span className="sr-only">Current page: </span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <StatusToggleDialog
        isOpen={!!userToToggle}
        onClose={() => setUserToToggle(null)}
        onConfirm={handleStatusToggle}
        user={userToToggle}
      />
    </>
  );
}
