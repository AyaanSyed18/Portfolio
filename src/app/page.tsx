"use client";

import { useState, useCallback } from "react";
import SplineHero from "@/components/SplineHero";
import MagicBento from "@/components/MagicBento";
import BentoSection2 from "@/components/BentoSection2";

/**
 * Main page — orchestrates the cinematic flow:
 * 1. Spline 3D intro animation plays
 * 2. "AYAAN SYED" + "Start" button appear
 * 3. User clicks Start → second animation plays
 * 4. Credits scene (text removed, background kept)
 * 5. Animation finishes → Bento grid revealed
 * 6. Overlay is scrollable — section 2 appears below
 */
export default function Home() {
  const [showBento, setShowBento] = useState(false);

  const handleShowBento = useCallback(() => {
    setShowBento(true);
  }, []);

  return (
    <main className="relative h-screen w-full overflow-hidden">
      {/* ── Hero with Spline 3D ── */}
      <SplineHero onShowBento={handleShowBento} />

      {/* ── Bento Overlay — scrollable once animation ends ── */}
      <div
        className={`
          absolute inset-0 z-20
          transition-all duration-1000 ease-out
          overflow-y-auto overflow-x-hidden
          ${showBento ? "opacity-100 pointer-events-auto bg-black/40 backdrop-blur-md" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* Section 1 — Main 3-card Bento */}
        <div className="min-h-screen md:h-screen flex items-center justify-center p-4 md:p-6 w-full">
          <MagicBento />
        </div>

        {/* Section 2 — Two equal full-height Bento cards */}
        <div className="min-h-screen md:h-screen flex items-center justify-center p-4 md:p-6 w-full">
          <BentoSection2 />
        </div>
      </div>
    </main>
  );
}
