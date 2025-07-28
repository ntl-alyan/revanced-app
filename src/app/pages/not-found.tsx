import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { RevancedLogo } from "@/components/ui/revanced-logo";

interface SettingItem {
  id: number;
  settingKey: string;
  settingValue: string;
}

export default function NotFound() {
  const [location] = useLocation();
  
  // Get settings to display site logo
  const { data: settings } = useQuery<SettingItem[]>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      return response.json();
    }
  });
  
  const revancedLogoSrc = settings?.find(s => s.settingKey === "revanced_logo")?.settingValue;
  const siteTitle = settings?.find(s => s.settingKey === "site_title")?.settingValue || "ReVanced";

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background dark:bg-gray-900 text-foreground">
      <div className="w-full max-w-md px-6 py-12 text-center">
        <div className="mb-8 flex flex-col items-center justify-center">
          {revancedLogoSrc ? (
            <img src={revancedLogoSrc} alt={siteTitle} className="h-16 w-auto mb-4" />
          ) : (
            <RevancedLogo size={64} className="mb-4" />
          )}
          
          <div className="flex items-center mb-2">
            <AlertCircle className="h-10 w-10 text-primary mr-2" />
            <h1 className="text-5xl font-bold">404</h1>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
          
          <p className="text-muted-foreground mb-8">
            We couldn't find the page you were looking for. <br />
            The page may have been moved or deleted.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default" className="flex items-center">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="flex items-center">
              <a onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </a>
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground mt-8">
          <p>Looking for something specific? Try navigating from the homepage or contact support.</p>
          <p className="mt-1">URL: {location}</p>
        </div>
      </div>
    </div>
  );
}
