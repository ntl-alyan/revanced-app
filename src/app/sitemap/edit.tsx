import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { insertSitemapEntrySchema, SitemapEntry } from "@shared/schema";

// Extend the schema with additional validation
const formSchema = insertSitemapEntrySchema.extend({
  url: z.string().min(1, "URL is required").max(255),
  type: z.string().min(1, "Type is required"),
  changeFrequency: z.string().min(1, "Change frequency is required"),
  priority: z.string().min(1, "Priority is required"),
});

export default function EditSitemapEntryPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditing = id !== "new" && id !== undefined;

  // Fetch sitemap entry if editing
  const { data: entry, isLoading: isLoadingEntry } = useQuery<SitemapEntry>({
    queryKey: [`/api/sitemap/${id}`],
    enabled: isEditing,
  });

  // Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      type: "page",
      changeFrequency: "weekly",
      priority: "0.5",
      isActive: true,
      // relatedId: "",
    },
  });

  // Update form values when entry data is loaded
  useEffect(() => {
    if (entry) {
      form.reset({
        url: entry.url,
        type: entry.type,
        changeFrequency: entry.changeFrequency,
        priority: entry.priority,
        isActive: entry.isActive,
        // relatedId: entry.relatedId,
      });
    }
  }, [entry, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/sitemap", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sitemap"] });
      toast({
        title: "Sitemap entry created",
        description: "The sitemap entry has been created successfully.",
      });
      setLocation("/admin/sitemap");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create sitemap entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (!isEditing || id === "new") {
        throw new Error(
          "Cannot update a new sitemap entry. Use create instead."
        );
      }
      const res = await apiRequest("PUT", `/api/sitemap/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sitemap"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sitemap", Number(id)] });
      toast({
        title: "Sitemap entry updated",
        description: "The sitemap entry has been updated successfully.",
      });
      setLocation("/admin/sitemap");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update sitemap entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
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
        <Button variant="outline" onClick={() => setLocation("/admin/sitemap")}>
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
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.log("Validation errors", errors);
              })}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/page"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The full URL to include in the sitemap. Must include
                      http:// or https://.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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
                      <FormDescription>
                        The type of content this URL represents.
                      </FormDescription>
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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
                      <FormDescription>
                        How frequently the page is likely to change.
                      </FormDescription>
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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
                      <FormDescription>
                        The priority of this URL relative to other URLs on your
                        site.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        Include this URL in the sitemap. Uncheck to temporarily
                        exclude it.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
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
