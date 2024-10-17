"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getUserSessionsAction,
  invalidateUserSessionAction,
  invalidateAllSessionsAction,
} from "./actions";
import { SelectSession } from "@/db/schemas/sessionSchema";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const columnHelper = createColumnHelper<SelectSession>();

export default function UserSessionsTable({ userId }: { userId: number }) {
  const queryClient = useQueryClient();

  const {
    data: sessions = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userSessions", userId],
    queryFn: () => getUserSessionsAction(userId),
  });

  const invalidateSessionMutation = useMutation({
    mutationFn: invalidateUserSessionAction,
    onSuccess: (_, sessionId) => {
      toast({
        title: "Session Revoked",
        description: "User session has been revoked successfully",
      });
      queryClient.setQueryData<SelectSession[]>(
        ["userSessions", userId],
        (oldData) =>
          oldData?.filter((session) => session.id !== sessionId) || []
      );
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const invalidateAllSessionsMutation = useMutation({
    mutationFn: () => invalidateAllSessionsAction(userId),
    onSuccess: () => {
      toast({
        title: "All Sessions Revoked",
        description: "All user sessions have been revoked successfully",
      });
      queryClient.setQueryData<SelectSession[]>(["userSessions", userId], []);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRevokeSession = (sessionId: string) => {
    invalidateSessionMutation.mutate(sessionId);
  };

  const columns = [
    columnHelper.accessor("ipAddress", {
      cell: (info) => info.getValue(),
      header: "IP Address",
    }),
    columnHelper.accessor("userAgent", {
      cell: (info) => info.getValue(),
      header: "User Agent",
    }),
    columnHelper.accessor("expiresAt", {
      cell: (info) => new Date(info.getValue()).toLocaleString(),
      header: "Expires At",
    }),
    columnHelper.display({
      id: "actions",
      cell: (props) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleRevokeSession(props.row.original.id)}
          disabled={invalidateSessionMutation.isPending}
        >
          Revoke
        </Button>
      ),
      header: "Actions",
    }),
  ];

  const table = useReactTable({
    data: sessions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-red-500 text-center">Failed to load user sessions</p>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No active sessions
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {sessions.length > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => invalidateAllSessionsMutation.mutate()}
          disabled={invalidateAllSessionsMutation.isPending}
        >
          Revoke All Sessions
        </Button>
      )}
    </div>
  );
}
