"use client";

import { motion } from "framer-motion";

type HeroLandingProps = {
  onComplete: () => void;
};

export default function HeroLanding({ onComplete }: HeroLandingProps) {
  return (
    <motion.section
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#031c03]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/0330.mov"
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.4))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_40%)]" />

      <div className="relative z-10 flex h-screen w-full max-w-6xl flex-col justify-between px-6 py-10 text-white sm:px-10 sm:py-12">
        <div className="pt-4 sm:pt-6">
          <motion.h1
            className="font-display text-[clamp(2rem,6.8vw,5rem)] font-[200] uppercase tracking-[0.08em]"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            SLINGSHOT
          </motion.h1>
        </div>

        <div className="max-w-xl pb-2 sm:pb-4">
          <motion.p
            className="mb-6 font-display text-[clamp(1.05rem,2.5vw,1.6rem)] font-[300] leading-[1.5] tracking-[0.04em] text-white/88"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            우리들의 정원을 함께 가꾸세요
          </motion.p>

          <motion.button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center rounded-full border border-white/30 bg-white/14 px-6 py-3 text-sm font-black uppercase tracking-[0.22em] text-white backdrop-blur-md transition-colors hover:bg-white/22"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.98 }}
          >
            Enter
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}
