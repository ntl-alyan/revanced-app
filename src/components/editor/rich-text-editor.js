"use client";

import React, { useRef } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/src/lib/utils";

// Dynamically import ReactQuill (disable SSR)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  className,
}) {
  const quillRef = useRef(null);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ color: [] }, { background: [] }],
      ["link", "image", "video", "code-block"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "script",
    "direction",
    "color",
    "background",
    "link",
    "image",
    "video",
    "code-block",
  ];

  return (
    <div
      className={cn(
        "border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden",
        className
      )}
    >
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />
    </div>
  );
}
