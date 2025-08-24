"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  CheckCircle2,
  Shield,
  Zap,
  Users,
  Settings,
  Smartphone,
  Download,
  Code,
  Blocks,
  Lock,
  Cpu,
  Volume2,
  Eye,
  Palette,
  ShieldAlert,
  Gauge,
  BatteryCharging,
  CornerRightDown,
} from "lucide-react";
import PublicLayout from "@/src/components/layout/public-layout";
import { Button } from "@/src/components/ui/button";
import { RevancedLogo } from "@/src/components/ui/logo";
import { Badge } from "@/src/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import Head from "next/head";
import { useCallback } from "react";

export default function PublicHomePage() {
  // Get default homepage data
  const { data: homepage } = useQuery({
    queryKey: ["/api/homepage"],
    queryFn: async () => {
      const response = await fetch("/api/homepage");
      if (!response.ok) {
        throw new Error("Failed to fetch homepage data");
      }
      return response.json();
    },
  });

  // Get apps for "Featured Apps" section
  const { data: apps } = useQuery({
    queryKey: ["/api/apps"],
    queryFn: async () => {
      const response = await fetch("/api/apps");
      if (!response.ok) {
        throw new Error("Failed to fetch apps");
      }
      return response.json();
    },
  });

  // Get site settings
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

  const convertToCamelCase = (key) => {
    // Special cases first
    if (key === "header_scripts") return "headerScripts";
    if (key === "footer_scripts") return "footerScripts";

    // General rule: convert snake_case to camelCase
    return key.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
  };

  // Helper function to get setting value
  const getSetting = useCallback(
    (key) => {
      const camelKey = convertToCamelCase(key);
      const setting = settings?.find((s) => s.settingKey === camelKey);
      return setting?.settingValue;
    },
    [settings]
  );

  // Use homepage sections directly
  const sections = homepage?.sections || [];

  // Find hero section
  const heroSection = sections.find((section) => section.type === "hero");

  // Helper function to get icon component based on name or index
  const getIconByNameOrIndex = (name, index = 0, className = "h-5 w-5") => {
    if (name?.toLowerCase()) {
      switch (name.toLowerCase()) {
        case "check":
        case "checkcircle":
        case "checkcircle2":
          return <CheckCircle2 className={className} />;
        case "shield":
          return <Shield className={className} />;
        case "shield-alert":
        case "shieldalert":
          return <ShieldAlert className={className} />;
        case "zap":
          return <Zap className={className} />;
        case "users":
          return <Users className={className} />;
        case "settings":
          return <Settings className={className} />;
        case "smartphone":
          return <Smartphone className={className} />;
        case "cpu":
          return <Cpu className={className} />;
        case "code":
          return <Code className={className} />;
        case "blocks":
          return <Blocks className={className} />;
        case "lock":
          return <Lock className={className} />;
        case "volume":
        case "volume2":
          return <Volume2 className={className} />;
        case "eye":
          return <Eye className={className} />;
        case "palette":
          return <Palette className={className} />;
        case "gauge":
          return <Gauge className={className} />;
        case "battery":
        case "batterycharging":
          return <BatteryCharging className={className} />;
        default:
          return null;
      }
    }

    // Fallback icons based on index
    const featureIcons = [
      <ShieldAlert className={className} />,
      <Volume2 className={className} />,
      <Palette className={className} />,
      <Lock className={className} />,
      <Gauge className={className} />,
      <BatteryCharging className={className} />,
    ];

    const goalIcons = [
      <Shield className={className} />,
      <Gauge className={className} />,
      <Users className={className} />,
    ];

    // Return appropriate fallback icon based on context
    if (className.includes("text-primary/70")) {
      return goalIcons[index % goalIcons.length];
    }

    return featureIcons[index % featureIcons.length];
  };

  // Extract SEO metadata from homepage data
  const getMetaValue = (field, defaultValue = "") => {
    if (homepage && homepage[field]) {
      return homepage[field] || defaultValue;
    }
    return defaultValue;
  };

  const revancedLogo = settings ? getSetting("revanced_logo") : null;

  // Get SEO metadata
  const metaTitle = getMetaValue(
    "metaTitle",
    getSetting("site_title") || "ReVanced"
  );
  const metaDescription = getMetaValue(
    "metaDescription",
    getSetting("site_description") ||
      "ReVanced - Customization toolkit for Android applications"
  );
  const metaKeywords = getMetaValue(
    "metaKeywords",
    getSetting("meta_keywords") || "revanced, android, apps, mods"
  );

  // Get OpenGraph metadata
  const ogTitle = getMetaValue("ogTitle", metaTitle);
  const ogDescription = getMetaValue("ogDescription", metaDescription);
  const ogImage = getMetaValue("ogImage", getSetting("og_image") || "");

  return (
    <PublicLayout>
      {/* Custom SEO for this page that overrides default values in PublicLayout */}
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />

        {/* OpenGraph */}
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
      </Head>

      {/* Hero Section - with a modern glassmorphism aesthetic */}
      <section className="relative overflow-hidden py-24 md:py-32 mb-10">
        {/* Background gradient and glow effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background/95 to-background"></div>
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-3xl opacity-30"></div>
        <div className="absolute -bottom-[30%] -right-[20%] w-[80%] h-[80%] rounded-full bg-primary/5 blur-3xl opacity-30"></div>

        {/* Hero content */}
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="bg-primary/10 p-3 rounded-full inline-flex mx-auto mb-8 shadow-lg">
            {revancedLogo ? (
              <img
                src={revancedLogo}
                alt="ReVanced Logo"
                className="h-20 w-20 animate-pulse-slow"
              />
            ) : (
              <RevancedLogo size={80} className="animate-pulse-slow" />
            )}
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
            {heroSection?.title || "ReVanced"}
          </h1>

          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
            {heroSection?.subtitle ||
              "The ultimate customization toolkit for your favorite applications"}
          </p>

          <div className="flex flex-wrap justify-center gap-5">
            <div className="row">
              {homepage?.downloadId ? (
                <Button
                  size="lg"
                  className="text-lg px-8 h-14 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 mb-5"
                  asChild
                >
                  <Link href={`/download/${homepage.downloadId}`}>
                    <Download className="mr-2 h-5 w-5" />
                    Download ReVanced
                  </Link>
                </Button>
              ) : null}

              <Button
                size="lg"
                variant="default"
                className="text-lg px-8 h-14 hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center gap-2"
                asChild
              >
                <Link href={`/apps`}>
                  Explore Apps
                  <CornerRightDown className="h-5 w-5 text-white" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Scroll down indicator */}
        </div>
      </section>

      {/* Introduction Section with glass card */}
      {sections.find((section) => section.type === "intro") && (
        <section className="py-16 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto backdrop-blur-sm bg-primary/5 border border-primary/20 rounded-xl p-8 md:p-10 shadow-xl">
              <div className="absolute -z-10 top-0 right-0 h-32 w-32 bg-primary/10 rounded-full blur-2xl"></div>
              <div className="absolute -z-10 bottom-0 left-0 h-32 w-32 bg-primary/10 rounded-full blur-2xl"></div>

              <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary/70">
                {sections.find((section) => section.type === "intro")?.title ||
                  "Introduction"}
              </h2>

              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-center text-lg leading-relaxed text-white/80">
                  {
                    sections.find((section) => section.type === "intro")
                      ?.content
                  }
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* What is ReVanced Section - with modern segments */}
      {sections.find((section) => section.type === "about") && (
        <section className="py-20 bg-gradient-to-b from-background via-black/50 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary/70">
                  {sections.find((section) => section.type === "about")
                    ?.title || "What is ReVanced?"}
                </span>
              </h2>

              <div className="space-y-6 text-lg">
                {sections
                  .find((section) => section.type === "about")
                  ?.content?.split("\n\n")
                  .map((paragraph, index) => (
                    <p key={index} className="leading-relaxed text-white/80">
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Goals Section - with floating cards */}
      {sections.find((section) => section.type === "goals") && (
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>

          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary/70">
                {sections.find((section) => section.type === "goals")?.title ||
                  "Our Goals"}
              </span>
            </h2>

            <p className="text-center text-white/70 mb-16 max-w-2xl mx-auto text-lg">
              {sections.find((section) => section.type === "goals")?.content}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {sections
                .find((section) => section.type === "goals")
                ?.items?.map((goal, index) => (
                  <div
                    key={index}
                    className="group relative rounded-xl backdrop-blur-sm bg-black/30 border border-primary/20 p-6 shadow-xl transition-all duration-300 hover:translate-y-[-5px] hover:shadow-primary/10"
                  >
                    {/* Glowing dot in corner */}
                    <div className="absolute top-0 right-0 h-1 w-1 bg-primary rounded-full transform translate-x-1/2 -translate-y-1/2 group-hover:h-2 group-hover:w-2 transition-all duration-300"></div>

                    {/* Content */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                        {getIconByNameOrIndex(
                          goal.icon,
                          index,
                          "h-6 w-6 text-primary/70"
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                          {goal.title}
                        </h3>
                        <p className="text-white/70 leading-relaxed">
                          {goal.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Grid - with hexagon highlights */}
      {sections.find((section) => section.type === "features") && (
        <section className="py-24 bg-gradient-to-b from-black/50 via-background to-background relative">
          <div className="absolute inset-0 bg-[radial-gradient(#9ed5ff10_1px,transparent_1px)] bg-[size:20px_20px]"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge
                variant="outline"
                className="px-4 py-1 rounded-full text-primary border-primary/30 bg-primary/5 mb-3"
              >
                Powerful Features
              </Badge>

              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary/70">
                  {sections.find((section) => section.type === "features")
                    ?.title || "Key Features"}
                </span>
              </h2>

              <p className="text-white/70 text-lg leading-relaxed">
                {
                  sections.find((section) => section.type === "features")
                    ?.content
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {sections
                .find((section) => section.type === "features")
                ?.items?.map((feature, index) => (
                  <div
                    key={index}
                    className="relative group bg-gradient-to-br from-background to-black/40 border border-primary/10 rounded-xl overflow-hidden p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

                    <div className="relative">
                      <div className="h-14 w-14 flex items-center justify-center mb-5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        {getIconByNameOrIndex(
                          feature.icon,
                          index,
                          "h-7 w-7 text-primary"
                        )}
                      </div>

                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-white/70 leading-relaxed">
                        {feature.content}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Installation Guide - with modern timeline */}
      {sections.find((section) => section.type === "installation") && (
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl opacity-30"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary/70">
                  {sections.find((section) => section.type === "installation")
                    ?.title || "Installation Guide"}
                </span>
              </h2>

              <p className="text-center text-white/70 mb-16 max-w-2xl mx-auto text-lg">
                {
                  sections.find((section) => section.type === "installation")
                    ?.content
                }
              </p>

              <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 md:before:mx-auto before:w-0.5 before:bg-gradient-to-b before:from-primary/30 before:via-primary/50 before:to-primary/10 md:before:left-0 md:before:right-0">
                {sections
                  .find((section) => section.type === "installation")
                  ?.items?.map((step, index) => (
                    <div
                      key={index}
                      className="relative grid grid-cols-1 md:grid-cols-5 gap-y-3 md:gap-x-8 items-start"
                    >
                      {/* Step number with glow */}
                      <div className="flex md:justify-end md:col-span-2">
                        <div className="flex items-center">
                          <div className="flex relative z-10 md:order-1">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary shadow-glow font-bold text-black">
                              {index + 1}
                            </div>
                          </div>

                          <div className="md:hidden ml-4 md:ml-0 text-2xl font-bold text-white">
                            {step.title}
                          </div>
                        </div>
                      </div>

                      {/* Step content */}
                      <div className="md:col-span-3">
                        <div className="bg-black/30 backdrop-blur-sm p-5 rounded-xl border border-primary/10 shadow-xl hover:border-primary/25 transition-all">
                          <h3 className="hidden md:block text-xl font-bold mb-3 text-white">
                            {step.title}
                          </h3>
                          <p className="text-white/70">{step.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                <div className="flex justify-center pt-12">
                  {homepage?.downloadId ? (
                    <Button
                      className="gap-2 text-lg px-8 h-14 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                      size="lg"
                      asChild
                    >
                      <Link href={`/download/${homepage.downloadId}`}>
                        <Download className="h-5 w-5" />
                        Download ReVanced
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      className="gap-2 text-lg px-8 h-14 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                      size="lg"
                      asChild
                    >
                      <Link href={`/apps`}>
                        <Smartphone className="h-5 w-5" />
                        Explore Apps
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section - with styled accordion */}
      {sections.find((section) => section.type === "faq") && (
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl opacity-30"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary/70">
                  {sections.find((section) => section.type === "faq")?.title ||
                    "Frequently Asked Questions"}
                </span>
              </h2>

              <div className="bg-black/30 backdrop-blur-sm border border-primary/20 rounded-xl overflow-hidden shadow-xl">
                <Accordion type="single" collapsible className="w-full">
                  {sections
                    .find((section) => section.type === "faq")
                    ?.items?.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border-b border-primary/10 last:border-0"
                      >
                        <AccordionTrigger className="text-left px-6 py-5 text-white hover:text-primary hover:no-underline">
                          {faq.title}
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-5">
                          <p className="text-white/70">{faq.content}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-t from-background via-black/50 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#9ed5ff08_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Enhance Your Mobile Experience?
            </h2>

            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
              Join thousands of users enjoying enhanced applications with more
              features and better performance.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {homepage?.downloadId ? (
                <Button
                  size="lg"
                  className="text-lg px-8 h-14 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  asChild
                >
                  <Link href={`/download/${homepage.downloadId}`}>
                    <Download className="mr-2 h-5 w-5" />
                    Download ReVanced
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="text-lg px-8 h-14 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  asChild
                >
                  <Link href={`/apps`}>Get Started Now</Link>
                </Button>
              )}

              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 h-14 border-primary/30 hover:bg-primary/10"
                asChild
              >
                <a
                  href="https://github.com/revanced/revanced-documentation"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Code className="mr-2 h-5 w-5" />
                  Documentation
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
