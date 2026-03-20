"use client";

import Header from "@/components/layout/Header";
import { useRecipes } from "@/contexts/RecipeContext";
import RecipeCard from "@/components/gallery/RecipeCard";
import { Coffee } from "lucide-react";
import { motion } from "framer-motion";

export default function SlingshotGalleryPage() {
  const { savedRecipes } = useRecipes();
  const officialRecipes = [...savedRecipes]
    .filter((recipe) => recipe.isOfficial)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center">
      <Header />
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-5 py-10 flex flex-col">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-stone-800 tracking-tight">공식 슬링샷 레시피</h1>
            <p className="text-stone-500 mt-2">본사에서 제공하는 시그니처 메뉴 ✦ 총 {officialRecipes.length}잔</p>
          </div>
        </div>

        {officialRecipes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-white border border-stone-200 border-dashed rounded-3xl">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
              <Coffee className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-xl font-bold text-stone-700 mb-2">등록된 슬링샷 레시피가 없어요</h3>
            <p className="text-stone-500 max-w-sm">
              관리자 모드에서 공식 시그니처 레시피를 만들어 등록해주세요.
            </p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {officialRecipes.map((recipe, index) => (
              <motion.div 
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RecipeCard recipe={recipe} />
              </motion.div>
            ))}
          </motion.div>
        )}
        
      </main>
    </div>
  );
}
