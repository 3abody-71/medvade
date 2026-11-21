import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, X } from "lucide-react";
import {
  searchSiteContent,
  type SearchCategory,
  type SearchItem,
} from "../lib/globalSearch";

const CATEGORY_ORDER: SearchCategory[] = [
  "countries",
  "licensing",
  "specialties",
  "guides",
];
const CATEGORY_LABELS: Record<SearchCategory, [string, string]> = {
  countries: ["Countries & pathways", "الدول والمسارات"],
  licensing: ["Exams & licensing", "الامتحانات والترخيص"],
  specialties: ["Specialties", "التخصصات"],
  guides: ["Guides & resources", "الأدلة والموارد"],
};

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  isArabic: boolean;
}

export default function GlobalSearch({
  open,
  onClose,
  onOpen,
  isArabic,
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const text = (english: string, arabic: string) =>
    isArabic ? arabic : english;

  const results = useMemo(() => searchSiteContent(query), [query]);
  const groupedResults = useMemo(
    () =>
      CATEGORY_ORDER.map(category => ({
        category,
        items: results.filter(item => item.category === category),
      })).filter(group => group.items.length > 0),
    [results]
  );
  const flattenedResults = useMemo(
    () => groupedResults.flatMap(group => group.items),
    [groupedResults]
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const onGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) {
          inputRef.current?.focus();
        } else {
          onOpen();
        }
      }
    };
    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, [open, onOpen]);

  useEffect(() => {
    setActiveIndex(index =>
      flattenedResults.length === 0
        ? 0
        : Math.min(index, flattenedResults.length - 1)
    );
  }, [flattenedResults.length]);

  const openResult = (item: SearchItem) => {
    onClose();
    navigate(item.to);
  };

  const onDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (
      event.target === inputRef.current &&
      event.key === "ArrowDown" &&
      flattenedResults.length > 0
    ) {
      event.preventDefault();
      setActiveIndex(index => (index + 1) % flattenedResults.length);
      return;
    }
    if (
      event.target === inputRef.current &&
      event.key === "ArrowUp" &&
      flattenedResults.length > 0
    ) {
      event.preventDefault();
      setActiveIndex(
        index => (index - 1 + flattenedResults.length) % flattenedResults.length
      );
      return;
    }
    if (
      event.target === inputRef.current &&
      event.key === "Enter" &&
      flattenedResults.length > 0
    ) {
      event.preventDefault();
      openResult(flattenedResults[activeIndex] ?? flattenedResults[0]);
      return;
    }
    if (event.key === "Tab") {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'input:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/55 px-3 py-4 backdrop-blur-[2px] sm:px-6 sm:py-[8vh]"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-search-title"
        dir={isArabic ? "rtl" : "ltr"}
        onKeyDown={onDialogKeyDown}
        className="mx-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl sm:max-h-[84vh]"
      >
        <h2 id="global-search-title" className="sr-only">
          {text("Search MedVade", "البحث في ميدفايد")}
        </h2>
        <div className="flex items-center gap-3 border-b border-border px-4 sm:px-5">
          <Search
            size={20}
            aria-hidden="true"
            className="shrink-0 text-primary"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={event => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder={text(
              "Search countries, exams, or guides…",
              "ابحث عن الدول أو الامتحانات أو الأدلة…"
            )}
            aria-label={text("Search MedVade", "البحث في ميدفايد")}
            aria-autocomplete="list"
            aria-controls="global-search-results"
            aria-expanded="true"
            aria-activedescendant={
              flattenedResults.length
                ? `global-search-option-${flattenedResults[activeIndex]?.id}`
                : undefined
            }
            className="h-14 min-w-0 flex-1 border-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground focus:ring-0"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveIndex(0);
                inputRef.current?.focus();
              }}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={text("Clear search", "مسح البحث")}
              title={text("Clear", "مسح")}
            >
              <X size={17} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={text("Close search", "إغلاق البحث")}
          >
            <X size={18} />
          </button>
        </div>

        <div
          id="global-search-results"
          role="listbox"
          aria-label={text("Search results", "نتائج البحث")}
          className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4"
        >
          {!query.trim() ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {text(
                "Search local country pathways, exams, and guides.",
                "ابحث في مسارات الدول والامتحانات والأدلة المتاحة."
              )}
            </p>
          ) : groupedResults.length === 0 ? (
            <div aria-live="polite" className="px-3 py-10 text-center">
              <p className="font-bold text-foreground">
                {text("No results found", "لم يتم العثور على نتائج")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {text(
                  "Try another country, exam, or search term.",
                  "جرّب دولة أو امتحانًا أو كلمة بحث أخرى."
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedResults.map(group => (
                <div
                  key={group.category}
                  role="group"
                  aria-labelledby={`global-search-group-${group.category}`}
                >
                  <h3
                    id={`global-search-group-${group.category}`}
                    className="px-3 pb-1.5 text-xs font-extrabold uppercase tracking-wide text-muted-foreground"
                  >
                    {CATEGORY_LABELS[group.category][isArabic ? 1 : 0]}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map(item => {
                      const index = flattenedResults.findIndex(
                        result => result.id === item.id
                      );
                      const active = activeIndex === index;
                      return (
                        <button
                          key={item.id}
                          id={`global-search-option-${item.id}`}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onFocus={() => setActiveIndex(index)}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => openResult(item)}
                          className={`flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "bg-secondary" : "hover:bg-secondary/70"}`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-foreground">
                              {item.title}
                            </span>
                            <span className="mt-0.5 block line-clamp-2 text-xs leading-5 text-muted-foreground">
                              {item.description}
                            </span>
                          </span>
                          <ArrowRight
                            size={16}
                            aria-hidden="true"
                            className={`shrink-0 text-muted-foreground ${isArabic ? "rotate-180" : ""}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[11px] text-muted-foreground sm:px-5">
          <span>
            {text(
              "Use ↑ ↓ to navigate · Enter to open",
              "استخدم ↑ ↓ للتنقل · Enter للفتح"
            )}
          </span>
          <span className="hidden rounded border border-border px-1.5 py-0.5 font-semibold sm:inline">
            ESC
          </span>
        </div>
      </div>
    </div>
  );
}
