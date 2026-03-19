"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import IngredientPanel from "@/components/builder/IngredientPanel";
import CupPreview from "@/components/builder/CupPreview";
import PricePanel from "@/components/builder/PricePanel";
import Header from "@/components/layout/Header";
import { ActiveRecipe } from "@/types/ingredient";
import { useRecipes } from "@/contexts/RecipeContext";
import { Save, Sparkles } from "lucide-react";

export default function BuilderPage() {
  const router = useRouter();
  const { saveRecipe } = useRecipes();
  const isOfficial = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("official") === "true" : false;
  const [isSaving, setIsSaving] = useState(false);
  const [recipeName, setRecipeName] = useState("");

  const [recipe, setRecipe] = useState<ActiveRecipe>({
    cupSizeMl: 355,
    base: null,
    baseVolumeMl: 40,
    liquids: [],
    subIngredients: [],
    garnishes: [],
    temperature: null,
    layerOrder: [],
  });

  const handleSave = () => {
    if (!recipe.base) {
      alert("베이스 재료를 먼저 선택해주세요.");
      return;
    }
    saveRecipe(recipeName || `${recipe.base.name} Mix`, recipe, isOfficial);
    router.push(isOfficial ? "/slingshot" : "/gallery");
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f9f5] flex flex-col">
      <Header />
      
      {/* 2-Column Responsive Workspace Layout */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        
        {isOfficial && (
          <div className="col-span-1 lg:col-span-2 bg-gradient-to-r from-[#237227] to-[#519A66] text-white p-4 rounded-2xl flex items-center justify-center gap-3 font-bold shadow-md">
            <Sparkles className="w-5 h-5 text-[#FFD786]" />
            공식 슬링샷 레시피 작성 모드 — 저장 시 슬링샷 레시피에 등록됩니다.
          </div>
        )}

        {/* Left Column: Input Panel */}
        <section className="bg-white rounded-3xl shadow-sm border border-[#519A66]/15 overflow-hidden flex flex-col h-[700px]">
          <div className="p-6 border-b border-[#519A66]/10 flex items-center justify-between bg-[#237227]">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">음료 빌더</h2>
              <p className="text-white/60 text-sm mt-1">베이스와 재료를 선택해 레시피를 완성하세요.</p>
            </div>
            
            <button 
              onClick={() => setIsSaving(true)}
              disabled={!recipe.base}
              className="flex items-center gap-2 bg-[#FFAA00] hover:bg-[#e09500] text-[#1a2e1b] px-5 py-2.5 rounded-full font-black shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              저장하기
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
             <IngredientPanel recipe={recipe} setRecipe={setRecipe} />
          </div>
        </section>

        {/* Right Column: Live Cup Preview + Price */}
        <div className="flex flex-col gap-4">
          <section className="bg-white rounded-3xl shadow-sm border border-[#519A66]/15 p-8 flex flex-col items-center justify-center flex-1 relative overflow-hidden min-h-[520px]">
            {/* Subtle grid background */}
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #237227 1px, transparent 1px), linear-gradient(to bottom, #237227 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            <h2 className="absolute top-6 left-6 text-xs font-black text-[#519A66]/50 uppercase tracking-widest z-10">Live Preview</h2>
            <CupPreview recipe={recipe} setRecipe={setRecipe} />
            
            {/* Save Overlay Modal */}
            {isSaving && (
              <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-8">
                <div className="w-full max-w-sm bg-white border border-[#519A66]/20 shadow-xl rounded-2xl p-6">
                  <h3 className="text-lg font-black text-[#237227] mb-2">레시피 저장</h3>
                  <p className="text-sm text-[#519A66]/60 mb-4">나만의 음료에 이름을 붙여주세요.</p>
                  <input 
                    type="text"
                    autoFocus
                    placeholder={`${recipe.base?.name || "My"} Mix`}
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    className="w-full border border-[#519A66]/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#519A66]/30 focus:border-[#519A66] mb-6 text-[#237227] font-bold"
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsSaving(false)}
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-[#519A66] hover:bg-[#f5f9f5] transition-colors border border-[#519A66]/20"
                    >
                      취소
                    </button>
                    <button 
                      onClick={handleSave}
                      className="flex-1 px-4 py-3 rounded-xl font-black text-white bg-[#237227] hover:bg-[#1a5c1e] shadow-md transition-colors"
                    >
                      저장 확정
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Price Panel — below the preview */}
          <PricePanel recipe={recipe} />
        </div>

      </main>
    </div>
  );
}
