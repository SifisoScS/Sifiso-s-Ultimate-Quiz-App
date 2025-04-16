import React, { useState, useEffect, useRef } from "react";

export function Select({ children, className = "", value, onValueChange, searchable = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredChildren = React.Children.map(children, child => {
    if (child.type === SelectContent) {
      return React.cloneElement(child, {
        children: React.Children.map(child.props.children, item => {
          if (item.type === SelectItem && searchable && searchTerm) {
            const itemText = item.props.children.toLowerCase();
            return itemText.includes(searchTerm.toLowerCase()) ? item : null;
          }
          return item;
        })
      });
    }
    return child;
  });

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {React.Children.map(filteredChildren, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            isOpen,
            hasValue: !!value
          });
        }
        if (child.type === SelectContent && isOpen) {
          return React.cloneElement(child, {
            onClose: () => setIsOpen(false),
            onValueChange,
            searchable,
            searchTerm,
            onSearchChange: (e) => setSearchTerm(e.target.value)
          });
        }
        return null;
      })}
    </div>
  );
}

export function SelectTrigger({ children, className = "", isOpen, onClick, hasValue }) {
  return (
    <div
      className={`w-full px-3 py-2 border rounded-lg bg-white flex items-center justify-between cursor-pointer transition-all ${
        hasValue ? "border-blue-500" : "border-gray-300 hover:border-gray-400"
      } ${className}`}
      onClick={onClick}
    >
      {children}
      <svg
        className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""} ${
          hasValue ? "text-blue-500" : "text-gray-400"
        }`}
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
  return (
    <span className={`truncate ${value ? "text-gray-800" : "text-gray-500"}`}>
      {value || placeholder}
    </span>
  );
}

export function SelectContent({
  children,
  className = "",
  onClose,
  onValueChange,
  searchable,
  searchTerm,
  onSearchChange
}) {
  return (
    <div
      className={`absolute z-20 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 py-1 max-h-60 overflow-auto ${className}`}
    >
      {searchable && (
        <div className="sticky top-0 bg-white p-2 border-b">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-2 py-1 border rounded text-sm"
            value={searchTerm}
            onChange={onSearchChange}
            autoFocus
          />
        </div>
      )}
      {React.Children.count(children) > 0 ? (
        React.Children.map(children, child => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, {
              onSelect: (val) => {
                onClose();
                if (onValueChange) onValueChange(val);
              }
            });
          }
          return child;
        })
      ) : (
        <div className="px-3 py-2 text-gray-500 text-sm">No options found</div>
      )}
    </div>
  );
}

export function SelectItem({ value, children, onSelect, className = "" }) {
  return (
    <div
      className={`px-3 py-2 cursor-pointer hover:bg-blue-50 flex items-center ${className}`}
      onClick={() => {
        if (onSelect) onSelect(value);
      }}
    >
      {children}
    </div>
  );
}