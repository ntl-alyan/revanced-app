import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { Redirect } from "@shared/schema";

export default function RedirectsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [redirectToDelete, setRedirectToDelete] = useState<number | null>(null);

  // Fetch redirects
  const { data: redirects = [], isLoading } = useQuery<Redirect[]>({
    queryKey: ["/api/redirects"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/redirects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/redirects"] });
      toast({
        title: "Redirect deleted",
        description: "The redirect has been deleted successfully.",
      });
      setRedirectToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete redirect: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Columns for the table
  const columns = [
    {
      accessorKey: "sourceUrl",
      header: "Source URL",
      cell: ({ row }: any) => (
        <div className="max-w-[200px] truncate font-medium">
          {row.original.sourceUrl}
        </div>
      ),
    },
    {
      accessorKey: "targetUrl",
      header: "Target URL",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2 max-w-[200px] truncate">
          <span>{row.original.targetUrl}</span>
          <a
            href={row.original.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      ),
    },
    {
      accessorKey: "statusCode",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge variant={row.original.statusCode === 301 ? "default" : "secondary"}>
          {row.original.statusCode}
        </Badge>
      ),
    },
    {
      accessorKey: "isPermanent",
      header: "Type",
      cell: ({ row }: any) => (
        <Badge variant={row.original.isPermanent ? "default" : "outline"}>
          {row.original.isPermanent ? "Permanent" : "Temporary"}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: any) => (
        <div className="flex items-center">
          {row.original.isActive ? (
            <span className="flex items-center text-green-600">
              <CheckCircle2 className="mr-1" size={16} /> Active
            </span>
          ) : (
            <span className="flex items-center text-gray-400">
              <XCircle className="mr-1" size={16} /> Inactive
            </span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation(`/admin/redirects/edit/${row.original.id}`)}
          >
            <Edit size={16} />
          </Button>
          <AlertDialog open={redirectToDelete === row.original.id} onOpenChange={(open) => !open && setRedirectToDelete(null)}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700"
                onClick={() => setRedirectToDelete(row.original.id)}
              >
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the redirect. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-700"
                  onClick={() => {
                    if (redirectToDelete) {
                      deleteMutation.mutate(redirectToDelete);
                    }
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <DashboardHeader
        heading="URL Redirects"
        text="Manage URL redirects to maintain SEO when changing URLs on your site."
      >
        <Button onClick={() => setLocation("/admin/redirects/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Redirect
        </Button>
      </DashboardHeader>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : redirects.length === 0 ? (
        <div className="bg-card rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium">No redirects found</h3>
          <p className="text-muted-foreground mt-2">
            Create your first redirect to help maintain SEO when changing URLs.
          </p>
          <Button
            className="mt-4"
            onClick={() => setLocation("/admin/redirects/new")}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Redirect
          </Button>
        </div>
      ) : (
        <div className="bg-background rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.accessorKey || column.id}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {redirects.map((redirect) => (
                <TableRow key={redirect.id}>
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey || column.id}>
                      {column.cell({ row: { original: redirect } })}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}