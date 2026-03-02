"use client";

import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

interface SearchSuggestion {
  id: string;
  keyword: string;
  type: "recent" | "popular" | "product";
  productUrl?: string;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const POPULAR_SEARCHES = [
  "lego",
  "리틀타이거",
  "학습교구",
  "安抚",
  "爬行垫",
  "婴幼儿",
];

const RECENT_SEARCHES_KEY = "kids-space-recent-searches";

export function SearchBar({
  onSearch,
  placeholder = "상품명을 입력해주세요",
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveRecentSearch = useCallback((keyword: string) => {
    const updated = [keyword, ...recentSearches.filter((s) => s !== keyword)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  const handleSearch = useCallback((keyword: string) => {
    if (keyword.trim()) {
      saveRecentSearch(keyword);
      if (onSearch) {
        onSearch(keyword);
      } else {
        router.push(`/shop?search=${encodeURIComponent(keyword)}`);
      }
      setIsOpen(false);
      setQuery("");
    }
  }, [onSearch, router, saveRecentSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);

    if (value.length > 0) {
      const productSuggestions: SearchSuggestion[] = [];
      const typedSuggestions: SearchSuggestion[] = [];

      if (recentSearches.some((s) => s.includes(value))) {
        typedSuggestions.push(
          ...recentSearches
            .filter((s) => s.includes(value))
            .map((s) => ({ id: s, keyword: s, type: "recent" as const }))
        );
      }

      const popularMatches = POPULAR_SEARCHES.filter((s) => s.includes(value));
      typedSuggestions.push(
        ...popularMatches.map((s) => ({ id: s, keyword: s, type: "popular" as const }))
      );

      setSuggestions([...typedSuggestions, ...productSuggestions]);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const allItems = [
      ...suggestions,
      ...recentSearches
        .filter((s) => !suggestions.some((suggestion) => suggestion.keyword === s))
        .map((s) => ({ id: s, keyword: s, type: "recent" as const })),
    ];

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && allItems[activeIndex]) {
        handleSearch(allItems[activeIndex].keyword);
      } else if (query.trim()) {
        handleSearch(query);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const displayedSuggestions = [
    ...suggestions,
    ...recentSearches
      .filter((s) => !suggestions.some((suggestion) => suggestion.keyword === s))
      .slice(0, 5)
      .map((s) => ({ id: s, keyword: s, type: "recent" as const })),
  ];

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && displayedSuggestions.length > 0}
          aria-controls="search-suggestions"
          aria-activedescendant={
            activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
          }
          className="w-full pl-10 pr-10 h-10 text-sm bg-bg-secondary border border-border rounded-full focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
            aria-label="검색어 초기화"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {isOpen && displayedSuggestions.length > 0 && (
        <div
          id="search-suggestions"
          className="absolute top-full left-0 right-0 mt-1 bg-bg-primary border border-border rounded-lg shadow-lg overflow-hidden z-50"
        >
          {displayedSuggestions.map((item, index) => (
            <button
              key={`${item.type}-${item.keyword}`}
              id={`suggestion-${index}`}
              onClick={() => handleSearch(item.keyword)}
              className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                index === activeIndex
                  ? "bg-bg-secondary text-text-primary"
                  : "hover:bg-bg-tertiary text-text-primary"
              }`}
              role="option"
              aria-selected={index === activeIndex}
            >
              <svg
                className={`w-4 h-4 ${
                  item.type === "recent"
                    ? "text-text-tertiary"
                    : "text-secondary"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="flex-1">{item.keyword}</span>
              {item.type === "popular" && (
                <span className="text-xs text-secondary">인기</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;