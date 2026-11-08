/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ActiveTab,
  ViewportMode,
  ScenePreset,
  SceneActor,
  LightingEnvironment,
  Language,
} from './types/engine';
import { TopToolbar } from './components/TopToolbar';
import { WorldOutliner } from './components/WorldOutliner';
import { DetailsPanel } from './components/DetailsPanel';
import { Viewport3D } from './components/Viewport3D';
import { BottomControlDock } from './components/BottomControlDock';
import { BlueprintEditor } from './components/BlueprintEditor';
import { ArchitectureHub } from './components/ArchitectureHub';
import { ContentBrowser } from './components/ContentBrowser';
import { InstallationModal } from './components/InstallationModal';
import { MainMenu } from './components/MainMenu';

const DEFAULT_LIGHTING: LightingEnvironment = {
  timeOfDay: 14.0,
  sunAzimuth: 145,
  sunElevation: 50,
  sunIntensity: 1.2,
  sunColor: '#f8fafc',
  skyLightIntensity: 0.55,
  lumenGIMultiplier: 1.0,
  indirectBounce: true,
  volumetricFog: false,
  fogDensity: 0.01,
  fogColor: '#0a0d14',
  exposure: 0.7,
  bloomIntensity: 0.5,
  bloomThreshold: 1.2,
  screenSpaceReflections: true,
  vignette: true,
  cameraFov: 55,
  emergencyAlarmActive: false,
};

