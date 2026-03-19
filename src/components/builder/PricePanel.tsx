"use client";

import { useState } from "react";
import { ActiveRecipe } from "@/types/ingredient";
import { usePricing } from "@/contexts/PricingContext";
import { ShoppingBag, Home, Receipt, ChevronDown, ChevronUp } from "lucide-react";

interface PricePanelProps {
  recipe: ActiveRecipe;
}

export default function PricePanel({ recipe }: PricePanelProps) {
  const { settings, getIngredientPrice } = usePricing();
  const [eatIn, setEatIn] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const costOf = (id: string, amount: number) =>
    Math.round((getIngredientPrice(id) / 100) * amount);

  // ── Price calculation ──────────────────────────────────────────────────────
  const baseFee = settings.baseFee;
  const cupSizeSurcharge = settings.cupSizeFees[recipe.cupSizeMl] ?? 0;
  const dineInFee = eatIn ? settings.takeoutFee : 0;

  const baseIngredientCost = recipe.base
    ? getIngredientPrice(recipe.base.id)
    : 0;

  const liquidCosts = recipe.liquids.map(({ liquid, volumeMl }) => ({
    name: liquid.name,
    cost: costOf(liquid.id, volumeMl),
    amount: `${volumeMl}ml`,
  }));

  const subCosts = recipe.subIngredients
    .filter((s) => s.amountGs > 0)
    .map(({ item, amountGs }) => ({
      name: item.name,
      cost: costOf(item.id, amountGs),
      amount: `${amountGs}g`,
    }));

  const garnishCosts = recipe.garnishes
    .filter((g) => g.amountGs > 0)
    .map(({ item, amountGs }) => ({
      name: item.name,
      cost: costOf(item.id, amountGs),
      amount: `${amountGs}g`,
    }));

  const ingredientTotal =
    baseIngredientCost +
    liquidCosts.reduce((a, l) => a + l.cost, 0) +
    subCosts.reduce((a, s) => a + s.cost, 0) +
    garnishCosts.reduce((a, g) => a + g.cost, 0);

  const grandTotal = baseFee + cupSizeSurcharge + dineInFee + ingredientTotal;

  const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

  const lineItems = [
    { label: "기본 제조비", amount: won(baseFee) },
    ...(cupSizeSurcharge > 0 ? [{ label: `컵 추가금 (${recipe.cupSizeMl}ml)`, amount: `+${won(cupSizeSurcharge)}` }] : []),
    ...(dineInFee > 0 ? [{ label: "매장 이용요금", amount: `+${won(dineInFee)}` }] : []),
    ...(recipe.base && baseIngredientCost > 0 ? [{ label: `${recipe.base.name} (1 shot)`, amount: `+${won(baseIngredientCost)}` }] : []),
    ...liquidCosts.filter((l) => l.cost > 0).map((l) => ({ label: `${l.name} (${l.amount})`, amount: `+${won(l.cost)}` })),
    ...subCosts.filter((s) => s.cost > 0).map((s) => ({ label: `${s.name} (${s.amount})`, amount: `+${won(s.cost)}` })),
    ...garnishCosts.filter((g) => g.cost > 0).map((g) => ({ label: `${g.name} (${g.amount})`, amount: `+${won(g.cost)}` })),
  ];

  return (
    <div className="w-full bg-white border border-[#519A66]/20 rounded-2xl shadow-sm overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f5f9f5] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-[#237227]" />
          <span className="font-black text-[#237227] text-sm uppercase tracking-widest">예상 가격</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-black text-[#237227]">{won(grandTotal)}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-[#519A66]" /> : <ChevronDown className="w-4 h-4 text-[#519A66]" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-[#519A66]/10">
          {/* Eat-in / Takeout toggle */}
          <div className="flex gap-2 mt-4 mb-4">
            <button
              onClick={() => setEatIn(false)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all border ${
                !eatIn ? "bg-[#237227] text-white border-[#237227]" : "bg-white text-[#519A66] border-[#519A66]/30 hover:border-[#519A66]"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> 테이크아웃
            </button>
            <button
              onClick={() => setEatIn(true)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all border ${
                eatIn ? "bg-[#237227] text-white border-[#237227]" : "bg-white text-[#519A66] border-[#519A66]/30 hover:border-[#519A66]"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              매장 이용 <span className="opacity-70 font-medium">(+{won(settings.takeoutFee)})</span>
            </button>
          </div>

          {/* Line items */}
          <div className="space-y-2">
            {lineItems.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-[#519A66]/80 font-medium">{item.label}</span>
                <span className="font-bold text-[#237227]">{item.amount}</span>
              </div>
            ))}
            {lineItems.length === 1 && (
              <p className="text-xs text-[#519A66]/40 text-center py-2">재료별 단가를 Admin에서 설정하면 내역이 표시됩니다.</p>
            )}
          </div>

          {/* Total */}
          <div className="mt-4 pt-3 border-t border-[#519A66]/15 flex justify-between items-center">
            <span className="text-xs font-black text-[#519A66]/60 uppercase tracking-widest">합계</span>
            <span className="text-2xl font-black text-[#237227]">{won(grandTotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
