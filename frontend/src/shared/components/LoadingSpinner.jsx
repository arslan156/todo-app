import React from "react";
import { FiLoader } from "react-icons/fi";

export default function LoadingSpinner({ className = "h-4 w-4" }) {
  return (
    <FiLoader
      aria-hidden="true"
      className={`animate-spin ${className}`}
    />
  );
}
