import { useQuery } from "@tanstack/react-query";
import Link from 'next/link'
import {
  ChevronRight,
  Search,
  Filter,
  Smartphone,
  Package2,
  Download,
  Star,
  ArrowRight,
  ExternalLink,
  Github,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/layout/public-layout";
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
import { App, AppSection } from "@shared/schema";

export default function PublicAppsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name, date

  // Get all apps
  const { data: apps, isLoading } = useQuery({
    queryKey: ["/api/apps"],
    queryFn: async () => {
      const response = await fetch("/api/apps");
      if (!response.ok) {
        throw new Error("Failed to fetch apps");
      }
      const data = await response.json();
      // Log the first app data to console to debug
      if (data && data.length > 0) {
        // console.log('First app data:', data[0]);
        // console.log('Sections type:', typeof data[0].sections);
        // console.log('Is sections array:', Array.isArray(data[0].sections));
      }
      return data;
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

  const appsTitle =
    settings?.find((s) => s.settingKey === "apps_page_title")?.settingValue ||
    "ReVanced Apps";
  const appsDescription =
    settings?.find((s) => s.settingKey === "apps_page_description")
      ?.settingValue ||
    "Discover our collection of enhanced applications offering improved functionality and features.";

  // Filter apps based on search query
  let filteredApps =
    apps?.filter(
      (app) =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.description &&
          app.description.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

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

  return (
    <PublicLayout>
      {/* Hero Section with Dark Gradient Background */}
      <div className="bg-gradient-to-b from-[#111827] via-[#0f172a] to-[#020617] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-3xl rounded-full transform translate-x-1/2"></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              {appsTitle}
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              {appsDescription}
            </p>

            <div className="mt-10">
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 shadow-lg"
              >
                <a
                  href="https://github.com/revanced"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub Repository
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#030712] py-16">
        <div className="container mx-auto px-4">
          {/* Search and Filter Bar */}
          <div className="w-full max-w-5xl mx-auto mb-12 bg-[#111827] rounded-xl border border-white/10 shadow-lg p-5 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>

            <div className="grid md:grid-cols-4 gap-4 items-center relative z-10">
              <div className="relative col-span-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <Input
                  type="text"
                  placeholder="Search apps by name or description..."
                  className="pl-10 bg-black/30 border-white/10 text-white placeholder:text-white/50 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-white/50" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-black/30 border-white/10 text-white focus:ring-primary">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-white/10">
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="dateDesc">Newest First</SelectItem>
                    <SelectItem value="dateAsc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Apps Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border border-white/10 bg-[#111827] shadow-lg"
                >
                  <div className="aspect-[3/2] bg-[#0f172a] animate-pulse" />
                  <div className="p-6">
                    <div className="h-6 bg-[#1e293b] rounded animate-pulse mb-3" />
                    <div className="h-4 bg-[#1e293b] rounded animate-pulse mb-3 w-3/4" />
                    <div className="h-4 bg-[#1e293b] rounded animate-pulse mb-4 w-full" />
                    <div className="h-10 bg-[#1e293b] rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredApps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {filteredApps.map((app) => (
                <Link key={app.id} href={`/apps/${app.slug}`}>
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#111827] to-[#0f172a] shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 h-full flex flex-col relative group">
                    {/* Multiple visual effects layered for depth */}
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-40"></div>

                    {/* Animated glow effect on hover */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/0 via-primary/25 to-primary/0 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-700 animate-gradient-x"></div>

                    {/* Top Curved Gradient */}
                    <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-primary/10 to-transparent opacity-50"></div>

                    {/* Image/Icon Section */}
                    <div className="p-5 flex items-center justify-between relative z-10">
                      {/* App Icon */}
                      <div className="h-14 w-14 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
                        {app.icon ? (
                          <img
                            src={app.icon}
                            alt={`${app.name} icon`}
                            className="h-8 w-8"
                          />
                        ) : (
                          <Package2 className="h-7 w-7 text-primary/70" />
                        )}
                      </div>

                      {/* Version and Author Section */}
                      <div className="flex flex-col items-end space-y-1">
                        {app.version && (
                          <Badge
                            variant="outline"
                            className="bg-black/20 text-white/90 border-white/10 backdrop-blur-sm"
                          >
                            v{app.version}
                          </Badge>
                        )}
                        {/* Author name would go here if available */}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 pt-2 flex-grow relative z-10">
                      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-primary transition-colors">
                        {app.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {app.version && (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/30"
                          >
                            v{app.version}
                          </Badge>
                        )}
                        {Array.isArray(app.sections) &&
                          app.sections.some((s) => s?.type === "features") && (
                            <Badge
                              variant="secondary"
                              className="bg-primary/20 text-primary border-none"
                            >
                              <Star className="mr-1 h-3 w-3" /> Premium Features
                            </Badge>
                          )}

                        {Array.isArray(app.sections) &&
                          app.sections.some(
                            (s) => s?.type === "installation"
                          ) && (
                            <Badge
                              variant="secondary"
                              className="bg-green-500/20 text-green-400 border-none"
                            >
                              <Download className="mr-1 h-3 w-3" /> Easy Install
                            </Badge>
                          )}

                        {app.githubUrl && (
                          <Badge
                            variant="secondary"
                            className="bg-white/10 text-white/80 border-none"
                          >
                            <Github className="mr-1 h-3 w-3" /> Open Source
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Footer with Download Button */}
                    <div className="p-5 pt-0 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/50">
                          {app.version
                            ? `Latest: v${app.version}`
                            : "Ad-free experience"}
                        </span>

                        {/* Download Now Button */}
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Now
                        </Button>
                      </div>

                      {/* Progress indicator - animated gradient line */}
                      <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-full"
                          style={{ width: "70%" }}
                        ></div>
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-white/40">
                        <span>Stable</span>
                        <span>70% Positive Ratings</span>
                      </div>
                    </div>

                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 max-w-5xl mx-auto">
              <div className="bg-[#111827] border border-white/10 p-10 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                <Smartphone className="h-16 w-16 mx-auto text-white/30 mb-4" />
                <h3 className="text-xl font-medium mb-2 text-white">
                  No apps found
                </h3>
                <p className="text-white/70 mb-6 max-w-md mx-auto">
                  No apps match your search criteria. Try a different search
                  term or check back later for new additions.
                </p>
                {searchQuery && (
                  <Button
                    onClick={() => setSearchQuery("")}
                    variant="outline"
                    className="bg-transparent border-white/20 text-white hover:bg-white/10"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            </div>
          )}

          {filteredApps.length > 0 && (
            <div className="text-center text-sm text-white/50 mt-8 max-w-5xl mx-auto">
              Showing {filteredApps.length}{" "}
              {filteredApps.length === 1 ? "app" : "apps"}
              {searchQuery ? ` matching "${searchQuery}"` : ""}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
