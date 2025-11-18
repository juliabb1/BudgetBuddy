"use client";
import React from "react";

interface AlertProps {
  children: React.ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}

export function Alert({
  children,
  variant = "default",
  className = "",
}: AlertProps) {
  const base = "p-4 rounded-md";
  const colors =
    variant === "destructive"
      ? "bg-red-50 border border-red-200 text-red-800"
      : "bg-gray-100 border border-gray-300";
  return <div className={`${base} ${colors} ${className}`}>{children}</div>;
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm">{children}</p>;
}
