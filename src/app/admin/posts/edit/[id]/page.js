"use client"
import { useState, useEffect } from "react";
import { MainLayout } from "@/src/components/layout/main-layout";
import { PageHeader } from "@/src/components/layout/page-header";
import { RichTextEditor } from "@/src/components/editor/rich-text-editor";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Card, CardContent, CardFooter } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { apiRequest, queryClient } from "@/src/lib/queryClient";
import { useToast } from "@/src/hooks/use-toast";
import { useAuth } from "@/src/hooks/use-auth";
import { generateSlug } from "@/src/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useRouter,useParams } from "next/navigation";


export default function EditPostPage() {
  const { id } = useParams();
  const postId = id;

  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  const {
    data: post,
    isLoading: postLoading,
    error: postError,
  } = useQuery({
    queryKey: [`/api/posts/${postId}`],
    queryFn: () => apiRequest("GET", `/api/posts/${postId}`),
    // enabled: !isNaN(postId),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => apiRequest("GET", "/api/categories"), // now returns JSON
  });

  const form = useForm({
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      status: "draft",
      metaTitle: "",
      metaDescription: "",
      categoryId: "",
      author: user?.id,
    },
  });

  // Update form with post data once loaded
  useEffect(() => {
    if (post) {
      console.log(post);
      form.reset({
        title: post.title,
        slug: post.slug,
        content: post.content || "",
        excerpt: post.excerpt || "",
        categoryId: post.categoryId?.toString() || "",
        status: post.status,
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        featuredImage: post.featuredImage || "",
        author: post.author?.toString() || "",
      });
      setContent(post.content || "");
    }
  }, [post, form]);

  const watchTitle = form.watch("title");

  const updatePostMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("PUT", `/api/posts/${postId}`, data);
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      router.push("/admin/posts");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    // Include content from RichTextEditor
    const postData = {
      ...data,
      content,
    };
    updatePostMutation.mutate(postData);
  };

  const handleGenerateSlug = () => {
    if (!watchTitle) return;

    setIsGeneratingSlug(true);
    const slug = generateSlug(watchTitle);
    form.setValue("slug", slug);

    // Auto-generate meta title if empty
    if (!form.getValues("metaTitle")) {
      form.setValue("metaTitle", watchTitle);
    }

    setIsGeneratingSlug(false);
  };

  // Redirect if not authenticated
  if (!user) {
    return router.push("/auth");
  }

  // Show loading state
  if (postLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (postError || !post) {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-500 mb-2">
            Error Loading Post
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {postError ? postError.message : "Post not found"}
          </p>
          <Button onClick={() => router.push("/posts")}>Return to Posts</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader title="Edit Post" description={`Editing: ${post.title}`} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter post title"
                            {...field}
                            className="text-lg font-medium"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Slug</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="post-slug" {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleGenerateSlug}
                            disabled={isGeneratingSlug || !watchTitle}
                          >
                            Generate
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <FormLabel>Content</FormLabel>
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write your post content here..."
                    className="min-h-[400px] mt-2"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <Tabs defaultValue="general">
                    <TabsList className="w-full">
                      <TabsTrigger value="general" className="flex-1">
                        General
                      </TabsTrigger>
                      <TabsTrigger value="seo" className="flex-1">
                        SEO
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="pt-4 space-y-4">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || post?.status}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">
                                  Published
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value?.toString() || post?.categoryId} // Ensure value is string
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {!categoriesLoading &&
                                  categories?.map((category) => (
                                    <SelectItem
                                      key={category._id}
                                      value={category._id.toString()} // Ensure value is string
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="excerpt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Excerpt</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief excerpt of your post..."
                                {...field}
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="seo" className="pt-4 space-y-4">
                      <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Title</FormLabel>
                            <FormControl>
                              <Input placeholder="SEO Title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="SEO Description..."
                                {...field}
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="featuredImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Featured Image URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="/uploads/image.webp"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardFooter className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.push("/posts")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updatePostMutation.isPending}>
                    {updatePostMutation.isPending
                      ? "Updating..."
                      : "Update Post"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </MainLayout>
  );
}
