import React from "react";

export function RevancedLogo({ className = "", size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="100" rx="20" fill="#9ed5ff" />
      <path
        d="M25 32.5L45 25L75 32.5L65 70L40 75L25 60L25 32.5Z"
        fill="#0A2A42"
        stroke="#9ed5ff"
        strokeWidth="2"
      />
      <path
        d="M35 45L50 40L65 45L60 65L45 70L35 60L35 45Z"
        fill="#9ed5ff"
        stroke="#0A2A42"
        strokeWidth="1.5"
      />
      <path
        d="M30 35L40 30L55 35L50 55L37.5 58L30 50L30 35Z"
        fill="#0A2A42"
      />
    </svg>
  );
}