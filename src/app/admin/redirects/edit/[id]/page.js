"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

export default function EditRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  // ✅ Ensure id is always string
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const isEditing = id !== "new" && id !== undefined;

  // Fetch redirect if editing
  const { data: redirect, isLoading: isLoadingRedirect } = useQuery({
    queryKey: ["/api/redirects", id],
    enabled: isEditing,
    queryFn: async () => {
      const res = await fetch(`/api/redirects/${id}`);
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
  });

  // Form setup
  const form = useForm({
    defaultValues: {
      sourceUrl: "",
      targetUrl: "",
      statusCode: 301,
      isPermanent: true,
      isActive: true,
    },
  });

  // Reset form when redirect data is loaded
  useEffect(() => {
    if (redirect) {
      form.reset({
        sourceUrl: redirect.sourceUrl,
        targetUrl: redirect.targetUrl,
        statusCode: redirect.statusCode,
        isPermanent: redirect.isPermanent,
        isActive: redirect.isActive,
      });
    }
  }, [redirect, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/redirects", data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/redirects"] });
      toast({
        title: "Redirect created",
        description: "The redirect has been created successfully.",
      });
      router.push("/admin/redirects");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create redirect: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (!isEditing || id === "new") {
        throw new Error("Cannot update a new redirect. Use create instead.");
      }
      const res = await apiRequest("PUT", `/api/redirects/${id}`, data);
      return await res;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/redirects"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/redirects", id] });

      toast({
        title: "Redirect updated",
        description: "The redirect has been updated successfully.",
      });

      router.push("/admin/redirects");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update redirect: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Submit handler
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
        heading={isEditing ? "Edit Redirect" : "Create Redirect"}
        text={
          isEditing
            ? "Update an existing URL redirect."
            : "Create a new URL redirect to maintain SEO."
        }
      >
        <Button
          variant="outline"
          onClick={() => router.push("/admin/redirects")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Redirects
        </Button>
      </DashboardHeader>

      {isEditing && isLoadingRedirect ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-card rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Source URL */}
              <FormField
                control={form.control}
                name="sourceUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="/old-path or /go/external-path"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The original URL path that will be redirected. Use /go/
                      prefix for tracking external links.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Target URL */}
              <FormField
                control={form.control}
                name="targetUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="/new-path or https://external-site.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The destination URL where users will be redirected to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status code & Permanent */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="statusCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTTP Status Code</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={String(field.value || 301)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status code" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="301">
                            301 (Moved Permanently)
                          </SelectItem>
                          <SelectItem value="302">
                            302 (Found/Temporary)
                          </SelectItem>
                          <SelectItem value="307">
                            307 (Temporary Redirect)
                          </SelectItem>
                          <SelectItem value="308">
                            308 (Permanent Redirect)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The HTTP status code to use for the redirect.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPermanent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Permanent Redirect</FormLabel>
                        <FormDescription>
                          Indicates if this is a permanent redirect (recommended
                          for SEO).
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Active */}
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
                        Enable or disable this redirect.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {/* Submit */}
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? "Update Redirect" : "Create Redirect"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
