"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Search, Filter, Star } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const mockMarketData = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", price: 5395362.00, change24h: 2.4, marketCap: "₹100T", volume: "₹2.6T", sparkline: "up" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", price: 289816.80, change24h: -1.2, marketCap: "₹34T", volume: "₹1.2T", sparkline: "down" },
  { id: "solana", symbol: "SOL", name: "Solana", price: 12247.20, change24h: 8.7, marketCap: "₹5.4T", volume: "₹350B", sparkline: "up" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", price: 48753.60, change24h: 0.5, marketCap: "₹7.4T", volume: "₹150B", sparkline: "up" },
  { id: "ripple", symbol: "XRP", name: "XRP", price: 48.72, change24h: -0.4, marketCap: "₹2.6T", volume: "₹75B", sparkline: "down" },
  { id: "cardano", symbol: "ADA", name: "Cardano", price: 37.80, change24h: 1.1, marketCap: "₹1.3T", volume: "₹33B", sparkline: "up" },
  { id: "avalanche", symbol: "AVAX", name: "Avalanche", price: 2956.80, change24h: 4.2, marketCap: "₹1T", volume: "₹50B", sparkline: "up" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", price: 596.40, change24h: -2.1, marketCap: "₹750B", volume: "₹21B", sparkline: "down" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", price: 13.44, change24h: 5.6, marketCap: "₹1.8T", volume: "₹80B", sparkline: "up" },
  { id: "shibainu", symbol: "SHIB", name: "Shiba Inu", price: 0.002, change24h: 12.3, marketCap: "₹900B", volume: "₹60B", sparkline: "up" },
];

export default function MarketExplorerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredData = mockMarketData.filter(coin => 
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Market <span className="text-crypto-neon">Explorer</span></h1>
          <p className="text-gray-400 mt-1">Real-time cryptocurrency prices and market metrics.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search coins..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-crypto-dark/50 border border-gray-800 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-crypto-neon focus:ring-1 focus:ring-crypto-neon transition-all w-full md:w-64"
            />
          </div>
          <button className="p-2 rounded-full bg-crypto-dark/50 border border-gray-800 hover:border-gray-600 transition-colors">
            <Filter className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="bg-crypto-dark/30 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-sm text-gray-400 bg-crypto-dark/50">
                <th className="px-6 py-4 font-medium rounded-tl-2xl">Asset</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">24h Change</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Market Cap</th>
                <th className="px-6 py-4 font-medium hidden lg:table-cell">Volume (24h)</th>
                <th className="px-6 py-4 font-medium text-right rounded-tr-2xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((coin, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={coin.id} 
                  onClick={() => router.push(`/dashboard/predictions?coin=${coin.symbol}`)}
                  className="border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold border border-gray-700 shadow-inner">
                        {coin.symbol[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-100 group-hover:text-crypto-neon transition-colors">{coin.name}</div>
                        <div className="text-xs text-gray-500">{coin.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    ₹{coin.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1 ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {coin.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span>{Math.abs(coin.change24h)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 hidden md:table-cell">{coin.marketCap}</td>
                  <td className="px-6 py-4 text-gray-400 hidden lg:table-cell">{coin.volume}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-500 hover:text-yellow-400 transition-colors p-2 rounded-full hover:bg-yellow-400/10"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No assets found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
