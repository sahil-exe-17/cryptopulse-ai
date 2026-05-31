"use client";

import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  LineChart, 
  BrainCircuit, 
  PieChart, 
  Newspaper, 
  Fish, 
  Settings,
  Bell,
  Search,
  Menu,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Market Explorer", href: "/dashboard/market", icon: LineChart },
  { name: "AI Prediction Lab", href: "/dashboard/predictions", icon: BrainCircuit },
  { name: "Portfolio", href: "/dashboard/portfolio", icon: PieChart },
  { name: "News Intelligence", href: "/dashboard/news", icon: Newspaper },
  { name: "Whale Tracker", href: "/dashboard/whales", icon: Fish },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [profileInitial, setProfileInitial] = useState("U");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("https://backend-chi-ten-58.vercel.app/profile", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const name = data.display_name || data.email || "U";
          setProfileInitial(name.charAt(0).toUpperCase());
        }
      } catch (err) {
        console.error("Failed to fetch profile in layout", err);
      }
    };
    fetchProfile();
  }, []);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput("");
    setIsTyping(true);

    const lowerInput = userMsg.toLowerCase();
    let coinToPredict = "";
    if (lowerInput.includes("btc") || lowerInput.includes("bitcoin")) coinToPredict = "BTC";
    else if (lowerInput.includes("eth") || lowerInput.includes("ethereum")) coinToPredict = "ETH";
    else if (lowerInput.includes("sol") || lowerInput.includes("solana")) coinToPredict = "SOL";
    else if (lowerInput.includes("ada") || lowerInput.includes("cardano")) coinToPredict = "ADA";

    if (coinToPredict) {
      try {
        const res = await fetch(`https://backend-chi-ten-58.vercel.app/predict?coin=${coinToPredict}`);
        if (res.ok) {
          const data = await res.json();
          setChatHistory(prev => [...prev, { 
            role: 'ai', 
            content: `My analysis for ${coinToPredict} shows a ${data.signal} signal with ${data.confidence}% confidence. The projected 24h target is ₹${data.target_24h_inr.toLocaleString("en-IN", {maximumFractionDigits: 0})}.` 
          }]);
        } else {
          setChatHistory(prev => [...prev, { role: 'ai', content: `I couldn't fetch data for ${coinToPredict} right now.` }]);
        }
      } catch (e) {
        setChatHistory(prev => [...prev, { role: 'ai', content: `Sorry, my backend connection seems to be down.` }]);
      }
      setIsTyping(false);
    } else {
      setTimeout(() => {
        const responses = [
          "I can help analyze specific coins like BTC, ETH, SOL, or ADA. Try asking 'What's the prediction for BTC?'",
          "Based on current market sentiment, we're seeing increased volatility across major altcoins.",
          "Our AI models are constantly analyzing the market. Mention a supported coin (BTC, ETH, SOL, ADA) for a detailed prediction!"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setChatHistory(prev => [...prev, { role: 'ai', content: randomResponse }]);
        setIsTyping(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-crypto-black text-white flex overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-crypto-neon/5 via-crypto-black to-crypto-black pointer-events-none z-0" />

      {/* Left Sidebar */}
      <motion.aside 
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="relative z-20 h-screen glass border-r border-white/5 flex flex-col transition-all duration-300"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-crypto-neon tracking-wider flex items-center gap-2"
            >
              <div className="w-3 h-3 rounded-full bg-crypto-neon shadow-[0_0_10px_rgba(204,255,0,0.8)] animate-pulse-neon" />
              Pulse
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-crypto-neon transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden no-scrollbar">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link key={link.name} href={link.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative group ${
                    isActive ? "text-crypto-black bg-crypto-neon box-neon" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-crypto-black" : "group-hover:text-crypto-neon transition-colors"}`} />
                  {isSidebarOpen && (
                    <span className="font-medium whitespace-nowrap">{link.name}</span>
                  )}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab" 
                      className="absolute inset-0 bg-crypto-neon rounded-xl -z-10 shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link href="/dashboard/settings">
            <div className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
              <Settings className="w-5 h-5 flex-shrink-0 group-hover:text-crypto-neon transition-colors" />
              {isSidebarOpen && <span className="font-medium">Settings</span>}
            </div>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden">
        {/* Top Navigation */}
        <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-8 w-1/2">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search assets, AI insights, or wallets..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-crypto-neon/50 focus:ring-1 focus:ring-crypto-neon/50 transition-all text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Live Ticker Animation */}
            <div className="hidden lg:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">BTC</span>
                <span className="text-white font-medium">₹79.15L</span>
                <span className="text-green-400 text-xs">+2.4%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">ETH</span>
                <span className="text-white font-medium">₹2.85L</span>
                <span className="text-green-400 text-xs">+1.1%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">SOL</span>
                <span className="text-white font-medium">₹15,500</span>
                <span className="text-crypto-neon text-xs">+5.7%</span>
              </div>
            </div>
            
            <div className="h-6 w-px bg-white/10 hidden lg:block" />

            <button className="relative p-2 text-gray-400 hover:text-crypto-neon transition-colors rounded-full hover:bg-white/5">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-crypto-neon rounded-full shadow-[0_0_8px_rgba(204,255,0,0.8)]" />
            </button>
            <Link href="/dashboard/settings">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-crypto-neon to-green-500 flex items-center justify-center text-black font-bold border-2 border-crypto-black hover:scale-105 transition-transform cursor-pointer">
                {profileInitial}
              </div>
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar relative">
          {children}
        </div>
      </main>

      {/* Right AI Sidebar */}
      <aside className="hidden xl:flex w-80 h-screen glass border-l border-white/5 flex-col relative z-20">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-crypto-neon" />
              AI Assistant
            </h3>
            <span className="text-[10px] uppercase tracking-wider bg-crypto-neon/20 text-crypto-neon px-2 py-1 rounded border border-crypto-neon/30">Online</span>
          </div>
          
          <div className="glass bg-white/5 rounded-xl p-4 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-crypto-neon to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <p className="text-xs text-gray-400 mb-2">Market Mood</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">Extremely Bullish</span>
            </div>
            <div className="mt-3 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "85%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-green-500 to-crypto-neon shadow-[0_0_10px_rgba(204,255,0,0.5)]" 
              />
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col h-0">
          <h4 className="text-sm text-gray-400 mb-4 font-medium uppercase tracking-wider">
            {chatHistory.length > 0 ? 'AI Chat' : 'Live AI Insights'}
          </h4>
          
          <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
            {chatHistory.length === 0 ? (
              <>
                {/* Example Insights */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 hover:border-crypto-neon/30 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-crypto-neon/10 flex items-center justify-center flex-shrink-0">
                      <Fish className="w-4 h-4 text-crypto-neon" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white mb-1">Whale Accumulation</p>
                      <p className="text-xs text-gray-400">Large inflows detected on Binance for SOL. +450k SOL in the last 2 hours.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 hover:border-crypto-neon/30 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <LineChart className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white mb-1">Pattern Detected</p>
                      <p className="text-xs text-gray-400">Bearish divergence forming on ETH 1H chart. Support at ₹2,80,000.</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-xl max-w-[85%] text-sm ${
                      msg.role === 'user' 
                        ? 'bg-crypto-neon/20 border border-crypto-neon/30 text-white' 
                        : 'bg-white/5 border border-white/10 text-gray-300'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="mt-4 pt-4 border-t border-white/5 relative">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Ask CryptoPulse AI..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none focus:border-crypto-neon focus:ring-1 focus:ring-crypto-neon transition-all text-white placeholder-gray-500"
            />
            <button 
              onClick={handleSendMessage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-crypto-neon text-black flex items-center justify-center hover:shadow-[0_0_10px_rgba(204,255,0,0.5)] transition-shadow"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
