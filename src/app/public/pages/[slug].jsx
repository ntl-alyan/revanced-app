import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import PublicLayout from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";

// interface Page {
//   id: number;
//   title: string;
//   slug: string;
//   content: string;
//   status: string;
//   metaTitle?: string;
//   metaDescription?: string;
//   createdAt: string;
//   updatedAt: string;
// }

export default function PageDetailPage() {
  const [, params] = useRoute("/pages/:slug");
  const slug = params?.slug;

  const { data: page, isLoading } = useQuery({
    queryKey: ["/api/pages/slug", slug],
    queryFn: async () => {
      const response = await fetch(`/api/pages/slug/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch page");
      }
      return response.json();
    },
    enabled: !!slug,
  });

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

  // Helper to get settings
  const getSetting = (key, defaultValue = "") => {
    const setting = settings?.find((s) => s.settingKey === key);
    return setting?.settingValue || defaultValue;
  };

  const siteTitle = getSetting("siteTitle", "ReVanced");

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-1/3 mb-6" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PublicLayout>
    );
  }

  if (!page) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-6">Page Not Found</h1>
          <p className="text-white/70 mb-8">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Helmet>
        <title>
          {page.metaTitle || page.title} | {siteTitle}
        </title>
        {page.metaDescription && (
          <meta name="description" content={page.metaDescription} />
        )}

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={page.metaTitle || page.title} />
        {page.metaDescription && (
          <meta property="og:description" content={page.metaDescription} />
        )}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-primary/10"
            asChild
          >
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 pb-4 border-b border-primary/20">
          {page.title}
        </h1>

        <div
          className="prose prose-lg max-w-none prose-invert prose-headings:text-primary/90 prose-h2:border-b prose-h2:border-primary/20 prose-h2:pb-2
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-primary/90 prose-code:bg-primary/10 prose-code:text-primary prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-black/50 prose-pre:border prose-pre:border-primary/10 
            prose-img:rounded-lg prose-img:mx-auto"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </PublicLayout>
  );
}
