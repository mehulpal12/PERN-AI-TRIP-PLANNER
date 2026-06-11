"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
  Variants
} from "framer-motion";
import {
  LayoutDashboard, Compass, Sparkles, Users, Settings, Plus,
  HelpCircle, LogOut, Bot, UserPlus, Plane, Train, Hotel,
  CheckCircle2, MoreVertical, ChevronRight, Send, Paperclip,
  MessageSquare, Home, User, PlusCircle, MapPin, Map,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─────────────────────────── Types ─────────────────────────── */
interface Destination {
  id: string;
  dayNumber: string;
  title: string;
  dateRange: string;
  image: string;
  imageAlt: string;
  cardTitle: string;
  description: string;
  tag: string;
  amenities: { icon: React.ReactNode; label: string }[];
  aiOptimized?: boolean;
  accentColor: "cyan" | "sky";
}

interface ChatMessage {
  id: string;
  author: string;
  avatar: string;
  text: string;
  mine?: boolean;
}

/* ─────────────────────────── Data ─────────────────────────── */
const DESTINATIONS: Destination[] = [
  {
    id: "tokyo",
    dayNumber: "01",
    title: "Arrival in Tokyo",
    dateRange: "July 15 – July 18",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD3DvQqBqx2T2QdHoo6LDQpjA_rfJkRPzFfM47B9CMwZoe_N104oBI-YRBqfNNE4a1YyreU3L7PKtpxan-Ey36_d3IuHn3nniNJYQojVZI8f2dkJlNpZbQwCploE8_c5pSnqDhCAlCNyyqs8tKQQn3bNyIApCY3DGm8Om6wsNOeIQ8WfqtgC9EbW4_H6l9ti0wLg1PcJG8og8_LAbRzDidQFNAJZhh7zgVzgQC-G5lvwWzCuvNC5OMIi8vjQLgB2MSIxOuGa3VAIw",
    imageAlt: "Tokyo Shibuya crossing at night with neon reflections",
    cardTitle: "Shinjuku & Shibuya District",
    description:
      "Exploration of Tokyo's neon heart. Visit Meiji Shrine, followed by a luxury dinner in Roppongi Hills.",
    tag: "Destination 1",
    amenities: [
      { icon: <Hotel size={13} />, label: "Park Hyatt Tokyo" },
      { icon: <Plane size={13} />, label: "NRT 14:30" },
    ],
    accentColor: "cyan",
  },
  {
    id: "kyoto",
    dayNumber: "02",
    title: "Kyoto Heritage",
    dateRange: "July 19 – July 23",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuApLCKrQLptKFCNFLIPOPUKtwiMs1MXZzdnsdRcajNqlh73IReCS4_4xjr3BKtx8tDFP3DXnvw36hH8HyXWmMlpR7QbR7xudnucr_yBGHsikKvP4-VkmAkMOrn3TNyQQFyziTPJtZ1Nr54b7gcQwDPkUEpNjiSzUWPjk3tgLiHldCg3e38dzXimlIv4VqeCbeSD3Uzv8O2GtKOKTsf6NHkLN3Xx0FluAH1Qyo7E336rsQtGT_J-yIFkKTBfjVqW0hlsgCpkrZPaxQ",
    imageAlt: "Arashiyama bamboo grove in soft morning light, Kyoto",
    cardTitle: "Arashiyama & Gion",
    description:
      "Private tea ceremony in Gion, followed by a sunrise walk through the Bamboo Grove and Tenryu-ji Temple.",
    tag: "Destination 2",
    amenities: [
      { icon: <Train size={13} />, label: "Shinkansen Nozomi" },
    ],
    aiOptimized: true,
    accentColor: "sky",
  },
];

const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    author: "Alex Rivera",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBd4DA8nsv-nnlq5aJcRIUItwetyBDkt1w9k5JJ7mtheF0xZAI191CMt5-7GEVnhzxhnG0V9zqesayPeCP4h-lHOQ5XzQoY83P-IECzwS6buFmK27CcCiuL2g0o3CodQT_9jm-AIxGLQhtPse7R2aTK1IYeOuGik1OMn2XAh_kP4w9oc9kR-Ai8Iu7_WGBMDJsLvjH2jw8ZMyHzESQuSgHH5Jd_zZwBMlF-kJbUZbtnAlfnAjgKeNJ6xzY5NF0ILxaJADUhMzq1Ug",
    text: "Hey guys, just added the Park Hyatt to Tokyo. It's iconic!",
    mine: false,
  },
  {
    id: "m2",
    author: "Sarah Chen",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDIQ5g4vf3GGD_aXNVNsA-SslHOpZ2HZCmbRl0wGcA-jrJTA5tKQR6DV1cz457Xk4XWbIOb0nm0mQpm7oPdWPsertTln3FmZ8BsDLDxvSqM8JDcWJ47JX2pJjRDY72tlBljh6glPwrWBkOIQPbK2IfZ1_49CsTm-KotkRq7AK3hxpy8RKrZHioZKxNMgLyIA82wLJe-lpgSosQS4qQbG_9E1FShcFn9UTLtFQV-tACCkzMQuP57vAzyXfuakK_WzZH9RoyzW1XFnQ",
    text: "Love it. Can we make sure to hit the teamLab exhibition too?",
    mine: true,
  },
];

