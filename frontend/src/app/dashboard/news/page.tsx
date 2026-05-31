"use client";

import { motion } from "framer-motion";
import { Newspaper, TrendingUp, TrendingDown, Bot, ExternalLink, Filter } from "lucide-react";

const newsItems = [
  { id: "1", title: "SEC Approves Spot Solana ETF Fillings", source: "CoinDesk", time: "10m ago", sentiment: "positive", aiScore: 92, tags: ["SOL", "ETF", "Regulation"] },
  { id: "2", title: "Federal Reserve Hints at Rate Cuts in Q3", source: "Bloomberg", time: "1h ago", sentiment: "positive", aiScore: 85, tags: ["Macro", "FED"] },
  { id: "3", title: "Mt. Gox Creditor Repayments Delayed Again", source: "CoinTelegraph", time: "3h ago", sentiment: "neutral", aiScore: 60, tags: ["BTC", "Exchange"] },
  { id: "4", title: "Major Exchange Halts Withdrawals Amid Security Concerns", source: "CryptoSlate", time: "4h ago", sentiment: "negative", aiScore: 95, tags: ["Security", "Exchange"] },
];

export default function NewsPage() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">News <span className="text-crypto-neon">Intelligence</span></h1>
          <p className="text-gray-400 mt-1">AI-curated crypto news with sentiment tagging.</p>
        </div>
        <button className="glass px-4 py-2 rounded-lg text-sm hover:text-crypto-neon transition-colors border border-white/10 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {newsItems.map((news, i) => (
            <motion.div 
              key={news.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-5 rounded-2xl border border-white/5 hover:border-crypto-neon/50 transition-colors cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-crypto-neon font-medium bg-crypto-neon/10 px-2 py-0.5 rounded">{news.source}</span>
                    <span className="text-xs text-gray-500">• {news.time}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-crypto-neon transition-colors">
                    {news.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-3">
                    {news.tags.map(tag => (
                      <span key={tag} className="text-[10px] text-gray-400 border border-white/10 rounded px-2 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-6 md:border-l md:border-white/10 md:pl-6">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">AI Sentiment</p>
                    {news.sentiment === 'positive' && <span className="flex items-center justify-center gap-1 text-sm font-bold text-green-400"><TrendingUp className="w-4 h-4" /> Bullish</span>}
                    {news.sentiment === 'negative' && <span className="flex items-center justify-center gap-1 text-sm font-bold text-red-400"><TrendingDown className="w-4 h-4" /> Bearish</span>}
                    {news.sentiment === 'neutral' && <span className="flex items-center justify-center gap-1 text-sm font-bold text-gray-300">Neutral</span>}
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Impact Score</p>
                    <span className={"text-lg font-bold " + (news.aiScore > 90 ? 'text-crypto-neon drop-shadow-[0_0_8px_rgba(204,255,0,0.8)]' : 'text-white')}>
                      {news.aiScore}/100
                    </span>
                  </div>
                  <button className="hidden md:flex p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Bot className="w-24 h-24 text-crypto-neon" />
            </div>
            <h3 className="font-semibold flex items-center gap-2 mb-4 relative z-10 text-crypto-neon">
              <Bot className="w-5 h-5" />
              AI Market Summary
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed relative z-10">
              Over the last 24 hours, news sentiment has shifted towards strongly bullish (68%), primarily driven by ETF approvals and positive macroeconomic data. Watch for potential volatility around 14:00 UTC due to scheduled Fed speeches.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/5">
            <h3 className="font-semibold mb-4 text-sm text-gray-400 uppercase tracking-wider">Trending Topics</h3>
            <div className="flex flex-wrap gap-2">
              {["#SpotETF", "#Solana", "#FedRate", "#MtGox", "#Web3"].map(topic => (
                <span key={topic} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-crypto-neon hover:border-crypto-neon/50 cursor-pointer transition-colors">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
