"use client";
import React from "react";

export const AuroraBackground: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
    <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 h-[900px] w-[900px] rounded-full bg-cyan-500/10 blur-[160px] opacity-50 mixing-blend-screen" />
    <div className="absolute top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-sky-500/5 blur-[130px] opacity-30" />
  </div>
);