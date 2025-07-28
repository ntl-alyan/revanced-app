import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    try {
      // Try to parse as JSON first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        // Format the error message based on the response structure
        const errorMessage = errorData.message || JSON.stringify(errorData);
        throw new Error(`${res.status}: ${errorMessage}`);
      } else {
        // If not JSON, get as text
        const text = await res.text();
        // If it looks like HTML, provide a more user-friendly message
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          throw new Error(`Server error (${res.status}): The server returned an HTML page instead of JSON data. This might indicate a server-side issue.`);
        }
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }
    } catch (e) {
      // If error parsing fails, throw the original error or a default one
      if (e instanceof Error) {
        throw e;
      }
      throw new Error(`${res.status}: ${res.statusText || 'Unknown error'}`);
    }
  }
}

export async function apiRequest(
  method,
  url,
  data,
) {
  try {
    // Enhanced debugging for request data
    if (data) {
      try {
        console.log(`[API Request] ${method} ${url}`, {
          data,
          serialized: JSON.stringify(data)
        });
      } catch (serializationError) {
        console.error(`[API Request] Error serializing request data:`, serializationError);
      }
    }

    // Special handling for section data in apps-related endpoints
    let processedData = data;
    const isAppEndpoint = url.includes('/api/apps');
    
    if (isAppEndpoint && data && typeof data === 'object' && 'sections' in data) {
      // Create a safe copy for manipulation
      processedData = { ...data };
      
      // Pre-process the sections data to ensure it's properly formatted
      const sections = processedData.sections;
      
      // Already an array - good to go
      if (Array.isArray(sections)) {
        // already properly formatted
      } 
      // If it's a string that looks like JSON array, parse it
      else if (typeof sections === 'string' && 
              (sections.trim().startsWith('[') && sections.trim().endsWith(']'))) {
        try {
          processedData.sections = JSON.parse(sections);
        } catch (e) {
          console.error(`[API Request] Error parsing sections string:`, e);
          // Default to empty array if parse fails
          processedData.sections = [];
        }
      }
      // Handle null/undefined/empty
      else if (sections === null || sections === undefined || sections === '') {
        processedData.sections = [];
      }
    }

    const res = await fetch(url, {
      method,
      headers: processedData ? { "Content-Type": "application/json" } : {},
      body: processedData ? JSON.stringify(processedData) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Enhanced error logging
    console.error(`[API Error] ${method} ${url}:`, error);
    
    // Ensure we always throw an Error object
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
  }
}

export const getQueryFn = ({ on401: unauthorizedBehavior }) => async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey[0], {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // Ensure we always throw an Error object
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});