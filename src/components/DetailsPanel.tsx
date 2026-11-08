/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sliders,
  Sun,
  Eye,
  Sparkles,
  CloudFog,
  Palette,
  Maximize2,
  Lightbulb,
} from 'lucide-react';
import { SceneActor, LightingEnvironment, Language } from '../types/engine';
import { getT } from '../utils/i18n';

interface DetailsPanelProps {
  selectedActor: SceneActor | null;
  onUpdateActor: (updated: SceneActor) => void;
  lighting: LightingEnvironment;
  onUpdateLighting: (updated: LightingEnvironment) => void;
  lang: Language;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({
  selectedActor,
  onUpdateActor,
  lighting,
  onUpdateLighting,
  lang,
}) => {
  const t = getT(lang);

  const handleTransformChange = (
    category: 'position' | 'rotation' | 'scale',
    axisIndex: number,
    value: number
  ) => {
    if (!selectedActor) return;
    const updated = { ...selectedActor };
    const currentArr = [...updated[category]] as [number, number, number];
    currentArr[axisIndex] = value;
    updated[category] = currentArr;
    onUpdateActor(updated);
  };

  const handleMaterialChange = (field: string, val: any) => {
    if (!selectedActor || !selectedActor.material) return;
    onUpdateActor({
      ...selectedActor,
      material: {
        ...selectedActor.material,
        [field]: val,
      },
    });
  };

  const handleLightChange = (field: string, val: any) => {
    if (!selectedActor || !selectedActor.lightProperties) return;
    onUpdateActor({
      ...selectedActor,
      lightProperties: {
        ...selectedActor.lightProperties,
        [field]: val,
      },
    });
  };

  return (
    <aside className="w-72 bg-[#14161c] border-l border-[#252833] flex flex-col h-full text-slate-300 select-none text-xs overflow-y-auto shrink-0">
      {/* Title */}
      <div className="p-3 border-b border-[#252833] flex items-center gap-1.5 font-semibold text-slate-200">
        <Sliders className="w-4 h-4 text-sky-400" />
        <span>{t.detailsTitle}</span>
        {selectedActor && (
          <span className="ml-auto text-[10px] font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
            {selectedActor.name}
          </span>
        )}
      </div>

      <div className="p-3 space-y-5">
        {/* Selected Actor Details */}
        {selectedActor ? (
          <>
            {/* Transform Section */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.transform}</span>
              </div>

              {/* Location */}
              <div>
                <label className="text-[10px] text-slate-400 font-mono mb-1 block">
                  {t.location}
                </label>
                <div className="grid grid-cols-3 gap-1.5 font-mono">
                  {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                    <div key={axis} className="flex items-center bg-[#0d0e12] rounded border border-[#262933] overflow-hidden">
                      <span className="w-4 text-center text-[10px] font-bold text-slate-500 bg-[#171922] py-1">
                        {axis}
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        value={selectedActor.position[i]}
                        onChange={(e) =>
                          handleTransformChange('position', i, parseFloat(e.target.value) || 0)
                        }
                        className="w-full bg-transparent px-1.5 py-1 text-[11px] text-slate-200 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Rotation */}
              <div>
                <label className="text-[10px] text-slate-400 font-mono mb-1 block">
                  {t.rotation} (deg)
                </label>
                <div className="grid grid-cols-3 gap-1.5 font-mono">
                  {(['P', 'Y', 'R'] as const).map((axis, i) => (
                    <div key={axis} className="flex items-center bg-[#0d0e12] rounded border border-[#262933] overflow-hidden">
                      <span className="w-4 text-center text-[10px] font-bold text-slate-500 bg-[#171922] py-1">
                        {axis}
                      </span>
                      <input
                        type="number"
                        step="5"
                        value={selectedActor.rotation[i]}
                        onChange={(e) =>
                          handleTransformChange('rotation', i, parseFloat(e.target.value) || 0)
                        }
                        className="w-full bg-transparent px-1.5 py-1 text-[11px] text-slate-200 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Scale */}
              <div>
                <label className="text-[10px] text-slate-400 font-mono mb-1 block">
                  {t.scale}
                </label>
                <div className="grid grid-cols-3 gap-1.5 font-mono">
                  {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                    <div key={axis} className="flex items-center bg-[#0d0e12] rounded border border-[#262933] overflow-hidden">
                      <span className="w-4 text-center text-[10px] font-bold text-slate-500 bg-[#171922] py-1">
                        {axis}
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedActor.scale[i]}
                        onChange={(e) =>
                          handleTransformChange('scale', i, parseFloat(e.target.value) || 1)
                        }
                        className="w-full bg-transparent px-1.5 py-1 text-[11px] text-slate-200 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PBR Material Section (if mesh) */}
            {selectedActor.material && (
              <div className="pt-3 border-t border-[#252833] space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.materials}</span>
                </div>

                {/* Base Color */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-300">{t.color}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedActor.material.color}
                      onChange={(e) => handleMaterialChange('color', e.target.value)}
                      className="w-7 h-6 rounded bg-transparent border border-slate-700 cursor-pointer"
                    />
                    <span className="font-mono text-[10px] text-slate-400">
                      {selectedActor.material.color}
                    </span>
                  </div>
                </div>

                {/* Roughness */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>{t.roughness}</span>
                    <span className="font-mono">{selectedActor.material.roughness.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={selectedActor.material.roughness}
                    onChange={(e) => handleMaterialChange('roughness', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 h-1.5 bg-[#252833] rounded cursor-pointer"
                  />
                </div>

                {/* Metalness */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>{t.metalness}</span>
                    <span className="font-mono">{selectedActor.material.metalness.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={selectedActor.material.metalness}
                    onChange={(e) => handleMaterialChange('metalness', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 h-1.5 bg-[#252833] rounded cursor-pointer"
                  />
                </div>

                {/* Clearcoat */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>{t.clearcoat}</span>
                    <span className="font-mono">{selectedActor.material.clearcoat.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={selectedActor.material.clearcoat}
                    onChange={(e) => handleMaterialChange('clearcoat', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 h-1.5 bg-[#252833] rounded cursor-pointer"
                  />
                </div>

                {/* Emissive Glow */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-300">{t.emissive}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedActor.material.emissive}
                      onChange={(e) => handleMaterialChange('emissive', e.target.value)}
                      className="w-7 h-6 rounded bg-transparent border border-slate-700 cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={selectedActor.material.emissiveIntensity}
                      onChange={(e) =>
                        handleMaterialChange('emissiveIntensity', parseFloat(e.target.value) || 0)
                      }
                      className="w-12 bg-[#0d0e12] border border-[#252833] px-1 py-0.5 text-[10px] font-mono text-center rounded text-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Light Properties Section */}
            {selectedActor.lightProperties && (
              <div className="pt-3 border-t border-[#252833] space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Properties</span>
                </div>

                {/* Light Color */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-300">Light Color</span>
                  <input
                    type="color"
                    value={selectedActor.lightProperties.color}
                    onChange={(e) => handleLightChange('color', e.target.value)}
                    className="w-7 h-6 rounded bg-transparent border border-slate-700 cursor-pointer"
                  />
                </div>

                {/* Intensity */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Intensity (Candela)</span>
                    <span className="font-mono">{selectedActor.lightProperties.intensity}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.5"
                    value={selectedActor.lightProperties.intensity}
                    onChange={(e) => handleLightChange('intensity', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-[#252833] rounded cursor-pointer"
                  />
                </div>

                {/* Cast Shadows */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-300">Cast Real-Time Shadows</span>
                  <input
                    type="checkbox"
                    checked={selectedActor.lightProperties.castShadow}
                    onChange={(e) => handleLightChange('castShadow', e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-3 bg-[#101217] rounded-lg border border-[#222530] text-center text-slate-500">
            <span className="block text-xs font-medium text-slate-400 mb-1">
              No Actor Selected
            </span>
            <span className="text-[10px]">
              Click any 3D object in the viewport or World Outliner to inspect transform, PBR material, and lighting.
            </span>
          </div>
        )}

        {/* Post-Processing Volume & Dynamic Lighting Tension Settings */}
        <div className="pt-3 border-t border-[#252833] space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Post-Processing Volume</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
              ACTIVO
            </span>
          </div>

          {/* Perfiles de Iluminación de Tensión Diseñados por Artistas */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono block">
              Atmósfera de Tensión Narrativa:
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onUpdateLighting({
                    ...lighting,
                    sunAzimuth: 145,
                    sunElevation: 50,
                    sunIntensity: 1.2,
                    sunColor: '#f8fafc',
                    skyLightIntensity: 0.55,
                    exposure: 0.7,
                    bloomIntensity: 0.5,
                    bloomThreshold: 1.2,
                    emergencyAlarmActive: false,
                  })
                }
                className={`flex items-center justify-between p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  !lighting.emergencyAlarmActive
                    ? 'bg-sky-950/50 border-sky-500/50 text-sky-200'
                    : 'bg-[#181a24] border-[#2d3244] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <div className="text-[11px] font-semibold text-slate-200">Guardia Clínica Estándar</div>
                    <div className="text-[9px] text-slate-400">Iluminación nítida, luz transparente y anti-destellos</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">NORMAL</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateLighting({
                    ...lighting,
                    sunAzimuth: 220,
                    sunElevation: 25,
                    sunIntensity: 0.85,
                    sunColor: '#38bdf8',
                    skyLightIntensity: 0.42,
                    exposure: 0.65,
                    bloomIntensity: 0.8,
                    bloomThreshold: 1.2,
                    emergencyAlarmActive: true,
                  })
                }
                className={`flex items-center justify-between p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  lighting.emergencyAlarmActive
                    ? 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                    : 'bg-[#181a24] border-[#2d3244] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <div>
                    <div className="text-[11px] font-semibold text-rose-300">Código Azul (Emergencia)</div>
                    <div className="text-[9px] text-rose-400/80">Estrobos rojo/azul transparentes de alta visibilidad</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-rose-400">ALARMA</span>
              </button>
            </div>
          </div>

          {/* Estado de Módulos de Post-Procesado Fijo Party-Game */}
          <div className="space-y-1.5 p-2.5 rounded-lg bg-[#10121a] border border-[#252838]">
            <div className="text-[10px] font-mono text-slate-400 font-semibold mb-1 flex items-center justify-between">
              <span>PIPELINE GRÁFICO (ANTI-GLARE):</span>
              <span className="text-sky-400 text-[9px]">PBR + POST-FX</span>
            </div>

            <div className="space-y-1 text-[10px] font-mono">
              <div className="flex items-center justify-between py-0.5 border-b border-slate-800/60">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="text-sky-400">●</span> Bloom Quirúrgico (Glow LEDs/CRT):
                </span>
                <span className="text-emerald-400">0.26x (Threshold 1.2)</span>
              </div>

              <div className="flex items-center justify-between py-0.5 border-b border-slate-800/60">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="text-purple-400">●</span> Color Grading Transparente:
                </span>
                <span className="text-emerald-400">+15% Sat / +5% Cont</span>
              </div>

              <div className="flex items-center justify-between py-0.5 border-b border-slate-800/60">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="text-amber-400">●</span> Contact Ambient Occlusion:
                </span>
                <span className="text-emerald-400">Activo (Profundidad)</span>
              </div>

              <div className="flex items-center justify-between py-0.5 border-b border-slate-800/60">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="text-rose-400">●</span> Estrobos Cenitales Rojo/Azul:
                </span>
                <span className="text-emerald-400">Sincronizados (2.5Hz)</span>
              </div>

              <div className="flex items-center justify-between py-0.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="text-teal-400">●</span> Tone Mapping Cinematográfico:
                </span>
                <span className="text-emerald-400">ACES Filmic</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
