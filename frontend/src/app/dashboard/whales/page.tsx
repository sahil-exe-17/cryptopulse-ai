"use client";

import { motion } from "framer-motion";
import { Fish, AlertCircle, ArrowRightLeft, ArrowDownToLine, ArrowUpFromLine, ShieldAlert } from "lucide-react";

const whaleTransactions = [
  { id: "1", type: "inflow", asset: "BTC", amount: "1,240", value: "₹9,700 Cr", exchange: "Binance", from: "Unknown Wallet", time: "2m ago", risk: "high" },
  { id: "2", type: "outflow", asset: "ETH", amount: "15,000", value: "₹420 Cr", exchange: "Coinbase", to: "Unknown Wallet", time: "15m ago", risk: "medium" },
  { id: "3", type: "transfer", asset: "SOL", amount: "450,000", value: "₹690 Cr", from: "Unknown", to: "Unknown", time: "42m ago", risk: "low" },
  { id: "4", type: "inflow", asset: "USDT", amount: "200M", value: "₹1,680 Cr", exchange: "Kraken", from: "Tether Treasury", time: "1h ago", risk: "low" },
];

export default function WhaleTrackerPage() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Whale <span className="text-crypto-neon">Tracker</span></h1>
          <p className="text-gray-400 mt-1">Real-time detection of smart money and massive institutional transfers.</p>
        </div>
        <button className="bg-crypto-neon text-black font-semibold px-4 py-2 rounded-lg text-sm shadow-[0_0_15px_rgba(204,255,0,0.3)]">
          Setup Alerts
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/5 box-neon">
          <p className="text-sm text-gray-400 font-medium">24H Total Inflows</p>
          <h3 className="text-2xl font-bold mt-2 text-red-400">₹20,000 Cr</h3>
          <p className="text-xs text-red-400 mt-1">+15% from yesterday</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/5">
          <p className="text-sm text-gray-400 font-medium">24H Total Outflows</p>
          <h3 className="text-2xl font-bold mt-2 text-green-400">₹26,000 Cr</h3>
          <p className="text-xs text-green-400 mt-1">-5% from yesterday</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/5">
          <p className="text-sm text-gray-400 font-medium">Active Whales</p>
          <h3 className="text-2xl font-bold mt-2 text-white">142</h3>
          <p className="text-xs text-crypto-neon mt-1">High activity detected on SOL</p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2">
            <Fish className="w-5 h-5 text-crypto-neon" />
            Live Whale Activity
          </h2>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crypto-neon opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-crypto-neon"></span>
            </span>
            <span className="text-xs text-crypto-neon font-medium">Scanning network...</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Asset</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Amount / Value</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Route</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">AI Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {whaleTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                        {tx.asset}
                      </div>
                      <span className="font-medium text-white">{tx.asset}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {tx.type === 'inflow' && <ArrowDownToLine className="w-4 h-4 text-red-400" />}
                      {tx.type === 'outflow' && <ArrowUpFromLine className="w-4 h-4 text-green-400" />}
                      {tx.type === 'transfer' && <ArrowRightLeft className="w-4 h-4 text-blue-400" />}
                      <span className="capitalize text-sm text-gray-300">{tx.type}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-white">{tx.amount} {tx.asset}</p>
                    <p className="text-xs text-gray-400">{tx.value}</p>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      {tx.type === 'inflow' && (
                        <p className="text-gray-300">{tx.from} <span className="text-gray-500">→</span> <span className="text-white font-medium">{tx.exchange}</span></p>
                      )}
                      {tx.type === 'outflow' && (
                        <p className="text-gray-300"><span className="text-white font-medium">{tx.exchange}</span> <span className="text-gray-500">→</span> {tx.to}</p>
                      )}
                      {tx.type === 'transfer' && (
                        <p className="text-gray-300">{tx.from} <span className="text-gray-500">→</span> {tx.to}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{tx.time}</td>
                  <td className="p-4">
                    {tx.risk === 'high' && <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded w-fit"><ShieldAlert className="w-3 h-3" /> High Risk</span>}
                    {tx.risk === 'medium' && <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded w-fit"><AlertCircle className="w-3 h-3" /> Moderate</span>}
                    {tx.risk === 'low' && <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded w-fit">Safe</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
