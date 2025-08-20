"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/src/components/layout/main-layout";
import { PageHeader } from "@/src/components/layout/page-header";

import Link from 'next/link'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/src/components/ui/table";
import { formatDate } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Edit, Trash2, Eye, Search } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/src/components/ui/select";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/src/lib/queryClient";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useToast } from "@/src/hooks/use-toast";

export default function PostsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [deletePostId, setDeletePostId] = useState(null);
	const { toast } = useToast();

	const { data: posts, isLoading: postsLoading } = useQuery<({
		queryKey: ["/api/posts"],
	});

	const { data: categories, isLoading: categoriesLoading } = useQuery({
		queryKey: ["/api/categories"],
	});

	const deletePostMutation = useMutation({
		mutationFn: async (id) => {
			await apiRequest("DELETE", `/api/posts/${id}`);
		},
		onSuccess: () => {
			toast({
				title: "Post deleted",
				description: "The post has been deleted successfully",
			});
			queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
			queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: `Failed to delete post: ${error.message}`,
				variant: "destructive",
			});
		},
	});

	const confirmDelete = (id) => {
		setDeletePostId(id);
	};

	const handleDelete = () => {
		if (deletePostId) {
			deletePostMutation.mutate(deletePostId);
			setDeletePostId(null);
		}
	};

	const cancelDelete = () => {
		setDeletePostId(null);
	};

	// Filter posts
	const filteredPosts = posts?.filter((post) => {
		const matchesSearch = post.title
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesCategory =
			categoryFilter === "all" ||
			post.category?.toString() === categoryFilter;
		const matchesStatus =
			statusFilter === "all" || post.status === statusFilter;
		return matchesSearch && matchesCategory && matchesStatus;
	});

	return (
		<MainLayout>
			<PageHeader
				title="Blog Posts"
				description="Manage your blog posts"
				actionLabel="Create Post"
				actionLink="/admin/posts/create"
			>
				<a
					href="#"
					target="_blank"
					className="text-primary hover:underline flex items-center"
					onClick={(e) => {
						e.preventDefault();
						window.open("/blog", "_blank");
					}}
				>
					<Eye className="mr-1 h-4 w-4" />
					View Blog
				</a>
			</PageHeader>

			<div className="mb-6 flex flex-col md:flex-row gap-4">
				<div className="relative flex-1">
					<Search
						className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
						size={18}
					/>
					<Input
						placeholder="Search posts..."
						className="pl-10"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<div className="flex gap-4">
					<Select value={categoryFilter} onValueChange={setCategoryFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="All Categories" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							{!categoriesLoading &&
								categories?.map((category) => (
									<SelectItem key={category._id} value={category._id.toString()}>
										{category.name}
									</SelectItem>
								))}
						</SelectContent>
					</Select>

					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="All Statuses" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							<SelectItem value="draft">Draft</SelectItem>
							<SelectItem value="published">Published</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
				{postsLoading ? (
					<div className="p-4">
						<Skeleton className="h-10 w-full mb-4" />
						<Skeleton className="h-16 w-full mb-4" />
						<Skeleton className="h-16 w-full mb-4" />
						<Skeleton className="h-16 w-full mb-4" />
						<Skeleton className="h-16 w-full" />
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[300px]">Title</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Date</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredPosts && filteredPosts.length > 0 ? (
								filteredPosts.map((post) => (
									<TableRow key={post.id}>
										<TableCell className="font-medium">{post.title}</TableCell>
										<TableCell>
											{post.category && categories ? (
												<Badge
													variant="outline"
													className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900 border-none"
												>
													{categories.find((c) => c._id === post.category)
														?.name || "Uncategorized"}
												</Badge>
											) : (
												<Badge
													variant="outline"
													className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border-none"
												>
													Uncategorized
												</Badge>
											)}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													post.status === "published" ? "default" : "secondary"
												}
												className={
													post.status === "published"
														? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900"
														: ""
												}
											>
												{post.status.charAt(0).toUpperCase() +
													post.status.slice(1)}
											</Badge>
										</TableCell>
										<TableCell>{formatDate(post.createdAt)}</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button variant="outline" size="sm" asChild>
													<Link href={`/admin/posts/edit/${post._id}`}>
														<Edit className="h-4 w-4 mr-1" />
														Edit
													</Link>
												</Button>
												<Button
													variant="outline"
													size="sm"
													className="text-red-500 hover:text-red-700"
													onClick={() => confirmDelete(post._id)}
												>
													<Trash2 className="h-4 w-4 mr-1" />
													Delete
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center h-24 text-gray-500 dark:text-gray-400"
									>
										{searchTerm ||
										categoryFilter !== "all" ||
										statusFilter !== "all" ? (
											"No posts match your search criteria"
										) : (
											<>
												No posts found.{" "}
												<Link
													href="/admin/posts/create"
													className="text-primary hover:underline"
												>
													Create your first post
												</Link>
											</>
										)}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				)}
			</div>

			<AlertDialog open={deletePostId !== null}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							post.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-red-500 hover:bg-red-600"
						>
							{deletePostMutation.isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</MainLayout>
	);
}
