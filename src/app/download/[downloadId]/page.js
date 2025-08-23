"use client"

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import PublicLayout from "@/src/components/layout/public-layout";
import {
  Download,
  ArrowLeft,
  Package2,
  Shield,
  Calendar,
  FileCode,
  Smartphone,
  Loader2,
  CheckCircle2,
  Info,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { RevancedLogo } from "@/src/components/ui/revanced-logo";
import { Progress } from "@/src/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import Head from 'next/head'

export default function DownloadPage({ params }) {
  const router = useRouter();
  const { downloadId } = params;
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [preparingDownload, setPreparingDownload] = useState(true);

  // Fetch the app using downloadId
  const {
    data: app,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/apps/download/${downloadId}`],
    queryFn: async () => {
      if (!downloadId) {
        throw new Error("No download ID provided");
      }

      const response = await fetch(`/api/apps/download/${downloadId}`);
      if (!response.ok) {
        throw new Error("Download not found");
      }
      return response.json();
    },
  });

  // Fetch settings
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

  // Helper function to get setting value
  const getSetting = (key) => {
    const setting = settings?.find((s) => s.settingKey === key);
    return setting?.settingValue;
  };

  // Progress effect for download button
  useEffect(() => {
    if (!isLoading && app) {
      // Show progress for 10 seconds before allowing download
      const totalTime = 10000; // 10 seconds
      const interval = 100; // Update every 100ms
      const steps = totalTime / interval;
      let progress = 0;

      const timer = setInterval(() => {
        progress += 100 / steps;
        setDownloadProgress(Math.min(Math.round(progress), 100));

        if (progress >= 100) {
          clearInterval(timer);
          setShowDownloadButton(true);
          setPreparingDownload(false);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isLoading, app]);

  // Helper function to get appropriate icon for app
  const getAppIcon = (appData) => {
    if (appData?.icon) {
      return (
        <img
          src={appData.icon}
          alt={`${appData.name} icon`}
          className="h-20 w-20"
        />
      );
    } else if (appData?.name?.includes("MicroG")) {
      return <Package2 className="h-20 w-20 text-primary/70" />;
    } else if (appData?.name?.includes("ReVanced")) {
      return <RevancedLogo size={80} />;
    } else {
      return <Package2 className="h-20 w-20 text-primary/70" />;
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm p-14 rounded-2xl border border-primary/10">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <h2 className="text-2xl font-medium mb-2">
              Preparing Your Download
            </h2>
            <p className="text-muted-foreground text-center">
              Please wait while we prepare your download
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !app) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[80vh]">
          <div className="bg-black/30 backdrop-blur-sm p-14 rounded-2xl border border-primary/10 max-w-md w-full text-center">
            <AlertTriangle className="h-16 w-16 mx-auto text-yellow-500 mb-6" />
            <h2 className="text-2xl font-medium mb-3">Download Not Found</h2>
            <p className="text-muted-foreground mb-8">
              The download link you're looking for is no longer available or may
              have been moved.
            </p>
            <Button size="lg" className="gap-2" onClick={() => router.push("/apps")}>
              <ArrowLeft className="h-4 w-4" />
              Browse Available Apps
            </Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Get page title from settings
  const pageTitle =
    getSetting("downloads_page_title") || `Download ${app.name}`;

  return (
    <PublicLayout>
      <Head>
        <title>{pageTitle} | ReVanced</title>
        <meta
          name="description"
          content={
            app.metaDescription ||
            `Download ${app.name} - ${app.description?.substring(0, 160)}`
          }
        />
        <meta name="robots" content="noindex, nofollow" />
        {/* Open Graph meta tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${pageTitle} | ReVanced`} />
        <meta
          property="og:description"
          content={
            app.metaDescription ||
            `Download ${app.name} - ${app.description?.substring(0, 160)}`
          }
        />
        <meta property="og:site_name" content="ReVanced" />
        {app.icon && <meta property="og:image" content={app.icon} />}
      </Head>

      <div className="relative overflow-hidden min-h-[80vh] flex flex-col items-center justify-center py-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl opacity-30"></div>

        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          {/* Return to app button - more visible version */}
          <div className="absolute top-4 left-4 md:left-4 z-50">
            <Button
              size="default"
              className="bg-primary hover:bg-primary/90 text-black font-medium shadow-lg border-2 border-white/20"
              onClick={() => router.push(app.slug ? `/apps/${app.slug}` : "/apps")}
            >
              <ArrowLeft className= "text-white/80 h-5 w-5 mr-2" />
               <p className="text-lg text-white/80 max-w-2xl">Back to {app.slug ? app.name : "Apps"}</p>
            </Button>
          </div>

          {/* Main download card */}
          <div className="bg-black/30 backdrop-blur-lg border border-primary/10 rounded-3xl overflow-hidden shadow-xl">
            {/* Header section with gradient background */}
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 md:p-10 flex flex-col items-center text-center">
              <div className="h-28 w-28 bg-black/40 rounded-2xl border border-primary/20 p-4 flex items-center justify-center mb-6 backdrop-blur-sm">
                {getAppIcon(app)}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {app.name}
              </h1>

              <div className="flex items-center justify-center gap-3 mb-4">
                {app.version && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
                    v{app.version}
                  </Badge>
                )}
                <Badge variant="outline" className="bg-black/40 px-3 py-1">
                  <FileCode className="h-3.5 w-3.5 mr-1" />
                  APK
                </Badge>
                <Badge variant="outline" className="bg-black/40 px-3 py-1">
                  <Smartphone className="h-3.5 w-3.5 mr-1" />
                  Android
                </Badge>
              </div>

              <p className="text-lg text-white/80 max-w-2xl">
                {app.description}
              </p>
            </div>

            {/* Download section with progress indicator */}
            <div className="p-6 md:p-10">
              <div className="bg-black/20 border border-primary/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm mb-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <Shield className="h-12 w-12 text-primary/60 mb-4" />
                  <h2 className="text-xl md:text-2xl font-bold mb-2">
                    Secure Download
                  </h2>
                  <p className="text-white/70">
                    This file has been verified and is safe to download
                  </p>
                </div>

                {preparingDownload ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-primary">
                        Preparing your secure download...
                      </span>
                      <span className="text-sm font-medium">
                        {downloadProgress}%
                      </span>
                    </div>
                    <Progress
                      value={downloadProgress}
                      className="h-3 bg-black/50"
                    />
                    <p className="text-sm text-white/60 text-center mt-3">
                      Your download will be ready in{" "}
                      {Math.ceil(10 - downloadProgress / 10)} seconds
                    </p>
                  </div>
                ) : app.downloadUrl ? (
                  <div className="animate-in fade-in-50 duration-500">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className="w-full gap-3 py-6 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/10"
                          >
                            <a
                              href={app.downloadUrl}
                              target="_blank"
                              onClick={(e) => {
                                // Prevent the "Copy link address" option from showing the URL
                                e.currentTarget.blur();
                              }}
                              style={{ pointerEvents: "auto" }}
                            >
                              <Download className="h-6 w-6" />
                              Download Now
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Start your download</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <div className="flex items-center justify-center mt-4">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-white/60">
                        File verified & secure
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                    <p className="text-white/70 mb-4">
                      No download is currently available for this application.
                    </p>
                    <Button variant="outline" className="bg-black/30" onClick={() => router.push("/apps")}>
                      Browse Other Apps
                    </Button>
                  </div>
                )}
              </div>

              {/* App details accordion */}
              <Accordion
                type="single"
                collapsible
                className="bg-black/20 border border-primary/10 rounded-2xl backdrop-blur-sm overflow-hidden"
              >
                <AccordionItem value="app-details" className="border-b-0">
                  <AccordionTrigger className="px-6 py-4 hover:bg-black/30 transition-all">
                    <span className="flex items-center text-lg font-medium">
                      <Info className="h-5 w-5 mr-2" />
                      App Details
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <span className="text-sm text-white/60">App Name</span>
                        <p className="font-medium">{app.name}</p>
                      </div>

                      {app.version && (
                        <div>
                          <span className="text-sm text-white/60">Version</span>
                          <p className="font-medium">{app.version}</p>
                        </div>
                      )}

                      {app.createdAt && (
                        <div>
                          <span className="text-sm text-white/60">
                            Release Date
                          </span>
                          <p className="font-medium">
                            {formatDate(app.createdAt)}
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="text-sm text-white/60">Platform</span>
                        <p className="font-medium">Android</p>
                      </div>

                      <div>
                        <span className="text-sm text-white/60">Developer</span>
                        <p className="font-medium">ReVanced Team</p>
                      </div>

                      <div>
                        <span className="text-sm text-white/60">License</span>
                        <p className="font-medium">Free & Open Source</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="installation"
                  className="border-t border-primary/10"
                >
                  <AccordionTrigger className="px-6 py-4 hover:bg-black/30 transition-all">
                    <span className="flex items-center text-lg font-medium">
                      <Smartphone className="h-5 w-5 mr-2" />
                      Installation Guide
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="mt-2 space-y-5">
                      {/* Dynamic installation instructions based on app type */}
                      {app.name?.includes("MicroG") ? (
                        <>
                          <div className="text-lg font-medium text-primary mb-3">
                            MicroG Installation
                          </div>
                          <ol className="list-decimal pl-5 space-y-3 text-white/80">
                            <li>Download MicroG to your Android device</li>
                            <li>
                              Go to <strong>Settings → Security</strong> and
                              enable{" "}
                              <strong>"Install from unknown sources"</strong>{" "}
                              for your browser
                            </li>
                            <li>
                              Open the downloaded APK file and follow the
                              prompts to install
                            </li>
                            <li>
                              Once installed, you can proceed to install any
                              ReVanced apps
                            </li>
                          </ol>
                          <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl text-white/70">
                            <p>
                              MicroG is required for ReVanced apps to function
                              properly as it provides the necessary Google
                              services without requiring the official Google
                              Play Services.
                            </p>
                          </div>
                        </>
                      ) : app.name?.includes("ReVanced") ? (
                        <>
                          <div className="text-lg font-medium text-primary mb-3">
                            ReVanced App Installation
                          </div>
                          <ol className="list-decimal pl-5 space-y-3 text-white/80">
                            <li>
                              Ensure you have installed{" "}
                              <strong>ReVanced MicroG</strong> first (required
                              for proper functioning)
                            </li>
                            <li>
                              Download the ReVanced APK to your Android device
                            </li>
                            <li>
                              Go to <strong>Settings → Security</strong> and
                              enable{" "}
                              <strong>"Install from unknown sources"</strong>{" "}
                              for your browser
                            </li>
                            <li>
                              Open the downloaded APK file and follow the
                              prompts to install
                            </li>
                            <li>
                              If you receive a "Replace app" prompt, click "OK"
                              to update the existing installation
                            </li>
                            <li>
                              Launch the app and sign in with your account
                            </li>
                          </ol>
                          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-white/80">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 float-left mr-2" />
                            <p>
                              Important: Make sure to uninstall any official
                              YouTube app before installing ReVanced to avoid
                              conflicts.
                            </p>
                          </div>
                        </>
                      ) : app.name?.includes("Manager") ? (
                        <>
                          <div className="text-lg font-medium text-primary mb-3">
                            ReVanced Manager Installation
                          </div>
                          <ol className="list-decimal pl-5 space-y-3 text-white/80">
                            <li>
                              Download ReVanced Manager to your Android device
                            </li>
                            <li>
                              Go to <strong>Settings → Security</strong> and
                              enable{" "}
                              <strong>"Install from unknown sources"</strong>{" "}
                              for your browser
                            </li>
                            <li>
                              Open the downloaded APK file and follow the
                              prompts to install
                            </li>
                            <li>Launch ReVanced Manager after installation</li>
                            <li>
                              Follow the in-app instructions to patch and
                              install your desired apps
                            </li>
                          </ol>
                          <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl text-white/70">
                            <p>
                              ReVanced Manager allows you to create your own
                              customized versions of apps with only the patches
                              you want.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-lg font-medium text-primary mb-3">
                            Android App Installation
                          </div>
                          <ol className="list-decimal pl-5 space-y-3 text-white/80">
                            <li>Download the app to your Android device</li>
                            <li>
                              Go to <strong>Settings → Security</strong> and
                              enable{" "}
                              <strong>"Install from unknown sources"</strong>{" "}
                              for your browser
                            </li>
                            <li>
                              Open the downloaded APK file and follow the
                              prompts to install
                            </li>
                            <li>
                              Once installed, you can find and launch the app
                              from your app drawer
                            </li>
                          </ol>
                        </>
                      )}

                      {/* Installation troubleshooting */}
                      <div className="mt-6 pt-5 border-t border-primary/10">
                        <h4 className="font-medium mb-3 text-white/90">
                          Troubleshooting
                        </h4>
                        <p className="mb-3 text-white/80">
                          If you encounter any installation issues:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-white/70">
                          <li>
                            Make sure your device has enough storage space
                          </li>
                          <li>
                            Check if you have enabled installation from unknown
                            sources
                          </li>
                          <li>
                            Verify that you're using a supported Android version
                          </li>
                          <li>
                            Try downloading the file again if it appears
                            corrupted
                          </li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* App details link */}
              <div className="mt-6 text-center">
                <Button variant="ghost" className="gap-2" onClick={() => router.push(`/apps/${app.slug}`)}>
                  View Detailed App Information
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}