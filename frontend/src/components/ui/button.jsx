import React from "react";

export function Button({ 
  children, 
  onClick, 
  className = "", 
  disabled = false, 
  variant = "default",
  icon: Icon,
  iconPosition = "left"
}) {
  const baseStyles = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    outline: "border border-gray-300 hover:bg-gray-100 text-gray-800",
    link: "text-blue-600 underline hover:text-blue-800",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "hover:bg-gray-100 text-gray-800",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-md px-4 py-2 flex items-center gap-2
        ${baseStyles[variant] || baseStyles.default} 
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {Icon && iconPosition === "left" && <Icon className="h-4 w-4" />}
      {children}
      {Icon && iconPosition === "right" && <Icon className="h-4 w-4" />}
    </button>
  );
}