const TABS = ["Timeline", "Map View", "Expenses", "Documents"] as const;
type Tab = (typeof TABS)[number];

const COLLABORATOR_IMGS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC6kbFpg1gG_XK76fdlWlCFUua6aknZyw4sNRneDZj4VW90XOxzNXCuhdCWkQE2HdNOp0PvVUgb7_eQhfzZXrB44tNiZQPmWc97yDpLbghiPF9H3lJdq7_lRxdE43LyEz02mjpGYlHPz5qF-KWPTEbY8AlbmOxfdWv5j4U6wi_FCqz0kA1TnN-n-1KbmPv-JzDfCzafCiZrd5mpOfkKH0vQ6G-llZ5zpiRFM_nfs6cF8HlBbv3Vz08qsE2uwH-aYP06cnjrW0Sh2A",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCMjae2ivzqeUuhw02omy-g5Xit6edDXBzaE2NtT4cAcfRqd8Jq3iWmeKvsZ4tQZN0Jl7elc-x9HG43P4kYdbxXXcp_kvgqFfhYqoSK3VN8ZNyIcoq0_f2ZrlJtkJVRfqM9RZnQpcR14AzzVc1IOkr1wDqi7986Fvc13ZUleAjXOBgU9eDBXr62LV0grC9O26B8uK0GC53f0kNcARyCqvFbErRXwyKqZZcNm1byQnIiD4lRS9q27XfSBzuRMn4nhtQIpB6KS6qCow",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAvdsq321cGOYAnb7mpWaEyY89TZ7NDfYei6-L1URqRqhtJ5FNsIM1pPwmknQuMbohG3Q49Z1GLab6bTAs_TYosmAUn6n_oa6Pd_RD5WLepdujAEIZ15dLZycCoWf_xKWa4W4NS_ZbbppshHFHu7Ypfx5WRwu8sm0U2NYVcCcxS25iJE0IlSEPuuN_5BHwh54wLuayq50237MBrkirBA4jT-P-wwgAUdN-yldQiYpLfRPIEhLwjlVubewxK98-i_lIXHvD4-RgEzw",
];

/* ─────────────────────────── Animation variants ─────────────────────────── */
const fadeUp:Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const slideIn:Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─────────────────────────── Sub-components ─────────────────────────── */

