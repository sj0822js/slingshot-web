"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import Header from "@/components/layout/Header";
import HeroLanding from "@/components/hero/HeroLanding";
import { useLanguage } from "@/contexts/LanguageContext";
import { Settings2, Coffee, Plus, TrendingUp, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRecipes } from "@/contexts/RecipeContext";

const HERO_CACHE_KEY = "slingshot-hero-dismissed-at";
const HERO_CACHE_MS = 60 * 60 * 1000;
const HERO_CACHE_EVENT = "slingshot-hero-cache-updated";

const subscribeHeroCache = (onStoreChange: () => void) => {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(HERO_CACHE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(HERO_CACHE_EVENT, onStoreChange);
  };
};

const getHeroVisibilitySnapshot = () => {
  if (typeof window === "undefined") {
    return true;
  }

  const cachedAt = window.localStorage.getItem(HERO_CACHE_KEY);
  return cachedAt !== null && Date.now() - Number(cachedAt) < HERO_CACHE_MS;
};

export default function Home() {
  const { t } = useLanguage();
  const { savedRecipes } = useRecipes();
  const enteredMain = useSyncExternalStore(
    subscribeHeroCache,
    getHeroVisibilitySnapshot,
    () => true
  );

  const handleHeroComplete = useCallback(() => {
    localStorage.setItem(HERO_CACHE_KEY, String(Date.now()));
    window.dispatchEvent(new Event(HERO_CACHE_EVENT));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: enteredMain ? "smooth" : "auto" });
  }, [enteredMain]);

  const MENU_ITEMS = [
    {
      href: "/slingshot",
      icon: BookOpen,
      title: "슬링샷 레시피",
      desc: "슬링샷 시그니처 전용 매뉴얼",
      bg: "bg-[#237227]",
      textColor: "text-white",
      iconBg: "bg-white/20",
      iconColor: "text-[#FFD786]",
      featured: true,
    },
    {
      href: "/espresso",
      icon: Settings2,
      title: "에스프레소",
      desc: "베이스 및 재료 매뉴얼 정보",
      bg: "bg-[#1a2e1b]",
      textColor: "text-white",
      iconBg: "bg-white/10",
      iconColor: "text-[#519A66]",
    },
    {
      href: "/gallery",
      icon: Coffee,
      title: "음료 창고",
      desc: `만들어진 창작음료 ${savedRecipes.filter(r => !r.isOfficial).length}종`,
      bg: "bg-[#FFD786]/40",
      textColor: "text-[#1a2e1b]",
      iconBg: "bg-[#FFAA00]/30",
      iconColor: "text-[#FFAA00]",
    },
    {
      href: "/builder",
      icon: Plus,
      title: "음료 만들기",
      desc: "나만의 레시피 조합하기",
      bg: "bg-[#519A66]",
      textColor: "text-white",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      featured: true,
    },
    {
      href: "/trends",
      icon: TrendingUp,
      title: "트렌드 음료 알아보기",
      desc: "요즘 인기있는 커스텀 픽",
      bg: "bg-[#FFAA00]/20",
      textColor: "text-[#1a2e1b]",
      iconBg: "bg-[#FFAA00]/40",
      iconColor: "text-[#FFAA00]",
      featured: true,
    },
  ];

  return (
    <div className="w-full">
      {!enteredMain && <HeroLanding onComplete={handleHeroComplete} />}

      <div
        id="main-dashboard"
        className={`flex justify-center bg-[#237227]/8 transition-opacity duration-500 ${
          enteredMain ? "min-h-screen opacity-100" : "h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="w-full max-w-md min-h-screen bg-white shadow-2xl relative overflow-hidden flex flex-col">
          <Header />
          
          <main className="flex-1 overflow-y-auto w-full px-5 py-8 pb-24 flex flex-col items-center">
            
            {/* Welcome Section */}
            <div className="w-full text-center mb-10 pt-4 px-2">
              <h1 className="text-3xl font-black mb-3 tracking-tight text-[#237227] truncate">
                {t("appTitle")}
              </h1>
              <p className="text-[#519A66]/80 text-sm max-w-[250px] mx-auto leading-relaxed">
                {t("appDescription")}
              </p>
            </div>

            {/* Dashboard Grid */}
            <div className="w-full grid grid-cols-2 gap-4">
              {MENU_ITEMS.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className={item.featured ? "col-span-2" : ""}
                >
                  <Link
                    href={item.href}
                    className={`group relative p-6 rounded-3xl flex flex-col justify-between items-start transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm hover:shadow-md w-full block ${item.bg} ${item.featured ? 'aspect-[2.5/1]' : 'aspect-square'}`}
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-3xl pointer-events-none" />
                    
                    <div className={`p-3 rounded-2xl backdrop-blur-md ${item.iconBg} ${item.iconColor}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    
                    <div className="mt-auto pt-4">
                      <h3 className={`font-black tracking-tight mb-1 ${item.featured ? 'text-2xl' : 'text-lg'} ${item.textColor}`}>
                        {item.title}
                      </h3>
                      <p className={`text-xs font-medium opacity-80 ${item.textColor}`}>
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
