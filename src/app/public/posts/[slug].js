import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute, useLocation } from "wouter";
import PublicLayout from "@/components/layout/public-layout";
import { Helmet } from "react-helmet";
import { Post } from "@shared/schema";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

export default function BlogPostDetailPage() {
  const [, params] = useRoute("/posts/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug;

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/posts", slug],
    queryFn: async () => {
      const response = await fetch(`/api/posts/slug/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }
      return response.json();
    },
    enabled: !!slug,
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    },
  });

  const { data: relatedPosts } = useQuery({
    queryKey: ["/api/posts/related", post?.categoryId],
    queryFn: async () => {
      const response = await fetch(
        `/api/posts?categoryId=${post?.categoryId}&limit=3&exclude=${post?.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch related posts");
      }
      return response.json();
    },
    enabled: !!post?.categoryId,
  });

  const getCategoryName = (categoryId) => {
    if (!categoryId || !categories) return "Uncategorized";
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  if (error) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load the blog post. Please try again later or return to
              the blog home page.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-8">
            <Button asChild>
              <Link to="/posts">Back to Blog</Link>
            </Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <div className="flex items-center space-x-4 mb-8">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-96 w-full mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!post) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-6">Post Not Found</h1>
          <p className="text-white/70 mb-8">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/posts">Back to Blog</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Helmet>
        <title>{post.metaTitle || post.title} - ReVanced</title>
        <meta
          name="description"
          content={
            post.metaDescription || post.excerpt || "Read about ReVanced"
          }
        />
        {post.categoryId && (
          <meta
            name="keywords"
            content={`revanced, blog, ${getCategoryName(
              post.categoryId
            ).toLowerCase()}`}
          />
        )}
      </Helmet>

      {/* Back to blog link */}
      <div className="container mx-auto px-4 pt-8">
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary hover:bg-primary/10"
          asChild
        >
          <Link to="/posts">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Link>
        </Button>
      </div>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="container mx-auto px-4 py-8">
          <div className="relative max-w-5xl mx-auto rounded-xl overflow-hidden h-[400px]">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            <div className="absolute bottom-0 left-0 right-0 p-8">
              <Badge className="mb-4 bg-primary/90 hover:bg-primary text-white">
                {getCategoryName(post.categoryId)}
              </Badge>
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-md">
                {post.title}
              </h1>
              <div className="flex items-center text-white/80 text-sm mt-4">
                <div className="flex items-center mr-6">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {format(new Date(post.createdAt), "MMMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Without Featured Image - Alternative Header */}
      {!post.featuredImage && (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <Badge className="mb-4 bg-primary/90 hover:bg-primary text-white">
            {getCategoryName(post.categoryId)}
          </Badge>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center text-white/60 text-sm mb-8">
            <div className="flex items-center mr-6">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{format(new Date(post.createdAt), "MMMM d, yyyy")}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Article Content */}
          <div
            className={
              relatedPosts && relatedPosts.length > 0
                ? "lg:w-2/3"
                : "w-full max-w-4xl mx-auto"
            }
          >
            <Card className="bg-black/20 border-primary/10 overflow-hidden">
              <CardContent className="p-8">
                <div className="prose prose-lg prose-invert max-w-none">
                  <div
                    dangerouslySetInnerHTML={{ __html: post.content || "" }}
                  />
                </div>

                {/* Social Share */}
                <div className="mt-12 pt-6 border-t border-primary/10">
                  <div className="flex flex-wrap items-center justify-between">
                    <div>
                      <span className="text-white/70 mr-3">
                        Share this post:
                      </span>
                      <div className="inline-flex space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full h-8 w-8 border-primary/30 hover:bg-primary/10"
                          onClick={() =>
                            window.open(
                              `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
                              "_blank"
                            )
                          }
                        >
                          <Facebook className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full h-8 w-8 border-primary/30 hover:bg-primary/10"
                          onClick={() =>
                            window.open(
                              `https://twitter.com/intent/tweet?url=${window.location.href}&text=${post.title}`,
                              "_blank"
                            )
                          }
                        >
                          <Twitter className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full h-8 w-8 border-primary/30 hover:bg-primary/10"
                          onClick={() =>
                            window.open(
                              `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`,
                              "_blank"
                            )
                          }
                        >
                          <Linkedin className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      className="border border-primary/30 hover:bg-primary/10 mt-2"
                      asChild
                    >
                      <Link to="/posts">Back to All Posts</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="lg:w-1/3">
              <div className="sticky top-24">
                <h3 className="text-xl font-bold mb-6">Related Articles</h3>
                <div className="space-y-6">
                  {relatedPosts.map((relatedPost) => (
                    <Card
                      key={relatedPost.id}
                      className="bg-black/20 border-primary/10 overflow-hidden hover:border-primary/30 transition-all duration-300"
                    >
                      <CardContent className="p-0">
                        {relatedPost.featuredImage && (
                          <img
                            src={relatedPost.featuredImage}
                            alt={relatedPost.title}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-5">
                          <h4 className="font-bold mb-2 leading-tight">
                            <Link
                              to={`/posts/${relatedPost.slug}`}
                              className="hover:text-primary transition-colors hover:underline"
                            >
                              {relatedPost.title}
                            </Link>
                          </h4>
                          <div className="text-white/60 text-sm flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              {formatDistanceToNow(
                                new Date(relatedPost.createdAt),
                                { addSuffix: true }
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-8">
                  <Button
                    variant="outline"
                    className="w-full border-primary/30 hover:bg-primary/10"
                    asChild
                  >
                    <Link to="/posts">View All Posts</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
