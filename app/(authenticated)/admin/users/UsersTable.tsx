"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

interface ActionsColumnProps {
  user: SelectUser;
  onStatusToggle: (user: SelectUser) => void;
  onViewDetails: (userId: string | number) => void;
}

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

const ActionsCell = ({
  user,
  onStatusToggle,
  onViewDetails,
}: ActionsColumnProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">
            Open menu for user {user.firstName} {user.lastName}
          </span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => onViewDetails(user.id)}
          className="cursor-pointer"
        >
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onStatusToggle(user)}
          className="cursor-pointer"
        >
          {user.isActive ? "Deactivate" : "Activate"} User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const StatusToggleDialog = ({
  isOpen,
  onClose,
  onConfirm,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  user: SelectUser | null;
}) => {
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

export default function UserTable({ users }: { users: SelectUser[] }) {
  const router = useRouter();
  const [filtering, setFiltering] = useState({
    id: "",
    name: "",
    email: "",
    type: "All",
    isActive: "All",
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [userToToggle, setUserToToggle] = useState<SelectUser | null>(null);

  const handleViewDetails = useCallback(
    (userId: string | number) => {
      router.push(`/admin/users/${userId}`);
    },
    [router]
  );

  const handleStatusToggle = useCallback(async () => {
    if (!userToToggle) return;

    try {
      // Add your status toggle API call here
      console.log(
        `Toggling status for user ${
          userToToggle.id
        } to ${!userToToggle.isActive}`
      );
      // After successful toggle, refresh the table data

      // Close dialog
      setUserToToggle(null);
    } catch (error) {
      console.error("Failed to toggle user status:", error);
      // Handle error (show toast, etc.)
    }
  }, [userToToggle]);

  const getFilterValue = useCallback(
    (value: string) => (value === "All" ? "" : value),
    []
  );

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFiltering((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearAllFiltersAndSorts = useCallback(() => {
    setFiltering({
      id: "",
      name: "",
      email: "",
      type: "All",
      isActive: "All",
    });
    setSorting([]);
  }, []);

  const clearSorts = useCallback(() => {
    setSorting([]);
  }, []);

  const columns = useMemo<ColumnDef<SelectUser>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => {
          return (
            <div className="hidden md:block">
              <Button
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="p-0 hover:bg-transparent"
              >
                <span>ID</span>
                {column.getIsSorted() === "asc" ? (
                  <ChevronUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ChevronDown className="ml-1 h-4 w-4" />
                ) : null}
              </Button>
            </div>
          );
        },
        cell: ({ row }) => (
          <div className="hidden md:block">
            {row.getValue("id") ?? <Badge variant="outline">Unknown</Badge>}
          </div>
        ),
      },
      {
        accessorKey: "picture",
        header: "Picture",
        cell: ({ row }) => (
          <div className="hidden md:block">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={row.original.picture || undefined}
                alt={`${row.original.firstName} ${row.original.lastName}`}
              />
              <AvatarFallback>
                {`${row.original.firstName[0]}${row.original.lastName[0]}`.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "firstName",
        header: ({ column }) => {
          return (
            <div className="hidden md:block">
              <Button
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="p-0 hover:bg-transparent"
              >
                <span>First Name</span>
                {column.getIsSorted() === "asc" ? (
                  <ChevronUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ChevronDown className="ml-1 h-4 w-4" />
                ) : null}
              </Button>
            </div>
          );
        },
        cell: ({ row }) => (
          <div className="hidden md:block font-medium">
            {row.getValue("firstName") ?? (
              <Badge variant="outline">Unknown</Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "lastName",
        header: ({ column }) => {
          return (
            <div className="hidden md:block">
              <Button
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="p-0 hover:bg-transparent"
              >
                <span>Last Name</span>
                {column.getIsSorted() === "asc" ? (
                  <ChevronUp className="ml-1 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ChevronDown className="ml-1 h-4 w-4" />
                ) : null}
              </Button>
            </div>
          );
        },
        cell: ({ row }) => (
          <div className="hidden md:block font-medium">
            {row.getValue("lastName") ?? (
              <Badge variant="outline">Unknown</Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              <span>Email</span>
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-1 h-4 w-4" />
              ) : null}
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            {row.getValue("email") ?? <Badge variant="outline">Unknown</Badge>}
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              <span>Type</span>
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-1 h-4 w-4" />
              ) : null}
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="min-w-[100px]">
            <Badge variant="secondary">
              {row.getValue("type") ?? "Unknown"}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              <span>Status</span>
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="ml-1 h-4 w-4" />
              ) : null}
            </Button>
          );
        },
        cell: ({ row }) => {
          const value = row.getValue("isActive");

          if (value === null || value === undefined) {
            return <Badge variant="outline">Unknown</Badge>;
          }

          return (
            <div className="flex items-center gap-2">
              {value ? (
                <>
                  <CheckCircle2
                    className="h-5 w-5 text-green-700"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Active</span>
                  <span className="text-sm text-muted-foreground hidden md:inline">
                    Active
                  </span>
                </>
              ) : (
                <>
                  <XCircle
                    className="h-5 w-5 text-red-700"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Inactive</span>
                  <span className="text-sm text-muted-foreground hidden md:inline">
                    Inactive
                  </span>
                </>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <ActionsCell
            user={row.original}
            onStatusToggle={setUserToToggle}
            onViewDetails={handleViewDetails}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [handleViewDetails]
  );

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        (filtering.id ? user.id.toString().includes(filtering.id) : true) &&
        (filtering.name
          ? `${user.firstName} ${user.lastName}`
              .toLowerCase()
              .includes(filtering.name.toLowerCase())
          : true) &&
        (filtering.email
          ? user.email.toLowerCase().includes(filtering.email.toLowerCase())
          : true) &&
        (getFilterValue(filtering.type)
          ? user.type === filtering.type
          : true) &&
        (getFilterValue(filtering.isActive) !== ""
          ? user.isActive === (filtering.isActive === "true")
          : true)
    );
  }, [users, filtering, getFilterValue]);

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={clearAllFiltersAndSorts}
              disabled={
                !sorting.length &&
                !Object.values(filtering).some(
                  (value) => value !== "" && value !== "All"
                )
              }
            >
              Clear All Filters & Sorts
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={clearSorts}
              disabled={!sorting.length}
            >
              Clear Sorts
            </Button>
          </div>
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

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap">
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
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Total {filteredUsers.length} users
            </div>
            {sorting.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Sorted by:{" "}
                {sorting
                  .map((sort) => `${sort.id} (${sort.desc ? "desc" : "asc"})`)
                  .join(", ")}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
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
