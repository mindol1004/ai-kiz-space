import { useState, useRef, useEffect } from 'react';

interface DropdownMenuItem {
  label: string;
  value: string;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  onValueChange?: (value: string) => void;
  defaultOpen?: boolean;
  className?: string;
}

export default function Dropdown({
  trigger,
  items,
  onValueChange,
  defaultOpen = false,
  className = ''
}: DropdownProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < items.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
      case ' ': // Space
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < items.length) {
          handleItemClick(items[activeIndex].value, activeIndex);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
    }
  };

  const handleItemClick = (value: string, index: number) => {
    if (!items[index].disabled) {
      onValueChange?.(value);
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className="flex items-center gap-1"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
      >
        {trigger}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10"
          role="listbox"
        >
          <ul className="py-1">
            {items.map((item, index) => (
              <li key={item.value}>
                <button
                  type="button"
                  className={`
                    w-full text-left px-4 py-2 text-sm
                    ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                    ${activeIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''}
                  `}
                  role="option"
                  aria-selected={activeIndex === index}
                  disabled={item.disabled}
                  onClick={() => handleItemClick(item.value, index)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}