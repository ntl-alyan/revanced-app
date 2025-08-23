import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/src/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle} from "@/src/components/ui/dialog";
import {
  MoveUp,
  MoveDown,
  Trash2,
  Plus,
  AlertCircle,
  BadgeCheck,
  Check,
  ChevronDown,
  Code,
  Cpu,
  Download,
  FileText,
  Gauge,
  Github,
  Globe,
  Heart,
  HelpCircle,
  Image,
  Info,
  Laptop,
  LayoutGrid,
  Lightbulb,
  Link,
  Loader,
  Lock,
  MessageCircle,
  Palette,
  Pencil,
  Play,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  Smartphone,
  Star,
  Tablet,
  Terminal,
  ThumbsUp,
  Zap
} from "lucide-react";
import { debounce } from "lodash";


// Memoize the icon options since they don't change
const iconOptions= [
  { value: "alertcircle", label: "Alert Circle", icon: <AlertCircle className="h-4 w-4" /> },
  { value: "badgecheck", label: "Badge Check", icon: <BadgeCheck className="h-4 w-4" /> },
  { value: "check", label: "Check", icon: <Check className="h-4 w-4" /> },
  { value: "chevrondown", label: "Chevron Down", icon: <ChevronDown className="h-4 w-4" /> },
  { value: "code", label: "Code", icon: <Code className="h-4 w-4" /> },
  { value: "cpu", label: "CPU", icon: <Cpu className="h-4 w-4" /> },
  { value: "download", label: "Download", icon: <Download className="h-4 w-4" /> },
  { value: "filetext", label: "File Text", icon: <FileText className="h-4 w-4" /> },
  { value: "gauge", label: "Gauge", icon: <Gauge className="h-4 w-4" /> },
  { value: "github", label: "GitHub", icon: <Github className="h-4 w-4" /> },
  { value: "globe", label: "Globe", icon: <Globe className="h-4 w-4" /> },
  { value: "heart", label: "Heart", icon: <Heart className="h-4 w-4" /> },
  { value: "helpcircle", label: "Help Circle", icon: <HelpCircle className="h-4 w-4" /> },
  { value: "image", label: "Image", icon: <Image className="h-4 w-4" /> },
  { value: "info", label: "Info", icon: <Info className="h-4 w-4" /> },
  { value: "laptop", label: "Laptop", icon: <Laptop className="h-4 w-4" /> },
  { value: "layoutgrid", label: "Layout Grid", icon: <LayoutGrid className="h-4 w-4" /> },
  { value: "lightbulb", label: "Lightbulb", icon: <Lightbulb className="h-4 w-4" /> },
  { value: "link", label: "Link", icon: <Link className="h-4 w-4" /> },
  { value: "loader", label: "Loader", icon: <Loader className="h-4 w-4" /> },
  { value: "lock", label: "Lock", icon: <Lock className="h-4 w-4" /> },
  { value: "messagecircle", label: "Message Circle", icon: <MessageCircle className="h-4 w-4" /> },
  { value: "palette", label: "Palette", icon: <Palette className="h-4 w-4" /> },
  { value: "pencil", label: "Pencil", icon: <Pencil className="h-4 w-4" /> },
  { value: "play", label: "Play", icon: <Play className="h-4 w-4" /> },
  { value: "server", label: "Server", icon: <Server className="h-4 w-4" /> },
  { value: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  { value: "shield", label: "Shield", icon: <Shield className="h-4 w-4" /> },
  { value: "shieldalert", label: "Shield Alert", icon: <ShieldAlert className="h-4 w-4" /> },
  { value: "smartphone", label: "Smartphone", icon: <Smartphone className="h-4 w-4" /> },
  { value: "star", label: "Star", icon: <Star className="h-4 w-4" /> },
  { value: "tablet", label: "Tablet", icon: <Tablet className="h-4 w-4" /> },
  { value: "terminal", label: "Terminal", icon: <Terminal className="h-4 w-4" /> },
  { value: "thumbsup", label: "Thumbs Up", icon: <ThumbsUp className="h-4 w-4" /> },
  { value: "zap", label: "Zap", icon: <Zap className="h-4 w-4" /> },
];

// Memoized section type options
const sectionTypeOptions = [
  { label: "Features", value: "features" },
  { label: "Benefits", value: "benefits" },
  { label: "How To Use", value: "howto" },
  { label: "Screenshots", value: "screenshots" },
  { label: "Specs", value: "specs" },
  { label: "Requirements", value: "requirements" },
  { label: "Downloads", value: "downloads" },
  { label: "FAQ", value: "faq" },
  { label: "Content", value: "content" },
  { label: "Changelog", value: "changelog" },
];

// Memoized component for individual items to prevent unnecessary re-renders
const SectionItem = memo(({
  item,
  sectionIndex,
  itemIndex,
  sectionType,
  updateItemField,
  setCurrentItemForIcon,
  removeItem
}) => {
  // Debounce the field updates
  const debouncedUpdateField = useCallback(
    debounce((field, value) => {
      updateItemField(sectionIndex, itemIndex, field, value);
    }, 300),
    [sectionIndex, itemIndex]
  );

  const handleFieldChange = (field, value) => {
    // Immediate local update for better UX
    debouncedUpdateField(field, value);
  };

  return (
    <AccordionItem value={`item-${itemIndex}`} className="border rounded-md">
      <AccordionTrigger className="px-4">
        <div className="flex justify-between items-center w-full">
          <span>{item.title || `Item ${itemIndex + 1}`}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              removeItem(sectionIndex, itemIndex);
            }}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 pt-2">
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Item title"
              defaultValue={item.title || ""}
              onChange={(e) => handleFieldChange("title", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              placeholder="Item content"
              className="min-h-20"
              defaultValue={item.content || ""}
              onChange={(e) => handleFieldChange("content", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Icon</label>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Icon name"
                defaultValue={item.icon || ""}
                onChange={(e) => handleFieldChange("icon", e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentItemForIcon(sectionIndex, itemIndex, item.icon || null);
                }}
              >
                Browse
              </Button>
            </div>
            {item.icon && (
              <div className="flex items-center mt-2">
                <span className="text-sm mr-2">Preview:</span>
                <div className="h-6 w-6 flex items-center justify-center">
                  {iconOptions.find(opt => opt.value === item.icon.toLowerCase())?.icon || 
                   <Info className="h-4 w-4" />}
                </div>
              </div>
            )}
          </div>
          
          {sectionType === "screenshots" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                placeholder="Image URL"
                defaultValue={item.image || ""}
                onChange={(e) => handleFieldChange("image", e.target.value)}
              />
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

export function AppSectionsEditor({ sections, setSections }) {
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [localSections, setLocalSections] = useState(sections);
  
  // Keep local sections in sync with parent sections when they change externally
  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);
  
  // Update parent component's state with our local sections
  const updateParentSections = useCallback(() => {
    setSections(localSections);
  }, [localSections, setSections]);

  // Add a new section
  const addSection = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newSections = [
      ...localSections,
      {
        type: "content",
        title: "New Section",
        content: "",
        items: [],
      },
    ];
    
    setLocalSections(newSections);
    setSections(newSections);
  }, [localSections, setSections]);

  // Delete a section
  const deleteSection = useCallback((index, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const updatedSections = [...localSections];
    updatedSections.splice(index, 1);
    setLocalSections(updatedSections);
    setSections(updatedSections);
  }, [localSections, setSections]);

  // Move a section up/down
  const moveSection = useCallback((index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= localSections.length) return;
    
    const updatedSections = [...localSections];
    const temp = updatedSections[index];
    updatedSections[index] = updatedSections[newIndex];
    updatedSections[newIndex] = temp;
    
    setLocalSections(updatedSections);
    setSections(updatedSections);
  }, [localSections, setSections]);

  // Update section field with debounce
  const updateSectionField = useCallback(debounce((
    index,
    field,
    value
  ) => {
    setLocalSections(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setSections(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, 300), [setSections]);

  // Add item to a section
  const addItem = useCallback((sectionIndex) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setLocalSections(prev => {
      const updated = [...prev];
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        items: [...(updated[sectionIndex].items || []), { title: "New Item", content: "" }],
      };
      return updated;
    });
    
    setSections(prev => {
      const updated = [...prev];
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        items: [...(updated[sectionIndex].items || []), { title: "New Item", content: "" }],
      };
      return updated;
    });
  }, [setSections]);

  // Remove item from a section
  const removeItem = useCallback((sectionIndex, itemIndex) => {
    setLocalSections(prev => {
      const updated = [...prev];
      if (!updated[sectionIndex].items) return updated;
      
      const updatedItems = [...updated[sectionIndex].items];
      updatedItems.splice(itemIndex, 1);
      
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        items: updatedItems,
      };
      return updated;
    });
    
    setSections(prev => {
      const updated = [...prev];
      if (!updated[sectionIndex].items) return updated;
      
      const updatedItems = [...updated[sectionIndex].items];
      updatedItems.splice(itemIndex, 1);
      
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        items: updatedItems,
      };
      return updated;
    });
  }, [setSections]);

  // Update item field with debounce
  const updateItemField = useCallback(debounce((
    sectionIndex,
    itemIndex,
    field,
    value
  ) => {
    setLocalSections(prev => {
      const updated = [...prev];
      if (!updated[sectionIndex].items) {
        updated[sectionIndex].items = [];
      }
      
      updated[sectionIndex].items[itemIndex] = {
        ...updated[sectionIndex].items[itemIndex],
        [field]: value,
      };
      return updated;
    });
    
    setSections(prev => {
      const updated = [...prev];
      if (!updated[sectionIndex].items) {
        updated[sectionIndex].items = [];
      }
      
      updated[sectionIndex].items[itemIndex] = {
        ...updated[sectionIndex].items[itemIndex],
        [field]: value,
      };
      return updated;
    });
  }, 300), [setSections]);

  // Set icon for item
  const setIconForItem = useCallback((icon) => {
    if (currentSection !== null && currentItem !== null) {
      updateItemField(currentSection, currentItem, "icon", icon);
    }
    setSelectedIcon(null);
  }, [currentSection, currentItem, updateItemField]);

  const setCurrentItemForIcon = useCallback((sectionIndex, itemIndex, icon ) => {
    setCurrentSection(sectionIndex);
    setCurrentItem(itemIndex);
    setSelectedIcon(icon);
  }, []);

  // Memoize the icon selector dialog since it's expensive to render
  const IconSelectorDialog = useMemo(() => (
    <Dialog open={selectedIcon !== null} onOpenChange={(open) => !open && setSelectedIcon(null)}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select an Icon</DialogTitle>
          <DialogDescription>Choose an icon to use for this item</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-96 overflow-y-auto p-2">
          {iconOptions.map((option) => (
            <div
              key={option.value}
              className={`flex flex-col items-center justify-center p-3 border rounded-md gap-2 cursor-pointer hover:border-primary transition-colors ${
                selectedIcon === option.value ? "bg-primary/10 border-primary" : ""
              }`}
              onClick={() => setIconForItem(option.value)}
            >
              <div className="h-8 w-8 flex items-center justify-center">
                {option.icon}
              </div>
              <span className="text-xs text-center truncate w-full">
                {option.label}
              </span>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setSelectedIcon(null)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ), [selectedIcon, setIconForItem]);

  return (
    <div className="space-y-6">
      {IconSelectorDialog}

      <div className="flex justify-end">
        <Button onClick={addSection} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No sections added yet</p>
          <Button 
            variant="outline" 
            onClick={addSection} 
            className="mt-4 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add First Section
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {localSections.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {section.title || `Section ${sectionIndex + 1}`}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveSection(sectionIndex, 'up')}
                      disabled={sectionIndex === 0}
                      className="h-8 w-8 p-0"
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveSection(sectionIndex, 'down')}
                      disabled={sectionIndex === localSections.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={(e) => deleteSection(sectionIndex, e)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Section Title</label>
                      <Input
                        placeholder="Enter section title"
                        defaultValue={section.title || ""}
                        onChange={(e) => updateSectionField(sectionIndex, "title", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Section Type</label>
                      <Select
                        value={section.type}
                        onValueChange={(value) => updateSectionField(sectionIndex, "type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select section type" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectionTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subtitle (Optional)</label>
                    <Input
                      placeholder="Enter section subtitle"
                      defaultValue={section.subtitle || ""}
                      onChange={(e) => updateSectionField(sectionIndex, "subtitle", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      placeholder="Enter section content"
                      className="min-h-32"
                      defaultValue={section.content || ""}
                      onChange={(e) => updateSectionField(sectionIndex, "content", e.target.value)}
                    />
                  </div>
                  
                  {["features", "benefits", "howto", "requirements", "faq"].includes(section.type) && (
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Section Items</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => addItem(sectionIndex, e)}
                          className="h-8 gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Add Item
                        </Button>
                      </div>
                      
                      {!section.items || section.items.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                          No items added yet
                        </div>
                      ) : (
                        <Accordion type="multiple" className="space-y-2">
                          {section.items.map((item, itemIndex) => (
                            <SectionItem
                              key={itemIndex}
                              item={item}
                              sectionIndex={sectionIndex}
                              itemIndex={itemIndex}
                              sectionType={section.type}
                              updateItemField={updateItemField}
                              setCurrentItemForIcon={setCurrentItemForIcon}
                              removeItem={removeItem}
                            />
                          ))}
                        </Accordion>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}