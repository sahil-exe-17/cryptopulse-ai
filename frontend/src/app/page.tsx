"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { useRouter } from "next/navigation";


export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "https://backend-chi-ten-58.vercel.app/login" : "https://backend-chi-ten-58.vercel.app/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      // Save token for future authenticated requests
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <ParticleBackground />
      
      {/* Glow orb behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-crypto-neon/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 box-neon">
          <div className="text-center mb-8">
            <motion.h1 
              className="text-4xl font-bold tracking-tight mb-2 text-neon"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              CryptoPulse AI
            </motion.h1>
            <p className="text-gray-400 text-sm">
              Next-generation AI prediction platform
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-crypto-neon font-medium uppercase tracking-wider">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-crypto-black/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-crypto-neon focus:ring-1 focus:ring-crypto-neon transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs text-crypto-neon font-medium uppercase tracking-wider">Password</label>
                {isLogin && <a href="#" className="text-xs text-gray-400 hover:text-crypto-neon transition-colors">Forgot?</a>}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-crypto-black/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-crypto-neon focus:ring-1 focus:ring-crypto-neon transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className={`w-full bg-crypto-neon text-crypto-black font-semibold rounded-lg py-3 mt-6 shadow-[0_0_15px_rgba(204,255,0,0.4)] hover:shadow-[0_0_25px_rgba(204,255,0,0.6)] transition-shadow ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              type="submit"
            >
              {isLoading ? "Authenticating..." : (isLogin ? "Enter Platform" : "Initialize Account")}
            </motion.button>
          </form>

          {error && <p className="text-red-400 text-sm mt-4 text-center bg-red-900/20 py-2 px-3 rounded border border-red-500/30">{error}</p>}


          <p className="mt-8 text-center text-sm text-gray-400">
            {isLogin ? "New to CryptoPulse?" : "Already have access?"}{" "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }} 
              type="button"
              className="text-crypto-neon hover:underline font-medium"
            >
              {isLogin ? "Request Access" : "Login"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
