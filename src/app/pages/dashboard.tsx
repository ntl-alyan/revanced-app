import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { FileText, Image, Users, Tag, File, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface DashboardStats {
  totalPosts: number;
  totalCategories: number;
  totalMediaFiles: number;
  totalUsers: number;
  totalPages: number;
  recentPosts: Array<{
    id: number;
    title: string;
    status: string;
    createdAt: string;
    categoryId?: number;
  }>;
  categoryStats: Array<{
    id: number;
    name: string;
    postCount: number;
  }>;
}

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        description={`Welcome${user?.firstName ? ` ${user.firstName}` : ''} to your admin panel`}
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
              <Link href="/admin/posts" className="text-primary hover:underline text-sm">
                View All
              </Link>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
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
                  ) : stats?.recentPosts && stats.recentPosts.length > 0 ? (
                    stats.recentPosts.map((post) => (
                      <tr key={post.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{post.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700 dark:text-gray-300">{user?.username || "Admin"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {post.categoryId ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {stats.categoryStats.find(cat => cat.id === post.categoryId)?.name || "Uncategorized"}
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
                            <Link href={`/admin/posts/edit/${post.id}`} className="text-primary hover:text-primary-dark">Edit</Link>
                            <Link href={`/admin/posts`} className="text-red-600 hover:text-red-900">Delete</Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No posts found. <Link href="/admin/posts/create" className="text-primary hover:underline">Create your first post</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div>
          <Card className="mb-6">
            <CardHeader className="border-b px-5 py-4">
              <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {isLoading ? (
                <>
                  <Skeleton className="h-6 w-36 mb-2" />
                  <div className="space-y-4 mb-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-2.5 w-full mb-2" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Post Categories</h3>
                    <div className="space-y-2">
                      {stats?.categoryStats && stats.categoryStats.length > 0 ? (
                        stats.categoryStats.map((category) => (
                          <div key={category.id}>
                            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-1">
                              <span>{category.name}</span>
                              <span>{category.postCount} posts</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${
                                    stats.totalPosts > 0 
                                      ? Math.round((category.postCount / stats.totalPosts) * 100) 
                                      : 0
                                  }%`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          No categories found. <Link href="/admin/categories/create" className="text-primary hover:underline">Create a category</Link>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content Overview</h3>
                    <div className="flex items-center mb-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: '35%' }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">35%</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stats?.totalPosts || 0} posts, {stats?.totalPages || 0} pages, {stats?.totalMediaFiles || 0} media files
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="border-b px-5 py-4">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {isLoading ? (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <li key={index} className="mb-6">
                        <div className="relative pb-8">
                          {index < 2 && <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>}
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <Skeleton className="h-10 w-10 rounded-full" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Skeleton className="h-5 w-4/5 mb-1" />
                              <Skeleton className="h-4 w-1/3" />
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flow-root">
                  <ul className="-mb-8">
                    <li className="mb-6">
                      <div className="relative pb-8">
                        <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              <span className="font-medium text-gray-900 dark:text-white">{user?.username || "Admin"}</span> {stats?.recentPosts && stats.recentPosts.length > 0 ? (
                                <>created a new post <Link href={`/admin/posts/edit/${stats.recentPosts[0].id}`} className="font-medium text-primary">{stats.recentPosts[0].title}</Link></>
                              ) : (
                                "logged in to the system"
                              )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Today</p>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className="mb-6">
                      <div className="relative pb-8">
                        <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                              <Image className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              <span className="font-medium text-gray-900 dark:text-white">System</span> updated the media library
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Yesterday</p>
                          </div>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="relative pb-8">
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                              <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              <span className="font-medium text-gray-900 dark:text-white">System</span> initialized the admin panel
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Initial setup</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              )}
              <div className="mt-1">
                <Link href="/admin/posts" className="text-sm text-primary hover:underline">View all activity</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
