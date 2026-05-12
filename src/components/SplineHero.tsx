"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { Application } from "@splinetool/runtime";

/**
 * Next.js intercepts all console.error calls and shows a full-screen dev overlay.
 * Spline's internal WebGL animation engine sometimes throws a harmless "Missing property" 
 * error when building state timelines (e.g. if an animated property was deleted in the Spline Editor).
 * This intercepts and suppresses that specific error so it doesn't break the dev experience.
 */
if (typeof window !== "undefined") {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("Missing property")) {
      return; // Suppress Spline internal warning
    }
    originalConsoleError.apply(console, args);
  };
}

/**
 * Dynamically import Spline to prevent SSR hydration errors.
 */
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#050505] flex items-center justify-center z-0">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        <p className="text-white/40 text-sm tracking-widest uppercase font-light">
          Loading Experience
        </p>
      </div>
    </div>
  ),
});

const SCENE_URL =
  "https://prod.spline.design/2Dxqn0TaIwLHgajG/scene.splinecode";

/**
 * Hero phase state machine:
 *
 *   loading → intro → title-visible → clicked-start → credits-scene → scroll-ready
 *
 * - loading:        Spline is downloading
 * - intro:          Initial 3D animation plays (AYAAN SYED hidden, NOSTALGHIA hidden)
 * - title-visible:  "AYAAN SYED" and "Start" button appear (before "New game" in Spline)
 * - clicked-start:  User clicked Start → second Spline animation plays
 * - credits-scene:  Credits scene reached → credit text hidden, background kept
 * - scroll-ready:   User can scroll to bento grid
 */
type HeroPhase =
  | "loading"
  | "intro"
  | "title-visible"
  | "clicked-start"
  | "credits-scene"
  | "scroll-ready";

/**
 * How long the initial intro animation plays before showing "AYAAN SYED" + "Start".
 * This should be tuned to the moment just before the "New game" button appears in Spline.
 */
const INTRO_DURATION_MS = 12000;

/**
 * How long after clicking "Start" before the credits scene is reached.
 * This is the duration of the second Spline animation.
 */
const SECOND_ANIM_DURATION_MS = 10000;

export default function SplineHero({
  onShowBento,
}: {
  onShowBento: () => void;
}) {
  const [phase, setPhase] = useState<HeroPhase>("loading");
  const splineApp = useRef<Application | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);

  /**
   * Called when the Spline scene finishes loading.
   * Hides the original "NOSTALGHIA" title and "New game" button immediately.
   */
  const onLoad = useCallback((app: Application) => {
    splineApp.current = app;

    // Hide the original NOSTALGHIA title — we overlay our own
    const hideObjects = ["TITLE"];
    for (const name of hideObjects) {
      try {
        const obj = app.findObjectByName(name);
        if (obj) {
          obj.visible = false;
          console.log(`[Spline] Hidden: "${name}"`);
        }
      } catch {
        // skip
      }
    }

    // Listen to Spline native click events on the application instance
    app.addEventListener("mouseDown", (e: { target?: { name?: string } }) => {
      console.log("[Spline] MouseDown Event Fired! Target:", e.target?.name);
      const targetName = e.target?.name?.toLowerCase() || "";
      
      // The raycaster might hit the specific mesh inside the button group (like 'Rectangle')
      if (
        targetName === "new game" || 
        targetName === "rectangle" ||
        targetName === "text 2" ||
        targetName === "start"
      ) {
        setPhase("clicked-start");

        // After the second animation plays, transition to credits scene
        timerRef.current = setTimeout(() => {
          setPhase("credits-scene");

          // Attempt to clear the Spline variable once (to avoid console spam)
          if (splineApp.current) {
            try {
              splineApp.current.setVariable("credits", "");
            } catch {
              // skip
            }
          }

          // Use an interval to persistently hide credits in case Spline keyframes re-enable them
          hideIntervalRef.current = setInterval(() => {
            if (splineApp.current) {

              const creditsObjects = [
                "Text",
                "Thanks For Playing",
                "Directed By",
                "Credits",
                "credits",
                "TITLE",
                "New game",
                "new game",
              ];
              for (const name of creditsObjects) {
                try {
                  const obj = splineApp.current.findObjectByName(name);
                  if (obj && obj.visible) {
                    obj.visible = false;
                    if (obj.position) obj.position.y = -9999;
                    console.log(`[Spline] Persistently hidden object: "${name}"`);
                  }
                } catch {
                  // skip
                }
              }
            }
          }, 100);

          setPhase("credits-scene");
          onShowBento();
        }, SECOND_ANIM_DURATION_MS);
      }
    });

    setPhase("intro");

    // After the intro animation duration, show our title
    timerRef.current = setTimeout(() => {
      setPhase("title-visible");
    }, INTRO_DURATION_MS);
  }, []);

  // Removed generic React DOM handleMouseDown callback

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideIntervalRef.current) clearInterval(hideIntervalRef.current);
    };
  }, []);

  // Determine what overlay elements to show
  const showTitle = phase === "title-visible";

  return (
    <section
      ref={heroRef}
      id="hero-section"
      className="relative w-full h-full overflow-hidden"
      style={{
        zIndex: 1,
      }}
    >
      {/* ── Dark base background ── */}
      <div className="absolute inset-0 bg-[#050505] z-0" />

      {/* ── Spline 3D Scene (always visible, stays at final frame) ── */}
      <div className="absolute inset-0 z-10">
        <Spline
          scene={SCENE_URL}
          onLoad={onLoad}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {/* ── "AYAAN SYED" title overlay (Aphrodite Slim font) ── */}
      <div
        className={`
          absolute inset-0 z-20 flex flex-col items-center justify-center 
          pointer-events-none transition-all duration-1000 ease-out
          ${showTitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      >
        <h1
          className="text-white whitespace-nowrap select-none hero-title"
          style={{
            fontFamily: "'AphroditeSlim', 'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(3rem, 8vw, 8rem)",
            fontWeight: 300,
            letterSpacing: "0.25em",
            textShadow:
              "0 0 80px rgba(255,255,255,0.12), 0 0 160px rgba(255,255,255,0.04)",
          }}
        >
          AYAAN SYED
        </h1>
      </div>

    </section>
  );
}
