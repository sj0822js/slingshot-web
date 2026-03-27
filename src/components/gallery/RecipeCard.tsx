"use client";

import { SavedRecipe } from "@/contexts/RecipeContext";
import CupPreview from "@/components/builder/CupPreview";
import { Clock } from "lucide-react";

interface RecipeCardProps {
  recipe: SavedRecipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const totalVolume = recipe.baseVolumeMl + recipe.liquids.reduce((acc, l) => acc + l.volumeMl, 0);
  const detailSections = [
    recipe.base ? { label: "Base", items: [`${recipe.base.name} ${recipe.baseVolumeMl}ml`] } : null,
    recipe.liquids.length > 0
      ? { label: "Liquids", items: recipe.liquids.map((liquidItem) => `${liquidItem.liquid.name} ${liquidItem.volumeMl}ml`) }
      : null,
    recipe.subIngredients.length > 0
      ? { label: "Extras", items: recipe.subIngredients.map((subIngredient) => `${subIngredient.item.name} ${subIngredient.amountGs}g`) }
      : null,
    recipe.garnishes.length > 0
      ? { label: "Garnish", items: recipe.garnishes.map((garnish) => `${garnish.item.name} ${garnish.amountGs}g`) }
      : null,
  ].filter(Boolean) as { label: string; items: string[] }[];

  return (
    <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
      {/* Thumbnail Area - We reuse the CupPreview but scale it down to fit a card */}
      <div className="h-64 bg-stone-50 relative flex items-center justify-center overflow-hidden border-b border-stone-100">
        
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

        {/* 
          Apply scale via CSS Transform to shrink the 500px interactive SVG canvas 
          into a thumbnail size without needing to rebuild components!
        */}
        <div className="transform scale-[0.55] origin-center -translate-y-8 flex items-center justify-center w-[400px] h-[400px]">
          <CupPreview recipe={recipe} />
        </div>

        {/* Overlay total volume badge */}
        <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-stone-600 tracking-wider shadow-sm border border-stone-200/50">
          {Math.round(totalVolume)} ml
        </div>
      </div>

      {/* Info Area */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-black text-lg text-stone-800 mb-1 group-hover:text-primary transition-colors">
          {recipe.name}
        </h3>
        
        <div className="flex items-center gap-1.5 text-xs text-stone-400 font-mono mb-4">
          <Clock className="w-3.5 h-3.5" />
          {new Date(recipe.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>

        <div className="space-y-3 mb-4">
          {recipe.notes.trim().length > 0 && (
            <div className="rounded-2xl bg-[#eef6ee] border border-[#519A66]/15 px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#519A66]/70 mb-2">Notes</p>
              <p className="text-xs font-medium text-[#2f4f32] leading-relaxed whitespace-pre-line">
                {recipe.notes}
              </p>
            </div>
          )}
          {detailSections.map((section) => (
            <div key={section.label} className="rounded-2xl bg-stone-50 border border-stone-100 px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-400 mb-2">{section.label}</p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <p key={item} className="text-xs font-semibold text-stone-600 leading-relaxed">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Ingredient Tags */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {recipe.base && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-600 rounded-lg text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: recipe.base.colorHex }} />
              {recipe.base.name}
            </span>
          )}
          {recipe.temperature && (
             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
               recipe.temperature.level > 0 
               ? "bg-red-50 text-red-500 border border-red-100" 
               : "bg-blue-50 text-blue-500 border border-blue-100"
             }`}>
              {recipe.temperature.name}
            </span>
          )}
          {recipe.liquids.map((l) => (
             <span key={l.liquid.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-600 rounded-lg text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full border border-stone-300" style={{ backgroundColor: l.liquid.colorHex }} />
              {l.liquid.name}
            </span>
          ))}
          {recipe.subIngredients?.map((s) => (
             <span key={s.item.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-[11px] font-bold">
              + {s.item.name}
            </span>
          ))}
          {recipe.garnishes?.map((g) => (
             <span key={g.item.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-800 text-white rounded-lg text-[11px] font-bold">
              + {g.item.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
