/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Sun,
  Camera,
  Eye,
  Sliders,
  CloudFog,
  Sparkles,
  Zap,
} from 'lucide-react';
import { LightingEnvironment, ViewportMode, Language } from '../types/engine';
import { getT } from '../utils/i18n';

interface BottomControlDockProps {
  lighting: LightingEnvironment;
  onUpdateLighting: (updated: LightingEnvironment) => void;
  viewportMode: ViewportMode;
  lang: Language;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  lighting,
  onUpdateLighting,
  viewportMode,
  lang,
}) => {
  const t = getT(lang);
  const [collapsed, setCollapsed] = useState(false);

  // En modo juego (play_doctor), la iluminación es 100% fija y diseñada por artistas para máxima inmersión y tensión.
  // No se muestran barras de depuración ni controles deslizantes.
  if (viewportMode === 'play_doctor') {
    return null;
  }

  // Perfiles de Iluminación y Tensión Diseñados por Artistas
  const applyArtistProfile = (profile: 'clinical' | 'code_blue' | 'quarantine') => {
    if (profile === 'clinical') {
      onUpdateLighting({
        ...lighting,
        sunAzimuth: 145,
        sunElevation: 50,
        sunIntensity: 2.6,
        sunColor: '#f1f5f9',
        skyLightIntensity: 0.85,
        exposure: 1.05,
        emergencyAlarmActive: false,
        screenSpaceReflections: true,
      });
    } else if (profile === 'code_blue') {
      onUpdateLighting({
        ...lighting,
        sunAzimuth: 220,
        sunElevation: 25,
        sunIntensity: 0.8,
        sunColor: '#38bdf8',
        skyLightIntensity: 0.35,
        exposure: 0.95,
        emergencyAlarmActive: true,
        screenSpaceReflections: true,
      });
    } else if (profile === 'quarantine') {
      onUpdateLighting({
        ...lighting,
        sunAzimuth: 180,
        sunElevation: 35,
        sunIntensity: 1.6,
        sunColor: '#a7f3d0',
        skyLightIntensity: 0.55,
        exposure: 1.0,
        emergencyAlarmActive: false,
        screenSpaceReflections: true,
      });
    }
  };

  return (
    <div
      style={{
        maxWidth: 'min(940px, 94vw)',
      }}
      className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-30 transition-transform duration-300 ease-out select-none ${
        collapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
      }`}
    >
      {/* Collapse / Expand Toggle Tab */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-[#181a24] border-t border-x border-[#2d3244] text-[11px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer shadow-md"
        >
          {collapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
              <span>Mostrar Perfiles de Iluminación Artística</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Ocultar Panel (Modo Cine)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Unified Dock Bar - Perfiles Diseñados por Artistas */}
      <div className="rounded-xl bg-[#141620] border border-[#2b3042] shadow-2xl p-2.5 sm:p-3 text-xs text-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          {/* Perfiles de Iluminación Artística */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sky-400 font-semibold text-[11px] font-mono">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Iluminación Artística (Tensión):</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => applyArtistProfile('clinical')}
                className="px-2.5 py-1 rounded bg-[#202330] hover:bg-[#2b3044] text-[10px] font-mono text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                title="Guardia Médica Nocturna (Iluminación clínica fría y balanceada)"
              >
                ● Guardia Clínica
              </button>
              <button
                onClick={() => applyArtistProfile('code_blue')}
                className="px-2.5 py-1 rounded bg-[#202330] hover:bg-[#2b3044] text-[10px] font-mono text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                title="Código Azul (Tensión de emergencia con sirena roja y sombras contrastadas)"
              >
                ⚡ Código Azul
              </button>
              <button
                onClick={() => applyArtistProfile('quarantine')}
                className="px-2.5 py-1 rounded bg-[#202330] hover:bg-[#2b3044] text-[10px] font-mono text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                title="Cuarentena Tóxica (Atmósfera biológica y luces parpadeantes)"
              >
                ☣ Cuarentena
              </button>
            </div>
          </div>

          {/* Badges de Post-Procesado Fijo */}
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-500/40 text-sky-300">
              ✓ Bloom Suave 0.55x
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300">
              ✓ Color Grading (+28% Sat)
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300">
              ✓ Estrobos Cenitales
            </span>
          </div>

          {/* Viewport Control Instructions */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono border-l border-slate-700/50 pl-3">
            <span>{viewportMode === 'editor' ? t.flycamControls : t.gameplayControls}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
