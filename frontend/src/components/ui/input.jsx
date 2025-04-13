import React from "react";

export function Input({ 
  type = "text", 
  placeholder = "", 
  value, 
  onChange,
  className = "",
  disabled = false,
  icon: Icon
}) {
  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
          ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
          ${Icon ? "pl-10" : ""}
        `}
      />
    </div>
  );
}