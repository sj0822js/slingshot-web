"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Coffee, ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/contexts/AdminContext";
import { usePageTracker } from "@/hooks/usePageTracker";

export default function Header() {
  const { language, toggleLanguage, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { appName, logoUrl } = useAdmin();
  usePageTracker();

  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-[#519A66]/20 px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {!isHome && (
          <button 
            onClick={() => router.back()}
            className="p-1.5 -ml-1.5 hover:bg-[#519A66]/10 rounded-full transition-colors"
            aria-label="Go Back"
          >
            <ChevronLeft className="w-6 h-6 text-[#237227]" />
          </button>
        )}
        
        <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors overflow-hidden flex items-center justify-center shrink-0">
            {logoUrl ? <img src={logoUrl} alt="Logo" className="w-5 h-5 object-contain" /> : <Coffee className="w-5 h-5 text-primary" />}
          </div>
          <span className="font-bold tracking-tight text-lg truncate max-w-[200px]">{appName || t("appTitle")}</span>
        </Link>
      </div>

      <button
        onClick={toggleLanguage}
        className="relative flex items-center bg-[#237227]/10 border border-[#519A66]/30 rounded-full p-1 w-16 h-8 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
        aria-label="Toggle Language"
      >
        <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-bold text-stone-400 pointer-events-none">
          <span>KR</span>
          <span>EN</span>
        </div>
        
        <motion.div
          layout
          className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center relative z-10"
          animate={{
            x: language === "ko" ? 0 : 32,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          <span className="text-[10px] font-black text-primary">
            {language === "ko" ? "KR" : "EN"}
          </span>
        </motion.div>
      </button>
    </header>
  );
}
