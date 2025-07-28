import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  insertAppSchema,
  appSectionSchema,
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
import { Loader2 } from "lucide-react";

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
});

export default function CreateAppPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("basic");
  const [sections, setSections] = useState<z.infer<typeof appSectionSchema>[]>([]);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      version: "",
      downloadUrl: "",
      downloadId: generateRandomId(), // Generate a random ID for download page
      icon: "",
      featuredImage: "",
      metaTitle: "",
      metaDescription: "",
      isActive: true
    },
  });

  // Create app mutation
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      try {
        // Prepare app data with proper handling of sections
        const appData: InsertApp = {
          ...data,
          sections: sections.length > 0 ? sections : []
        };
        
        // Log the data being sent for debugging
        // console.log("Creating app with data:", JSON.stringify(appData));
        
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
        const res = await apiRequest("POST", "/api/apps", appData);
        const createdApp = await res.json();
        // console.log("App created successfully:", createdApp);
        return createdApp;
      } catch (error) {
        console.error("Error creating app:", error);
        throw error; // Re-throw to trigger onError callback
      }
    },
    onSuccess: () => {
      toast({
        title: "App created",
        description: "The app has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
      navigate("/admin/apps");
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating app",
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

  // Auto-generate meta title from name if not set
  const autoGenerateMetaTitle = () => {
    const name = form.getValues("name");
    const currentMetaTitle = form.getValues("metaTitle");
    
    if (name && !currentMetaTitle) {
      form.setValue("metaTitle", name);
    }
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Create App - ReVanced Admin Panel</title>
      </Helmet>
      <PageHeader
        title="Create App"
        description="Add a new app to your blog"
        backLink="/admin/apps"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 lg:w-1/2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
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
                          onChange={(e) => {
                            field.onChange(e);
                            // Don't auto-generate if slug is manually set
                            if (!form.getValues("slug")) {
                              setTimeout(generateSlug, 500);
                            }
                          }}
                          onBlur={() => {
                            field.onBlur();
                            autoGenerateMetaTitle();
                          }}
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
                </CardContent>
              </Card>
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
                  Creating...
                </>
              ) : (
                "Create App"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </MainLayout>
  );
}