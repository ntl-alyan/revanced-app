"use client"
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Github, 
  Download, 
  Calendar, 
  User, 
  ExternalLink, 
  Info,
  FileText,
  HelpCircle,
  Share2,
  Smartphone,
  Package2,
  GitBranch,
  Shield,
  CheckCircle2,
  MessageSquare,
  Star
} from "lucide-react";

import PublicLayout from "@/src/components/layout/public-layout";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion";
import { Skeleton } from "@/src/components/ui/skeleton";
import { format } from "date-fns";
import Head from 'next/head'
import { RevancedLogo } from "@/src/components/ui/revanced-logo";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";

export default function AppDetailPage({ params }) {
  const router = useRouter();
  const slug = params?.slug;
  
  // Get the app data first
  const { data: app, isLoading: appLoading, error: appError } = useQuery({
    queryKey: [`/api/apps/slug/${slug}`],
    queryFn: async () => {
      const response = await fetch(`/api/apps/slug/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch app");
      }
      return response.json();
    },
    enabled: !!slug,
  });
  // Get all languages
   const { data: languages, isLoading: languagesLoading } = useQuery({
    queryKey: ['/api/languages'],
    queryFn: async () => {
      const response = await fetch('/api/languages');
      if (!response.ok) {
        throw new Error("Failed to fetch languages");
      }
      return response.json();
    },
  });
  
  // Determine if we're loading any data
  const isLoading = appLoading || languagesLoading;

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-40 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton className="h-64 w-full mb-8" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (appError || !app) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">App Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The app you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/public/apps")}>
            Back to Apps
          </Button>
        </div>
      </PublicLayout>
    );
  }
  
  // Format date helper function
  function formatDate(dateString) {
    return format(new Date(dateString), "MMMM d, yyyy");
  }
  
  // Use app content directly (removed translation logic for simplicity)
  const appContent = {
    name: app.name,
    description: app.description,
    metaTitle: app.metaTitle || `${app.name} | ReVanced`,
    metaDescription: app.metaDescription || app.description?.substring(0, 160) || '',
    metaKeywords: app.metaKeywords || 'revanced, android, apps, mods',
    ogTitle: app.ogTitle || app.metaTitle || `${app.name} | ReVanced`,
    ogDescription: app.ogDescription || app.metaDescription || app.description?.substring(0, 160) || '',
    sections: app.sections
  };

  // Process content sections
  const sectionsToUse = appContent.sections || [];
  const processedSections = sectionsToUse.filter((section) => section !== null);
  
  // Organize sections in the specified order
  const sectionTypes = {
    introduction: processedSections?.filter((section) => 
      section?.type === 'content' && 
      (section?.title?.toLowerCase()?.includes('about') || 
       section?.title?.toLowerCase()?.includes('introduction'))),
    
    whatIs: processedSections?.filter((section) => 
      section?.type === 'content' && 
      section?.title?.toLowerCase()?.includes('what is')),
    
    features: processedSections?.filter((section) => 
      section?.type === 'features'),
    
    conclusion: processedSections?.filter((section) => 
      section?.type === 'content' && 
      section?.title?.toLowerCase()?.includes('conclusion')),
    
    faq: processedSections?.filter((section) => 
      section?.type === 'faq'),
      
    // Other section types
    installation: processedSections?.filter((section) => 
      section?.type === 'installation'),
      
    downloads: processedSections?.filter((section) => 
      section?.type === 'downloads'),
      
    // Other content sections that don't fit in predefined categories
    otherContent: processedSections?.filter((section) => 
      section?.type === 'content' && 
      !section?.title?.toLowerCase()?.includes('about') && 
      !section?.title?.toLowerCase()?.includes('introduction') &&
      !section?.title?.toLowerCase()?.includes('what is') &&
      !section?.title?.toLowerCase()?.includes('conclusion'))
  };

  return (
    <PublicLayout>
      <Head>
        {/* Basic Meta Tags */}
        <title>{appContent.metaTitle}</title>
        <meta name="description" content={appContent.metaDescription} />
        <meta name="keywords" content={appContent.metaKeywords} />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={appContent.ogTitle} />
        <meta property="og:description" content={appContent.ogDescription} />
        <meta property="og:site_name" content="ReVanced" />
        <meta property="og:image" content={app.ogImage || app.icon || app.featuredImage || ''} />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={appContent.ogTitle} />
        <meta name="twitter:description" content={appContent.ogDescription} />
        <meta name="twitter:image" content={app.ogImage || app.icon || app.featuredImage || ''} />
      </Head>
      
      {/* Hero Banner with Glassmorphism */}
      <div className="bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#020617] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-3xl rounded-full transform translate-x-1/2"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
        
        {/* Navigation */}
        <div className="container mx-auto px-4 pt-6 pb-2 relative z-10">
          <Button 
            variant="ghost" 
            className="group hover:bg-white/10 transition-colors text-white"
            onClick={() => router.push("/public/apps")}
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Apps
          </Button>
        </div>
        
        {/* App Header */}
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* App Icon */}
            <div className="h-28 w-28 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/10 p-6 flex items-center justify-center overflow-hidden shadow-lg">
              {app.icon ? (
                <img src={app.icon} alt={`${app.name} icon`} className="h-full w-full" />
              ) : app.name?.includes("MicroG") ? (
                <Package2 className="h-16 w-16 text-primary/70" />
              ) : app.name?.includes("ReVanced") ? (
                <RevancedLogo size={64} />
              ) : (
                <Package2 className="h-16 w-16 text-primary/70" />
              )}
            </div>
            
            <div className="text-center md:text-left md:flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{appContent.name}</h1>
                {app.version && (
                  <Badge className="inline-flex bg-primary/20 text-primary border-primary/30 md:self-start">
                    v{app.version}
                  </Badge>
                )}
              </div>
              
              {/* App Meta Info */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-6 text-white/70">
                {app.createdAt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary/70" />
                    {formatDate(app.createdAt)}
                  </div>
                )}
                
                {app.updatedAt && app.createdAt !== app.updatedAt && (
                  <div className="flex items-center">
                    <GitBranch className="h-4 w-4 mr-2 text-primary/70" />
                    Updated: {formatDate(app.updatedAt)}
                  </div>
                )}
                
                <div className="flex items-center">
                  <Smartphone className="h-4 w-4 mr-2 text-primary/70" />
                  Android
                </div>

                
                
                {app.authorName && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary/70" />
                    {app.authorName}
                  </div>
                )}
              </div>
              
              
              {app.description && (
                  <div className="mb-3 text-100">
                    {app.description}
                    
                  </div>
                  )}
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {app.downloadId ? (
                  <Button 
                    size="lg" 
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/10"
                    onClick={() => router.push(`/public/download/${app.downloadId}`)}
                  >
                    <Download className="h-5 w-5" />
                    Download Now
                  </Button>
                ) : app.downloadUrl ? (
                  <Button 
                    size="lg" 
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/10"
                    asChild
                  >
                    <a href={app.downloadUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-5 w-5" />
                      Download Now
                    </a>
                  </Button>
                ) : (
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-primary/70 to-primary/50 shadow-lg shadow-primary/10" disabled>
                    <Download className="h-5 w-5" />
                    Download Not Available
                  </Button>
                )}
                
                {app.githubUrl && (
                  <Button variant="outline" className="bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-white/10" asChild>
                    <a href={app.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                )}
                
                {app.websiteUrl && (
                  <Button variant="outline" className="bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-white/10" asChild>
                    <a href={app.websiteUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Website
                    </a>
                  </Button>
                )}
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-white/10">
                        <Share2 className="h-4 w-4" />
                        <span className="sr-only">Share</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share this app</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[#030712] py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left content column */}
            <div className="md:col-span-2 space-y-10">
              {/* 1. About/Introduction Section */}
              <div className="mb-8 bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#020617] p-6 rounded-xl border border-white/10 shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center text-white">
                    <Info className="mr-2 h-5 w-5 text-primary" />
                    About {appContent.name}
                  </h2>
                  
                  {/* Main Content */}
                  <div className="prose prose-lg max-w-none mb-4 prose-invert">
                    {app.content && (
                      <div dangerouslySetInnerHTML={{ __html: app.content }} />
                    )}
                  </div>
                  
                  {/* Introduction content sections */}
                  {sectionTypes.introduction?.map((section, index) => (
                    <div key={index} className="mt-6">
                      {section.title && section.title !== 'About' && (
                        <h3 className="text-xl font-semibold mb-3 mt-6 border-l-4 border-primary pl-3 py-1 text-white">{section.title}</h3>
                      )}
                      
                      {section.content && (
                        <div className="prose prose-lg max-w-none prose-invert text-white/90" dangerouslySetInnerHTML={{ __html: section.content }} />
                      )}
                      
                      {section.items && section.items.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {section.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="bg-black/20 rounded-lg p-4 border border-white/5">
                              <h4 className="font-medium text-white mb-2">{item.title}</h4>
                              <p className="text-white/70">{item.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 2. What Is Section */}
              {sectionTypes.whatIs && sectionTypes.whatIs.length > 0 && (
                <div className="bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#020617] p-6 rounded-xl border border-white/10 shadow-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                  <div className="relative z-10">
                    {sectionTypes.whatIs.map((section, index) => (
                      <div key={index}>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center text-white">
                          <HelpCircle className="mr-2 h-5 w-5 text-primary" />
                          {section.title}
                        </h2>
                        
                        {section.content && (
                          <div className="prose prose-lg max-w-none prose-invert text-white/90" dangerouslySetInnerHTML={{ __html: section.content }} />
                        )}
                        
                        {section.items && section.items.length > 0 && (
                          <div className="mt-6 space-y-4">
                            {section.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="bg-black/20 rounded-lg p-4 border border-white/5">
                                <h4 className="font-medium text-white mb-2">{item.title}</h4>
                                <p className="text-white/70">{item.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 3. Features Section */}
              {sectionTypes.features && sectionTypes.features.length > 0 && (
                <div className="bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#020617] p-6 rounded-xl border border-white/10 shadow-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                  <div className="relative z-10">
                    {sectionTypes.features.map((section, index) => (
                      <div key={index}>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center text-white">
                          <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
                          {section.title || "Key Features"}
                        </h2>
                        
                        {section.content && (
                          <div className="prose prose-lg max-w-none mb-6 prose-invert text-white/90" dangerouslySetInnerHTML={{ __html: section.content }} />
                        )}
                        
                        {section.items && section.items.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {section.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="bg-black/20 rounded-lg p-4 border border-white/5 flex">
                                <CheckCircle2 className="h-5 w-5 mr-3 text-primary shrink-0 mt-0.5" />
                                <div>
                                  <h4 className="font-medium text-white mb-1">{item.title}</h4>
                                  <p className="text-white/70 text-sm">{item.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 4. Installation Section */}
              {sectionTypes.installation && sectionTypes.installation.length > 0 && (
                <div className="bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#020617] p-6 rounded-xl border border-white/10 shadow-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                  <div className="relative z-10">
                    {sectionTypes.installation.map((section, index) => (
                      <div key={index}>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center text-white">
                          <Shield className="mr-2 h-5 w-5 text-primary" />
                          {section.title || "Installation Guide"}
                        </h2>
                        
                        {section.content && (
                          <div className="prose prose-lg max-w-none mb-6 prose-invert text-white/90" dangerouslySetInnerHTML={{ __html: section.content }} />
                        )}
                        
                        {section.items && section.items.length > 0 && (
                          <div className="mt-4 space-y-4">
                            {section.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="bg-black/20 rounded-lg p-4 border border-white/5">
                                <div className="flex items-center mb-2">
                                  <div className="bg-primary/20 text-primary h-6 w-6 rounded-full flex items-center justify-center mr-3 font-medium text-sm">
                                    {itemIndex + 1}
                                  </div>
                                  <h4 className="font-medium text-white">{item.title}</h4>
                                </div>
                                <p className="text-white/70 ml-9">{item.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 5. Other Content Sections */}
              {sectionTypes.otherContent && sectionTypes.otherContent.length > 0 && (
                <div className="bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#020617] p-6 rounded-xl border border-white/10 shadow-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                  <div className="relative z-10">
                    {sectionTypes.otherContent.map((section, index) => (
                      <div key={index} className={index > 0 ? "mt-10" : ""}>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center text-white">
                          <FileText className="mr-2 h-5 w-5 text-primary" />
                          {section.title}
                        </h2>
                        
                        {section.content && (
                          <div className="prose prose-lg max-w-none prose-invert text-white/90" dangerouslySetInnerHTML={{ __html: section.content }} />
                        )}
                        
                        {section.items && section.items.length > 0 && (
                          <div className="mt-4 space-y-4">
                            {section.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="bg-black/20 rounded-lg p-4 border border-white/5">
                                <h4 className="font-medium text-white mb-2">{item.title}</h4>
                                <p className="text-white/70">{item.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 6. Conclusion Section */}
              {sectionTypes.conclusion && sectionTypes.conclusion.length > 0 && (
                <div className="bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#020617] p-6 rounded-xl border border-white/10 shadow-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    {sectionTypes.conclusion.map((section, index) => (
                      <div key={index}>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center text-white">
                          <Star className="mr-2 h-5 w-5 text-primary" />
                          {section.title}
                        </h2>
                        
                        {section.content && (
                          <div className="prose prose-lg max-w-none mb-6 prose-invert text-white/90" dangerouslySetInnerHTML={{ __html: section.content }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Download Card - Removed as it's redundant with the top download button */}
              
              {/* Links Card */}
              {(app.githubUrl || app.websiteUrl) && (
                <Card className="border-white/10 bg-[#111827] shadow-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                  <CardContent className="pt-6 relative z-10">
                    <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
                      <GitBranch className="mr-2 h-5 w-5 text-primary" />
                      External Resources
                    </h2>
                    <div className="space-y-3">
                      {app.githubUrl && (
                        <Button variant="outline" className="w-full justify-start hover:bg-white/10 bg-black/20 border-white/10 text-white" size="sm" asChild>
                          <a href={app.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="mr-2 h-4 w-4 text-primary/70" />
                            GitHub Repository
                          </a>
                        </Button>
                      )}
                      
                      {app.websiteUrl && (
                        <Button variant="outline" className="w-full justify-start hover:bg-white/10 bg-black/20 border-white/10 text-white" size="sm" asChild>
                          <a href={app.websiteUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4 text-primary/70" />
                            Official Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Right sidebar column with additional content */}
            <div className="md:col-span-1">
              <div className="bg-black/30 backdrop-blur-lg border border-primary/10 rounded-2xl h-fit sticky top-24">
                <div className="p-5">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-primary" />
                    App Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-white/60">App Name</span>
                      <p className="font-medium text-sm">{app.name}</p>
                    </div>
                    
                    {app.version && (
                      <div>
                        <span className="text-xs text-white/60">Version</span>
                        <p className="font-medium text-sm">{app.version}</p>
                      </div>
                    )}
                    
                    {app.createdAt && (
                      <div>
                        <span className="text-xs text-white/60">Release Date</span>
                        <p className="font-medium text-sm">{formatDate(app.createdAt)}</p>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-xs text-white/60">Platform</span>
                      <p className="font-medium text-sm">Android</p>
                    </div>
                  </div>
                </div>
                
                <Accordion type="single" collapsible className="border-t border-primary/10">
                  {sectionTypes.faq && sectionTypes.faq.length > 0 && (
                    <AccordionItem value="faq" className="border-b-0">
                      <AccordionTrigger className="px-4 py-3 hover:bg-black/30 transition-all">
                        <span className="flex items-center text-base font-medium">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          FAQs
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 space-y-3">
                        {sectionTypes.faq.map((section) => 
                          section.items && section.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
                              <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                              <p className="text-white/70 text-xs">{item.content}</p>
                            </div>
                          ))
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </div>
              
              {/* Related Links (optional section) */}
              {(app.githubUrl || app.websiteUrl) && (
                <div className="bg-black/30 backdrop-blur-lg border border-primary/10 rounded-2xl p-5 mt-6">
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2 text-primary" />
                    Related Links
                  </h3>
                  <div className="space-y-3">
                    {app.githubUrl && (
                      <a 
                        href={app.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors border border-white/5"
                      >
                        <Github className="h-4 w-4 mr-3 text-white/70" />
                        <span className="text-sm">GitHub Repository</span>
                      </a>
                    )}
                    
                    {app.websiteUrl && (
                      <a 
                        href={app.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors border border-white/5"
                      >
                        <ExternalLink className="h-4 w-4 mr-3 text-white/70" />
                        <span className="text-sm">Official Website</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}