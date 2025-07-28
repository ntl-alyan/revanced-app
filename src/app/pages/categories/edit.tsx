import { useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/layout/page-header";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCategorySchema, InsertCategory, Category } from "@shared/schema";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation, useParams } from "wouter";
import { generateSlug } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const extendedCategorySchema = insertCategorySchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
});

type CategoryFormData = z.infer<typeof extendedCategorySchema>;

export default function EditCategoryPage() {
  const { id } = useParams();
  const categoryId = parseInt(id);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: category, isLoading, error } = useQuery<Category>({
    queryKey: [`/api/categories/${categoryId}`],
    enabled: !isNaN(categoryId),
  });

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(extendedCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  // Update form with category data once loaded
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
      });
    }
  }, [category, form]);

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: Partial<InsertCategory>) => {
      const res = await apiRequest("PUT", `/api/categories/${categoryId}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Category updated",
        description: "Category has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/categories/${categoryId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      navigate("/categories");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update category: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    updateCategoryMutation.mutate(data);
  };

  const watchName = form.watch("name");

  const handleGenerateSlug = () => {
    if (!watchName) return;
    const slug = generateSlug(watchName);
    form.setValue("slug", slug);
  };

  // Redirect if not authenticated
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (error || !category) {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Error Loading Category</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error ? (error as Error).message : "Category not found"}
          </p>
          <Button onClick={() => navigate("/categories")}>
            Return to Categories
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Edit Category"
        description={`Editing: ${category.name}`}
      />

      <div className="max-w-2xl mx-auto">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="category-slug" {...field} />
                        </FormControl>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleGenerateSlug}
                          disabled={!watchName}
                        >
                          Generate
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Category description (optional)" 
                          {...field} 
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" type="button" onClick={() => navigate("/categories")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateCategoryMutation.isPending}>
                  {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
}