// Emergency Room Hospital Actors (Matriz de 5 Departamentos & Core Radial Layout)
const HOSPITAL_ACTORS: SceneActor[] = [
  // 1. SALA DE ADMISIÓN & TRIAJE (Capacidad: 6 Pacientes en espera)
  {
    id: 'kiosk_triage',
    name: 'BP_Triage_Kiosk_EMR',
    type: 'triage_kiosk',
    department: 'triage_admission',
    position: [0.0, 0, -6.8],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    visible: true,
  },
  {
    id: 'nurse_assistant_triage',
    name: 'BP_Nurse_Triage_Elena',
    type: 'nurse_assistant',
    department: 'triage_admission',
    position: [-0.6, 0, -5.8],
    rotation: [0, 180, 0],
    scale: [1, 1, 1],
    visible: true,
  },

  // 2. BAHÍAS DE REANIMACIÓN (Trauma / Código Azul) (2 Camillas Críticas)
  {
    id: 'stretcher_resus_1',
    name: 'BP_Resus_Bed_01',
    type: 'patient_stretcher',
    department: 'resuscitation_bay',
    position: [5.6, 0, 0.2],
    rotation: [0, -90, 0],
    scale: [1, 1, 1],
    visible: true,
    patientVitals: {
      heartRate: 142,
      oxygenSaturation: 82,
      patientHealth: 62,
      currentState: 'Diagnosed',
      assignedDisease: 'Anaphylaxis',
      deteriorationRate: 2.8,
    },
    medicalCaseData: {
      caseId: 'CASE_RESUS_01',
      patientName: 'Sr. Martinez (Trauma)',
      requiredDrug: 'Epinephrine',
      diseaseName: 'Anaphylaxis',
      pointsOnSuccess: 120,
      triggerBoxExtent: [3.8, 2.5, 4.6],
    },
  },
  {
    id: 'stretcher_resus_2',
    name: 'BP_Resus_Bed_02',
    type: 'patient_stretcher',
    department: 'resuscitation_bay',
    position: [5.6, 0, 3.8],
    rotation: [0, -90, 0],
    scale: [1, 1, 1],
    visible: true,
    patientVitals: {
      heartRate: 215,
      oxygenSaturation: 52,
      patientHealth: 12,
      currentState: 'CardiacArrest',
      assignedDisease: 'BacterialPneumonia',
      deteriorationRate: 4.2,
    },
    medicalCaseData: {
      caseId: 'CASE_RESUS_02',
      patientName: 'Dra. Castillo (Código Azul)',
      requiredDrug: 'Defibrillator',
      diseaseName: 'BacterialPneumonia',
      pointsOnSuccess: 150,
      triggerBoxExtent: [3.8, 2.5, 4.6],
    },
  },
  {
    id: 'defib_cart',
    name: 'BP_Defibrillator_CrashCart',
    type: 'defib_station',
    department: 'resuscitation_bay',
    position: [8.2, 0, 2.0],
    rotation: [0, -90, 0],
    scale: [1, 1, 1],
    visible: true,
    stationItem: 'Defibrillator',
  },

  // 3. CUBÍCULOS DE TRATAMIENTO ESTÁNDAR (4 Camillas de Observación)
  {
    id: 'stretcher_treat_1',
    name: 'BP_Observ_Bed_01',
    type: 'patient_stretcher',
    department: 'treatment_cubicles',
    position: [-5.6, 0, -2.6],
    rotation: [0, 90, 0],
    scale: [1, 1, 1],
    visible: true,
    patientVitals: {
      heartRate: 115,
      oxygenSaturation: 89,
      patientHealth: 74,
      currentState: 'Diagnosed',
      assignedDisease: 'BacterialPneumonia',
      deteriorationRate: 1.8,
    },
    medicalCaseData: {
      caseId: 'CASE_OBS_01',
      patientName: 'Carlos Vega',
      requiredDrug: 'IVBag',
      diseaseName: 'BacterialPneumonia',
      pointsOnSuccess: 100,
      triggerBoxExtent: [3.8, 2.5, 4.6],
    },
  },
  {
    id: 'stretcher_treat_2',
    name: 'BP_Observ_Bed_02',
    type: 'patient_stretcher',
    department: 'treatment_cubicles',
    position: [-5.6, 0, 0.4],
    rotation: [0, 90, 0],
    scale: [1, 1, 1],
    visible: true,
    patientVitals: {
      heartRate: 98,
      oxygenSaturation: 93,
      patientHealth: 82,
      currentState: 'Diagnosed',
      assignedDisease: 'Anaphylaxis',
      deteriorationRate: 1.6,
    },
    medicalCaseData: {
      caseId: 'CASE_OBS_02',
      patientName: 'Valeria Rios',
      requiredDrug: 'Epinephrine',
      diseaseName: 'Anaphylaxis',
      pointsOnSuccess: 100,
      triggerBoxExtent: [3.8, 2.5, 4.6],
    },
  },
  {
    id: 'stretcher_treat_3',
    name: 'BP_Observ_Bed_03',
    type: 'patient_stretcher',
    department: 'treatment_cubicles',
    position: [-5.6, 0, 3.4],
    rotation: [0, 90, 0],
    scale: [1, 1, 1],
    visible: true,
    patientVitals: {
      heartRate: 74,
      oxygenSaturation: 98,
      patientHealth: 100,
      currentState: 'Cured',
      assignedDisease: 'None',
      deteriorationRate: 0,
    },
    medicalCaseData: {
      caseId: 'CASE_OBS_03',
      patientName: 'Ignacio Soto',
      requiredDrug: 'None',
      diseaseName: 'None',
      pointsOnSuccess: 100,
      triggerBoxExtent: [3.8, 2.5, 4.6],
    },
  },
  {
    id: 'stretcher_treat_4',
    name: 'BP_Observ_Bed_04',
    type: 'patient_stretcher',
    department: 'treatment_cubicles',
    position: [-8.4, 0, 0.4],
    rotation: [0, 90, 0],
    scale: [1, 1, 1],
    visible: true,
    patientVitals: {
      heartRate: 72,
      oxygenSaturation: 99,
      patientHealth: 100,
      currentState: 'Cured',
      assignedDisease: 'None',
      deteriorationRate: 0,
    },
    medicalCaseData: {
      caseId: 'CASE_OBS_04',
      patientName: 'Lucía Blanco',
      requiredDrug: 'None',
      diseaseName: 'None',
      pointsOnSuccess: 100,
      triggerBoxExtent: [3.8, 2.5, 4.6],
    },
  },

  // 4. FARMACIA CENTRAL (Dispenser Station Pyxis - Reabastecimiento dinámico 20s)
  {
    id: 'pharmacy_cabinet',
    name: 'BP_Pyxis_CentralDispenser',
    type: 'pharmacy_cabinet',
    department: 'central_pharmacy',
    position: [-3.2, 0, 6.8],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    visible: true,
    stationItem: 'Epinephrine',
  },
  {
    id: 'pharmacy_tech_1',
    name: 'BP_Pharmacy_Tech_Roberto',
    type: 'nurse_assistant',
    department: 'central_pharmacy',
    position: [-1.4, 0, 7.0],
    rotation: [0, -90, 0],
    scale: [1, 1, 1],
    visible: true,
  },

  // 5. ZONA DE CONTAMINACIÓN / HAZMAT & DUCHA QUÍMICA
  {
    id: 'hazmat_station',
    name: 'BP_Hazmat_DeconStation',
    type: 'hazmat_station',
    department: 'hazmat_decon',
    position: [3.2, 0, 6.8],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    visible: true,
  },
  {
    id: 'danger_zone_corridor',
    name: 'BP_DangerZone_CentralCorridor',
    type: 'danger_zone',
    department: 'hazmat_decon',
    position: [0.0, 0.05, -2.4],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    visible: true,
    zoneStatus: 'Contaminated',
    zoneRequiredCleaningTime: 4.0,
  },
  {
    id: 'danger_zone_pharmacy',
    name: 'BP_DangerZone_PharmacyCorridor',
    type: 'danger_zone',
    department: 'central_pharmacy',
    position: [-3.8, 0.05, 3.2],
    rotation: [0, 0, 0],
    scale: [0.85, 1, 0.85],
    visible: true,
    zoneStatus: 'Clean',
    zoneRequiredCleaningTime: 4.0,
  },
  {
    id: 'danger_zone_transit',
    name: 'BP_DangerZone_TransitCorridor',
    type: 'danger_zone',
    department: 'resuscitation_bay',
    position: [3.8, 0.05, 3.2],
    rotation: [0, 0, 0],
    scale: [0.85, 1, 0.85],
    visible: true,
    zoneStatus: 'Clean',
    zoneRequiredCleaningTime: 4.0,
  },

  // Luces de escena
  {
    id: 'room_ceiling_spot',
    name: 'LT_Ceiling_SurgicalLight',
    type: 'spot_light',
    position: [0, 8, 2],
    rotation: [-90, 0, 0],
    scale: [1, 1, 1],
    visible: true,
    lightProperties: {
      color: '#e2e8f0',
      intensity: 0.8,
      distance: 22,
      decay: 2,
      castShadow: true,
      angle: Math.PI / 3.5,
      penumbra: 0.5,
    },
  },
  {
    id: 'ambient_fill_light',
    name: 'LT_Hospital_AmbientFill',
    type: 'point_light',
    position: [0, 5, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    visible: true,
    lightProperties: {
      color: '#38bdf8',
      intensity: 0.6,
      distance: 20,
      decay: 2,
      castShadow: true,
    },
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('viewport');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('play_doctor');
  const [scenePreset, setScenePreset] = useState<ScenePreset>('emergency_room');
  const [actors, setActors] = useState<SceneActor[]>(HOSPITAL_ACTORS);
  const [selectedActorId, setSelectedActorId] = useState<string | null>('stretcher_patient_1');
  const [lighting, setLighting] = useState<LightingEnvironment>(DEFAULT_LIGHTING);
  const [lang, setLang] = useState<Language>('es');
  const [activeGizmo, setActiveGizmo] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [blueprintActive, setBlueprintActive] = useState(true);
  const [showMainMenu, setShowMainMenu] = useState(false);

  const handleSelectPreset = (preset: ScenePreset) => {
    setScenePreset(preset);
  };

  const handleToggleVisibility = (id: string) => {
    setActors((prev) =>
      prev.map((a) => (a.id === id ? { ...a, visible: !a.visible } : a))
    );
  };

  const handleDeleteActor = (id: string) => {
    setActors((prev) => prev.filter((a) => a.id !== id));
    if (selectedActorId === id) setSelectedActorId(null);
  };

  const handleAddActor = (type: 'mesh' | 'point_light' | 'spot_light' | 'patient_stretcher' | 'pharmacy_cabinet') => {
    const id = `actor_${Date.now()}`;
    const newActor: SceneActor = {
      id,
      name: `BP_Actor_${actors.length + 1}`,
      type: type as any,
      position: [(Math.random() - 0.5) * 8, 1.0, (Math.random() - 0.5) * 8],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
    };
    setActors((prev) => [...prev, newActor]);
    setSelectedActorId(id);
    setActiveTab('viewport');
  };

  const handleUpdateActor = (updated: SceneActor) => {
    setActors((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const selectedActor = actors.find((a) => a.id === selectedActorId) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07090f] text-slate-200">
      {/* Main Menu Modal Overlay */}
      {showMainMenu && (
        <MainMenu
          onStartGame={() => {
            setShowMainMenu(false);
            setViewportMode('play_doctor');
            setActiveTab('viewport');
          }}
          onOpenEditor={() => {
            setShowMainMenu(false);
            setViewportMode('editor');
            setActiveTab('viewport');
          }}
          lang={lang}
        />
      )}

      {/* Top Toolbar: Aislado únicamente al Modo Editor / Consola de Desarrollo */}
      {viewportMode === 'editor' && (
        <TopToolbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          viewportMode={viewportMode}
          onViewportModeChange={setViewportMode}
          lang={lang}
          onToggleLang={() => setLang(lang === 'es' ? 'en' : 'es')}
          activeGizmo={activeGizmo}
          onGizmoChange={setActiveGizmo}
          blueprintActive={blueprintActive}
          onToggleBlueprintRun={() => setBlueprintActive(!blueprintActive)}
        />
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* World Outliner (Hierarchy Tree) */}
        {activeTab === 'viewport' && viewportMode === 'editor' && (
          <WorldOutliner
            actors={actors}
            selectedActorId={selectedActorId}
            onSelectActor={setSelectedActorId}
            onToggleVisibility={handleToggleVisibility}
            onDeleteActor={handleDeleteActor}
            onAddActor={(type) => handleAddActor(type as any)}
            scenePreset={scenePreset as any}
            onSelectPreset={handleSelectPreset as any}
            lang={lang}
          />
        )}

        {/* Central Workspace */}
        <main className="flex-1 relative h-full overflow-hidden">
          {activeTab === 'viewport' && (
            <>
              <Viewport3D
                scenePreset={scenePreset}
                actors={actors}
                selectedActorId={selectedActorId}
                onSelectActor={setSelectedActorId}
                lighting={lighting}
                viewportMode={viewportMode}
                onExitGameMode={() => setShowMainMenu(true)}
                blueprintActive={blueprintActive}
                activeGizmo={activeGizmo}
                onUpdateActor={handleUpdateActor}
                onOpenMainMenu={() => setShowMainMenu(true)}
                onOpenEditorMode={() => setViewportMode('editor')}
              />

              <BottomControlDock
                lighting={lighting}
                onUpdateLighting={setLighting}
                viewportMode={viewportMode}
                lang={lang}
              />
            </>
          )}

          {activeTab === 'architecture' && <ArchitectureHub lang={lang} />}

          {activeTab === 'blueprint' && (
            <BlueprintEditor
              blueprintActive={blueprintActive}
              onToggleBlueprint={() => setBlueprintActive(!blueprintActive)}
              lang={lang}
            />
          )}

          {activeTab === 'content' && (
            <ContentBrowser
              onSpawnAsset={() => handleAddActor('patient_stretcher')}
              lang={lang}
            />
          )}

          {activeTab === 'installer' && <InstallationModal lang={lang} />}
        </main>

        {/* Details & Inspector Panel */}
        {activeTab === 'viewport' && viewportMode === 'editor' && (
          <DetailsPanel
            selectedActor={selectedActor}
            onUpdateActor={handleUpdateActor}
            lighting={lighting}
            onUpdateLighting={setLighting}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}
