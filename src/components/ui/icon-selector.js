import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as LucideIcons from "lucide-react";
import { Search } from "lucide-react";

// List of available icons (we're using Lucide icons)
const iconList = Object.keys(LucideIcons)
  .filter(
    (key) =>
      // Filter out non-icon exports
      key !== "createLucideIcon" &&
      key !== "defaultAttributes" &&
      key !== "defineFillable" &&
      key !== "fillablePath"
  )
  .sort();

export function IconSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter icons based on search term
  const filteredIcons = iconList.filter((icon) =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current icon component if it exists
  const selectedIconName = value || "";
  const SelectedIcon = selectedIconName && LucideIcons[selectedIconName];

  const handleIconSelect = (iconName) => {
    onChange(iconName);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <div className="flex items-center gap-2">
            {SelectedIcon ? (
              <>
                <SelectedIcon className="h-4 w-4" />
                <span>{selectedIconName}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Select an icon...</span>
            )}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select an Icon</DialogTitle>
          <DialogDescription>
            Choose an icon from the library below.
          </DialogDescription>
        </DialogHeader>

        <div className="relative my-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search icons..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[350px] pr-4">
          <div className="grid grid-cols-4 gap-2">
            {filteredIcons.map((iconName) => {
              const Icon = LucideIcons[iconName];

              return (
                <Button
                  key={iconName}
                  variant="outline"
                  className={`h-16 p-2 aspect-square flex flex-col items-center justify-center gap-1 hover:bg-primary/10 hover:border-primary/50 ${
                    selectedIconName === iconName
                      ? "border-primary bg-primary/10"
                      : ""
                  }`}
                  onClick={() => handleIconSelect(iconName)}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs truncate w-full text-center">
                    {iconName}
                  </span>
                </Button>
              );
            })}

            {filteredIcons.length === 0 && (
              <div className="col-span-4 py-12 text-center text-muted-foreground">
                No icons match your search.
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
