import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "emergency" | "confirm" | "cancel";
  size?: "lg" | "xl";
  icon?: ReactNode;
}

const variants = {
  primary: "bg-blue-700 hover:bg-blue-800 text-white border-2 border-blue-700 focus:ring-blue-500",
  secondary: "bg-teal-700 hover:bg-teal-800 text-white border-2 border-teal-700 focus:ring-teal-500",
  emergency: "bg-red-600 hover:bg-red-700 text-white border-2 border-red-600 focus:ring-red-500",
  confirm: "bg-green-600 hover:bg-green-700 text-white border-2 border-green-600 focus:ring-green-500",
  cancel: "bg-gray-500 hover:bg-gray-600 text-white border-2 border-gray-500 focus:ring-gray-400",
};

const sizes = {
  lg: "min-h-[64px] px-8 py-4 text-senior-lg rounded-2xl",
  xl: "min-h-[80px] px-10 py-5 text-senior-xl rounded-2xl",
};

export function BigButton({
  children,
  variant = "primary",
  size = "lg",
  icon,
  className,
  ...props
}: BigButtonProps) {
  return (
    <button
      className={cn(
        "flex items-center justify-center gap-3 font-semibold transition-all duration-150",
        "focus:outline-none focus:ring-4 focus:ring-offset-2",
        "active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed",
        "shadow-md hover:shadow-lg w-full",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon && <span className="text-2xl" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
