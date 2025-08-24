"use client"
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from 'next/link'
import { MainLayout } from "@/src/components/layout/main-layout";
import { PageHeader } from "@/src/components/layout/page-header";
import Head from 'next/head'
import { 
  AppWindow, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Link as LinkIcon,
  FileDown,
  Eye
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Badge } from "@/src/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/src/lib/queryClient";
import { useToast } from "@/src/hooks/use-toast";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function AppsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState("");

  // Fetch apps
  const { data: apps, isLoading } = useQuery({
    queryKey: ["/api/apps"],
    queryFn: async () => {
      const res = await fetch("/api/apps");
      if (!res.ok) throw new Error("Failed to fetch apps");

      return res.json();
    },
  });

  // Delete app mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res= await apiRequest("DELETE", `/api/apps/${id}`);
      return await res;
    },
    onSuccess: async () => {
        await queryClient.refetchQueries({
      queryKey: ["/api/apps"]
    });
      toast({
        title: "App deleted",
        description: "The app has been successfully deleted",
      });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error deleting app",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle delete
  const handleDelete = () => {
    if (selectedAppId) {
      console.log(selectedAppId)
      deleteMutation.mutate(selectedAppId);
    }
  };

  // Filter apps by search term
  const filteredApps = apps?.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <Head>
        <title>Apps - ReVanced Admin Panel</title>
      </Head>
      <PageHeader
        title="Apps"
        description="Manage app content and features for your blog"
        actionLabel="Create App"
        actionLink="/admin/apps/create"
        actionIcon={<Plus className="h-4 w-4" />}
      />
      
      <div className="w-full max-w-xs">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="mt-6">
        {isLoading ? (
          // Loading skeletons
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video w-full bg-muted">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardHeader>
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredApps && filteredApps.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredApps.map((app) => (
              <Card key={app._id} className="overflow-hidden">
                {app.featuredImage ? (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={app.featuredImage} 
                      alt={app.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-muted flex items-center justify-center">
                    <AppWindow className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{app.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {app.description || "No description available"}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/apps/edit/${app._id}`} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedAppId(app._id);
                            setShowDeleteDialog(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <a href={`/apps/${app.slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {app.version && (
                      <Badge variant="outline">v{app.version}</Badge>
                    )}
                    <Badge variant={app.isActive ? "default" : "secondary"}>
                      {app.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild className="gap-2">
                    <Link href={`/admin/apps/edit/${app._id}`}>
                      <Edit className="h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <div className="flex gap-2">
                    {app.downloadUrl && (
                      <Button variant="outline" size="icon" asChild title="Download URL">
                        <a href={app.downloadUrl} target="_blank" rel="noopener noreferrer">
                          <FileDown className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="icon" asChild title="View public page">
                      <a href={`/apps/${app.slug}`} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="border rounded-md p-8 text-center">
            <AppWindow className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold">No apps found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm ? 
                "No apps match your search. Try a different term." : 
                "Get started by creating a new app."
              }
            </p>
            {!searchTerm && (
              <Button asChild className="mt-4">
                <Link href="/admin/apps/create">Create App</Link>
              </Button>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the app
              and all of its content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}