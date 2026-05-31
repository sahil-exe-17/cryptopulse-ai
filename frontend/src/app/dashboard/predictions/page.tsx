"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BrainCircuit, AlertTriangle, Crosshair, ChevronRight, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

function PredictionsContent() {
  const searchParams = useSearchParams();
  const coinParam = searchParams.get('coin') || 'BTC';

  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await fetch(`https://backend-chi-ten-58.vercel.app/predict?coin=${coinParam}`);
        if (!res.ok) throw new Error("Failed to fetch prediction");
        const data = await res.json();
        setPrediction(data);
      } catch (err: any) {
        console.error(err);
        setError("AI Engine offline or processing. Please ensure the Python backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <Loader2 className="w-16 h-16 text-crypto-neon animate-spin mb-6" />
        <h1 className="text-3xl font-bold mb-2">Analyzing <span className="text-crypto-neon">Market Data</span></h1>
        <p className="text-gray-400 max-w-md">The ML Engine is downloading historical data and running inference...</p>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold mb-2">Engine <span className="text-red-500">Offline</span></h1>
        <p className="text-gray-400 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Prediction <span className="text-crypto-neon">Lab</span></h1>
        <p className="text-gray-400 mt-1">Multi-model forecasting using Scikit-Learn and live data.</p>
      </div>

      {/* Main Prediction Graph */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BrainCircuit className="w-64 h-64 text-crypto-neon" />
        </div>

        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{prediction.coin} Next 24H</h2>
              <span className="bg-crypto-neon/20 text-crypto-neon text-xs font-bold px-3 py-1 rounded-full border border-crypto-neon/50">
                Model: LinearReg-Live
              </span>
            </div>
            <p className="text-gray-400 max-w-2xl text-sm">
              Live AI analysis complete. The model indicates a {prediction.trend} trend over the next 24 hours based on recent price action.
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-400 mb-1">Model Confidence</p>
            <div className="text-4xl font-bold text-crypto-neon drop-shadow-[0_0_15px_rgba(204,255,0,0.5)]">{prediction.confidence}%</div>
          </div>
        </div>

        <div className="h-[400px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={prediction.forecast} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ccff00" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="time" stroke="#ffffff40" />
              <YAxis domain={['auto', 'auto']} stroke="#ffffff40" tickFormatter={(val) => "₹" + val.toLocaleString("en-IN")} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#050505', borderColor: '#ccff0040', borderRadius: '12px' }}
                itemStyle={{ color: '#ccff00' }}
                formatter={(value: any) => ["₹" + Number(value).toLocaleString("en-IN"), "Price"]}
              />
              <ReferenceLine x="Now" stroke="#ffffff40" strokeDasharray="3 3" />
              
              {/* Confidence Range Area */}
              <Area type="monotone" dataKey="aiUpper" stroke="none" fill="url(#colorRange)" />
              <Area type="monotone" dataKey="aiLower" stroke="none" fill="#050505" />
              
              {/* Predicted Line */}
              <Area type="monotone" dataKey="predicted" stroke="#ccff00" strokeWidth={3} fill="url(#colorPredicted)" strokeDasharray="5 5" />
              
              {/* Current Price Line */}
              <Area type="monotone" dataKey="price" stroke="#ffffff" strokeWidth={3} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 relative z-10">
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Trend Direction</p>
            <p className={`text-xl font-bold ${prediction.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {prediction.trend.toUpperCase()}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">AI Signal</p>
            <p className="text-xl font-bold text-white">{prediction.signal}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">24H Target Price</p>
            <p className="text-xl font-bold text-white">₹{prediction.target_24h_inr.toLocaleString("en-IN", {maximumFractionDigits: 0})}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Risk Score</p>
            <p className="text-xl font-bold text-yellow-400 flex items-center gap-2">Moderate <AlertTriangle className="w-4 h-4" /></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PredictionsPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading Predictions...</div>}>
      <PredictionsContent />
    </Suspense>
  );
}
