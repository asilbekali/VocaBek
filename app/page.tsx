"use client";
import { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { LinearProgress, styled } from "@mui/material";
import {
  checkUserAction,
  sendVocabAction,
  registerUserAction,
} from "./actions";

const BorderLinearProgress = styled(LinearProgress)({
  height: 12,
  borderRadius: 10,
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  [`& .MuiLinearProgress-bar`]: {
    borderRadius: 10,
    background: "linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)",
    boxShadow: "0 0 15px #00f2fe, 0 0 5px #4facfe",
  },
});

const STEPS = [
  {
    key: "word",
    label: "Word",
    placeholder: "Masalan: Instigator",
    icon: "📖",
  },
  {
    key: "definition",
    label: "Definition",
    placeholder: "Inglizcha izohi...",
    icon: "💡",
  },
  {
    key: "example",
    label: "Example",
    placeholder: "Gap ichida...",
    icon: "📝",
  },
  {
    key: "note",
    label: "Uzbek Note",
    placeholder: "O'zbekcha izoh...",
    icon: "🇺🇿",
  },
];

export default function Home() {
  const [adminId, setAdminId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [step, setStep] = useState("check");
  const [error, setError] = useState("");
  const [currentInputStep, setCurrentInputStep] = useState(0);
  const [formData, setFormData] = useState({
    word: "",
    definition: "",
    example: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 25 });

  useEffect(() => {
    const savedAdmin = localStorage.getItem("voca_admin");
    if (savedAdmin) {
      setAdminId(savedAdmin);
      setStep("dashboard");
    }
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const progress = ((currentInputStep + 1) / STEPS.length) * 100;

  const handleAuth = async () => {
    setError("");
    if (!adminId.trim()) return setError("Admin ID kiritish shart!");
    setLoading(true);
    try {
      if (step === "check") {
        const res = await checkUserAction(adminId);
        if (res.exists) {
          localStorage.setItem("voca_admin", adminId);
          setStep("dashboard");
        } else {
          setStep("register");
        }
      } else {
        if (!channelId.startsWith("-100"))
          return setError("ID '-100' bilan boshlanishi kerak!");
        const res = await registerUserAction(adminId, channelId);
        if (res.success) {
          localStorage.setItem("voca_admin", adminId);
          setStep("dashboard");
        } else setError("Xatolik yuz berdi.");
      }
    } catch {
      setError("Server xatosi.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalPost = async () => {
    setLoading(true);
    const savedAdminId = localStorage.getItem("voca_admin") || adminId;
    const rawText = `${formData.word}\n${formData.definition}\n${formData.example}\n${formData.note}`;

    try {
      const res = await sendVocabAction(savedAdminId, rawText);
      if (res.success) {
        setLoading(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setFormData({ word: "", definition: "", example: "", note: "" });
          setCurrentInputStep(0);
        }, 2500);
      } else {
        alert(res.error);
        setLoading(false);
      }
    } catch {
      setLoading(false);
      alert("Xabar yuborishda xatolik!");
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0f1d] flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          style={{ x: springX, y: springY }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 blur-[120px] rounded-full"
        />
        <motion.div
          style={{ x: springY, y: springX }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full"
        />
      </div>

      <AnimatePresence mode="wait">
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1d]/80 backdrop-blur-md"
          >
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_40px_#00f2fe]"
              >
                <motion.svg
                  width="50"
                  height="50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    d="M20 6L9 17l-5-5"
                  />
                </motion.svg>
              </motion.div>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-2xl font-black text-white italic tracking-widest uppercase"
              >
                Yuborildi!
              </motion.p>
            </div>
          </motion.div>
        )}

        {step !== "dashboard" ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="z-20 w-full max-w-sm bg-white/[0.07] backdrop-blur-3xl border border-white/20 p-10 rounded-[40px] shadow-2xl text-center"
          >
            <h1 className="text-4xl font-black mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent italic tracking-tighter">
              VocaBek
            </h1>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Admin ID"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-cyan-500/50 text-center text-white"
              />
              {step === "register" && (
                <input
                  type="text"
                  placeholder="Channel ID (-100...)"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-cyan-500/50 text-center text-white"
                />
              )}
              {error && (
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                  {error}
                </p>
              )}
              <button
                onClick={handleAuth}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all"
              >
                {loading ? "..." : step === "check" ? "KIRISH" : "REGISTER"}
              </button>
              {step === "register" && (
                <button
                  onClick={() => {
                    setStep("check");
                    setError("");
                  }}
                  className="mt-4 text-[10px] font-bold text-white/40 hover:text-cyan-400 uppercase tracking-widest transition-all"
                >
                  ← Login sahifasiga qaytish
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dash"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="z-20 w-full max-w-2xl bg-white/[0.07] backdrop-blur-3xl border border-white/20 p-8 md:p-12 rounded-[50px] shadow-[0_0_50px_rgba(0,242,254,0.15)] flex flex-col"
          >
            <div className="flex justify-between mb-8 px-2">
              {STEPS.map((s, i) => (
                <div key={s.key} className="flex flex-col items-center gap-2">
                  <motion.div
                    animate={{ scale: i === currentInputStep ? 1.2 : 1 }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${i <= currentInputStep ? "bg-cyan-400 text-black shadow-[0_0_15px_#22d3ee]" : "bg-white/10 text-white/40"}`}
                  >
                    {i + 1}
                  </motion.div>
                  <span
                    className={`text-[8px] font-black uppercase tracking-tighter ${i <= currentInputStep ? "text-white" : "text-white/20"}`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center mb-6">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-7xl mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              >
                {STEPS[currentInputStep].icon}
              </motion.div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-widest">
                {STEPS[currentInputStep].label}
              </h2>
            </div>

            <div className="relative h-44 w-full mb-8 bg-black/30 border border-white/10 rounded-[35px] overflow-hidden">
              <textarea
                autoFocus
                className="w-full h-full bg-transparent p-6 text-2xl md:text-3xl outline-none text-center text-white font-bold placeholder:text-white/5 resize-none flex items-center justify-center"
                placeholder={STEPS[currentInputStep].placeholder}
                value={
                  formData[STEPS[currentInputStep].key as keyof typeof formData]
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [STEPS[currentInputStep].key]: e.target.value,
                  })
                }
              />
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                  Progress State
                </span>
                <span className="text-3xl font-black italic text-white">
                  {Math.round(progress)}%
                </span>
              </div>
              <BorderLinearProgress variant="determinate" value={progress} />
            </div>

            <div className="flex gap-4">
              {currentInputStep > 0 && (
                <button
                  onClick={() => setCurrentInputStep((p) => p - 1)}
                  className="px-8 py-4 bg-white/5 rounded-3xl font-bold border border-white/10 text-white uppercase hover:bg-white/10 transition-all"
                >
                  Back
                </button>
              )}
              <button
                onClick={() =>
                  currentInputStep < STEPS.length - 1
                    ? setCurrentInputStep((c) => c + 1)
                    : handleFinalPost()
                }
                disabled={
                  loading ||
                  !formData[
                    STEPS[currentInputStep].key as keyof typeof formData
                  ]
                }
                className="flex-1 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl font-black text-xl tracking-widest text-white shadow-xl active:scale-95 disabled:opacity-20 transition-all uppercase"
              >
                {loading
                  ? "..."
                  : currentInputStep === STEPS.length - 1
                    ? "Jo'natish 🔥"
                    : "Next Step"}
              </button>
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="mt-8 text-[9px] font-bold text-white/20 hover:text-red-400 transition-all uppercase tracking-[5px] text-center"
            >
              Logout System
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <footer className="fixed bottom-6 text-[10px] tracking-[15px] font-black text-white/10 uppercase">
        TA`LIMHUB • 2026
      </footer>
    </div>
  );
}
