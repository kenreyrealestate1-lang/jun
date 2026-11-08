/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  RotateCw,
  Sun,
  Volume2,
  CheckCircle2,
  Sparkles,
  Plus,
  RefreshCw,
  HeartPulse,
  Activity,
  Syringe,
  Layers,
  Sliders,
  Hand,
  AlertTriangle,
} from 'lucide-react';
import { BlueprintNode, BlueprintConnection, Language } from '../types/engine';
import { getT } from '../utils/i18n';
import { playBlueprintCompileChime, playEcgBeep, playDefibrillatorShock } from '../utils/audioSystem';

interface BlueprintEditorProps {
  blueprintActive: boolean;
  onToggleBlueprint: () => void;
  lang: Language;
}

// ==========================================
// 1. GRAFO ABP_MedicalDoctor (AnimBP & Control Rig & Spine Aim)
// ==========================================
const ANIM_BLUEPRINT_NODES: BlueprintNode[] = [
  {
    id: 'abp-event-update',
    title: 'Event: BlueprintUpdateAnimation',
    category: 'event',
    x: 30,
    y: 70,
    color: '#881337', // Crimson Event
    inputs: [],
    outputs: [
      { id: 'out-exec', label: '', type: 'exec' },
      { id: 'out-delta', label: 'Delta Time X', type: 'number' },
    ],
  },
  {
    id: 'abp-cast-pawn',
    title: 'TryGetPawnOwner -> Cast AEEMedicalCharacter',
    category: 'action',
    x: 300,
    y: 50,
    color: '#1e3a8a', // Function blue
    inputs: [{ id: 'in-exec', label: '', type: 'exec' }],
    outputs: [
      { id: 'out-exec', label: '', type: 'exec' },
      { id: 'out-char', label: 'As EEMedicalCharacter', type: 'vector' },
      { id: 'out-fail', label: 'Cast Failed', type: 'exec' },
    ],
  },
  {
    id: 'abp-read-vars',
    title: 'Read Character: bIsHoldingItem & HeldDrugType',
    category: 'variable',
    x: 580,
    y: 50,
    color: '#065f46', // Variable emerald
    inputs: [{ id: 'in-target', label: 'Target', type: 'vector' }],
    outputs: [
      { id: 'out-holding', label: 'bIsHoldingItem (Boolean)', type: 'boolean' },
      { id: 'out-drug', label: 'HeldDrugType (Enum: EDrugType)', type: 'number' },
    ],
  },
  {
    id: 'abp-calc-speed',
    title: 'Get Velocity -> Vector Length (Speed)',
    category: 'variable',
    x: 580,
    y: 220,
    color: '#0e7490', // Cyan variable
    inputs: [{ id: 'in-target', label: 'Character Movement', type: 'vector' }],
    outputs: [{ id: 'out-speed', label: 'Speed (cm/s)', type: 'number' }],
  },
  {
    id: 'abp-interp-alpha',
    title: 'FInterp To (Alpha de Transición)',
    category: 'action',
    x: 880,
    y: 50,
    color: '#7c3aed', // Purple Math / Action
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-target-val', label: 'Target (1.0 Farmacia / 0.0 Libre)', type: 'number' },
      { id: 'in-delta', label: 'DeltaTime', type: 'number' },
      { id: 'in-speed', label: 'InterpSpeed: 12.0', type: 'number' },
    ],
    outputs: [
      { id: 'out-exec', label: '', type: 'exec' },
      { id: 'out-alpha', label: 'Alpha de Transición (0.0..1.0)', type: 'number' },
    ],
  },
  {
    id: 'abp-socket-tf',
    title: 'Get Socket Transform: Hand_R_Socket',
    category: 'variable',
    x: 880,
    y: 230,
    color: '#047857',
    inputs: [{ id: 'in-mesh', label: 'Target Mesh', type: 'vector' }],
    outputs: [{ id: 'out-tf', label: 'Hand Target Transform', type: 'vector' }],
  },
  {
    id: 'abp-spine-aim',
    title: 'Procedural Spine Aim Offset (RInterpTo)',
    category: 'action',
    x: 880,
    y: 390,
    color: '#a21caf', // Fuchsia Math
    inputs: [
      { id: 'in-ctrl-rot', label: 'Control & Actor Rotation', type: 'vector' },
      { id: 'in-delta', label: 'DeltaTime', type: 'number' },
      { id: 'in-target-torso', label: 'Target Torso (Patient Bed)', type: 'vector' },
    ],
    outputs: [
      { id: 'out-spine-rot', label: 'ProceduralSpineRotation (±35°/±50°)', type: 'vector' },
    ],
  },
  {
    id: 'abp-locomotion',
    title: 'Locomotion State Machine (Speed)',
    category: 'action',
    x: 1200,
    y: 220,
    color: '#b45309', // Amber state machine
    inputs: [{ id: 'in-speed', label: 'Speed', type: 'number' }],
    outputs: [{ id: 'out-loco-pose', label: 'Locomotion Pose', type: 'vector' }],
  },
  {
    id: 'abp-modify-spine',
    title: 'Transform (Modify) Bone: spine_02/03',
    category: 'action',
    x: 1200,
    y: 390,
    color: '#6b21a8', // Purple bone transform
    inputs: [
      { id: 'in-spine-rot', label: 'ProceduralSpineRotation', type: 'vector' },
      { id: 'in-alpha', label: 'Alpha de Transición', type: 'number' },
    ],
    outputs: [{ id: 'out-spine-pose', label: 'Spine Aimed Pose', type: 'vector' }],
  },
  {
    id: 'abp-control-rig',
    title: 'Control Rig: CR_DoctorHandIK (FBIK Hand_R)',
    category: 'action',
    x: 1510,
    y: 60,
    color: '#6d28d9', // Deep Purple Control Rig
    inputs: [
      { id: 'in-target-tf', label: 'Hand Target Transform', type: 'vector' },
      { id: 'in-alpha', label: 'Alpha de Transición', type: 'number' },
      { id: 'in-drug', label: 'HeldDrugType', type: 'number' },
    ],
    outputs: [{ id: 'out-rig-pose', label: 'FBIK Hand Solved Pose', type: 'vector' }],
  },
  {
    id: 'abp-layered-blend',
    title: 'Layered Blend Per Bone (spine_01)',
    category: 'action',
    x: 1810,
    y: 110,
    color: '#0369a1', // Sky blend
    inputs: [
      { id: 'in-base', label: 'Base: Locomotion Pose', type: 'vector' },
      { id: 'in-blend', label: 'Blend: FBIK Solved Pose', type: 'vector' },
    ],
    outputs: [{ id: 'out-pose', label: 'Blended Pose', type: 'vector' }],
  },
  {
    id: 'abp-output-pose',
    title: 'Output Pose (Component To Local)',
    category: 'action',
    x: 2100,
    y: 110,
    color: '#15803d', // Green output
    inputs: [{ id: 'in-final', label: 'Final Result Pose', type: 'vector' }],
    outputs: [],
  },
];

