/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Box,
  Lightbulb,
  Sun,
  Flame,
  Search,
  Sparkles,
} from 'lucide-react';
import { SceneActor, ScenePreset, Language } from '../types/engine';
import { getT } from '../utils/i18n';

interface WorldOutlinerProps {
  actors: SceneActor[];
  selectedActorId: string | null;
  onSelectActor: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteActor: (id: string) => void;
  onAddActor: (type: 'mesh' | 'point_light' | 'spot_light' | 'particle_core') => void;
  scenePreset: ScenePreset;
  onSelectPreset: (preset: ScenePreset) => void;
  lang: Language;
}

export const WorldOutliner: React.FC<WorldOutlinerProps> = ({
  actors,
  selectedActorId,
  onSelectActor,
  onToggleVisibility,
  onDeleteActor,
  onAddActor,
  scenePreset,
  onSelectPreset,
  lang,
}) => {
  const t = getT(lang);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);

  const filteredActors = actors.filter((actor) =>
    actor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActorIcon = (type: string, name: string) => {
    if (type === 'directional_light') return <Sun className="w-3.5 h-3.5 text-amber-400" />;
    if (type === 'point_light' || type === 'spot_light')
      return <Lightbulb className="w-3.5 h-3.5 text-sky-400" />;
    if (type === 'particle_core') return <Flame className="w-3.5 h-3.5 text-cyan-400" />;
    return <Box className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <aside className="w-64 bg-[#14161c] border-r border-[#252833] flex flex-col h-full text-slate-300 select-none text-xs shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-[#252833] flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>{t.outlinerTitle}</span>
        </div>

        {/* Add Actor Button */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#222733] hover:bg-[#2c3342] text-sky-300 text-[11px] font-medium border border-sky-500/30 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>{t.addActor}</span>
          </button>

          {showAddMenu && (
            <div className="absolute right-0 top-7 w-48 bg-[#1a1c24] border border-[#2c303f] rounded-lg shadow-xl p-1 z-50">
              <button
                onClick={() => {
                  onAddActor('point_light');
                  setShowAddMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#252a38] text-slate-200 flex items-center gap-2"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.pointLight}</span>
              </button>
              <button
                onClick={() => {
                  onAddActor('spot_light');
                  setShowAddMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#252a38] text-slate-200 flex items-center gap-2"
              >
                <Lightbulb className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.spotLight}</span>
              </button>
              <button
                onClick={() => {
                  onAddActor('mesh');
                  setShowAddMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#252a38] text-slate-200 flex items-center gap-2"
              >
                <Box className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.cube}</span>
              </button>
              <button
                onClick={() => {
                  onAddActor('particle_core');
                  setShowAddMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#252a38] text-slate-200 flex items-center gap-2"
              >
                <Flame className="w-3.5 h-3.5 text-cyan-400" />
                <span>Reactor Core FX</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scene Presets Selector */}
      <div className="p-2.5 border-b border-[#252833] bg-[#101217]">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
          {t.presets}
        </div>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => onSelectPreset('emergency_room')}
            className={`px-1 py-1 rounded text-[10px] font-medium transition-colors ${
              scenePreset === 'emergency_room'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                : 'bg-[#181a22] text-slate-400 hover:text-slate-200'
            }`}
          >
            ER Room
          </button>
          <button
            onClick={() => onSelectPreset('operating_theater')}
            className={`px-1 py-1 rounded text-[10px] font-medium transition-colors ${
              scenePreset === 'operating_theater'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                : 'bg-[#181a22] text-slate-400 hover:text-slate-200'
            }`}
          >
            Quirófano
          </button>
          <button
            onClick={() => onSelectPreset('triage_bay')}
            className={`px-1 py-1 rounded text-[10px] font-medium transition-colors ${
              scenePreset === 'triage_bay'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                : 'bg-[#181a22] text-slate-400 hover:text-slate-200'
            }`}
          >
            Triaje
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-[#252833]">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#0d0e12] border border-[#252833] text-slate-400">
          <Search className="w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search actors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-200 focus:outline-none placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Actors List */}
      <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
        {filteredActors.map((actor) => {
          const isSelected = selectedActorId === actor.id;

          return (
            <div
              key={actor.id}
              onClick={() => onSelectActor(actor.id)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer group transition-colors ${
                isSelected
                  ? 'bg-[#1e293b] text-sky-300 border border-sky-500/30'
                  : 'hover:bg-[#1a1d26] text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {getActorIcon(actor.type, actor.name)}
                <span className="truncate text-xs">{actor.name}</span>
              </div>

              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(actor.id);
                  }}
                  className="p-1 hover:text-white transition-colors"
                  title="Toggle Visibility"
                >
                  {actor.visible ? (
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </button>

                {!actor.locked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteActor(actor.id);
                    }}
                    className="p-1 hover:text-red-400 transition-colors"
                    title="Delete Actor"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
