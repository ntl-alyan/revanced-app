"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // ✅ use Next.js hooks
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, Check, X } from "lucide-react";
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
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useToast } from "@/src/hooks/use-toast";
import { queryClient, apiRequest } from "@/src/lib/queryClient";
import { MainLayout } from "@/src/components/layout/main-layout";
import { PageHeader } from "@/src/components/layout/page-header";
import { CustomBreadcrumb } from "@/src/components/ui/custom-breadcrumb";

export default function EditStructuredDataPage() {
  const params = useParams(); // ✅ Next.js params
  const id = params?.id;
  const router = useRouter(); // ✅ replace setLocation
  const { toast } = useToast();
  const isEditing = id !== "new" && id !== undefined;
  const [jsonValid, setJsonValid] = useState(null);

  // Fetch structured data if editing
  const { data: structuredData, isLoading: isLoadingData } = useQuery({
    queryKey: ["/api/structured-data", id],
    enabled: isEditing,
    queryFn: async () => {
      const res = await fetch(`/api/structured-data/${id}`);
      if (!res.ok) throw new Error("Failed to fetch structured data");
      return res.json();
    },
  });

  // Form
  const form = useForm({
    defaultValues: {
      entityType: "",
      entityId: 0,
      schemaType: "WebPage",
      schemaData: `{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Page Title"
}`,
    },
  });

  // Update form values when data is loaded
  useEffect(() => {
    if (structuredData) {
      let schemaData = "";
      try {
        schemaData =
          typeof structuredData.schemaData === "string"
            ? structuredData.schemaData
            : JSON.stringify(structuredData.schemaData, null, 2);
      } catch {
        schemaData = "{}";
      }

      console.log(structuredData);
      form.reset({
        entityType: structuredData.entityType,
        entityId: structuredData.entityId,
        schemaType: structuredData.schemaType,
        schemaData,
      });
      validateJson(schemaData);
    }
  }, [structuredData, form]);

  // Validate JSON
  const validateJson = (json) => {
    try {
      JSON.parse(json);
      setJsonValid(true);
      return true;
    } catch {
      setJsonValid(false);
      return false;
    }
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/structured-data", data);
      return await res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/structured-data"] });
      toast({
        title: "Structured data created",
        description: "The structured data has been created successfully.",
      });
      router.push("/admin/structured-data"); // ✅ replace setLocation
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create structured data: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (!isEditing || id === "new") {
        throw new Error(
          "Cannot update a new structured data entry. Use create instead."
        );
      }
      const res = await apiRequest("PUT", `/api/structured-data/${id}`, data);
      return await res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/structured-data"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/structured-data", Number(id)],
      });
      toast({
        title: "Structured data updated",
        description: "The structured data has been updated successfully.",
      });
      router.push("/admin/structured-data"); // ✅ replace setLocation
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update structured data: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission
  const onSubmit = (data) => {
    if (!validateJson(data.schemaData)) {
      toast({
        title: "Invalid JSON",
        description: "Please fix the JSON format before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Format JSON
  const formatJson = () => {
    try {
      const jsonData = form.getValues("schemaData");
      const formatted = JSON.stringify(JSON.parse(jsonData), null, 2);
      form.setValue("schemaData", formatted);
      validateJson(formatted);
    } catch {
      toast({
        title: "Invalid JSON",
        description: "Unable to format: The JSON is invalid.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="mb-4">
          <CustomBreadcrumb
            items={[
              { label: "Home", link: "/admin" },
              { label: "Structured Data", link: "/admin/structured-data" },
              {
                label: isEditing
                  ? "Edit Structured Data"
                  : "Create Structured Data",
                link: "#",
              },
            ]}
          />
        </div>

        <PageHeader
          title={isEditing ? "Edit Structured Data" : "Create Structured Data"}
          description={
            isEditing
              ? "Update existing structured data for rich search results."
              : "Create new structured data to enhance your SEO with rich search results."
          }
        >
          <Button
            variant="outline"
            onClick={() => router.push("/admin/structured-data")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Structured Data
          </Button>
        </PageHeader>

        {isEditing && isLoadingData ? (
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="entityType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entity Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value || structuredData?.entityType}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select entity type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="app">App</SelectItem>
                            <SelectItem value="page">Page</SelectItem>
                            <SelectItem value="post">Post</SelectItem>
                            <SelectItem value="homepage">Homepage</SelectItem>
                            <SelectItem value="category">Category</SelectItem>
                            <SelectItem value="global">
                              Global/Site-wide
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The type of content this structured data is associated
                          with.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="entityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entity ID</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          The ID of the content this structured data is for. Use
                          0 for global/site-wide data.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="schemaType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schema Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value || structuredData?.schemaType}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select schema type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="WebPage">WebPage</SelectItem>
                            <SelectItem value="Article">Article</SelectItem>
                            <SelectItem value="BlogPosting">
                              BlogPosting
                            </SelectItem>
                            <SelectItem value="Product">Product</SelectItem>
                            <SelectItem value="SoftwareApplication">
                              SoftwareApplication
                            </SelectItem>
                            <SelectItem value="Organization">
                              Organization
                            </SelectItem>
                            <SelectItem value="Person">Person</SelectItem>
                            <SelectItem value="FAQPage">FAQPage</SelectItem>
                            <SelectItem value="BreadcrumbList">
                              BreadcrumbList
                            </SelectItem>
                            <SelectItem value="WebSite">WebSite</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The Schema.org type this structured data represents.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="schemaData"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>JSON-LD Schema Data</FormLabel>
                        <div className="flex items-center space-x-2">
                          {jsonValid !== null && (
                            <span
                              className={`text-sm flex items-center ${
                                jsonValid ? "text-green-500" : "text-red-500"
                              }`}
                            >
                              {jsonValid ? (
                                <>
                                  <Check size={16} className="mr-1" /> Valid
                                  JSON
                                </>
                              ) : (
                                <>
                                  <X size={16} className="mr-1" /> Invalid JSON
                                </>
                              )}
                            </span>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={formatJson}
                          >
                            Format JSON
                          </Button>
                        </div>
                      </div>
                      <FormControl>
                        <Textarea
                          className="font-mono h-64"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            validateJson(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        The JSON-LD structured data in valid JSON format. Must
                        include @context and @type.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting || jsonValid === false}
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEditing
                      ? "Update Structured Data"
                      : "Create Structured Data"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
