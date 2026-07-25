import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

function SearchBar({ compact = false, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const formRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (formRef.current && !formRef.current.contains(e.target) && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/shop?search=${encodeURIComponent(q)}`);
    setQuery("");
    if (onClose) onClose();
  };

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className={`flex h-10 items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-200 transition ${
        compact ? "w-full" : "w-full max-w-md flex-1"
      }`}
    >
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ACs, coolers, brands..."
        className="h-full min-w-0 flex-1 px-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
      {compact && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center text-slate-400 transition hover:text-slate-700"
          aria-label="Close search"
        >
          <X size={18} />
        </button>
      )}
      <button
        type="submit"
        className="flex h-full items-center justify-center bg-sky-600 px-4 text-white transition hover:bg-sky-500 min-w-[44px]"
        aria-label="Search"
      >
        <Search size={18} />
      </button>
    </form>
  );
}

export default SearchBar;
