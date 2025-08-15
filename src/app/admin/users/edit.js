import { useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";

// Define the schema for user editing
const editUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal('')),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["admin", "editor"], {
    required_error: "Please select a role",
  }),
});


export default function EditUserPage() {
  const { id } = useParams();
  // const userId = parseInt(id);
  
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: [`/api/users/${id}`],
    select: (data) => data?._doc || null, // fallback if strict types brea
    // enabled: !isNaN(_id) && currentUser?.role === "admin",
  });

  const form = useForm({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "editor",
    },
  });

  // Update form with user data once loaded
  useEffect(() => {
    if (user) {
      console.log(user)
      form.reset({
        username: user.username,
        email: user.email || "",
        password: "", // Don't populate password
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        role: user.role,
      });
    }
  }, [user, form]);

  const updateUserMutation = useMutation({
    mutationFn: async (data) => {
      // Only include password if it's not empty
      const payload = { ...data };
      if (!payload.password) {
        delete payload.password;
      }
      
      const res = await apiRequest("PUT", `/api/users/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "User has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      navigate("/admin/users");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    updateUserMutation.mutate(data);
  };

  // Verify current user is admin
  if (currentUser?.role !== "admin") {
    return (
      <MainLayout>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">Access Denied</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You do not have permission to view this page. Only administrators can edit users.
          </p>
          <Button asChild>
            <a href="/">
              Return to Dashboard
            </a>
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (error || !user) {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Error Loading User</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error ? (error).message : "User not found"}
          </p>
          <Button onClick={() => navigate("/users")}>
            Return to Users
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Edit User"
        description={`Editing: ${user.username}`}
      />

      <div className="max-w-2xl mx-auto">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="john.doe@example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Leave blank to keep current password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" type="button" onClick={() => navigate("/users")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update User"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
}
