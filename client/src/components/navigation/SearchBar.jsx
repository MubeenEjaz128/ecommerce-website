import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

function SearchBar({ compact = false }) {
  const [open, setOpen] = useState(!compact);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && compact) inputRef.current?.focus();
  }, [open, compact]);

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/shop?search=${encodeURIComponent(q)}`);
    setQuery("");
    if (compact) setOpen(false);
  };

  if (compact && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-slate-200 transition hover:bg-white/10"
        aria-label="Open search"
      >
        <Search size={20} />
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={`flex h-10 items-center overflow-hidden rounded-md bg-white focus-within:ring-2 focus-within:ring-sky-400 ${
        compact ? "w-44 sm:w-56" : "w-full max-w-md flex-1"
      }`}
    >
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ACs, coolers..."
        className="h-full min-w-0 flex-1 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
      {compact && (
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setQuery("");
          }}
          className="px-2 text-slate-500 hover:text-slate-800"
          aria-label="Close search"
        >
          <X size={16} />
        </button>
      )}
      <button
        type="submit"
        className="flex h-full items-center justify-center bg-sky-500 px-3 text-white transition hover:bg-sky-400"
        aria-label="Search"
      >
        <Search size={18} />
      </button>
    </form>
  );
}

export default SearchBar;
