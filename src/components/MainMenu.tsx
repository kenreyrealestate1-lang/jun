/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Play,
  Activity,
  HeartPulse,
  Code2,
  BookOpen,
  X,
  Zap,
  Syringe,
  ShieldAlert,
  Sparkles,
  Trophy,
  ArrowRight,
  Shield,
  Stethoscope,
} from 'lucide-react';
import { playSelectActorSound, playBlueprintCompileChime } from '../utils/audioSystem';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenEditor: () => void;
  lang?: 'es' | 'en';
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenEditor,
  lang = 'es',
}) => {
  const [showGuideModal, setShowGuideModal] = useState(false);

  const handleStart = () => {
    playBlueprintCompileChime();
    onStartGame();
  };

  const handleEditor = () => {
    playSelectActorSound();
    onOpenEditor();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#07090f] text-slate-100 select-none">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial Medical Glows */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 right-1/4 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[160px]" />

        {/* Cinematic Vignette */}
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(3,5,10,0.7)_65%,rgba(2,3,6,0.98)_100%)]" />

        {/* Subtle Scanline Texture */}
        <div
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 0, 0, 0.15) 4px)',
          }}
          className="absolute inset-0 opacity-40 mix-blend-multiply"
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-2xl w-full mx-4 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-400">
        {/* Hospital Crest & Title */}
        <div className="space-y-4 flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-sky-500/20 to-indigo-500/20 border-2 border-emerald-400/40 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-emerald-500/10 ring-8 ring-emerald-500/5">
              <HeartPulse className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-sky-950 border border-sky-400/50 text-[10px] font-mono font-bold text-sky-300">
              UE5.3+
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[11px] font-mono tracking-widest text-slate-300 uppercase shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Simulador de Urgencias Hospitalarias & Trauma</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 drop-shadow-sm font-sans uppercase">
              HOSPITAL EMERGENCY
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-400 max-w-lg mx-auto">
              Reanimación en Paro Cardíaco, Administración de Fármacos y Desinfección Biológica en Tiempo Real
            </p>
          </div>
        </div>

        {/* Action Menu Buttons */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={handleStart}
            className="group relative w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-slate-950 font-black text-sm tracking-wider uppercase transition-all duration-200 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between cursor-pointer border border-emerald-300/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-950/15 flex items-center justify-center">
                <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
              </div>
              <span className="text-left font-black tracking-wide">INICIAR GUARDIA MÉDICA</span>
            </div>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => {
              playSelectActorSound();
              setShowGuideModal(true);
            }}
            className="w-full px-5 py-3 rounded-xl bg-[#111422]/90 hover:bg-[#181d30] border border-slate-700/70 hover:border-sky-500/50 text-slate-200 font-mono text-xs font-bold transition-all flex items-center justify-between cursor-pointer shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>GUÍA DE TRIAJE & EMERGENCIAS</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">3 Protocolos</span>
          </button>

          <button
            onClick={handleEditor}
            className="w-full px-5 py-3 rounded-xl bg-[#111422]/80 hover:bg-[#181d30] border border-slate-800 hover:border-emerald-500/40 text-slate-300 font-mono text-xs font-semibold transition-all flex items-center justify-between cursor-pointer shadow-md backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>MODO EDITOR UE5 & C++ ARCHITECTURE</span>
            </div>
            <span className="text-[10px] text-emerald-400/90 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              Dev Tools
            </span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-lg pt-2 border-t border-slate-800/80 text-left font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>DESFIBRILADOR</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">200J para Paro Cardíaco en Cama 02</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold">
              <Syringe className="w-3.5 h-3.5" />
              <span>ADRENALINA</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">Dosis para Anafilaxia en Cama 01</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>BIO-LIMPIEZA</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">Desinfección de Pasillo Tóxico</p>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-slate-500">
          <span>Unreal Engine 5 Core</span>
          <span>•</span>
          <span>Control Rig IK</span>
          <span>•</span>
          <span>Niagara Particle System</span>
        </div>
      </div>

      {/* Guide & Protocol Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-gradient-to-b from-[#131726] to-[#0c0e17] border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-5 text-left select-none">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-sans">
                    Manual Clínico de Procedimientos de Guardia
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">
                    Protocolos Médicos del Servicio de Urgencias ER-1
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Protocol 1: Epinephrine */}
              <div className="p-3.5 rounded-xl bg-[#0e121d] border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                    <Syringe className="w-4 h-4 text-amber-400" />
                    <span>1. PROTOCOLO DE ANAFILAXIA / ASFIXIA (CAMA 01)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    FÁRMACO
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Acércate a la <strong>Farmacia Clínica</strong> a la izquierda y pulsa <kbd className="px-1 py-0.2 bg-slate-800 rounded text-amber-300 font-bold border border-slate-700">[E]</kbd> para equipar la jeringa con <strong>Epinefrina (1mg)</strong> en <code className="text-sky-300">Hand_R_Socket</code>. Luego aproxímate a la camilla y pulsa <kbd className="px-1 py-0.2 bg-slate-800 rounded text-amber-300 font-bold border border-slate-700">[E]</kbd> para inyectar y estabilizar saturación.
                </p>
              </div>

              {/* Protocol 2: Defibrillator */}
              <div className="p-3.5 rounded-xl bg-[#0e121d] border border-rose-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 flex items-center gap-1.5 text-xs">
                    <Zap className="w-4 h-4 text-rose-400" />
                    <span>2. PROTOCOLO CÓDIGO AZUL / PARO CARDÍACO (CAMA 02)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    200 JOULES
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Ante la alarma sonora de paro y la sirena roja de emergencia, dirígete al <strong>Carro de Paro</strong> a la derecha, toma el <strong>Desfibrilador Bifásico</strong> con <kbd className="px-1 py-0.2 bg-slate-800 rounded text-rose-300 font-bold border border-slate-700">[E]</kbd>, y aplica la descarga en el tórax del paciente para revertir la asistolia.
                </p>
              </div>

              {/* Protocol 3: Biohazard zone */}
              <div className="p-3.5 rounded-xl bg-[#0e121d] border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    <span>3. PROTOCOLO DE DESCONTAMINACIÓN BIOLÓGICA</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    PASILLO
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  El pasillo central bloquea el paso físico mediante <code className="text-sky-300">NavBlockerBox</code> con gas tóxico Niagara. Aproxímate al perímetro y mantén o pulsa <kbd className="px-1 py-0.2 bg-slate-800 rounded text-emerald-300 font-bold border border-slate-700">[E]</kbd> para aplicar espuma descontaminante durante 4 segundos.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setShowGuideModal(false);
                  handleStart();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-slate-950 font-mono text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                ENTENDIDO • COMENZAR GUARDIA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
