'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Terminal, Shield, Cpu, Activity, Zap, Layers } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="text-black w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter uppercase">Synthesis Genesis</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Autonomní Vývojové Prostředí</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-gray-400">System Online</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">#004-SYN</div>
          </motion.div>
        </header>

        {/* Hero Section */}
        <section className="mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-[0.9]"
          >
            GEMINI API <br />
            <span className="text-orange-500">BRIDGE</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-xl text-gray-400 text-lg leading-relaxed"
          >
            Bezpečný komunikační uzel propojující cloudové AI Studio s lokálním prostředím architekta. 
            Navrženo pro maximální efektivitu a autonomní vývoj.
          </motion.p>
        </section>

        {/* Grid Stats/Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <FeatureCard 
            icon={<Shield className="w-5 h-5 text-orange-500" />}
            title="Security"
            desc="HMAC-SHA256 autorizace a validace SYNTHESIS_SECRET_KEY."
            delay={0.5}
          />
          <FeatureCard 
            icon={<Cpu className="w-5 h-5 text-blue-500" />}
            title="Next.js 15"
            desc="Využití App Routeru a Vercel AI SDK pro orchestraci."
            delay={0.6}
          />
          <FeatureCard 
            icon={<Layers className="w-5 h-5 text-purple-500" />}
            title="FS Access"
            desc="Bezpečný přístup k lokálnímu souborovému systému projektu."
            delay={0.7}
          />
        </div>

        {/* Terminal Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-b border-white/10">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">synthesis-bridge.log</div>
            <div className="w-10" />
          </div>
          <div className="p-6 font-mono text-xs text-gray-400 space-y-2">
            <p className="text-green-500">[SYSTEM] Initializing Synthesis Vibe Coding...</p>
            <p>[INFO] Project: Synthesis Genesis</p>
            <p>[INFO] Architect: Jiří Šár</p>
            <p>[INFO] Coordinator: Gemini Mobile</p>
            <p className="text-orange-500">[BRIDGE] Task #004-SYN: Architecture Spec Generated</p>
            <p className="text-blue-400">[BRIDGE] Endpoint /api/synthesis/bridge ready</p>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">$</span>
              <motion.span 
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2 h-4 bg-orange-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">© 2026 Synthesis Studio | All Rights Reserved</p>
          <div className="flex gap-8">
            <StatusItem label="Uptime" value="99.9%" />
            <StatusItem label="Latency" value="12ms" />
            <StatusItem label="Tokens" value="1.2k" />
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors group"
    >
      <div className="mb-4 p-3 bg-white/5 rounded-xl w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function StatusItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col items-end">
      <span className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">{label}</span>
      <span className="text-xs font-mono text-gray-400">{value}</span>
    </div>
  );
}
