"use client";
import { useState, useEffect } from "react";
import { MainLayout } from "@/src/components/layout/main-layout";
import { PageHeader } from "@/src/components/layout/page-header";
import { RichTextEditor } from "@/src/components/editor/rich-text-editor";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/src/components/ui/card";
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
import { Redirect, useLocation } from "wouter";
import { useParams } from "next/navigation";
import { generateSlug } from "@/src/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function EditPagePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [content, setContent] = useState("");
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  // ✅ FIX: add queryFn
  const { data: page, isLoading: pageLoading, error: pageError } = useQuery({
    queryKey: [`/api/pages/${id}`],
    queryFn: async () => {
      return await apiRequest("GET", `/api/pages/${id}`);
    },
    enabled: !!id, // only fetch if id exists
  });

  const form = useForm({
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      status: "draft",
      metaTitle: "",
      metaDescription: "",
      author: user?._id,
    },
  });

  // ✅ fill form with existing page
  useEffect(() => {
    if (page) {
      form.reset({
        title: page.title,
        slug: page.slug,
        content: page.content || "",
        status: page.status,
        metaTitle: page.metaTitle || "",
        metaDescription: page.metaDescription || "",
        author: page.author,
      });
      setContent(page.content || "");
    }
  }, [page, form]);

  const watchTitle = form.watch("title");

  const updatePageMutation = useMutation({
    mutationFn: async (data) => {
      return await apiRequest("PUT", `/api/pages/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Page updated",
        description: "Your page has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/pages/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      navigate("/admin/pages");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update page: ${error.message || "Something went wrong"}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    const pageData = {
      ...data,
      content,
    };
    updatePageMutation.mutate(pageData);
  };

  const handleGenerateSlug = () => {
    if (!watchTitle) return;
    setIsGeneratingSlug(true);
    const slug = generateSlug(watchTitle);
    form.setValue("slug", slug);

    if (!form.getValues("metaTitle")) {
      form.setValue("metaTitle", watchTitle);
    }

    setIsGeneratingSlug(false);
  };

  // if (!user) {
  //   return <Redirect to="/auth" />;
  // }

  if (pageLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (pageError || !page) {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Error Loading Page</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {pageError?.message || "Page not found"}
          </p>
          <Button onClick={() => navigate("/admin/pages")}>
            Return to Pages
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Edit Page"
        description={`Editing: ${page.title}`}
      />

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
                            placeholder="Enter page title"
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
                            <Input placeholder="page-slug" {...field} />
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
                    placeholder="Write your page content here..."
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
                              value={field.value}
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
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardFooter className="flex justify-between pt-6">
                  <Button variant="outline" type="button" onClick={() => navigate("/admin/pages")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updatePageMutation.isPending}>
                    {updatePageMutation.isPending ? "Updating..." : "Update Page"}
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