/** Parallax hero */
const HeroSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, 80]);

  return (
    <section ref={ref} className="relative h-[420px] w-full overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgtI5VYoYjNTk9nu_laGFqfmFZ4VcJayC96ly3-zHJiO4jeNqKEyIOcFx7LdvDvLGk8xhg3waG535EpJ2kBeY_fN8NzFs1bQGPx7fll_oo9WssSNLIMrM1mdS5EFF_baSEQ4TOs2CUXjbj83DlWHO8IK3bTCkB5V4Slb53Ugxnfo2Fljc9NjHm46UM1jaENVPm1BWSa5XkSCEmE6yG22lCicCIyg"
          alt="Summer in Japan — pagoda with cherry blossoms"
          fill
          priority
          className="object-cover"
        />
      </motion.div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070910]/30 to-[#070910]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070910]/60 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-cyan-500/15 text-cyan-300 text-[11px] font-bold rounded-full border border-cyan-500/30 uppercase tracking-widest">
              Ongoing
            </span>
            <span className="text-slate-400 text-xs">Jul 15 — Aug 02, 2024</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white tracking-tight mb-5 leading-none">
            Summer in Japan
          </h1>
          {/* Collaborators */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {COLLABORATOR_IMGS.map((src, i) => (
                <div
                  key={i}
                  className="relative h-9 w-9 rounded-full border-2 border-[#070910] overflow-hidden"
                >
                  <Image src={src} alt={`Collaborator ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
              <div className="h-9 w-9 rounded-full border-2 border-[#070910] bg-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-300">
                +2
              </div>
            </div>
            <span className="text-slate-500 text-xs">5 collaborators</span>
          </div>
        </motion.div>

        {/* Hero actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-md text-cyan-300 text-sm font-medium hover:bg-white/[0.1] transition-colors"
          >
            <UserPlus size={15} />
            <span className="hidden md:inline">Invite Members</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 0 32px rgba(0,209,255,0.3)" }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-[#070910] text-sm font-bold shadow-[0_0_20px_rgba(0,209,255,0.2)] transition-all"
          >
            <Sparkles size={15} />
            Generate AI Plan
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

/** Tab bar */
const TabBar: React.FC<{ active: Tab; onChange: (t: Tab) => void }> = ({ active, onChange }) => (
  <div className="px-6 md:px-12 py-6">
    <div className="flex items-center gap-1 border-b border-white/[0.06] w-full">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`relative pb-4 px-4 text-sm font-medium transition-colors duration-200 ${
            active === tab ? "text-cyan-300" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {tab}
          {active === tab && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full"
            />
          )}
        </button>
      ))}
    </div>
  </div>
);

/** Destination card in timeline */
const DestinationCard: React.FC<{ dest: Destination; index: number }> = ({ dest, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative pl-14"
    >
      {/* Timeline node */}
      <div
        className={`absolute left-0 top-0 w-11 h-11 rounded-full flex items-center justify-center z-10 border-2 bg-[#070910] font-bold text-sm ${
          dest.accentColor === "cyan"
            ? "border-cyan-400 text-cyan-300"
            : "border-sky-400 text-sky-300"
        }`}
      >
        {dest.dayNumber}
      </div>

      <div className="flex flex-col gap-4">
        {/* Day header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{dest.title}</h3>
          <span className="text-slate-500 text-xs">{dest.dateRange}</span>
        </div>

        {/* Card */}
        <motion.div
          whileHover={{ y: -3, borderColor: "rgba(0,209,255,0.3)" }}
          transition={{ duration: 0.25 }}
          className="group rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl cursor-pointer flex flex-col md:flex-row transition-all duration-300"
        >
          {/* Image */}
          <div className="relative w-full md:w-64 h-52 md:h-auto flex-shrink-0 overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.07 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full h-full min-h-[208px]"
            >
              <Image
                src={dest.image}
                alt={dest.imageAlt}
                fill
                className="object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#070910]/20" />
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] text-white font-bold uppercase tracking-widest">
              {dest.tag}
            </div>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors duration-200">
                  {dest.cardTitle}
                </h4>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-slate-500 hover:text-cyan-400 transition-colors"
                >
                  <MoreVertical size={18} />
                </motion.button>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{dest.description}</p>
            </div>

            {/* Amenities row */}
            <div className="mt-5 flex items-center flex-wrap gap-4">
              {dest.amenities.map((a, i) => (
                <div key={i} className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <span className="text-slate-400">{a.icon}</span>
                  {a.label}
                </div>
              ))}
              {dest.aiOptimized && (
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold ml-auto">
                  <CheckCircle2 size={12} className="fill-cyan-400" />
                  AI Optimized
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

/** AI Assistant panel */
const AIAssistantPanel: React.FC = () => {
  const [query, setQuery] = useState("");
  return (
    <motion.div
      variants={slideIn}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] backdrop-blur-xl p-6 flex flex-col gap-4 relative overflow-hidden"
    >
      <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-cyan-500 flex items-center justify-center shadow-[0_0_16px_rgba(0,209,255,0.35)]">
          <Bot size={18} className="text-[#070910]" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Aether AI Assistant</h4>
          <p className="text-[11px] text-cyan-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,209,255,0.9)]" />
            Connected & Ready
          </p>
        </div>
      </div>

      {/* AI suggestion bubble */}
      <div className="rounded-xl bg-[#070910]/60 border border-white/[0.06] p-4 text-sm text-slate-300 leading-relaxed italic">
        &quot;I&apos;ve noticed a gap in your Kyoto itinerary for July 21st. Would you like me to suggest exclusive Kaiseki dining or a private Fushimi Inari-taisha tour?&quot;
      </div>

      {/* Quick actions */}
      <div className="flex flex-col gap-2">
        {["Suggest dining in Kyoto", "Optimize travel route"].map((label) => (
          <motion.button
            key={label}
            whileHover={{ x: 3 }}
            className="w-full py-2.5 px-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-sm text-slate-300 flex justify-between items-center transition-all duration-200"
          >
            {label}
            <ChevronRight size={14} className="text-slate-500" />
          </motion.button>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Ask Aether…"
          className="w-full bg-[#070910]/80 border border-white/[0.08] rounded-xl px-4 py-3 pr-12 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <Send size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

/** Collaboration chat panel */
const CollaborationChat: React.FC = () => {
  const [draft, setDraft] = useState("");
  return (
    <motion.div
      variants={slideIn}
      custom={1}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-6 flex flex-col gap-4 h-[420px]"
    >
      <h4 className="text-sm font-bold text-white flex items-center gap-2">
        <MessageSquare size={16} className="text-slate-400" />
        Trip Discussion
      </h4>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        {CHAT_MESSAGES.map((msg, i) => (
          <motion.div
            key={msg.id}
            variants={fadeUp}
            custom={i}
            initial="hidden"
            animate="visible"
            className={`flex items-start gap-3 ${msg.mine ? "flex-row-reverse" : ""}`}
          >
            <div className="relative h-8 w-8 flex-shrink-0 rounded-full overflow-hidden">
              <Image src={msg.avatar} alt={msg.author} fill className="object-cover" />
            </div>
            <div
              className={`max-w-[75%] rounded-2xl p-3 text-sm leading-relaxed ${
                msg.mine
                  ? "bg-cyan-500/15 border border-cyan-500/20 rounded-tr-none"
                  : "bg-white/[0.05] border border-white/[0.06] rounded-tl-none"
              }`}
            >
              <p className="text-[10px] font-bold text-cyan-400 mb-1">{msg.author}</p>
              <p className="text-slate-300">{msg.text}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] pt-4 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          type="text"
          placeholder="Add a comment…"
          className="flex-1 bg-[#070910]/80 border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-9 w-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-white/[0.1] transition-all"
        >
          <Paperclip size={15} />
        </motion.button>
      </div>
    </motion.div>
  );
};

/** Sidebar nav item */
const SideNavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
}> = ({ icon, label, active, danger }) => (
  <motion.a
    href="#"
    whileHover={{ x: 3 }}
    whileTap={{ scale: 0.97 }}
    className={[
      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
      active
        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20"
        : danger
        ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]",
    ].join(" ")}
  >
    <span className={active ? "text-cyan-400" : ""}>{icon}</span>
    {label}
    {active && (
      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,209,255,0.8)]" />
    )}
  </motion.a>
);

/* ─────────────────────────── Page ─────────────────────────── */
const JapanItineraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Timeline");

  /* GSAP timeline connector line draw */
  const lineRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!lineRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0, transformOrigin: "top center" },
        {
          scaleY: 1,
          duration: 1.4,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: lineRef.current,
            start: "top 80%",
            end: "bottom 20%",
            scrub: 0.5,
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const navLinks = [
    { icon: <LayoutDashboard size={17} />, label: "Dashboard" },
    { icon: <Compass size={17} />, label: "My Trips", active: true },
    { icon: <Sparkles size={17} />, label: "AI Planner" },
    { icon: <Users size={17} />, label: "Collaborators" },
    { icon: <Settings size={17} />, label: "Settings" },
  ];

  return (
    <div className="relative min-h-screen bg-[#070910] text-white overflow-x-hidden font-sans">
      {/* Aurora */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />
        <div className="absolute top-1/2 -right-1/4 h-[500px] w-[500px] rounded-full bg-sky-600/[0.04] blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,209,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,255,1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* ── Header ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-[68px] flex items-center justify-between px-6 md:px-12 border-b border-white/[0.06] bg-[#070910]/80 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center">
            <Map size={15} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Aether<span className="text-cyan-400">.</span>
          </span>
        </motion.div>

        <nav className="hidden md:flex gap-1">
          {["Destinations", "Itineraries", "AI Assistant", "Community"].map((item, i) => (
            <motion.a
              key={item}
              href="#"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i + 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                item === "Itineraries"
                  ? "text-cyan-400 border-b-2 border-cyan-400 rounded-none pb-1"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
              }`}
            >
              {item}
            </motion.a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="hidden md:block px-5 py-2 rounded-xl bg-cyan-500 text-[#070910] text-sm font-bold shadow-[0_0_16px_rgba(0,209,255,0.2)] hover:bg-cyan-400 transition-colors"
          >
            Start Planning
          </motion.button>
          <button className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
            Sign In
          </button>
        </div>
      </header>

      <div className="flex pt-[68px]">
        {/* ── Sidebar ── */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="hidden md:flex fixed top-[68px] left-0 h-[calc(100vh-68px)] w-64 flex-col p-5 bg-[#070910]/92 backdrop-blur-2xl border-r border-white/[0.06] z-40"
        >
          {/* Profile */}
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="relative h-10 w-10 rounded-full overflow-hidden border border-cyan-500/20">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyG0TBL_UC_5bIBEolQwbsOF2vjVucVpLTuyjvZiMg8vpjgJIafr85jtm9D72rn3EJvr5Hrko0RzxSMiDa4Y9ztMN2S8W6rG-UftBcyG2HIZQnG6AkyFwGcEBjBuSp3_RJC8UU1Ic5k00CnQxYN848KdtunnlHjB1SWDUT0b39_FTijC5MPu1jeqdPaq_MXTKEWpFRxFQ8XbzrPgbHsBB7aEWmGcpvTWOYynOdu5LtI5Wv21w0hitxYtmmqD8GGW4PdFGQob4jxw"
                alt="Alex Rivera"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Alex Rivera</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Pro Explorer</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navLinks.map((n) => (
              <SideNavItem key={n.label} {...n} />
            ))}
          </nav>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 28px rgba(0,209,255,0.22)" }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 mb-5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-[#070910] text-sm font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={15} />
            New Trip
          </motion.button>

          <div className="border-t border-white/[0.06] pt-3 space-y-1">
            <SideNavItem icon={<HelpCircle size={17} />} label="Support" />
            <SideNavItem icon={<LogOut size={17} />} label="Logout" danger />
          </div>
        </motion.aside>

        {/* ── Main ── */}
        <main className="relative z-10 flex-1 md:ml-64 pb-24">
          <HeroSection />
          <TabBar active={activeTab} onChange={setActiveTab} />

          <AnimatePresence mode="wait">
            {activeTab === "Timeline" && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Timeline left */}
                <div className="lg:col-span-8 space-y-10 relative">
                  {/* Vertical line */}
                  <div
                    ref={lineRef}
                    className="absolute left-[21px] top-4 bottom-4 w-0.5 origin-top"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(0,209,255,0.6) 0%, rgba(0,78,96,0.2) 100%)",
                    }}
                  />

                  {DESTINATIONS.map((dest, i) => (
                    <DestinationCard key={dest.id} dest={dest} index={i} />
                  ))}

                  {/* Add destination */}
                  <motion.button
                    whileHover={{ borderColor: "rgba(0,209,255,0.35)", color: "#67e8f9" }}
                    className="ml-14 w-full py-4 border-2 border-dashed border-white/[0.08] rounded-2xl text-slate-500 text-sm flex items-center justify-center gap-2 group transition-all duration-200"
                  >
                    <PlusCircle
                      size={18}
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                    Add Destination
                  </motion.button>
                </div>

                {/* Right sidebar */}
                <div className="lg:col-span-4 space-y-5">
                  <AIAssistantPanel />
                  <CollaborationChat />
                </div>
              </motion.div>
            )}

            {activeTab !== "Timeline" && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="px-6 md:px-12 py-16 flex flex-col items-center justify-center gap-4 text-slate-500"
              >
                <MapPin size={36} className="opacity-30" />
                <p className="text-sm">{activeTab} view — coming soon</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex justify-around items-center px-4 py-3 bg-[#070910]/95 backdrop-blur-2xl border-t border-white/[0.07]">
        {[
          { icon: <Home size={22} />, label: "Home" },
          { icon: <Compass size={22} />, label: "Trips", active: true },
          { icon: <Bot size={22} />, label: "AI" },
          { icon: <User size={22} />, label: "Profile" },
        ].map((item) => (
          <motion.a
            key={item.label}
            href="#"
            whileTap={{ scale: 0.88 }}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
              item.active ? "text-cyan-400 bg-cyan-500/10" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </motion.a>
        ))}
      </nav>

      {/* ── Footer ── */}
      <footer className="relative z-10 md:ml-64 border-t border-white/[0.06] bg-[#070910]/80 backdrop-blur-xl px-6 md:px-12 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center">
              <Map size={11} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">Aether Travel</span>
          </div>
          <p className="text-slate-600 text-xs">© 2024 Aether Travel Technologies. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-6">
          {["Privacy Policy", "Terms of Service", "Cookie Settings", "Global Support"].map((link) => (
            <motion.a
              key={link}
              href="#"
              whileHover={{ color: "#22d3ee" }}
              className="text-slate-500 text-xs hover:text-cyan-400 transition-colors duration-200"
            >
              {link}
            </motion.a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default JapanItineraryPage;