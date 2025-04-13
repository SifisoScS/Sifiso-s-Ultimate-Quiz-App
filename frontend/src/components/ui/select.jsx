import React, { useState } from "react";

export function Select({ children, className = "", value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            isOpen
          });
        }
        if (child.type === SelectContent && isOpen) {
          return React.cloneElement(child, {
            onClose: () => setIsOpen(false)
          });
        }
        return null;
      })}
    </div>
  );
}

export function SelectTrigger({ children, className = "", isOpen, onClick }) {
  return (
    <div 
      className={`
        w-full px-3 py-2 border border-gray-300 rounded-lg bg-white 
        flex items-center justify-between cursor-pointer
        hover:border-gray-400 ${className}
      `}
      onClick={onClick}
    >
      {children}
      <svg 
        className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export function SelectValue({ placeholder, value }) {
  return <span className={value ? "" : "text-gray-500"}>{value || placeholder}</span>;
}

export function SelectContent({ children, className = "", onClose }) {
  return (
    <div 
      className={`
        absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg 
        border border-gray-200 py-1 max-h-60 overflow-auto ${className}
      `}
    >
      {React.Children.map(children, child => {
        if (child.type === SelectItem) {
          return React.cloneElement(child, {
            onSelect: onClose
          });
        }
        return child;
      })}
    </div>
  );
}

export function SelectItem({ value, children, onSelect }) {
  return (
    <div 
      className="px-3 py-2 cursor-pointer hover:bg-blue-50"
      onClick={() => {
        if (onSelect) onSelect();
      }}
    >
      {children}
    </div>
  );
}