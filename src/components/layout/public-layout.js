import { ReactNode, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Menu, Github, Twitter, MessageCircle, ExternalLink } from "lucide-react";
import { RevancedLogo } from "@/components/ui/revanced-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Helmet } from "react-helmet";


export default function PublicLayout({ children }) {
  const isMobile = useIsMobile();
  
  // Get settings
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      return response.json();
    }
  });
  
  // Get published pages for footer
  const { data: pages } = useQuery({
    queryKey: ["/api/pages"],
    queryFn: async () => {
      const response = await fetch('/api/pages');
      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }
      return response.json();
    }
  });

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Apps", href: "/apps" },
    { name: "Blog", href: "/posts" },
  ];

  // Social media links from settings with icons
  const socialLinks = [];
  
  // Add social links only if they have a value in settings
  // Helper to check and get setting by snake_case key but converting to camelCase for backend lookup
  const getSocialValue = (key) => {
    // Convert to camelCase for backend lookup
    const camelKey = key.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
    return settings?.find(s => s.settingKey === camelKey)?.settingValue || "";
  };
  
  const twitterUrl = getSocialValue("social_twitter");
  if (twitterUrl) {
    socialLinks.push({ 
      key: "social_twitter", 
      name: "Twitter", 
      icon: <Twitter className="h-4 w-4 mr-2" />,
      url: twitterUrl
    });
  }
  
  const githubUrl = getSocialValue("social_github");
  if (githubUrl) {
    socialLinks.push({ 
      key: "social_github", 
      name: "GitHub", 
      icon: <Github className="h-4 w-4 mr-2" />,
      url: githubUrl
    });
  }
  
  const discordUrl = getSocialValue("social_discord");
  if (discordUrl) {
    socialLinks.push({ 
      key: "social_discord", 
      name: "Discord", 
      icon: <MessageCircle className="h-4 w-4 mr-2" />,
      url: discordUrl
    });
  }

  // Convert snake_case keys to camelCase for consistency with backend
  const convertToCamelCase = (key) => {
    // Special cases first
    if (key === 'header_scripts') return 'headerScripts';
    if (key === 'footer_scripts') return 'footerScripts';
    
    // General rule: convert snake_case to camelCase
    return key.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
  };
  
  // Extract SEO settings
  const getSetting = (key, defaultValue = '') => {
    const camelKey = convertToCamelCase(key);
    return settings?.find(s => s.settingKey === camelKey)?.settingValue || defaultValue;
  };
  
  const siteTitle = getSetting('site_title', 'ReVanced');
  const siteDescription = getSetting('site_description', 'Open-source applications with enhanced features');
  
  // Meta tags
  const metaTitle = getSetting('meta_title', siteTitle);
  const metaDescription = getSetting('meta_description', siteDescription);
  const metaKeywords = getSetting('meta_keywords', 'revanced, android, apps, mods');
  
  // OpenGraph tags
  const ogTitle = getSetting('og_title', metaTitle);
  const ogDescription = getSetting('og_description', metaDescription);
  const ogImage = getSetting('og_image', '');
  const ogUrl = getSetting('og_url', '');
  const ogType = getSetting('og_type', 'website');
  
  // Twitter tags
  const twitterCard = getSetting('twitter_card', 'summary_large_image');
  const twitterTitle = getSetting('twitter_title', ogTitle);
  const twitterDescription = getSetting('twitter_description', ogDescription);
  const twitterImage = getSetting('twitter_image', ogImage);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />
        <meta name="robots" content="noindex, nofollow" id="__dummy__runtime-error-plugin" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {ogUrl && <meta property="og:url" content={ogUrl} />}
        <meta property="og:type" content={ogType} />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content={twitterCard} />
        <meta name="twitter:title" content={twitterTitle} />
        <meta name="twitter:description" content={twitterDescription} />
        {twitterImage && <meta name="twitter:image" content={twitterImage} />}
        
        {/* Custom Header Scripts - Trusted admin-only content */}
        {getSetting('header_scripts') && (
          <script type="text/javascript" 
            data-admin-script="true"
            dangerouslySetInnerHTML={{ __html: getSetting('header_scripts') }} 
          />
        )}
      </Helmet>
      
      {/* Header with solid background to prevent click-through issues */}
      <header className="sticky top-0 z-50 bg-background border-b border-primary/20 shadow-md">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center space-x-2">
            {getSetting('revanced_logo') ? (
              <img src={getSetting('revanced_logo')} alt="ReVanced Logo" className="h-8 w-auto" />
            ) : (
              <RevancedLogo size={32} />
            )}
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              ReVanced
            </span>
          </Link>

          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="border-l border-primary/20">
                <div className="flex items-center mt-6 mb-8">
                  {getSetting('revanced_logo') ? (
                    <img src={getSetting('revanced_logo')} alt="ReVanced Logo" className="h-7 w-auto" />
                  ) : (
                    <RevancedLogo size={28} />
                  )}
                  <span className="font-bold ml-2 text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    ReVanced
                  </span>
                </div>
                
                {/* Language Selector removed */}
                
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link key={link.name} to={link.href}>
                      <Button 
                        variant="ghost" 
                        className="justify-start w-full hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        {link.name}
                      </Button>
                    </Link>
                  ))}
                  <div className="border-t border-primary/10 my-4 pt-4">
                    <h3 className="text-sm text-muted-foreground mb-2 px-3">Connect</h3>
                    {socialLinks.map((link) => (
                      <Button
                        key={link.key}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start mb-2 hover:bg-primary/10"
                        asChild
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.icon}
                          {link.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center">
              <nav className="flex items-center mr-8 space-x-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.href} 
                    className="font-medium text-muted-foreground hover:text-primary transition-colors relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                ))}
              </nav>
              <div className="flex items-center space-x-4">
                {/* Language Selector removed */}
                
                {/* Social Links */}
                {socialLinks.map((link) => (
                  <Button 
                    key={link.key} 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20"
                    asChild
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer" title={link.name}>
                      {link.icon}
                      <span className="sr-only">{link.name}</span>
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="border-t border-primary/20 bg-black/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                {getSetting('revanced_logo') ? (
                  <img src={getSetting('revanced_logo')} alt="ReVanced Logo" className="h-8 w-auto" />
                ) : (
                  <RevancedLogo size={32} />
                )}
                <span className="font-bold text-xl">ReVanced</span>
              </div>
              <p className="text-muted-foreground max-w-md leading-relaxed mb-6">
                ReVanced aims to provide an open-source alternative to proprietary applications, offering enhanced features and improved functionality for a better mobile experience.
              </p>
              <div className="flex space-x-3">
                {socialLinks.map((link) => (
                  <Button 
                    key={link.key} 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full border-primary/20 hover:border-primary/50 hover:bg-primary/10"
                    asChild
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer" title={link.name}>
                      {link.icon}
                      <span className="sr-only">{link.name}</span>
                    </a>
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 text-primary/90">Quick Links</h3>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mr-2 transition-all group-hover:w-2"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 text-primary/90">Legal Pages</h3>
              <ul className="space-y-3">
                {pages && pages.filter(page => page.status === 'published').map((page) => (
                  <li key={page.id}>
                    <Link 
                      to={`/pages/${page.slug}`} 
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mr-2 transition-all group-hover:w-2"></span>
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4 text-primary/90">Resources</h3>
              <ul className="space-y-3">
                {socialLinks.map((link) => (
                  <li key={link.key}>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mr-2 transition-all group-hover:w-2"></span>
                      {link.name}
                    </a>
                  </li>
                ))}
                <li>
                  <a 
                    href="https://github.com/revanced/revanced-documentation"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mr-2 transition-all group-hover:w-2"></span>
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary/20 mt-12 pt-8 text-center text-muted-foreground flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} ReVanced. All rights reserved.</p>
            <p className="text-xs text-muted-foreground/70 mt-2 md:mt-0">
              Designed with <span className="text-red-500">♥</span> for the open source community
            </p>
          </div>
        </div>
        
        {/* Custom Footer Scripts - Trusted admin-only content */}
        {getSetting('footer_scripts') && (
          <div 
            data-admin-script="true"
            dangerouslySetInnerHTML={{ __html: getSetting('footer_scripts') }} 
          />
        )}
      </footer>
    </div>
  );
}