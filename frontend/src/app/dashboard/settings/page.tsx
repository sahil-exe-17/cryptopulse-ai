"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Shield, Bell, User, Key, Cpu } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    email: "",
    display_name: "",
    default_currency: "USD"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      try {
        const res = await fetch("https://backend-chi-ten-58.vercel.app/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile({
            email: data.email,
            display_name: data.display_name,
            default_currency: data.default_currency
          });
        } else {
          if (res.status === 401) {
            localStorage.removeItem("token");
            router.push("/");
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://backend-chi-ten-58.vercel.app/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          display_name: profile.display_name,
          default_currency: profile.default_currency
        })
      });
      if (res.ok) {
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-crypto-neon text-lg animate-pulse">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform <span className="text-crypto-neon">Settings</span></h1>
          <p className="text-gray-400 mt-1">Configure your AI models, alerts, and security preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          {[
            { id: "profile", label: "Profile", icon: User, active: true },
            { id: "security", label: "Security & 2FA", icon: Shield, active: false },
            { id: "api", label: "Exchange APIs", icon: Key, active: false },
            { id: "alerts", label: "Notification Settings", icon: Bell, active: false },
            { id: "ai", label: "AI Model Config", icon: Cpu, active: false },
          ].map(tab => (
            <button key={tab.id} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${tab.active ? 'bg-crypto-neon text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]' : 'glass border border-white/5 text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 glass rounded-2xl border border-white/5 p-6">
          <h3 className="text-xl font-bold mb-6">Profile Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Display Name</label>
              <input 
                type="text" 
                value={profile.display_name}
                onChange={(e) => setProfile({...profile, display_name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-crypto-neon focus:ring-1 focus:ring-crypto-neon transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                value={profile.email} 
                disabled 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-gray-500 cursor-not-allowed" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Default Currency</label>
              <select 
                value={profile.default_currency}
                onChange={(e) => setProfile({...profile, default_currency: e.target.value})}
                className="w-full bg-crypto-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-crypto-neon focus:ring-1 focus:ring-crypto-neon transition-all"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            
            {message && (
              <p className={`text-sm ${message.includes("success") ? "text-crypto-neon" : "text-red-400"}`}>
                {message}
              </p>
            )}

            <div className="pt-4 mt-6 border-t border-white/10 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`bg-crypto-neon text-black font-bold py-2.5 px-6 rounded-xl hover:shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all ${isSaving ? 'opacity-70' : ''}`}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
