"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Check, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AutocompleteOption {
  name: string;
  aliases?: string[];
  category?: string;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  singleSelect?: boolean;
  maxSuggestions?: number;
  id?: string;
  /** Show popular items when input is empty and focused. Default: true for singleSelect, false for multiSelect. */
  showPopularOnFocus?: boolean;
}

/**
 * Google-style autocomplete with keyboard navigation.
 * - singleSelect: shows selected value in input, popular items on focus
 * - multiSelect: shows chips, results only when typing
 */
export function Autocomplete({
  options,
  value,
  onChange,
  placeholder = "Type to search…",
  singleSelect = false,
  maxSuggestions = 15,
  id,
  showPopularOnFocus,
}: AutocompleteProps) {
  // Default: show popular on focus for singleSelect (foods), not for multiSelect (conditions)
  const showPopular = showPopularOnFocus ?? singleSelect;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const selectedSet = useMemo(() => new Set(value), [value]);

  // Popular items shown when no query typed (first 15)
  const popular = useMemo(() => options.slice(0, maxSuggestions), [options, maxSuggestions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Show popular items when focused but no query typed (only if enabled)
      return showPopular ? popular : [];
    }
    const scored: Array<{ opt: AutocompleteOption; score: number }> = [];
    for (const opt of options) {
      const name = opt.name.toLowerCase();
      // Exact match
      if (name === q) {
        scored.push({ opt, score: 0 });
        continue;
      }
      // Starts with query
      if (name.startsWith(q)) {
        scored.push({ opt, score: 1 });
        continue;
      }
      // Check aliases
      const aliasHit = opt.aliases?.some((a) => {
        const al = a.toLowerCase();
        return al === q || al.startsWith(q) || al.includes(q);
      });
      // Contains query
      if (name.includes(q)) {
        scored.push({ opt, score: aliasHit ? 1.5 : 2 });
      } else if (aliasHit) {
        scored.push({ opt, score: 2.5 });
      }
      // Match individual words (e.g. "chicken" matches "Butter Chicken")
      else {
        const words = name.split(/\s+/);
        const wordMatch = words.some((w) => w.startsWith(q));
        if (wordMatch) {
          scored.push({ opt, score: 3 });
        }
      }
    }
    scored.sort((a, b) => a.score - b.score || a.opt.name.localeCompare(b.opt.name));
    return scored.slice(0, maxSuggestions).map((s) => s.opt);
  }, [query, options, maxSuggestions, popular]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  // Close when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLLIElement>(`[data-idx="${highlight}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, filtered.length]);

  const select = useCallback(
    (name: string) => {
      if (singleSelect) {
        onChange([name]);
        setQuery(name); // Show selected name in input
        setOpen(false);
        inputRef.current?.blur();
      } else {
        const next = selectedSet.has(name)
          ? value.filter((v) => v !== name)
          : [...value, name];
        onChange(next);
        setQuery("");
        inputRef.current?.focus();
      }
    },
    [singleSelect, onChange, selectedSet, value]
  );

  const remove = (name: string) => {
    onChange(value.filter((v) => v !== name));
  };

  const clearSingle = () => {
    onChange([]);
    setQuery("");
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      if (open && filtered[highlight]) {
        e.preventDefault();
        select(filtered[highlight].name);
      } else if (query.trim() && singleSelect) {
        // Allow custom entry
        e.preventDefault();
        select(query.trim());
      } else if (query.trim() && !singleSelect) {
        e.preventDefault();
        select(query.trim());
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      if (singleSelect && value[0]) {
        setQuery(value[0]); // Restore selected value
      }
    } else if (e.key === "Backspace" && !query && value.length && !singleSelect) {
      onChange(value.slice(0, -1));
    }
  };

  const handleFocus = () => {
    setOpen(true);
    // In single select, select all text so user can type to replace
    if (singleSelect && value[0]) {
      inputRef.current?.select();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  // Sync query with value for single select
  useEffect(() => {
    if (singleSelect && value[0] && !open) {
      setQuery(value[0]);
    }
  }, [value, singleSelect, open]);

  // Display value for single select
  const displayValue = singleSelect ? query : query;
  const showPlaceholder = singleSelect ? !value.length && !query : !value.length && !query;

  return (
    <div ref={containerRef} className="relative w-full" id={id}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 min-h-[44px] px-2 py-1.5 rounded-2xl bg-[var(--muted)] border border-transparent focus-within:bg-[var(--background)] focus-within:border-[var(--ring)] focus-within:shadow-[0_0_0_4px_rgba(0,113,227,0.15)] transition-all cursor-text",
          open && "bg-[var(--background)] border-[var(--ring)]"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <Search className="w-4 h-4 text-[var(--muted-foreground)] ml-1 shrink-0" />

        {/* Multi-select chips */}
        {!singleSelect &&
          value.map((v) => (
            <span key={v} className="chip chip-accent pr-1">
              {v}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(v);
                }}
                className="ml-0.5 hover:text-[var(--danger)] rounded-full"
                aria-label={`Remove ${v}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={onKeyDown}
          placeholder={showPlaceholder ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none px-1 py-1 text-[0.95rem] placeholder:text-[var(--muted-foreground)]"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id || "ac"}-listbox`}
          role="combobox"
          autoComplete="off"
        />

        {/* Clear button for single select */}
        {singleSelect && value[0] && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearSingle();
            }}
            className="p-1 rounded-full hover:bg-[var(--border)] text-[var(--muted-foreground)]"
            aria-label="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <ChevronDown className={cn("w-4 h-4 text-[var(--muted-foreground)] shrink-0 transition-transform", open && "rotate-180")} />
      </div>

      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            id={`${id || "ac"}-listbox`}
            ref={listRef}
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-1 left-0 right-0 max-h-72 overflow-auto rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl py-1"
          >
            {/* Header when showing popular */}
            {!query.trim() && showPopular && (
              <li className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-medium">
                Popular items — or type to search
              </li>
            )}
            {filtered.map((opt, i) => {
              const selected = selectedSet.has(opt.name) || (singleSelect && value[0] === opt.name);
              return (
                <li
                  key={opt.name}
                  data-idx={i}
                  role="option"
                  aria-selected={selected}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    select(opt.name);
                  }}
                  onMouseEnter={() => setHighlight(i)}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer text-sm",
                    i === highlight && "bg-[var(--muted)]",
                    selected && "text-[var(--accent)]"
                  )}
                >
                  <span className="flex flex-col">
                    <span className="font-medium">{highlightMatch(opt.name, query)}</span>
                    {opt.aliases && opt.aliases.length > 0 && (
                      <span className="text-[11px] text-[var(--muted-foreground)]">
                        aka {opt.aliases.slice(0, 3).join(", ")}
                      </span>
                    )}
                  </span>
                  {selected && <Check className="w-4 h-4 text-[var(--accent)]" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-[var(--accent)] font-semibold">
        {text.slice(idx, idx + q.length)}
      </span>
      {text.slice(idx + q.length)}
    </>
  );
}
