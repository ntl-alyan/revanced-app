"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/src/components/layout/main-layout";
import { PageHeader } from "@/src/components/layout/page-header";
import { StatCard } from "@/src/components/layout/stat-card";
import { FileText, Image, Users, Tag, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { formatDate } from "@/src/lib/utils";
import { useAuth } from "@/src/hooks/use-auth";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: stats, error, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
  });

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        description={`Welcome${user?.firstName ? ` ${user.firstName}` : ""} to your admin panel`}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="h-32">
              <CardContent className="p-5">
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Total Posts"
              value={stats?.totalPosts ?? 0}
              icon={<FileText className="h-6 w-6 text-primary" />}
              trend={{
                value: "8%",
                isPositive: true,
                text: "from last month",
              }}
              bgColor="bg-blue-100 dark:bg-blue-900"
            />
            <StatCard
              title="Media Files"
              value={stats?.totalMediaFiles ?? 0}
              icon={<Image className="h-6 w-6 text-green-600 dark:text-green-400" />}
              trend={{
                value: "7%",
                isPositive: true,
                text: "from last month",
              }}
              bgColor="bg-green-100 dark:bg-green-900"
            />
            <StatCard
              title="Users"
              value={stats?.totalUsers ?? 0}
              icon={<Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />}
              trend={{
                value: "2%",
                isPositive: true,
                text: "from last month",
              }}
              bgColor="bg-yellow-100 dark:bg-yellow-900"
            />
            <StatCard
              title="Categories"
              value={stats?.totalCategories ?? 0}
              icon={<Tag className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
              trend={{
                value: "12%",
                isPositive: true,
                text: "from last month",
              }}
              bgColor="bg-purple-100 dark:bg-purple-900"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
              <CardTitle className="text-lg font-semibold">Recent Posts</CardTitle>
              <button
                onClick={() => router.push("/admin/posts")}
                className="text-primary hover:underline text-sm"
              >
                View All
              </button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-5 w-48" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-5 w-24" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-5 w-20" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-5 w-32" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <Skeleton className="h-5 w-10" />
                            <Skeleton className="h-5 w-10" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : stats?.recentPosts?.length > 0 ? (
                    stats.recentPosts.map((post) => (
                      <tr key={post.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {post.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {user?.username || "Admin"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {post.categoryId ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {stats?.categoryStats?.find((cat) => cat.id === post.categoryId)?.name || "Uncategorized"}
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                              Uncategorized
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(post.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2 justify-end">
                            <button
                              onClick={() => router.push(`/admin/posts/edit/${post.id}`)}
                              className="text-primary hover:text-primary-dark"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => router.push(`/admin/posts`)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No posts found.{" "}
                        <button
                          onClick={() => router.push("/admin/posts/create")}
                          className="text-primary hover:underline"
                        >
                          Create your first post
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Stats & Recent Activity stay the same — just swap Link → router.push() buttons where needed */}
      </div>
    </MainLayout>
  );
}
