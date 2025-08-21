import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    try {
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const errorData = await res.json();
        const errorMessage = errorData.message || JSON.stringify(errorData);
        throw new Error(`${res.status}: ${errorMessage}`);
      } else {
        const text = await res.text();
        if (text.includes("<!DOCTYPE") || text.includes("<html")) {
          throw new Error(
            `Server error (${res.status}): Received HTML instead of JSON`
          );
        }
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error(`${res.status}: ${res.statusText || "Unknown error"}`);
    }
  }
}

export async function apiRequest(method, url, data) {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    await throwIfResNotOk(res);
    return res.json();
  } catch (error) {
    console.error(`[API Error] ${method} ${url}:`, error);
    if (error instanceof Error) throw error;
    throw new Error(String(error));
  }
}

export const getQueryFn = () => async ({ queryKey }) => {
  const res = await fetch(queryKey[0], { credentials: "include" });
  await throwIfResNotOk(res);
  return res.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn(),
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: { retry: false },
  },
});
