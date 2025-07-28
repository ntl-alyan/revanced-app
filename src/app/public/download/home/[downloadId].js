import { useState, useEffect } from "react";
import { useParams, useRoute } from "wouter";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import PublicLayout from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Download,
  Home,
  Shield,
  FileCode,
  Smartphone,
  Loader2,
  CheckCircle2,
  Info,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Homepage } from "@shared/schema";
import { RevancedLogo } from "@/components/ui/revanced-logo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HomepageDownloadPage() {
  // States for timing and UI
  const [showDownload, setShowDownload] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [progress, setProgress] = useState(0);

  // Routing - download pages should not change with language
  const [isMatch, params] = useRoute("/download/home/:downloadId");
  const { downloadId } = params || useParams();

  // Fetch homepage data using the download ID
  const {
    data: homepage,
    error,
    isLoading,
  } = useQuery({
    queryKey: [`/api/homepage/download/${downloadId}`],
    enabled: !!downloadId,
    queryFn: async () => {
      const response = await fetch(`/api/homepage/download/${downloadId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch homepage data");
      }
      return response.json();
    },
  });

  // Setup countdown timer
  useEffect(() => {
    if (!isLoading && homepage) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowDownload(true);
            return 0;
          }
          return prev - 1;
        });

        setProgress((prev) => {
          const newProgress = prev + 10;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLoading, homepage]);

  // Helper function to format date
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

  if (error || !homepage) {
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
            <Button asChild size="lg" className="gap-2">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Return to Homepage
              </Link>
            </Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Helmet>
        <title>Download ReVanced | ReVanced</title>
        <meta
          name="description"
          content={
            homepage.metaDescription ||
            `Download the latest version of ReVanced.`
          }
        />
        <meta name="robots" content="noindex, nofollow" />
        {/* Open Graph meta tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Download ReVanced | ReVanced" />
        <meta
          property="og:description"
          content={
            homepage.metaDescription ||
            `Download the latest version of ReVanced.`
          }
        />
        <meta property="og:site_name" content="ReVanced" />
      </Helmet>

      <div className="relative overflow-hidden min-h-[80vh] flex flex-col items-center justify-center py-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl opacity-30"></div>

        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          {/* Return to homepage button - more visible version */}
          <div className="absolute top-4 left-4 md:left-4 z-50">
            <Button
              size="default"
              asChild
              className="bg-primary hover:bg-primary/90 text-black font-medium shadow-lg border-2 border-white/20"
            >
              <Link to="/">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Homepage
              </Link>
            </Button>
          </div>

          {/* Main download card */}
          <div className="bg-black/30 backdrop-blur-lg border border-primary/10 rounded-3xl overflow-hidden shadow-xl">
            {/* Header section with gradient background */}
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 md:p-10 flex flex-col items-center text-center">
              <div className="h-28 w-28 bg-black/40 rounded-2xl border border-primary/20 p-4 flex items-center justify-center mb-6 backdrop-blur-sm">
                <RevancedLogo size={80} />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-2">ReVanced</h1>

              <div className="flex items-center justify-center gap-3 mb-4">
                {homepage.version && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
                    v{homepage.version}
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
                {homepage.description ||
                  "The official ReVanced application for Android devices."}
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

                {!showDownload ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-primary">
                        Preparing your secure download...
                      </span>
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3 bg-black/50" />
                    <p className="text-sm text-white/60 text-center mt-3">
                      Your download will be ready in {countdown} seconds
                    </p>
                  </div>
                ) : homepage.downloadUrl ? (
                  <div className="animate-in fade-in-50 duration-500">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className="w-full gap-3 py-6 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/10"
                            asChild
                          >
                            <a
                              href={homepage.downloadUrl}
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
                    <Button variant="outline" className="bg-black/30" asChild>
                      <Link to="/">Return to Homepage</Link>
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
                      ReVanced Details
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <span className="text-sm text-white/60">App Name</span>
                        <p className="font-medium">ReVanced</p>
                      </div>

                      {homepage.version && (
                        <div>
                          <span className="text-sm text-white/60">Version</span>
                          <p className="font-medium">{homepage.version}</p>
                        </div>
                      )}

                      {homepage.createdAt && (
                        <div>
                          <span className="text-sm text-white/60">
                            Release Date
                          </span>
                          <p className="font-medium">
                            {formatDate(homepage.createdAt)}
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
                      <div className="text-lg font-medium text-primary mb-3">
                        ReVanced Installation
                      </div>
                      <ol className="list-decimal pl-5 space-y-3 text-white/80">
                        <li>Download ReVanced to your Android device</li>
                        <li>
                          Go to <strong>Settings → Security</strong> and enable{" "}
                          <strong>"Install from unknown sources"</strong> for
                          your browser
                        </li>
                        <li>
                          Open the downloaded APK file and follow the prompts to
                          install
                        </li>
                        <li>
                          After installation, open ReVanced to get started
                        </li>
                      </ol>
                      <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl text-white/80">
                        <p className="text-sm leading-relaxed">
                          <strong>Note:</strong> For the complete ReVanced
                          experience, you may need to download and install
                          ReVanced MicroG separately, which provides the
                          necessary Google services for enhanced functionality.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          <div className="mt-6 text-center text-white/50 text-sm">
            <p>ReVanced © {new Date().getFullYear()} All Rights Reserved</p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
