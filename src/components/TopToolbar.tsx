/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Play,
  Square,
  Box,
  Layers,
  Sparkles,
  Download,
  Globe,
  Zap,
  Code2,
  HeartPulse,
} from 'lucide-react';
import { ActiveTab, ViewportMode, Language } from '../types/engine';
import { getT } from '../utils/i18n';

interface TopToolbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  viewportMode: ViewportMode;
  onViewportModeChange: (mode: ViewportMode) => void;
  lang: Language;
  onToggleLang: () => void;
  activeGizmo: 'translate' | 'rotate' | 'scale';
  onGizmoChange: (gizmo: 'translate' | 'rotate' | 'scale') => void;
  blueprintActive: boolean;
  onToggleBlueprintRun: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  activeTab,
  onTabChange,
  viewportMode,
  onViewportModeChange,
  lang,
  onToggleLang,
  activeGizmo,
  onGizmoChange,
  blueprintActive,
  onToggleBlueprintRun,
}) => {
  const t = getT(lang);
  const isPlaying = viewportMode === 'play_doctor';

  return (
    <header className="h-14 bg-[#14161c] border-b border-[#252833] flex items-center justify-between px-3 text-slate-200 select-none shrink-0 z-40">
      {/* Left: Unreal Engine Brand & Tabs */}
      <div className="flex items-center gap-3">
        {/* Brand Mark */}
        <div className="flex items-center gap-2 pr-3 border-r border-[#2a2e3b]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-sky-700 border border-slate-700 flex items-center justify-center font-black tracking-tighter text-white text-sm shadow-md">
            <span>U</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold tracking-wider text-xs text-white">HOSPITAL EMERGENCY</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800">
                UE5.3+
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 block tracking-tight">
              C++ Core & Blueprint Architecture
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#0d0e12] p-1 rounded-lg border border-[#222630]">
          <button
            onClick={() => onTabChange('viewport')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'viewport'
                ? 'bg-[#222733] text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1d26]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Simulador 3D</span>
          </button>

          <button
            onClick={() => onTabChange('architecture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'architecture'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1d26]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>C++ Core & Clases</span>
          </button>

          <button
            onClick={() => onTabChange('blueprint')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'blueprint'
                ? 'bg-[#222733] text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1d26]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>BP_Patient Graph</span>
          </button>

          <button
            onClick={() => onTabChange('content')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'content'
                ? 'bg-[#222733] text-purple-400 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1d26]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Assets & Props</span>
          </button>

          <button
            onClick={() => onTabChange('installer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === 'installer'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md font-semibold'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/30'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar UE5</span>
          </button>
        </nav>
      </div>

      {/* Center: Play Simulation Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-[#0a0c10] px-2 py-1 rounded-lg border border-[#262a36]">
          {!isPlaying ? (
            <button
              onClick={() => {
                onTabChange('viewport');
                onViewportModeChange('play_doctor');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Jugar Médico</span>
            </button>
          ) : (
            <button
              onClick={() => onViewportModeChange('editor')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Detener (ESC)</span>
            </button>
          )}
        </div>

        {/* Blueprint Run Indicator */}
        <button
          onClick={onToggleBlueprintRun}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono border transition-all ${
            blueprintActive
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50'
              : 'bg-[#12141a] text-slate-400 border-[#262a36] hover:text-slate-200'
          }`}
          title="Alternar ejecución en vivo de la lógica Blueprint"
        >
          <Zap className={`w-3.5 h-3.5 ${blueprintActive ? 'text-emerald-400 fill-emerald-400' : ''}`} />
          <span className="text-[11px] font-semibold">
            {blueprintActive ? 'REPLICACIÓN ACTIVA' : 'OFFLINE'}
          </span>
        </button>
      </div>

      {/* Right: Language & Installer Action */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1a1c24] hover:bg-[#252834] border border-[#2b2f3d] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold">{lang === 'es' ? 'ES' : 'EN'}</span>
        </button>

        <button
          onClick={() => onTabChange('installer')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Guía UE5</span>
        </button>
      </div>
    </header>
  );
};
