import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/layout/page-header";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema, InsertPost } from "@shared/schema";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { generateSlug } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const extendedPostSchema = insertPostSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  content: z.string().optional(),
});


export default function CreatePostPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [content, setContent] = useState("");
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => apiRequest("GET", "/api/categories"), // now returns JSON
  });

  const form = useForm({
    resolver: zodResolver(extendedPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      status: "draft",
      metaTitle: "",
      metaDescription: "",
      author: user?._id,
    },
  });

  const watchTitle = form.watch("title");

  const createPostMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/posts", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your post has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      navigate("/admin/posts");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    console.log(data)
    // Include content from RichTextEditor
    const postData = {
      ...data,
      content,
      author: user?._id
    };
    console.log(postData)
    createPostMutation.mutate(postData);
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
    return <Redirect to="/auth" />;
  }

  return (
    <MainLayout>
      <PageHeader
        title="Create Post"
        description="Create a new blog post"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
    console.log("Form validation errors:", errors, user.toObject()
  )})}  className="space-y-6">
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
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-update slug only if slug is empty
                              if (!form.getValues("slug")) {
                                const slug = generateSlug(e.target.value);
                                form.setValue("slug", slug);
                              }
                            }}
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
                      <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
                      <TabsTrigger value="seo" className="flex-1">SEO</TabsTrigger>
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
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(value)} 
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories?.map((category) => (
                                  <SelectItem 
                                    key={category._id} 
                                    value={category._id.toString()}
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
                              <Input placeholder="/uploads/image.webp" {...field} />
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
                  <Button variant="outline" type="button" onClick={() => navigate("/admin/posts")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPostMutation.isPending}>
                    {createPostMutation.isPending ? "Creating..." : "Create Posting"}
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
