"use client";

import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export function PremiumAnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 30, stiffness: 100 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Parallax transformations that don't trigger React re-renders when passed to motion.div style
  const dx = useTransform(springX, [0, 1], [-20, 20]);
  const dy = useTransform(springY, [0, 1], [-20, 20]);
  const dx1 = useTransform(springX, [0, 1], [-40, 40]);
  const dy1 = useTransform(springY, [0, 1], [-40, 40]);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return <div className="fixed inset-0 bg-[#050505]" />;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050505]">
      {/* 1. Futuristic Grid Pattern - Uses CSS animation for scrolling */}
      <motion.div 
        className="absolute inset-0 opacity-[0.03] animate-grid-scroll"
        style={{
          backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.2) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          x: dx,
          y: dy,
        }}
      />

      {/* 2. Aurora-like Gradients - Heavy blur items */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-1/4 -left-1/4 h-[150%] w-[150%] opacity-30 blur-[120px] animate-aurora-slow will-change-transform"
          style={{
            background: `radial-gradient(circle at center, rgba(34, 211, 238, 0.25), rgba(59, 130, 246, 0.15), rgba(236, 72, 153, 0.1), transparent 70%)`,
            x: dx1,
            y: dy1,
          }}
        />
        <motion.div 
          className="absolute -bottom-1/4 -right-1/4 h-[150%] w-[150%] opacity-30 blur-[120px] animate-aurora-reverse will-change-transform"
          style={{
            background: `radial-gradient(circle at center, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.15), rgba(34, 211, 238, 0.1), transparent 70%)`,
            x: dx,
            y: dy,
          }}
        />
      </div>

      {/* 3. Glowing Cyan Light Streaks - Pure CSS animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={`streak-${i}`}
            className="absolute h-px w-[800px] bg-gradient-to-r from-transparent via-accent-cyan/60 to-transparent animate-streak will-change-transform"
            style={{
              top: `${20 + i * 15}%`,
              left: '-800px',
              transform: 'rotate(-35deg)',
              animationDelay: `${i * 3.5}s`,
              animationDuration: `${14 + i * 2}s`
            }}
          />
        ))}
      </div>

      {/* 4. Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full bg-white opacity-0 animate-float-particle"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: `0 0 10px rgba(34, 211, 238, 0.8)`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* 5. Energy Pulses */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full border border-accent-cyan/10 blur-[60px] animate-pulse-slow pointer-events-none" />

      {/* Vignette Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505] opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