const ANIM_BLUEPRINT_CONNECTIONS: BlueprintConnection[] = [
  { id: 'ac1', fromNodeId: 'abp-event-update', fromPinId: 'out-exec', toNodeId: 'abp-cast-pawn', toPinId: 'in-exec' },
  { id: 'ac2', fromNodeId: 'abp-cast-pawn', fromPinId: 'out-exec', toNodeId: 'abp-interp-alpha', toPinId: 'in-exec' },
  { id: 'ac3', fromNodeId: 'abp-cast-pawn', fromPinId: 'out-char', toNodeId: 'abp-read-vars', toPinId: 'in-target' },
  { id: 'ac4', fromNodeId: 'abp-cast-pawn', fromPinId: 'out-char', toNodeId: 'abp-calc-speed', toPinId: 'in-target' },
  { id: 'ac5', fromNodeId: 'abp-cast-pawn', fromPinId: 'out-char', toNodeId: 'abp-socket-tf', toPinId: 'in-mesh' },
  { id: 'ac6', fromNodeId: 'abp-event-update', fromPinId: 'out-delta', toNodeId: 'abp-interp-alpha', toPinId: 'in-delta' },
  { id: 'ac7', fromNodeId: 'abp-calc-speed', fromPinId: 'out-speed', toNodeId: 'abp-locomotion', toPinId: 'in-speed' },
  { id: 'ac8', fromNodeId: 'abp-socket-tf', fromPinId: 'out-tf', toNodeId: 'abp-control-rig', toPinId: 'in-target-tf' },
  { id: 'ac9', fromNodeId: 'abp-interp-alpha', fromPinId: 'out-alpha', toNodeId: 'abp-control-rig', toPinId: 'in-alpha' },
  { id: 'ac10', fromNodeId: 'abp-read-vars', fromPinId: 'out-drug', toNodeId: 'abp-control-rig', toPinId: 'in-drug' },
  { id: 'ac11', fromNodeId: 'abp-event-update', fromPinId: 'out-delta', toNodeId: 'abp-spine-aim', toPinId: 'in-delta' },
  { id: 'ac12', fromNodeId: 'abp-cast-pawn', fromPinId: 'out-char', toNodeId: 'abp-spine-aim', toPinId: 'in-ctrl-rot' },
  { id: 'ac13', fromNodeId: 'abp-spine-aim', fromPinId: 'out-spine-rot', toNodeId: 'abp-modify-spine', toPinId: 'in-spine-rot' },
  { id: 'ac14', fromNodeId: 'abp-interp-alpha', fromPinId: 'out-alpha', toNodeId: 'abp-modify-spine', toPinId: 'in-alpha' },
  { id: 'ac15', fromNodeId: 'abp-locomotion', fromPinId: 'out-loco-pose', toNodeId: 'abp-layered-blend', toPinId: 'in-base' },
  { id: 'ac16', fromNodeId: 'abp-control-rig', fromPinId: 'out-rig-pose', toNodeId: 'abp-layered-blend', toPinId: 'in-blend' },
  { id: 'ac17', fromNodeId: 'abp-layered-blend', fromPinId: 'out-pose', toNodeId: 'abp-output-pose', toPinId: 'in-final' },
];

// ==========================================
// 2. GRAFO BP_Patient (Gameplay Treatment)
// ==========================================
const HOSPITAL_BLUEPRINT_NODES: BlueprintNode[] = [
  {
    id: 'node-interact-event',
    title: 'Event: OnInteract (BPI_Interactable)',
    category: 'event',
    x: 40,
    y: 80,
    color: '#881337',
    inputs: [],
    outputs: [
      { id: 'out-exec', label: '', type: 'exec' },
      { id: 'out-char', label: 'InteractingCharacter', type: 'vector' },
    ],
  },
  {
    id: 'node-cast-doctor',
    title: 'Cast to AEEDoctorCharacter',
    category: 'action',
    x: 320,
    y: 60,
    color: '#1e3a8a',
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-obj', label: 'Object', type: 'vector' },
    ],
    outputs: [
      { id: 'out-exec', label: '', type: 'exec' },
      { id: 'out-doc', label: 'As EEDoctorCharacter', type: 'vector' },
      { id: 'out-fail', label: 'Cast Failed', type: 'exec' },
    ],
  },
  {
    id: 'node-get-item',
    title: 'Get HeldMedicalItem',
    category: 'variable',
    x: 600,
    y: 190,
    color: '#065f46',
    inputs: [{ id: 'in-target', label: 'Target', type: 'vector' }],
    outputs: [{ id: 'out-item', label: 'ItemType: Adrenaline', type: 'boolean' }],
  },
  {
    id: 'node-administer',
    title: 'Server Administer Treatment',
    category: 'action',
    x: 600,
    y: 60,
    color: '#1e3a8a',
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-treatment', label: 'TreatmentType', type: 'boolean' },
    ],
    outputs: [
      { id: 'out-exec', label: '', type: 'exec' },
      { id: 'out-success', label: 'bSuccess', type: 'boolean' },
    ],
  },
  {
    id: 'node-vfx',
    title: 'Spawn Niagara: NS_DefibrillatorSparks',
    category: 'action',
    x: 900,
    y: 60,
    color: '#065f46',
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-loc', label: 'Location: ChestSocket', type: 'vector' },
    ],
    outputs: [{ id: 'out-exec', label: '', type: 'exec' }],
  },
  {
    id: 'node-metasound',
    title: 'Play MetaSound (MS_ECG_PulseRecovery)',
    category: 'action',
    x: 900,
    y: 200,
    color: '#14532d',
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-pitch', label: 'BPM: 75.0', type: 'number' },
    ],
    outputs: [{ id: 'out-exec', label: '', type: 'exec' }],
  },
  {
    id: 'node-stop-audio',
    title: 'ECG_AudioComponent -> Stop() (Limpieza MetaSound)',
    category: 'action',
    x: 1240,
    y: 200,
    color: '#991b1b', // Red Stop
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-target', label: 'Target: ECG_AudioComponent', type: 'vector' },
    ],
    outputs: [{ id: 'out-exec', label: '', type: 'exec' }],
  },
  {
    id: 'node-success-chime',
    title: 'Play Sound 2D (A_Patient_Healed_Chime)',
    category: 'action',
    x: 1620,
    y: 200,
    color: '#0284c7', // Sky Blue Chime
    inputs: [{ id: 'in-exec', label: '', type: 'exec' }],
    outputs: [],
  },
];

