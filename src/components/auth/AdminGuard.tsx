"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface AdminGuardProps {
  children: React.ReactNode;
}

const ADMIN_AUTH_KEY = "adminAuth";
const ADMIN_AUTH_EVENT = "admin-auth-updated";

const subscribeAdminAuth = (onStoreChange: () => void) => {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(ADMIN_AUTH_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(ADMIN_AUTH_EVENT, onStoreChange);
  };
};

const getAdminAuthSnapshot = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
};

export default function AdminGuard({ children }: AdminGuardProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isAuthenticated = useSyncExternalStore(
    subscribeAdminAuth,
    getAdminAuthSnapshot,
    () => false
  );

  useEffect(() => {
    const mountId = window.requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(mountId);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "7913") {
      sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
      window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (!isMounted) return null;

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="w-full min-h-screen bg-stone-900 flex flex-col items-center justify-center p-5">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-stone-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-emerald-400" />
        
        <div className="w-16 h-16 bg-stone-700/50 rounded-2xl flex items-center justify-center mb-8 mx-auto">
          <Lock className="w-8 h-8 text-primary" />
        </div>

        <h2 className="text-2xl font-black text-white text-center mb-2 tracking-tight">관리자 로그인</h2>
        <p className="text-sm text-stone-400 text-center mb-8">시스템 설정을 변경하려면 권한이 필요합니다.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">접근 암호</label>
            <input 
              type="password" 
              autoFocus
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="••••"
              className={`w-full bg-stone-900/50 border ${error ? 'border-red-500' : 'border-stone-700'} rounded-xl px-4 py-3 text-white font-bold text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
            />
            {error && <p className="text-red-400 text-xs mt-2 text-center font-medium">암호가 일치하지 않습니다.</p>}
          </div>

          <button 
            type="submit"
            disabled={!password}
            className="w-full py-4 bg-primary text-white font-bold rounded-xl mt-6 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            접속하기
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </motion.div>
    </div>
  );
}
