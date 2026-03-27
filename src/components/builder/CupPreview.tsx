"use client";

import { useId } from "react";
import { ActiveRecipe } from "@/types/ingredient";
import * as LucideIcons from "lucide-react";
import { Reorder } from "framer-motion";

interface CupPreviewProps {
  recipe: ActiveRecipe;
  setRecipe?: React.Dispatch<React.SetStateAction<ActiveRecipe>>;
}

export default function CupPreview({ recipe, setRecipe }: CupPreviewProps) {
  const svgIdPrefix = useId().replace(/:/g, "-");
  const CUP_WIDTH_PX = 200;
  const CUP_HEIGHT_PX = 400;
  const cupPath = `M 0 0 L 20 400 L 180 400 L 200 0 Z`;

  const visualScaleClass = recipe.cupSizeMl <= 355
    ? "h-[210px] sm:h-[300px]"
    : recipe.cupSizeMl <= 473
      ? "h-[280px] sm:h-[400px]"
      : "h-[350px] sm:h-[500px]";

  const MAX_CAPACITY_ML = recipe.cupSizeMl || 473;

  // ── Ice Physics ──────────────────────────────────────────────────────────
  const isIced = recipe.temperature && recipe.temperature.level > 0;
  let iceVolumePx = 0;
  let displacedIceVolumeMl = 0;

  if (isIced && recipe.temperature) {
    iceVolumePx = CUP_HEIGHT_PX * (recipe.temperature.level / 100);
    // Ice occupies volume but only ~1/3 is actual mass (rest = air gaps → liquid permeates)
    displacedIceVolumeMl = MAX_CAPACITY_ML * (recipe.temperature.level / 100) * (1 / 3);
  }

  // ── Build liquid layer pool ──────────────────────────────────────────────
  const pool: { id: string; name: string; amount: string; color: string; heightMl: number }[] = [];

  if (recipe.base && recipe.baseVolumeMl > 0) {
    pool.push({ id: `layer-base-${recipe.base.id}`, name: recipe.base.name, amount: `${recipe.baseVolumeMl}ml`, color: recipe.base.colorHex || '#3e2723', heightMl: recipe.baseVolumeMl });
  }

  recipe.liquids.forEach(({ liquid, volumeMl }) => {
    if (volumeMl > 0) {
      pool.push({ id: `layer-liq-${liquid.id}`, name: liquid.name, amount: `${volumeMl}ml`, color: liquid.colorHex || '#ffffff', heightMl: volumeMl });
    }
  });

  recipe.subIngredients.forEach(({ item, amountGs }) => {
    if (amountGs > 0) {
      pool.push({ id: `layer-sub-${item.id}`, name: item.name, amount: `${amountGs}g`, color: item.colorHex || '#d7ccc8', heightMl: amountGs });
    }
  });

  // Sort by user layer order
  pool.sort((a, b) => {
    const idxA = recipe.layerOrder?.indexOf(a.id) ?? -1;
    const idxB = recipe.layerOrder?.indexOf(b.id) ?? -1;
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  // ── Ice + Liquid Physics ──────────────────────────────────────────────────
  // Ice cubes sit in the cup with air gaps between them.
  // Liquid permeates through ice gaps, so the visual liquid level rises
  // FASTER than the raw ml would suggest.
  //
  // Visual fill height = (totalLiquidMl + iceDisplacementMl) / MAX_CAPACITY * CUP_HEIGHT
  // Each layer is proportionally scaled within this visual fill height.
  // If no liquid, just ice cubes are shown (no liquid rectangles).

  const totalLiquidMl = pool.reduce((acc, l) => acc + l.heightMl, 0);
  const totalOccupiedMl = totalLiquidMl + displacedIceVolumeMl;
  const fillPercentage = Math.min((totalOccupiedMl / MAX_CAPACITY_ML) * 100, 100);

  // The visual height the liquid reaches in the cup (including ice displacement boost)
  const visualFillPx = Math.min(CUP_HEIGHT_PX, (totalOccupiedMl / MAX_CAPACITY_ML) * CUP_HEIGHT_PX);

  // Scale each layer proportionally within the visual fill height
  let currentY = CUP_HEIGHT_PX;
  const layers = totalLiquidMl > 0
    ? pool.map(item => {
        const proportion = item.heightMl / totalLiquidMl;
        const visualHeight = proportion * visualFillPx;
        currentY -= visualHeight;
        return { ...item, y: Math.max(0, currentY), height: visualHeight };
      })
    : [];

  const displayLayers = [...layers].reverse();
  const orderedGarnishes = [...recipe.garnishes].sort((a, b) => {
    const order = recipe.garnishOrder ?? [];
    const indexA = order.indexOf(a.item.id);
    const indexB = order.indexOf(b.item.id);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const updateGarnishOrder = (newOrder: string[]) => {
    if (!setRecipe) {
      return;
    }

    setRecipe((prev) => ({
      ...prev,
      garnishOrder: newOrder,
      garnishes: [...prev.garnishes].sort((a, b) => newOrder.indexOf(a.item.id) - newOrder.indexOf(b.item.id)),
    }));
  };

  // ── Deterministic pseudo-random ──────────────────────────────────────────
  const hash = (seed: number) => {
    let s = seed;
    s = ((s >> 16) ^ s) * 0x45d9f3b;
    s = ((s >> 16) ^ s) * 0x45d9f3b;
    s = (s >> 16) ^ s;
    return (s & 0x7fffffff) / 0x7fffffff;
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative py-12 overflow-visible mx-auto">
      <div className={`relative flex items-center justify-center transition-all duration-500 ease-in-out w-full max-w-full ${visualScaleClass}`}>
        <svg 
          viewBox="-50 0 290 440"
          className="h-full w-auto drop-shadow-2xl overflow-visible absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <defs>
            {layers.map((layer, index) => {
              if (index === 0) return null;
              const layerBelow = layers[index - 1];
              const gradientId = `${svgIdPrefix}-grad-${layer.id}`;
              return (
                <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={layer.color} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={layerBelow.color} stopOpacity="0.8" />
                </linearGradient>
              );
            })}
            <linearGradient id={`${svgIdPrefix}-glassShine`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0.6" />
              <stop offset="15%" stopColor="white" stopOpacity="0.1" />
              <stop offset="85%" stopColor="transparent" stopOpacity="0" />
              <stop offset="100%" stopColor="white" stopOpacity="0.3" />
            </linearGradient>

            {/* ── Ice Cube Gradients ── */}
            <linearGradient id={`${svgIdPrefix}-iceBody`} x1="0" y1="0" x2="0.6" y2="1">
              <stop offset="0%"   stopColor="#e8f4ff" stopOpacity="0.28" />
              <stop offset="40%"  stopColor="#d0e8f8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#b8d8f0" stopOpacity="0.06" />
            </linearGradient>
            <linearGradient id={`${svgIdPrefix}-iceHighlight`} x1="0" y1="0" x2="1" y2="0.3">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.40" />
              <stop offset="30%"  stopColor="#ffffff" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id={`${svgIdPrefix}-iceShadow`} x1="0.5" y1="1" x2="0.5" y2="0">
              <stop offset="0%"   stopColor="#90b8d8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#90b8d8" stopOpacity="0.00" />
            </linearGradient>
            <radialGradient id={`${svgIdPrefix}-iceRefraction`} cx="0.3" cy="0.3" r="0.7">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#cde4f4" stopOpacity="0.00" />
            </radialGradient>
            <filter id={`${svgIdPrefix}-iceGlow`}>
              <feDropShadow dx="0" dy="0.8" stdDeviation="1.2" floodOpacity="0.12" floodColor="#c8e4ff" />
              <feDropShadow dx="-0.5" dy="-0.5" stdDeviation="0.5" floodOpacity="0.08" floodColor="#ffffff" />
            </filter>
          </defs>

          <g transform="translate(0, 20)">
            {/* Glass body */}
            <path d={cupPath} fill="rgba(255, 255, 255, 0.4)" stroke="#d6d3d1" strokeWidth="3.5" strokeLinejoin="round" />

            <g style={{ transition: 'all 0.5s ease-out' }}>
              <clipPath id={`${svgIdPrefix}-cupBounds`}><path d={cupPath} /></clipPath>

              <g clipPath={`url(#${svgIdPrefix}-cupBounds)`}>
                {/* Render Liquid Layers — fill from bottom, ice permeates */}
                {layers.map((layer, i) => {
                  const fillToUse = i === 0 ? layer.color : `url(#${svgIdPrefix}-grad-${layer.id})`;
                  return (
                    <rect 
                      key={`rect-${layer.id}`}
                      x={0}
                      y={Math.max(0, layer.y)}
                      width={CUP_WIDTH_PX}
                      height={layer.height}
                      fill={fillToUse}
                      style={{ transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)' }}
                    />
                  );
                })}

                {/* ── Ice Cubes — rendered ON TOP of liquid (floating in drink) ── */}
                {isIced && (() => {
                  const iceLevel = recipe.temperature!.level / 100;
                  const iceCeilY = CUP_HEIGHT_PX - iceVolumePx;

                  const COLS = 4;
                  const CUBE_MIN = 24;
                  const CUBE_VAR = 10;
                  const GAP = 18;
                  const CELL = CUBE_MIN + GAP;
                  const colW = CUP_WIDTH_PX / COLS;

                  const maxRows = Math.ceil(iceVolumePx / CELL) + 1;
                  const numCubes = Math.round(iceLevel * COLS * maxRows);

                  const cubes: { x: number; y: number; w: number; h: number; rot: number; k: number; seed: number }[] = [];
                  for (let i = 0; i < numCubes; i++) {
                    const col = i % COLS;
                    const row = Math.floor(i / COLS);
                    const s = i * 97 + 31;
                    const w = CUBE_MIN + Math.floor(hash(s) * CUBE_VAR);
                    const h = CUBE_MIN + Math.floor(hash(s + 1) * CUBE_VAR);
                    const jx = (hash(s + 2) - 0.5) * GAP * 0.6;
                    const jy = (hash(s + 3) - 0.5) * GAP * 0.5;
                    const rawY = CUP_HEIGHT_PX - (row + 1) * CELL + jy;
                    const clampedY = Math.max(iceCeilY, rawY);
                    cubes.push({
                      x: col * colW + (colW - w) / 2 + jx,
                      y: clampedY,
                      w, h,
                      rot: (hash(s + 4) - 0.5) * 12,
                      k: i,
                      seed: s,
                    });
                  }

                  return (
                    <g style={{ transition: 'all 0.5s ease-out' }}>
                      {cubes.map(({ x, y, w, h, rot, k, seed }) => {
                        const cx = x + w / 2;
                        const cy = y + h / 2;
                        const r = Math.max(4, w * 0.15);
                        const inset = 2;
                        return (
                          <g key={`ice-${k}`} transform={`rotate(${rot.toFixed(1)},${cx.toFixed(1)},${cy.toFixed(1)})`} filter={`url(#${svgIdPrefix}-iceGlow)`}>
                            <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#${svgIdPrefix}-iceBody)`} />
                            <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#${svgIdPrefix}-iceShadow)`} />
                            <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#${svgIdPrefix}-iceRefraction)`} />
                            <rect x={x + inset} y={y + inset} width={w * 0.4} height={h * 0.35} rx={r * 0.8} fill={`url(#${svgIdPrefix}-iceHighlight)`} />
                            <rect x={x + r} y={y + 1.5} width={w - r * 2} height={Math.max(2, h * 0.06)} rx={1} fill="white" fillOpacity={0.30} />
                            {w > 26 && (
                              <>
                                <line x1={x + w * 0.25} y1={y + h * 0.20} x2={x + w * 0.50} y2={y + h * 0.65}
                                  stroke="white" strokeOpacity={0.13} strokeWidth={0.5} strokeLinecap="round" />
                                <line x1={x + w * (0.4 + hash(seed + 5) * 0.2)} y1={y + h * 0.15}
                                  x2={x + w * (0.55 + hash(seed + 6) * 0.15)} y2={y + h * 0.55}
                                  stroke="white" strokeOpacity={0.08} strokeWidth={0.4} strokeLinecap="round" />
                              </>
                            )}
                            <rect x={x} y={y} width={w} height={h} rx={r}
                              fill="none" stroke="rgba(170,210,240,0.22)" strokeWidth={0.6} />
                          </g>
                        );
                      })}
                    </g>
                  );
                })()}
              </g>
            </g>

            {/* Garnishes at the top of liquid */}
            <g transform={`translate(0, ${Math.max(5, currentY - 15)})`} className="transition-all duration-500">
              {orderedGarnishes.map((g, i) => {
                if (g.amountGs <= 0) return null;
                const iconName = g.item.iconType as keyof typeof LucideIcons | undefined;
                const IconRef = (iconName && LucideIcons[iconName]) as React.ElementType || LucideIcons.Droplet;
                const count = Math.max(orderedGarnishes.length, 1);
                const usableWidth = CUP_WIDTH_PX - 90;
                const horizontalPos = 45 + (count === 1 ? usableWidth / 2 : (usableWidth / Math.max(count - 1, 1)) * i);
                return (
                  <g key={`gnish-${g.item.id}`} transform={`translate(${horizontalPos}, 0)`}>
                    <foreignObject x="-16" y="-16" width="32" height="32" className="overflow-visible">
                      <div 
                        className="w-full h-full text-stone-800 drop-shadow-xl flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-full border-2 border-white/90 p-1 transition-transform hover:scale-110 cursor-alias"
                        style={{ color: g.item.colorHex || '#1c1917' }}
                        title={`${g.item.name} (${g.amountGs}g)`}
                      >
                        <IconRef size={20} strokeWidth={3}/>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </g>

            {/* Glass Shine overlay */}
            <path d={cupPath} fill="url(#glassShine)" pointerEvents="none" />
          </g>
        </svg>
      </div>

      {layers.length > 0 && (
        <div className="absolute left-[calc(50%+72px)] top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1.5 sm:left-[calc(50%+86px)]">
          {setRecipe ? (
            <Reorder.Group
              axis="y"
              values={displayLayers.map((layer) => layer.id)}
              onReorder={(newOrder) =>
                setRecipe((prev) => ({ ...prev, layerOrder: [...(newOrder as string[])].reverse() }))
              }
              className="list-none m-0 flex flex-col gap-1.5 p-0"
            >
              {displayLayers.map((layer) => (
                <Reorder.Item
                  key={layer.id}
                  value={layer.id}
                  className="w-[118px] sm:w-[126px] flex items-center gap-2 cursor-grab active:cursor-grabbing bg-white/88 backdrop-blur-md px-2.5 py-2 rounded-xl shadow-sm border border-white/70 select-none"
                  whileDrag={{ scale: 1.04, boxShadow: "0 8px 25px rgba(0,0,0,0.15)", zIndex: 40 }}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: layer.color }} />
                  <span className="text-[10px] sm:text-[11px] font-black text-stone-700 whitespace-nowrap overflow-hidden text-ellipsis leading-tight flex flex-col">
                    {layer.name}
                    <span className="text-[8px] sm:text-[9px] text-stone-400 font-bold tracking-widest uppercase">{layer.amount}</span>
                  </span>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            displayLayers.map((layer) => (
              <div key={`guide-${layer.id}`} className="w-[118px] sm:w-[126px] flex items-center gap-2 bg-white/80 backdrop-blur-sm px-2.5 py-2 rounded-xl shadow-sm border border-white/60">
                <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-inner" style={{ backgroundColor: layer.color }} />
                <span className="text-[10px] sm:text-[11px] font-black text-stone-700 whitespace-nowrap overflow-hidden text-ellipsis leading-tight flex flex-col">
                  {layer.name}
                  <span className="text-[8px] sm:text-[9px] text-stone-400 font-bold tracking-widest uppercase">{layer.amount}</span>
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {orderedGarnishes.length > 0 && (
        <div className="absolute left-1/2 top-[calc(50%-170px)] z-10 flex w-[220px] -translate-x-1/2 justify-center sm:top-[calc(50%-195px)] sm:w-[260px]">
          {setRecipe ? (
            <Reorder.Group
              axis="x"
              values={orderedGarnishes.map((garnish) => garnish.item.id)}
              onReorder={(newOrder) => updateGarnishOrder(newOrder as string[])}
              className="list-none m-0 flex flex-wrap items-center justify-center gap-2 p-0"
            >
              {orderedGarnishes.map((garnish) => (
                <Reorder.Item
                  key={garnish.item.id}
                  value={garnish.item.id}
                  className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] sm:text-[11px] font-black text-stone-700 shadow-sm cursor-grab active:cursor-grabbing"
                  whileDrag={{ scale: 1.04, boxShadow: "0 8px 25px rgba(0,0,0,0.15)", zIndex: 40 }}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full border border-black/10"
                    style={{ backgroundColor: garnish.item.colorHex || "#d6d3d1" }}
                  />
                  <span>{garnish.item.name}</span>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {orderedGarnishes.map((garnish) => (
                <div
                  key={`garnish-chip-${garnish.item.id}`}
                  className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] sm:text-[11px] font-black text-stone-700 shadow-sm"
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full border border-black/10"
                    style={{ backgroundColor: garnish.item.colorHex || "#d6d3d1" }}
                  />
                  <span>{garnish.item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Capacity indicator */}
      <div className="absolute left-3 bottom-4 sm:left-6 sm:bottom-6 flex flex-col items-start bg-white/70 backdrop-blur-md px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl border border-stone-200 shadow-xl">
        <span className="text-[10px] uppercase font-black tracking-widest text-stone-400">용량</span>
        <span className="text-xl sm:text-2xl font-black text-stone-800 font-mono tracking-tighter">
          {Math.round(totalOccupiedMl)}<span className="text-sm text-stone-400 font-medium">/{MAX_CAPACITY_ML}ml</span>
        </span>
        <div className="w-24 sm:w-32 bg-stone-200 h-2 mt-2 rounded-full overflow-hidden shadow-inner">
          <div 
            className={`h-full transition-all duration-300 ${fillPercentage > 100 ? 'bg-red-500' : 'bg-[#237227]'}`}
            style={{ width: `${Math.min(fillPercentage, 100)}%` }}
          />
        </div>
        <span className="text-[9px] mt-1 text-stone-400 font-bold tracking-widest leading-tight">
          {isIced ? `얼음 ${Math.round(displacedIceVolumeMl)}ml 포함` : '얼음 없음'}
        </span>
      </div>
    </div>
  );
}
