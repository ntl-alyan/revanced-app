import { useQuery } from "@tanstack/react-query";
import Link from 'next/link'
import PublicLayout from "@/components/layout/public-layout";
import {
  Download,
  Check,
  Package2,
  Phone,
  Search,
  Filter,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RevancedLogo } from "@/components/ui/revanced-logo";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export default function DownloadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name, date, downloads
  const [categoryFilter, setCategoryFilter] = useState("all"); // all, core, plugins, utilities

  // Get all apps
  const { data: apps, isLoading } = useQuery({
    queryKey: ["/api/apps"],
    queryFn: async () => {
      const response = await fetch("/api/apps");
      if (!response.ok) {
        throw new Error("Failed to fetch apps");
      }
      return response.json();
    },
  });

  // Get settings for page title and description
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      return response.json();
    },
  });

  const downloadsTitle =
    settings?.find((s) => s.settingKey === "downloads_page_title")
      ?.settingValue || "ReVanced Downloads";
  const downloadsDescription =
    settings?.find((s) => s.settingKey === "downloads_page_description")
      ?.settingValue ||
    "Download the latest versions of ReVanced apps to enhance your mobile experience.";

  // Categories defined for filtering
  const categories = [
    { id: "all", name: "All Apps" },
    { id: "core", name: "Core Apps" },
    { id: "plugins", name: "Plugins" },
    { id: "utilities", name: "Utilities" },
  ];

  // Filter apps based on search query and category
  let filteredApps =
    apps?.filter((app) => {
      // Search filter
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.description &&
          app.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter (you can enhance this logic based on your app data)
      let matchesCategory = true;
      if (categoryFilter !== "all") {
        // This is a placeholder logic - adjust based on how your apps are categorized
        // For example, you could have a 'category' field in your app data
        if (categoryFilter === "core") {
          matchesCategory = app.name.includes("ReVanced");
        } else if (categoryFilter === "plugins") {
          matchesCategory = app.name.includes("Plugin");
        } else if (categoryFilter === "utilities") {
          matchesCategory =
            app.name.includes("Utility") || app.name.includes("Tool");
        }
      }

      return matchesSearch && matchesCategory;
    }) || [];

  // Sort apps based on selected option
  filteredApps = filteredApps.sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "dateDesc") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "dateAsc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return 0;
  });

  // Helper function to get appropriate icon for app
  const getAppIcon = (app) => {
    if (app.icon) {
      return (
        <img src={app.icon} alt={`${app.name} icon`} className="h-6 w-6" />
      );
    } else if (app.name.includes("MicroG")) {
      return <Package2 className="h-6 w-6 text-primary/70" />;
    } else if (app.name.includes("ReVanced")) {
      return <RevancedLogo size={24} />;
    } else {
      return <Package2 className="h-6 w-6 text-primary/70" />;
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background pt-12 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-4xl font-bold mb-4">{downloadsTitle}</h1>
            <p className="text-xl text-muted-foreground">
              {downloadsDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 -mt-12">
        {/* Search and Filter Bar */}
        <div className="w-full max-w-6xl mx-auto mb-12 bg-background rounded-lg border shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="relative md:col-span-5">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search apps by name or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center md:col-span-4">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="flex items-center md:col-span-3">
              <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="dateDesc">Newest First</SelectItem>
                  <SelectItem value="dateAsc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Information Card */}
        <div className="w-full max-w-6xl mx-auto mb-10 bg-primary/5 backdrop-blur-sm rounded-lg border border-primary/20 p-6 flex items-start space-x-4">
          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-full">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Download Instructions</h3>
            <p className="text-muted-foreground mb-3">
              Make sure to install the required applications in the correct
              order for optimal functioning:
            </p>
            <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
              <li>
                Install ReVanced MicroG first (required for YouTube ReVanced)
              </li>
              <li>Install the app you want to enhance</li>
              <li>
                Check the app details page for specific installation
                instructions
              </li>
            </ol>
          </div>
        </div>

        {/* Downloads Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden border bg-card">
                <div className="h-16 flex items-center p-4 bg-muted animate-pulse" />
                <CardContent className="pt-6">
                  <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 bg-muted rounded animate-pulse mb-4 w-3/4" />
                  <div className="h-4 bg-muted rounded animate-pulse mb-4" />
                  <div className="h-8 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredApps.map((app) => (
              <Card
                key={app.id}
                className="overflow-hidden border bg-card hover:shadow-md transition-all relative group"
              >
                {/* App header with icon */}
                <div className="p-4 bg-primary/5 border-b border-primary/20 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-background/70 border border-primary/10 flex items-center justify-center overflow-hidden">
                      {app.icon ? (
                        <img
                          src={app.icon}
                          alt={`${app.name} icon`}
                          className="h-6 w-6"
                        />
                      ) : (
                        getAppIcon(app)
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{app.name}</h3>
                      {app.version && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-background/50"
                        >
                          v{app.version}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Info button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                          asChild
                        >
                          <Link to={`/apps/${app.slug}`}>
                            <Info className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <CardContent className="pt-6">
                  {/* Description */}
                  <p className="text-muted-foreground mb-6 line-clamp-3">
                    {app.description || "No description available."}
                  </p>

                  {/* Feature highlights */}
                  {app.sections &&
                    Array.isArray(app.sections) &&
                    app.sections.find((s) => s.type === "features") && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Key Features:
                        </h4>
                        <ul className="space-y-1">
                          {app.sections
                            .find((s) => s.type === "features")
                            ?.items?.slice(0, 3)
                            .map((feature, idx) => (
                              <li
                                key={idx}
                                className="flex items-start text-sm"
                              >
                                <Check className="h-3.5 w-3.5 text-primary mr-1.5 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-1">
                                  {feature.title}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                </CardContent>

                <CardFooter className="pt-0 flex items-center justify-between">
                  {app.downloadId ? (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button
                          className="w-full gap-2 bg-primary hover:bg-primary/90"
                          asChild
                        >
                          <Link to={`/download/${app.downloadId}`}>
                            <Download className="h-4 w-4" />
                            Download
                          </Link>
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                          <div>
                            <h4 className="text-sm font-semibold">
                              Download {app.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Version: {app.version || "Latest"}
                            </p>
                            <div className="flex items-center pt-2">
                              <Phone className="h-4 w-4 text-primary mr-2" />
                              <span className="text-xs text-muted-foreground">
                                Android application
                              </span>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ) : app.downloadUrl ? (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button
                          className="w-full gap-2 bg-primary hover:bg-primary/90"
                          asChild
                        >
                          <a
                            href={app.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                          <div>
                            <h4 className="text-sm font-semibold">
                              Download {app.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Version: {app.version || "Latest"}
                            </p>
                            <div className="flex items-center pt-2">
                              <Phone className="h-4 w-4 text-primary mr-2" />
                              <span className="text-xs text-muted-foreground">
                                Android application
                              </span>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      No download available
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 max-w-5xl mx-auto">
            <div className="bg-muted/40 p-10 rounded-lg">
              <Package2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No apps found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                No apps match your search criteria. Try a different search term
                or check back later for new additions.
              </p>
              {searchQuery && (
                <Button onClick={() => setSearchQuery("")} variant="outline">
                  Clear Search
                </Button>
              )}
            </div>
          </div>
        )}

        {filteredApps.length > 0 && (
          <div className="text-center text-sm text-muted-foreground mt-8 max-w-6xl mx-auto">
            Showing {filteredApps.length}{" "}
            {filteredApps.length === 1 ? "app" : "apps"}
            {searchQuery ? ` matching "${searchQuery}"` : ""}
            {categoryFilter !== "all"
              ? ` in category "${
                  categories.find((c) => c.id === categoryFilter)?.name
                }"`
              : ""}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
