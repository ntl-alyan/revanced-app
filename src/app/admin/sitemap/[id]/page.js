"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // ✅ next/navigation
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useToast } from "@/src/hooks/use-toast";
import { queryClient, apiRequest } from "@/src/lib/queryClient";
import { DashboardHeader } from "@/src/components/ui/dashboard-header";



export default function EditSitemapEntryPage() {
  const params = useParams(); // ✅ access params
  const router = useRouter(); // ✅ use router for navigation
  const { toast } = useToast();

  const id = params?.id;
  const isEditing = id !== "new" && id !== undefined;

  // Fetch sitemap entry if editing
  const { data: entry, isLoading: isLoadingEntry } = useQuery({
    queryKey: [`/api/sitemap/${id}`],
    enabled: isEditing,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/sitemap/${id}`);
      return res.json();
    },
  });

  // Form
  const form = useForm({
    defaultValues: {
      url: "",
      type: "page",
      changeFrequency: "weekly",
      priority: "0.5",
      isActive: true,
    },
  });

  // Reset values when editing existing entry
  useEffect(() => {
    if (entry) {
      form.reset({
        url: entry.url,
        type: entry.type,
        changeFrequency: entry.changeFrequency,
        priority: entry.priority,
        isActive: entry.isActive,
      });
    }
  }, [entry, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/sitemap", data);
      return await res;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/sitemap"] });
      toast({
        title: "Sitemap entry created",
        description: "The sitemap entry has been created successfully.",
      });
      router.push("/admin/sitemap"); // ✅ replaced setLocation
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create sitemap entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (!isEditing || id === "new") {
        throw new Error("Cannot update a new sitemap entry. Use create instead.");
      }
      const res = await apiRequest("PUT", `/api/sitemap/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sitemap"] });
      queryClient.invalidateQueries({ queryKey: [`/api/sitemap/${id}`] });
      toast({
        title: "Sitemap entry updated",
        description: "The sitemap entry has been updated successfully.",
      });
      router.push("/admin/sitemap"); // ✅ replaced setLocation
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update sitemap entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle submit
  const onSubmit = (data) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <DashboardHeader
        heading={isEditing ? "Edit Sitemap Entry" : "Create Sitemap Entry"}
        text={
          isEditing
            ? "Update an existing sitemap entry."
            : "Create a new sitemap entry to improve search engine visibility."
        }
      >
        <Button variant="outline" onClick={() => router.push("/admin/sitemap")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sitemap
        </Button>
      </DashboardHeader>

      {isEditing && isLoadingEntry ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-card rounded-lg p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* URL */}
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/page" {...field} />
                    </FormControl>
                    <FormDescription>
                      The full URL to include in the sitemap. Must include http:// or https://.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type, Frequency, Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="page">Page</SelectItem>
                          <SelectItem value="post">Post</SelectItem>
                          <SelectItem value="app">App</SelectItem>
                          <SelectItem value="category">Category</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="changeFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Change Frequency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="always">Always</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1.0">1.0 (Highest)</SelectItem>
                          <SelectItem value="0.9">0.9</SelectItem>
                          <SelectItem value="0.8">0.8</SelectItem>
                          <SelectItem value="0.7">0.7</SelectItem>
                          <SelectItem value="0.6">0.6</SelectItem>
                          <SelectItem value="0.5">0.5 (Default)</SelectItem>
                          <SelectItem value="0.4">0.4</SelectItem>
                          <SelectItem value="0.3">0.3</SelectItem>
                          <SelectItem value="0.2">0.2</SelectItem>
                          <SelectItem value="0.1">0.1 (Lowest)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* isActive */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Include this URL in the sitemap. Uncheck to temporarily exclude it.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {/* Submit */}
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Update Entry" : "Create Entry"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