const HOSPITAL_CONNECTIONS: BlueprintConnection[] = [
  { id: 'c1', fromNodeId: 'node-interact-event', fromPinId: 'out-exec', toNodeId: 'node-cast-doctor', toPinId: 'in-exec' },
  { id: 'c2', fromNodeId: 'node-interact-event', fromPinId: 'out-char', toNodeId: 'node-cast-doctor', toPinId: 'in-obj' },
  { id: 'c3', fromNodeId: 'node-cast-doctor', fromPinId: 'out-exec', toNodeId: 'node-administer', toPinId: 'in-exec' },
  { id: 'c4', fromNodeId: 'node-cast-doctor', fromPinId: 'out-doc', toNodeId: 'node-get-item', toPinId: 'in-target' },
  { id: 'c5', fromNodeId: 'node-get-item', fromPinId: 'out-item', toNodeId: 'node-administer', toPinId: 'in-treatment' },
  { id: 'c6', fromNodeId: 'node-administer', fromPinId: 'out-exec', toNodeId: 'node-vfx', toPinId: 'in-exec' },
  { id: 'c7', fromNodeId: 'node-administer', fromPinId: 'out-exec', toNodeId: 'node-metasound', toPinId: 'in-exec' },
  { id: 'c8', fromNodeId: 'node-metasound', fromPinId: 'out-exec', toNodeId: 'node-stop-audio', toPinId: 'in-exec' },
  { id: 'c9', fromNodeId: 'node-stop-audio', fromPinId: 'out-exec', toNodeId: 'node-success-chime', toPinId: 'in-exec' },
];

// ==========================================
// 3. GRAFO OnRep_HeldDrug (Hand_R_Socket Actor Instantiation)
// ==========================================
const ONREP_HELDRUG_NODES: BlueprintNode[] = [
  {
    id: 'onrep-event',
    title: 'Event: OnRep_HeldDrug()',
    category: 'event',
    x: 40,
    y: 120,
    color: '#881337', // Crimson Event
    inputs: [],
    outputs: [{ id: 'out-exec', label: '', type: 'exec' }],
  },
  {
    id: 'onrep-is-valid',
    title: 'IsValid (CurrentHeldActor)',
    category: 'action',
    x: 300,
    y: 100,
    color: '#1e3a8a',
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-actor', label: 'Input Object', type: 'vector' },
    ],
    outputs: [
      { id: 'out-valid', label: 'Is Valid', type: 'exec' },
      { id: 'out-invalid', label: 'Is Not Valid', type: 'exec' },
    ],
  },
  {
    id: 'onrep-get-actor-ref',
    title: 'Get CurrentHeldActor',
    category: 'variable',
    x: 60,
    y: 260,
    color: '#065f46',
    inputs: [],
    outputs: [{ id: 'out-ref', label: 'CurrentHeldActor (Actor)', type: 'vector' }],
  },
  {
    id: 'onrep-destroy-actor',
    title: 'DestroyActor (Limpiar Item Previo)',
    category: 'action',
    x: 580,
    y: 70,
    color: '#991b1b', // Red Destroy
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-target', label: 'Target', type: 'vector' },
    ],
    outputs: [{ id: 'out-exec', label: '', type: 'exec' }],
  },
  {
    id: 'onrep-get-drug-var',
    title: 'Get HeldDrugType (Replicated)',
    category: 'variable',
    x: 580,
    y: 440,
    color: '#0e7490', // Cyan variable
    inputs: [],
    outputs: [{ id: 'out-enum', label: 'HeldDrugType (EDiseaseType)', type: 'number' }],
  },
  {
    id: 'onrep-switch-drug',
    title: 'Switch on EDiseaseType',
    category: 'action',
    x: 880,
    y: 120,
    color: '#7c3aed', // Purple Switch
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-selection', label: 'Selection', type: 'number' },
    ],
    outputs: [
      { id: 'out-epi', label: 'Anaphylaxis (Adrenalina)', type: 'exec' },
      { id: 'out-anti', label: 'BacterialPneumonia (Antibióticos)', type: 'exec' },
      { id: 'out-defib', label: 'CardiacArrest (Desfibrilador)', type: 'exec' },
      { id: 'out-none', label: 'None (Mano Libre)', type: 'exec' },
    ],
  },
  {
    id: 'onrep-select-class',
    title: 'Select Class (TSubclassOf<AActor>)',
    category: 'math',
    x: 1220,
    y: 360,
    color: '#b45309', // Amber Select
    inputs: [
      { id: 'in-index', label: 'Index (HeldDrugType)', type: 'number' },
      { id: 'in-c1', label: 'BP_Syringe_Epinephrine', type: 'vector' },
      { id: 'in-c2', label: 'BP_Syringe_Antibiotics', type: 'vector' },
      { id: 'in-c3', label: 'BP_Defibrillator_Paddles', type: 'vector' },
    ],
    outputs: [{ id: 'out-class', label: 'Item Class To Spawn', type: 'vector' }],
  },
  {
    id: 'onrep-spawn-actor',
    title: 'SpawnActor BP_MedicalItem from Class',
    category: 'action',
    x: 1260,
    y: 90,
    color: '#0369a1', // Sky blue Spawn
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-class', label: 'Class', type: 'vector' },
      { id: 'in-col', label: 'Always Spawn, Ignore Collisions', type: 'boolean' },
    ],
    outputs: [
      { id: 'out-exec', label: '', type: 'exec' },
      { id: 'out-actor', label: 'Return Value (New Actor)', type: 'vector' },
    ],
  },
  {
    id: 'onrep-get-mesh',
    title: 'Get Mesh (CharacterMesh0)',
    category: 'variable',
    x: 1260,
    y: 250,
    color: '#047857',
    inputs: [],
    outputs: [{ id: 'out-mesh', label: 'SkeletalMeshComponent', type: 'vector' }],
  },
  {
    id: 'onrep-attach-actor',
    title: 'AttachActorToComponent (Hand_R_Socket)',
    category: 'action',
    x: 1640,
    y: 80,
    color: '#15803d', // Green Attachment
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-target', label: 'Target (Item Actor)', type: 'vector' },
      { id: 'in-parent', label: 'Parent (GetMesh)', type: 'vector' },
      { id: 'in-socket', label: 'Socket: Hand_R_Socket', type: 'vector' },
      { id: 'in-rule', label: 'SnapToTarget (Location & Rotation)', type: 'vector' },
    ],
    outputs: [
      { id: 'out-exec', label: '', type: 'exec' },
      { id: 'out-res', label: 'bAttached', type: 'boolean' },
    ],
  },
  {
    id: 'onrep-set-current-actor',
    title: 'Set CurrentHeldActor',
    category: 'variable',
    x: 2020,
    y: 80,
    color: '#047857',
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-val', label: 'CurrentHeldActor', type: 'vector' },
    ],
    outputs: [{ id: 'out-exec', label: '', type: 'exec' }],
  },
  {
    id: 'onrep-set-holding-true',
    title: 'Set bIsHoldingItem = True',
    category: 'variable',
    x: 2300,
    y: 80,
    color: '#047857',
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-val', label: 'bIsHoldingItem (True)', type: 'boolean' },
    ],
    outputs: [],
  },
  {
    id: 'onrep-clear-inventory',
    title: 'Set bIsHoldingItem = False & Clear',
    category: 'variable',
    x: 1260,
    y: 540,
    color: '#475569',
    inputs: [{ id: 'in-exec', label: '', type: 'exec' }],
    outputs: [],
  },
];

