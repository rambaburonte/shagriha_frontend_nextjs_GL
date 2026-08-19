"use client";

import { SearchBoxCore, SessionToken, type SearchBoxSuggestion } from "@mapbox/search-js-core";
import { LoaderCircle, MapPin } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SelectedLocation = {
  label: string;
  coordinates: [number, number];
};

type LocationAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: SelectedLocation) => void;
  placeholder?: string;
  className?: string;
  dismissSignal?: number;
};

const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

const suggestionLabel = (suggestion: SearchBoxSuggestion) =>
  suggestion.full_address ||
  [suggestion.name, suggestion.place_formatted].filter(Boolean).join(", ");

export default function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Search by address, city, or state",
  className,
  dismissSignal = 0,
}: LocationAutocompleteProps) {
  const search = useMemo(
    () => new SearchBoxCore({
      accessToken: token,
      country: "US",
      language: "en",
      limit: 6,
      types: new Set(["address", "street", "neighborhood", "locality", "place", "region", "postcode"]),
    }),
    []
  );
  const sessionToken = useRef(new SessionToken());
  const selectedLabel = useRef<string | null>(null);
  const suggestionsId = useId();
  const [suggestions, setSuggestions] = useState<SearchBoxSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const query = value.trim();
    if (selectedLabel.current === query) {
      selectedLabel.current = null;
      return;
    }
    if (!token || query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await search.suggest(query, {
          sessionToken: sessionToken.current,
          signal: controller.signal,
        });
        setSuggestions(response.suggestions);
        setIsOpen(response.suggestions.length > 0);
        setActiveIndex(-1);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Unable to load location suggestions:", error);
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [search, value]);

  useEffect(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, [dismissSignal]);

  const selectSuggestion = async (suggestion: SearchBoxSuggestion) => {
    setIsLoading(true);
    try {
      const response = await search.retrieve(suggestion, {
        sessionToken: sessionToken.current,
        language: "en",
      });
      const feature = response.features[0];
      if (!feature) return;

      const label = suggestionLabel(suggestion);
      const { longitude, latitude } = feature.properties.coordinates;
      selectedLabel.current = label;
      onChange(label);
      onSelect({ label, coordinates: [longitude, latitude] });
      setSuggestions([]);
      setIsOpen(false);
      sessionToken.current = new SessionToken();
    } catch (error) {
      console.error("Unable to select location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter") {
      if (activeIndex >= 0) {
        event.preventDefault();
        void selectSuggestion(suggestions[activeIndex]);
      } else {
        setIsOpen(false);
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Search location"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={suggestionsId}
        className={cn("bg-white pr-9", className)}
      />
      {isLoading && (
        <LoaderCircle className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-500" />
      )}

      {isOpen && (
        <div id={suggestionsId} role="listbox" className="absolute left-0 top-full z-50 mt-1 w-full min-w-72 overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-xl">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.mapbox_id}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => void selectSuggestion(suggestion)}
              className={cn("flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-secondary-50", index === activeIndex && "bg-secondary-50")}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary-500" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-gray-900">{suggestion.name}</span>
                <span className="block truncate text-xs text-gray-500">{suggestion.place_formatted}</span>
              </span>
            </button>
          ))}
          <div className="border-t border-gray-100 px-3 py-1.5 text-right text-[10px] text-gray-400">Powered by Mapbox</div>
        </div>
      )}
    </div>
  );
}
