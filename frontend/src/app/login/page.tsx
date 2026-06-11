"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Map, Mail, Lock, User, Loader2, AlertCircle, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { API_ROUTES } from "@/config/api";
import { ApiResponse } from "@/types/api.types";

interface AuthPayload {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

type AuthMode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  
  // Access global state triggers from your authentication engine
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.accessToken);

  // Structural Interface Toggle State
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  // Form Field Tracking Status States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // UI Loading & Micro-interaction Orchestration States
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRegisteredSuccessfully, setIsRegisteredSuccessfully] = useState(false);

  // Guard routing: If token already exists in state hydration, bypass security authorization gate
  useEffect(() => {
    if (token) {
      router.push("/dashboard");
    }
  }, [token, router]);

  // Reset transient feedback messages when swapping structural auth modes
  const handleModeSwitch = (mode: AuthMode) => {
    setAuthMode(mode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsRegisteredSuccessfully(false);
  };

  // Unified Handler for Endpoint Processing: POST /login & POST /register
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    // Context determination based on interactive state parameters
    const isLogin = authMode === "login";
    const targetEndpoint = isLogin ? `${API_ROUTES.USERS}/login` : `${API_ROUTES.USERS}/register`;
    
    // Construct transaction payload body safely
    const payloadBody = isLogin 
      ? JSON.stringify({ email, password }) 
      : JSON.stringify({ name, email, password });

    try {
      const response = await fetch(targetEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadBody,
      });

      const result = (await response.json()) as ApiResponse<AuthPayload>;

      if (!response.ok) {
        throw new Error(result.message || `System parameters failed database validation rules during ${authMode}.`);
      }

      // Check validation: Handle successful execution returns containing tokens
      if (result.data?.accessToken) {
        const { user, accessToken, refreshToken } = result.data;
        
        if (!accessToken) {
          throw new Error("Ecosystem Auth Handshake failed: Empty token payload returned.");
        }

        // Sync token variables directly inside your local state engine context
        setAuth(user, accessToken, refreshToken || "");
        
        // Route smoothly into dashboard orchestration viewports
        router.push("/dashboard");
      } else if (!isLogin) {
        // Strict fallback loop for registration pipelines requiring manual email verification handshakes
        setIsRegisteredSuccessfully(true);
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || "An unexpected networking socket drop occurred.";
      console.error(`❌ Authentication Layer Fault (${authMode}):`, msg);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for Endpoint: POST /api/users/resend-verification (with authLimiter)
  const handleResendVerification = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsResending(true);

    try {
      const response = await fetch(`${API_ROUTES.USERS}/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = (await response.json()) as ApiResponse<null>;

      if (!response.ok) {
        throw new Error(result.message || "Failed to dispatch resend handshake authorization.");
      }

      setSuccessMessage(result.message || "Verification gateway link successfully re-dispatched.");
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to re-route verification parameters.";
      console.error("❌ Verification Layer Fault:", msg);
      setErrorMessage(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080c] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Shared Layout visual theme engine component matching system architecture */}
      <AuroraBackground />

      <div className="w-full max-w-md relative z-10">
        {/* Core Card Shield Container */}
        <div className="p-8 bg-[#080a10]/60 backdrop-blur-2xl border border-white/[0.06] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-6">
          
          {/* Workspace Branding Cluster */}
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.25)] mx-auto mb-3">
              <Map size={22} className="text-[#06080c]" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {authMode === "login" ? "Access" : "Initialize"}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">Aether System</span>
            </h1>
            <p className="text-slate-400 text-xs">
              {authMode === "login" 
                ? "Synchronize profile credentials to map trip workspace environments." 
                : "Establish workspace authority parameters to generate AI travel blueprints."}
            </p>
          </div>

          {/* Real-time Validation Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Real-time Verification Handshake Success Banner */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Multi-State UI Dynamic Display Engine */}
          {isRegisteredSuccessfully ? (
            /* Email Verification Holding Interface State (Handles Endpoint: /verify-email/:token pipeline) */
            <div className="p-2 space-y-4 text-center animate-fadeIn">
              <div className="h-10 w-10 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto text-cyan-400">
                <CheckCircle2 size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Verification Link Dispatched</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We have mapped a gateway confirmation handshake route to <span className="text-cyan-400 font-medium">{email}</span>. Please verify your inbox to authorize node activation.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full py-2.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] disabled:bg-transparent disabled:text-slate-600 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="animate-spin" size={13} />
                      <span>Re-routing Verification Token...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={13} />
                      <span>Resend Verification Link</span>
                    </>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => handleModeSwitch("login")} 
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-[#06080c] rounded-xl text-xs font-bold transition-all text-center cursor-pointer border-none"
                >
                  Return to Login Gate
                </button>
              </div>
            </div>
          ) : (
            /* Primary Login/Registration Dynamic Form Formats */
            <>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Conditional Vector: Register Mode Fields */}
                {authMode === "register" && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Identity Label</label>
                    <div className="relative">
                      <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="Mehul Pal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500/40 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-all focus:shadow-[0_0_15px_rgba(34,211,238,0.03)]"
                      />
                    </div>
                  </div>
                )}

                {/* Email Endpoint Field Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Email Endpoint</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500/40 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-all focus:shadow-[0_0_15px_rgba(34,211,238,0.03)]"
                    />
                  </div>
                </div>

                {/* Security Signature Input Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Security Signature</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500/40 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-all focus:shadow-[0_0_15px_rgba(34,211,238,0.03)]"
                    />
                  </div>
                </div>

                {/* Action Submission Key Trigger Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 disabled:from-slate-800 disabled:to-slate-800 text-[#06080c] disabled:text-slate-500 font-bold text-xs rounded-xl transition-all cursor-pointer border-none shadow-[0_4px_20px_rgba(34,211,238,0.15)] disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>
                        {authMode === "login" ? "Authorizing Handshake Node..." : "Provisioning Ecosystem Node..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {authMode === "login" ? "Initialize Security Link" : "Generate Cluster Account"}
                      </span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {/* Navigation Routers Mapping Additional Public Pathways */}
              <div className="pt-2 flex flex-col items-center gap-2.5 text-xs">
                {authMode === "login" ? (
                  <p className="text-slate-500">
                    New to the ecosystem architecture?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeSwitch("register")}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors underline underline-offset-4 bg-transparent border-none p-0 cursor-pointer"
                    >
                      Register Node
                    </button>
                  </p>
                ) : (
                  <p className="text-slate-500">
                    Already have an established framework link?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeSwitch("login")}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors underline underline-offset-4 bg-transparent border-none p-0 cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                )}
                
                <Link href="/forgot-password" className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors">
                  Lost security credentials key? (Forgot Password)
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Outer Minimalist Footer Metadata */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-600">
            Aether Space Core Routing Layer v2.6.0-prod
          </p>
        </div>
      </div>
    </div>
  );
}