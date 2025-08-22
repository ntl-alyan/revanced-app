"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ useRouter instead of wouter
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
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
} from "@/src/components/ui/alert-dialog";
import { useToast } from "@/src/hooks/use-toast";
import { Badge } from "@/src/components/ui/badge";
import { queryClient, apiRequest } from "@/src/lib/queryClient";
import { DashboardHeader } from "@/src/components/ui/dashboard-header";

export default function SitemapPage() {
  const router = useRouter(); // ✅ next/navigation router
  const { toast } = useToast();
  const [entryToDelete, setEntryToDelete] = useState("");

  // Fetch sitemap entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["/api/sitemap"],
    // staleTime: 1000 * 60, // 1 minute
    queryFn: async () => {
      const res = await fetch("/api/sitemap");
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await apiRequest("DELETE", `/api/sitemap/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sitemap"] });
      toast({
        title: "Sitemap entry deleted",
        description: "The sitemap entry has been deleted successfully.",
      });
      setEntryToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete sitemap entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Format date to display only date portion
  const formatDate = (date) => {
	console.log(date)
    return new Date(date).toISOString().split("T")[0];
  };

  // Columns for the table
  const columns = [
    {
      accessorKey: "url",
      header: "URL",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2 max-w-[200px] truncate">
          <span className="font-medium">{row.original.url}</span>
          <a
            href={row.original.url}
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
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
    },
    {
      accessorKey: "changeFrequency",
      header: "Change Frequency",
      cell: ({ row }) => row.original.changeFrequency,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => row.original.priority,
    },
    {
      accessorKey: "lastModified",
      header: "Last Modified",
      cell: ({ row }) => formatDate(row.original.lastModified ? row.original.lastModified : row.original.createdAt),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
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
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push(`/admin/sitemap/edit/${row.original._id}`)
            } // ✅ replaced setLocation
          >
            <Edit size={16} />
          </Button>
          <AlertDialog
            open={entryToDelete === row.original._id}
            onOpenChange={(open) => !open && setEntryToDelete(null)}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700"
                onClick={() => setEntryToDelete(row.original._id)}
              >
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the sitemap entry. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-700"
                  onClick={() => {
                    if (entryToDelete) {
                      deleteMutation.mutate(entryToDelete);
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
        heading="Sitemap Management"
        text="Manage your website's XML sitemap for better search engine visibility."
      >
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => window.open("/sitemap.xml", "_blank")}
            className="flex items-center"
          >
            <FileText className="mr-2 h-4 w-4" /> View XML Sitemap
          </Button>
          <Button onClick={() => router.push("/admin/sitemap/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Entry
          </Button>
        </div>
      </DashboardHeader>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-card rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium">No sitemap entries found</h3>
          <p className="text-muted-foreground mt-2">
            Create your first sitemap entry to improve SEO and search engine
            visibility.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/admin/sitemap/new")} // ✅ replaced setLocation
          >
            <Plus className="mr-2 h-4 w-4" /> Add Entry
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
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey || column.id}>
                      {column.cell({ row: { original: entry } })}
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
