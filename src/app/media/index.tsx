import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Media } from "@shared/schema";
import { Link } from "wouter";
import { formatDate, fileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2, UploadCloud, Search, Image, FileText, Film, Music, File } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function MediaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteMediaId, setDeleteMediaId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: mediaItems, isLoading } = useQuery<Media[]>({
    queryKey: ["/api/media"],
  });

  const deleteMediaMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/media/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Media deleted",
        description: "The media file has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete media: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const confirmDelete = (id: number) => {
    setDeleteMediaId(id);
  };

  const handleDelete = () => {
    if (deleteMediaId) {
      deleteMediaMutation.mutate(deleteMediaId);
      setDeleteMediaId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteMediaId(null);
  };

  // Get file type icon based on mimetype
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (fileType.startsWith("video/")) {
      return <Film className="h-8 w-8 text-purple-500" />;
    } else if (fileType.startsWith("audio/")) {
      return <Music className="h-8 w-8 text-green-500" />;
    } else if (fileType.startsWith("text/")) {
      return <FileText className="h-8 w-8 text-orange-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  // Filter media items
  const filteredMedia = mediaItems?.filter((media) => {
    const matchesSearch = 
      media.originalFilename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      media.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || 
      (typeFilter === "image" && media.fileType.startsWith("image/")) ||
      (typeFilter === "video" && media.fileType.startsWith("video/")) ||
      (typeFilter === "audio" && media.fileType.startsWith("audio/")) ||
      (typeFilter === "document" && (
        media.fileType.startsWith("text/") || 
        media.fileType.includes("pdf") || 
        media.fileType.includes("document")
      ));
    return matchesSearch && matchesType;
  });

  return (
    <MainLayout>
      <PageHeader
        title="Media Library"
        description="Manage your media files"
        actionLabel="Upload Media"
        actionLink="/admin/media/upload"
        actionIcon={<UploadCloud className="mr-2 h-4 w-4" />}
      />

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search media files..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <Skeleton className="h-40 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMedia && filteredMedia.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMedia.map((media) => (
            <Card key={media.id} className="overflow-hidden">
              <div className="relative">
                {media.fileType.startsWith("image/") ? (
                  <img 
                    src={media.filePath} 
                    alt={media.originalFilename}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {getFileIcon(media.fileType)}
                  </div>
                )}
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8 opacity-80 hover:opacity-100"
                  onClick={() => confirmDelete(media.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-1 truncate" title={media.originalFilename}>
                  {media.originalFilename}
                </h3>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{fileSize(media.fileSize)}</span>
                  <span>{formatDate(media.createdAt)}</span>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {media.filename}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(media.filePath);
                      toast({
                        title: "Path copied",
                        description: "File path copied to clipboard",
                      });
                    }}
                  >
                    Copy Path
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Image className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No media files found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm || typeFilter !== "all" ? 
              "No media files match your search criteria" : 
              "Upload some media files to get started"}
          </p>
          <Button asChild>
            <Link href="/admin/media/upload">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Media
            </Link>
          </Button>
        </div>
      )}

      <AlertDialog open={deleteMediaId !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the media file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              {deleteMediaMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