const ONREP_HELDRUG_CONNECTIONS: BlueprintConnection[] = [
  { id: 'oc1', fromNodeId: 'onrep-event', fromPinId: 'out-exec', toNodeId: 'onrep-is-valid', toPinId: 'in-exec' },
  { id: 'oc2', fromNodeId: 'onrep-get-actor-ref', fromPinId: 'out-ref', toNodeId: 'onrep-is-valid', toPinId: 'in-actor' },
  { id: 'oc3', fromNodeId: 'onrep-is-valid', fromPinId: 'out-valid', toNodeId: 'onrep-destroy-actor', toPinId: 'in-exec' },
  { id: 'oc4', fromNodeId: 'onrep-get-actor-ref', fromPinId: 'out-ref', toNodeId: 'onrep-destroy-actor', toPinId: 'in-target' },
  { id: 'oc5', fromNodeId: 'onrep-destroy-actor', fromPinId: 'out-exec', toNodeId: 'onrep-switch-drug', toPinId: 'in-exec' },
  { id: 'oc6', fromNodeId: 'onrep-is-valid', fromPinId: 'out-invalid', toNodeId: 'onrep-switch-drug', toPinId: 'in-exec' },
  { id: 'oc7', fromNodeId: 'onrep-get-drug-var', fromPinId: 'out-enum', toNodeId: 'onrep-switch-drug', toPinId: 'in-selection' },
  { id: 'oc8', fromNodeId: 'onrep-get-drug-var', fromPinId: 'out-enum', toNodeId: 'onrep-select-class', toPinId: 'in-index' },
  { id: 'oc9', fromNodeId: 'onrep-switch-drug', fromPinId: 'out-epi', toNodeId: 'onrep-spawn-actor', toPinId: 'in-exec' },
  { id: 'oc10', fromNodeId: 'onrep-switch-drug', fromPinId: 'out-anti', toNodeId: 'onrep-spawn-actor', toPinId: 'in-exec' },
  { id: 'oc11', fromNodeId: 'onrep-switch-drug', fromPinId: 'out-defib', toNodeId: 'onrep-spawn-actor', toPinId: 'in-exec' },
  { id: 'oc12', fromNodeId: 'onrep-select-class', fromPinId: 'out-class', toNodeId: 'onrep-spawn-actor', toPinId: 'in-class' },
  { id: 'oc13', fromNodeId: 'onrep-spawn-actor', fromPinId: 'out-exec', toNodeId: 'onrep-attach-actor', toPinId: 'in-exec' },
  { id: 'oc14', fromNodeId: 'onrep-spawn-actor', fromPinId: 'out-actor', toNodeId: 'onrep-attach-actor', toPinId: 'in-target' },
  { id: 'oc15', fromNodeId: 'onrep-get-mesh', fromPinId: 'out-mesh', toNodeId: 'onrep-attach-actor', toPinId: 'in-parent' },
  { id: 'oc16', fromNodeId: 'onrep-attach-actor', fromPinId: 'out-exec', toNodeId: 'onrep-set-current-actor', toPinId: 'in-exec' },
  { id: 'oc17', fromNodeId: 'onrep-spawn-actor', fromPinId: 'out-actor', toNodeId: 'onrep-set-current-actor', toPinId: 'in-val' },
  { id: 'oc18', fromNodeId: 'onrep-set-current-actor', fromPinId: 'out-exec', toNodeId: 'onrep-set-holding-true', toPinId: 'in-exec' },
  { id: 'oc19', fromNodeId: 'onrep-switch-drug', fromPinId: 'out-none', toNodeId: 'onrep-clear-inventory', toPinId: 'in-exec' },
];

