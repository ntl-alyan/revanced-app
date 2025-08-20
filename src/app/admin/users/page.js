"use client";
import { useState, useMemo } from "react";
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
import { Edit, Trash2, UserPlus, Search } from "lucide-react";
import { Input } from "@/src/components/ui/input";
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
import { useAuth } from "@/src/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { getInitials } from "@/src/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/src/components/ui/select";


export default function UsersPage() {
	const { user: currentUser } = useAuth();
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [deleteUserId, setDeleteUserId] = useState(null);
	const { toast } = useToast();

	// Redirect if not admin in MainLayout
	const { data: users, isLoading } = useQuery({
		queryKey: ["/api/users"],
		enabled: currentUser?.role==="admin",
		queryFn: async () => {
			const res = await fetch("/api/users");
			if (!res.ok) throw new Error("Failed to fetch users");
			const raw = await res.json();
			
			const data2= raw.map((user) => user._doc);
			return data2;
		},
	});
	
	const filteredUsers = useMemo(() => {
		if (!users) return [];
	
		return users.filter((user) => {
			const matchesSearch =
				user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(user.email &&
					user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(user.firstName &&
					user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(user.lastName &&
					user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
			const matchesRole = roleFilter === "all" || user.role === roleFilter;
			return matchesSearch && matchesRole;
		});
	}, [users, searchTerm, roleFilter]);
	
	const deleteUserMutation = useMutation({
		mutationFn: async (id) => {
			await apiRequest("DELETE", `/api/users/${id}`);
		},
		onSuccess: () => {
			toast({
				title: "User deleted",
				description: "The user has been deleted successfully",
			});
			queryClient.invalidateQueries({ queryKey: ["/api/users"] });
			queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: `Failed to delete user: ${error.message}`,
				variant: "destructive",
			});
		},
	});

	const confirmDelete = (id) => {
		// Prevent deleting yourself
		if (id === currentUser?._id) {
			toast({
				title: "Cannot delete yourself",
				description: "You cannot delete your own account",
				variant: "destructive",
			});
			return;
		}
		setDeleteUserId(id);
	};

	const handleDelete = () => {
		if (deleteUserId) {
			deleteUserMutation.mutate(deleteUserId);
			setDeleteUserId(null);
		}
	};

	const cancelDelete = () => {
		setDeleteUserId(null);
	};

	// Filter users

	// Verify current user is admin
	if (currentUser?.role !== "admin") {
		return (
			<MainLayout>
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
					<h3 className="text-lg font-medium text-red-600 mb-2">
						Access Denied
					</h3>
					<p className="text-gray-500 dark:text-gray-400 mb-6">
						You do not have permission to view this page. Only administrators
						can manage users.
					</p>
					<Button asChild>
						<Link href="/">Return to Dashboard</Link>
					</Button>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<PageHeader
				title="Users"
				description="Manage user accounts"
				actionLabel="Create User"
				actionLink="/admin/users/create"
				actionIcon={<UserPlus className="mr-2 h-4 w-4" />}
			/>

			<div className="mb-6 flex flex-col md:flex-row gap-4">
				<div className="relative flex-1">
					<Search
						className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
						size={18}
					/>
					<Input
						placeholder="Search users..."
						className="pl-10"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<div className="flex gap-4">
					<Select value={roleFilter} onValueChange={setRoleFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="All Roles" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Roles</SelectItem>
							<SelectItem value="admin">Admin</SelectItem>
							<SelectItem value="editor">Editor</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
				{isLoading ? (
					<div className="p-4">
						<Skeleton className="h-10 w-full mb-4" />
						<Skeleton className="h-16 w-full mb-4" />
						<Skeleton className="h-16 w-full mb-4" />
						<Skeleton className="h-16 w-full" />
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredUsers && filteredUsers.length > 0 ? (
								filteredUsers.map((user) => (
									<TableRow key={user.id}>
										<TableCell>
											<div className="flex items-center space-x-3">
												<Avatar>
													<AvatarFallback className="bg-primary text-white">
														{getInitials(
															user.firstName && user.lastName
																? `${user.firstName} ${user.lastName}`
																: user.username
														)}
													</AvatarFallback>
												</Avatar>
												<div>
													<div className="font-medium">{user.username}</div>
													{user.firstName && user.lastName && (
														<div className="text-sm text-gray-500 dark:text-gray-400">
															{user.firstName} {user.lastName}
														</div>
													)}
												</div>
											</div>
										</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											<Badge
												variant={
													user.role === "admin" ? "default" : "secondary"
												}
												className={
													user.role === "admin"
														? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
														: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
												}
											>
												{user.role.charAt(0).toUpperCase() + user.role.slice(1)}
											</Badge>
										</TableCell>
										<TableCell>{formatDate(user.createdAt)}</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button variant="outline" size="sm" asChild>
													<Link href={`/admin/users/edit/${user._id}`}>
														<Edit className="h-4 w-4 mr-1" />
														Edit
													</Link>
												</Button>
												{user._id !== currentUser?._id && (
													<Button
														variant="outline"
														size="sm"
														className="text-red-500 hover:text-red-700"
														onClick={() => confirmDelete(user._id)}
													>
														<Trash2 className="h-4 w-4 mr-1" />
														Delete
													</Button>
												)}
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
										{searchTerm || roleFilter !== "all" ? (
											"No users match your search criteria"
										) : (
											<>
												No users found.{" "}
												<Link
													href="/admin/users/create"
													className="text-primary hover:underline"
												>
													Create a user
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

			<AlertDialog open={deleteUserId !== null}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							user account and all associated data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-red-500 hover:bg-red-600"
						>
							{deleteUserMutation.isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</MainLayout>
	);
}
