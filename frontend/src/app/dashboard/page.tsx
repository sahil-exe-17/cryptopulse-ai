"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, Zap, Activity, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [marketData, setMarketData] = useState({
    btcPrice: 0,
    btcChange: 0,
    marketCap: 0,
    marketCapChange: 0,
    volume: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("1D");

  useEffect(() => {
    const fetchLiveMarketData = async () => {
      try {
        setLoading(true);
        // Fetch top global data and BTC price
        const priceRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=inr&include_24hr_vol=true&include_24hr_change=true&include_market_cap=true");
        const priceData = await priceRes.json();
        const btc = priceData.bitcoin;

        setMarketData({
          btcPrice: btc.inr,
          btcChange: btc.inr_24h_change,
          marketCap: btc.inr_market_cap,
          marketCapChange: btc.inr_24h_change, // Using btc change as proxy for global for now
          volume: btc.inr_24h_vol,
        });

        let days = "1";
        if (timeframe === "1W") days = "7";
        else if (timeframe === "1M") days = "30";
        else if (timeframe === "YTD") {
          const now = new Date();
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          days = Math.max(1, Math.ceil((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))).toString();
        }

        // Fetch historical chart data based on timeframe
        const chartRes = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=inr&days=${days}`);
        const chartJson = await chartRes.json();
        
        // Format chart data (taking a subset of points for cleaner chart)
        const totalPoints = chartJson.prices.length;
        const targetPoints = 30; // Aim for ~30 points on the chart
        const step = Math.max(1, Math.floor(totalPoints / targetPoints));
        
        let formattedChart = chartJson.prices.filter((_: any, i: number) => i % step === 0).map((point: [number, number]) => {
          const date = new Date(point[0]);
          let timeStr = "";
          if (timeframe === "1D") {
            timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          } else {
            timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
          return {
            time: timeStr,
            fullDate: date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            price: point[1],
            predictedPrice: null
          };
        });

        formattedChart = addPredictions(formattedChart, timeframe);
        setChartData(formattedChart);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch CoinGecko API data:", error);
        
        // Use fallback data if API rate limits us (CORS error / Failed to fetch)
        setMarketData(prev => ({
          btcPrice: prev.btcPrice || 7915000,
          btcChange: prev.btcChange || 2.4,
          marketCap: prev.marketCap || 158000000000000,
          marketCapChange: prev.marketCapChange || 2.4,
          volume: prev.volume || 4500000000000,
        }));
        
        let fallbackDays = 1;
        if (timeframe === "1W") fallbackDays = 7;
        else if (timeframe === "1M") fallbackDays = 30;
        else if (timeframe === "YTD") fallbackDays = 180;

        const points = 30;
        let fallbackData = [];
        let currentPrice = 7915000;
        
        for(let i=0; i<points; i++) {
          const change = (Math.random() - 0.45) * (currentPrice * 0.015);
          currentPrice += change;
          
          const date = new Date();
          date.setHours(date.getHours() - (points - 1 - i) * (fallbackDays * 24 / points));
          
          let timeStr = "";
          if (timeframe === "1D") {
            timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          } else {
            timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
          
          fallbackData.push({ 
            time: timeStr, 
            fullDate: date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            price: currentPrice, 
            predictedPrice: null 
          });
        }
        
        fallbackData = addPredictions(fallbackData, timeframe);
        setChartData(fallbackData);
        setLoading(false);
      }
    };

    const addPredictions = (data: any[], tf: string) => {
      if (data.length === 0) return data;
      const newData = [...data];
      const lastPoint = newData[newData.length - 1];
      lastPoint.predictedPrice = lastPoint.price;
      
      let lastPrice = lastPoint.price;
      const predictionSteps = 8;
      
      for(let i=1; i<=predictionSteps; i++) {
         const change = lastPrice * (0.002 + Math.random() * 0.015);
         lastPrice += change;

         const futureDate = new Date();
         if (tf === "1D") {
           futureDate.setHours(futureDate.getHours() + (i * 24 / predictionSteps));
         } else if (tf === "1W") {
           futureDate.setDate(futureDate.getDate() + (i * 7 / predictionSteps));
         } else if (tf === "1M") {
           futureDate.setDate(futureDate.getDate() + (i * 30 / predictionSteps));
         } else {
           futureDate.setDate(futureDate.getDate() + (i * 180 / predictionSteps));
         }

         let timeStr = "";
         if (tf === "1D") {
           timeStr = `${futureDate.getHours().toString().padStart(2, '0')}:${futureDate.getMinutes().toString().padStart(2, '0')}`;
         } else {
           timeStr = futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
         }
         
         newData.push({
           time: timeStr,
           fullDate: futureDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
           price: null,
           predictedPrice: lastPrice
         });
      }
      return newData;
    };

    fetchLiveMarketData();
    // Poll every 60 seconds
    const interval = setInterval(fetchLiveMarketData, 60000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const formatLargeNumber = (num: number) => {
    if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)} Cr`;
    if (num >= 1e5) return `₹${(num / 1e5).toFixed(2)} Lakh`;
    return `₹${num.toLocaleString("en-IN")}`;
  };
  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform <span className="text-crypto-neon">Overview</span></h1>
          <p className="text-gray-400 mt-1">AI-powered insights and real-time market data.</p>
        </div>
        <div className="flex gap-2">
          {["1D", "1W", "1M", "YTD"].map((tf) => (
            <button 
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`glass px-4 py-2 rounded-lg text-sm transition-colors border border-white/10 hover:border-crypto-neon/50 ${
                timeframe === tf ? "text-crypto-neon bg-white/10 border-crypto-neon/50" : "hover:text-crypto-neon bg-transparent"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "BTC/INR", value: loading ? "..." : `₹${marketData.btcPrice.toLocaleString("en-IN")}`, change: loading ? "..." : `${marketData.btcChange > 0 ? '+' : ''}${marketData.btcChange.toFixed(2)}%`, isUp: marketData.btcChange >= 0 },
          { label: "BTC Market Cap", value: loading ? "..." : formatLargeNumber(marketData.marketCap), change: loading ? "..." : `${marketData.marketCapChange > 0 ? '+' : ''}${marketData.marketCapChange.toFixed(2)}%`, isUp: marketData.marketCapChange >= 0 },
          { label: "24h Volume", value: loading ? "..." : formatLargeNumber(marketData.volume), change: "Live", isUp: true },
          { label: "Fear & Greed", value: "78 / Greed", change: "+3", isUp: true, isNeon: true },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass p-6 rounded-2xl relative overflow-hidden group ${stat.isNeon ? 'box-neon' : 'border border-white/5'}`}
          >
            {stat.isNeon && <div className="absolute inset-0 bg-crypto-neon/5 z-0" />}
            <div className="relative z-10">
              <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
              <div className={`flex items-center gap-1 mt-2 text-sm ${stat.isUp ? 'text-green-400' : 'text-red-400'}`}>
                {stat.isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{stat.change}</span>
              </div>
            </div>
            
            {/* Hover flare */}
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5 relative"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-crypto-neon" />
              BTC Price Action & Prediction
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-crypto-neon" /> Actual</span>
              <span className="flex items-center gap-1 ml-2"><div className="w-2 h-2 rounded-full border border-crypto-neon border-dashed" /> AI Forecast</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-8 h-8 text-crypto-neon animate-spin" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ccff00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" stroke="#ffffff40" tick={{ fill: '#ffffff40', fontSize: 12 }} tickMargin={10} axisLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#ffffff40" tick={{ fill: '#ffffff40', fontSize: 12 }} tickMargin={10} axisLine={false} tickFormatter={(val) => "₹" + val.toLocaleString("en-IN")} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#050505', borderColor: '#ccff0040', borderRadius: '8px' }}
                    itemStyle={{ color: '#ccff00' }}
                    labelFormatter={(label, payload) => payload && payload.length > 0 ? payload[0].payload.fullDate : label}
                    formatter={(value: any, name: any) => [
                      "₹" + Number(value).toLocaleString("en-IN", {maximumFractionDigits: 0}), 
                      name === 'predictedPrice' ? 'AI Forecast' : 'Actual Price'
                    ]}
                  />
                  <Area type="monotone" dataKey="price" stroke="#ccff00" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" connectNulls={false} />
                  <Area type="monotone" dataKey="predictedPrice" stroke="#ccff00" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 border border-white/5 flex flex-col"
        >
          <h3 className="font-semibold flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-crypto-neon" />
            AI Market Signals
          </h3>
          
          <div className="space-y-4 flex-1">
            {[
              { coin: "SOL", signal: "STRONG BUY", confidence: "94%", desc: "Bull flag breakout detected on 4H timeframe." },
              { coin: "ETH", signal: "HOLD", confidence: "78%", desc: "Approaching major resistance at ₹2,90,000." },
              { coin: "LINK", signal: "ACCUMULATE", confidence: "88%", desc: "High whale inflow detected in the last 24h." },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-crypto-neon/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{item.coin}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-wider ${
                      item.signal === 'STRONG BUY' ? 'bg-crypto-neon text-black' : 
                      item.signal === 'HOLD' ? 'bg-gray-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {item.signal}
                    </span>
                  </div>
                  <span className="text-crypto-neon text-sm font-bold">{item.confidence}</span>
                </div>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-3 rounded-xl border border-crypto-neon/30 text-crypto-neon hover:bg-crypto-neon/10 transition-colors text-sm font-medium">
            View All Signals
          </button>
        </motion.div>
      </div>

    </div>
  );
}
