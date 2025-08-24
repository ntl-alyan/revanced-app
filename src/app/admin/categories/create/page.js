"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { generateSlug } from "@/src/lib/utils";
import { useRouter } from "next/navigation";

export default function CreateCategoryPage() {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  // React Hook Form with Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const watchName = watch("name");
  // auto-generate slug from name
  const autoSlug = generateSlug(watchName);

  const onSubmit = async (data) => {
    try {
      // override slug if empty
      if (!data.slug) data.slug = autoSlug;

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to create category");

      setSuccessMessage("Category created successfully!");
      setServerError("");
      router.push("/admin/categories");
    } catch (err) {
      setServerError(err.message);
      setSuccessMessage("");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Create Category</h1>

      {serverError && <p className="text-red-500 mb-2">{serverError}</p>}
      {successMessage && <p className="text-green-500 mb-2">{successMessage}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            {...register("name")}
            className="w-full border px-3 py-2 rounded text-black"
            placeholder="Category Name"
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium">Slug</label>
          <input
            type="text"
            {...register("slug")}
            className="w-full border px-3 py-2 rounded text-black"
            placeholder={autoSlug || "Auto-generated from name"}
          />
          {errors.slug && <p className="text-red-500">{errors.slug.message}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            {...register("description")}
            className="w-full border px-3 py-2 rounded text-black"
            placeholder="Optional description"
          />
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {isSubmitting ? "Creating..." : "Create Category"}
        </button>
      </form>
    </div>
  );
}
