/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  Box,
  Palette,
  Zap,
  Volume2,
  Sun,
  Search,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Language } from '../types/engine';
import { getT } from '../utils/i18n';

interface ContentBrowserProps {
  onSpawnAsset: (assetType: string) => void;
  lang: Language;
}

interface AssetEntry {
  id: string;
  name: string;
  type: 'mesh' | 'material' | 'blueprint' | 'audio' | 'light';
  folder: string;
  badge: string;
  color: string;
  description: string;
}

const ASSET_LIBRARY: AssetEntry[] = [
  {
    id: 'sm_reactor_core',
    name: 'SM_SciFi_ReactorCore',
    type: 'mesh',
    folder: 'Meshes',
    badge: 'StaticMesh',
    color: 'from-cyan-950 to-blue-900 border-cyan-500/40 text-cyan-300',
    description: 'High-detail cyber reactor with emissive energy manifold',
  },
  {
    id: 'sm_pillar_column',
    name: 'SM_Temple_Pillar',
    type: 'mesh',
    folder: 'Meshes',
    badge: 'StaticMesh',
    color: 'from-slate-900 to-zinc-800 border-slate-600 text-slate-300',
    description: 'Beveled architectural monolith with stone normal mapping',
  },
  {
    id: 'sm_chrome_orb',
    name: 'SM_PBR_CalibrationSphere',
    type: 'mesh',
    folder: 'Meshes',
    badge: 'StaticMesh',
    color: 'from-slate-800 to-slate-900 border-sky-500/30 text-sky-300',
    description: 'Mirror chrome sphere for real-time reflection probes',
  },
  {
    id: 'm_titanium_pbr',
    name: 'M_Brushed_Titanium',
    type: 'material',
    folder: 'Materials',
    badge: 'Material',
    color: 'from-emerald-950 to-teal-900 border-emerald-500/40 text-emerald-300',
    description: 'Anisotropic metallic surface with micro-roughness grooves',
  },
  {
    id: 'm_marble_tile',
    name: 'M_Polished_MarbleGrout',
    type: 'material',
    folder: 'Materials',
    badge: 'Material',
    color: 'from-purple-950 to-indigo-900 border-purple-500/40 text-purple-300',
    description: 'High clearcoat reflective floor tile with procedural veining',
  },
  {
    id: 'bp_lumen_rig',
    name: 'BP_LumenDynamicRig',
    type: 'blueprint',
    folder: 'Blueprints',
    badge: 'Blueprint',
    color: 'from-amber-950 to-orange-900 border-amber-500/40 text-amber-300',
    description: 'Automated day/night sun cycle with sky color temperature modulation',
  },
  {
    id: 'lt_neon_spot',
    name: 'LT_Cyberpunk_SpotRig',
    type: 'light',
    folder: 'Lighting',
    badge: 'LightRig',
    color: 'from-pink-950 to-rose-900 border-pink-500/40 text-pink-300',
    description: 'Real-time soft shadow casting colored spotlight panel',
  },
  {
    id: 'au_core_hum',
    name: 'A_Reactor_AmbientLoop',
    type: 'audio',
    folder: 'Audio',
    badge: 'AudioCue',
    color: 'from-lime-950 to-emerald-900 border-lime-500/40 text-lime-300',
    description: 'Procedural synthesized sub-bass mechanical hum',
  },
];

export const ContentBrowser: React.FC<ContentBrowserProps> = ({ onSpawnAsset, lang }) => {
  const t = getT(lang);
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const folders = ['All', 'Meshes', 'Materials', 'Blueprints', 'Lighting', 'Audio'];

  const filteredAssets = ASSET_LIBRARY.filter((asset) => {
    const matchesFolder = selectedFolder === 'All' || asset.folder === selectedFolder;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="w-full h-full bg-[#101217] text-slate-300 select-none flex flex-col font-sans">
      {/* Content Header & Search */}
      <div className="h-12 bg-[#151720] border-b border-[#252834] px-4 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-slate-200">Content Drawer</span>
          <span className="text-slate-500">/</span>
          <span className="font-mono text-sky-400">/Game/Content/{selectedFolder}</span>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-[#0c0d12] px-3 py-1.5 rounded border border-[#242733] w-64">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-200 focus:outline-none placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Folders Sidebar */}
        <div className="w-48 bg-[#13151c] border-r border-[#222532] p-2 space-y-1 text-xs shrink-0">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 tracking-wider">
            Folders
          </div>
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded transition-colors text-left cursor-pointer ${
                selectedFolder === folder
                  ? 'bg-[#222735] text-sky-400 font-semibold border border-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1c24]'
              }`}
            >
              {selectedFolder === folder ? (
                <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{folder}</span>
            </button>
          ))}
        </div>

        {/* Asset Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="group rounded-lg bg-[#161822] border border-[#262938] hover:border-sky-500/50 transition-all p-3 flex flex-col justify-between shadow-lg"
              >
                <div>
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-300">
                      {asset.badge}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{asset.folder}</span>
                  </div>

                  {/* Asset Card Icon / Preview Thumbnail */}
                  <div
                    className={`h-24 rounded-md bg-gradient-to-br ${asset.color} border flex items-center justify-center mb-3 shadow-inner`}
                  >
                    {asset.type === 'mesh' && <Box className="w-8 h-8 opacity-80" />}
                    {asset.type === 'material' && <Palette className="w-8 h-8 opacity-80" />}
                    {asset.type === 'blueprint' && <Zap className="w-8 h-8 opacity-80" />}
                    {asset.type === 'light' && <Sun className="w-8 h-8 opacity-80" />}
                    {asset.type === 'audio' && <Volume2 className="w-8 h-8 opacity-80" />}
                  </div>

                  {/* Asset Name & Details */}
                  <h4 className="font-mono text-xs font-bold text-slate-200 group-hover:text-sky-300 transition-colors truncate">
                    {asset.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {asset.description}
                  </p>
                </div>

                {/* Place into Scene Action */}
                <button
                  onClick={() => onSpawnAsset(asset.type)}
                  className="mt-3 w-full py-1.5 px-2 rounded bg-[#202432] hover:bg-sky-600 hover:text-white text-sky-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-sky-500/20 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Spawn in Viewport</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