// ==========================================
// 4. GRAFO BP_DangerZone (OnRep_ZoneStatus & NS_ToxicGas)
// ==========================================
const DANGER_ZONE_NODES: BlueprintNode[] = [
  {
    id: 'dz-event-onrep',
    title: 'Event: OnRep_ZoneStatus()',
    category: 'event',
    x: 40,
    y: 120,
    color: '#881337', // Crimson Event
    inputs: [],
    outputs: [{ id: 'out-exec', label: '', type: 'exec' }],
  },
  {
    id: 'dz-get-status',
    title: 'Get CurrentZoneStatus (Replicated)',
    category: 'variable',
    x: 40,
    y: 280,
    color: '#0e7490', // Cyan
    inputs: [],
    outputs: [{ id: 'out-enum', label: 'CurrentZoneStatus (EZoneStatus)', type: 'number' }],
  },
  {
    id: 'dz-switch-status',
    title: 'Switch on EZoneStatus',
    category: 'action',
    x: 320,
    y: 110,
    color: '#7c3aed', // Purple Switch
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-selection', label: 'Selection', type: 'number' },
    ],
    outputs: [
      { id: 'out-contaminated', label: 'Contaminated (Peligro)', type: 'exec' },
      { id: 'out-clean', label: 'Clean (Limpia)', type: 'exec' },
      { id: 'out-disinfecting', label: 'Disinfecting (Limpieza)', type: 'exec' },
    ],
  },
  {
    id: 'dz-activate-niagara',
    title: 'Activate Niagara (NS_ToxicGas)',
    category: 'action',
    x: 640,
    y: 40,
    color: '#047857', // Emerald Niagara
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-reset', label: 'bReset: True', type: 'boolean' },
    ],
    outputs: [{ id: 'out-exec', label: '', type: 'exec' }],
  },
  {
    id: 'dz-set-mat-hazard',
    title: 'Set Material (M_HazardFloor_ToxicGreen)',
    category: 'action',
    x: 960,
    y: 40,
    color: '#b45309', // Amber Material
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-elem', label: 'Element: 0', type: 'number' },
      { id: 'in-mat', label: 'M_HazardFloor_ToxicGreen', type: 'vector' },
    ],
    outputs: [{ id: 'out-exec', label: '', type: 'exec' }],
  },
  {
    id: 'dz-block-nav',
    title: 'NavBlocker: SetCollision (QueryAndPhysics)',
    category: 'action',
    x: 1320,
    y: 40,
    color: '#991b1b', // Red Blocker
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-col', label: 'Collision: QueryAndPhysics', type: 'vector' },
    ],
    outputs: [{ id: 'out-exec', label: '', type: 'exec' }],
  },
  {
    id: 'dz-play-alarm',
    title: 'PlaySoundAtLocation (A_BiohazardAlarm)',
    category: 'action',
    x: 1680,
    y: 40,
    color: '#0284c7', // Sky Audio
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-loc', label: 'GetActorLocation', type: 'vector' },
    ],
    outputs: [],
  },
  {
    id: 'dz-deactivate-niagara',
    title: 'Deactivate Niagara (NS_ToxicGas)',
    category: 'action',
    x: 640,
    y: 240,
    color: '#475569', // Slate
    inputs: [{ id: 'in-exec', label: '', type: 'exec' }],
    outputs: [{ id: 'out-exec', label: '', type: 'exec' }],
  },
  {
    id: 'dz-hide-mesh',
    title: 'Set Visibility = False (ZoneMesh)',
    category: 'action',
    x: 960,
    y: 240,
    color: '#475569',
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-vis', label: 'New Visibility: False', type: 'boolean' },
    ],
    outputs: [{ id: 'out-exec', label: '', type: 'exec' }],
  },
  {
    id: 'dz-unblock-nav',
    title: 'NavBlocker: SetCollision (NoCollision)',
    category: 'action',
    x: 1320,
    y: 240,
    color: '#15803d', // Green Clear
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-col', label: 'Collision: NoCollision', type: 'vector' },
    ],
    outputs: [],
  },
  {
    id: 'dz-set-mat-disinfect',
    title: 'Set Material (M_DisinfectingFoam_Blue)',
    category: 'action',
    x: 640,
    y: 420,
    color: '#0d9488', // Teal Foam
    inputs: [
      { id: 'in-exec', label: '', type: 'exec' },
      { id: 'in-elem', label: 'Element: 0', type: 'number' },
    ],
    outputs: [],
  },
];

const DANGER_ZONE_CONNECTIONS: BlueprintConnection[] = [
  { id: 'dzc1', fromNodeId: 'dz-event-onrep', fromPinId: 'out-exec', toNodeId: 'dz-switch-status', toPinId: 'in-exec' },
  { id: 'dzc2', fromNodeId: 'dz-get-status', fromPinId: 'out-enum', toNodeId: 'dz-switch-status', toPinId: 'in-selection' },
  { id: 'dzc3', fromNodeId: 'dz-switch-status', fromPinId: 'out-contaminated', toNodeId: 'dz-activate-niagara', toPinId: 'in-exec' },
  { id: 'dzc4', fromNodeId: 'dz-activate-niagara', fromPinId: 'out-exec', toNodeId: 'dz-set-mat-hazard', toPinId: 'in-exec' },
  { id: 'dzc5', fromNodeId: 'dz-set-mat-hazard', fromPinId: 'out-exec', toNodeId: 'dz-block-nav', toPinId: 'in-exec' },
  { id: 'dzc6', fromNodeId: 'dz-block-nav', fromPinId: 'out-exec', toNodeId: 'dz-play-alarm', toPinId: 'in-exec' },
  { id: 'dzc7', fromNodeId: 'dz-switch-status', fromPinId: 'out-clean', toNodeId: 'dz-deactivate-niagara', toPinId: 'in-exec' },
  { id: 'dzc8', fromNodeId: 'dz-deactivate-niagara', fromPinId: 'out-exec', toNodeId: 'dz-hide-mesh', toPinId: 'in-exec' },
  { id: 'dzc9', fromNodeId: 'dz-hide-mesh', fromPinId: 'out-exec', toNodeId: 'dz-unblock-nav', toPinId: 'in-exec' },
  { id: 'dzc10', fromNodeId: 'dz-switch-status', fromPinId: 'out-disinfecting', toNodeId: 'dz-set-mat-disinfect', toPinId: 'in-exec' },
];

