"use client";

import Header from "@/components/layout/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useIngredients } from "@/contexts/IngredientContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { useRecipes } from "@/contexts/RecipeContext";
import { DrinkBase } from "@/types/ingredient";
import {
  Upload, Sparkles, LayoutPanelTop, MonitorSmartphone, Image as ImageIcon,
  Users, MousePointerClick, Coffee, Settings2, Link as LinkIcon, PlusCircle,
  Check, Droplet, Timer, ThermometerSun, Plus, Edit2, X, BookOpen, Receipt,
} from "lucide-react";
import { motion } from "framer-motion";
import AdminGuard from "@/components/auth/AdminGuard";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePricing } from "@/contexts/PricingContext";

export default function SuperAdminPage() {
  const { t } = useLanguage();
  const { appName, setAppName, logoUrl, setLogoUrl, trendDrinks, setTrendDrinks } = useAdmin();
  const { ingredients, updateIngredient, addIngredient } = useIngredients();
  const { getTodayCount, getTopPages } = useAnalytics();
  const { savedRecipes } = useRecipes();
  const { settings: pricing, updateSettings: updatePricing, setIngredientPrice, getIngredientPrice } = usePricing();
  
  const [localTitle, setLocalTitle] = useState(appName);
  const [savedTick, setSavedTick] = useState(false);
  const [trendTick, setTrendTick] = useState(false);

  // Analytics
  const [todayCount, setTodayCount] = useState(0);
  const [topPages, setTopPages] = useState<{ path: string; count: number }[]>([]);
  useEffect(() => {
    setTodayCount(getTodayCount());
    setTopPages(getTopPages());
  }, [getTodayCount, getTopPages]);

  // Computed state
  const bases = ingredients.filter((i) => i.category === "base") as DrinkBase[];

  // Espresso editor states
  const [editingBaseId, setEditingBaseId] = useState<string | null>(null);
  const [isAddingBase, setIsAddingBase] = useState(false);
  const [newBaseName, setNewBaseName] = useState("");
  const [newBaseOrigin, setNewBaseOrigin] = useState("");
  const [newBaseColor, setNewBaseColor] = useState("#6B4226");

  // Custom Garnish Input
  const [customGName, setCustomGName] = useState("");
  const [customGIcon, setCustomGIcon] = useState<string | null>(null);
  
  // Custom Liquid Input
  const [customLName, setCustomLName] = useState("");
  const [customLColor, setCustomLColor] = useState("#4A90D9");

  // Custom SubIngredient Input
  const [customSName, setCustomSName] = useState("");
  const [customSColor, setCustomSColor] = useState("#8B6E5A");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setLogoUrl(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleTrendImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const newArr = [...trendDrinks];
      if (!newArr[index]) newArr[index] = { id: `td_${index}`, url: "", link: "#" };
      newArr[index].url = event.target?.result as string;
      setTrendDrinks(newArr);
    };
    reader.readAsDataURL(file);
  };

  const handleTrendLinkUpdate = (index: number, val: string) => {
    const newArr = [...trendDrinks];
    if (!newArr[index]) newArr[index] = { id: `td_${index}`, url: "", link: "#" };
    newArr[index].link = val;
    setTrendDrinks(newArr);
  };

  const handleCustomGarnishUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setCustomGIcon(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const confirmCustomGarnish = () => {
    if (!customGName) return;
    addIngredient({
      id: `custom_g_${Date.now()}`,
      category: "garnish",
      name: customGName,
      iconType: customGIcon || "Sparkles",
      isAdminCreated: true,
    });
    setCustomGName("");
    setCustomGIcon(null);
  };

  const confirmCustomLiquid = () => {
    if (!customLName.trim()) return;
    addIngredient({
      id: `custom_l_${Date.now()}`,
      category: "liquid",
      name: customLName,
      colorHex: customLColor,
      defaultVolumeMl: 30,
      isAdminCreated: true,
    } as import("@/types/ingredient").Liquid);
    setCustomLName("");
    setCustomLColor("#4A90D9");
  };

  const confirmCustomSub = () => {
    if (!customSName.trim()) return;
    addIngredient({
      id: `custom_s_${Date.now()}`,
      category: "subIngredient",
      name: customSName,
      colorHex: customSColor,
      flavorCategory: "other",
      isAdminCreated: true,
    } as import("@/types/ingredient").SubIngredient);
    setCustomSName("");
    setCustomSColor("#8B6E5A");
  };

  const handleAddBase = () => {
    if (!newBaseName.trim()) return;
    addIngredient({
      id: `base_${Date.now()}`,
      category: "base",
      name: newBaseName,
      colorHex: newBaseColor,
      origin: newBaseOrigin,
      dosingGrams: 20,
      extractionGrams: 40,
      extractionSeconds: 30,
      extractionTemp: 93,
    } as DrinkBase);
    setNewBaseName("");
    setNewBaseOrigin("");
    setNewBaseColor("#6B4226");
    setIsAddingBase(false);
  };

  const handleSaveGlobal = () => {
    setAppName(localTitle);
    setSavedTick(true);
    setTimeout(() => setSavedTick(false), 2000);
  };

  // Route label map
  const routeLabels: Record<string, string> = {
    "/": "홈",
    "/builder": "음료 만들기",
    "/gallery": "내 음료",
    "/espresso": "에스프레소",
    "/slingshot": "슬링샷 레시피",
    "/trends": "트렌드 음료",
    "/admin": "어드민",
  };

  return (
    <AdminGuard>
      <div className="w-full min-h-screen bg-[#f5f9f5] flex flex-col">
        <Header />
        
        <main className="flex-1 w-full max-w-4xl mx-auto px-5 py-10 flex flex-col">
          <header className="mb-10 text-center">
            <div className="w-16 h-16 bg-[#237227] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#237227]/30">
              <MonitorSmartphone className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-[#237227] tracking-tight">서비스 관리자</h1>
            <p className="text-[#519A66]/70 mt-2">앱의 글로벌 설정, 로고 이미지 및 트렌드 음료를 통합 관리합니다.</p>
          </header>

          {/* ── Real Analytics Dashboard ── */}
          <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-[#519A66]/20 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#237227]/10 text-[#237227] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#519A66] uppercase tracking-widest">오늘 방문수</p>
                <p className="text-2xl font-black text-[#237227]">{todayCount}<span className="text-sm text-[#519A66]/60 font-medium ml-1">회</span></p>
                <p className="text-[10px] text-[#519A66]/50 mt-0.5">페이지 뷰 기준, localStorage</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-[#519A66]/20 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFAA00]/10 text-[#FFAA00] flex items-center justify-center shrink-0">
                <MousePointerClick className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#519A66] uppercase tracking-widest">최다 접근 페이지</p>
                {topPages[0] ? (
                  <>
                    <p className="text-lg font-black text-[#237227] truncate">{routeLabels[topPages[0].path] || topPages[0].path}</p>
                    <p className="text-[10px] text-[#519A66]/50 mt-0.5">{topPages[0].count}회 방문</p>
                  </>
                ) : (
                  <p className="text-sm text-[#519A66]/40 font-medium mt-1">아직 데이터 없음</p>
                )}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-[#519A66]/20 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFD786]/40 text-[#FFAA00] flex items-center justify-center shrink-0">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#519A66] uppercase tracking-widest">저장된 커스텀 조합</p>
                <p className="text-2xl font-black text-[#237227]">{savedRecipes.length}<span className="text-sm text-[#519A66]/60 font-medium ml-1">건</span></p>
                <p className="text-[10px] text-[#519A66]/50 mt-0.5">비관리자 레시피 포함</p>
              </div>
            </motion.div>
          </section>

          {/* Top pages breakdown */}
          {topPages.length > 1 && (
            <section className="bg-white border border-[#519A66]/20 rounded-3xl p-5 shadow-sm mb-8">
              <p className="text-xs font-bold text-[#519A66] uppercase tracking-widest mb-4">페이지별 방문 통계</p>
              <div className="space-y-3">
                {topPages.map((p, i) => {
                  const pct = topPages[0]?.count > 0 ? Math.round((p.count / topPages[0].count) * 100) : 0;
                  return (
                    <div key={p.path} className="flex items-center gap-3">
                      <span className="text-xs font-black text-[#519A66]/60 w-4">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs font-bold text-[#237227] mb-1">
                          <span>{routeLabels[p.path] || p.path}</span>
                          <span>{p.count}회</span>
                        </div>
                        <div className="h-1.5 bg-[#519A66]/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#519A66] rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            
            {/* Global Visual Settings */}
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-[#519A66]/20 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#237227]/10 rounded-lg text-[#237227]">
                  <LayoutPanelTop className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[#237227]">기본 설정</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#519A66] uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>프론트 로고 이미지</span>
                    {logoUrl && <button onClick={() => setLogoUrl(null)} className="text-red-500 hover:text-red-600">초기화</button>}
                  </label>
                  <div className="relative w-full h-24 border-2 border-dashed border-[#519A66]/30 rounded-xl flex flex-col items-center justify-center text-[#519A66]/40 hover:bg-[#f5f9f5] hover:border-[#519A66] transition-colors cursor-pointer group overflow-hidden">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 mb-2 group-hover:text-[#237227] transition-colors" />
                        <span className="text-sm font-medium">새 로고 업로드</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#519A66] uppercase tracking-widest mb-2">주 서비스명 (앱 타이틀)</label>
                  <input 
                    type="text" 
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    className="w-full bg-[#f5f9f5] border border-[#519A66]/30 rounded-xl px-4 py-3 text-[#237227] font-bold focus:outline-none focus:ring-2 focus:ring-[#519A66]/30 focus:border-[#519A66] transition-all"
                  />
                </div>
                
                <button 
                  onClick={handleSaveGlobal} 
                  className={`w-full py-3 font-bold rounded-xl mt-2 transition-all flex items-center justify-center gap-2 ${savedTick ? 'bg-green-500 text-white' : 'bg-[#237227] text-white hover:bg-[#1a5c1e]'}`}
                >
                  {savedTick ? <><Check className="w-5 h-5"/> 적용됨</> : '저장하기'}
                </button>
              </div>
            </motion.section>

            {/* Trend Drink Upload */}
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-[#519A66]/20 rounded-3xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#FFAA00]/10 rounded-lg text-[#FFAA00]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#237227]">트렌드 음료 관리</h2>
                  <p className="text-xs text-[#519A66]/60">사용자들에게 보여질 트렌드 음료 이미지를 업로드합니다.</p>
                </div>
              </div>

              <div className="space-y-4 flex-1 max-h-[400px] overflow-y-auto pr-1">
                {[0,1,2,3].map((idx) => {
                  const tItem = trendDrinks[idx] || { url: '', link: '' };
                  return (
                    <div key={`trend-edit-${idx}`} className="bg-[#f5f9f5] border border-[#519A66]/20 rounded-xl p-4">
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 bg-white border-2 border-dashed border-[#519A66]/30 rounded-lg flex items-center justify-center overflow-hidden shrink-0 group">
                          <input type="file" accept="image/*" onChange={(e) => handleTrendImageUpload(idx, e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                          {tItem.url ? (
                            <img src={tItem.url} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-[#519A66]/30 group-hover:text-[#FFAA00]" />
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <label className="text-xs font-bold text-[#519A66] uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" /> 링크 (슬롯 {idx+1})
                          </label>
                          <input 
                            type="text" 
                            value={tItem.link}
                            onChange={(e) => handleTrendLinkUpdate(idx, e.target.value)}
                            placeholder="https://..."
                            className="w-full border border-[#519A66]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#519A66]/20 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => { setTrendTick(true); setTimeout(() => setTrendTick(false), 2000); }}
                className={`w-full py-3 font-bold rounded-xl mt-4 transition-all flex items-center justify-center gap-2 ${trendTick ? 'bg-green-500 text-white' : 'bg-[#237227] text-white hover:bg-[#1a5c1e]'}`}
              >
                {trendTick ? <><Check className="w-5 h-5"/> 발행됨</> : '트렌드 음료 저장 및 발행'}
              </button>
            </motion.section>
          </div>

          {/* Espresso Base Settings + Garnish */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
            
            {/* Espresso Base Editor */}
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white border border-[#519A66]/20 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1a2e1b]/10 rounded-lg text-[#1a2e1b]">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#237227]">추출 세팅 제어</h2>
                    <p className="text-xs text-[#519A66]/60">에스프레소 페이지 정보 관리</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddingBase(true)}
                  className="p-2 bg-[#FFAA00]/10 hover:bg-[#FFAA00]/20 text-[#FFAA00] rounded-full transition-colors"
                  title="새 베이스 추가"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add Base Modal */}
              {isAddingBase && (
                <div className="mb-4 p-4 bg-[#f5f9f5] rounded-xl border border-[#519A66]/20">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-black text-[#237227]">새 베이스 추가</p>
                    <button onClick={() => setIsAddingBase(false)} className="text-[#519A66]/50 hover:text-red-400"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input type="color" value={newBaseColor} onChange={(e) => setNewBaseColor(e.target.value)} className="w-10 h-9 rounded border-none cursor-pointer shrink-0" />
                      <input type="text" value={newBaseName} onChange={(e) => setNewBaseName(e.target.value)} placeholder="베이스명 (예: 과테말라)" className="flex-1 border border-[#519A66]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#519A66]/20 bg-white" />
                    </div>
                    <input type="text" value={newBaseOrigin} onChange={(e) => setNewBaseOrigin(e.target.value)} placeholder="원산지 (예: 안티구아 지역)" className="w-full border border-[#519A66]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#519A66]/20 bg-white" />
                    <button onClick={handleAddBase} disabled={!newBaseName.trim()} className="w-full py-2 bg-[#237227] text-white text-sm font-bold rounded-lg disabled:opacity-50">추가하기</button>
                  </div>
                </div>
              )}

              <div className="space-y-4 mt-1">
                {bases.map((base) => (
                  <div key={base.id} className="p-4 bg-[#f5f9f5] rounded-xl border border-[#519A66]/20">
                    {/* Name + Origin Row */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-3 h-3 rounded-full shadow-inner shrink-0" style={{ backgroundColor: base.colorHex }} />
                      {editingBaseId === base.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            defaultValue={base.name}
                            onBlur={(e) => { updateIngredient(base.id, { name: e.target.value }); }}
                            className="flex-1 border border-[#519A66]/30 rounded-md px-2 py-1 text-sm font-bold focus:outline-none bg-white"
                            placeholder="베이스명"
                          />
                          <button onClick={() => setEditingBaseId(null)} className="text-[#519A66]/50 hover:text-[#237227]"><Check className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-between">
                          <span className="font-bold text-[#237227]">{base.name}</span>
                          <button onClick={() => setEditingBaseId(base.id)} className="text-[#519A66]/40 hover:text-[#237227] ml-2">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Origin field (always separate) */}
                    <div className="mb-3">
                      <label className="text-[10px] uppercase font-bold text-[#519A66]/60 tracking-wider mb-1 block">원산지</label>
                      <input
                        type="text"
                        value={base.origin || ""}
                        onChange={(e) => updateIngredient(base.id, { origin: e.target.value })}
                        placeholder="예: 에티오피아 예가체프"
                        className="w-full border border-[#519A66]/20 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#519A66]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-[#519A66]/60 tracking-wider flex items-center gap-1 mb-1"><Droplet className="w-3 h-3"/> 도징(g)</label>
                        <input type="number" value={base.dosingGrams || ''} onChange={(e) => updateIngredient(base.id, { dosingGrams: Number(e.target.value) })} className="w-full border border-[#519A66]/20 rounded-md px-2 py-1 text-sm bg-white focus:outline-none" />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-[#519A66]/60 tracking-wider flex items-center gap-1 mb-1"><Droplet className="w-3 h-3 text-orange-400"/> 추출액(g)</label>
                        <input type="number" value={base.extractionGrams || ''} onChange={(e) => updateIngredient(base.id, { extractionGrams: Number(e.target.value) })} className="w-full border border-[#519A66]/20 rounded-md px-2 py-1 text-sm bg-white focus:outline-none" />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-[#519A66]/60 tracking-wider flex items-center gap-1 mb-1"><Timer className="w-3 h-3"/> 초(s)</label>
                        <input type="number" value={base.extractionSeconds || ''} onChange={(e) => updateIngredient(base.id, { extractionSeconds: Number(e.target.value) })} className="w-full border border-[#519A66]/20 rounded-md px-2 py-1 text-sm bg-white focus:outline-none" />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-[#519A66]/60 tracking-wider flex items-center gap-1 mb-1"><ThermometerSun className="w-3 h-3 text-red-400"/> 수온(°C)</label>
                        <input type="number" value={base.extractionTemp || ''} onChange={(e) => updateIngredient(base.id, { extractionTemp: Number(e.target.value) })} className="w-full border border-[#519A66]/20 rounded-md px-2 py-1 text-sm bg-white focus:outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Custom Garnish + Slingshot Recipe shortcut */}
            <div className="flex flex-col gap-6">
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-[#519A66]/20 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#FFAA00]/10 rounded-lg text-[#FFAA00]">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-[#237227]">커스텀 가니쉬 추가</h2>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#519A66] uppercase tracking-widest mb-2">로컬 아이콘 파일 첨부</label>
                    <div className="relative w-full h-16 border-2 border-dashed border-[#519A66]/30 rounded-xl flex items-center justify-center text-[#519A66]/40 cursor-pointer overflow-hidden">
                      <input type="file" accept="image/*" onChange={handleCustomGarnishUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {customGIcon ? (
                        <img src={customGIcon} className="h-10 w-10 object-contain drop-shadow-md" />
                      ) : (
                        <span className="text-sm font-medium">SVG / PNG 업로드</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#519A66] uppercase tracking-widest mb-2">가니쉬 이름</label>
                    <input 
                      type="text" 
                      value={customGName}
                      onChange={(e) => setCustomGName(e.target.value)}
                      placeholder="예: 로즈마리 잎"
                      className="w-full bg-[#f5f9f5] border border-[#519A66]/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#519A66] focus:ring-2 focus:ring-[#519A66]/20"
                    />
                  </div>
                  <button onClick={confirmCustomGarnish} disabled={!customGName} className="w-full py-3 bg-[#237227] hover:bg-[#1a5c1e] text-white font-bold rounded-xl disabled:opacity-50 transition-colors">
                    가니쉬 등록
                  </button>
                </div>
              </motion.section>

              {/* Custom Liquid Add */}
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="bg-white border border-[#519A66]/20 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#519A66]/10 rounded-lg text-[#519A66]"><Droplet className="w-5 h-5" /></div>
                  <h2 className="text-lg font-bold text-[#237227]">공식 액체류 추가</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="color" value={customLColor} onChange={(e) => setCustomLColor(e.target.value)} className="w-10 h-10 rounded border-none cursor-pointer shrink-0" />
                    <input type="text" value={customLName} onChange={(e) => setCustomLName(e.target.value)} placeholder="예: 오트밀크" className="flex-1 bg-[#f5f9f5] border border-[#519A66]/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#519A66]" />
                  </div>
                  <button onClick={confirmCustomLiquid} disabled={!customLName.trim()} className="w-full py-3 bg-[#237227] hover:bg-[#1a5c1e] text-white font-bold rounded-xl disabled:opacity-50 transition-colors">
                    액체류 등록
                  </button>
                </div>
              </motion.section>

              {/* Custom SubIngredient Add */}
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="bg-white border border-[#519A66]/20 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#519A66]/10 rounded-lg text-[#519A66]"><Settings2 className="w-5 h-5" /></div>
                  <h2 className="text-lg font-bold text-[#237227]">공식 부재료 추가</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="color" value={customSColor} onChange={(e) => setCustomSColor(e.target.value)} className="w-10 h-10 rounded border-none cursor-pointer shrink-0" />
                    <input type="text" value={customSName} onChange={(e) => setCustomSName(e.target.value)} placeholder="예: 흑임자 파우더" className="flex-1 bg-[#f5f9f5] border border-[#519A66]/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#519A66]" />
                  </div>
                  <button onClick={confirmCustomSub} disabled={!customSName.trim()} className="w-full py-3 bg-[#237227] hover:bg-[#1a5c1e] text-white font-bold rounded-xl disabled:opacity-50 transition-colors">
                    부재료 등록
                  </button>
                </div>
              </motion.section>

              {/* Slingshot Recipe Builder Link */}
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-[#237227] rounded-3xl p-6 shadow-sm text-white col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/15 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold">공식 레시피 제작</h2>
                </div>
                <p className="text-white/70 text-sm mb-4">음료 빌더에서 만든 레시피를 슬링샷 공식 레시피로 등록할 수 있습니다.</p>
                <Link href="/builder?official=true" className="block w-full text-center py-3 bg-[#FFAA00] hover:bg-[#e09500] text-[#1a2e1b] font-black rounded-xl transition-colors">
                  공식 레시피 만들러 가기
                </Link>
              </motion.section>
            </div>
          </div>

          {/* Pricing Settings */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-[#519A66]/20 rounded-3xl p-6 shadow-sm mt-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-[#FFAA00]/10 rounded-lg text-[#FFAA00]"><Receipt className="w-5 h-5" /></div>
              <div>
                <h2 className="text-lg font-bold text-[#237227]">가격 설정</h2>
                <p className="text-xs text-[#519A66]/60">각 재료별 단가(Won/ml 또는 Won/g)와 기본 요금을 설정합니다.</p>
              </div>
            </div>

            {/* Base + cup fees */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-[#f5f9f5] rounded-xl p-3">
                <label className="text-[10px] font-black text-[#519A66] uppercase tracking-widest block mb-1">기본 제조비</label>
                <div className="flex items-center">
                  <input type="number" value={pricing.baseFee} onChange={(e) => updatePricing({ baseFee: Number(e.target.value) })} className="w-full border border-[#519A66]/20 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none" />
                  <span className="ml-1 text-xs text-[#519A66]/60 shrink-0">원</span>
                </div>
              </div>
              <div className="bg-[#f5f9f5] rounded-xl p-3">
                <label className="text-[10px] font-black text-[#519A66] uppercase tracking-widest block mb-1">매장이용 추가금</label>
                <div className="flex items-center">
                  <input type="number" value={pricing.takeoutFee} onChange={(e) => updatePricing({ takeoutFee: Number(e.target.value) })} className="w-full border border-[#519A66]/20 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none" />
                  <span className="ml-1 text-xs text-[#519A66]/60 shrink-0">원</span>
                </div>
              </div>
              {[355, 473, 591].map((ml) => (
                <div key={ml} className="bg-[#f5f9f5] rounded-xl p-3">
                  <label className="text-[10px] font-black text-[#519A66] uppercase tracking-widest block mb-1">{ml}ml 컵 추가금</label>
                  <div className="flex items-center">
                    <input type="number" value={pricing.cupSizeFees[ml] ?? 0} onChange={(e) => updatePricing({ cupSizeFees: { ...pricing.cupSizeFees, [ml]: Number(e.target.value) } })} className="w-full border border-[#519A66]/20 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none" />
                    <span className="ml-1 text-xs text-[#519A66]/60 shrink-0">원</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Per-ingredient prices */}
            <p className="text-xs font-black text-[#519A66]/60 uppercase tracking-widest mb-3">재료별 단가 (원/100ml 또는 원/100g)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {ingredients.filter((i) => i.category !== "temperature").map((ing) => (
                <div key={ing.id} className="flex items-center gap-2 bg-[#f5f9f5] rounded-xl px-3 py-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ing.colorHex ?? '#519A66' }} />
                  <span className="flex-1 text-xs font-bold text-[#237227] truncate">{ing.name}</span>
                  {ing.isAdminCreated && <span className="text-[9px] font-black text-[#FFAA00] bg-[#FFAA00]/10 px-1.5 py-0.5 rounded-full shrink-0">공식</span>}
                  <span className="text-[10px] text-[#519A66]/50 shrink-0">{ing.category === 'liquid' || ing.category === 'base' ? '원/100ml' : '원/100g'}</span>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={getIngredientPrice(ing.id)}
                    onChange={(e) => setIngredientPrice(ing.id, Number(e.target.value))}
                    className="w-20 border border-[#519A66]/20 rounded-md px-2 py-1 text-xs bg-white focus:outline-none text-right"
                  />
                </div>
              ))}
            </div>
          </motion.section>

        </main>
      </div>
    </AdminGuard>
  );
}
