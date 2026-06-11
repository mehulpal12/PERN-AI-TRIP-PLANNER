"use client";

import React, { useState } from "react";
import { 
  Briefcase, 
  Plus, 
  Terminal, 
  FolderGit2, 
  Cpu, 
  Radio, 
  ExternalLink 
} from "lucide-react";

interface WorkspaceProject {
  id: string;
  name: string;
  engine: string;
  status: "idle" | "active" | "offline";
  updatedAt: string;
}

export function WorkspaceView() {
  const [projects, setProjects] = useState<WorkspaceProject[]>([
    { id: "1", name: "Santushti Hospital Directory", engine: "MERN Framework", status: "active", updatedAt: "2 hours ago" },
    { id: "2", name: "AI Trip Planner Engine", engine: "Next.js / Gemini API", status: "active", updatedAt: "Just now" },
    { id: "3", name: "Vibe Editor Sandbox", engine: "Monaco Engine Stack", status: "idle", updatedAt: "3 days ago" },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* TOP CONFIGURATION WRAPPER HEAD */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Developer Workspace
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Configure code variables, local model sandboxes, and active staging links.
          </p>
        </div>
        
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/10 text-sm self-start sm:self-auto">
          <Plus size={16} />
          New Sandbox
        </button>
      </div>

      {/* CORE WORKSPACE CONTENT BLOCKING GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ACTIVE PROJECT MATRIX (LEFT PANELS) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FolderGit2 size={15} />
            Live Repositories & Modules
          </h3>
          
          <div className="space-y-3">
            {projects.map((project) => (
              <div 
                key={project.id}
                className="bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] p-4 rounded-2xl flex items-center justify-between transition-all group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {project.name}
                    </h4>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      project.status === "active" ? "bg-cyan-400 shadow-sm shadow-cyan-400" : "bg-slate-600"
                    }`} />
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span>{project.engine}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-700" />
                    <span>Updated {project.updatedAt}</span>
                  </p>
                </div>

                <button className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all shrink-0">
                  <ExternalLink size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RUNTIME ENVIRONMENT SYSTEM CONTEXT (RIGHT SIDE PANEL) */}
        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 backdrop-blur-md shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider border-b border-white/[0.04] pb-2.5">
              <Cpu size={15} className="text-cyan-400" />
              Runtime Local Environment
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between bg-black/20 p-2.5 rounded-xl border border-white/[0.02]">
                <span className="text-slate-500">OS Architecture</span>
                <span className="text-slate-300">win32 / x64</span>
              </div>
              <div className="flex justify-between bg-black/20 p-2.5 rounded-xl border border-white/[0.02]">
                <span className="text-slate-500">Local LLM Node</span>
                <span className="text-purple-400">codellama:7b</span>
              </div>
              <div className="flex justify-between bg-black/20 p-2.5 rounded-xl border border-white/[0.02]">
                <span className="text-slate-500">Target Cache Pipeline</span>
                <span className="text-emerald-400">Redis Online</span>
              </div>
            </div>
          </div>

          {/* QUICK TERMINAL STATUS FEED */}
          <div className="bg-black/40 border border-white/[0.05] rounded-3xl p-5 font-mono text-[11px] leading-relaxed text-slate-400 shadow-inner">
            <div className="flex items-center gap-1.5 text-slate-500 mb-2 border-b border-white/[0.04] pb-2">
              <Terminal size={12} />
              <span>Console Stream output</span>
            </div>
            <p className="text-cyan-400/90">[info] Axios custom token intercepts loaded successfully</p>
            <p className="text-slate-500">[cache] MGET global keys mapping synchronized</p>
            <p className="text-slate-500">[system] Thread cluster connected on client runtime container</p>
          </div>
        </div>
      </div>
    </div>
  );
}