export const BlueprintEditor: React.FC<BlueprintEditorProps> = ({
  blueprintActive,
  onToggleBlueprint,
  lang,
}) => {
  const [activeGraph, setActiveGraph] = useState<'onrep_helddrug' | 'bp_danger_zone' | 'abp_medical_doctor' | 'bp_patient'>('bp_danger_zone');
  const [nodes, setNodes] = useState<BlueprintNode[]>(DANGER_ZONE_NODES);
  const [connections, setConnections] = useState<BlueprintConnection[]>(DANGER_ZONE_CONNECTIONS);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [compiling, setCompiling] = useState(false);

  // Simulación en vivo de interacción con farmacia y FInterpTo
  const [isHoldingItemSim, setIsHoldingItemSim] = useState(true);
  const [simulatedDrugType, setSimulatedDrugType] = useState<'Anaphylaxis' | 'BacterialPneumonia' | 'CardiacArrest' | 'None'>('Anaphylaxis');
  const [simulatedDangerStatus, setSimulatedDangerStatus] = useState<'Contaminated' | 'Clean' | 'Disinfecting'>('Contaminated');
  const [transitionAlpha, setTransitionAlpha] = useState(1.0);

  // Simulación en vivo de orientación procedural de la columna (Spine/Chest Aim)
  const [spinePitchSim, setSpinePitchSim] = useState(-28.0); // Orientado hacia el torso del paciente en camilla
  const [spineYawSim, setSpineYawSim] = useState(0.0);

  // Manejo de cambio de pestaña entre grafos
  const handleGraphSwitch = (target: 'onrep_helddrug' | 'bp_danger_zone' | 'abp_medical_doctor' | 'bp_patient') => {
    setActiveGraph(target);
    if (target === 'onrep_helddrug') {
      setNodes(ONREP_HELDRUG_NODES);
      setConnections(ONREP_HELDRUG_CONNECTIONS);
    } else if (target === 'bp_danger_zone') {
      setNodes(DANGER_ZONE_NODES);
      setConnections(DANGER_ZONE_CONNECTIONS);
    } else if (target === 'abp_medical_doctor') {
      setNodes(ANIM_BLUEPRINT_NODES);
      setConnections(ANIM_BLUEPRINT_CONNECTIONS);
    } else {
      setNodes(HOSPITAL_BLUEPRINT_NODES);
      setConnections(HOSPITAL_CONNECTIONS);
    }
  };

  // Simulación suave de FInterpTo de TransitionAlpha cuando cambia el sostén del fármaco
  useEffect(() => {
    let animFrame: number;
    const targetAlpha = isHoldingItemSim ? 1.0 : 0.0;
    const speed = 12.0;

    const updateInterp = () => {
      setTransitionAlpha((prev) => {
        const diff = targetAlpha - prev;
        if (Math.abs(diff) < 0.01) return targetAlpha;
        const next = prev + diff * 0.15;
        return next;
      });
      if (Math.abs(targetAlpha - transitionAlpha) >= 0.01) {
        animFrame = requestAnimationFrame(updateInterp);
      }
    };

    animFrame = requestAnimationFrame(updateInterp);
    return () => cancelAnimationFrame(animFrame);
  }, [isHoldingItemSim]);

  const handleTogglePharmacyInteraction = () => {
    setIsHoldingItemSim((prev) => !prev);
    playBlueprintCompileChime();
  };

  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === draggingNodeId) {
          return {
            ...n,
            x: Math.max(10, e.clientX - dragOffset.x),
            y: Math.max(10, e.clientY - dragOffset.y),
          };
        }
        return n;
      })
    );
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const handleCompile = () => {
    setCompiling(true);
    playBlueprintCompileChime();
    playDefibrillatorShock();
    setTimeout(() => {
      setCompiling(false);
      if (!blueprintActive) {
        onToggleBlueprint();
      }
    }, 450);
  };

  return (
    <div
      className="relative w-full h-full bg-[#101216] select-none overflow-hidden flex flex-col font-sans"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Blueprint Toolbar */}
      <div className="h-12 bg-[#161820] border-b border-[#262936] px-4 flex flex-wrap items-center justify-between text-xs shrink-0 z-20 gap-2">
        <div className="flex items-center gap-2">
          {/* Graph Selector Tabs */}
          <button
            onClick={() => handleGraphSwitch('bp_danger_zone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeGraph === 'bp_danger_zone'
                ? 'bg-rose-600 text-white shadow-lg ring-2 ring-rose-400/40'
                : 'bg-[#1e2230] text-slate-300 hover:text-white hover:bg-[#282d40]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
            <span>BP_DangerZone (OnRep_ZoneStatus & NS_ToxicGas)</span>
          </button>

          <button
            onClick={() => handleGraphSwitch('onrep_helddrug')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeGraph === 'onrep_helddrug'
                ? 'bg-amber-600 text-white shadow-lg ring-2 ring-amber-400/40'
                : 'bg-[#1e2230] text-slate-300 hover:text-white hover:bg-[#282d40]'
            }`}
          >
            <Syringe className="w-3.5 h-3.5 text-amber-300" />
            <span>OnRep_HeldDrug (Hand_R_Socket Item)</span>
          </button>

          <button
            onClick={() => handleGraphSwitch('abp_medical_doctor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeGraph === 'abp_medical_doctor'
                ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400/40'
                : 'bg-[#1e2230] text-slate-300 hover:text-white hover:bg-[#282d40]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>ABP_MedicalDoctor (AnimBP & Control Rig)</span>
          </button>

          <button
            onClick={() => handleGraphSwitch('bp_patient')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeGraph === 'bp_patient'
                ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/40'
                : 'bg-[#1e2230] text-slate-300 hover:text-white hover:bg-[#282d40]'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-emerald-300" />
            <span>BP_Patient (EventGraph Tratamiento)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* State Simulator for BP_DangerZone (NS_ToxicGas & Hazard Floor) */}
          {activeGraph === 'bp_danger_zone' && (
            <div className="flex flex-wrap items-center gap-1.5 mr-2 bg-[#12141e] p-1 rounded-lg border border-rose-500/30">
              <span className="text-[10px] text-rose-300 font-mono px-1 font-bold">Simular Estado Zona:</span>
              <button
                onClick={() => {
                  setSimulatedDangerStatus('Contaminated');
                  playDefibrillatorShock();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                  simulatedDangerStatus === 'Contaminated'
                    ? 'bg-rose-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-rose-300" />
                <span>Contaminada (NS_ToxicGas ON)</span>
              </button>

              <button
                onClick={() => {
                  setSimulatedDangerStatus('Disinfecting');
                  playBlueprintCompileChime();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                  simulatedDangerStatus === 'Disinfecting'
                    ? 'bg-teal-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>Desinfectando (Espuma)</span>
              </button>

              <button
                onClick={() => {
                  setSimulatedDangerStatus('Clean');
                  playBlueprintCompileChime();
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                  simulatedDangerStatus === 'Clean'
                    ? 'bg-emerald-700 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Limpia (Desbloqueado)
              </button>
            </div>
          )}

          {/* Item Selector Simulator for OnRep_HeldDrug */}
          {activeGraph === 'onrep_helddrug' && (
            <div className="flex flex-wrap items-center gap-1.5 mr-2 bg-[#12141e] p-1 rounded-lg border border-amber-500/30">
              <span className="text-[10px] text-amber-300 font-mono px-1 font-bold">Simular Farmacia:</span>
              <button
                onClick={() => {
                  setSimulatedDrugType('Anaphylaxis');
                  setIsHoldingItemSim(true);
                  playBlueprintCompileChime();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                  simulatedDrugType === 'Anaphylaxis'
                    ? 'bg-amber-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Syringe className="w-3 h-3 text-amber-300" />
                <span>Adrenalina (Jeringa)</span>
              </button>

              <button
                onClick={() => {
                  setSimulatedDrugType('BacterialPneumonia');
                  setIsHoldingItemSim(true);
                  playBlueprintCompileChime();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                  simulatedDrugType === 'BacterialPneumonia'
                    ? 'bg-teal-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Syringe className="w-3 h-3 text-teal-300" />
                <span>Antibióticos (Jeringa)</span>
              </button>

              <button
                onClick={() => {
                  setSimulatedDrugType('CardiacArrest');
                  setIsHoldingItemSim(true);
                  playDefibrillatorShock();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                  simulatedDrugType === 'CardiacArrest'
                    ? 'bg-rose-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Zap className="w-3 h-3 text-rose-300" />
                <span>Desfibrilador (Paletas)</span>
              </button>

              <button
                onClick={() => {
                  setSimulatedDrugType('None');
                  setIsHoldingItemSim(false);
                  playBlueprintCompileChime();
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                  simulatedDrugType === 'None'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Mano Libre (None)
              </button>
            </div>
          )}

          {/* Pharmacy Simulation Interactive Toggle & Spine Controls */}
          {activeGraph === 'abp_medical_doctor' && (
            <div className="flex flex-wrap items-center gap-2 mr-2">
              <button
                onClick={handleTogglePharmacyInteraction}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer border ${
                  isHoldingItemSim
                    ? 'bg-teal-900/80 border-teal-500/50 text-teal-200 hover:bg-teal-800'
                    : 'bg-[#1c1f2b] border-slate-700 text-slate-300 hover:bg-[#252a3a]'
                }`}
                title="Simula la interacción con la farmacia para equipar o soltar el fármaco"
              >
                <Syringe className="w-3.5 h-3.5 text-teal-400" />
                <span>
                  {isHoldingItemSim
                    ? 'Farmacia: Fármaco Equipado'
                    : 'Farmacia: Mano Libre'}
                </span>
              </button>

              {/* Spine Orientation Presets */}
              <div className="flex items-center gap-1 bg-[#12141d] p-0.5 rounded border border-purple-500/30">
                <span className="text-[10px] text-fuchsia-300 font-mono px-1">Columna (Spine Aim):</span>
                <button
                  onClick={() => { setSpinePitchSim(-28.0); setSpineYawSim(0.0); playBlueprintCompileChime(); }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    spinePitchSim === -28.0 && spineYawSim === 0.0
                      ? 'bg-fuchsia-700 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Orienta la columna hacia la camilla del paciente (-28° Pitch)"
                >
                  Camilla (-28°)
                </button>
                <button
                  onClick={() => { setSpinePitchSim(0.0); setSpineYawSim(0.0); playBlueprintCompileChime(); }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    spinePitchSim === 0.0 && spineYawSim === 0.0
                      ? 'bg-fuchsia-700 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Columna erguida neutral (0°)"
                >
                  Neutral (0°)
                </button>
                <button
                  onClick={() => { setSpinePitchSim(-10.0); setSpineYawSim(30.0); playBlueprintCompileChime(); }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    spinePitchSim === -10.0 && spineYawSim === 30.0
                      ? 'bg-fuchsia-700 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Giro del torso hacia el monitor cardíaco (+30° Yaw)"
                >
                  Monitor (+30°)
                </button>
              </div>

              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#13151f] border border-purple-500/30 font-mono text-[11px] text-purple-300">
                <span>Alpha:</span>
                <span className="font-bold text-white">{transitionAlpha.toFixed(2)}</span>
                <span className="text-slate-500">|</span>
                <span className="text-fuchsia-300">Spine: {spinePitchSim > 0 ? '+' : ''}{spinePitchSim.toFixed(0)}°, {spineYawSim > 0 ? '+' : ''}{spineYawSim.toFixed(0)}°</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400">FBIK: {isHoldingItemSim ? 'Hand_R_Socket' : 'OFF'}</span>
              </div>
            </div>
          )}

          {/* Compile Button */}
          <button
            onClick={handleCompile}
            disabled={compiling}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer ${
              compiling
                ? 'bg-slate-700 text-slate-300'
                : activeGraph === 'abp_medical_doctor'
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {compiling ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>Compilar Blueprint (F7)</span>
          </button>

          {/* Blueprint Status Badge */}
          <div
            className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 border ${
              blueprintActive
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
                : 'bg-[#1b1e28] text-slate-400 border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                blueprintActive ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span>{blueprintActive ? 'BLUEPRINT ACTIVO' : 'EN ESPERA'}</span>
          </div>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing bg-[radial-gradient(#262a36_1px,transparent_1px)] [background-size:24px_24px]">
        {/* SVG Cable Connections between Nodes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {connections.map((c) => {
            const fromNode = nodes.find((n) => n.id === c.fromNodeId);
            const toNode = nodes.find((n) => n.id === c.toNodeId);
            if (!fromNode || !toNode) return null;

            const startX = fromNode.x + 225;
            const startY = fromNode.y + 40;
            const endX = toNode.x + 5;
            const endY = toNode.y + 40;

            const curveOffset = Math.abs(endX - startX) * 0.45;

            return (
              <g key={c.id}>
                {/* Glow layer */}
                <path
                  d={`M ${startX} ${startY} C ${startX + curveOffset} ${startY}, ${
                    endX - curveOffset
                  } ${endY}, ${endX} ${endY}`}
                  stroke={
                    blueprintActive
                      ? activeGraph === 'abp_medical_doctor'
                        ? '#a855f7'
                        : '#10b981'
                      : '#ffffff'
                  }
                  strokeWidth="2.5"
                  strokeDasharray={blueprintActive ? '6 4' : 'none'}
                  className={blueprintActive ? 'animate-pulse' : ''}
                  fill="none"
                />
              </g>
            );
          })}
        </svg>

        {/* Blueprint Visual Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            onMouseDown={(e) => handleMouseDown(node.id, e)}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: '240px',
            }}
            className="absolute rounded-lg bg-[#181a24] border border-[#2b3042] shadow-2xl overflow-hidden cursor-move select-none z-10 transition-shadow hover:border-purple-500/50"
          >
            {/* Unreal Node Header */}
            <div
              style={{ backgroundColor: node.color }}
              className="px-3 py-2 flex items-center justify-between text-white font-semibold text-xs border-b border-black/20"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Zap className="w-3.5 h-3.5 fill-current text-white/90" />
                <span className="truncate">{node.title}</span>
              </div>
            </div>

            {/* Node Body with Pins */}
            <div className="p-2.5 space-y-2 text-[11px] font-mono text-slate-300">
              {/* Output Pins */}
              {node.outputs.map((out) => (
                <div key={out.id} className="flex items-center justify-end gap-1.5">
                  {out.label && <span className="text-slate-400">{out.label}</span>}
                  <div
                    className={`w-3 h-3 rounded-sm border ${
                      out.type === 'exec'
                        ? 'bg-white border-white rotate-45'
                        : out.type === 'boolean'
                        ? 'bg-rose-400 border-rose-300 rounded-full'
                        : out.type === 'number'
                        ? 'bg-emerald-400 border-emerald-300 rounded-full'
                        : 'bg-yellow-400 border-yellow-300 rounded-full'
                    }`}
                    title="Pin de Salida"
                  />
                </div>
              ))}

              {/* Input Pins */}
              {node.inputs.map((inp) => (
                <div key={inp.id} className="flex items-center gap-1.5">
                  <div
                    className={`w-3 h-3 rounded-sm border ${
                      inp.type === 'exec'
                        ? 'bg-white border-white rotate-45'
                        : inp.type === 'boolean'
                        ? 'bg-rose-400 border-rose-300 rounded-full'
                        : inp.type === 'number'
                        ? 'bg-emerald-400 border-emerald-300 rounded-full'
                        : 'bg-yellow-400 border-yellow-300 rounded-full'
                    }`}
                    title="Pin de Entrada"
                  />
                  <span className="text-slate-400">{inp.label || 'Exec'}</span>
                </div>
              ))}
            </div>

            {/* Live Parameter Inspection Footer (When in ABP) */}
            {activeGraph === 'abp_medical_doctor' && node.id === 'abp-interp-alpha' && (
              <div className="px-2.5 py-1.5 bg-[#10121a] border-t border-slate-800 flex items-center justify-between text-[10px] text-purple-300">
                <span>Alpha FInterp:</span>
                <span className="font-bold text-white">{transitionAlpha.toFixed(2)}</span>
              </div>
            )}
            {activeGraph === 'abp_medical_doctor' && node.id === 'abp-read-vars' && (
              <div className="px-2.5 py-1.5 bg-[#10121a] border-t border-slate-800 flex items-center justify-between text-[10px] text-emerald-300">
                <span>bIsHoldingItem:</span>
                <span className={`font-bold ${isHoldingItemSim ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isHoldingItemSim ? 'TRUE (Adrenalina)' : 'FALSE'}
                </span>
              </div>
            )}
            {activeGraph === 'abp_medical_doctor' && node.id === 'abp-control-rig' && (
              <div className="px-2.5 py-1.5 bg-[#10121a] border-t border-slate-800 flex items-center justify-between text-[10px] text-purple-300">
                <span>Effector Hand_R:</span>
                <span className="font-bold text-white">
                  {transitionAlpha > 0.05 ? `Hand_R_Socket (${(transitionAlpha * 100).toFixed(0)}%)` : 'Idle'}
                </span>
              </div>
            )}
            {activeGraph === 'abp_medical_doctor' && node.id === 'abp-spine-aim' && (
              <div className="px-2.5 py-1.5 bg-[#10121a] border-t border-slate-800 flex items-center justify-between text-[10px] text-fuchsia-300">
                <span>Spine Aim (RInterpTo):</span>
                <span className="font-bold text-white">
                  Pitch: {isHoldingItemSim ? `${spinePitchSim.toFixed(1)}°` : '0.0°'} | Yaw: {isHoldingItemSim ? `${spineYawSim.toFixed(1)}°` : '0.0°'}
                </span>
              </div>
            )}
            {activeGraph === 'abp_medical_doctor' && node.id === 'abp-modify-spine' && (
              <div className="px-2.5 py-1.5 bg-[#10121a] border-t border-slate-800 flex items-center justify-between text-[10px] text-purple-300">
                <span>Modify Bone:</span>
                <span className="font-bold text-emerald-400">
                  spine_02/03 (Alpha: {(transitionAlpha * 100).toFixed(0)}%)
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Blueprint Explanation Banner */}
        <div className="absolute bottom-4 left-4 bg-[#141620]/95 border border-purple-500/30 p-3.5 rounded-xl text-xs max-w-xl shadow-2xl text-slate-300 pointer-events-none">
          {activeGraph === 'abp_medical_doctor' ? (
            <div>
              <div className="font-bold text-purple-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>ABP_MedicalDoctor: EventGraph & Control Rig (CR_DoctorHandIK)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <strong>Event Graph:</strong> Lee <code>bIsHoldingItem</code>, <code>HeldDrugType</code>, <code>Speed</code> y la rotación calculada <code>ProceduralSpineRotation</code> (calculada en <code>AEEMedicalCharacter::Tick</code> con <code>FMath::RInterpTo</code> y <code>ClampAngle</code> ±35°/±50°).<br />
                <strong>Anim Graph:</strong> El nodo <code>Transform (Modify) Bone</code> orienta las vértebras <code>spine_02</code> y <code>spine_03</code> hacia el torso del paciente o retícula clínica, mientras el nodo <strong>Control Rig (CR_DoctorHandIK)</strong> resuelve la posición de <code>Hand_R</code> hacia <code>Hand_R_Socket</code> mediante Full Body IK (FBIK) guiado por el <strong>Alpha de Transición</strong>.
              </p>
            </div>
          ) : (
            <div>
              <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                <span>BP_Patient: Flujo de Interacción Desacoplada (IInteractableInterface)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Cuando el médico interactúa con la camilla, el Blueprint verifica de forma segura el ítem en mano, llama a <code>Server_AdministerTreatment</code> en el componente biológico C++, genera chispas de desfibrilación Niagara y actualiza los MetaSounds del monitor cardíaco.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
