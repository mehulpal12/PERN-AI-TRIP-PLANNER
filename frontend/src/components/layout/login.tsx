"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Apple,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/authStore";
import { API_ROUTES } from "@/config/api";
import { ApiResponse } from "@/types/api.types";

interface LoginPayload {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export default function LoginPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".fade-up", {
        opacity: 0,
        y: 40,
        stagger: 0.12,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".login-card", {
        opacity: 0,
        scale: 0.94,
        y: 30,
        duration: 1.2,
        ease: "power4.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 10;
    const rotateX = ((y / rect.height) - 0.5) * -10;

    gsap.to(cardRef.current, {
      rotateX,
      rotateY,
      duration: 0.5,
      ease: "power3.out",
      transformPerspective: 1000,
    });
  };

  const resetCard = () => {
    if (!cardRef.current) return;

    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: "elastic.out(1,0.5)",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegister) {
        const res = await fetch(`${API_ROUTES.USERS}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Registration failed");
        }

        toast.success("Account created successfully! Please check your email to verify.");
        setIsRegister(false);
        setPassword("");
      } else {
        const res = await fetch(`${API_ROUTES.USERS}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = (await res.json()) as ApiResponse<LoginPayload>;
        if (!res.ok) {
          throw new Error(data.message || "Login failed");
        }

        toast.success("Logged in successfully!");
        const { user, accessToken, refreshToken } = data.data;
        useAuthStore.getState().setAuth(user, accessToken, refreshToken);
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen overflow-hidden text-white"
    >
      {/* ================= BACKGROUND ================= */}

      <div className="fixed inset-0 -z-50 pointer-events-none">
        <Image
          src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2070&auto=format&fit=crop"
          alt="Mountain Background"
          fill
          priority
          className="object-cover opacity-40 will-change-transform"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0" />

        {/* Premium Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.25),transparent_45%)]" />

        {/* Bottom Fade */}
        <div className="absolute inset-0 " />

        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] " />
      </div>

      {/* Glow */}
      <div className="absolute left-[-120px] top-[-120px] h-[300px] w-[300px] rounded-full " />

      <div className="absolute bottom-[-120px] right-[-120px] h-[350px] w-[350px] rounded-full" />

      {/* ================= CONTENT ================= */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-10 text-center">
            <div className="fade-up mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_45px_rgba(34,211,238,0.5)]">
              <Sparkles className="h-8 w-8 text-white" />
            </div>

            <h1 className="fade-up text-4xl font-black tracking-tight">
              Aether Travel
            </h1>

            <p className="fade-up mt-3 text-sm text-slate-400">
              AI Powered Luxury Travel Planning
            </p>
          </div>

          {/* Card */}
          <div
            className="perspective-[1200px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={resetCard}
          >
            <motion.div
              ref={cardRef}
              className="login-card relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            >
              {/* Card Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-blue-500/10" />

              <div className="relative z-10">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold">
                    {isRegister ? "Create Account" : "Welcome Back"}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    Continue your premium AI travel experience
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {isRegister && (
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Full Name
                      </label>

                      <div className="group relative">
                        <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" />

                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Alex Mercer"
                          className="h-14 w-full rounded-2xl border border-white/10 bg-[#0B1220]/80 pl-12 pr-4 outline-none transition-all focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Email Address
                    </label>

                    <div className="group relative">
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" />

                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="alex@aether.com"
                        className="h-14 w-full rounded-2xl border border-white/10 bg-[#0B1220]/80 pl-12 pr-4 outline-none transition-all focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="mb-2 flex justify-between">
                      <label className="text-sm text-slate-300">
                        Password
                      </label>

                      {!isRegister && (
                        <button
                          type="button"
                          className="text-sm text-cyan-400 hover:text-cyan-300"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>

                    <div className="group relative">
                      <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400" />

                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="h-14 w-full rounded-2xl border border-white/10 bg-[#0B1220]/80 pl-12 pr-4 outline-none transition-all focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20"
                      />
                    </div>
                  </div>

                  {/* Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={isLoading}
                    className="group mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 font-semibold shadow-[0_10px_40px_rgba(14,165,233,0.45)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : isRegister ? (
                      "Create Account"
                    ) : (
                      "Continue to Planner"
                    )}

                    {!isLoading && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>

                  <div className="relative flex justify-center">
                    <span className="bg-[#0B1220] px-4 text-xs uppercase tracking-[0.3em] text-slate-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social */}
                {/* <div className="grid grid-cols-2 gap-4">
                  <button className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10">
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      alt="Google"
                      className="h-5 w-5"
                    />

                    Google
                  </button>

                  <button className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10">
                    <Apple className="h-5 w-5" />

                    Apple
                  </button>
                </div> */}

                {/* Footer */}
                <p className="mt-8 text-center text-sm text-slate-400">
                  {isRegister
                    ? "Already have an account?"
                    : "New to Aether?"}{" "}
                  <span
                    onClick={() => {
                      setIsRegister(!isRegister);
                      setName("");
                      setPassword("");
                    }}
                    className="cursor-pointer font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    {isRegister ? "Sign In" : "Create Account"}
                  </span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
