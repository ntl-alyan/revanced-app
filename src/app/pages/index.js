import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Page } from "@shared/schema";
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function PagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletePageId, setDeletePageId] = useState(null);
  const { toast } = useToast();

  const { data: pages, isLoading } = useQuery({
    queryKey: ["/api/pages"],
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id) => {
      await apiRequest("DELETE", `/api/pages/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Page deleted",
        description: "The page has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete page: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const confirmDelete = (id) => {
    setDeletePageId(id);
  };

  const handleDelete = () => {
    if (deletePageId) {
      deletePageMutation.mutate(deletePageId);
      setDeletePageId(null);
    }
  };

  const cancelDelete = () => {
    setDeletePageId(null);
  };

  // Filter pages
  const filteredPages = pages?.filter((page) => {
    const matchesSearch = page.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <PageHeader
        title="Pages"
        description="Manage your website pages"
        actionLabel="Create Page"
        actionLink="/admin/pages/create"
      >
        <a
          href="#"
          target="_blank"
          className="text-primary hover:underline flex items-center"
          onClick={(e) => {
            e.preventDefault();
            window.open("/", "_blank");
          }}
        >
          <Eye className="mr-1 h-4 w-4" />
          View Website
        </a>
      </PageHeader>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search pages..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-16 w-full mb-4" />
            <Skeleton className="h-16 w-full mb-4" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages && filteredPages.length > 0 ? (
                filteredPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>{page.slug}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          page.status === "published" ? "default" : "secondary"
                        }
                        className={
                          page.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900"
                            : ""
                        }
                      >
                        {page.status.charAt(0).toUpperCase() +
                          page.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(page.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/pages/edit/${page._id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => confirmDelete(page._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-24 text-gray-500 dark:text-gray-400"
                  >
                    {searchTerm || statusFilter !== "all" ? (
                      "No pages match your search criteria"
                    ) : (
                      <>
                        No pages found.{" "}
                        <Link
                          href="/admin/pages/create"
                          className="text-primary hover:underline"
                        >
                          Create your first page
                        </Link>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog open={deletePageId !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deletePageMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
