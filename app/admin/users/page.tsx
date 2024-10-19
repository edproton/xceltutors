"use client";

import {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
  Suspense,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, MoreHorizontal, Loader2, Plus, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { fetchUsersAction } from "./actions";
import { SelectUserSchema } from "@/db/schemas/userSchema";

function UserManagement() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    data: users = [],
    isLoading: isInitialLoading,
    isError,
  } = useQuery<SelectUserSchema[]>({
    queryKey: ["users"],
    queryFn: () => fetchUsersAction(),
  });

  if (isError) {
    toast({
      title: "Error",
      description: "Failed to load users.",
      variant: "destructive",
    });
  }

  const clearFilter = () => {
    setGlobalFilter("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const navigateToEditPage = useCallback(
    (userId: string) => {
      router.push(`/admin/users/${userId}?backToPage=${pagination.pageIndex}`);
    },
    [pagination.pageIndex, router]
  );

  const navigateToCreatePage = useCallback(() => {
    router.push(`/admin/users/create?backToPage=${pagination.pageIndex}`);
  }, [pagination.pageIndex, router]);

  const columns: ColumnDef<SelectUserSchema>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hidden md:flex"
            >
              ID
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="hidden md:block">{row.getValue("id")}</div>
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
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.getValue("email")}</div>,
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
              className="hidden md:flex"
            >
              Type
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const type = row.getValue("type") as string;
          return (
            <Badge
              variant={type === "STUDENT" ? "default" : "secondary"}
              className="hidden md:inline-flex"
            >
              {type}
            </Badge>
          );
        },
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
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const isActive = row.getValue("isActive") as boolean;
          return (
            <Badge variant={isActive ? "success" : "destructive"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigateToEditPage(user.id.toString())}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [navigateToEditPage]
  );

  const table = useReactTable({
    autoResetPageIndex: false,
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
  });

  useEffect(() => {
    const handlePagination = () => {
      const pageParam = searchParams.get("page");
      const backToPageParam = searchParams.get("backToPage");

      let newPageIndex: number | null = null;

      if (pageParam) {
        newPageIndex = parseInt(pageParam, 10);
      } else if (backToPageParam) {
        newPageIndex = parseInt(backToPageParam, 10);
      }

      if (newPageIndex !== null && !isNaN(newPageIndex) && newPageIndex >= 0) {
        table.setPageIndex(newPageIndex);
      }
    };

    handlePagination();

    // Add event listener for popstate (browser back/forward)
    window.addEventListener("popstate", handlePagination);

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handlePagination);
    };
  }, [searchParams, table.setPageIndex]);

  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("page", pagination.pageIndex.toString());
    router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
  }, [pagination.pageIndex, pathname, router, searchParams]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>User List</CardTitle>
          <CardDescription>Manage existing users</CardDescription>
        </div>
        <Button onClick={navigateToCreatePage}>
          <Plus className="mr-2 h-4 w-4" /> Create User
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center py-4 space-y-2 md:space-y-0 md:space-x-2">
          <div className="relative w-full md:w-1/2 lg:w-1/3">
            <Input
              ref={searchInputRef}
              placeholder="Search users..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pr-8"
            />
            {globalFilter && (
              <Button
                variant="ghost"
                onClick={clearFilter}
                className="absolute right-0 top-0 h-full px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Select
            defaultValue="all"
            onValueChange={(value) =>
              table
                .getColumn("type")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="STUDENT">Student</SelectItem>
              <SelectItem value="TUTOR">Tutor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
              {isInitialLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-4 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Total {table.getFilteredRowModel().rows.length} entries
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserManagementPage() {
  return (
    <Suspense>
      <UserManagement />
    </Suspense>
  );
}
