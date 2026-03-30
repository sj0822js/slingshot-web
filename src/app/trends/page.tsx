"use client";

import Header from "@/components/layout/Header";
import { useAdmin } from "@/contexts/AdminContext";
import { TrendingUp, ExternalLink, ImageOff, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const DRINK_LABELS = ["#1 이번 주 픽", "#2 트렌드", "#3 스태프 추천", "#4 시즌 특선"];
const SLINGSHOT_LOCATION_LINK = "https://naver.me/xUwWRPud";

export default function TrendsPage() {
  const { trendDrinks } = useAdmin();
  const activeTrends = trendDrinks.filter((t) => t.url);

  return (
    <div className="w-full min-h-screen flex justify-center bg-[#237227]/10">
      <div className="w-full max-w-md min-h-screen bg-white shadow-2xl relative overflow-hidden flex flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto pb-24">
          {/* Hero */}
          <div className="bg-[#237227] px-6 pt-8 pb-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #FFAA00 0%, transparent 60%)" }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-[#FFAA00]" />
                <span className="text-[#FFAA00] font-bold text-xs uppercase tracking-widest">Trend Drinks</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-2">요즘 인기 음료</h1>
              <p className="text-white/70 text-sm">슬링샷이 엄선한 이번 주 트렌드 드링크</p>
            </div>
          </div>

          <div className="px-5 py-6 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-3xl border border-[#519A66]/20 shadow-sm"
            >
              <div className="relative overflow-hidden bg-[#031c03] px-6 py-7 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,208,120,0.28),transparent_38%)]" />
                <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-white/85">
                    <MapPin className="h-3.5 w-3.5 text-[#FFD786]" />
                    Visit
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">슬링샷 위치</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/72">
                    매장 위치를 바로 확인하고 길찾기로 이동하세요
                  </p>
                </div>
              </div>

              <Link
                href={SLINGSHOT_LOCATION_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white px-5 py-4 transition-colors hover:bg-[#f5f9f5]"
              >
                <div>
                  <p className="text-sm font-black text-[#237227]">네이버 지도에서 열기</p>
                  <p className="mt-1 text-xs text-[#519A66]/70">slingshot.kr 방문 전 위치를 확인해보세요</p>
                </div>
                <ExternalLink className="h-4 w-4 text-[#519A66]" />
              </Link>
            </motion.div>

            {activeTrends.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <div className="w-20 h-20 rounded-3xl bg-[#519A66]/10 flex items-center justify-center">
                  <ImageOff className="w-10 h-10 text-[#519A66]/40" />
                </div>
                <p className="text-[#237227]/50 font-bold">아직 등록된 트렌드 음료가 없습니다.</p>
                <p className="text-sm text-[#237227]/40">관리자 페이지에서 트렌드 음료를 업로드해주세요.</p>
              </div>
            ) : (
              activeTrends.map((drink, idx) => (
                <motion.div
                  key={drink.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="rounded-3xl overflow-hidden border border-[#519A66]/20 shadow-sm hover:shadow-md transition-shadow group"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-[4/3] bg-[#237227]/5 overflow-hidden">
                    <img
                      src={drink.url}
                      alt={DRINK_LABELS[idx] || `트렌드 음료 ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-block bg-[#FFAA00] text-[#1a2e1b] text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        {DRINK_LABELS[idx] || `#${idx + 1}`}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  {drink.link && drink.link !== "#" && (
                    <Link
                      href={drink.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-5 py-4 bg-white hover:bg-[#f5f9f5] transition-colors"
                    >
                      <span className="text-sm font-bold text-[#237227]">더 알아보기</span>
                      <ExternalLink className="w-4 h-4 text-[#519A66]" />
                    </Link>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
