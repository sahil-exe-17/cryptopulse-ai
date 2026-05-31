"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart, ArrowUpRight, Plus, Wallet, Sparkles, X, Trash2 } from "lucide-react";

const MOCK_PRICES: Record<string, number> = {
  "BTC": 7915000,
  "ETH": 285000,
  "SOL": 15500,
  "USDT": 84,
  "ADA": 45,
  "DOGE": 14,
};

const getColor = (ticker: string) => {
  const colors = ["#ccff00", "#99ff00", "#66ff00", "#33ff00", "#00ff00", "#00cccc", "#ff00cc", "#cc00ff"];
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [assetName, setAssetName] = useState("");
  const [assetTicker, setAssetTicker] = useState("");
  const [assetQuantity, setAssetQuantity] = useState("");

  const fetchPortfolio = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("https://backend-chi-ten-58.vercel.app/portfolio", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        
        let total = 0;
        const formattedData = data.map((item: any) => {
          const price = MOCK_PRICES[item.ticker.toUpperCase()] || 100;
          const value = price * item.quantity;
          total += value;
          return {
            ...item,
            value,
            price,
            color: getColor(item.ticker)
          };
        });

        setPortfolioData(formattedData);
        setTotalBalance(total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("https://backend-chi-ten-58.vercel.app/portfolio", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: assetName,
          ticker: assetTicker.toUpperCase(),
          quantity: parseFloat(assetQuantity)
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setAssetName("");
        setAssetTicker("");
        setAssetQuantity("");
        fetchPortfolio();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveAsset = async (ticker: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`https://backend-chi-ten-58.vercel.app/portfolio/${ticker}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPortfolio();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-20 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Portfolio <span className="text-crypto-neon">Tracker</span></h1>
          <p className="text-gray-400 mt-1">Smart portfolio management with AI allocation recommendations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-crypto-neon text-black font-semibold px-4 py-2 rounded-lg text-sm shadow-[0_0_15px_rgba(204,255,0,0.3)] flex items-center gap-2 hover:shadow-[0_0_20px_rgba(204,255,0,0.6)] transition-all"
        >
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-crypto-neon animate-pulse">Loading Portfolio...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-2 glass rounded-2xl p-8 border border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Wallet className="w-64 h-64 text-white" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Balance</p>
                  <h2 className="text-5xl font-bold text-white">
                    ₹{totalBalance.toLocaleString("en-IN", {maximumFractionDigits: 0})}
                  </h2>
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-full text-sm font-bold">
                      <ArrowUpRight className="w-4 h-4" /> Live
                    </div>
                    <span className="text-gray-400 text-sm">Dynamic Value</span>
                  </div>
                </div>

                <div className="h-48 w-48 relative">
                  {portfolioData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={portfolioData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {portfolioData.map((entry, index) => (
                            <Cell key={"cell-" + index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#050505', borderColor: '#ccff0040', borderRadius: '8px' }}
                          itemStyle={{ color: '#ccff00' }}
                          formatter={(value: any) => "₹" + Number(value).toLocaleString("en-IN", {maximumFractionDigits: 0})}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center border border-white/10 rounded-full border-dashed">
                      <span className="text-xs text-gray-500">No Assets</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <PieChart className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 border border-crypto-neon box-neon flex flex-col relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-crypto-neon/5 z-0" />
              
              <h3 className="font-semibold flex items-center gap-2 mb-4 relative z-10 text-crypto-neon">
                <Sparkles className="w-5 h-5" />
                AI Optimization
              </h3>
              
              <div className="space-y-4 relative z-10 flex-1">
                {portfolioData.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Your portfolio is being actively monitored. Based on your holdings, AI suggests diversifying into emerging altcoins.
                    </p>
                    <div className="bg-black/50 rounded-xl p-4 border border-white/5 mt-4">
                      <p className="text-xs text-gray-400 mb-2">Recommended Action</p>
                      <p className="text-sm font-medium text-white mb-2">Explore New Assets <ArrowUpRight className="inline w-3 h-3 text-gray-500 mx-1" /> Diversify</p>
                      <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors mt-2">
                        View Opportunities
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Add some assets to your portfolio to receive AI-powered optimization insights.
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          <div className="glass rounded-2xl border border-white/5 overflow-hidden mt-6">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-bold text-lg">Your Assets</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Asset</th>
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Price (est)</th>
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Allocation</th>
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {portfolioData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 text-sm">
                        No assets in your portfolio yet. Click "Add Asset" to start tracking.
                      </td>
                    </tr>
                  ) : portfolioData.map((asset) => {
                    const allocation = totalBalance > 0 ? (asset.value / totalBalance) * 100 : 0;
                    return (
                      <tr key={asset.ticker} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center font-bold text-xs" style={{ color: asset.color }}>
                              {asset.ticker}
                            </div>
                            <div>
                              <p className="font-medium text-white">{asset.name}</p>
                              <p className="text-xs text-gray-500">{asset.ticker}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-white">
                          {asset.quantity}
                        </td>
                        <td className="p-4 text-gray-300">
                          ₹{asset.price.toLocaleString("en-IN")}
                        </td>
                        <td className="p-4 font-bold text-white">
                          ₹{asset.value.toLocaleString("en-IN", {maximumFractionDigits: 0})}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="w-10 text-gray-400 text-right">{allocation.toFixed(1)}%</span>
                            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full" style={{ width: allocation + "%", backgroundColor: asset.color }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleRemoveAsset(asset.ticker)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Asset Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-crypto-black glass border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-xl font-bold">Add Asset</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddAsset} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Asset Name</label>
                  <input 
                    type="text" 
                    required
                    value={assetName}
                    onChange={e => setAssetName(e.target.value)}
                    placeholder="e.g. Bitcoin"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-crypto-neon focus:ring-1 focus:ring-crypto-neon" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Ticker Symbol</label>
                  <input 
                    type="text" 
                    required
                    value={assetTicker}
                    onChange={e => setAssetTicker(e.target.value.toUpperCase())}
                    placeholder="e.g. BTC"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-crypto-neon focus:ring-1 focus:ring-crypto-neon uppercase" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Quantity</label>
                  <input 
                    type="number" 
                    step="any"
                    required
                    value={assetQuantity}
                    onChange={e => setAssetQuantity(e.target.value)}
                    placeholder="e.g. 0.5"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-crypto-neon focus:ring-1 focus:ring-crypto-neon" 
                  />
                </div>
                <div className="pt-4 mt-6 border-t border-white/10 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-crypto-neon text-black font-semibold px-6 py-2 rounded-lg text-sm shadow-[0_0_15px_rgba(204,255,0,0.3)] hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all"
                  >
                    Save Asset
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
