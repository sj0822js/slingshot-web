"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type HeroLandingProps = {
  onComplete: () => void;
};

const SCROLL_THRESHOLD = 1660;
const TOUCH_THRESHOLD = 260;

const COPY_LINES = [
  "계절을 품은 금목서와 목련을 가꾸고",
  "계절을 담은 원두, 스프레딧을 만듭니다",
  "우리들의 정원을 함께 가꾸세요",
] as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const windowProgress = (progress: number, start: number, peak: number, end: number) => {
  if (progress <= start || progress >= end) {
    return 0;
  }

  if (progress <= peak) {
    return (progress - start) / (peak - start);
  }

  return 1 - (progress - peak) / (end - peak);
};

export default function HeroLanding({ onComplete }: HeroLandingProps) {
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const touchBaseProgress = useRef(0);
  const progressRef = useRef(0);
  const transitionRef = useRef(false);

  useEffect(() => {
    const completeHero = () => {
      if (transitionRef.current) {
        return;
      }

      transitionRef.current = true;
      setIsTransitioning(true);
      setProgress(SCROLL_THRESHOLD);
      progressRef.current = SCROLL_THRESHOLD;
      window.setTimeout(() => {
        onComplete();
      }, 480);
    };

    const accumulateProgress = (delta: number) => {
      setProgress((current) => {
        const next = clamp(current + delta, 0, SCROLL_THRESHOLD);
        progressRef.current = next;
        if (next >= SCROLL_THRESHOLD) {
          completeHero();
        }
        return next;
      });
    };

    const handleWheel = (event: WheelEvent) => {
      if (window.scrollY > 0) {
        return;
      }
      accumulateProgress(event.deltaY);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (window.scrollY > 0) {
        return;
      }

      if (["ArrowDown", "PageDown", "Space", "Enter"].includes(event.code)) {
        accumulateProgress(120);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0]?.clientY ?? null;
      touchBaseProgress.current = progressRef.current;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (window.scrollY > 0 || touchStartY.current === null) {
        return;
      }

      const currentY = event.touches[0]?.clientY ?? touchStartY.current;
      const delta = touchStartY.current - currentY;

      const next = clamp(touchBaseProgress.current + delta * 2.2, 0, SCROLL_THRESHOLD);
      progressRef.current = next;
      setProgress(next);
    };

    const handleTouchEnd = () => {
      if (touchStartY.current === null) {
        return;
      }

      if (progressRef.current >= SCROLL_THRESHOLD - TOUCH_THRESHOLD) {
        completeHero();
      }

      touchStartY.current = null;
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onComplete]);

  const normalizedProgress = Math.min(progress / SCROLL_THRESHOLD, 1);
  const logoPhase = windowProgress(normalizedProgress, 0, 0.16, 0.38);
  const lineOnePhase = windowProgress(normalizedProgress, 0.28, 0.46, 0.7);
  const lineTwoPhase = windowProgress(normalizedProgress, 0.5, 0.68, 0.9);
  const lineThreePhase = windowProgress(normalizedProgress, 0.72, 0.88, 0.995);
  const exitProgress = Math.min(Math.max((normalizedProgress - 0.935) / 0.065, 0), 1);

  const titleOpacity = logoPhase * (1 - exitProgress * 0.2);
  const titleY = 10 - logoPhase * 10 - (1 - logoPhase) * 28;
  const titleScale = 0.96 + logoPhase * 0.04;
  const titleBlur = (1 - logoPhase) * 5.6;

  const indicatorOpacity = isTransitioning ? 0 : Math.max(0.24, 1 - exitProgress * 0.82);
  const indicatorLabel =
    normalizedProgress < 0.26 ? "Scroll" : normalizedProgress < 0.82 ? "Continue" : "Enter";

  return (
    <motion.section
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#031c03]"
      animate={{
        opacity: isTransitioning ? 0 : 1,
        scale: isTransitioning ? 1.02 : 1,
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_48%)]" />
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_26%,transparent_72%,rgba(0,0,0,0.08))]"
        style={{ opacity: 0.78 + lineThreePhase * 0.22 }}
      />

      <div
        className="relative h-screen w-full max-w-6xl px-6 text-white"
        style={{
          opacity: 1 - exitProgress * 0.16,
        }}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-5xl px-6 sm:px-10">
            <div className="relative w-full max-w-3xl pl-[30pt] text-left">
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute top-1/2 font-display text-[clamp(2.4rem,7.2vw,5.6rem)] font-[200] uppercase tracking-[0.12em] text-white sm:tracking-[0.14em]"
                style={{
                  opacity: titleOpacity,
                  y: titleY,
                  scale: titleScale,
                  filter: `blur(${titleBlur}px)`,
                }}
              >
                SLINGSHOT
              </motion.h1>

              {COPY_LINES.map((line, index) => {
                const linePhase = [lineOnePhase, lineTwoPhase, lineThreePhase][index];

                return (
                  <motion.p
                    key={line}
                    className="absolute top-1/2 font-display text-[clamp(1.28rem,2.9vw,2.42rem)] font-[300] leading-[1.45] tracking-[0.04em] text-white/88 sm:text-[clamp(1.45rem,3.39vw,2.77rem)]"
                    style={{
                      opacity: linePhase * (1 - exitProgress * 0.25),
                      y: 18 - linePhase * 18 - (1 - linePhase) * 10 - exitProgress * 18,
                      filter: `blur(${(1 - linePhase) * 4.8}px)`,
                      clipPath: `inset(${(1 - linePhase) * 100}% 0 0 0)`,
                    }}
                  >
                    {line}
                  </motion.p>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-white/72"
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ opacity: indicatorOpacity }}
      >
        <span className="font-display text-[10px] uppercase tracking-[0.28em]">
          {indicatorLabel}
        </span>
        <div className="relative h-12 w-px overflow-hidden bg-white/18">
          <motion.div
            className="absolute left-0 top-0 h-6 w-px bg-white/75"
            animate={{ y: [-18, 48] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </motion.section>
  );
}
