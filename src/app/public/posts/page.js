"use client"
import React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import PublicLayout from "@/src/components/layout/public-layout";
import Head from 'next/head'
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function BlogPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const response = await fetch("/api/posts?status=published");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    },
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

  const getCategoryName = (categoryId) => {
    if (!categoryId || !categories) return "Uncategorized";
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  return (
    <PublicLayout>
      <Head>
        <title>Blog - ReVanced</title>
        <meta
          name="description"
          content="Stay updated with the latest news, tutorials, and updates about ReVanced and enhanced Android applications"
        />
        <meta
          name="keywords"
          content="revanced, blog, android, mods, tutorials"
        />
      </Head>

      {/* Blog Header */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-primary/10 via-background to-background">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent"></div>
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl opacity-20"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl opacity-20"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
            ReVanced Blog
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Stay updated with the latest news, tutorials, and insights about
            ReVanced and enhanced Android applications
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {categories && categories.length > 0 && (
              <>
                <Link href="/public/posts" passHref>
                  <Button
                    variant="ghost"
                    className="border border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                  >
                    All Posts
                  </Button>
                </Link>

                {categories.map((category) => (
                  <Link 
                    key={category.id} 
                    href={`/public/posts/category/${category.slug}`}
                    passHref
                  >
                    <Button
                      variant="ghost"
                      className="border border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                    >
                      {category.name}
                    </Button>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col h-full bg-black/20 border border-primary/10 rounded-xl overflow-hidden"
              >
                <Skeleton className="w-full h-48" />
                <div className="p-6">
                  <Skeleton className="h-7 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-6" />
                  <div className="flex justify-between mt-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col h-full bg-black/20 border border-primary/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group"
              >
                {post.featuredImage ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <Badge className="absolute top-3 left-3 bg-primary/90 hover:bg-primary text-white">
                      {getCategoryName(post.categoryId)}
                    </Badge>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 h-48 flex items-center justify-center">
                    <Badge className="absolute top-3 left-3 bg-primary/90 hover:bg-primary text-white">
                      {getCategoryName(post.categoryId)}
                    </Badge>
                  </div>
                )}

                <div className="p-6 flex-grow flex flex-col">
                  <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    <Link
                      href={`/public/posts/${post.slug}`}
                      className="hover:underline"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-white/70 mb-4 line-clamp-3 flex-grow">
                    {post.excerpt ||
                      (post.content &&
                        post.content
                          .replace(/<[^>]*>?/gm, "")
                          .substring(0, 150) + "...")}
                  </p>

                  <div className="mt-auto">
                    <Separator className="my-4 bg-primary/10" />

                    <div className="flex items-center justify-between text-sm text-white/60">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto text-primary hover:text-primary hover:bg-transparent"
                        asChild
                      >
                        <Link href={`/public/posts/${post.slug}`}>
                          Read more <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold mb-4">No posts found</h3>
            <p className="text-white/70 mb-8">
              Check back later for updates and new content.
            </p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}