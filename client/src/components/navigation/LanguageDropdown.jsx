import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "zh-CN", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
];

export default function LanguageDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lang) => {
    setSelectedLang(lang);
    setIsOpen(false);
    
    // Trigger Google Translate hidden select
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = lang.code;
      select.dispatchEvent(new Event("change"));
    }
  };

  return (
    <div className="relative notranslate" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 hover:text-sky-600"
      >
        <span className="text-lg leading-none">{selectedLang.flag}</span>
        <span className="text-sm font-medium">{selectedLang.name}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                  selectedLang.code === lang.code 
                    ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-bold" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
