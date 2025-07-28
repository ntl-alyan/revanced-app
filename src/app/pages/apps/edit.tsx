import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { z } from "zod";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  insertAppSchema,
  appSectionSchema,
  App,
  InsertApp
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/layout/page-header";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSectionsEditor } from "@/components/apps/app-sections-editor";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2, Languages, CookingPot } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TranslationManager } from "@/components/language/translation-manager";

// Function to generate a random download ID
const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Form schema with validation
const formSchema = insertAppSchema.extend({
  slug: z.string().min(3, { message: "Slug must be at least 3 characters" }).regex(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens",
  }),
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  downloadId: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
});

export default function EditAppPage() {
  const { toast } = useToast();
  const params = useParams();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("basic");
  const [sections, setSections] = useState<z.infer<typeof appSectionSchema>[]>([]);
  const id = params.id;

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
      isActive: true
    },
  });

  // Query to get app data
  const { data: app, isLoading, error } = useQuery<App>({
    queryKey: [`/api/apps/${id}`],
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
        downloadId: app.downloadId || generateRandomId(), // Use existing ID or generate a new one if missing
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

      // Parse and set sections if available
      if (app.sections) {
        try {
          // console.log("Loading sections from app data:", app.sections);
          
          // Handle different possible section formats
          let parsedSections;
          if (Array.isArray(app.sections)) {
            // If it's already an array, use it directly
            parsedSections = app.sections;
            // console.log("Sections already in array format");
          } else if (typeof app.sections === 'string') {
            // If it's a JSON string, parse it
            parsedSections = JSON.parse(app.sections);
            // console.log("Parsed sections from string:", parsedSections);
          } else if (typeof app.sections === 'object') {
            // If it's an object but not an array, try to use it
            parsedSections = app.sections;
            // console.log("Using sections as object:", parsedSections);
          } else {
            console.warn("Sections in unexpected format:", typeof app.sections);
            parsedSections = [];
          }
          
          // Ensure we always have a valid array
          if (!Array.isArray(parsedSections)) {
            console.warn("Parsed sections is not an array, using empty array");
            parsedSections = [];
          }
          
          setSections(parsedSections);
        } catch (e) {
          console.error("Error parsing sections:", e);
          setSections([]);
        }
      } else {
        // console.log("No sections data available, using empty array");
        setSections([]);
      }
    }
  }, [app, form]);

  // Update app mutation
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      try {
        // Prepare app data with proper handling of sections
        const appData: Partial<InsertApp> = {
          ...data,
          sections: sections.length > 0 ? sections : []
        };
        
        // Log the data being sent for debugging
        // console.log("Updating app with data:", JSON.stringify(appData));
        
        // Make sure sections is properly serializable
        try {
          // Test if sections can be properly serialized
          JSON.stringify(appData.sections);
          // console.log("Sections successfully serialized");
        } catch (serializationError) {
          console.error("Sections serialization error:", serializationError);
          // Provide a fallback empty array
          appData.sections = [];
        }
        
        // Perform the API request
        const res = await apiRequest("PATCH", `/api/apps/${id}`, appData);
        const updatedApp = await res.json();
        // console.log("App updated successfully:", updatedApp);
        return updatedApp;
      } catch (error) {
        console.error("Error updating app:", error);
        throw error; // Re-throw to trigger onError callback
      }
    },
    onSuccess: () => {
      toast({
        title: "App updated",
        description: "The app has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/apps/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
      navigate("/admin/apps");
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating app",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Only submit the form if the submit button was actually clicked
    // This prevents auto-submission when sections are added
    if (document.activeElement?.getAttribute('type') === 'submit') {
      mutation.mutate(data);
    }
  };

  // Generate slug from name
  const generateSlug = () => {
    const name = form.getValues("name");
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special chars except whitespace and hyphen
        .replace(/\s+/g, "-") // Replace whitespace with hyphen
        .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
      form.setValue("slug", slug);
    }
  };

  // Show error if app not found
  if (error) {
    return (
      <MainLayout>
        <Helmet>
          <title>Error Loading App - ReVanced Admin Panel</title>
        </Helmet>
        <PageHeader
          title="Edit App"
          description="Update app information"
          backLink="/admin/apps"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load app data. The app may not exist or you don't have permission to edit it.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin/apps")}
          >
            Back to Apps
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout>
        <Helmet>
          <title>Loading App... - ReVanced Admin Panel</title>
        </Helmet>
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
      <Helmet>
        <title>Edit App: {app?.name} - ReVanced Admin Panel</title>
      </Helmet>
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
                  contentId={app.id}
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/admin/apps")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="min-w-24"
            >
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