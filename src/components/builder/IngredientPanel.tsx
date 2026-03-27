"use client";

import { useIngredients } from "@/contexts/IngredientContext";
import { DrinkBase, Liquid, SubIngredient, Garnish, IngredientCategory, Temperature, ActiveRecipe, IngredientItem } from "@/types/ingredient";
import { Plus, X, ThermometerSun, Droplet, Cloud, Sun, Leaf, Sparkles, Cherry, Flower2, CloudRain, Star } from "lucide-react";
import { useState } from "react";

interface IngredientPanelProps {
  recipe: ActiveRecipe;
  setRecipe: React.Dispatch<React.SetStateAction<ActiveRecipe>>;
}

export default function IngredientPanel({ recipe, setRecipe }: IngredientPanelProps) {
  const { ingredients, addIngredient } = useIngredients();
  
  const [isAdding, setIsAdding] = useState(false);
  const [addCategory, setAddCategory] = useState<IngredientCategory | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemColor, setNewItemColor] = useState("#A8A29E"); // default warm grey
  const [newItemIcon, setNewItemIcon] = useState("Droplet");

  const AVAILABLE_ICONS = [
    { name: "Droplet", icon: Droplet },
    { name: "Cloud", icon: Cloud },
    { name: "CloudRain", icon: CloudRain },
    { name: "Sun", icon: Sun },
    { name: "Leaf", icon: Leaf },
    { name: "Sparkles", icon: Sparkles },
    { name: "Cherry", icon: Cherry },
    { name: "Flower2", icon: Flower2 },
    { name: "Star", icon: Star },
  ];

  const bases = ingredients.filter((i) => i.category === "base") as DrinkBase[];
  const liquids = ingredients.filter((i) => i.category === "liquid") as Liquid[];
  const subIngredients = ingredients.filter((i) => i.category === "subIngredient") as SubIngredient[];
  const garnishes = ingredients.filter((i) => i.category === "garnish") as Garnish[];
  const temperatures = ingredients.filter((i) => i.category === "temperature") as Temperature[];

  // Physics & Capacity Math (Ice displaces ~1/3 of its visual volume in actual fluid capacity)
  const currentIceVol = recipe.temperature ? recipe.cupSizeMl * (recipe.temperature.level / 100) * (1 / 3) : 0;
  const liquidVol = recipe.liquids.reduce((sum, l) => sum + l.volumeMl, 0);
  const syrupVol = recipe.subIngredients.reduce((sum, s) => sum + s.amountGs, 0);
  const totalCurrentVolume = currentIceVol + recipe.baseVolumeMl + liquidVol + syrupVol;
  const remainingCapacity = Math.max(0, recipe.cupSizeMl - totalCurrentVolume);

  // Helpers
  const handleBaseSelect = (base: DrinkBase) => {
    setRecipe((prev) => ({
      ...prev,
      base,
      baseVolumeMl: base.extractionGrams || (base.dosingGrams ? base.dosingGrams * 2 : 30), // Rule of thumb liquid yield
    }));
  };

  const clearBase = () => {
    setRecipe((prev) => ({ ...prev, base: null, baseVolumeMl: 0 }));
  };

  const updateLiquidVolume = (liquid: Liquid, volume: number) => {
    setRecipe((prev) => {
      const existing = prev.liquids.find((l) => l.liquid.id === liquid.id);
      
      // If volume is 0, just remove it entirely
      if (volume <= 0) {
        return {
          ...prev,
          liquids: prev.liquids.filter((l) => l.liquid.id !== liquid.id),
        };
      }

      // If it exists, update it
      if (existing) {
        return {
          ...prev,
          liquids: prev.liquids.map((l) =>
            l.liquid.id === liquid.id ? { ...l, volumeMl: volume } : l
          ),
        };
      }

      // If missing and new volume > 0, add it
      return {
        ...prev,
        liquids: [...prev.liquids, { liquid, volumeMl: volume }],
      };
    });
  };

  const getLiquidVolume = (liquidId: string) => {
    return recipe.liquids.find((l) => l.liquid.id === liquidId)?.volumeMl || 0;
  };

  const toggleSubIngredient = (subItem: SubIngredient) => {
    setRecipe((prev) => {
      const exists = prev.subIngredients.some(i => i.item.id === subItem.id);
      if (exists) {
        return { ...prev, subIngredients: prev.subIngredients.filter(i => i.item.id !== subItem.id) };
      }
      return { ...prev, subIngredients: [...prev.subIngredients, { item: subItem, amountGs: 15 }] };
    });
  };

  const updateSubIngredientAmount = (subId: string, amount: number) => {
    setRecipe((prev) => ({
      ...prev,
      subIngredients: prev.subIngredients.map(s => s.item.id === subId ? { ...s, amountGs: amount } : s)
    }));
  };

  const toggleGarnish = (garnishItem: Garnish) => {
    setRecipe((prev) => {
      const exists = prev.garnishes.some(i => i.item.id === garnishItem.id);
      if (exists) {
        return {
          ...prev,
          garnishes: prev.garnishes.filter(i => i.item.id !== garnishItem.id),
          garnishOrder: prev.garnishOrder.filter((id) => id !== garnishItem.id),
        };
      }
      return {
        ...prev,
        garnishes: [...prev.garnishes, { item: garnishItem, amountGs: 1 }],
        garnishOrder: [...prev.garnishOrder, garnishItem.id],
      };
    });
  };

  const updateGarnishAmount = (garnishId: string, amount: number) => {
    setRecipe((prev) => ({
      ...prev,
      garnishes: prev.garnishes.map(g => g.item.id === garnishId ? { ...g, amountGs: amount } : g)
    }));
  };

  const openAddModal = (category: IngredientCategory) => {
    setAddCategory(category);
    setNewItemName("");
    setNewItemColor("#A8A29E");
    setNewItemIcon("Droplet");
    setIsAdding(true);
  };

  const handleQuickAdd = () => {
    if (!newItemName.trim() || !addCategory) return;
    
    const newId = `custom_${Date.now()}`;
    let newIngredient: IngredientItem;

    switch (addCategory) {
      case "base":
        newIngredient = {
          id: newId,
          category: "base",
          name: newItemName,
          colorHex: newItemColor,
          iconType: newItemIcon,
          dosingGrams: 20,
          extractionGrams: 40,
          extractionSeconds: 30,
          extractionTemp: 93,
        };
        break;
      case "liquid":
        newIngredient = {
          id: newId,
          category: "liquid",
          name: newItemName,
          colorHex: newItemColor,
          iconType: newItemIcon,
          defaultVolumeMl: 30,
        };
        break;
      case "temperature":
        newIngredient = {
          id: newId,
          category: "temperature",
          name: newItemName,
          colorHex: newItemColor,
          iconType: newItemIcon,
          level: 0,
          description: "",
        };
        break;
      case "subIngredient":
        newIngredient = {
          id: newId,
          category: "subIngredient",
          name: newItemName,
          colorHex: newItemColor,
          iconType: newItemIcon,
          flavorCategory: "other",
        };
        break;
      case "garnish":
        newIngredient = {
          id: newId,
          category: "garnish",
          name: newItemName,
          colorHex: newItemColor,
          iconType: newItemIcon,
        };
        break;
    }

    addIngredient(newIngredient);
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 relative">
      
      {/* 0. Cup Settings */}
      <section className="bg-stone-50 p-5 rounded-2xl border border-stone-200 shadow-inner flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest">잔 설정 & 잔여 용량</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${remainingCapacity <= 0 ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
            남은 공간: {Math.round(remainingCapacity)}ml
          </span>
        </div>
        
        <div>
          <select
            value={recipe.cupSizeMl}
            onChange={(e) => setRecipe(prev => ({ ...prev, cupSizeMl: parseInt(e.target.value) }))}
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary shadow-sm"
          >
            <option value={355}>Tall (355ml) - 가볍게 한 잔</option>
            <option value={473}>Grande (473ml) - 넉넉한 기본 컵</option>
            <option value={591}>Venti (591ml) - 대용량</option>
          </select>
        </div>
      </section>

      {/* 1. Base Selection */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest">1. 베이스 (Base)</h3>
          <button onClick={() => openAddModal("base")} className="p-1 hover:bg-stone-100 rounded-md text-stone-400 hover:text-primary transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bases.map((base) => {
            const isSelected = recipe.base?.id === base.id;
            return (
              <button
                key={base.id}
                onClick={() => isSelected ? clearBase() : handleBaseSelect(base)}
                className={`p-4 border text-left rounded-xl transition-all ${
                  isSelected 
                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" 
                  : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border border-stone-200" style={{ backgroundColor: base.colorHex }} />
                  <div>
                    <p className="font-bold text-stone-800 text-sm">{base.name}</p>
                    <p className="text-xs text-stone-400 mt-1">도징: {base.dosingGrams || '?'}g / 추출: {base.extractionGrams || '?'}g</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Temperature Selection */}
      <section>
        <div className="flex items-center justify-between mb-4 mt-8">
          <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
            <ThermometerSun className="w-4 h-4" /> 
            2. 온도설정 (Temperature)
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
           {temperatures.map((temp) => {
             const isSelected = recipe.temperature?.id === temp.id;
             const isHot = temp.level > 0;
             return (
               <button
                  key={temp.id}
                  onClick={() => setRecipe(prev => ({ ...prev, temperature: temp }))}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${
                    isSelected 
                    ? (isHot ? "bg-red-500 text-white border-red-500 shadow-md" : "bg-blue-500 text-white border-blue-500 shadow-md") 
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
               >
                 <span>{temp.name}</span>
               </button>
             )
           })}
        </div>
      </section>

      {/* 3. Liquid Volumes */}
      <section>
        <div className="flex items-center justify-between mb-4 mt-8">
          <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest">3. 액체류 (Liquids)</h3>
          <button onClick={() => openAddModal("liquid")} className="p-1 hover:bg-stone-100 rounded-md text-stone-400 hover:text-primary transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {liquids.map((liquid) => {
            const currentVolume = getLiquidVolume(liquid.id);
            return (
              <div key={liquid.id} className="p-4 bg-stone-50 rounded-xl border border-stone-100 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full border border-stone-300" style={{ backgroundColor: liquid.colorHex }} />
                    <span className="font-bold text-stone-800 text-sm">{liquid.name}</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {currentVolume}ml
                  </span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max={Math.floor(currentVolume + remainingCapacity)}
                  step="10"
                  value={currentVolume}
                  onChange={(e) => updateLiquidVolume(liquid, parseInt(e.target.value))}
                  className={`w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer focus:outline-none ${currentVolume + remainingCapacity <= 0 ? 'opacity-50' : 'accent-primary'}`}
                  disabled={currentVolume === 0 && remainingCapacity <= 0}
                />
                
                <div className="flex justify-between text-xs text-stone-400 font-mono">
                  <span>0ml</span>
                  <span>최대 {Math.floor(currentVolume + remainingCapacity)}ml</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Sub-Ingredients (Syrups, Powders) */}
      <section>
        <div className="flex items-center justify-between mb-4 mt-8">
          <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest">4. 부재료 (Syrups & Extras)</h3>
          <button onClick={() => openAddModal("subIngredient")} className="p-1 hover:bg-stone-100 rounded-md text-stone-400 hover:text-primary transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {subIngredients.map((item) => {
            const isSelected = recipe.subIngredients.some((i) => i.item.id === item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleSubIngredient(item)}
                className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all border flex items-center gap-2 ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-stone-600 border-stone-200 hover:border-primary/50 hover:bg-stone-50"
                }`}
              >
                {item.colorHex && <div className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: item.colorHex }}/>}
                {isSelected ? "" : "+ "}{item.name}
              </button>
            );
          })}
        </div>

        {/* SubIngredient Gram Controls */}
        {recipe.subIngredients.length > 0 && (
          <div className="space-y-3 bg-stone-50 rounded-xl p-4 border border-stone-100">
            {recipe.subIngredients.map((sub) => (
              <div key={sub.item.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm font-bold text-stone-700">
                  <span>{sub.item.name}</span>
                  <span className="text-primary bg-primary/10 px-2 rounded-md">{sub.amountGs}g</span>
                </div>
                <input
                  type="range" min="0" max={Math.min(60, Math.floor(sub.amountGs + remainingCapacity))} step="1" value={sub.amountGs}
                  onChange={(e) => updateSubIngredientAmount(sub.item.id, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Garnishes */}
      <section>
        <div className="flex items-center justify-between mb-4 mt-8">
          <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest">5. 가니쉬 (Garnish)</h3>
          <button onClick={() => openAddModal("garnish")} className="p-1 hover:bg-stone-100 rounded-md text-stone-400 hover:text-primary transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {garnishes.map((item) => {
            const isSelected = recipe.garnishes.some((i) => i.item.id === item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleGarnish(item)}
                className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all border flex items-center gap-2 ${
                  isSelected
                    ? "bg-stone-800 text-white border-stone-800 shadow-md"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-stone-50"
                }`}
              >
                {item.colorHex && <div className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: item.colorHex }}/>}
                {isSelected ? "" : "+ "}{item.name}
              </button>
            );
          })}
        </div>

        {/* Garnish Gram Controls */}
        {recipe.garnishes.length > 0 && (
          <div className="space-y-3 bg-stone-50 rounded-xl p-4 border border-stone-100">
            {recipe.garnishes.map((g) => (
              <div key={g.item.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm font-bold text-stone-700">
                  <span>{g.item.name}</span>
                  <span className="text-stone-800 bg-stone-200 px-2 rounded-md">{g.amountGs}g</span>
                </div>
                <input
                  type="range" min="0" max="80" step="1" value={g.amountGs}
                  onChange={(e) => updateGarnishAmount(g.item.id, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Add Modal Overlay (Local to Panel) */}
      {isAdding && (
        <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center p-6 border border-stone-200 shadow-xl">
          <div className="w-full bg-white rounded-xl shadow-md border border-stone-100 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-black tracking-tight text-lg text-stone-800">
                새 {addCategory === 'base' ? '베이스' : addCategory === 'liquid' ? '액체' : addCategory === 'subIngredient' ? '부재료' : '가니쉬'} 추가
              </h4>
              <button onClick={() => setIsAdding(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <input 
              type="text" 
              autoFocus
              placeholder="재료 이름을 입력하세요..." 
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium mb-4"
            />

            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm font-bold text-stone-500 w-24">컬러/아이콘</label>
              <input 
                type="color" 
                value={newItemColor}
                onChange={(e) => setNewItemColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-none p-0 shrink-0"
              />
              <div className="flex-1 flex overflow-x-auto gap-2 py-1 no-scrollbar">
                {AVAILABLE_ICONS.map((IC) => {
                   const IconCmp = IC.icon;
                   const isSelected = newItemIcon === IC.name;
                   return (
                     <button 
                       key={IC.name}
                       onClick={() => setNewItemIcon(IC.name)}
                       className={`p-2 rounded-xl transition-all border shrink-0 ${isSelected ? 'bg-primary/10 border-primary text-primary' : 'bg-stone-50 border-stone-200 text-stone-400 hover:border-stone-300'}`}
                     >
                       <IconCmp className="w-5 h-5" />
                     </button>
                   );
                })}
              </div>
            </div>

            <button 
              onClick={handleQuickAdd}
              disabled={!newItemName}
              className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              추가하기
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
