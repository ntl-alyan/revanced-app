import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import { apiRequest, queryClient } from "@/src/lib/queryClient";
import { useToast } from "@/src/hooks/use-toast";
import { Button } from "@/src/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import {
  Globe,
  Plus,
  Save,
  Trash2,
  Languages,
  Eye,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Switch as SwitchComponent } from "@/src/components/ui/switch";


export function TranslationManager({
  contentType,
  contentId,
  originalData,
}) {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<number | null>(null);
  const [newTranslationLanguage, setNewTranslationLanguage] = useState<number | null>(null);
  const [translations, setTranslations] = useState([]);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [translationToDelete, setTranslationToDelete] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("list");

  // Get base endpoint for translations
  const baseEndpoint = contentType === "homepage" 
    ? "/api/homepage/translations" 
    : `/api/apps/${contentId}/translations`;

  // Fetch available languages
  const { data: languages, isLoading: isLoadingLanguages } = useQuery({
    queryKey: ["/api/languages"],
  });

  // Fetch translations for this content
  const {
    data: translationData,
    isLoading: isLoadingTranslations,
    refetch: refetchTranslations,
  } = useQuery({
    queryKey: [`${baseEndpoint}`],
    queryFn: async () => {
      // For homepage we need to append the query parameter, for apps it's already in the URL
      const url = contentType === "homepage" 
        ? `${baseEndpoint}?homepageId=${contentId}` 
        : baseEndpoint;
      
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to fetch translations');
          } else {
            const errorText = await res.text();
            // Check if it's HTML and return a more user-friendly message
            if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
              throw new Error(`Server error (${res.status}): The server returned an HTML page instead of JSON data.`);
            }
            throw new Error(errorText || 'Failed to fetch translations');
          }
        }
        return res.json();
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Unknown error occurred while fetching translations');
      }
    },
    enabled: contentId > 0,
  });

  // Update translations when data is loaded
  useEffect(() => {
    if (translationData) {
      setTranslations(translationData);
    }
  }, [translationData]);

  // Get already translated language IDs
  const translatedLanguageIds = new Set(translations.map(t => t.languageId));

  // Get available languages for new translations
  const availableLanguages = languages?.filter(
    lang => !translatedLanguageIds.has(lang.id)
  ) || [];

  // Create translation mutation
  const createTranslationMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const res = await apiRequest("POST", baseEndpoint, data);
        if (!res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to create translation');
          } else {
            const errorText = await res.text();
            // Check if it's HTML and return a more user-friendly message
            if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
              throw new Error(`Server error (${res.status}): The server returned an HTML page instead of JSON data. This might indicate a server-side issue.`);
            }
            throw new Error(errorText || 'Failed to create translation');
          }
        }
        return await res.json();
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Unknown error occurred');
      }
    },
    onSuccess: () => {
      toast({
        title: "Translation created",
        description: "The translation has been created successfully",
      });
      setIsAddDialogOpen(false);
      setNewTranslationLanguage(null);
      refetchTranslations();
      queryClient.invalidateQueries({ queryKey: [baseEndpoint] });
    },
    onError: (error) => {
      toast({
        title: "Error creating translation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update translation mutation
  const updateTranslationMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        const res = await apiRequest("PUT", `${baseEndpoint}/${id}`, data);
        if (!res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to update translation');
          } else {
            const errorText = await res.text();
            // Check if it's HTML and return a more user-friendly message
            if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
              throw new Error(`Server error (${res.status}): The server returned an HTML page instead of JSON data. This might indicate a server-side issue.`);
            }
            throw new Error(errorText || 'Failed to update translation');
          }
        }
        return await res.json();
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Unknown error occurred');
      }
    },
    onSuccess: () => {
      toast({
        title: "Translation updated",
        description: "The translation has been updated successfully",
      });
      refetchTranslations();
      queryClient.invalidateQueries({ queryKey: [baseEndpoint] });
      setActiveTab("list");
      setEditingTranslation(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating translation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete translation mutation
  const deleteTranslationMutation = useMutation({
    mutationFn: async (id) => {
      try {
        const res = await apiRequest("DELETE", `${baseEndpoint}/${id}`);
        if (!res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to delete translation');
          } else {
            const errorText = await res.text();
            // Check if it's HTML and return a more user-friendly message
            if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
              throw new Error(`Server error (${res.status}): The server returned an HTML page instead of JSON data. This might indicate a server-side issue.`);
            }
            throw new Error(errorText || 'Failed to delete translation');
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Unknown error occurred');
      }
    },
    onSuccess: () => {
      toast({
        title: "Translation deleted",
        description: "The translation has been deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setTranslationToDelete(null);
      refetchTranslations();
      queryClient.invalidateQueries({ queryKey: [baseEndpoint] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting translation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle creating a new translation
  const handleCreateTranslation = () => {
    if (!newTranslationLanguage) {
      toast({
        title: "Select a language",
        description: "Please select a language for the new translation",
        variant: "destructive",
      });
      return;
    }

    let translationData = {
      languageId: newTranslationLanguage,
      isActive: true,
    };

    if (contentType === "homepage") {
      translationData.homepageId = contentId;
      translationData.sections = originalData.sections || [];
      // Copy SEO fields from original data
      translationData.metaTitle = originalData.metaTitle || "";
      translationData.metaDescription = originalData.metaDescription || "";
      translationData.metaKeywords = originalData.metaKeywords || "";
      translationData.ogTitle = originalData.ogTitle || "";
      translationData.ogDescription = originalData.ogDescription || "";
      translationData.ogImage = originalData.ogImage || "";
    } else if (contentType === "app") {
      translationData.appId = contentId;
      translationData.name = originalData.name || "";
      translationData.description = originalData.description || "";
      translationData.sections = originalData.sections || [];
      // Copy SEO fields from original data
      translationData.metaTitle = originalData.metaTitle || "";
      translationData.metaDescription = originalData.metaDescription || "";
      translationData.metaKeywords = originalData.metaKeywords || "";
      translationData.ogTitle = originalData.ogTitle || "";
      translationData.ogDescription = originalData.ogDescription || "";
      translationData.ogImage = originalData.ogImage || "";
    }

    createTranslationMutation.mutate(translationData);
  };

  // Handle updating translation status
  const handleUpdateStatus = (translation, isActive) => {
    const data = { isActive };
    updateTranslationMutation.mutate({ id: translation.id, data });
  };

  // Start editing a translation
  const handleEditTranslation = (translation) => {
    setEditingTranslation(translation);
    setActiveTab("edit");
  };

  // Handle saving edits
  const handleSaveTranslation = () => {
    if (!editingTranslation) return;

    updateTranslationMutation.mutate({
      id: editingTranslation.id,
      data: editingTranslation,
    });
  };

  // Handle deleting a translation
  const handleDeleteTranslation = () => {
    if (translationToDelete) {
      deleteTranslationMutation.mutate(translationToDelete);
    }
  };

  // Get language name by ID
  const getLanguageName = (id) => {
    const language = languages?.find(lang => lang.id === id);
    return language ? language.name : "Unknown";
  };

  // Get language flag by ID
  const getLanguageFlag = (id) => {
    const language = languages?.find(lang => lang.id === id);
    return language ? language.flag : "🏳️";
  };

  // Loading state
  if (isLoadingLanguages || isLoadingTranslations) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Translations
        </h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Add Translation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Translation</DialogTitle>
              <DialogDescription>
                Select a language to create a new translation. The content will be pre-filled with the original data.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={newTranslationLanguage?.toString() || ""}
                  onValueChange={(value) => setNewTranslationLanguage(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        All languages have translations
                      </div>
                    ) : (
                      availableLanguages.map((language) => (
                        <SelectItem key={language.id} value={language.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{language.flag}</span>
                            <span>{language.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTranslation}
                disabled={!newTranslationLanguage || createTranslationMutation.isPending}
              >
                {createTranslationMutation.isPending ? (
                  <>
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                    Creating...
                  </>
                ) : (
                  "Create Translation"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {translations.length === 0 ? (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center">
          <Globe className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No translations available</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add translations to make your content available in multiple languages.
          </p>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add First Translation
          </Button>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Translation List</TabsTrigger>
            <TabsTrigger value="edit" disabled={!editingTranslation}>
              Edit Translation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="space-y-4">
              {translations.map((translation) => (
                <div
                  key={translation.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getLanguageFlag(translation.languageId)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {getLanguageName(translation.languageId)}
                        <Badge
                          className="ml-2"
                          variant={translation.isActive ? "default" : "outline"}
                        >
                          {translation.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {contentType === "app" ? "App" : "Homepage"} translation
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center mr-2">
                      <SwitchComponent
                        checked={translation.isActive}
                        onCheckedChange={(checked) =>
                          handleUpdateStatus(translation, checked)
                        }
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTranslation(translation)}
                    >
                      Edit
                    </Button>
                    <AlertDialog
                      open={isDeleteDialogOpen && translationToDelete === translation.id}
                      onOpenChange={(open) => {
                        setIsDeleteDialogOpen(open);
                        if (!open) setTranslationToDelete(null);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setTranslationToDelete(translation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Translation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this translation? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteTranslation}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="edit">
            {editingTranslation && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">
                      {getLanguageFlag(editingTranslation.languageId)}
                    </div>
                    <h3 className="text-lg font-medium">
                      Editing {getLanguageName(editingTranslation.languageId)} Translation
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActiveTab("list");
                        setEditingTranslation(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveTranslation}
                      disabled={updateTranslationMutation.isPending}
                      className="gap-1"
                    >
                      {updateTranslationMutation.isPending ? (
                        <>
                          <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Translation
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Active status toggle */}
                  <div className="flex items-center space-x-2">
                    <SwitchComponent
                      id="translation-active"
                      checked={editingTranslation.isActive}
                      onCheckedChange={(checked) => {
                        setEditingTranslation({
                          ...editingTranslation,
                          isActive: checked,
                        });
                      }}
                    />
                    <Label htmlFor="translation-active">
                      Active translation
                    </Label>
                  </div>

                  {/* App-specific fields */}
                  {contentType === "app" && (
                    <>
                      <div className="grid gap-6 sm:grid-cols-2">
                        {/* App Name */}
                        <div className="space-y-2">
                          <Label htmlFor="app-name">App Name</Label>
                          <Input
                            id="app-name"
                            value={editingTranslation.name || ""}
                            onChange={(e) =>
                              setEditingTranslation({
                                ...editingTranslation,
                                name: e.target.value,
                              })
                            }
                            placeholder="Enter app name"
                          />
                        </div>

                        {/* App SEO fields in a collapsible section */}
                        <div className="space-y-2">
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="seo">
                              <AccordionTrigger className="text-sm font-medium">
                                SEO Settings
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  <div className="space-y-2">
                                    <Label htmlFor="meta-title">Meta Title</Label>
                                    <Input
                                      id="meta-title"
                                      value={editingTranslation.metaTitle || ""}
                                      onChange={(e) =>
                                        setEditingTranslation({
                                          ...editingTranslation,
                                          metaTitle: e.target.value,
                                        })
                                      }
                                      placeholder="Enter meta title"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="meta-description">
                                      Meta Description
                                    </Label>
                                    <Textarea
                                      id="meta-description"
                                      value={editingTranslation.metaDescription || ""}
                                      onChange={(e) =>
                                        setEditingTranslation({
                                          ...editingTranslation,
                                          metaDescription: e.target.value,
                                        })
                                      }
                                      placeholder="Enter meta description"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="meta-keywords">Meta Keywords</Label>
                                    <Input
                                      id="meta-keywords"
                                      value={editingTranslation.metaKeywords || ""}
                                      onChange={(e) =>
                                        setEditingTranslation({
                                          ...editingTranslation,
                                          metaKeywords: e.target.value,
                                        })
                                      }
                                      placeholder="Enter meta keywords"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="og-title">OG Title</Label>
                                    <Input
                                      id="og-title"
                                      value={editingTranslation.ogTitle || ""}
                                      onChange={(e) =>
                                        setEditingTranslation({
                                          ...editingTranslation,
                                          ogTitle: e.target.value,
                                        })
                                      }
                                      placeholder="Enter Open Graph title"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="og-image">OG Image</Label>
                                    <Input
                                      id="og-image"
                                      value={editingTranslation.ogImage || ""}
                                      onChange={(e) =>
                                        setEditingTranslation({
                                          ...editingTranslation,
                                          ogImage: e.target.value,
                                        })
                                      }
                                      placeholder="Enter Open Graph image URL"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="og-description">OG Description</Label>
                                    <Textarea
                                      id="og-description"
                                      value={editingTranslation.ogDescription || ""}
                                      onChange={(e) =>
                                        setEditingTranslation({
                                          ...editingTranslation,
                                          ogDescription: e.target.value,
                                        })
                                      }
                                      placeholder="Enter Open Graph description"
                                    />
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </div>

                      {/* App Description */}
                      <div className="space-y-2">
                        <Label htmlFor="app-description">Description</Label>
                        <Textarea
                          id="app-description"
                          value={editingTranslation.description || ""}
                          onChange={(e) =>
                            setEditingTranslation({
                              ...editingTranslation,
                              description: e.target.value,
                            })
                          }
                          placeholder="Enter app description"
                          className="min-h-32"
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Homepage SEO fields */}
                  {contentType === "homepage" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">SEO Settings</h3>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="meta-title">Meta Title</Label>
                          <Input
                            id="meta-title"
                            value={editingTranslation.metaTitle || ""}
                            onChange={(e) =>
                              setEditingTranslation({
                                ...editingTranslation,
                                metaTitle: e.target.value,
                              })
                            }
                            placeholder="Enter meta title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="meta-keywords">Meta Keywords</Label>
                          <Input
                            id="meta-keywords"
                            value={editingTranslation.metaKeywords || ""}
                            onChange={(e) =>
                              setEditingTranslation({
                                ...editingTranslation,
                                metaKeywords: e.target.value,
                              })
                            }
                            placeholder="Enter meta keywords"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="meta-description">Meta Description</Label>
                        <Textarea
                          id="meta-description"
                          value={editingTranslation.metaDescription || ""}
                          onChange={(e) =>
                            setEditingTranslation({
                              ...editingTranslation,
                              metaDescription: e.target.value,
                            })
                          }
                          placeholder="Enter meta description"
                          className="min-h-20"
                        />
                      </div>
                      
                      <h3 className="text-lg font-semibold mt-6">Open Graph Settings</h3>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="og-title">OG Title</Label>
                          <Input
                            id="og-title"
                            value={editingTranslation.ogTitle || ""}
                            onChange={(e) =>
                              setEditingTranslation({
                                ...editingTranslation,
                                ogTitle: e.target.value,
                              })
                            }
                            placeholder="Enter OG title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="og-image">OG Image</Label>
                          <Input
                            id="og-image"
                            value={editingTranslation.ogImage || ""}
                            onChange={(e) =>
                              setEditingTranslation({
                                ...editingTranslation,
                                ogImage: e.target.value,
                              })
                            }
                            placeholder="Enter OG image URL"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="og-description">OG Description</Label>
                        <Textarea
                          id="og-description"
                          value={editingTranslation.ogDescription || ""}
                          onChange={(e) =>
                            setEditingTranslation({
                              ...editingTranslation,
                              ogDescription: e.target.value,
                            })
                          }
                          placeholder="Enter OG description"
                          className="min-h-20"
                        />
                      </div>
                    </div>
                  )}

                  {/* Content sections editor for both homepage and app */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">Content Sections</Label>
                      <Badge variant="outline" className="ml-2">
                        {editingTranslation.sections?.length || 0} Sections
                      </Badge>
                    </div>
                    
                    {editingTranslation.sections?.length > 0 ? (
                      <Accordion type="multiple" className="space-y-4">
                        {editingTranslation.sections.map((section, index) => (
                          <AccordionItem 
                            key={index} 
                            value={`section-${index}`}
                            className="border rounded-md overflow-hidden"
                          >
                            <AccordionTrigger className="px-4 py-2 bg-muted/30 hover:bg-muted/50">
                              <div className="flex items-center gap-2 text-left">
                                <span className="font-medium">{section.title || `Section ${index + 1}`}</span>
                                <Badge variant="secondary" className="ml-2">
                                  {section.type}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 space-y-4">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>Title</Label>
                                  <Input
                                    value={section.title || ""}
                                    onChange={(e) => {
                                      const updatedSections = [...editingTranslation.sections];
                                      updatedSections[index] = {
                                        ...updatedSections[index],
                                        title: e.target.value,
                                      };
                                      setEditingTranslation({
                                        ...editingTranslation,
                                        sections: updatedSections,
                                      });
                                    }}
                                    placeholder="Section Title"
                                  />
                                </div>
                                
                                {section.subtitle !== undefined && (
                                  <div className="space-y-2">
                                    <Label>Subtitle</Label>
                                    <Input
                                      value={section.subtitle || ""}
                                      onChange={(e) => {
                                        const updatedSections = [...editingTranslation.sections];
                                        updatedSections[index] = {
                                          ...updatedSections[index],
                                          subtitle: e.target.value,
                                        };
                                        setEditingTranslation({
                                          ...editingTranslation,
                                          sections: updatedSections,
                                        });
                                      }}
                                      placeholder="Section Subtitle"
                                    />
                                  </div>
                                )}
                              </div>
                              
                              {section.content !== undefined && (
                                <div className="space-y-2">
                                  <Label>Content</Label>
                                  <Textarea
                                    value={section.content || ""}
                                    onChange={(e) => {
                                      const updatedSections = [...editingTranslation.sections];
                                      updatedSections[index] = {
                                        ...updatedSections[index],
                                        content: e.target.value,
                                      };
                                      setEditingTranslation({
                                        ...editingTranslation,
                                        sections: updatedSections,
                                      });
                                    }}
                                    placeholder="Section Content"
                                    className="min-h-32"
                                  />
                                </div>
                              )}
                              
                              {section.items && section.items.length > 0 && (
                                <div className="space-y-4">
                                  <Label>Items</Label>
                                  {section.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="border rounded-md p-4 space-y-4">
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-medium">Item {itemIndex + 1}</h4>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input
                                          value={item.title || ""}
                                          onChange={(e) => {
                                            const updatedSections = [...editingTranslation.sections];
                                            const updatedItems = [...updatedSections[index].items];
                                            updatedItems[itemIndex] = {
                                              ...updatedItems[itemIndex],
                                              title: e.target.value,
                                            };
                                            updatedSections[index] = {
                                              ...updatedSections[index],
                                              items: updatedItems,
                                            };
                                            setEditingTranslation({
                                              ...editingTranslation,
                                              sections: updatedSections,
                                            });
                                          }}
                                          placeholder="Item Title"
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label>Content</Label>
                                        <Textarea
                                          value={item.content || ""}
                                          onChange={(e) => {
                                            const updatedSections = [...editingTranslation.sections];
                                            const updatedItems = [...updatedSections[index].items];
                                            updatedItems[itemIndex] = {
                                              ...updatedItems[itemIndex],
                                              content: e.target.value,
                                            };
                                            updatedSections[index] = {
                                              ...updatedSections[index],
                                              items: updatedItems,
                                            };
                                            setEditingTranslation({
                                              ...editingTranslation,
                                              sections: updatedSections,
                                            });
                                          }}
                                          placeholder="Item Content"
                                          className="min-h-20"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="text-center py-6 border rounded-md bg-muted/20">
                        <p className="text-muted-foreground">No content sections available.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}