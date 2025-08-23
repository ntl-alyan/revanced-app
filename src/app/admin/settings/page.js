"use client";
import { useEffect } from "react";
import Head from "next/head";
import { MainLayout } from "@/src/components/layout/main-layout";
import { PageHeader } from "@/src/components/layout/page-header";
import { useAuth } from "@/src/hooks/use-auth";
import { useToast } from "@/src/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/src/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, Globe, Share2, Rss } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Separator } from "@/src/components/ui/separator";
import { apiRequest, queryClient } from "@/src/lib/queryClient";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Switch } from "@/src/components/ui/switch";
import { Skeleton } from "@/src/components/ui/skeleton";

// Define the schema for site settings
const siteSettingsSchema = z.object({
  site_title: z.string().min(2, "Site title is required"),
  site_description: z.string(),
  site_keywords: z.string(),
  site_author: z.string(),
  site_logo: z.string(),
  site_favicon: z.string(),
  homepage_logo: z.string(),
  revanced_logo: z.string(),
  posts_per_page: z.string().regex(/^\d+$/, "Must be a number"),
  disable_comments: z.boolean(),
  default_category: z.string(),
  contact_email: z
    .string()
    .email("Please enter a valid email")
    .or(z.string().length(0)),
  social_twitter: z.string(),
  social_facebook: z.string(),
  social_instagram: z.string(),
  social_linkedin: z.string(),
  social_github: z.string(),
  social_discord: z.string(),
  ga_tracking_id: z.string(),
  // Custom Scripts
  header_scripts: z.string(),
  footer_scripts: z.string(),
  // SEO Meta Tags for Homepage
  meta_title: z.string(),
  meta_description: z.string(),
  meta_keywords: z.string(),
  og_title: z.string(),
  og_description: z.string(),
  og_image: z.string(),
  og_url: z.string(),
  og_type: z.string(),
  twitter_card: z.string(),
  twitter_title: z.string(),
  twitter_description: z.string(),
  twitter_image: z.string(),
});

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");

      return res.json();
    },
  });

  const form = useForm({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      site_title: "",
      site_description: "",
      site_keywords: "",
      site_author: "",
      site_logo: "",
      site_favicon: "",
      homepage_logo: "",
      revanced_logo: "",
      posts_per_page: "10",
      disable_comments: false,
      default_category: "",
      contact_email: "",
      social_twitter: "",
      social_facebook: "",
      social_instagram: "",
      social_linkedin: "",
      social_github: "",
      social_discord: "",
      ga_tracking_id: "",
      // Custom Scripts
      header_scripts: "",
      footer_scripts: "",
      // SEO Meta Tags default values
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      og_title: "",
      og_description: "",
      og_image: "",
      og_url: "",
      og_type: "website",
      twitter_card: "summary_large_image",
      twitter_title: "",
      twitter_description: "",
      twitter_image: "",
    },
  });

  // Populate form with settings data once loaded
  useEffect(() => {
    if (settings) {
      const formValues = {};

      settings.forEach((setting) => {
        // Convert camelCase to snake_case for form field mapping
        // Example: 'siteTitle' becomes 'site_title'
        let formKey = setting.settingKey
          .replace(/([A-Z])/g, "_$1")
          .toLowerCase();

        // Special case for headerScripts/footerScripts to avoid extra underscore
        if (formKey === "_header_scripts") formKey = "header_scripts";
        if (formKey === "_footer_scripts") formKey = "footer_scripts";

        // console.log(`Mapping setting key ${setting.settingKey} to form field ${formKey}`);

        if (formKey === "disable_comments") {
          formValues[formKey] = setting.settingValue === "true";
        } else if (formKey in form.getValues()) {
          formValues[formKey] = setting.settingValue || "";
        }
      });

      form.reset({ ...form.getValues(), ...formValues });
    }
  }, [settings, form]);

  const updateSettingMutation = useMutation({
    mutationFn: async (settingsToUpdate) => {
      const results = [];

      // console.log("Settings mutation starting with settings:", settingsToUpdate);

      for (const { key, value } of settingsToUpdate) {
        const existingSetting = settings?.find((s) => s.settingKey === key);

        // console.log(`Processing setting: ${key}, value: ${value}, exists: ${!!existingSetting}`);
        try {
          if (existingSetting) {
            // Update existing setting
            // console.log(`Updating existing setting: ${key}`);
            const res = await apiRequest("PUT", `/api/settings/${key}`, {
              settingValue: value,
            });
            const result = await res;
            // console.log(`Update result for ${key}:`, result);
            results.push(result);
          } else {
            // Create new setting
            // console.log(`Creating new setting: ${key}`);
            const res = await apiRequest("POST", `/api/settings`, {
              settingKey: key,
              settingValue: value,
              settingType: typeof value === "boolean" ? "boolean" : "string",
            });
            const result = await res;
            // console.log(`Create result for ${key}:`, result);
            results.push(result);
          }
        } catch (error) {
          console.error(`Error processing setting ${key}:`, error);
          throw error;
        }
      }

      // console.log("Settings mutation completed successfully");
      return results;
    },
    onSuccess: () => {
      // Invalidate queries and show success toast
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data) => {
    try {
      // console.log("Form submitted with data:", data);

      // Convert snake_case form fields back to camelCase for storage
      const convertToCamelCase = (key) => {
        // Special cases first
        if (key === "header_scripts") return "headerScripts";
        if (key === "footer_scripts") return "footerScripts";

        // General rule: convert snake_case to camelCase
        return key.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
      };

      // Flatten object into key-value pairs with proper casing
      const settingsToUpdate = Object.entries(data).map(([key, value]) => ({
        key: convertToCamelCase(key),
        value: typeof value === "boolean" ? String(value) : value,
      }));

      // console.log("Settings to update:", settingsToUpdate);

      // Update all settings in one mutation
      updateSettingMutation.mutate(settingsToUpdate);
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast({
        title: "Error",
        description: `Failed to save settings: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Verify current user is admin
  if (user?.role !== "admin") {
    return (
      <MainLayout>
        <Head>
          <title>Access Denied - ReVanced Admin Panel</title>
        </Head>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You do not have permission to view this page. Only administrators
            can manage settings.
          </p>
          <Button asChild>
            <a href="/">Return to Dashboard</a>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>Settings - ReVanced Admin Panel</title>
      </Head>
      <PageHeader
        title="Settings"
        description="Configure your website settings"
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="contact">Contact & Social</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {isLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ) : (
              <>
                <TabsContent value="general">
                  <Card>
                    <CardHeader>
                      <CardTitle>General Settings</CardTitle>
                      <CardDescription>
                        Configure basic information about your website
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="site_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Title</FormLabel>
                            <FormControl>
                              <Input placeholder="My Blog" {...field} />
                            </FormControl>
                            <FormDescription>
                              The name of your website
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="site_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="A brief description of your website"
                                {...field}
                                rows={3}
                              />
                            </FormControl>
                            <FormDescription>
                              Used in meta tags and search results
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="site_keywords"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Keywords</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="blog, technology, news"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Comma-separated keywords for SEO
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="site_author"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Author</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormDescription>
                              The name of the site author or organization
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="appearance">
                  <Card>
                    <CardHeader>
                      <CardTitle>Appearance Settings</CardTitle>
                      <CardDescription>
                        Configure the look and feel of your website
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="site_logo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Logo URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="/uploads/logo.webp"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              The URL to your site logo (upload via Media
                              section first)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="site_favicon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Favicon URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="/uploads/favicon.webp"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              The URL to your site favicon
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="homepage_logo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Homepage Logo URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="/uploads/homepage-logo.webp"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              The URL to your homepage-specific logo
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="revanced_logo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ReVanced Front Logo URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="/uploads/revanced-logo.webp"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              The URL to your ReVanced front logo (used on
                              public pages)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="content">
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Settings</CardTitle>
                      <CardDescription>
                        Configure how content is displayed on your website
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="posts_per_page"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posts Per Page</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="50"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Number of posts to display per page
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="disable_comments"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Disable Comments
                              </FormLabel>
                              <FormDescription>
                                Turn off commenting functionality across the
                                site
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

                      <FormField
                        control={form.control}
                        name="default_category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Category</FormLabel>
                            <FormControl>
                              <Input placeholder="Uncategorized" {...field} />
                            </FormControl>
                            <FormDescription>
                              Default category name for new posts
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contact">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact & Social Media</CardTitle>
                      <CardDescription>
                        Configure contact information and social media links
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="contact_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="contact@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Public contact email for your website
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="social_twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter/X URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://twitter.com/yourusername"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="social_facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://facebook.com/yourpage"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="social_instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://instagram.com/yourusername"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="social_linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://linkedin.com/in/yourusername"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="social_github"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GitHub URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://github.com/yourusername"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="social_discord"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discord URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://discord.gg/yourinvite"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="seo">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Globe className="mr-2 h-5 w-5" />
                        SEO Information
                      </CardTitle>
                      <CardDescription>
                        Information about SEO settings in the system
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h3 className="text-lg font-medium flex items-center mb-2 text-blue-700 dark:text-blue-300">
                            <Globe className="mr-2 h-5 w-5" />
                            SEO Settings Location
                          </h3>
                          <p className="text-blue-600 dark:text-blue-400 mb-4">
                            SEO settings are managed directly in their
                            respective modules:
                          </p>
                          <ul className="list-disc list-inside space-y-2 text-blue-600 dark:text-blue-400">
                            <li>
                              <strong>Homepage SEO:</strong> Managed in the
                              "Homepage" module, in the SEO tab
                            </li>
                            <li>
                              <strong>App SEO:</strong> Managed in each app's
                              edit page, in the SEO tab
                            </li>
                            <li>
                              <strong>Post SEO:</strong> Managed in each post's
                              edit page, in the SEO tab
                            </li>
                            <li>
                              <strong>Page SEO:</strong> Managed in each page's
                              edit page, in the SEO tab
                            </li>
                          </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                          <h3 className="text-lg font-medium flex items-center mb-2 text-amber-700 dark:text-amber-300">
                            <Share2 className="mr-2 h-5 w-5" />
                            SEO Best Practices
                          </h3>
                          <ul className="list-disc list-inside space-y-2 text-amber-600 dark:text-amber-400">
                            <li>Keep meta titles between 50-60 characters</li>
                            <li>
                              Keep meta descriptions between 150-160 characters
                            </li>
                            <li>
                              Use unique meta titles and descriptions for each
                              page
                            </li>
                            <li>
                              Include relevant keywords naturally in titles and
                              descriptions
                            </li>
                            <li>
                              Use high-quality images for social media sharing
                              (1200x630px recommended)
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle>Analytics Settings</CardTitle>
                      <CardDescription>
                        Configure analytics and tracking for your website
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="ga_tracking_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Google Analytics ID</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Your Google Analytics tracking ID
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator className="my-4" />

                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Custom Scripts</h3>
                        <p className="text-sm text-muted-foreground">
                          Add custom scripts to your website's header and footer
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="header_scripts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Header Scripts</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="<!-- Your custom header scripts here -->"
                                {...field}
                                rows={5}
                                className="font-mono text-xs"
                              />
                            </FormControl>
                            <FormDescription>
                              Scripts to include in the &lt;head&gt; section of
                              your website (analytics, meta tags, etc.)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="footer_scripts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Footer Scripts</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="<!-- Your custom footer scripts here -->"
                                {...field}
                                rows={5}
                                className="font-mono text-xs"
                              />
                            </FormControl>
                            <FormDescription>
                              Scripts to include before the closing
                              &lt;/body&gt; tag (chat widgets, conversion
                              tracking, etc.)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                disabled={isLoading || updateSettingMutation.isPending}
              >
                {updateSettingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </MainLayout>
  );
}
