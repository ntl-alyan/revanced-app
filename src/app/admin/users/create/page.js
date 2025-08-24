"use client";

import { MainLayout } from "@/src/components/layout/main-layout";
import { PageHeader } from "@/src/components/layout/page-header";
import { useAuth } from "@/src/hooks/use-auth";
import { useToast } from "@/src/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/src/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardFooter
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/src/components/ui/select";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { queryClient } from "@/src/lib/queryClient";
import { useRouter } from "next/navigation";


export default function CreateUserPage() {
  const { user: currentUser, registerMutation } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "editor",
    },
  });

  const onSubmit = (data) => {
    registerMutation.mutate(data, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["/api/users"] });
        router.push("/admin/users");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error?.message ?? "Failed to create user",
          variant: "destructive",
        });
      },
    });
  };

  if (currentUser?.role !== "admin") {
    return (
      <MainLayout>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">Access Denied</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You do not have permission to view this page. Only administrators can create users.
          </p>
          <Button asChild>
            <a href="/admin">Return to Dashboard</a>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Create User"
        description="Add a new user to the system"
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
                          <Input placeholder="John" {...field} />
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
                          <Input placeholder="Doe" {...field} />
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
                        <Input type="password" placeholder="••••••••" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => router.push("/admin/users")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
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
