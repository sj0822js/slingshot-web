"use client";

import Header from "@/components/layout/Header";
import { useRecipes } from "@/contexts/RecipeContext";
import RecipeCard from "@/components/gallery/RecipeCard";
import { Plus, Warehouse, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function GalleryPage() {
  const { savedRecipes, deleteRecipe } = useRecipes();
  const myRecipes = savedRecipes.filter((r) => !r.isOfficial);

  return (
    <div className="w-full min-h-screen bg-[#f5f9f5] flex flex-col items-center">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-5 py-10 flex flex-col">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-[#237227] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#237227]/20">
                <Warehouse className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-black text-[#237227] tracking-tight">음료 창고</h1>
            </div>
            <p className="text-[#519A66]/70 mt-1 pl-1">
              만들어진 창작 음료 <span className="font-black text-[#237227]">{myRecipes.length}종</span>
            </p>
          </div>

          <Link href="/builder">
            <button className="flex items-center gap-2 bg-[#237227] hover:bg-[#1a5c1e] text-white px-5 py-2.5 rounded-full font-bold shadow-sm transition-all">
              <Plus className="w-4 h-4" />
              새로운 음료 만들기
            </button>
          </Link>
        </div>

        {myRecipes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-white border-2 border-dashed border-[#519A66]/20 rounded-3xl">
            <div className="w-20 h-20 bg-[#237227]/10 rounded-full flex items-center justify-center mb-6">
              <Warehouse className="w-8 h-8 text-[#519A66]/50" />
            </div>
            <h3 className="text-xl font-bold text-[#237227] mb-2">창고가 비어있어요</h3>
            <p className="text-[#519A66]/60 max-w-sm">
              음료 만들기에서 나만의 첫 번째 커스텀 음료를 조합해 저장해보세요!
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {myRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="relative group"
              >
                <RecipeCard recipe={recipe} />
                {/* Delete button — always visible on mobile, hover reveal on desktop */}
                <button
                  onClick={() => {
                    if (confirm(`"${recipe.name}" 레시피를 삭제할까요?`)) {
                      deleteRecipe(recipe.id);
                    }
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="레시피 삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

      </main>
    </div>
  );
}
