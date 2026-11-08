/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  Cpu,
  HardDrive,
  Monitor,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  Zap,
  Sparkles,
  Layers,
  Flame,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { Language } from '../types/engine';
import { getT } from '../utils/i18n';

interface InstallationModalProps {
  lang: Language;
}

export const InstallationModal: React.FC<InstallationModalProps> = ({ lang }) => {
  const t = getT(lang);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Hardware Checker Form State
  const [userOS, setUserOS] = useState('win11');
  const [userRAM, setUserRAM] = useState(32);
  const [userGPU, setUserGPU] = useState('rtx3060');
  const [userStorage, setUserStorage] = useState('nvme');

  const copyToClipboard = (text: string, index: number) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(null), 2000);
        })
        .catch(() => {
          fallbackCopy(text, index);
        });
    } else {
      fallbackCopy(text, index);
    }
  };

  const fallbackCopy = (text: string, index: number) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Ignorar
    }
  };

  const isLumenHardwareReady =
    (userGPU === 'rtx3060' || userGPU === 'rtx4070' || userGPU === 'rx6800') &&
    userRAM >= 16;

  return (
    <div className="w-full h-full bg-[#0d0e13] text-slate-200 overflow-y-auto select-none p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="relative rounded-2xl bg-gradient-to-r from-[#171a26] via-[#1a1e2e] to-[#12141d] border border-sky-500/20 p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/30 text-sky-400 text-xs font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>UNREAL ENGINE 5.5 OFFICIAL DEPLOYMENT GUIDE</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                {lang === 'es'
                  ? 'Cómo Instalar Unreal Engine 5 para Gráficos Fotorrealistas'
                  : 'How to Install Unreal Engine 5 for High-End 3D Games'}
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed">
                {lang === 'es'
                  ? 'Guía oficial paso a paso para instalar el motor, configurar la aceleración de trazado de rayos por hardware (Lumen GI), geometría virtualizada Nanite y compilar en C++ con Visual Studio 2022.'
                  : 'Official step-by-step verified guide to install Unreal Engine 5.5, configure Lumen Dynamic Global Illumination, Nanite virtualized geometry, and setup C++ with Visual Studio 2022.'}
              </p>
            </div>

            {/* Direct Official Link Button */}
            <a
              href="https://www.unrealengine.com/download"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{t.officialDownloadBtn}</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-75" />
            </a>
          </div>
        </div>

        {/* Section 1: Interactive System & Hardware Checker */}
        <div className="rounded-xl bg-[#141620] border border-[#262a3b] p-6 space-y-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#262a3b] pb-4">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-sky-400" />
              <div>
                <h2 className="text-base font-bold text-white">{t.systemReqs}</h2>
                <p className="text-xs text-slate-400">
                  {lang === 'es'
                    ? 'Verifica si tu PC soporta Lumen con trazado de rayos por hardware y Nanite'
                    : 'Verify if your workstation supports Lumen Hardware Ray Tracing and Nanite'}
                </p>
              </div>
            </div>

            <div
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-2 border ${
                isLumenHardwareReady
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isLumenHardwareReady
                  ? 'LUMEN HARDWARE RAYTRACING: READY'
                  : 'LUMEN SOFTWARE MODE'}
              </span>
            </div>
          </div>

          {/* Interactive Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* OS */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold">{t.os}</label>
              <select
                value={userOS}
                onChange={(e) => setUserOS(e.target.value)}
                className="w-full bg-[#1b1e2a] border border-[#2f3547] rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="win11">Windows 11 64-bit (DirectX 12 Agility SDK)</option>
                <option value="win10">Windows 10 64-bit v21H2+</option>
                <option value="macos">macOS 14+ Sonoma (Apple Silicon M2/M3/M4)</option>
                <option value="linux">Linux Ubuntu 22.04 LTS (Vulkan)</option>
              </select>
            </div>

            {/* RAM */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold">{t.ram}</label>
              <select
                value={userRAM}
                onChange={(e) => setUserRAM(parseInt(e.target.value))}
                className="w-full bg-[#1b1e2a] border border-[#2f3547] rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value={16}>16 GB DDR4/DDR5 (Minimum for UE5)</option>
                <option value={32}>32 GB DDR4/DDR5 (Recommended)</option>
                <option value={64}>64 GB+ (Optimal for Large Open Worlds)</option>
              </select>
            </div>

            {/* GPU */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold">{t.gpu}</label>
              <select
                value={userGPU}
                onChange={(e) => setUserGPU(e.target.value)}
                className="w-full bg-[#1b1e2a] border border-[#2f3547] rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="rtx4070">NVIDIA GeForce RTX 4070 / 4080 / 4090 (Hardware Lumen)</option>
                <option value="rtx3060">NVIDIA GeForce RTX 3060 / 3070 / 3080 (Hardware Lumen)</option>
                <option value="rx6800">AMD Radeon RX 6800 / 7800 XT (Hardware Lumen)</option>
                <option value="gtx1060">NVIDIA GTX 1060 / 1660 (Software Lumen Only)</option>
              </select>
            </div>

            {/* Storage */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold">{t.storage}</label>
              <select
                value={userStorage}
                onChange={(e) => setUserStorage(e.target.value)}
                className="w-full bg-[#1b1e2a] border border-[#2f3547] rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="nvme">NVMe M.2 SSD (100 GB+ free space - Recommended)</option>
                <option value="sata">SATA SSD (100 GB+ free space)</option>
                <option value="hdd">HDD (Slow shader compilation)</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-[#11131a] rounded-lg border border-[#242838] flex items-center gap-3 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t.recommendedSpecs}</span>
          </div>
        </div>

        {/* Section 2: Step-by-Step Installation Walkthrough */}
        <div className="rounded-xl bg-[#141620] border border-[#262a3b] p-6 space-y-6 shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-[#262a3b] pb-4">
            <Download className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">{t.stepByStep}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-[#191c28] border border-[#2b3044] space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-black font-extrabold flex items-center justify-center text-xs">
                  1
                </span>
                <span className="text-[10px] font-mono text-slate-500">Official Launcher</span>
              </div>
              <h3 className="font-bold text-sm text-white">
                {lang === 'es' ? 'Descargar Epic Games Launcher' : 'Download Epic Games Launcher'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'es'
                  ? 'Ve a unrealengine.com/download, inicia sesión con tu cuenta de Epic Games y descarga el instalador del Epic Games Launcher para tu sistema operativo.'
                  : 'Go to unrealengine.com/download, log in with your Epic Games account, and download the Epic Games Launcher setup installer.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-[#191c28] border border-[#2b3044] space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-black font-extrabold flex items-center justify-center text-xs">
                  2
                </span>
                <span className="text-[10px] font-mono text-slate-500">Engine 5.5+</span>
              </div>
              <h3 className="font-bold text-sm text-white">
                {lang === 'es' ? 'Instalar Unreal Engine 5.5' : 'Install Unreal Engine 5.5'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'es'
                  ? 'Abre Epic Games Launcher, haz clic en la pestaña "Unreal Engine" a la izquierda, navega a "Biblioteca", haz clic en el botón "+" junto a Versiones del Motor y pulsa "Instalar" para UE 5.5.'
                  : 'Open Epic Games Launcher, click the "Unreal Engine" tab on the left sidebar, navigate to "Library", click the "+" icon beside Engine Versions, and choose Unreal Engine 5.5.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-[#191c28] border border-[#2b3044] space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-black font-extrabold flex items-center justify-center text-xs">
                  3
                </span>
                <span className="text-[10px] font-mono text-slate-500">Component Setup</span>
              </div>
              <h3 className="font-bold text-sm text-white">
                {lang === 'es' ? 'Configurar Componentes y Opciones' : 'Configure Installation Options'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'es'
                  ? 'Haz clic en "Opciones" en el menú desplegable del motor. Marca "Starter Content" (contenido de inicio) y "Engine Source" para soporte completo de desarrollo.'
                  : 'Click the dropdown arrow next to the Launch button and select "Options". Ensure "Starter Content", "Templates and Feature Packs", and "Engine Source" are checked.'}
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-[#191c28] border border-[#2b3044] space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-black font-extrabold flex items-center justify-center text-xs">
                  4
                </span>
                <span className="text-[10px] font-mono text-slate-500">IDE C++</span>
              </div>
              <h3 className="font-bold text-sm text-white">
                {lang === 'es' ? 'Instalar Visual Studio 2022' : 'Install Visual Studio 2022'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'es'
                  ? 'Para programar juegos en C++ y compilar plugins, instala Visual Studio 2022 Community con la carga de trabajo "Desarrollo para el desarrollo de juegos con C++".'
                  : 'Download Visual Studio 2022 Community edition and install the "Game development with C++" workload including Windows 10/11 SDK and Unreal Engine installer.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Lumen & Nanite Photorealism Masterclass */}
        <div className="rounded-xl bg-[#141620] border border-[#262a3b] p-6 space-y-5 shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-[#262a3b] pb-4">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">{t.lumenNaniteGuide}</h2>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-lg bg-[#181a26] border border-[#2c3147] space-y-2">
              <div className="font-bold text-sky-400 text-sm flex items-center gap-2">
                <span>1. Project Settings Configuration</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-slate-300 font-mono text-[11px]">
                <li>
                  <strong className="text-white">Dynamic Global Illumination Method:</strong> Set to{' '}
                  <span className="text-emerald-400 font-bold">Lumen</span> (under Project Settings →
                  Engine → Rendering).
                </li>
                <li>
                  <strong className="text-white">Reflection Method:</strong> Set to{' '}
                  <span className="text-emerald-400 font-bold">Lumen</span>.
                </li>
                <li>
                  <strong className="text-white">Shadow Map Method:</strong> Set to{' '}
                  <span className="text-emerald-400 font-bold">Virtual Shadow Maps (VSMs)</span> for
                  cinematic soft penumbra and high-resolution contact shadows.
                </li>
                <li>
                  <strong className="text-white">Support Hardware Ray Tracing:</strong> Check{' '}
                  <span className="text-sky-300">Enabled</span> (Requires DirectX 12 Default RHI).
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-[#181a26] border border-[#2c3147] space-y-2">
              <div className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <span>2. Post Process Volume & Atmosphere Tuning</span>
              </div>
              <p>
                {lang === 'es'
                  ? 'Añade un actor de Post Process Volume a tu nivel, marca "Infinite Extent (Unbound)" para que afecte todo el mundo, y ajusta Lumen Scene Detail a 2.0 y Max Roughness a 0.8 para reflejos fotorrealistas en metales y cristales.'
                  : 'Place a Post Process Volume in your map, enable "Infinite Extent (Unbound)", and calibrate Lumen Scene Detail to 2.0 and Max Roughness to 0.8 to unlock mirror-sharp reflections across metallic bevels and glass.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Quick Terminal Scripts & Git Source Clone */}
        <div className="rounded-xl bg-[#141620] border border-[#262a3b] p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-[#262a3b] pb-4">
            <Terminal className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">
              {lang === 'es' ? 'Comandos de Consola y Código Fuente' : 'CLI Commands & Engine Source Build'}
            </h2>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Command 1: Git Clone */}
            <div className="p-3 bg-[#0a0c10] rounded-lg border border-[#242838] flex items-center justify-between gap-4">
              <div className="truncate">
                <span className="text-slate-500"># Git Clone Unreal Engine 5.5 Source (GitHub Link)</span>
                <div className="text-emerald-400 truncate mt-0.5">
                  git clone -b 5.5 https://github.com/EpicGames/UnrealEngine.git
                </div>
              </div>
              <button
                onClick={() =>
                  copyToClipboard('git clone -b 5.5 https://github.com/EpicGames/UnrealEngine.git', 1)
                }
                className="px-2.5 py-1.5 rounded bg-[#1e2230] hover:bg-[#2a3045] text-slate-300 hover:text-white flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 1 ? t.copied : t.copyCommand}</span>
              </button>
            </div>

            {/* Command 2: Visual Studio winget */}
            <div className="p-3 bg-[#0a0c10] rounded-lg border border-[#242838] flex items-center justify-between gap-4">
              <div className="truncate">
                <span className="text-slate-500"># Install Visual Studio 2022 via Windows Package Manager</span>
                <div className="text-sky-400 truncate mt-0.5">
                  winget install Microsoft.VisualStudio.2022.Community
                </div>
              </div>
              <button
                onClick={() =>
                  copyToClipboard('winget install Microsoft.VisualStudio.2022.Community', 2)
                }
                className="px-2.5 py-1.5 rounded bg-[#1e2230] hover:bg-[#2a3045] text-slate-300 hover:text-white flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 2 ? t.copied : t.copyCommand}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
