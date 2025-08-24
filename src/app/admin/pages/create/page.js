"use client";
import { useState } from "react";
import { MainLayout } from "@/src/components/layout/main-layout";
import { PageHeader } from "@/src/components/layout/page-header";
import { RichTextEditor } from "@/src/components/editor/rich-text-editor";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/src/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardFooter
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/src/components/ui/select";
import { apiRequest, queryClient } from "@/src/lib/queryClient";
import { useToast } from "@/src/hooks/use-toast";
import { useAuth } from "@/src/hooks/use-auth";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/src/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";

export default function CreatePagePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

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

  const watchTitle = form.watch("title");

 const createPageMutation = useMutation({
  mutationFn: async (data) => {
    // apiRequest should already return parsed JSON
    return await apiRequest("POST", "/api/pages", data);
  },
  onSuccess: () => {
    toast({
      title: "Page created",
      description: "Your page has been created successfully",
    });
    queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
    queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    router.push("/admin/pages");
  },
  onError: (error) => {
    toast({
      title: "Error",
      description: `Failed to create page: ${error.message || "Something went wrong"}`,
      variant: "destructive",
    });
  },
});


  const onSubmit = (data) => {
    const pageData = {
      ...data,
      content,
      author: user?._id,
    };
    createPageMutation.mutate(pageData);
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

  return (
    <MainLayout>
      <PageHeader
        title="Create Page"
        description="Create a new page for your website"
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
                            onChange={(e) => {
                              field.onChange(e);
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
                  <Button variant="outline" type="button" onClick={() => router.push("/admin/pages")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPageMutation.isPending}>
                    {createPageMutation.isPending ? "Creating..." : "Create Page"}
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
