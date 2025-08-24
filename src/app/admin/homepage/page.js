"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/src/lib/queryClient";
import { useForm, useFieldArray } from "react-hook-form";
import { useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/src/components/ui/card";
import { MainLayout } from "@/src/components/layout/main-layout";
import { PageHeader } from "@/src/components/layout/page-header";
import { useToast } from "@/src/hooks/use-toast";
import { MoveUp, MoveDown, Trash2, Save, Eye, Plus } from "lucide-react";
import { Textarea } from "@/src/components/ui/textarea";

export default function HomepagePage() {
  const { toast } = useToast();

  // ✅ Fetch homepage data
  const { data: homepageData, isLoading } = useQuery({
    queryKey: ["/api/homepage"],
    queryFn: () => apiRequest("GET", "/api/homepage"),
  });

  // ✅ Setup form
  const form = useForm({
    defaultValues: {
      sections: [],
      version: "",
      downloadUrl: "",
      downloadId: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
    },
  });

  // ✅ Field array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sections",
  });

  // ✅ Reset only once when homepageData changes
  useEffect(() => {
    if (homepageData) {
      form.reset({
        sections: homepageData.sections || [],
        version: homepageData.version || "",
        downloadUrl: homepageData.downloadUrl || "",
        downloadId: homepageData.downloadId || "",
        metaTitle: homepageData.metaTitle || "",
        metaDescription: homepageData.metaDescription || "",
        metaKeywords: homepageData.metaKeywords || "",
        ogTitle: homepageData.ogTitle || "",
        ogDescription: homepageData.ogDescription || "",
        ogImage: homepageData.ogImage || "",
      });


    }
  }, [homepageData, form]);

  // ✅ Mutation for updating homepage
  const updateMutation = useMutation({
    mutationFn: async (data) => apiRequest("PATCH", "/api/homepage", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homepage"] });
      toast({ title: "Success", description: "Homepage updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error updating homepage",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => updateMutation.mutate(data);

  const moveUp = (index) => {
    if (index === 0) return;
    const sections = [...form.getValues().sections];
    [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
    form.setValue("sections", sections, { shouldDirty: true });
  };

  const moveDown = (index) => {
    const sections = [...form.getValues().sections];
    if (index === sections.length - 1) return;
    [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    form.setValue("sections", sections, { shouldDirty: true });
  };

  const addSection = () =>
    append({ type: "content", title: "New Section", content: "", items: [] });

  if (isLoading || !homepageData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p>Loading homepage data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader title="Homepage Editor" description="Edit homepage content" />

      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" onClick={() => window.open("/", "_blank")}>
          <Eye className="h-4 w-4" /> Preview
        </Button>

        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={updateMutation.isPending}
        >
          <Save className="h-4 w-4" /> Save
        </Button>
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <Card key={field.id /* ✅ use RHF-generated id, not _id */}>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Section {index + 1}</CardTitle>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveUp(index)}
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveDown(index)}
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Section Title"
                {...form.register(`sections.${index}.title`)}
              />
              <Textarea
                placeholder="Section Content"
                {...form.register(`sections.${index}.content`)}
              />
            </CardContent>
          </Card>
        ))}

        <Button type="button" variant="outline" onClick={addSection}>
          <Plus className="h-4 w-4" /> Add Section
        </Button>
      </div>
    </MainLayout>
  );
}
