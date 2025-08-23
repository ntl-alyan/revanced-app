"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // ✅ use next/navigation
import Head from "next/head";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/src/lib/queryClient";
import { MainLayout } from "@/src/components/layout/main-layout";
import { PageHeader } from "@/src/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import {
    Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Switch } from "@/src/components/ui/switch";
import { Button } from "@/src/components/ui/button";
import { AppSectionsEditor } from "@/src/components/apps/app-sections-editor";
import { TranslationManager } from "@/src/components/language/translation-manager";
import { useToast } from "@/src/hooks/use-toast";
import { Card, CardContent } from "@/src/components/ui/card";
import { AlertCircle, Loader2, Languages, CookingPot } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";

// Function to generate a random download ID
const generateRandomId = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);


export default function EditAppPage() {
  const { toast } = useToast();
  const params = useParams(); // ✅ Next.js params
  const router = useRouter(); // ✅ router.replace / router.push
  const [activeTab, setActiveTab] = useState("basic");
  const [sections, setSections] = useState([]);
  const id = params?.id;

  // Initialize form
  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      version: "",
      downloadUrl: "",
      icon: "",
      featuredImage: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      isActive: true,
    },
  });

  // Query to get app data
  const { data: app, isLoading, error } = useQuery({
    queryKey: [`/api/apps/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/apps/${id}`);
      if (!res.ok) throw new Error("Failed to fetch apps");

      return res.json();
    },
  });

  // Update form when app data is fetched
  useEffect(() => {
    if (app) {
      form.reset({
        name: app.name,
        slug: app.slug,
        description: app.description,
        version: app.version,
        downloadUrl: app.downloadUrl,
        downloadId: app.downloadId || generateRandomId(),
        icon: app.icon,
        featuredImage: app.featuredImage,
        metaTitle: app.metaTitle,
        metaDescription: app.metaDescription,
        metaKeywords: app.metaKeywords || "",
        ogTitle: app.ogTitle || "",
        ogDescription: app.ogDescription || "",
        ogImage: app.ogImage || "",
        isActive: app.isActive,
      });

      if (app.sections) {
        try {
          let parsedSections;
          if (Array.isArray(app.sections)) {
            parsedSections = app.sections;
          } else if (typeof app.sections === "string") {
            parsedSections = JSON.parse(app.sections);
          } else if (typeof app.sections === "object") {
            parsedSections = app.sections;
          } else {
            parsedSections = [];
          }
          setSections(Array.isArray(parsedSections) ? parsedSections : []);
        } catch {
          setSections([]);
        }
      } else {
        setSections([]);
      }
    }
  }, [app, form]);

  // Update app mutation
  const mutation = useMutation({
    mutationFn: async (data) => {
      const appData = {
        ...data,
        sections: sections.length > 0 ? sections : [],
      };

      try {
        JSON.stringify(appData.sections);
      } catch {
        appData.sections = [];
      }

      const res = await apiRequest("PATCH", `/api/apps/${id}`, appData);
      return res;
    },
    onSuccess: () => {
      toast({
        title: "App updated",
        description: "The app has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/apps/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
      router.push("/admin/apps"); // ✅ navigate replaced
    },
    onError: (error) => {
      toast({
        title: "Error updating app",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    if (document.activeElement?.getAttribute("type") === "submit") {
      mutation.mutate(data);
    }
  };

  const generateSlug = () => {
    const name = form.getValues("name");
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      form.setValue("slug", slug);
    }
  };

  if (error) {
    return (
      <MainLayout>
        <Head>
          <title>Error Loading App - ReVanced Admin Panel</title>
        </Head>
        <PageHeader
          title="Edit App"
          description="Update app information"
          backLink="/admin/apps"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load app data. The app may not exist or you don't have
            permission to edit it.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/admin/apps")}>
            Back to Apps
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <Head>
          <title>Loading App... - ReVanced Admin Panel</title>
        </Head>
        <PageHeader
          title="Edit App"
          description="Update app information"
          backLink="/admin/apps"
        />
        <div className="flex items-center justify-center min-h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>Edit App: {app?.name} - ReVanced Admin Panel</title>
      </Head>
      <PageHeader
        title={`Edit App: ${app?.name}`}
        description="Update app information and content"
        backLink="/admin/apps"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
         <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:w-2/3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="translations">
                <div className="flex items-center gap-1">
                  <Languages className="h-4 w-4" />
                  Translations
                </div>
              </TabsTrigger>
            </TabsList>
            
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* App Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter app name" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Slug */}
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input 
                            placeholder="Enter slug" 
                            {...field} 
                          />
                        </FormControl>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={generateSlug}
                        >
                          Generate
                        </Button>
                      </div>
                      <FormDescription>
                        Used in the URL: /apps/your-slug
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter app description" 
                        className="min-h-32" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Version */}
                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 1.0.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Download URL */}
                <FormField
                  control={form.control}
                  name="downloadUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Download URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Icon */}
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <div className="flex gap-4 items-start">
                        <div className="flex-1">
                          <FormControl>
                            <Input
                              className="font-mono"
                              placeholder="Enter icon URL from media library"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="mt-1">
                            URL from media library (upload in Media section)
                          </FormDescription>
                          <FormMessage />
                        </div>
                        
                        {/* Preview icon if available */}
                        {field.value && (
                          <div className="h-16 w-16 rounded-lg overflow-hidden border border-border flex items-center justify-center bg-white/10">
                            <img src={field.value} alt="App Icon" className="max-h-12 max-w-12" />
                          </div>
                        )}
                      </div>
                      
                      {field.value && (
                        <div className="flex items-center mt-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => field.onChange("")}
                            className="h-7 px-2 text-xs text-destructive hover:text-destructive/90"
                          >
                            Clear Icon
                          </Button>
                        </div>
                      )}
                    </FormItem>
                  )}
                />
                
                {/* Featured Image */}
                <FormField
                  control={form.control}
                  name="featuredImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image</FormLabel>
                      <div className="flex gap-4 items-start">
                        <div className="flex-1">
                          <FormControl>
                            <Input
                              className="font-mono"
                              placeholder="Enter image URL from media library"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="mt-1">
                            URL to the app's featured image
                          </FormDescription>
                          <FormMessage />
                        </div>
                        
                        {/* Preview image if available */}
                        {field.value && (
                          <div className="h-16 w-16 rounded-lg overflow-hidden border border-border flex items-center justify-center bg-white/10">
                            <img src={field.value} alt="Featured Image" className="max-h-12 max-w-12" />
                          </div>
                        )}
                      </div>
                      
                      {field.value && (
                        <div className="flex items-center mt-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => field.onChange("")}
                            className="h-7 px-2 text-xs text-destructive hover:text-destructive/90"
                          >
                            Clear Image
                          </Button>
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Is Active */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Make this app visible to the public
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </TabsContent>
            
            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="border-b pb-4 mb-4">
                    <p className="text-sm text-muted-foreground">
                      Add content sections below and click the Save button when done. Changes are only saved when you submit the form.
                    </p>
                  </div>
                  <AppSectionsEditor 
                    sections={sections} 
                    setSections={(newSections) => {
                      // Only update the sections state, don't trigger form submission
                      setSections(newSections);
                    }} 
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-6 border-b pb-6">
                    <h3 className="text-lg font-medium">Search Engine Optimization</h3>
                    
                    {/* Meta Title */}
                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter meta title" {...field} />
                          </FormControl>
                          <FormDescription>
                            Shown in search results and browser tabs
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Meta Description */}
                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter meta description"
                              className="min-h-24"
                              maxLength={160}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Brief description shown in search results. Aim for 150-160 characters.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Meta Keywords */}
                    <FormField
                      control={form.control}
                      name="metaKeywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Keywords</FormLabel>
                          <FormControl>
                            <Input placeholder="keyword1, keyword2, keyword3" {...field} />
                          </FormControl>
                          <FormDescription>
                            Keywords separated by commas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-6 pt-2">
                    <h3 className="text-lg font-medium">Social Media Sharing</h3>
                    
                    {/* OG Title */}
                    <FormField
                      control={form.control}
                      name="ogTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OG Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Open Graph title" {...field} />
                          </FormControl>
                          <FormDescription>
                            Title displayed when sharing on social media
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* OG Description */}
                    <FormField
                      control={form.control}
                      name="ogDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OG Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter Open Graph description"
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Description displayed when sharing on social media
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* OG Image */}
                    <FormField
                      control={form.control}
                      name="ogImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OG Image</FormLabel>
                          <div className="flex gap-4 items-start">
                            <div className="flex-1">
                              <FormControl>
                                <Input 
                                  placeholder="Enter Open Graph image URL" 
                                  className="font-mono"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Image displayed when sharing on social media (1200×630 pixels recommended)
                              </FormDescription>
                              <FormMessage />
                            </div>
                            
                            {/* Preview image if available */}
                            {field.value && (
                              <div className="h-16 w-16 rounded-lg overflow-hidden border border-border flex items-center justify-center bg-white/10">
                                <img src={field.value} alt="OG Image" className="max-h-12 max-w-12" />
                              </div>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Translations Tab */}
            <TabsContent value="translations" className="space-y-6">
              {app ? (
                <TranslationManager 
                  contentType="app"
                  contentId={app._id}
                  originalData={app}
                />
              ) : (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/apps")}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="min-w-24">
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </MainLayout>
  );
}
