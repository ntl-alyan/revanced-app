import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const registerSchema = insertUserSchema
  .pick({
    username: true,
    password: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
  })
  .extend({
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

export const AuthContext = (createContext < AuthContextType) | (null > null);

export function AuthProvider({ children }) {
  const { toast } = useToast();

  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = (useQuery < User) |
  (null >
    {
      queryKey: ["/api/user"],
      queryFn: getQueryFn({ on401: "returnNull" }),
      select: (data) => data?._doc || null, // fallback if strict types break
    });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName || user.username}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (user) => {
      toast({
        title: "User created successfully",
        description: `User ${user.username} has been created.`,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
