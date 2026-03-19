"use client";

import Header from "@/components/layout/Header";
import { useIngredients } from "@/contexts/IngredientContext";
import { DrinkBase } from "@/types/ingredient";
import { Settings2, Droplet, ThermometerSun, Timer } from "lucide-react";
import { motion } from "framer-motion";

export default function EspressoSettingsPage() {
  const { ingredients } = useIngredients();

  // Only display Bases for the Espresso Settings view
  const bases = ingredients.filter((i) => i.category === "base") as DrinkBase[];

  return (
    <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center">
      <Header />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-5 py-10 flex flex-col">
        <header className="mb-10 text-center relative flex flex-col items-center">
          <div className="w-16 h-16 bg-stone-800 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-stone-800/20">
            <Settings2 className="w-8 h-8" />
          </div>
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-black text-stone-800 tracking-tight">에스프레소</h1>
          </div>
          <p className="text-stone-500 mt-2">베이스 원산지와 추출(Extraction) 세부 매뉴얼 정보입니다.</p>
        </header>

        <div className="space-y-6">
          {bases.map((base, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={base.id}
              className="bg-white border border-stone-200 shadow-sm rounded-3xl p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:shadow-md transition-shadow"
            >
              {/* Header Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: base.colorHex }} />
                  <h3 className="font-black text-xl text-stone-800">{base.name}</h3>
                </div>
                <div className="pl-7">
                  <p className="w-full text-sm text-stone-500 font-medium py-1">
                    {base.origin || "Origin not specified"}
                  </p>
                </div>
              </div>

              {/* Advanced Extraction Metrics - Editable */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 w-full md:w-auto p-4 md:p-0 bg-stone-50 md:bg-transparent rounded-2xl">
                
                <div className="flex flex-col items-start md:items-end">
                  <div className="flex items-center gap-1.5 text-stone-400 mb-1 text-xs font-bold uppercase tracking-wider">
                    <Droplet className="w-3.5 h-3.5" />
                    도징량 
                  </div>
                  <div className="flex items-center font-black text-lg text-stone-700">
                    <span className="text-right">{base.dosingGrams || '-'}</span>
                    <span className="ml-1">g</span>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end">
                  <div className="flex items-center gap-1.5 text-stone-400 mb-1 text-xs font-bold uppercase tracking-wider">
                    <Droplet className="w-3.5 h-3.5 text-orange-500" />
                    추출량 
                  </div>
                  <div className="flex items-center font-black text-lg text-orange-600">
                    <span className="text-right">{base.extractionGrams || '-'}</span>
                    <span className="ml-1">g</span>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end">
                  <div className="flex items-center gap-1.5 text-stone-400 mb-1 text-xs font-bold uppercase tracking-wider">
                    <Timer className="w-3.5 h-3.5" />
                    시간 
                  </div>
                  <div className="flex items-center font-black text-lg text-stone-700">
                    <span className="text-right">{base.extractionSeconds || '-'}</span>
                    <span className="ml-1">s</span>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end">
                  <div className="flex items-center gap-1.5 text-stone-400 mb-1 text-xs font-bold uppercase tracking-wider">
                    <ThermometerSun className="w-3.5 h-3.5 text-red-400" />
                    온도 
                  </div>
                  <div className="flex items-center font-black text-lg text-red-500">
                    <span className="text-right">{base.extractionTemp || '-'}</span>
                    <span className="ml-1">°C</span>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </main>
    </div>
  );
}
