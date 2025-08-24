"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Download, AlertCircle, ArrowLeft } from "lucide-react";
import PublicLayout from "@/src/components/layout/public-layout";
import { Button } from "@/src/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";

export default function AppDownloadPage({ params }) {
  const router = useRouter();
  const downloadId = params.id;
  const [app, setApp] = useState(null);

  // Fetch app by download ID instead of slug
  const {
    data: apps,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/apps"],
    queryFn: async () => {
      const response = await fetch("/api/apps");
      if (!response.ok) {
        throw new Error("Failed to fetch apps");
      }
      return response.json();
    },
    // staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  useEffect(() => {
    if (apps && downloadId) {
      // Find the app with matching downloadId
      const foundApp = apps.find((a) => a.downloadId === downloadId);
      setApp(foundApp || null);
    }
  }, [apps, downloadId]);

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Calculate the time to download at different speeds
  const estimateDownloadTime = (fileSizeBytes) => {
    if (!fileSizeBytes) return null;

    const speeds = [
      { speed: 1, label: "1 Mbps" },
      { speed: 5, label: "5 Mbps" },
      { speed: 10, label: "10 Mbps" },
      { speed: 50, label: "50 Mbps" },
      { speed: 100, label: "100 Mbps" },
    ];

    // Convert file size to megabits
    const fileSizeMb = (fileSizeBytes * 8) / 1024 / 1024;

    return speeds.map(({ speed, label }) => {
      // Calculate time in seconds
      const timeInSeconds = fileSizeMb / speed;

      // Format time
      if (timeInSeconds < 60) {
        return { label, time: `${Math.ceil(timeInSeconds)} seconds` };
      } else if (timeInSeconds < 3600) {
        return { label, time: `${Math.ceil(timeInSeconds / 60)} minutes` };
      } else {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.ceil((timeInSeconds % 3600) / 60);
        return { label, time: `${hours} hours ${minutes} minutes` };
      }
    });
  };

  // Display a loading state
  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container max-w-4xl py-12">
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Display an error state
  if (error || !app) {
    return (
      <PublicLayout>
        <div className="container max-w-4xl py-12">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Download Not Found</AlertTitle>
            <AlertDescription>
              The download link you followed is invalid or has expired. Please
              return to the app page and try again.
            </AlertDescription>
          </Alert>

          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Calculate file size (mock data for demonstration)
  const fileSize = 25 * 1024 * 1024; // Example: 25MB
  const downloadTimes = estimateDownloadTime(fileSize);

  return (
    <PublicLayout>
      <div className="container max-w-4xl py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{app.name} Download</h1>
          <p className="text-muted-foreground">
            Version {app.version || "Latest"}
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 mb-8 text-card-foreground">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            {app.icon && (
              <div className="bg-background rounded-lg p-4 flex-shrink-0">
                <img
                  src={app.icon}
                  alt={`${app.name} icon`}
                  className="w-20 h-20 object-contain"
                />
              </div>
            )}

            <div className="flex-grow">
              <h2 className="text-xl font-semibold mb-2">{app.name}</h2>
              <p className="mb-4 text-muted-foreground">
                {app.description || "No description available"}
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Version: </span>
                  <span className="font-medium">{app.version || "Latest"}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">File size: </span>
                  <span className="font-medium">
                    {formatFileSize(fileSize)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => (window.location.href = app.downloadUrl)}
              disabled={!app.downloadUrl}
            >
              <Download className="h-5 w-5" />
              Download Now
            </Button>
          </div>

          {!app.downloadUrl && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Download Link Unavailable</AlertTitle>
              <AlertDescription>
                The download link for this app is not available at the moment.
                Please check back later.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Download time estimates */}
        {downloadTimes && (
          <div className="bg-card border rounded-lg p-6 mb-8 text-card-foreground">
            <h3 className="text-lg font-medium mb-4">
              Estimated Download Times
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {downloadTimes.map((item, index) => (
                <div key={index} className="p-3 bg-muted/40 rounded-md">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-primary font-semibold">{item.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* App sections - download instructions */}
        {app.sections && app.sections.length > 0 && (
          <div className="bg-card border rounded-lg p-6 mb-8 text-card-foreground">
            <h3 className="text-lg font-medium mb-4">Download Information</h3>

            {app.sections
              .filter((s) => s.type === "downloads")
              .map((section, index) => (
                <div key={index} className="space-y-4">
                  {section.content && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    </div>
                  )}

                  {section.items && section.items.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {section.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex gap-3 p-3 border rounded-md"
                        >
                          {item.icon && (
                            <div className="text-primary">
                              {/* Render custom icon here */}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{item.title}</div>
                            {item.content && (
                              <div className="text-sm text-muted-foreground">
                                {item.content}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => router.push(`/apps/${app.slug}`)}
          >
            Back to App Details
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}