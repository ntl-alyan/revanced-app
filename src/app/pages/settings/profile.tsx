import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { MainLayout } from "@/components/layout/main-layout";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import md5 from "md5";

// Form schema for user profile
const profileFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().optional().refine(val => !val || val.length >= 6, {
    message: "Password must be at least 6 characters long if provided"
  }),
  confirmPassword: z.string().optional()
}).refine(data => {
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [gravatarUrl, setGravatarUrl] = useState<string>("");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        password: "",
        confirmPassword: ""
      });
      
      // Update Gravatar URL when email changes
      if (user.email) {
        const emailHash = md5(user.email.trim().toLowerCase());
        setGravatarUrl(`https://www.gravatar.com/avatar/${emailHash}?d=mp&s=200`);
      }
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // Remove confirm password before sending to API
      const { confirmPassword, ...updateData } = data;
      
      // Only include password if provided
      if (!updateData.password) {
        delete updateData.password;
      }
      
      const response = await apiRequest("PUT", `/api/users/${user?.id}`, updateData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating profile",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  // Update Gravatar URL when email changes in form
  const watchEmail = form.watch("email");
  useEffect(() => {
    if (watchEmail) {
      const emailHash = md5(watchEmail.trim().toLowerCase());
      setGravatarUrl(`https://www.gravatar.com/avatar/${emailHash}?d=mp&s=200`);
    }
  }, [watchEmail]);

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <Helmet>
        <title>Profile Settings - ReVanced Admin Panel</title>
      </Helmet>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Update your personal information and password
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={gravatarUrl} alt={user.username} />
                <AvatarFallback className="text-2xl bg-primary text-white">
                  {user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}
                  {user.lastName?.charAt(0) || ""}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-medium">{user.username}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : "No name set"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Role: {user.role}</p>
              
              <div className="mt-4">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-2">
                  Profile picture is provided by Gravatar based on your email address
                </p>
                <Button asChild variant="outline" size="sm">
                  <a 
                    href="https://gravatar.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs"
                  >
                    Update on Gravatar
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your first name" />
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
                          <Input {...field} placeholder="Your last name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Your email address" />
                      </FormControl>
                      <FormDescription>
                        Your email is used for Gravatar and notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-md font-medium mb-4">Change Password</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" placeholder="Leave blank to keep current" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" placeholder="Confirm new password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}