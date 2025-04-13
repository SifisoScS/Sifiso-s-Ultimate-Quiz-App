import React from "react";

export function Progress({ 
  value = 0, 
  className = "",
  color = "blue",
  showLabel = false
}) {
  const colors = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    red: "bg-red-600",
    yellow: "bg-yellow-400",
    indigo: "bg-indigo-600",
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm font-medium">{value}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${colors[color] || colors.blue} h-2.5 rounded-full transition-all duration-300`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}