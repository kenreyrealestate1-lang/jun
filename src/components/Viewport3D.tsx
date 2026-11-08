/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { PartyGamePostProcessShader } from '../utils/postProcessShaders';
import {
  SceneActor,
  LightingEnvironment,
  ViewportMode,
  ScenePreset,
  MedicalTreatmentItem,
  EPatientState,
  EDiseaseType,
  PatientVitals,
  FMedicalCaseData,
  EHospitalDepartment,
  FDepartmentConfig,
  HOSPITAL_DEPARTMENTS_CONFIG,
} from '../types/engine';
import {
  getProceduralGridTexture,
  getProceduralTilesTexture,
  getProceduralConcreteTexture,
  getProceduralMetalNormalMap,
  getHospitalWallTexture,
  getXRayViewerTexture,
  getMedicalPosterTexture,
  getEcgScreenTexture,
  getDefibScreenTexture,
  getCrashCartDrawerTexture,
  getCabinetHeaderTexture,
  getFloatingBadgeTexture,
  getScoreFloatingTexture,
  getHospitalFloorTacticalTexture,
  createAnimatedDefibScreen,
  getDepartmentSignTexture,
  getTriageScreenTexture,
  getPyxisScreenTexture,
} from '../utils/proceduralTextures';
import { VisualHeartbeatMonitor } from './VisualHeartbeatMonitor';

import {
  playFootstepSound,
  playJumpSound,
  playEcgBeep,
  playEcgFlatline,
  playDefibrillatorShock,
  playSyringeInject,
  playCodeBlueAlarm,
  playSelectActorSound,
  playBiohazardAlarm,
  playDisinfectSpray,
  playBlueprintCompileChime,
} from '../utils/audioSystem';
import {
  Hand,
  Syringe,
  Zap,
  Move,
  Smartphone,
  RotateCcw,
  Award,
  Star,
  Trophy,
  Clock,
  AlertTriangle,
  Activity,
  HeartPulse,
  Terminal,
  X,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Crosshair,
  HelpCircle,
  Pause,
  Play,
  Menu,
  BookOpen,
  Code2,
  Droplets,
  Check,
  Settings,
  Compass,
  Building2,
  Layers,
  Users,
  Stethoscope,
  Pill,
  DoorOpen,
  Lightbulb,
  Sun,
  Flame,
} from 'lucide-react';


// =========================================================================
// GESTOR DE OLEADAS Y PROGRESIÓN DE DIFICULTAD (AEEGameModeBase)
// =========================================================================
export interface FWaveDifficultyConfig {
  waveIndex: number;
  title: string;
  duration: number; // Segundos por oleada
  patientArrivalInterval: number; // Intervalo de llegada de nuevos pacientes (segundos)
  deteriorationMultiplier: number; // Multiplicador de velocidad de colapso
  cardiacArrestHealthThreshold: number; // Salud porcentual que dispara Paro Cardíaco
  hazardSpawnInterval: number; // Intervalo entre evaluaciones de fuga biológica en pasillos
  hazardSpawnChance: number; // Probabilidad de fuga (0.0 a 1.0)
}

export const WAVE_CONFIGURATIONS: FWaveDifficultyConfig[] = [
  {
    waveIndex: 1,
    title: 'Triaje Inicial & Observación',
    duration: 50,
    patientArrivalInterval: 22,
    deteriorationMultiplier: 1.0,
    cardiacArrestHealthThreshold: 20,
    hazardSpawnInterval: 24,
    hazardSpawnChance: 0.30,
  },
  {
    waveIndex: 2,
    title: 'Afluencia y Tensión Clínica',
    duration: 50,
    patientArrivalInterval: 14,
    deteriorationMultiplier: 1.5,
    cardiacArrestHealthThreshold: 26,
    hazardSpawnInterval: 18,
    hazardSpawnChance: 0.55,
  },
  {
    waveIndex: 3,
    title: 'Código Rojo: Colapso Hospitalario',
    duration: 50,
    patientArrivalInterval: 9,
    deteriorationMultiplier: 2.2,
    cardiacArrestHealthThreshold: 34,
    hazardSpawnInterval: 12,
    hazardSpawnChance: 0.80,
  },
];

interface Viewport3DProps {
  scenePreset: ScenePreset;
  actors: SceneActor[];
  selectedActorId: string | null;
  onSelectActor: (id: string | null) => void;
  lighting: LightingEnvironment;
  viewportMode: ViewportMode;
  onExitGameMode: () => void;
  blueprintActive: boolean;
  activeGizmo: 'translate' | 'rotate' | 'scale';
  onUpdateActor: (updated: SceneActor) => void;
  onOpenMainMenu?: () => void;
  onOpenEditorMode?: () => void;
}

const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3C = new THREE.Vector3();
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();

export const Viewport3D: React.FC<Viewport3DProps> = ({
  scenePreset,
  actors,
  selectedActorId,
  onSelectActor,
  lighting,
  viewportMode,
  onExitGameMode,
  blueprintActive,
  activeGizmo,
  onUpdateActor,
  onOpenMainMenu,
  onOpenEditorMode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // In-game Doctor inventory
  const [heldItem, setHeldItem] = useState<MedicalTreatmentItem>('None');
  const [shiftTime, setShiftTime] = useState(300);
  const [savedCount, setSavedCount] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [scoreFlyers, setScoreFlyers] = useState<{ id: number; text: string; sub: string }[]>([]);
  const [deceasedCount, setDeceasedCount] = useState(0);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [lobbyCountdown, setLobbyCountdown] = useState(12);
  const [isRoundEnded, setIsRoundEnded] = useState(false);
  const [showDevConsole, setShowDevConsole] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [showInGameGuide, setShowInGameGuide] = useState(false);
  const [screenFlash, setScreenFlash] = useState<'none' | 'cardiac' | 'defib' | 'cure'>('none');
  const triggerScreenFlashRef = useRef<(type: 'cardiac' | 'defib' | 'cure') => void>(() => {});
  const addScoreFlyerRef = useRef<(points: number, text: string, sub: string) => void>(() => {});
  const triggerCameraShakeRef = useRef<(intensity: number) => void>(() => {});

  // =========================================================================
  // GESTOR DE OLEADAS Y DIFICULTAD PROGRESIVA (AEEGameModeBase)
  // =========================================================================
  const [currentWaveIndex, setCurrentWaveIndex] = useState(1);
  const [waveSecondsLeft, setWaveSecondsLeft] = useState(50);
  const [waveNotification, setWaveNotification] = useState<{ wave: number; title: string; subtitle: string } | null>(null);
  const [hazardAlert, setHazardAlert] = useState<{ id: string; name: string; location: string } | null>(null);

  // =========================================================================
  // MATRIZ DE DEPARTAMENTOS & REABASTECIMIENTO DINÁMICO PYXIS (Core Layout)
  // =========================================================================
  const [showDepartmentMatrixModal, setShowDepartmentMatrixModal] = useState(false);
  const [pyxisRestockTimer, setPyxisRestockTimer] = useState(20);
  const [triageQueueCount, setTriageQueueCount] = useState(3);
  const [pyxisRestockFlash, setPyxisRestockFlash] = useState(false);

  // Hand_R_Socket Item Mesh Spawning Synchronization Ref
  const updateHandItemVisualsRef = useRef<(item: MedicalTreatmentItem) => void>(() => {});

  // UE5 Network RPC Replication Toast (Server_PickupDrug -> Multicast_AttachItemToSocket)
  const [rpcToast, setRpcToast] = useState<{ message: string; sub: string; type: 'pickup' | 'attach' | 'drop' | 'use' } | null>(null);
  const rpcToastTimeoutRef = useRef<number | null>(null);

  // =========================================================================
  // UMultiplayerSessionSubsystem: Estado de Sesión y Dos Instancias Locales
  // =========================================================================
  const [multiplayerSessionActive, setMultiplayerSessionActive] = useState(true);
  const [activeInstance, setActiveInstance] = useState<'server' | 'client'>('server');
  const [clientHeldItem, setClientHeldItem] = useState<MedicalTreatmentItem>('None');
  const [networkPing, setNetworkPing] = useState(24); // 24ms simulated LAN
  const updateClientHandItemVisualsRef = useRef<(item: MedicalTreatmentItem) => void>(() => {});
  const toggleActiveInstanceRef = useRef<() => void>(() => {});

  // =========================================================================
  // SISTEMA DE ILUMINACIÓN HOSPITALARIA DINÁMICA (Normal vs Emergencia Avisadora)
  // =========================================================================
  const [emergencyLightOverride, setEmergencyLightOverride] = useState(false);
  const emergencyLightOverrideRef = useRef(false);
  const [isHospitalInEmergencyLight, setIsHospitalInEmergencyLight] = useState(false);

  const toggleEmergencyLighting = () => {
    setEmergencyLightOverride((prev) => {
      const next = !prev;
      emergencyLightOverrideRef.current = next;
      if (next) {
        playCodeBlueAlarm();
        setRpcToast({
          message: '🚨 AEEHospitalLightingManager: Modo Emergencia Activado (+35% Luz)',
          sub: 'La iluminación general y quirúrgica sube para avisar visualmente a todo el equipo clínico',
          type: 'use',
        });
      } else {
        setRpcToast({
          message: '💡 AEEHospitalLightingManager: Iluminación Clínica Normal Restaurada',
          sub: 'Luz neutra 4500K homogénea, estéril y uniforme propia de hospital general',
          type: 'pickup',
        });
      }
      if (rpcToastTimeoutRef.current) window.clearTimeout(rpcToastTimeoutRef.current);
      rpcToastTimeoutRef.current = window.setTimeout(() => setRpcToast(null), 3200);
      return next;
    });
  };

  const setAndSyncHeldItem = (item: MedicalTreatmentItem) => {
    setHeldItem(item);
    updateHandItemVisualsRef.current(item);

    // Emular flujo de replicación RPC en red de Unreal Engine 5 (Server -> Multicast)
    if (rpcToastTimeoutRef.current) {
      window.clearTimeout(rpcToastTimeoutRef.current);
    }

    if (item === 'None') {
      setRpcToast({
        message: 'Server: Server_DropItem() ➔ Multicast_DetachFromSocket',
        sub: 'RED UE5: Hand_R_Socket liberado en Servidor (HeldDrugType::None)',
        type: 'drop',
      });
    } else {
      const blueprintName =
        item === 'Epinephrine'
          ? 'BP_Syringe_Epinephrine'
          : item === 'Defibrillator'
          ? 'BP_Defibrillator_Paddles'
          : item === 'IVBag'
          ? 'BP_Saline_IVBag'
          : 'BP_Syringe_Antibiotics';

      setRpcToast({
        message: `Server: Server_PickupDrug(HeldDrugType::${item}) ➔ Multicast_AttachItemToSocket`,
        sub: `Replicación: Hand_R_Socket ➔ ${blueprintName} (Listen Server)`,
        type: 'attach',
      });
    }

    rpcToastTimeoutRef.current = window.setTimeout(() => {
      setRpcToast(null);
    }, 2800);
  };

  const setAndSyncClientHeldItem = (item: MedicalTreatmentItem) => {
    setClientHeldItem(item);
    updateClientHandItemVisualsRef.current(item);

    if (rpcToastTimeoutRef.current) {
      window.clearTimeout(rpcToastTimeoutRef.current);
    }

    if (item === 'None') {
      setRpcToast({
        message: 'Client: Server_DropItem() ➔ Multicast_DetachFromSocket',
        sub: 'RED CLIENTE: Client_Hand_R_Socket liberado (HeldDrugType::None)',
        type: 'drop',
      });
    } else {
      const blueprintName =
        item === 'Epinephrine'
          ? 'BP_Syringe_Epinephrine'
          : item === 'Defibrillator'
          ? 'BP_Defibrillator_Paddles'
          : item === 'IVBag'
          ? 'BP_Saline_IVBag'
          : 'BP_Syringe_Antibiotics';

      setRpcToast({
        message: `Client: Server_PickupDrug(${item}) ➔ Multicast_AttachItemToSocket`,
        sub: `Replicación: Client_Hand_R_Socket ➔ ${blueprintName} (Ping: ${networkPing}ms)`,
        type: 'attach',
      });
    }

    rpcToastTimeoutRef.current = window.setTimeout(() => {
      setRpcToast(null);
    }, 2800);
  };

  // Alternar entre Instancia 1 (Listen Server) e Instancia 2 (Cliente)
  const toggleActiveInstance = () => {
    const nextInstance = activeInstance === 'server' ? 'client' : 'server';
    setActiveInstance(nextInstance);
    playBlueprintCompileChime();
    setRpcToast({
      message: `UMultiplayerSessionSubsystem: Foco alternado ➔ [${nextInstance === 'server' ? 'LISTEN SERVER (Dr. Ramírez)' : 'CLIENT (Dra. Elena)'}]`,
      sub: `Modo Local Testing • CMC Lag Compensation & Predicción de Red Activa`,
      type: 'use',
    });
    if (rpcToastTimeoutRef.current) window.clearTimeout(rpcToastTimeoutRef.current);
    rpcToastTimeoutRef.current = window.setTimeout(() => setRpcToast(null), 2500);
  };
  toggleActiveInstanceRef.current = toggleActiveInstance;

  // Virtual Touch Controls State (WBP_TouchControls simulation)
  const [stickVisual, setStickVisual] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [nearbyPrompt, setNearbyPrompt] = useState<string | null>(null);
  const virtualStickRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const performInteractionRef = useRef<() => void>(() => {});
  const rebuildSceneRef = useRef<() => void>(() => {});
  const joystickCenterRef = useRef<{ x: number; y: number } | null>(null);

  const stateRef = useRef({
    scenePreset,
    actors,
    selectedActorId,
    lighting,
    viewportMode,
    blueprintActive,
    activeGizmo,
    heldItem,
    clientHeldItem,
    activeInstance,
    multiplayerSessionActive,
    networkPing,
  });

  stateRef.current = {
    scenePreset,
    actors,
    selectedActorId,
    lighting,
    viewportMode,
    blueprintActive,
    activeGizmo,
    heldItem,
    clientHeldItem,
    activeInstance,
    multiplayerSessionActive,
    networkPing,
  };

  // Virtual Joystick Handlers for WBP_TouchControls (Enhanced Input IA_Move simulation)
  const updateStickPosition = (clientX: number, clientY: number) => {
    if (!joystickCenterRef.current) return;
    const maxRadius = 42;
    const dx = clientX - joystickCenterRef.current.x;
    const dy = clientY - joystickCenterRef.current.y;
    const dist = Math.hypot(dx, dy);

    let clampedX = dx;
    let clampedY = dy;
    if (dist > maxRadius) {
      clampedX = (dx / dist) * maxRadius;
      clampedY = (dy / dist) * maxRadius;
    }

    setStickVisual({ x: clampedX, y: clampedY });
    // Vector de entrada normalizado hacia IA_Move
    virtualStickRef.current = {
      x: clampedX / maxRadius,
      y: clampedY / maxRadius,
    };
  };

  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    joystickCenterRef.current = { x: centerX, y: centerY };
    updateStickPosition(e.clientX, e.clientY);
  };

  const handleJoystickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!joystickCenterRef.current) return;
    updateStickPosition(e.clientX, e.clientY);
  };

  const handleJoystickPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignorar si no estaba capturado
    }
    joystickCenterRef.current = null;
    virtualStickRef.current = { x: 0, y: 0 };
    setStickVisual({ x: 0, y: 0 });
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    canvasRef.current = renderer.domElement;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = stateRef.current.lighting.exposure;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0f17);
    scene.fog = new THREE.FogExp2(0x0c0f17, 0.012);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      600
    );
    // Isometric clinical overview angle
    camera.position.set(0, 16, 18);
    camera.lookAt(0, 0, 0);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // =========================================================================
    // POST-PROCESSING VOLUME (PARTY GAME STYLIZED PIPELINE & NARRATIVE TENSION)
    // =========================================================================
    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    let colorGradePass: ShaderPass | null = null;

    if (!isSoftwareGl) {
      try {
        composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        // 1. UnrealBloomPass: Soft Bloom Calibrado (Alta transparencia y anti-destellos)
        // Threshold en 0.96: SOLO pantallas emisivas CRT, diodos de balizas y partículas emiten glow
        // El suelo, paredes y batas médicas NUNCA se sobreexponen ni queman la imagen
        bloomPass = new UnrealBloomPass(
          new THREE.Vector2(container.clientWidth, container.clientHeight),
          0.26, // Soft bloom strength (fino y transparente)
          0.22, // Blur radius compacto
          stateRef.current.lighting.bloomThreshold ?? 1.2  // Threshold quirúrgico para evitar deslumbre blanco
        );
        composer.addPass(bloomPass);

        // 2. PartyGamePostProcessShader: Color Grading Saturado y Contrastado + Contact Ambient Occlusion
        colorGradePass = new ShaderPass(PartyGamePostProcessShader);
        composer.addPass(colorGradePass);

        // 3. OutputPass: Gestión Cinematográfica de Rango Dinámico (ACES Filmic + sRGB Transfer)
        const outputPass = new OutputPass();
        composer.addPass(outputPass);
      } catch (err) {
        console.warn('Post-processing fallback to direct WebGL rendering:', err);
        composer = null;
      }
    }

    // Hospital Lighting Rig - Iluminación Diseñada por Artistas (Luz clara, nítida y transparente)
    const sunLight = new THREE.DirectionalLight(0xf8fafc, 1.15);
    sunLight.position.set(12, 24, 10);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = isSoftwareGl ? 512 : 2048;
    sunLight.shadow.mapSize.height = isSoftwareGl ? 512 : 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 80;
    const d = 20;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.035;
    sunLight.shadow.radius = 2.4; // Sombras suaves con penumbra cinematográfica (PCFSoftShadowMap)
    scene.add(sunLight);

    const skyLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.58);
    scene.add(skyLight);

    // Lámpara Giratoria de Emergencia (Código Azul / Paro Cardíaco)
    const alarmLight = new THREE.PointLight(0xef4444, 0, 20);
    alarmLight.position.set(0, 5.5, 0);
    scene.add(alarmLight);

    // Troffers Clínicos de Techo (4500K Blanco Quirúrgico Estéril en Camillas de Reanimación y Observación)
    const trofferLightEast = new THREE.SpotLight(0xf1f5f9, 0.85, 20, Math.PI / 3.2, 0.45, 1.8);
    trofferLightEast.position.set(5.6, 6.0, 1.8);
    trofferLightEast.target.position.set(5.6, 0.9, 1.8);
    trofferLightEast.castShadow = !isSoftwareGl;
    scene.add(trofferLightEast);
    scene.add(trofferLightEast.target);

    const trofferLightWest = new THREE.SpotLight(0xf1f5f9, 0.85, 20, Math.PI / 3.2, 0.45, 1.8);
    trofferLightWest.position.set(-6.2, 6.0, 0.2);
    trofferLightWest.target.position.set(-6.2, 0.9, 0.2);
    trofferLightWest.castShadow = !isSoftwareGl;
    scene.add(trofferLightWest);
    scene.add(trofferLightWest.target);

    // Luminaria Fluorescente Parpadeante en Pasillo de Emergencias (Tensión Artística de Balasto)
    const corridorFixtureGroup = new THREE.Group();
    corridorFixtureGroup.position.set(0, 5.8, -4.5);

    const fixtureTroughMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 });
    const fixtureTrough = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.12, 0.55), fixtureTroughMat);
    corridorFixtureGroup.add(fixtureTrough);

    // Tubos fluorescentes duales con material emisivo reactivo (Luz clínica 4500K)
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xf1f5f9,
      emissiveIntensity: 1.0,
      roughness: 0.3,
    });
    const tube1 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 3.4, 10), tubeMat);
    tube1.rotation.z = Math.PI / 2;
    tube1.position.set(0, -0.06, -0.14);
    corridorFixtureGroup.add(tube1);

    const tube2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 3.4, 10), tubeMat);
    tube2.rotation.z = Math.PI / 2;
    tube2.position.set(0, -0.06, 0.14);
    corridorFixtureGroup.add(tube2);

    scene.add(corridorFixtureGroup);

    // Luminaria cenital de pasillo (Luz estéril de hospital general)
    const corridorFlickerLight = new THREE.PointLight(0xf1f5f9, 1.05, 20, 2);
    corridorFlickerLight.position.set(0, 5.4, -4.5);
    corridorFlickerLight.castShadow = !isSoftwareGl;
    corridorFlickerLight.shadow.bias = -0.0004;
    scene.add(corridorFlickerLight);

    // =========================================================================
    // LUCES DE EMERGENCIA DINÁMICAS (LUCES CENITALES DE ALARMA TRANSPARENTES)
    // =========================================================================
    // 1. Luz Cenital Roja Estroboscópica de Alta Tensión (Código Azul / Paro Cardíaco)
    const emergencyCeilingRedLight = new THREE.PointLight(0xef4444, 0, 20, 1.8);
    emergencyCeilingRedLight.position.set(2.0, 5.7, 0.5);
    emergencyCeilingRedLight.castShadow = !isSoftwareGl;
    emergencyCeilingRedLight.shadow.bias = -0.0004;
    scene.add(emergencyCeilingRedLight);

    // 2. Luz Cenital Azul Suave de Emergencia Hospitalaria (Wash & Ambient Breathing)
    const emergencyCeilingBlueLight = new THREE.PointLight(0x38bdf8, 0.5, 18, 1.8);
    emergencyCeilingBlueLight.position.set(-2.0, 5.7, 0.5);
    scene.add(emergencyCeilingBlueLight);

    // 3. Spot Cenital de Alarma Focalizada con Proyección Cónica (Transparente y suave)
    const emergencyStrobeSpot = new THREE.SpotLight(0xff3333, 0, 22, Math.PI / 3.5, 0.5, 1.8);
    emergencyStrobeSpot.position.set(0, 5.85, 0.5);
    emergencyStrobeSpot.target.position.set(0, 0, 0.5);
    scene.add(emergencyStrobeSpot);
    scene.add(emergencyStrobeSpot.target);

    // 4. Balizas Físicas 3D en Techo con Lentes Fresnel Bicolor (BP_Ceiling_Emergency_Beacon)
    const emergencyBeaconLenses: {
      mesh: THREE.Mesh;
      mat: THREE.MeshStandardMaterial;
      type: 'red' | 'blue';
    }[] = [];

    const ceilingBeaconPositions: [number, number, number][] = [
      [0, 5.85, 0.5],     // Central ER Bay
      [4.0, 5.85, 1.0],   // Cama 02 (Bahía Reanimación)
      [-4.0, 5.85, 1.0],  // Cama 01 (Bahía Anafilaxia)
    ];

    ceilingBeaconPositions.forEach(([bx, by, bz]) => {
      const beaconGroup = new THREE.Group();
      beaconGroup.position.set(bx, by, bz);

      // Base circular de anclaje a techo en acero oscuro
      const basePlate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.6, 0.08, 16),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 })
      );
      beaconGroup.add(basePlate);

      // Soporte metálico cromado
      const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.06, 0.25),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.15 })
      );
      bracket.position.y = -0.04;
      beaconGroup.add(bracket);

      // Cúpula / Lente Fresnel Roja (Alarma Crítica)
      const redDomeMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xef4444,
        emissiveIntensity: 0.3,
        roughness: 0.15,
        transparent: true,
        opacity: 0.9,
      });
      const redDome = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 14, 14, 0, Math.PI * 2, 0, Math.PI / 1.8),
        redDomeMat
      );
      redDome.rotation.x = Math.PI;
      redDome.position.set(0.24, -0.16, 0);
      beaconGroup.add(redDome);
      emergencyBeaconLenses.push({ mesh: redDome, mat: redDomeMat, type: 'red' });

      // Cúpula / Lente Fresnel Azul Suave (Tensión Hospitalaria)
      const blueDomeMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
        roughness: 0.15,
        transparent: true,
        opacity: 0.9,
      });
      const blueDome = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 14, 14, 0, Math.PI * 2, 0, Math.PI / 1.8),
        blueDomeMat
      );
      blueDome.rotation.x = Math.PI;
      blueDome.position.set(-0.24, -0.16, 0);
      beaconGroup.add(blueDome);
      emergencyBeaconLenses.push({ mesh: blueDome, mat: blueDomeMat, type: 'blue' });

      scene.add(beaconGroup);
    });

    // =========================================================================
    // HOSPITAL ROOM ARCHITECTURE (PBR Floors, Walls, Bumper Rails & Signage)
    // =========================================================================
    // 1. Hospital Ward Floor with High-Gloss Antimicrobial Linoleum Tiles & ER Guide Striping
    const groundGeo = new THREE.PlaneGeometry(36, 30);
    const tacticalFloorTex = getHospitalFloorTacticalTexture();
    tacticalFloorTex.wrapS = THREE.ClampToEdgeWrapping;
    tacticalFloorTex.wrapT = THREE.ClampToEdgeWrapping;
    tacticalFloorTex.repeat.set(1, 1);

    const groundMat = new THREE.MeshPhysicalMaterial({
      map: tacticalFloorTex,
      roughness: 0.45,
      metalness: 0.02,
      clearcoat: 0.05,
      clearcoatRoughness: 0.35,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.set(0, 0, 0.5);
    groundMesh.receiveShadow = !isSoftwareGl;
    scene.add(groundMesh);

    // Dark Outer Hospital Zone Perimeter
    const outerGroundGeo = new THREE.PlaneGeometry(160, 160);
    const outerGroundMat = new THREE.MeshStandardMaterial({ color: 0x070a12, roughness: 0.8 });
    const outerGround = new THREE.Mesh(outerGroundGeo, outerGroundMat);
    outerGround.rotation.x = -Math.PI / 2;
    outerGround.position.y = -0.01;
    scene.add(outerGround);

    // 2. Hospital Perimeter Walls with Two-tone Ceramic & Vinyl Bumper Rails
    const wallMat = new THREE.MeshStandardMaterial({
      map: getHospitalWallTexture(),
      roughness: 0.4,
      metalness: 0.1,
    });

    // Back Wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(32, 6.0, 0.4), wallMat);
    backWall.position.set(0, 3.0, -9.0);
    backWall.receiveShadow = !isSoftwareGl;
    scene.add(backWall);

    // Left Wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6.0, 24), wallMat);
    leftWall.position.set(-15.8, 3.0, 2.0);
    leftWall.receiveShadow = !isSoftwareGl;
    scene.add(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6.0, 24), wallMat);
    rightWall.position.set(15.8, 3.0, 2.0);
    rightWall.receiveShadow = !isSoftwareGl;
    scene.add(rightWall);

    // 3. Hospital Wall Props & Authentic Clinical Props
    // A. Backlit X-Ray View-Box Illuminator on Back Wall
    const xrayBox = new THREE.Group();
    xrayBox.position.set(-8.5, 3.6, -8.75);
    const xrayFrameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const xrayFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 0.1), xrayFrameMat);
    xrayBox.add(xrayFrame);

    const xrayScreenMat = new THREE.MeshStandardMaterial({
      map: getXRayViewerTexture(),
      emissive: 0xbae6fd,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });
    const xrayScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), xrayScreenMat);
    xrayScreen.position.z = 0.055;
    xrayBox.add(xrayScreen);
    scene.add(xrayBox);

    // B. Clinical Emergency Posters (Code Blue Protocol & Hygiene)
    const posterGeo = new THREE.PlaneGeometry(1.2, 1.7);
    const codeBluePosterMat = new THREE.MeshStandardMaterial({ map: getMedicalPosterTexture('code_blue'), roughness: 0.3 });
    const codeBluePoster = new THREE.Mesh(posterGeo, codeBluePosterMat);
    codeBluePoster.position.set(2.8, 3.6, -8.78);
    scene.add(codeBluePoster);

    const hygienePosterMat = new THREE.MeshStandardMaterial({ map: getMedicalPosterTexture('hygiene'), roughness: 0.3 });
    const hygienePoster = new THREE.Mesh(posterGeo, hygienePosterMat);
    hygienePoster.position.set(4.6, 3.6, -8.78);
    scene.add(hygienePoster);

    const bioPosterMat = new THREE.MeshStandardMaterial({ map: getMedicalPosterTexture('biohazard'), roughness: 0.3 });
    const bioPoster = new THREE.Mesh(posterGeo, bioPosterMat);
    bioPoster.position.set(-3.2, 3.6, -8.78);
    scene.add(bioPoster);

    // C. Illuminated Emergency Exit Sign (Green LED running man over corridor)
    const exitSignGroup = new THREE.Group();
    exitSignGroup.position.set(0, 5.0, -8.75);
    const exitHousing = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.6, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7 })
    );
    exitSignGroup.add(exitHousing);

    const exitLightMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 2.5,
    });
    const exitFace = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 0.45), exitLightMat);
    exitFace.position.z = 0.08;
    exitSignGroup.add(exitFace);
    scene.add(exitSignGroup);

    // D. Wall Fire Extinguisher (Extintor de Incendios Clase ABC)
    const extinguisherGroup = new THREE.Group();
    extinguisherGroup.position.set(15.55, 2.2, -4.0);
    const extTank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.75, 16),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3, metalness: 0.5 })
    );
    extinguisherGroup.add(extTank);
    const extValve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
    );
    extValve.position.y = 0.42;
    extinguisherGroup.add(extValve);
    scene.add(extinguisherGroup);

    // E. Ceiling Recessed Surgical Light Troffers (Warm Diffuse Overhead Emission)
    const trofferPositions = [
      [-5.0, 5.8, -1.0],
      [5.0, 5.8, -1.0],
      [-5.0, 5.8, 4.5],
      [5.0, 5.8, 4.5],
    ];
    trofferPositions.forEach(([tx, ty, tz]) => {
      const troffer = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.1, 1.2),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xf8fafc,
          emissiveIntensity: 1.4,
          roughness: 0.2,
        })
      );
      troffer.position.set(tx, ty, tz);
      scene.add(troffer);
    });

    // =========================================================================
    // MATRIZ DE DEPARTAMENTOS: GUÍAS EN SUELO & RÓTULOS OVERHEAD (Radial Layout)
    // =========================================================================
    const deptWayfindingGroup = new THREE.Group();
    deptWayfindingGroup.name = 'Hospital_Radial_Wayfinding';

    // 1. Central Corridor Hub Disc (Punto neurálgico de distribución)
    const hubDiscGeo = new THREE.RingGeometry(1.2, 1.45, 32);
    const hubDiscMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    const hubDisc = new THREE.Mesh(hubDiscGeo, hubDiscMat);
    hubDisc.rotation.x = -Math.PI / 2;
    hubDisc.position.set(0, 0.02, 1.2);
    deptWayfindingGroup.add(hubDisc);

    const hubCenterCrossGeo = new THREE.PlaneGeometry(0.8, 0.8);
    const hubCenterCross = new THREE.Mesh(
      hubCenterCrossGeo,
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
    );
    hubCenterCross.rotation.x = -Math.PI / 2;
    hubCenterCross.position.set(0, 0.022, 1.2);
    deptWayfindingGroup.add(hubCenterCross);

    // 2. Líneas Radiales de Navegación Rápida hacia Departamentos
    interface RadialTrack {
      color: number;
      start: [number, number];
      end: [number, number];
      width: number;
    }
    const radialTracks: RadialTrack[] = [
      // Norte: Hacia 1. Admisión & Triaje
      { color: 0x38bdf8, start: [0, 0.2], end: [0, -6.2], width: 0.3 },
      // Este: Hacia 2. Bahías de Reanimación (Código Azul)
      { color: 0xef4444, start: [1.2, 1.2], end: [5.2, 1.2], width: 0.3 },
      // Oeste: Hacia 3. Cubículos de Tratamiento Estándar
      { color: 0x10b981, start: [-1.2, 1.2], end: [-5.2, 1.2], width: 0.3 },
      // Sur-Oeste: Hacia 4. Farmacia Central (Pyxis)
      { color: 0xf59e0b, start: [-0.8, 2.0], end: [-3.0, 6.2], width: 0.3 },
      // Sur-Este: Hacia 5. Zona Hazmat & Descontaminación
      { color: 0xa855f7, start: [0.8, 2.0], end: [3.0, 6.2], width: 0.3 },
    ];

    radialTracks.forEach((track) => {
      const dx = track.end[0] - track.start[0];
      const dz = track.end[1] - track.start[1];
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);

      const trackMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(track.width, len),
        new THREE.MeshBasicMaterial({
          color: track.color,
          transparent: true,
          opacity: 0.55,
          side: THREE.DoubleSide,
        })
      );
      trackMesh.rotation.x = -Math.PI / 2;
      trackMesh.rotation.z = -angle;
      trackMesh.position.set((track.start[0] + track.end[0]) / 2, 0.02, (track.start[1] + track.end[1]) / 2);
      deptWayfindingGroup.add(trackMesh);
    });

    // 3. Rótulos Luminosos Suspendidos de Techo por Departamento (Overhead Signage)
    const deptSigns = [
      {
        idx: 1,
        title: '1. Admisión & Triaje',
        cap: 'Cap: 6 en espera • Flujo: 15-30s',
        col: '#38bdf8',
        pos: [0, 4.8, -5.2] as [number, number, number],
        rotY: 0,
      },
      {
        idx: 2,
        title: '2. Reanimación (Código Azul)',
        cap: 'Cap: 2 Críticas • Límite: 30-45s',
        col: '#ef4444',
        pos: [5.6, 4.8, 2.0] as [number, number, number],
        rotY: -Math.PI / 2,
      },
      {
        idx: 3,
        title: '3. Tratamiento Estándar',
        cap: 'Cap: 4 Observación • Resolución: 60-90s',
        col: '#10b981',
        pos: [-5.6, 4.8, 0.8] as [number, number, number],
        rotY: Math.PI / 2,
      },
      {
        idx: 4,
        title: '4. Farmacia Central (Pyxis)',
        cap: 'Dispensador 4000 • Reposición: 20s',
        col: '#f59e0b',
        pos: [-3.2, 4.8, 5.8] as [number, number, number],
        rotY: Math.PI,
      },
      {
        idx: 5,
        title: '5. Hazmat & Descontaminación',
        cap: 'Nivel 3 Bioseguridad • Ducha Química',
        col: '#a855f7',
        pos: [3.2, 4.8, 5.8] as [number, number, number],
        rotY: Math.PI,
      },
    ];

    deptSigns.forEach((s) => {
      const signGroup = new THREE.Group();
      signGroup.position.set(...s.pos);
      signGroup.rotation.y = s.rotY;

      // Cables de acero suspendidos al techo
      [-1.3, 1.3].forEach((cx) => {
        const cable = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.015, 1.1, 6),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
        );
        cable.position.set(cx, 0.55, 0);
        signGroup.add(cable);
      });

      // Panel de rótulo iluminado
      const signTex = getDepartmentSignTexture(s.idx, s.title, s.cap, s.col);
      const signMat = new THREE.MeshStandardMaterial({
        map: signTex,
        emissiveMap: signTex,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 1.1,
        roughness: 0.25,
      });
      const signMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.95, 0.1), signMat);
      signGroup.add(signMesh);

      deptWayfindingGroup.add(signGroup);
    });

    // 4. Biombos Médicos Divisorios en Cubículos de Tratamiento Estándar
    [-1.0, 2.0].forEach((bz) => {
      const curtainGroup = new THREE.Group();
      curtainGroup.position.set(-6.8, 1.6, bz);

      const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
      const curtainMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6, transparent: true, opacity: 0.75 });

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.2, 8), poleMat);
      pole.rotation.x = Math.PI / 2;
      pole.position.y = 1.4;
      curtainGroup.add(pole);

      const fabric = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.4, 2.8), curtainMat);
      curtainGroup.add(fabric);

      deptWayfindingGroup.add(curtainGroup);
    });

    scene.add(deptWayfindingGroup);

    // =========================================================================
    // STYLIZED DOCTOR CHARACTER (Stylized Lab Coat, Stethoscope, Mask & Cap)
    // =========================================================================
    const doctorGroup = new THREE.Group();
    doctorGroup.position.set(0, 0, 6);
    scene.add(doctorGroup);

    const coatMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
    const scrubMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 }); // Medical teal/sky
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.55 });
    const metallicMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.15 });
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25 }); // Nitrile blue gloves

    // 1. Control Rig Root Pelvis / Hips (Bouncing & Banking)
    const docPelvis = new THREE.Group();
    docPelvis.name = 'pelvis';
    doctorGroup.add(docPelvis);

    // Legs with Scrub Pants & Hospital Clogs (Pivoted from Pelvis)
    const docLegGeo = new THREE.BoxGeometry(0.2, 0.85, 0.22);
    const leftLeg = new THREE.Mesh(docLegGeo, scrubMat);
    leftLeg.position.set(-0.2, 0.45, 0);
    leftLeg.castShadow = !isSoftwareGl;
    const rightLeg = new THREE.Mesh(docLegGeo, scrubMat);
    rightLeg.position.set(0.2, 0.45, 0);
    rightLeg.castShadow = !isSoftwareGl;
    docPelvis.add(leftLeg, rightLeg);

    // 2. Control Rig Spine / Chest (Procedural Upper Body Orientation toward Target & Breathing)
    const docSpineChest = new THREE.Group();
    docSpineChest.name = 'spine_chest';
    docSpineChest.position.set(0, 0.85, 0);
    docPelvis.add(docSpineChest);

    // Torso / White Lab Coat with Folded Lapels
    const docTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 1.15, 16), coatMat);
    docTorso.position.set(0, 0.50, 0);
    docTorso.castShadow = !isSoftwareGl;
    docSpineChest.add(docTorso);

    // Inner scrub shirt visible at collar
    const innerScrub = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.3, 0.2), scrubMat);
    innerScrub.position.set(0, 0.97, 0.28);
    docSpineChest.add(innerScrub);

    // Coat Buttons & ID Badge clipped to chest pocket
    for (let b = 0; b < 3; b++) {
      const button = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), metallicMat);
      button.rotation.x = Math.PI / 2;
      button.position.set(0, 0.65 - b * 0.22, 0.42);
      docSpineChest.add(button);
    }

    const idBadge = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.16, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4 })
    );
    idBadge.position.set(-0.22, 0.70, 0.41);
    docSpineChest.add(idBadge);

    // Dual-Lumen Stethoscope Draped Around Neck
    const stethTubingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const stethLoop = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 10, 24, Math.PI * 1.3), stethTubingMat);
    stethLoop.rotation.x = Math.PI / 2.3;
    stethLoop.rotation.z = -Math.PI / 1.5;
    stethLoop.position.set(0, 0.95, 0.05);
    docSpineChest.add(stethLoop);

    // Stethoscope Chest Piece (Campana de auscultación)
    const stethHead = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 16), metallicMat);
    stethHead.rotation.x = Math.PI / 2;
    stethHead.position.set(0.08, 0.50, 0.43);
    docSpineChest.add(stethHead);

    // Left Arm Pivot on Spine (Shoulder Joint for Locomotion Swing & Dual-Hand Holding)
    const docArmGeo = new THREE.BoxGeometry(0.16, 0.72, 0.18);
    const leftArmPivot = new THREE.Group();
    leftArmPivot.name = 'upperarm_l';
    leftArmPivot.position.set(-0.48, 0.77, 0);
    docSpineChest.add(leftArmPivot);

    const leftArm = new THREE.Mesh(docArmGeo, coatMat);
    leftArm.position.set(0, -0.32, 0);
    leftArmPivot.add(leftArm);

    const leftGlove = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.18, 0.16), gloveMat);
    leftGlove.position.set(0, -0.34, 0);
    leftArm.add(leftGlove);

    // Right Arm Pivot (Shoulder joint for FBIK & Holding pose)
    const rightArmPivot = new THREE.Group();
    rightArmPivot.name = 'upperarm_r';
    rightArmPivot.position.set(0.48, 0.77, 0);
    docSpineChest.add(rightArmPivot);

    const rightArm = new THREE.Mesh(docArmGeo, coatMat);
    rightArm.position.set(0, -0.32, 0);
    rightArmPivot.add(rightArm);

    // Right Hand Bone & Hand_R_Socket (Parent: hand_r) with Nitrile Glove
    const handRBone = new THREE.Group();
    handRBone.name = 'hand_r';
    handRBone.position.set(0, -0.68, 0);
    rightArmPivot.add(handRBone);

    const handMesh = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.18, 0.16), gloveMat);
    handMesh.position.set(0, 0, 0.02);
    handRBone.add(handMesh);

    // UE5 Skeletal Mesh Socket: Hand_R_Socket
    const handRSocket = new THREE.Group();
    handRSocket.name = 'Hand_R_Socket';
    handRSocket.position.set(0.035, -0.02, 0.12);
    handRSocket.rotation.set(-Math.PI / 2, 0, 0);
    handRBone.add(handRSocket);

    // 3. Control Rig Neck & Head (Procedural Look-At IK towards Patient & Targets)
    const docNeckHead = new THREE.Group();
    docNeckHead.name = 'neck_head';
    docNeckHead.position.set(0, 1.25, 0);
    docSpineChest.add(docNeckHead);

    const docHead = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 20), skinMat);
    docHead.position.set(0, 0.05, 0);
    docHead.castShadow = !isSoftwareGl;
    docNeckHead.add(docHead);

    // Surgical Face Mask (Cubrebocas médico)
    const maskMat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, roughness: 0.4 });
    const docMask = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.22), maskMat);
    docMask.position.set(0, -0.05, 0.24);
    docNeckHead.add(docMask);

    // Expressive Stylized Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
    leftEye.position.set(-0.11, 0.12, 0.3);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeMat);
    rightEye.position.set(0.11, 0.12, 0.3);
    docNeckHead.add(leftEye, rightEye);

    // Surgical Scrub Cap with Hem
    const docCap = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.35, 0.24, 20), scrubMat);
    docCap.position.set(0, 0.24, 0);
    docNeckHead.add(docCap);

    // Doctor Headlamp / Frontal Mirror
    const mirrorBracket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.1), metallicMat);
    mirrorBracket.position.set(0, 0.22, 0.35);
    docNeckHead.add(mirrorBracket);
    const mirrorLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.02, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.1 })
    );
    mirrorLens.rotation.x = Math.PI / 2;
    mirrorLens.position.set(0, 0.22, 0.41);
    docNeckHead.add(mirrorLens);

    // Function to physically instantiate or destroy the 3D actor in Hand_R_Socket (OnRep_HeldDrug equivalent)
    const spawnHeldItemActor = (drugItem: MedicalTreatmentItem) => {
      // 1. Limpieza de actor previo (DestroyActor)
      while (handRSocket.children.length > 0) {
        const child = handRSocket.children[0];
        handRSocket.remove(child);
        if ((child as any).geometry) (child as any).geometry.dispose();
      }

      // 2. Si no hay ítem (None), finaliza con la mano libre
      if (drugItem === 'None') {
        return;
      }

      // 3. Instanciación según la clase del ítem
      if (drugItem === 'Epinephrine' || drugItem === 'Antibiotics') {
        // --- BP_Syringe_Item ---
        const syringeGroup = new THREE.Group();
        syringeGroup.name = drugItem === 'Epinephrine' ? 'BP_Syringe_Epinephrine' : 'BP_Syringe_Antibiotics';

        const fluidColor = drugItem === 'Epinephrine' ? 0xef4444 : 0x06b6d4;

        // Cilindro de vidrio graduado
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transmission: 0.85,
          opacity: 0.75,
          transparent: true,
          roughness: 0.1,
          metalness: 0.1,
          ior: 1.5,
        });
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.36, 16), glassMat);
        barrel.position.y = 0.18;
        syringeGroup.add(barrel);

        // Líquido medicamentoso en el interior (Adrenalina / Antibiótico)
        const fluidMat = new THREE.MeshStandardMaterial({
          color: fluidColor,
          emissive: fluidColor,
          emissiveIntensity: 2.2,
          roughness: 0.2,
        });
        const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.26, 16), fluidMat);
        liquid.position.y = 0.15;
        syringeGroup.add(liquid);

        // Émbolo y tope de goma
        const plungerMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
        const plunger = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 12), plungerMat);
        plunger.position.y = -0.02;
        syringeGroup.add(plunger);

        const thumbDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 16), plungerMat);
        thumbDisk.position.y = -0.13;
        syringeGroup.add(thumbDisk);

        // Aguja hipodérmica metálica
        const needleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
        const needleHub = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.05, 12), needleMat);
        needleHub.position.y = 0.385;
        syringeGroup.add(needleHub);

        const needleTip = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.18, 8), needleMat);
        needleTip.position.y = 0.49;
        syringeGroup.add(needleTip);

        handRSocket.add(syringeGroup);
      } else if (drugItem === 'Defibrillator') {
        // --- BP_Defibrillator_Paddles ---
        const defibGroup = new THREE.Group();
        defibGroup.name = 'BP_Defibrillator_Paddles';

        // Placa conductora de choque metálica (Electrodos de descarga 200J)
        const plateMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.2 });
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.32), plateMat);
        plate.position.y = 0.02;
        defibGroup.add(plate);

        // Mango ergonómico aislado de alto voltaje (Polímero amarillo/rojo de seguridad)
        const handleMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.18, 0.12), handleMat);
        handle.position.y = 0.12;
        defibGroup.add(handle);

        const gripTop = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 12), handleMat);
        gripTop.rotation.x = Math.PI / 2;
        gripTop.position.set(0, 0.22, 0);
        defibGroup.add(gripTop);

        // Botón rojo de descarga
        const btnMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.8 });
        const shockBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 12), btnMat);
        shockBtn.position.set(0, 0.26, 0.04);
        defibGroup.add(shockBtn);

        // LED de capacitor cargado
        const ledMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 2.5 });
        const chargeLed = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), ledMat);
        chargeLed.position.set(0, 0.18, 0.08);
        defibGroup.add(chargeLed);

        handRSocket.add(defibGroup);
      } else if (drugItem === 'IVBag') {
        // --- BP_Saline_IVBag (Bolsa de Suero Salino Fisiológico 0.9% NaCl) ---
        const ivGroup = new THREE.Group();
        ivGroup.name = 'BP_Saline_IVBag';

        // 1. Bolsa de PVC médico transparente y flexible (Cuerpo principal)
        const bagVinylMat = new THREE.MeshPhysicalMaterial({
          color: 0xf0f9ff,
          transmission: 0.85,
          opacity: 0.8,
          transparent: true,
          roughness: 0.15,
          metalness: 0.05,
          ior: 1.45,
          depthWrite: false,
        });
        const bagMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 0.09), bagVinylMat);
        bagMesh.position.y = 0.14;
        ivGroup.add(bagMesh);

        // 2. Líquido salino isotónico en el interior (0.9% NaCl con leve brillo electrolítico)
        const salineFluidMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.7,
          roughness: 0.1,
          transparent: true,
          opacity: 0.65,
        });
        const salineFluid = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.28, 0.07), salineFluidMat);
        salineFluid.position.y = 0.11;
        ivGroup.add(salineFluid);

        // 3. Ojal de suspensión superior reforzado (Para colgar en soporte de suero / gancho de transporte)
        const hangerMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
        const hangerTab = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.02), hangerMat);
        hangerTab.position.y = 0.35;
        ivGroup.add(hangerTab);

        const hangerRing = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.009, 8, 16), hangerMat);
        hangerRing.position.set(0, 0.38, 0);
        ivGroup.add(hangerRing);

        // 4. Etiqueta frontal clínica con graduación de volumen (500ml NaCl)
        const labelCanvas = document.createElement('canvas');
        labelCanvas.width = 256;
        labelCanvas.height = 384;
        const lctx = labelCanvas.getContext('2d')!;
        lctx.fillStyle = '#ffffff';
        lctx.fillRect(0, 0, 256, 384);
        lctx.fillStyle = '#0284c7';
        lctx.fillRect(0, 0, 256, 48);
        lctx.fillStyle = '#ffffff';
        lctx.font = 'bold 22px sans-serif';
        lctx.textAlign = 'center';
        lctx.fillText('0.9% NaCl 500ml', 128, 34);
        lctx.fillStyle = '#0f172a';
        lctx.font = 'bold 18px monospace';
        lctx.fillText('SUERO SALINO', 128, 90);
        lctx.font = '14px sans-serif';
        lctx.fillStyle = '#475569';
        lctx.fillText('SOLUCIÓN FISIOLÓGICA', 128, 120);
        // Escala graduada de mililitros
        lctx.strokeStyle = '#0284c7';
        lctx.lineWidth = 3;
        for (let y = 160; y <= 340; y += 40) {
          lctx.beginPath();
          lctx.moveTo(30, y);
          lctx.lineTo(80, y);
          lctx.stroke();
          lctx.font = 'bold 12px monospace';
          lctx.fillText(`${500 - ((y - 160) / 40) * 100}ml`, 120, y + 4);
        }
        const labelTexture = new THREE.CanvasTexture(labelCanvas);
        labelTexture.colorSpace = THREE.SRGBColorSpace;
        const labelMat = new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true, opacity: 0.95 });
        const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.26), labelMat);
        labelMesh.position.set(0, 0.14, 0.048);
        ivGroup.add(labelMesh);

        // 5. Puerto inferior con cámara de goteo transparente (Drip chamber)
        const dripChamberMat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transmission: 0.9,
          transparent: true,
          opacity: 0.75,
          roughness: 0.1,
        });
        const portSpike = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 10), hangerMat);
        portSpike.position.y = -0.06;
        ivGroup.add(portSpike);

        const dripChamber = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.09, 12), dripChamberMat);
        dripChamber.position.y = -0.13;
        ivGroup.add(dripChamber);

        // Gota suspendida dentro de la cámara
        const dropMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.01, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1 })
        );
        dropMesh.position.set(0, -0.14, 0);
        ivGroup.add(dropMesh);

        // 6. Tubuladura de infusión intravenosa flexible y clamp de regulación
        const tubeMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.65 });
        const tubeCurve = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.01, 8, 20, Math.PI), tubeMat);
        tubeCurve.position.set(0.04, -0.22, 0);
        tubeCurve.rotation.z = Math.PI / 2;
        ivGroup.add(tubeCurve);

        // Regulador de rodillo azul
        const clampMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 });
        const clampMesh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.03), clampMat);
        clampMesh.position.set(0.08, -0.22, 0);
        ivGroup.add(clampMesh);

        handRSocket.add(ivGroup);
      }
    };

    updateHandItemVisualsRef.current = spawnHeldItemActor;

    // Inicializar visual de ítem si ya tiene algo equipado
    if (stateRef.current.heldItem !== 'None') {
      spawnHeldItemActor(stateRef.current.heldItem);
    }

    // =========================================================================
    // CLIENT INSTANCE DOCTOR (UMultiplayerSessionSubsystem - Dra. Elena / Player 2)
    // =========================================================================
    const clientDoctorGroup = new THREE.Group();
    clientDoctorGroup.name = 'Client_MedicalCharacter_Elena';
    const clientDoctorPos = new THREE.Vector3(2.5, 0, 6.0);
    let clientDoctorRotY = 0;
    clientDoctorGroup.position.copy(clientDoctorPos);
    scene.add(clientDoctorGroup);

    const clientCoatMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.35 }); // Emerald/green surgical coat
    const clientScrubMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.3 }); // Dark teal scrubs
    const clientSkinMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.55 });
    const clientGloveMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.25 }); // Purple nitrile gloves

    // Client Pelvis & Locomotion
    const clientPelvis = new THREE.Group();
    clientDoctorGroup.add(clientPelvis);

    const clientLegGeo = new THREE.BoxGeometry(0.2, 0.82, 0.22);
    const clientLeftLeg = new THREE.Mesh(clientLegGeo, clientScrubMat);
    clientLeftLeg.position.set(-0.2, 0.41, 0);
    clientLeftLeg.castShadow = !isSoftwareGl;
    const clientRightLeg = new THREE.Mesh(clientLegGeo, clientScrubMat);
    clientRightLeg.position.set(0.2, 0.41, 0);
    clientRightLeg.castShadow = !isSoftwareGl;

    const clientShoeL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.3), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }));
    clientShoeL.position.set(-0.2, 0.06, 0.04);
    const clientShoeR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.3), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }));
    clientShoeR.position.set(0.2, 0.06, 0.04);
    clientPelvis.add(clientLeftLeg, clientRightLeg, clientShoeL, clientShoeR);

    // Client Spine
    const clientSpineChest = new THREE.Group();
    clientSpineChest.position.set(0, 0.82, 0);
    clientPelvis.add(clientSpineChest);

    const clientTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 1.15, 16), clientCoatMat);
    clientTorso.position.set(0, 0.52, 0);
    clientTorso.castShadow = !isSoftwareGl;
    clientSpineChest.add(clientTorso);

    // Client Badge (Dra. Elena • CLIENT)
    const clientBadge = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.18, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.6 })
    );
    clientBadge.position.set(-0.22, 0.70, 0.41);
    clientSpineChest.add(clientBadge);

    // Client Stethoscope
    const clientSteth = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.028, 8, 20, Math.PI * 1.3), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 }));
    clientSteth.rotation.x = Math.PI / 2.3;
    clientSteth.rotation.z = -Math.PI / 1.5;
    clientSteth.position.set(0, 0.95, 0.05);
    clientSpineChest.add(clientSteth);

    // Client Arms
    const clientArmGeo = new THREE.BoxGeometry(0.16, 0.72, 0.18);
    const clientLeftArmPivot = new THREE.Group();
    clientLeftArmPivot.position.set(-0.48, 0.77, 0);
    clientSpineChest.add(clientLeftArmPivot);
    const clientLeftArm = new THREE.Mesh(clientArmGeo, clientCoatMat);
    clientLeftArm.position.set(0, -0.32, 0);
    clientLeftArmPivot.add(clientLeftArm);

    const clientRightArmPivot = new THREE.Group();
    clientRightArmPivot.position.set(0.48, 0.77, 0);
    clientSpineChest.add(clientRightArmPivot);
    const clientRightArm = new THREE.Mesh(clientArmGeo, clientCoatMat);
    clientRightArm.position.set(0, -0.32, 0);
    clientRightArmPivot.add(clientRightArm);

    const clientHandRBone = new THREE.Group();
    clientHandRBone.position.set(0, -0.68, 0);
    clientRightArmPivot.add(clientHandRBone);

    const clientHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.18, 0.16), clientGloveMat);
    clientHandMesh.position.set(0, 0, 0.02);
    clientHandRBone.add(clientHandMesh);

    // Client Socket (Client_Hand_R_Socket)
    const clientHandRSocket = new THREE.Group();
    clientHandRSocket.name = 'Client_Hand_R_Socket';
    clientHandRSocket.position.set(0.035, -0.02, 0.12);
    clientHandRSocket.rotation.set(-Math.PI / 2, 0, 0);
    clientHandRBone.add(clientHandRSocket);

    // Client Head
    const clientNeckHead = new THREE.Group();
    clientNeckHead.position.set(0, 1.25, 0);
    clientSpineChest.add(clientNeckHead);

    const clientHead = new THREE.Mesh(new THREE.SphereGeometry(0.31, 18, 18), clientSkinMat);
    clientHead.position.set(0, 0.05, 0);
    clientHead.castShadow = !isSoftwareGl;
    clientNeckHead.add(clientHead);

    const clientCap = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.34, 0.24, 18), clientScrubMat);
    clientCap.position.set(0, 0.24, 0);
    clientNeckHead.add(clientCap);

    const clientMask = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.20, 0.22), new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.4 }));
    clientMask.position.set(0, -0.05, 0.24);
    clientNeckHead.add(clientMask);

    const clientEyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const cEyeL = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), clientEyeMat);
    cEyeL.position.set(-0.10, 0.12, 0.29);
    const cEyeR = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), clientEyeMat);
    cEyeR.position.set(0.10, 0.12, 0.29);
    clientNeckHead.add(cEyeL, cEyeR);

    // Floating Nametag on Client Doctor: "CLIENT: Dra. Elena"
    const clientNametagCanvas = document.createElement('canvas');
    clientNametagCanvas.width = 320;
    clientNametagCanvas.height = 72;
    const nctx = clientNametagCanvas.getContext('2d')!;
    nctx.fillStyle = 'rgba(8, 14, 26, 0.9)';
    nctx.roundRect(4, 4, 312, 64, 18);
    nctx.fill();
    nctx.strokeStyle = '#10b981';
    nctx.lineWidth = 3;
    nctx.stroke();
    nctx.fillStyle = '#34d399';
    nctx.font = 'bold 22px monospace';
    nctx.textAlign = 'center';
    nctx.fillText('💻 CLIENT: Dra. Elena', 160, 42);
    const clientNametagTex = new THREE.CanvasTexture(clientNametagCanvas);
    clientNametagTex.colorSpace = THREE.SRGBColorSpace;
    const clientNametagMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 0.45),
      new THREE.MeshBasicMaterial({ map: clientNametagTex, transparent: true, depthWrite: false })
    );
    clientNametagMesh.position.set(0, 1.88, 0);
    clientDoctorGroup.add(clientNametagMesh);

    // Spawner para Client_Hand_R_Socket
    const spawnClientHeldItemActor = (drugItem: MedicalTreatmentItem) => {
      while (clientHandRSocket.children.length > 0) {
        const child = clientHandRSocket.children[0];
        clientHandRSocket.remove(child);
        if ((child as any).geometry) (child as any).geometry.dispose();
      }
      if (drugItem === 'None') return;

      if (drugItem === 'Epinephrine' || drugItem === 'Antibiotics') {
        const syringeGroup = new THREE.Group();
        syringeGroup.name = 'Client_BP_Syringe_Epinephrine';
        const fluidColor = drugItem === 'Epinephrine' ? 0xef4444 : 0x06b6d4;
        const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.85, opacity: 0.75, transparent: true, roughness: 0.1 });
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.36, 12), glassMat);
        barrel.position.y = 0.18;
        const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.26, 12), new THREE.MeshStandardMaterial({ color: fluidColor, emissive: fluidColor, emissiveIntensity: 2.0 }));
        liquid.position.y = 0.15;
        const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.18, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95 }));
        needle.position.y = 0.49;
        syringeGroup.add(barrel, liquid, needle);
        clientHandRSocket.add(syringeGroup);
      } else if (drugItem === 'Defibrillator') {
        const defibGroup = new THREE.Group();
        defibGroup.name = 'Client_BP_Defibrillator_Paddles';
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.32), new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 }));
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.18, 0.12), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 }));
        handle.position.y = 0.12;
        defibGroup.add(plate, handle);
        clientHandRSocket.add(defibGroup);
      } else if (drugItem === 'IVBag') {
        const ivGroup = new THREE.Group();
        ivGroup.name = 'Client_BP_Saline_IVBag';
        const bag = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 0.09), new THREE.MeshPhysicalMaterial({ color: 0xf0f9ff, transmission: 0.85, transparent: true, opacity: 0.8 }));
        bag.position.y = 0.14;
        const fluid = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.28, 0.07), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.7, transparent: true, opacity: 0.65 }));
        fluid.position.y = 0.11;
        ivGroup.add(bag, fluid);
        clientHandRSocket.add(ivGroup);
      }
    };
    updateClientHandItemVisualsRef.current = spawnClientHeldItemActor;

    // Transform Gizmo Visualization
    const gizmoGroup = new THREE.Group();
    gizmoGroup.visible = false;
    scene.add(gizmoGroup);

    const gizmoMatX = new THREE.MeshBasicMaterial({ color: 0xef4444, depthTest: false });
    const gizmoMatY = new THREE.MeshBasicMaterial({ color: 0x22c55e, depthTest: false });
    const gizmoMatZ = new THREE.MeshBasicMaterial({ color: 0x3b82f6, depthTest: false });

    const axisX = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8), gizmoMatX);
    axisX.rotation.z = -Math.PI / 2;
    axisX.position.x = 0.9;
    gizmoGroup.add(axisX);

    const axisY = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8), gizmoMatY);
    axisY.position.y = 0.9;
    gizmoGroup.add(axisY);

    const axisZ = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8), gizmoMatZ);
    axisZ.rotation.x = Math.PI / 2;
    axisZ.position.z = 0.9;
    gizmoGroup.add(axisZ);

    const meshMap = new Map<string, THREE.Object3D>();

    const dangerZoneVisuals: {
      group: THREE.Group;
      particles: THREE.Mesh[];
      floorMat: THREE.MeshStandardMaterial;
      barrier: THREE.Mesh;
      beaconLight: THREE.PointLight;
      actorId: string;
      isContaminated: boolean;
    }[] = [];

    // =========================================================================
    // NIAGARA HEALING FX SYSTEM & CAMERA SHAKE / TRAUMA
    // =========================================================================
    const healingFxGroup = new THREE.Group();
    scene.add(healingFxGroup);

    interface HealingParticle {
      mesh: THREE.Object3D;
      velocity: THREE.Vector3;
      rotSpeed: THREE.Vector3;
      life: number;
      maxLife: number;
      baseScale: number;
      isHelix?: boolean;
      helixRadius?: number;
      helixAngle?: number;
      helixSpeed?: number;
      isConfetti?: boolean;
      flutterFreq?: number;
    }

    const activeJuiceParticles: HealingParticle[] = [];
    const activeShockwaves: { mesh: THREE.Mesh; life: number; maxLife: number; maxRadius: number }[] = [];
    const activeFloatingBadges: {
      mesh: THREE.Mesh;
      life: number;
      maxLife: number;
      startY: number;
      isScoreBadge?: boolean;
    }[] = [];

    const activePatientMonitors: {
      screenMesh: THREE.Mesh;
      screenMat: THREE.MeshStandardMaterial;
      beaconMat: THREE.MeshStandardMaterial;
      isCardiacArrest: boolean;
      actorId: string;
    }[] = [];

    // Confetti Geometries & Materials (Party Game Victory Celebration)
    const confettiGeo = new THREE.PlaneGeometry(0.18, 0.09);
    const confettiColors = [0x22c55e, 0xfacc15, 0xec4899, 0x06b6d4, 0x8b5cf6, 0xffffff];
    const confettiMats = confettiColors.map(
      (col) =>
        new THREE.MeshBasicMaterial({
          color: col,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
    );

    // Camera Trauma (0.0 to 1.0)
    let cameraTrauma = 0.0;
    const triggerCameraShake = (intensity: number) => {
      cameraTrauma = Math.min(1.0, cameraTrauma + intensity);
    };
    triggerCameraShakeRef.current = triggerCameraShake;

    // Patient Reaction State Map (shockTimer: 1.0 -> 0.0, cureTimer: 1.5 -> 0.0)
    const patientAnimStateMap = new Map<string, { shockTimer: number; cureTimer: number }>();

    const triggerPatientShockAnim = (actorId: string) => {
      patientAnimStateMap.set(actorId, { shockTimer: 1.0, cureTimer: 0 });
    };

    const triggerPatientCureAnim = (actorId: string) => {
      patientAnimStateMap.set(actorId, { shockTimer: 0, cureTimer: 1.5 });
    };

    // Doctor Procedural Treatment Action
    let treatmentActionTimer = 0.0;
    let treatmentActionType: 'defib' | 'syringe' | 'none' = 'none';
    let treatmentTargetPos: THREE.Vector3 | null = null;

    const triggerDoctorTreatmentAction = (type: 'defib' | 'syringe', target: THREE.Vector3) => {
      treatmentActionTimer = 1.0;
      treatmentActionType = type;
      treatmentTargetPos = target.clone();
    };

    // Shared Reusable Geometries for Healing Juice Particles
    const crossBarGeoH = new THREE.BoxGeometry(0.32, 0.09, 0.08);
    const crossBarGeoV = new THREE.BoxGeometry(0.09, 0.32, 0.08);
    const diamondGeo = new THREE.OctahedronGeometry(0.09, 0);
    const sparkSphereGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const shockwaveTorusGeo = new THREE.TorusGeometry(0.8, 0.045, 8, 32);

    const matCrossEmerald = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const matCrossGold = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const matSparkCyan = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const matSparkGold = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const spawnHealingJuice = (bedPos: THREE.Vector3, type: 'defib' | 'syringe') => {
      const isDefib = type === 'defib';

      // 1. Shockwave Expansion Ring (Radial Blast on Bed Plane)
      const ringMat = new THREE.MeshBasicMaterial({
        color: isDefib ? 0x38bdf8 : 0x22c55e,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const ringMesh = new THREE.Mesh(shockwaveTorusGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(bedPos.x, bedPos.y + 1.25, bedPos.z);
      ringMesh.scale.set(0.2, 0.2, 0.2);
      healingFxGroup.add(ringMesh);
      activeShockwaves.push({
        mesh: ringMesh,
        life: 0.8,
        maxLife: 0.8,
        maxRadius: 3.6,
      });

      // 2. Partículas de Confeti Flotante Multicolores (Celebración Fiesta al Curar)
      if (!isDefib) {
        for (let c = 0; c < 52; c++) {
          const cMat = confettiMats[c % confettiMats.length];
          const confettiMesh = new THREE.Mesh(confettiGeo, cMat);
          const ox = (Math.random() - 0.5) * 1.6;
          const oy = 1.35 + Math.random() * 0.4;
          const oz = (Math.random() - 0.5) * 2.6;
          confettiMesh.position.set(bedPos.x + ox, bedPos.y + oy, bedPos.z + oz);
          confettiMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
          healingFxGroup.add(confettiMesh);

          const burstAngle = Math.random() * Math.PI * 2;
          const burstSpd = 1.2 + Math.random() * 3.4;
          const upSpd = 3.8 + Math.random() * 4.2;
          const vel = new THREE.Vector3(
            Math.cos(burstAngle) * burstSpd,
            upSpd,
            Math.sin(burstAngle) * burstSpd
          );

          activeJuiceParticles.push({
            mesh: confettiMesh,
            velocity: vel,
            rotSpeed: new THREE.Vector3(
              (Math.random() - 0.5) * 14,
              (Math.random() - 0.5) * 14,
              (Math.random() - 0.5) * 14
            ),
            life: 2.2 + Math.random() * 0.9,
            maxLife: 3.1,
            baseScale: 0.85 + Math.random() * 0.45,
            isConfetti: true,
            flutterFreq: 8 + Math.random() * 8,
          });
        }
      }

      // 3. Dense Swarm de Destellos Verdes, Cruces 3D y Cristales Bioluminiscentes (55-70 Partículas)
      const particleCount = isDefib ? 65 : 60;
      for (let i = 0; i < particleCount; i++) {
        let pMesh: THREE.Object3D;
        const roll = Math.random();

        if (roll < 0.45) {
          // 3D Medical Cross (Dos barras emisivas perpendiculares con destello esmeralda)
          const crossGroup = new THREE.Group();
          const pickMat = (!isDefib || i % 2 === 0) ? (isDefib ? matSparkCyan : matCrossEmerald) : matCrossGold;
          const hBar = new THREE.Mesh(crossBarGeoH, pickMat);
          const vBar = new THREE.Mesh(crossBarGeoV, pickMat);
          crossGroup.add(hBar, vBar);
          pMesh = crossGroup;
        } else if (roll < 0.8) {
          // Diamante facetado / cristal de destello verde y dorado
          pMesh = new THREE.Mesh(diamondGeo, (!isDefib || i % 2 === 0) ? (isDefib ? matSparkCyan : matCrossEmerald) : matSparkGold);
        } else {
          // Esfera de energía de impacto
          pMesh = new THREE.Mesh(sparkSphereGeo, isDefib ? matSparkCyan : matCrossEmerald);
        }

        // Spawn repartido sobre la camilla
        const ox = (Math.random() - 0.5) * 1.8;
        const oy = 1.25 + (Math.random() - 0.5) * 0.4;
        const oz = (Math.random() - 0.5) * 2.8;
        pMesh.position.set(bedPos.x + ox, bedPos.y + oy, bedPos.z + oz);

        const initialScale = 0.65 + Math.random() * 0.75;
        pMesh.scale.set(initialScale, initialScale, initialScale);
        healingFxGroup.add(pMesh);

        // Velocidad: fuente vertical con dispersión radial
        const angle = Math.random() * Math.PI * 2;
        const burstSpeed = isDefib ? (1.5 + Math.random() * 3.5) : (1.0 + Math.random() * 2.5);
        const upSpeed = isDefib ? (3.5 + Math.random() * 4.0) : (3.0 + Math.random() * 3.8);

        const vel = new THREE.Vector3(
          Math.cos(angle) * burstSpeed,
          upSpeed,
          Math.sin(angle) * burstSpeed
        );

        const isHelix = i % 3 === 0;
        activeJuiceParticles.push({
          mesh: pMesh,
          velocity: vel,
          rotSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
          ),
          life: 1.5 + Math.random() * 1.0,
          maxLife: 2.5,
          baseScale: initialScale,
          isHelix,
          helixAngle: Math.random() * Math.PI * 2,
          helixRadius: 0.8 + Math.random() * 0.6,
          helixSpeed: (Math.random() > 0.5 ? 1 : -1) * (4.0 + Math.random() * 3.0),
        });
      }

      // 4. Número Flotante Animado (+100 PUNTOS) en Billboard 3D con Pop-in Elástico
      const scoreTex = isDefib
        ? getScoreFloatingTexture('+50 PUNTOS', '⚡ 200J DESCARGA EFECTIVA ⚡', false)
        : getScoreFloatingTexture('+100 PUNTOS', '★ ¡PACIENTE CURADO! ★', true);

      const scoreMat = new THREE.MeshBasicMaterial({
        map: scoreTex,
        transparent: true,
        opacity: 0.98,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const scoreMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.4), scoreMat);
      scoreMesh.position.set(bedPos.x, bedPos.y + 2.5, bedPos.z);
      scoreMesh.scale.set(0.01, 0.01, 0.01);
      healingFxGroup.add(scoreMesh);

      activeFloatingBadges.push({
        mesh: scoreMesh,
        life: 2.6,
        maxLife: 2.6,
        startY: bedPos.y + 2.5,
        isScoreBadge: true,
      });

      // 5. Notificación de Puntos y Triunfo en el HUD
      if (isDefib) {
        addScoreFlyerRef.current(50, '+50 PUNTOS', '⚡ 200J RITMO SINUSAL RESTABLECIDO ⚡');
      } else {
        addScoreFlyerRef.current(100, '+100 PUNTOS', '¡ALTA HOSPITALARIA COMPLETADA!');
        playBlueprintCompileChime();
      }
    };

    const animatedPatientChests: {
      mesh: THREE.Mesh;
      torsoGroup: THREE.Group;
      isCardiacArrest: boolean;
      actorId: string;
    }[] = [];

    const animatedNurses: {
      group: THREE.Group;
      spine: THREE.Group;
      head: THREE.Group;
      rightArm: THREE.Group;
    }[] = [];

    const animatedDefib = createAnimatedDefibScreen();

    // AEEMedicalCase Overlap Collision Triggers (UBoxComponent)
    interface BedCollisionTrigger {
      actorId: string;
      center: [number, number, number];
      extent: [number, number, number]; // [width, height, depth]
      floorPlaneMat: THREE.MeshBasicMaterial;
      cornerLinesMat: THREE.LineBasicMaterial;
      pulseRingMat: THREE.MeshBasicMaterial;
      requiredDrug: MedicalTreatmentItem;
      patientName: string;
      isCured: boolean;
    }
    const bedCollisionTriggers: BedCollisionTrigger[] = [];

    function rebuildScene() {
      meshMap.forEach((obj) => {
        scene.remove(obj);
      });
      meshMap.clear();
      dangerZoneVisuals.length = 0;
      animatedPatientChests.length = 0;
      animatedNurses.length = 0;
      activePatientMonitors.length = 0;
      bedCollisionTriggers.length = 0;

      const { actors: currentActors } = stateRef.current;

      currentActors.forEach((actor) => {
        let object3D: THREE.Object3D;

        if (actor.type === 'patient_stretcher') {
          // --- BP_Hospital_Emergency_Gurney (Camilla Clínica de Urgencias) ---
          const stretcher = new THREE.Group();
          const isCardiacArrest = actor.patientVitals?.currentState === 'CardiacArrest';
          const isAnaphylaxis = actor.patientVitals?.assignedDisease === 'Anaphylaxis';
          const isCured = actor.patientVitals?.currentState === 'Cured';

          // Materiales PBR Clínicos
          const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.15 });
          const chassisSteelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.25 });
          const wheelRubberMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
          const mattressCoverMat = new THREE.MeshStandardMaterial({
            color: isCardiacArrest ? 0xef4444 : isAnaphylaxis ? 0xeab308 : 0x0284c7,
            roughness: 0.35,
          });
          const sheetWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
          const blanketMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.65 });
          const patientSkinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.6 });
          const gownMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.5 });
          const ivBagMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.1, transparent: true, opacity: 0.65 });
          const tubingMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 });

          // 1. Chasis Inferior con 4 Ruedas Giratorias de Grado Hospitalario y Frenos
          const wheelOffsets = [
            [-0.85, -1.5],
            [0.85, -1.5],
            [-0.85, 1.5],
            [0.85, 1.5],
          ];

          wheelOffsets.forEach(([wx, wz]) => {
            const wheelFork = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 8), chromeMat);
            wheelFork.position.set(wx, 0.28, wz);
            stretcher.add(wheelFork);

            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.09, 14), wheelRubberMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(wx, 0.18, wz);
            wheel.castShadow = !isSoftwareGl;
            stretcher.add(wheel);

            const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 10), chromeMat);
            hub.rotation.z = Math.PI / 2;
            hub.position.set(wx, 0.18, wz);
            stretcher.add(hub);
          });

          // Barras del chasis inferior
          const baseLongBarLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 3.2), chassisSteelMat);
          baseLongBarLeft.position.set(-0.85, 0.28, 0);
          stretcher.add(baseLongBarLeft);

          const baseLongBarRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 3.2), chassisSteelMat);
          baseLongBarRight.position.set(0.85, 0.28, 0);
          stretcher.add(baseLongBarRight);

          const baseCrossBarFront = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.1), chassisSteelMat);
          baseCrossBarFront.position.set(0, 0.28, 1.5);
          stretcher.add(baseCrossBarFront);

          const baseCrossBarBack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.1), chassisSteelMat);
          baseCrossBarBack.position.set(0, 0.28, -1.5);
          stretcher.add(baseCrossBarBack);

          // Pedales de Freno Central (Rojo = Bloqueo, Verde = Desbloqueo)
          const brakePedalRed = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.06, 0.14),
            new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
          );
          brakePedalRed.position.set(0.2, 0.24, -1.62);
          stretcher.add(brakePedalRed);

          const brakePedalGreen = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.06, 0.14),
            new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.3 })
          );
          brakePedalGreen.position.set(-0.2, 0.24, -1.62);
          stretcher.add(brakePedalGreen);

          // Columnas del Sistema Hidráulico de Elevación en X (Tijera)
          const strut1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.9, 8), chromeMat);
          strut1.position.set(-0.45, 0.62, 0);
          strut1.rotation.x = 0.25;
          stretcher.add(strut1);

          const strut2 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.9, 8), chromeMat);
          strut2.position.set(0.45, 0.62, 0);
          strut2.rotation.x = -0.25;
          stretcher.add(strut2);

          // Bandeja de plataforma superior de la camilla
          const bedDeck = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.12, 4.0), chassisSteelMat);
          bedDeck.position.set(0, 0.92, 0);
          bedDeck.castShadow = !isSoftwareGl;
          stretcher.add(bedDeck);

          // Paragolpes esquineros de goma anti-impacto (4 esquinas)
          const bumperPositions = [
            [-1.15, -1.98],
            [1.15, -1.98],
            [-1.15, 1.98],
            [1.15, 1.98],
          ];
          bumperPositions.forEach(([bx, bz]) => {
            const bumper = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 12), wheelRubberMat);
            bumper.position.set(bx, 0.92, bz);
            stretcher.add(bumper);
          });

          // Barra de empuje ergonómica en cabecera
          const pushBar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.9, 10), chromeMat);
          pushBar.rotation.z = Math.PI / 2;
          pushBar.position.set(0, 1.25, -2.02);
          stretcher.add(pushBar);

          const pushMountL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8), chromeMat);
          pushMountL.position.set(-0.95, 1.08, -2.02);
          stretcher.add(pushMountL);

          const pushMountR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8), chromeMat);
          pushMountR.position.set(0.95, 1.08, -2.02);
          stretcher.add(pushMountR);

          // Barandas de Seguridad Plegables Laterales (Left & Right Safety Rails)
          [-1.15, 1.15].forEach((rx) => {
            // Pasamanos superior de la baranda
            const railTop = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.6, 8), chromeMat);
            railTop.rotation.x = Math.PI / 2;
            railTop.position.set(rx, 1.42, 0);
            stretcher.add(railTop);

            // Barrotines verticales de la baranda
            [-1.1, -0.55, 0, 0.55, 1.1].forEach((rz) => {
              const slat = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.44, 6), chromeMat);
              slat.position.set(rx, 1.2, rz);
              stretcher.add(slat);
            });
          });

          // 2. Colchón Clínico Articulado (Posición semi-Fowler para asistencia respiratoria/RCP)
          // Segmento de piernas/pelvis (horizontal)
          const mattressLegs = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.26, 2.2), mattressCoverMat);
          mattressLegs.position.set(0, 1.08, 0.7);
          mattressLegs.castShadow = !isSoftwareGl;
          stretcher.add(mattressLegs);

          // Segmento de torso/espalda (inclinado a 18 grados)
          const torsoGroup = new THREE.Group();
          torsoGroup.position.set(0, 1.08, -0.4);
          torsoGroup.rotation.x = 0.28;

          const mattressTorso = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.26, 1.5), mattressCoverMat);
          mattressTorso.position.set(0, 0, -0.7);
          mattressTorso.castShadow = !isSoftwareGl;
          torsoGroup.add(mattressTorso);

          // Almohada ergonómica hipoalergénica
          const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.16, 0.65), sheetWhiteMat);
          pillow.position.set(0, 0.18, -1.2);
          torsoGroup.add(pillow);

          // Cabeza del Paciente
          const patientHead = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 14), patientSkinMat);
          patientHead.position.set(0, 0.38, -1.18);
          patientHead.castShadow = !isSoftwareGl;
          torsoGroup.add(patientHead);

          // Gorro de quirófano del paciente
          const patientCap = new THREE.Mesh(
            new THREE.SphereGeometry(0.34, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2),
            gownMat
          );
          patientCap.position.set(0, 0.42, -1.18);
          torsoGroup.add(patientCap);

          // Mascarilla de Oxígeno sobre el rostro
          const oxygenMask = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.15, 0.16, 8),
            new THREE.MeshStandardMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.65 })
          );
          oxygenMask.rotation.x = Math.PI / 2;
          oxygenMask.position.set(0, 0.45, -0.92);
          torsoGroup.add(oxygenMask);

          // Torso del Paciente con Bata Hospitalaria (Animado por respiración procedural)
          const patientChest = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.32, 1.0), gownMat);
          patientChest.position.set(0, 0.24, -0.35);
          patientChest.castShadow = !isSoftwareGl;
          torsoGroup.add(patientChest);
          animatedPatientChests.push({
            mesh: patientChest,
            torsoGroup,
            isCardiacArrest,
            actorId: actor.id,
          });

          // Brazos del paciente a los costados
          const armLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 8), gownMat);
          armLeft.rotation.x = Math.PI / 2;
          armLeft.position.set(-0.75, 0.18, -0.3);
          torsoGroup.add(armLeft);

          const armRight = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 8), gownMat);
          armRight.rotation.x = Math.PI / 2;
          armRight.position.set(0.75, 0.18, -0.3);
          torsoGroup.add(armRight);

          // Pulsera de Triaje Hospitalario (Triage ID Wristband)
          let wristbandColor = 0x22c55e; // Verde = Estable/Curado
          if (isCardiacArrest) wristbandColor = 0xef4444; // Rojo = Código Azul
          else if (isAnaphylaxis) wristbandColor = 0xf59e0b; // Amarillo = Emergencia Grave

          const wristband = new THREE.Mesh(
            new THREE.CylinderGeometry(0.11, 0.11, 0.08, 10),
            new THREE.MeshStandardMaterial({ color: wristbandColor, emissive: wristbandColor, emissiveIntensity: 1.2 })
          );
          wristband.rotation.x = Math.PI / 2;
          wristband.position.set(0.75, 0.18, 0.12);
          torsoGroup.add(wristband);

          stretcher.add(torsoGroup);

          // Manta térmica hospitalaria cubriendo las piernas y abdomen
          const blanket = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.22, 1.9), blanketMat);
          blanket.position.set(0, 1.22, 0.75);
          blanket.castShadow = !isSoftwareGl;
          stretcher.add(blanket);

          // Dobladillo de sábana blanca sobre la manta
          const blanketHem = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.06, 0.22), sheetWhiteMat);
          blanketHem.position.set(0, 1.28, -0.16);
          stretcher.add(blanketHem);

          // 3. Palo de Suero Telescópico (IV Drip Pole) con Bolsa de Solución Fisiológica
          const ivPoleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.7, 8), chromeMat);
          ivPoleBase.position.set(-1.18, 2.15, -1.75);
          stretcher.add(ivPoleBase);

          // Ganchos dobles superiores
          const ivHookL = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6), chromeMat);
          ivHookL.rotation.z = Math.PI / 2.5;
          ivHookL.position.set(-1.05, 3.48, -1.75);
          stretcher.add(ivHookL);

          const ivHookR = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6), chromeMat);
          ivHookR.rotation.z = -Math.PI / 2.5;
          ivHookR.position.set(-1.31, 3.48, -1.75);
          stretcher.add(ivHookR);

          // Bolsa de suero transparente (Salina 0.9%)
          const ivBag = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.42, 0.08), ivBagMat);
          ivBag.position.set(-1.05, 3.18, -1.75);
          stretcher.add(ivBag);

          const ivBagCap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.06, 8),
            new THREE.MeshStandardMaterial({ color: 0x0284c7 })
          );
          ivBagCap.position.set(-1.05, 2.94, -1.75);
          stretcher.add(ivBagCap);

          // Tubuladura de infusión intravenosa hacia el brazo
          const ivTube = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.4, 6), tubingMat);
          ivTube.position.set(-0.95, 2.2, -1.2);
          ivTube.rotation.z = 0.25;
          stretcher.add(ivTube);

          // 4. Monitor Multiparamétrico de Signos Vitales de UCI/Urgencias
          const monitorStand = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.6, 8), chromeMat);
          monitorStand.position.set(1.18, 1.7, -1.75);
          stretcher.add(monitorStand);

          const monitorArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8), chromeMat);
          monitorArm.rotation.z = Math.PI / 2;
          monitorArm.position.set(1.0, 2.45, -1.75);
          stretcher.add(monitorArm);

          // Carcasa del monitor
          const monitorHousing = new THREE.Mesh(
            new THREE.BoxGeometry(0.85, 0.65, 0.22),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.5 })
          );
          monitorHousing.position.set(0.72, 2.55, -1.75);
          monitorHousing.rotation.y = -0.3; // Orientado hacia el centro de la cama
          stretcher.add(monitorHousing);

          // Pantalla emisiva con trazado de ECG y valores biomédicos reales
          const ecgTex = getEcgScreenTexture(isCardiacArrest);
          const screenMat = new THREE.MeshStandardMaterial({
            map: ecgTex,
            emissiveMap: ecgTex,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 1.8,
            roughness: 0.1,
          });

          const monitorScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.52), screenMat);
          monitorScreen.position.set(0.72, 2.55, -1.63);
          monitorScreen.rotation.y = -0.3;
          stretcher.add(monitorScreen);

          // Baliza de Alarma Crítica en la cúspide del monitor
          const alarmBeaconMat = new THREE.MeshStandardMaterial({
            color: isCardiacArrest ? 0xef4444 : isAnaphylaxis ? 0xf59e0b : 0x22c55e,
            emissive: isCardiacArrest ? 0xef4444 : isAnaphylaxis ? 0xf59e0b : 0x22c55e,
            emissiveIntensity: isCardiacArrest ? 3.0 : 1.2,
          });
          const alarmBeacon = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.1, 10), alarmBeaconMat);
          alarmBeacon.position.set(0.72, 2.92, -1.75);
          stretcher.add(alarmBeacon);

          activePatientMonitors.push({
            screenMesh: monitorScreen,
            screenMat,
            beaconMat: alarmBeaconMat,
            isCardiacArrest,
            actorId: actor.id,
          });

          // =========================================================================
          // AEEMedicalCase: ÁREA DE SOLAPAMIENTO DE RESOLUCIÓN (UBoxComponent)
          // =========================================================================
          const triggerExtent = actor.medicalCaseData?.triggerBoxExtent ?? [3.8, 2.5, 4.6];
          const triggerBoxGroup = new THREE.Group();
          triggerBoxGroup.name = 'UBoxComponent_OverlapTrigger';
          triggerBoxGroup.position.set(0, 0.02, 0);

          // 1. Plano de proyección en suelo (Zona de interacción médica)
          const triggerZoneColor = isCardiacArrest ? 0xef4444 : isCured ? 0x10b981 : 0x0284c7;
          const floorPlaneMat = new THREE.MeshBasicMaterial({
            color: triggerZoneColor,
            transparent: true,
            opacity: 0.12,
            depthWrite: false,
          });
          const triggerFloorPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(triggerExtent[0], triggerExtent[2]),
            floorPlaneMat
          );
          triggerFloorPlane.rotation.x = -Math.PI / 2;
          triggerBoxGroup.add(triggerFloorPlane);

          // 2. Cuatro Esquineros Holográficos Neón (Límites del Box Component en UE5)
          const cornerLinesMat = new THREE.LineBasicMaterial({
            color: triggerZoneColor,
            linewidth: 2,
            transparent: true,
            opacity: 0.8,
          });

          const hw = triggerExtent[0] / 2;
          const hd = triggerExtent[2] / 2;
          const cs = 0.6; // Tamaño de cada corchete esquinero

          const cornerPoints = [
            // Esquina Superior Izquierda
            new THREE.Vector3(-hw, 0.015, -hd + cs),
            new THREE.Vector3(-hw, 0.015, -hd),
            new THREE.Vector3(-hw, 0.015, -hd),
            new THREE.Vector3(-hw + cs, 0.015, -hd),
            // Esquina Superior Derecha
            new THREE.Vector3(hw - cs, 0.015, -hd),
            new THREE.Vector3(hw, 0.015, -hd),
            new THREE.Vector3(hw, 0.015, -hd),
            new THREE.Vector3(hw, 0.015, -hd + cs),
            // Esquina Inferior Derecha
            new THREE.Vector3(hw, 0.015, hd - cs),
            new THREE.Vector3(hw, 0.015, hd),
            new THREE.Vector3(hw, 0.015, hd),
            new THREE.Vector3(hw - cs, 0.015, hd),
            // Esquina Inferior Izquierda
            new THREE.Vector3(-hw + cs, 0.015, hd),
            new THREE.Vector3(-hw, 0.015, hd),
            new THREE.Vector3(-hw, 0.015, hd),
            new THREE.Vector3(-hw, 0.015, hd - cs),
          ];

          const cornerGeo = new THREE.BufferGeometry().setFromPoints(cornerPoints);
          const cornerSegments = new THREE.LineSegments(cornerGeo, cornerLinesMat);
          triggerBoxGroup.add(cornerSegments);

          // 3. Emblema médico central en el suelo del UBoxComponent
          const pulseRingMat = new THREE.MeshBasicMaterial({
            color: triggerZoneColor,
            transparent: true,
            opacity: 0.35,
            depthWrite: false,
          });
          const centerRing = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.42, 24), pulseRingMat);
          centerRing.rotation.x = -Math.PI / 2;
          centerRing.position.y = 0.016;
          triggerBoxGroup.add(centerRing);

          stretcher.add(triggerBoxGroup);

          // Registrar disparador de colisión en memoria
          bedCollisionTriggers.push({
            actorId: actor.id,
            center: [actor.position[0], actor.position[1], actor.position[2]],
            extent: triggerExtent,
            floorPlaneMat,
            cornerLinesMat,
            pulseRingMat,
            requiredDrug: actor.medicalCaseData?.requiredDrug ?? (isCardiacArrest ? 'Defibrillator' : 'Epinephrine'),
            patientName: actor.medicalCaseData?.patientName ?? (actor.id === 'stretcher_patient_1' ? 'Sr. Martinez' : 'Dra. Castillo'),
            isCured,
          });

          object3D = stretcher;
        } else if (actor.type === 'pharmacy_cabinet') {
          // --- BP_Pharmacy_Supply_Station (Armario de Farmacia Clínica & Medicación Crítica) ---
          const cabinet = new THREE.Group();

          const steelCabinetMat = new THREE.MeshStandardMaterial({
            color: 0x334155,
            metalness: 0.85,
            roughness: 0.25,
          });
          const interiorWhiteMat = new THREE.MeshStandardMaterial({
            color: 0xf1f5f9,
            roughness: 0.2,
            metalness: 0.1,
          });
          const glassDoorMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.05,
            transparent: true,
            opacity: 0.38,
          });
          const chromeMat = new THREE.MeshStandardMaterial({
            color: 0xd1d5db,
            metalness: 0.95,
            roughness: 0.15,
          });

          // 1. Cuerpo Principal del Armario
          const mainFrame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.8, 1.2), steelCabinetMat);
          mainFrame.position.set(0, 1.9, 0);
          mainFrame.castShadow = !isSoftwareGl;
          cabinet.add(mainFrame);

          // Rótulo Superior con Cruz Roja y Texto Hospitalario
          const headerTex = getCabinetHeaderTexture();
          const headerMat = new THREE.MeshStandardMaterial({
            map: headerTex,
            emissiveMap: headerTex,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 1.4,
            roughness: 0.2,
          });
          const headerSign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), headerMat);
          headerSign.position.set(0, 3.42, 0.61);
          cabinet.add(headerSign);

          // Cavidad interior iluminada (Cámara de medicamentos)
          const interiorBox = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.3, 0.9), interiorWhiteMat);
          interiorBox.position.set(0, 2.1, 0.1);
          cabinet.add(interiorBox);

          // Luz descendente interior LED del armario
          const cabLight = new THREE.PointLight(0xf8fafc, 1.8, 4.0);
          cabLight.position.set(0, 3.1, 0.4);
          cabinet.add(cabLight);

          // 2. Tres Baldas de Vidrio Templado con Medicamentos
          const shelfYPositions = [2.7, 2.05, 1.4];
          shelfYPositions.forEach((sy) => {
            const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.46, 0.04, 0.82), glassDoorMat);
            shelf.position.set(0, sy, 0.12);
            cabinet.add(shelf);
          });

          // Iluminación LED interior de baldas (Cool White Clinical Glow)
          shelfYPositions.forEach((sy) => {
            const ledStrip = new THREE.Mesh(
              new THREE.BoxGeometry(2.4, 0.02, 0.04),
              new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0x38bdf8,
                emissiveIntensity: 2.8,
              })
            );
            ledStrip.position.set(0, sy + 0.65, -0.2);
            cabinet.add(ledStrip);
          });

          // Balda 1 (Superior): Frascos Clínicos Modelados 3D (Medicine Glass Bottles con cuello y tapón)
          const bottleColors = [0x0284c7, 0xef4444, 0x16a34a, 0xeab308, 0x6366f1];
          for (let i = -0.95; i <= 0.95; i += 0.28) {
            const bottleGroup = new THREE.Group();
            bottleGroup.position.set(i, 2.72, 0.15);

            const col = bottleColors[Math.abs(Math.round(i * 10)) % bottleColors.length];
            const bottleBodyMat = new THREE.MeshPhysicalMaterial({
              color: col,
              roughness: 0.15,
              metalness: 0.1,
              transmission: 0.6,
              opacity: 0.85,
              transparent: true,
            });

            // Cuerpo del frasco
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.26, 14), bottleBodyMat);
            body.position.y = 0.13;
            bottleGroup.add(body);

            // Hombro cónico
            const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.06, 14), bottleBodyMat);
            shoulder.position.y = 0.29;
            bottleGroup.add(shoulder);

            // Cuello y tapón roscado
            const cap = new THREE.Mesh(
              new THREE.CylinderGeometry(0.045, 0.045, 0.05, 14),
              new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
            );
            cap.position.y = 0.34;
            bottleGroup.add(cap);

            // Etiqueta médica blanca frontal
            const label = new THREE.Mesh(
              new THREE.CylinderGeometry(0.082, 0.082, 0.15, 14, 1, true, -Math.PI / 3, (2 * Math.PI) / 3),
              new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
            );
            label.position.y = 0.13;
            bottleGroup.add(label);

            cabinet.add(bottleGroup);
          }

          // Balda 2 (Media): Ampollas de Adrenalina en Vidrio Ámbar y Soporte Acrílico con Jeringas Modeladas 3D
          // A. Ampollas de Vidrio Ámbar
          for (let i = -0.9; i <= -0.2; i += 0.18) {
            const ampouleGroup = new THREE.Group();
            ampouleGroup.position.set(i, 2.07, 0.18);

            const amberMat = new THREE.MeshPhysicalMaterial({
              color: 0xb45309,
              roughness: 0.1,
              transmission: 0.7,
              opacity: 0.88,
              transparent: true,
            });

            // Base de la ampolla
            const aBody = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 12), amberMat);
            aBody.position.y = 0.08;
            ampouleGroup.add(aBody);

            // Cuello estrecho de fractura
            const aNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.04, 0.06, 12), amberMat);
            aNeck.position.y = 0.19;
            ampouleGroup.add(aNeck);

            // Anillo azul de corte fácil
            const blueRing = new THREE.Mesh(
              new THREE.CylinderGeometry(0.02, 0.02, 0.015, 12),
              new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
            );
            blueRing.position.y = 0.22;
            ampouleGroup.add(blueRing);

            // Cúpula superior
            const aTip = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.06, 12), amberMat);
            aTip.position.y = 0.25;
            ampouleGroup.add(aTip);

            cabinet.add(ampouleGroup);
          }

          // B. Soporte Acrílico Escalonado con Jeringas Modeladas 3D
          const rackBase = new THREE.Mesh(
            new THREE.BoxGeometry(0.85, 0.05, 0.35),
            new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.1, transparent: true, opacity: 0.6 })
          );
          rackBase.position.set(0.48, 2.09, 0.18);
          cabinet.add(rackBase);

          for (let i = 0.15; i <= 0.85; i += 0.22) {
            const syringeModel = new THREE.Group();
            syringeModel.position.set(i, 2.12, 0.18);
            syringeModel.rotation.x = -Math.PI / 5; // Inclinadas ergonómicamente en el rack

            // Cilindro de jeringa transparente
            const sBody = new THREE.Mesh(
              new THREE.CylinderGeometry(0.035, 0.035, 0.28, 12),
              new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.85, roughness: 0.1, transparent: true, opacity: 0.75 })
            );
            sBody.position.y = 0.14;
            syringeModel.add(sBody);

            // Líquido medicamentoso interno (Rojo epinefrina)
            const sFluid = new THREE.Mesh(
              new THREE.CylinderGeometry(0.03, 0.03, 0.18, 12),
              new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.5 })
            );
            sFluid.position.y = 0.12;
            syringeModel.add(sFluid);

            // Vástago de émbolo y tope
            const sPlunger = new THREE.Mesh(
              new THREE.CylinderGeometry(0.015, 0.015, 0.16, 8),
              new THREE.MeshStandardMaterial({ color: 0xf1f5f9 })
            );
            sPlunger.position.y = -0.02;
            syringeModel.add(sPlunger);

            const sDisk = new THREE.Mesh(
              new THREE.CylinderGeometry(0.045, 0.045, 0.02, 12),
              new THREE.MeshStandardMaterial({ color: 0xef4444 })
            );
            sDisk.position.y = -0.10;
            syringeModel.add(sDisk);

            // Aguja metálica
            const sNeedle = new THREE.Mesh(
              new THREE.CylinderGeometry(0.005, 0.005, 0.14, 6),
              new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95 })
            );
            sNeedle.position.y = 0.35;
            syringeModel.add(sNeedle);

            cabinet.add(syringeModel);
          }

          // Balda 3 (Inferior): Frascos y Bolsas de Infusión Intravenosa Salina 0.9%
          for (let i = -0.9; i <= 0.9; i += 0.35) {
            const ivBottle = new THREE.Group();
            ivBottle.position.set(i, 1.42, 0.18);

            const glassSalineMat = new THREE.MeshPhysicalMaterial({
              color: 0x38bdf8,
              roughness: 0.1,
              metalness: 0.1,
              transmission: 0.8,
              opacity: 0.7,
              transparent: true,
            });

            // Botella de infusión
            const bBody = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.35, 14), glassSalineMat);
            bBody.position.y = 0.18;
            ivBottle.add(bBody);

            // Tapa de infusión con puerto de goma
            const bCap = new THREE.Mesh(
              new THREE.CylinderGeometry(0.045, 0.045, 0.04, 12),
              new THREE.MeshStandardMaterial({ color: 0x0284c7 })
            );
            bCap.position.y = 0.37;
            ivBottle.add(bCap);

            // Etiqueta clínica graduada
            const bLabel = new THREE.Mesh(
              new THREE.CylinderGeometry(0.092, 0.092, 0.22, 14, 1, true, -Math.PI / 2.5, (2 * Math.PI) / 2.5),
              new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
            );
            bLabel.position.y = 0.18;
            ivBottle.add(bLabel);

            cabinet.add(ivBottle);
          }

          // 3. Puertas Dobles de Cristal con Tiradores Cromados
          const doorL = new THREE.Mesh(new THREE.BoxGeometry(1.22, 2.25, 0.04), glassDoorMat);
          doorL.position.set(-0.62, 2.1, 0.6);
          cabinet.add(doorL);

          const handleL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.8, 8), chromeMat);
          handleL.position.set(-0.15, 2.1, 0.65);
          cabinet.add(handleL);

          const doorR = new THREE.Mesh(new THREE.BoxGeometry(1.22, 2.25, 0.04), glassDoorMat);
          doorR.position.set(0.62, 2.1, 0.6);
          cabinet.add(doorR);

          const handleR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.8, 8), chromeMat);
          handleR.position.set(0.15, 2.1, 0.65);
          cabinet.add(handleR);

          // 4. Cajones Inferiores de Acero Inoxidable (2 cajones anchos)
          [0.85, 0.35].forEach((dy) => {
            const drawerFace = new THREE.Mesh(
              new THREE.BoxGeometry(2.5, 0.44, 0.05),
              new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 })
            );
            drawerFace.position.set(0, dy, 0.58);
            cabinet.add(drawerFace);

            const drawerHandle = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.04), chromeMat);
            drawerHandle.position.set(0, dy, 0.62);
            cabinet.add(drawerHandle);
          });

          // Dispensador lateral de desinfectante hidroalcohólico
          const dispenser = new THREE.Mesh(
            new THREE.BoxGeometry(0.16, 0.35, 0.18),
            new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 })
          );
          dispenser.position.set(1.48, 2.0, 0.2);
          cabinet.add(dispenser);

          object3D = cabinet;
        } else if (actor.type === 'defib_station') {
          // --- BP_Emergency_Crash_Cart (Carro Rojo de Paro Cardíaco & Desfibrilador Bifásico) ---
          const cart = new THREE.Group();

          const redCartMat = new THREE.MeshStandardMaterial({
            color: 0xdc2626,
            roughness: 0.35,
            metalness: 0.3,
          });
          const bumperMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.85,
          });
          const chromeMat = new THREE.MeshStandardMaterial({
            color: 0xd1d5db,
            metalness: 0.95,
            roughness: 0.15,
          });

          // 1. Chasis y Ruedas Giratorias de Alta Movilidad
          const cartWidth = 2.0;
          const cartDepth = 1.4;
          const cartHeight = 2.0;

          const wheelOffsets = [
            [-cartWidth / 2 + 0.2, -cartDepth / 2 + 0.2],
            [cartWidth / 2 - 0.2, -cartDepth / 2 + 0.2],
            [-cartWidth / 2 + 0.2, cartDepth / 2 - 0.2],
            [cartWidth / 2 - 0.2, cartDepth / 2 - 0.2],
          ];

          wheelOffsets.forEach(([wx, wz]) => {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 12), bumperMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(wx, 0.16, wz);
            cart.add(wheel);
          });

          // Cuerpo Rojo Principal del Carro
          const cartBody = new THREE.Mesh(
            new THREE.BoxGeometry(cartWidth, cartHeight, cartDepth),
            redCartMat
          );
          cartBody.position.set(0, 1.15, 0);
          cartBody.castShadow = !isSoftwareGl;
          cart.add(cartBody);

          // Paragolpes esquineros de goma reforzada anti-impacto (4 esquinas verticales)
          wheelOffsets.forEach(([bx, bz]) => {
            const bumperCorner = new THREE.Mesh(
              new THREE.BoxGeometry(0.14, cartHeight, 0.14),
              bumperMat
            );
            bumperCorner.position.set(bx, 1.15, bz);
            cart.add(bumperCorner);
          });

          // Barra lateral de empuje rápido del carro
          const pushBar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, cartDepth * 0.85, 8), chromeMat);
          pushBar.rotation.x = Math.PI / 2;
          pushBar.position.set(cartWidth / 2 + 0.12, 1.95, 0);
          cart.add(pushBar);

          // 2. Cuatro Cajones Clínicos Tematizados con Texturas de Identificación
          const drawerConfigs = [
            { y: 1.82, idx: 1, title: 'CAJON 1: PARO CARDIACO', sub: 'ADRENALINA - AMIODARONA - ATROPINA', col: '#ef4444' },
            { y: 1.38, idx: 2, title: 'CAJON 2: VIA AEREA', sub: 'LARINGOSCOPIO - TUBOS ET - MASCARAS', col: '#3b82f6' },
            { y: 0.94, idx: 3, title: 'CAJON 3: ACCESO VASCULAR', sub: 'CATETERES - AGUJAS - EQUIPO SUERO', col: '#f59e0b' },
            { y: 0.50, idx: 4, title: 'CAJON 4: MISCELANEA', sub: 'PARCHES PADS - GEL CONDUCTOR - TIJERAS', col: '#10b981' },
          ];

          drawerConfigs.forEach((d) => {
            const drawerTex = getCrashCartDrawerTexture(d.idx, d.title, d.sub, d.col);
            const drawerFaceMat = new THREE.MeshStandardMaterial({
              map: drawerTex,
              roughness: 0.3,
            });

            const drawerFace = new THREE.Mesh(new THREE.PlaneGeometry(cartWidth - 0.28, 0.38), drawerFaceMat);
            drawerFace.position.set(0, d.y, cartDepth / 2 + 0.01);
            cart.add(drawerFace);

            // Tirador frontal continuo cromado
            const handle = new THREE.Mesh(new THREE.BoxGeometry(cartWidth - 0.45, 0.04, 0.03), chromeMat);
            handle.position.set(0, d.y + 0.12, cartDepth / 2 + 0.03);
            cart.add(handle);
          });

          // 3. Bandeja Superior de Acero Inoxidable con Reborde Antiderrame
          const topTray = new THREE.Mesh(
            new THREE.BoxGeometry(cartWidth + 0.08, 0.06, cartDepth + 0.08),
            new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
          );
          topTray.position.set(0, 2.18, 0);
          cart.add(topTray);

          // 4. Consola del Desfibrilador Bifásico Profesional (Montada sobre la bandeja)
          const defibConsoleGroup = new THREE.Group();
          defibConsoleGroup.position.set(0, 2.22, 0);

          // Carcasa en gris pizarra industrial
          const consoleBody = new THREE.Mesh(
            new THREE.BoxGeometry(1.3, 0.6, 0.85),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.5 })
          );
          consoleBody.position.set(0, 0.3, -0.05);
          consoleBody.castShadow = !isSoftwareGl;
          defibConsoleGroup.add(consoleBody);

          // Pantalla de Osciloscopio CRT del Desfibrilador Animada en Tiempo Real (200J BIFÁSICO / RITMO FV)
          const defibScreenMat = new THREE.MeshStandardMaterial({
            map: animatedDefib.texture,
            emissiveMap: animatedDefib.texture,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 2.2,
            roughness: 0.1,
          });
          const defibScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.42), defibScreenMat);
          defibScreen.position.set(-0.22, 0.32, 0.38);
          defibConsoleGroup.add(defibScreen);

          // Dial Giratorio Selector de Energía (OFF / 50J / 100J / 150J / 200J / 360J)
          const dialBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16), chromeMat);
          dialBase.rotation.x = Math.PI / 2;
          dialBase.position.set(0.35, 0.42, 0.39);
          defibConsoleGroup.add(dialBase);

          const dialKnob = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.06, 12),
            new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 })
          );
          dialKnob.rotation.x = Math.PI / 2;
          dialKnob.position.set(0.35, 0.42, 0.42);
          defibConsoleGroup.add(dialKnob);

          // Botón Pulsador de Descarga Roja de Alta Tensión "SHOCK"
          const shockBtn = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12),
            new THREE.MeshStandardMaterial({
              color: 0xef4444,
              emissive: 0xef4444,
              emissiveIntensity: 2.4,
              roughness: 0.2,
            })
          );
          shockBtn.rotation.x = Math.PI / 2;
          shockBtn.position.set(0.35, 0.2, 0.39);
          defibConsoleGroup.add(shockBtn);

          // Cunas Holster y Palas de Descarga (Adult Defibrillator Shock Paddles)
          [-0.52, 0.52].forEach((px) => {
            const holster = new THREE.Mesh(
              new THREE.BoxGeometry(0.24, 0.18, 0.36),
              new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
            );
            holster.position.set(px, 0.58, 0.1);
            defibConsoleGroup.add(holster);

            // Pala metálica
            const paddleGrip = new THREE.Mesh(
              new THREE.CylinderGeometry(0.035, 0.035, 0.2, 8),
              new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 })
            );
            paddleGrip.rotation.z = Math.PI / 2;
            paddleGrip.position.set(px, 0.7, 0.1);
            defibConsoleGroup.add(paddleGrip);

            // Placa metálica de contacto
            const paddlePlate = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.28), chromeMat);
            paddlePlate.position.set(px, 0.62, 0.1);
            defibConsoleGroup.add(paddlePlate);
          });

          // Asa de transporte superior del desfibrilador
          const carryHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 8), chromeMat);
          carryHandle.rotation.z = Math.PI / 2;
          carryHandle.position.set(0, 0.64, -0.05);
          defibConsoleGroup.add(carryHandle);

          cart.add(defibConsoleGroup);

          // 5. Cilindro Lateral de Oxígeno Medicinal con Manorreductor
          const o2Group = new THREE.Group();
          o2Group.position.set(-cartWidth / 2 - 0.22, 1.1, 0);

          // Botella verde de oxígeno hospitalario
          const o2Tank = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.18, 1.6, 16),
            new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.35, metalness: 0.4 })
          );
          o2Tank.castShadow = !isSoftwareGl;
          o2Group.add(o2Tank);

          // Ojiva/Hombro superior blanco de gas medicinal
          const o2Shoulder = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 14, 14, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
          );
          o2Shoulder.position.set(0, 0.8, 0);
          o2Group.add(o2Shoulder);

          // Cabezal manorreductor de latón/cromo con doble manómetro
          const regulator = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8), chromeMat);
          regulator.position.set(0, 1.05, 0);
          o2Group.add(regulator);

          const gauge1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 10), chromeMat);
          gauge1.rotation.x = Math.PI / 2;
          gauge1.position.set(0.06, 1.12, 0.05);
          o2Group.add(gauge1);

          const gauge2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 10), chromeMat);
          gauge2.rotation.x = Math.PI / 2;
          gauge2.position.set(-0.06, 1.12, 0.05);
          o2Group.add(gauge2);

          // Tubo flujómetro transparente
          const flowmeter = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.16, 6),
            new THREE.MeshStandardMaterial({ color: 0x22c55e, transparent: true, opacity: 0.7 })
          );
          flowmeter.position.set(0, 1.12, -0.06);
          o2Group.add(flowmeter);

          // Abrazaderas metálicas de sujeción al carro
          const bracketTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.38), chromeMat);
          bracketTop.position.set(0.12, 0.5, 0);
          o2Group.add(bracketTop);

          const bracketBottom = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.38), chromeMat);
          bracketBottom.position.set(0.12, -0.5, 0);
          o2Group.add(bracketBottom);

          cart.add(o2Group);

          object3D = cart;
        } else if (actor.type === 'danger_zone') {
          // AEEDangerZone: Suelo de Advertencia Biológica, Sistema Niagara (NS_ToxicGas) y NavBlockerBox
          const zoneGroup = new THREE.Group();
          const currentStatus = actor.zoneStatus || 'Contaminated';
          const isContaminated = currentStatus === 'Contaminated';
          const isDisinfecting = currentStatus === 'Disinfecting';

          // 1. ZoneMesh: Suelo de Advertencia (verde tóxico bioluminiscente / espuma desinfectante azul / limpio)
          const floorWidth = 5.6;
          const floorDepth = 3.6;
          const floorHeight = 0.08;

          let floorColor = 0x14532d; // Base verde oscuro tóxico
          let floorEmissive = 0x22c55e; // Verde bioluminiscente
          let floorEmissiveIntensity = 2.2;

          if (isDisinfecting) {
            floorColor = 0x0369a1;
            floorEmissive = 0x38bdf8;
            floorEmissiveIntensity = 1.5;
          } else if (!isContaminated) {
            floorColor = 0x1e293b;
            floorEmissive = 0x10b981;
            floorEmissiveIntensity = 0.15;
          }

          const floorMat = new THREE.MeshStandardMaterial({
            color: floorColor,
            emissive: floorEmissive,
            emissiveIntensity: floorEmissiveIntensity,
            roughness: 0.2,
            metalness: 0.4,
          });

          const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(floorWidth, floorHeight, floorDepth), floorMat);
          floorMesh.position.y = floorHeight / 2;
          floorMesh.receiveShadow = !isSoftwareGl;
          zoneGroup.add(floorMesh);

          // Franjas perimetrales de advertencia de peligro (Hazard Chevron Stripes)
          const stripeMat = new THREE.MeshStandardMaterial({
            color: isContaminated ? 0xf59e0b : 0x475569,
            emissive: isContaminated ? 0xd97706 : 0x000000,
            emissiveIntensity: isContaminated ? 1.2 : 0.0,
            roughness: 0.3,
          });

          const leftStripe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, floorDepth), stripeMat);
          leftStripe.position.set(-floorWidth / 2 + 0.1, 0.06, 0);
          zoneGroup.add(leftStripe);

          const rightStripe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, floorDepth), stripeMat);
          rightStripe.position.set(floorWidth / 2 - 0.1, 0.06, 0);
          zoneGroup.add(rightStripe);

          const frontStripe = new THREE.Mesh(new THREE.BoxGeometry(floorWidth, 0.12, 0.2), stripeMat);
          frontStripe.position.set(0, 0.06, floorDepth / 2 - 0.1);
          zoneGroup.add(frontStripe);

          const backStripe = new THREE.Mesh(new THREE.BoxGeometry(floorWidth, 0.12, 0.2), stripeMat);
          backStripe.position.set(0, 0.06, -floorDepth / 2 + 0.1);
          zoneGroup.add(backStripe);

          // Postes / Balizas de biopeligro en las esquinas
          const postMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            metalness: 0.8,
            roughness: 0.2,
          });
          const capMat = new THREE.MeshStandardMaterial({
            color: isContaminated ? 0xef4444 : 0x10b981,
            emissive: isContaminated ? 0xef4444 : 0x10b981,
            emissiveIntensity: 1.8,
          });

          const postOffsets = [
            [-floorWidth / 2 + 0.25, floorDepth / 2 - 0.25],
            [floorWidth / 2 - 0.25, floorDepth / 2 - 0.25],
            [-floorWidth / 2 + 0.25, -floorDepth / 2 + 0.25],
            [floorWidth / 2 - 0.25, -floorDepth / 2 + 0.25],
          ];

          postOffsets.forEach(([px, pz]) => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.85, 10), postMat);
            post.position.set(px, 0.42, pz);
            zoneGroup.add(post);

            const cap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), capMat);
            cap.position.set(px, 0.9, pz);
            zoneGroup.add(cap);
          });

          // 2. NavBlockerBox: Barrera física holográfica de bloqueo de peones en modo contaminado
          const barrierMat = new THREE.MeshStandardMaterial({
            color: 0xef4444,
            emissive: 0xd97706,
            emissiveIntensity: 1.4,
            transparent: true,
            opacity: isContaminated ? 0.35 : 0.0,
            wireframe: true,
          });
          const barrierMesh = new THREE.Mesh(new THREE.BoxGeometry(floorWidth, 2.2, 0.15), barrierMat);
          barrierMesh.position.set(0, 1.1, floorDepth / 2 - 0.1);
          barrierMesh.visible = isContaminated;
          zoneGroup.add(barrierMesh);

          // Baliza de iluminación superior (Beacon)
          const beaconLight = new THREE.PointLight(
            isContaminated ? 0x22c55e : isDisinfecting ? 0x38bdf8 : 0x10b981,
            isContaminated ? 3.5 : 0.4,
            9
          );
          beaconLight.position.set(0, 2.6, 0);
          zoneGroup.add(beaconLight);

          // 3. Sistema de partículas Niagara (NS_ToxicGas)
          const gasParticles: THREE.Mesh[] = [];
          const gasGroup = new THREE.Group();
          gasGroup.visible = isContaminated;

          if (isContaminated) {
            const gasMat = new THREE.MeshStandardMaterial({
              color: 0x4ade80,
              emissive: 0x22c55e,
              emissiveIntensity: 2.4,
              transparent: true,
              opacity: 0.4,
              roughness: 0.1,
              depthWrite: false,
            });

            for (let i = 0; i < 22; i++) {
              const radius = 0.32 + Math.random() * 0.32;
              const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 8, 8), gasMat);
              sphere.position.set(
                (Math.random() - 0.5) * (floorWidth - 0.6),
                0.3 + Math.random() * 2.0,
                (Math.random() - 0.5) * (floorDepth - 0.6)
              );
              (sphere as any).userData = {
                baseY: sphere.position.y,
                speedY: 0.35 + Math.random() * 0.55,
                phase: Math.random() * Math.PI * 2,
              };
              gasGroup.add(sphere);
              gasParticles.push(sphere);
            }
          }
          zoneGroup.add(gasGroup);

          dangerZoneVisuals.push({
            group: zoneGroup,
            particles: gasParticles,
            floorMat,
            barrier: barrierMesh,
            beaconLight,
            actorId: actor.id,
            isContaminated,
          });

          object3D = zoneGroup;
        } else if (actor.type === 'nurse_assistant') {
          // --- BP_Nurse_Assistant_Elena (Enfermera Estilizada de Urgencias y Triaje) ---
          const nurseGroup = new THREE.Group();
          const scrubBurgundyMat = new THREE.MeshStandardMaterial({ color: 0x9d174d, roughness: 0.35 }); // Burgundy / Deep Rose scrubs
          const nurseSkinMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.55 });
          const clogsMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
          const hairMat = new THREE.MeshStandardMaterial({ color: 0x3f2010, roughness: 0.5 });
          const clipboardWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 });
          const paperMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
          const metalMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.2 });

          // 1. Pelvis y Piernas
          const nursePelvis = new THREE.Group();
          nursePelvis.name = 'nurse_pelvis';
          nurseGroup.add(nursePelvis);

          const nurseLegGeo = new THREE.BoxGeometry(0.18, 0.82, 0.2);
          const nLeftLeg = new THREE.Mesh(nurseLegGeo, scrubBurgundyMat);
          nLeftLeg.position.set(-0.18, 0.41, 0);
          nLeftLeg.castShadow = !isSoftwareGl;
          const nRightLeg = new THREE.Mesh(nurseLegGeo, scrubBurgundyMat);
          nRightLeg.position.set(0.18, 0.41, 0);
          nRightLeg.castShadow = !isSoftwareGl;

          // Zuecos médicos blancos
          const clogL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.26), clogsMat);
          clogL.position.set(-0.18, 0.06, 0.03);
          const clogR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.26), clogsMat);
          clogR.position.set(0.18, 0.06, 0.03);
          nursePelvis.add(nLeftLeg, nRightLeg, clogL, clogR);

          // 2. Columna y Torso
          const nurseSpine = new THREE.Group();
          nurseSpine.position.set(0, 0.82, 0);
          nursePelvis.add(nurseSpine);

          // Casaca de enfermería entallada
          const nTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.05, 14), scrubBurgundyMat);
          nTorso.position.set(0, 0.48, 0);
          nTorso.castShadow = !isSoftwareGl;
          nurseSpine.add(nTorso);

          // Cuello en V blanco
          const vNeck = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.1), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
          vNeck.position.set(0, 0.88, 0.22);
          nurseSpine.add(vNeck);

          // Reloj de solapa médico invertido
          const nurseWatch = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12), metalMat);
          nurseWatch.rotation.x = Math.PI / 2;
          nurseWatch.position.set(0.16, 0.72, 0.32);
          nurseSpine.add(nurseWatch);

          // Estetoscopio de enfermería
          const nSteth = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 8, 20, Math.PI * 1.2), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
          nSteth.rotation.x = Math.PI / 2.2;
          nSteth.position.set(0, 0.88, 0.06);
          nurseSpine.add(nSteth);

          // 3. Brazo Izquierdo sujetando Tabla Clínica de Triaje
          const armGeo = new THREE.BoxGeometry(0.14, 0.65, 0.15);
          const nLeftArmPivot = new THREE.Group();
          nLeftArmPivot.position.set(-0.42, 0.76, 0);
          nurseSpine.add(nLeftArmPivot);

          const nLeftArm = new THREE.Mesh(armGeo, scrubBurgundyMat);
          nLeftArm.position.set(0, -0.28, 0);
          nLeftArmPivot.add(nLeftArm);

          // Tabla de notas clínicas
          const clipboard = new THREE.Group();
          clipboard.position.set(0.22, -0.45, 0.32);
          clipboard.rotation.set(-0.4, 0.3, 0);

          const board = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.52, 0.02), clipboardWoodMat);
          const paper = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.46, 0.022), paperMat);
          const clip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.04), metalMat);
          clip.position.set(0, 0.22, 0.02);
          clipboard.add(board, paper, clip);
          nLeftArmPivot.add(clipboard);

          // 4. Brazo Derecho con bolígrafo para notas clínicas
          const nRightArmPivot = new THREE.Group();
          nRightArmPivot.position.set(0.42, 0.76, 0);
          nurseSpine.add(nRightArmPivot);

          const nRightArm = new THREE.Mesh(armGeo, scrubBurgundyMat);
          nRightArm.position.set(0, -0.28, 0);
          nRightArmPivot.add(nRightArm);

          const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 6), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
          pen.rotation.x = Math.PI / 3;
          pen.position.set(0, -0.58, 0.12);
          nRightArmPivot.add(pen);

          // 5. Cuello y Cabeza Estilizada
          const nurseHead = new THREE.Group();
          nurseHead.position.set(0, 1.15, 0);
          nurseSpine.add(nurseHead);

          const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.29, 16, 16), nurseSkinMat);
          headMesh.position.set(0, 0.05, 0);
          nurseHead.add(headMesh);

          // Moño de cabello
          const bunMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), hairMat);
          bunMesh.position.set(0, 0.18, -0.24);
          nurseHead.add(bunMesh);

          // Mascarilla quirúrgica
          const nMask = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.2), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
          nMask.position.set(0, -0.04, 0.22);
          nurseHead.add(nMask);

          // Ojos expresivos
          const nEyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
          const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), nEyeMat);
          eyeL.position.set(-0.09, 0.1, 0.26);
          const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), nEyeMat);
          eyeR.position.set(0.09, 0.1, 0.26);
          nurseHead.add(eyeL, eyeR);

          object3D = nurseGroup;
          animatedNurses.push({
            group: nurseGroup,
            spine: nurseSpine,
            head: nurseHead,
            rightArm: nRightArmPivot,
          });
        } else if (actor.type === 'triage_kiosk') {
          // --- BP_Triage_Admission_Kiosk (1. Admisión & Triaje: 6 Pacientes en espera, EMR/HIS, Termómetros, Oxímetros) ---
          const triageGroup = new THREE.Group();

          const deskBodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 });
          const counterTopMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
          const acrylicMat = new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transmission: 0.85, opacity: 0.6, transparent: true, roughness: 0.1 });
          const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.15 });

          // 1. Mostrador Curvo de Admisión & Triaje
          const deskCounter = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.1, 1.1), deskBodyMat);
          deskCounter.position.set(0, 0.55, 0);
          deskCounter.castShadow = !isSoftwareGl;
          triageGroup.add(deskCounter);

          const counterTop = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.08, 1.25), counterTopMat);
          counterTop.position.set(0, 1.14, 0);
          triageGroup.add(counterTop);

          // Zócalo LED Azul en la base del mostrador
          const ledTrim = new THREE.Mesh(
            new THREE.BoxGeometry(3.62, 0.04, 1.12),
            new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.2 })
          );
          ledTrim.position.set(0, 0.04, 0);
          triageGroup.add(ledTrim);

          // Mampara de protección acrílica con ventanilla de atención
          const sneezeGuard = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.9, 0.04), acrylicMat);
          sneezeGuard.position.set(0, 1.65, 0.4);
          triageGroup.add(sneezeGuard);

          // 2. Terminal Kiosco Digital EMR / HIS Manchester
          const terminalStand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.45, 12), chromeMat);
          terminalStand.position.set(0.6, 1.35, 0);
          triageGroup.add(terminalStand);

          const terminalScreenMat = new THREE.MeshStandardMaterial({
            map: getTriageScreenTexture(),
            emissiveMap: getTriageScreenTexture(),
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 1.2,
            roughness: 0.2,
          });
          const terminalScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.75), terminalScreenMat);
          terminalScreen.rotation.x = -0.35;
          terminalScreen.position.set(0.6, 1.62, 0.08);
          triageGroup.add(terminalScreen);

          // 3. Equipamiento Crítico: Termómetro Infrarrojo & Oxímetro de Pulso en Dock
          const oximeterDock = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.12, 0.25),
            new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
          );
          oximeterDock.position.set(-0.8, 1.22, 0.1);
          triageGroup.add(oximeterDock);

          const thermometer = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.035, 0.22, 8),
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
          );
          thermometer.rotation.z = Math.PI / 4;
          thermometer.position.set(-1.2, 1.22, 0.1);
          triageGroup.add(thermometer);

          // 4. Seis Asientos de Espera (Capacidad: 6 Pacientes en espera)
          const chairPositions = [
            [-2.6, 0.4],
            [-2.6, -0.6],
            [-2.6, -1.6],
            [2.6, 0.4],
            [2.6, -0.6],
            [2.6, -1.6],
          ];

          const chairSeatMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
          const chairFrameMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });

          chairPositions.forEach(([cx, cz], idx) => {
            const chairGroup = new THREE.Group();
            chairGroup.position.set(cx, 0, cz);
            chairGroup.rotation.y = cx < 0 ? Math.PI / 2 : -Math.PI / 2;

            // Patas cromadas
            const legs = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.42, 0.55), chairFrameMat);
            legs.position.y = 0.21;
            chairGroup.add(legs);

            // Asiento
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), chairSeatMat);
            seat.position.y = 0.44;
            chairGroup.add(seat);

            // Respaldo
            const back = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.08), chairSeatMat);
            back.position.set(0, 0.72, -0.26);
            chairGroup.add(back);

            // Indicador de Turno/Espera (P1 a P6)
            const badgeMat = new THREE.MeshStandardMaterial({
              color: 0x38bdf8,
              emissive: 0x0284c7,
              emissiveIntensity: 1.5,
            });
            const badge = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), badgeMat);
            badge.position.set(0, 1.05, -0.26);
            chairGroup.add(badge);

            triageGroup.add(chairGroup);
          });

          object3D = triageGroup;
        } else if (actor.type === 'hazmat_station') {
          // --- BP_Hazmat_Decon_Station (5. Zona Hazmat & Ducha Química de Descontaminación) ---
          const hazmatGroup = new THREE.Group();

          const hazardYellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.35, metalness: 0.4 });
          const hazardDarkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.6 });
          const stainlessMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });

          // 1. Estructura de Arco de Seguridad Descontaminante
          const colL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.8, 12), hazardYellowMat);
          colL.position.set(-1.1, 1.9, 0);
          hazmatGroup.add(colL);

          const colR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.8, 12), hazardYellowMat);
          colR.position.set(1.1, 1.9, 0);
          hazmatGroup.add(colR);

          const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.3, 12), hazardYellowMat);
          topBar.rotation.z = Math.PI / 2;
          topBar.position.set(0, 3.75, 0);
          hazmatGroup.add(topBar);

          // Rayas de advertencia negras diagonales en los postes
          [-1.1, 1.1].forEach((px) => {
            for (let s = 0.5; s < 3.5; s += 0.5) {
              const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.084, 0.084, 0.15, 12), hazardDarkMat);
              stripe.position.set(px, s, 0);
              hazmatGroup.add(stripe);
            }
          });

          // 2. Anillo Superior de Rociadores Químicos de Alta Presión
          const showerRing = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.035, 10, 20), stainlessMat);
          showerRing.rotation.x = Math.PI / 2;
          showerRing.position.set(0, 3.4, 0);
          hazmatGroup.add(showerRing);

          // Palanca de tiro manual de emergencia (Pull Chain)
          const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.4, 6), stainlessMat);
          chain.position.set(0.35, 2.7, 0);
          hazmatGroup.add(chain);

          const pullHandle = new THREE.Mesh(
            new THREE.TorusGeometry(0.09, 0.025, 8, 14),
            new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 })
          );
          pullHandle.position.set(0.35, 1.95, 0);
          hazmatGroup.add(pullHandle);

          // 3. Rejilla de Desagüe Perforada de Acero Inoxidable en Suelo
          const drainGrating = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.05, 2.2),
            new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.4 })
          );
          drainGrating.position.set(0, 0.025, 0);
          hazmatGroup.add(drainGrating);

          // 4. Contenedor de Residuos Biológicos Estanco (Biohazard Barrel)
          const barrelMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.2 });
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.0, 16), barrelMat);
          barrel.position.set(-1.6, 0.5, 0);
          hazmatGroup.add(barrel);

          const barrelLid = new THREE.Mesh(
            new THREE.CylinderGeometry(0.41, 0.41, 0.08, 16),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
          );
          barrelLid.position.set(-1.6, 1.02, 0);
          hazmatGroup.add(barrelLid);

          // 5. Lavaojos Doble de Emergencia
          const eyeWashBasin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.24, 0.18, 0.18, 14),
            stainlessMat
          );
          eyeWashBasin.position.set(1.4, 1.15, 0);
          hazmatGroup.add(eyeWashBasin);

          const eyeWashStand = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 1.05, 8),
            stainlessMat
          );
          eyeWashStand.position.set(1.4, 0.55, 0);
          hazmatGroup.add(eyeWashStand);

          object3D = hazmatGroup;
        } else if (actor.type === 'point_light') {
          const intensity = actor.lightProperties?.intensity ?? 0.6;
          const pl = new THREE.PointLight(actor.lightProperties?.color || '#38bdf8', intensity, actor.lightProperties?.distance || 18);
          object3D = pl;
        } else if (actor.type === 'spot_light') {
          const intensity = actor.lightProperties?.intensity ?? 0.8;
          const sp = new THREE.SpotLight(actor.lightProperties?.color || '#fef08a', intensity, actor.lightProperties?.distance || 22);
          object3D = sp;
        } else {
          object3D = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 1.8, 1.8),
            new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
          );
        }

        object3D.position.set(...actor.position);
        object3D.rotation.set(
          THREE.MathUtils.degToRad(actor.rotation[0]),
          THREE.MathUtils.degToRad(actor.rotation[1]),
          THREE.MathUtils.degToRad(actor.rotation[2])
        );
        object3D.scale.set(...actor.scale);
        object3D.visible = actor.visible;
        (object3D as any).actorId = actor.id;

        scene.add(object3D);
        meshMap.set(actor.id, object3D);
      });
    }

    rebuildSceneRef.current = rebuildScene;
    rebuildScene();


    // Screen Flash Reaction Trigger
    triggerScreenFlashRef.current = (type: 'cardiac' | 'defib' | 'cure') => {
      setScreenFlash(type);
      setTimeout(() => {
        setScreenFlash('none');
      }, type === 'cardiac' ? 650 : 380);
    };

    // Player & Controls State
    const keys: Record<string, boolean> = {};
    let isRightMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let camYaw = 0;
    let camPitch = -0.55;

    let doctorPos = new THREE.Vector3(0, 0, 6);
    let doctorRotY = 0;
    let footstepTimer = 0;
    let ecgBeepTimer = 0;
    let promptCheckTimer = 0;
    let prevHadCardiacArrest = false;

    const executeInteraction = () => {
      const isClient = stateRef.current.activeInstance === 'client';
      const currentPos = isClient ? clientDoctorPos : doctorPos;
      const currentHeld = isClient ? stateRef.current.clientHeldItem : stateRef.current.heldItem;

      const setHeldItemForCurrent = (item: MedicalTreatmentItem) => {
        if (isClient) {
          setAndSyncClientHeldItem(item);
        } else {
          setAndSyncHeldItem(item);
        }
      };

      let nearestDist = 999;
      let nearestActor: SceneActor | null = null;

      stateRef.current.actors.forEach((act) => {
        const dist = currentPos.distanceTo(new THREE.Vector3(act.position[0], 0, act.position[2]));
        if (dist < nearestDist && dist < 3.8) {
          nearestDist = dist;
          nearestActor = act;
        }
      });

      if (nearestActor) {
        if ((nearestActor as SceneActor).type === 'triage_kiosk') {
          // 1. Sala de Admisión & Triaje: Clasificar y derivar paciente en espera
          playBlueprintCompileChime();
          if (triageQueueCount > 0) {
            setTriageQueueCount((prev) => Math.max(0, prev - 1));
            spawnDynamicPatient();
            addScoreFlyerRef.current(30, '+30 PUNTOS', 'TRIAJE MANCHESTER COMPLETADO');
            setRpcToast({
              message: '🏥 AEEHospitalLayoutManager::TriageAdmission()',
              sub: 'Paciente clasificado por enfermera y asignado a cama libre. (Slot de espera liberado)',
              type: 'use',
            });
          } else {
            setRpcToast({
              message: '🏥 Sala de Admisión & Triaje',
              sub: 'No hay pacientes pendientes en cola de espera (0/6). Todo clasificado.',
              type: 'use',
            });
          }
          if (rpcToastTimeoutRef.current) window.clearTimeout(rpcToastTimeoutRef.current);
          rpcToastTimeoutRef.current = window.setTimeout(() => setRpcToast(null), 3000);
        } else if ((nearestActor as SceneActor).type === 'hazmat_station') {
          // 5. Zona Hazmat: Ducha Química de Descontaminación
          playDisinfectSpray();
          triggerScreenFlashRef.current('cure');
          addScoreFlyerRef.current(25, '+25 PUNTOS', 'DUCHA QUÍMICA HAZMAT ACTIVADA');
          setRpcToast({
            message: '☣️ AEEDecontaminationChamber::ActivateDelugeShower()',
            sub: 'Ducha de alta presión y aspersores químicos activados. Nivel 3 Bioseguridad.',
            type: 'use',
          });
          if (rpcToastTimeoutRef.current) window.clearTimeout(rpcToastTimeoutRef.current);
          rpcToastTimeoutRef.current = window.setTimeout(() => setRpcToast(null), 3000);
        } else if ((nearestActor as SceneActor).type === 'pharmacy_cabinet') {
          // 4. Farmacia Central Pyxis: Conmutar entre Adrenalina, Suero y Antibióticos
          if (currentHeld === 'Epinephrine') {
            setHeldItemForCurrent('IVBag');
            playDisinfectSpray();
          } else if (currentHeld === 'IVBag') {
            setHeldItemForCurrent('Antibiotics');
            playDisinfectSpray();
          } else {
            setHeldItemForCurrent('Epinephrine');
            playSyringeInject();
          }
        } else if ((nearestActor as SceneActor).type === 'defib_station') {
          // Pick up Defibrillator for Cardiac Arrest -> Spawns BP_Defibrillator_Paddles in Hand_R_Socket
          setHeldItemForCurrent('Defibrillator');
          playDefibrillatorShock();
        } else if ((nearestActor as SceneActor).type === 'patient_stretcher') {
          // =========================================================================
          // AEEMedicalCase: RESOLUCIÓN DE CURA EN CAMILLA SEGÚN FMedicalCaseData
          // =========================================================================
          const patientActor = nearestActor as SceneActor;
          const vitals = patientActor.patientVitals ? { ...patientActor.patientVitals } : null;

          if (vitals && vitals.currentState !== 'Deceased') {
            if (vitals.currentState === 'Cured') {
              setRpcToast({
                message: `AEEMedicalCase::Inspect (${patientActor.name})`,
                sub: `Paciente curado y estabilizado (Ritmo Sinusal Normal: 72 bpm)`,
                type: 'use',
              });
              if (rpcToastTimeoutRef.current) window.clearTimeout(rpcToastTimeoutRef.current);
              rpcToastTimeoutRef.current = window.setTimeout(() => setRpcToast(null), 2500);
              return;
            }

            const caseData = patientActor.medicalCaseData;
            // Validar requerimiento según FMedicalCaseData
            const requiredDrug: MedicalTreatmentItem =
              caseData?.requiredDrug ?? (vitals.currentState === 'CardiacArrest' ? 'Defibrillator' : 'Epinephrine');
            const actorPos = new THREE.Vector3(...patientActor.position);

            if (currentHeld === requiredDrug) {
              // =========================================================================
              // ÉXITO DEL SERVIDOR: Server_ResolveMedicalCase() -> Multicast_OnPatientCured
              // =========================================================================
              if (requiredDrug === 'Defibrillator') {
                playDefibrillatorShock();
                triggerDoctorTreatmentAction('defib', actorPos);
                triggerPatientShockAnim(patientActor.id);
                spawnHealingJuice(actorPos, 'defib');
              } else {
                playSyringeInject();
                triggerDoctorTreatmentAction('syringe', actorPos);
                triggerPatientCureAnim(patientActor.id);
                spawnHealingJuice(actorPos, 'syringe');
              }

              triggerCameraShake(0.60);
              triggerScreenFlashRef.current('cure');

              // 1. Resetea los signos vitales del paciente a RITMO SINUSAL NORMAL
              vitals.currentState = 'Cured';
              vitals.heartRate = 72; // Ritmo Sinusal Fisiológico Normal (72 bpm)
              vitals.oxygenSaturation = 99; // SpO2 Normal (99%)
              vitals.patientHealth = 100; // Salud Restaurada al 100%
              vitals.assignedDisease = 'None';

              // 2. Sumar puntos (+100 PUNTOS) y contador de curados
              const pointsEarned = caseData?.pointsOnSuccess ?? 100;
              setGameScore((score) => score + pointsEarned);
              setSavedCount((count) => count + 1);

              // 3. Actualizar estado del actor en la simulación
              onUpdateActor({ ...patientActor, patientVitals: vitals });

              // 4. Liberar manos del doctor activo (Socket detachment)
              setHeldItemForCurrent('None');

              // 5. Disparar en el servidor la función de éxito y replicar evento en red
              setRpcToast({
                message: `Server_ResolveMedicalCase(${patientActor.name}) ➔ Multicast_OnPatientCured`,
                sub: `¡CASO RESUELTO! [${isClient ? 'Dra. Elena (Cliente)' : 'Dr. Ramírez (Host)'}] +${pointsEarned} Puntos • Ritmo Sinusal Normal (72 bpm)`,
                type: 'use',
              });
              if (rpcToastTimeoutRef.current) window.clearTimeout(rpcToastTimeoutRef.current);
              rpcToastTimeoutRef.current = window.setTimeout(() => setRpcToast(null), 3500);
            } else if (currentHeld === 'None') {
              // Jugador sin medicamento en mano: Guiar al jugador
              setRpcToast({
                message: `AEEMedicalCase::OnOverlapBegin (${caseData?.patientName ?? patientActor.name})`,
                sub: `Caso Clínico: Requiere ${requiredDrug}. Recógelo en Farmacia o Desfibrilador`,
                type: 'pickup',
              });
              if (rpcToastTimeoutRef.current) window.clearTimeout(rpcToastTimeoutRef.current);
              rpcToastTimeoutRef.current = window.setTimeout(() => setRpcToast(null), 3000);
            } else {
              // FÁRMACO O HERRAMIENTA INCORRECTA: Rechazo de tratamiento por diagnóstico incompatible
              triggerCameraShake(0.30);
              setRpcToast({
                message: `RPC Server_RejectTreatment: ¡FÁRMACO INCORRECTO!`,
                sub: `${caseData?.patientName ?? patientActor.name} requiere ${requiredDrug}, no ${currentHeld}`,
                type: 'drop',
              });
              if (rpcToastTimeoutRef.current) window.clearTimeout(rpcToastTimeoutRef.current);
              rpcToastTimeoutRef.current = window.setTimeout(() => setRpcToast(null), 3200);
            }
          }
        } else if ((nearestActor as SceneActor).type === 'danger_zone') {
          // AEEDangerZone::Interact_Implementation() (Desinfección de zona contaminada)
          const dangerActor = nearestActor as SceneActor;
          const status = dangerActor.zoneStatus || 'Contaminated';
          if (status === 'Contaminated') {
            playDisinfectSpray();
            onUpdateActor({ ...dangerActor, zoneStatus: 'Disinfecting' });

            // Temporizador de desinfección de 4 segundos (RequiredCleaningTime en AEEDangerZone)
            setTimeout(() => {
              onUpdateActor({ ...dangerActor, zoneStatus: 'Clean' });
              playBlueprintCompileChime();
              setGameScore((score) => score + 50);
              addScoreFlyerRef.current(50, '+50 PUNTOS', 'PASILLO DESINFECTADO Y SEGURO');
              setHazardAlert(null);
              setRpcToast({
                message: `AEEDangerZone::Decontaminate (${dangerActor.name})`,
                sub: `¡Fuga biológica eliminada! Pasillo despejado (+50 pts)`,
                type: 'use',
              });
              if (rpcToastTimeoutRef.current) window.clearTimeout(rpcToastTimeoutRef.current);
              rpcToastTimeoutRef.current = window.setTimeout(() => setRpcToast(null), 3500);
            }, 4000);
          }
        }
      }
    };

    performInteractionRef.current = executeInteraction;

    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;

      if (e.code === 'KeyE') {
        executeInteraction();
      }

      if (e.code === 'Tab') {
        e.preventDefault();
        toggleActiveInstanceRef.current();
      }

      if (e.code === 'KeyR') {
        // Atajo directo para tomar Bolsa de Suero (HeldDrugType::IVBag) en Farmacia
        const isClient = stateRef.current.activeInstance === 'client';
        const currentPos = isClient ? clientDoctorPos : doctorPos;
        let nearestDist = 999;
        let nearestActor: SceneActor | null = null;
        stateRef.current.actors.forEach((act) => {
          const dist = currentPos.distanceTo(new THREE.Vector3(act.position[0], 0, act.position[2]));
          if (dist < nearestDist && dist < 3.8) {
            nearestDist = dist;
            nearestActor = act;
          }
        });
        if (nearestActor && (nearestActor as SceneActor).type === 'pharmacy_cabinet') {
          if (isClient) {
            setAndSyncClientHeldItem('IVBag');
          } else {
            setAndSyncHeldItem('IVBag');
          }
          playDisinfectSpray();
        }
      }

      if (e.code === 'KeyQ' || e.code === 'KeyX') {
        const isClient = stateRef.current.activeInstance === 'client';
        if (isClient) {
          if (stateRef.current.clientHeldItem !== 'None') {
            setAndSyncClientHeldItem('None');
          }
        } else {
          if (stateRef.current.heldItem !== 'None') {
            setAndSyncHeldItem('None');
          }
        }
      }

      if (e.code === 'F1') {
        e.preventDefault();
        setShowDevConsole((prev) => !prev);
      }

      if (e.code === 'Escape' && stateRef.current.viewportMode !== 'editor') {
        setIsGamePaused((prev) => !prev);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        isRightMouseDown = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else if (e.button === 0 && stateRef.current.viewportMode === 'editor') {
        const rect = renderer.domElement.getBoundingClientRect();
        _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        _raycaster.setFromCamera(_mouse, camera);
        const intersectable: THREE.Object3D[] = [];
        meshMap.forEach((obj) => {
          if (obj.visible) intersectable.push(obj);
        });

        const intersects = _raycaster.intersectObjects(intersectable, true);
        if (intersects.length > 0) {
          let topObj: THREE.Object3D | null = intersects[0].object;
          while (topObj && !(topObj as any).actorId && topObj.parent !== scene) {
            topObj = topObj.parent;
          }
          if (topObj && (topObj as any).actorId) {
            onSelectActor((topObj as any).actorId);
            playSelectActorSound();
            return;
          }
        }
        onSelectActor(null);
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 2) isRightMouseDown = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isRightMouseDown && stateRef.current.viewportMode === 'editor') return;

      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      camYaw -= deltaX * 0.0035;
      camPitch -= deltaY * 0.0035;
      camPitch = Math.max(-Math.PI / 2.2, Math.min(-0.1, camPitch));
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    container.addEventListener('contextmenu', onContextMenu);

    const onResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      if (composer) {
        composer.setSize(width, height);
      }
      if (bloomPass) {
        bloomPass.resolution.set(width, height);
      }
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId = 0;
    let simTime = 0;

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.08);
      simTime += delta;

      const {
        viewportMode: currentMode,
        lighting: currentLighting,
        selectedActorId: currentSelected,
      } = stateRef.current;

      // Check patient status in ER: Cardiac Arrest vs Active Monitoring vs All Cured/Deceased
      let hasCardiacArrest = false;
      let hasActivePatient = false;

      stateRef.current.actors.forEach((act) => {
        if (act.type === 'patient_stretcher' && act.patientVitals) {
          const state = act.patientVitals.currentState;
          if (state === 'CardiacArrest') {
            hasCardiacArrest = true;
          }
          if (state !== 'Cured' && state !== 'Deceased') {
            hasActivePatient = true;
          }
        }
      });

      // Actualización procedural del monitor de desfibrilador (Pantalla CRT bifásica y barra de carga 200J)
      animatedDefib.update(simTime, hasCardiacArrest);

      // Animaciones de personajes médicos secundarios (BP_Nurse_Assistant_Elena)
      // Dinámica de respiración procedural, escritura de evolución en tabla de triaje e IK de mirada reactiva
      animatedNurses.forEach((nurse, idx) => {
        // Respiración suave y sutil oscilación del torso
        nurse.spine.rotation.x = Math.sin(simTime * 2.6 + idx) * 0.02;
        nurse.spine.rotation.z = Math.sin(simTime * 1.8 + idx) * 0.01;

        // Escritura de notas de evolución clínica con bolígrafo
        nurse.rightArm.rotation.x = -0.65 + Math.sin(simTime * 6.5) * 0.06;
        nurse.rightArm.rotation.z = 0.15 + Math.cos(simTime * 5.0) * 0.03;

        // Orientación de la mirada: Si hay paro cardíaco en Cama 02, fija su mirada tensa hacia la cama de reanimación;
        // en estado normal alterna entre revisar la tabla de triaje clínica y monitorear la bahía
        if (hasCardiacArrest) {
          nurse.head.rotation.y = THREE.MathUtils.damp(nurse.head.rotation.y, 0.42, 6, delta);
          nurse.head.rotation.x = THREE.MathUtils.damp(nurse.head.rotation.x, -0.05, 6, delta);
        } else {
          const lookPhase = Math.sin(simTime * 0.8 + idx);
          if (lookPhase > 0.2) {
            // Mirando hacia la tabla de notas
            nurse.head.rotation.x = THREE.MathUtils.damp(nurse.head.rotation.x, 0.25, 3, delta);
            nurse.head.rotation.y = THREE.MathUtils.damp(nurse.head.rotation.y, -0.22, 3, delta);
          } else {
            // Mirando al pasillo y camas
            nurse.head.rotation.x = THREE.MathUtils.damp(nurse.head.rotation.x, 0.0, 3, delta);
            nurse.head.rotation.y = THREE.MathUtils.damp(nurse.head.rotation.y, 0.15, 3, delta);
          }
        }
      });

      // 1. Dinámica de Iluminación Hospitalaria:
      // Normal: Iluminación clínica homogénea, limpia, neutral (4500K).
      // Emergencia: "solo cuando hay emergencia sube un poco la luz para avisar" (+35% de luz, troffers y balizas de aviso)
      let hasCriticalPatient = false;
      stateRef.current.actors.forEach((act) => {
        if (act.type === 'patient_stretcher' && act.patientVitals) {
          const v = act.patientVitals;
          if (v.currentState === 'CardiacArrest') {
            hasCardiacArrest = true;
          } else if (v.currentState !== 'Cured' && v.currentState !== 'Deceased' && v.patientHealth < 35) {
            hasCriticalPatient = true;
          }
        }
      });

      const isEmergencyAlarmActive =
        hasCardiacArrest ||
        hasCriticalPatient ||
        stateRef.current.lighting.emergencyAlarmActive ||
        emergencyLightOverrideRef.current;

      // Sincronizar periódicamente el estado visual hacia el HUD
      if (Math.floor(simTime * 4) !== Math.floor((simTime - delta) * 4)) {
        setIsHospitalInEmergencyLight((prev) => (prev !== isEmergencyAlarmActive ? isEmergencyAlarmActive : prev));
      }

      if (isEmergencyAlarmActive) {
        // =====================================================================
        // MODO EMERGENCIA: SUBE LA LUZ PARA AVISAR (+35% LÚMENES + ALARMA CENITAL)
        // =====================================================================
        // La luz general del hospital se eleva dinámicamente para que todo el equipo médico
        // pueda responder inmediatamente y realizar maniobras con máxima visibilidad:
        sunLight.intensity = THREE.MathUtils.damp(sunLight.intensity, 1.55, 3.5, delta);
        skyLight.intensity = THREE.MathUtils.damp(skyLight.intensity, 0.88, 3.5, delta);
        trofferLightEast.intensity = THREE.MathUtils.damp(trofferLightEast.intensity, 1.35, 3.5, delta);
        trofferLightWest.intensity = THREE.MathUtils.damp(trofferLightWest.intensity, 1.25, 3.5, delta);
        corridorFlickerLight.intensity = THREE.MathUtils.damp(corridorFlickerLight.intensity, 1.45, 3.5, delta);
        tubeMat.emissiveIntensity = THREE.MathUtils.damp(tubeMat.emissiveIntensity, 1.75, 4.0, delta);

        // Giro activo de la sirena/baliza roja de aviso visual
        const rotSpeed = simTime * 5.0;
        alarmLight.position.set(Math.cos(rotSpeed) * 3.5, 5.2, Math.sin(rotSpeed) * 2.5);
        alarmLight.intensity = 1.2 + Math.sin(simTime * 8.0) * 0.4;

        // Estrobos de aviso cenital sobre bahías críticas
        const strobeCycle = (simTime * 2.8) % 1.0;
        let redFlash = 0;
        if (strobeCycle < 0.14) {
          redFlash = Math.sin((strobeCycle / 0.14) * Math.PI);
        } else if (strobeCycle > 0.20 && strobeCycle < 0.36) {
          redFlash = Math.sin(((strobeCycle - 0.20) / 0.16) * Math.PI);
        }

        const blueCycle = (simTime * 2.8 + 0.5) % 1.0;
        let blueFlash = 0;
        if (blueCycle < 0.22) {
          blueFlash = Math.sin((blueCycle / 0.22) * Math.PI);
        }

        emergencyCeilingRedLight.intensity = redFlash * 1.8;
        emergencyCeilingBlueLight.intensity = 0.6 + blueFlash * 1.2;
        emergencyStrobeSpot.intensity = (redFlash * 0.8 + 0.3) * 1.4;

        // Actualizar destello en lentes Fresnel 3D de techo
        emergencyBeaconLenses.forEach((b) => {
          if (b.type === 'red') {
            b.mat.emissiveIntensity = 0.4 + redFlash * 2.5;
          } else {
            b.mat.emissiveIntensity = 0.8 + blueFlash * 1.5;
          }
        });

        if (colorGradePass) {
          colorGradePass.uniforms.uEmergencyTension.value = THREE.MathUtils.damp(
            colorGradePass.uniforms.uEmergencyTension.value,
            1.0,
            4,
            delta
          );
          colorGradePass.uniforms.uAlarmStrobeTone.value = redFlash > 0.1 ? -1.0 : blueFlash > 0.1 ? 1.0 : 0.0;
        }
        if (bloomPass) {
          bloomPass.strength = THREE.MathUtils.damp(bloomPass.strength, 0.34, 4, delta);
        }
      } else {
        // =====================================================================
        // MODO CLÍNICO NORMAL: ILUMINACIÓN CORRECTA DE HOSPITAL GENERAL (4500K)
        // =====================================================================
        // Luz uniforme, estéril, nítida y perfectamente balanceada:
        sunLight.intensity = THREE.MathUtils.damp(sunLight.intensity, 1.15, 3.0, delta);
        skyLight.intensity = THREE.MathUtils.damp(skyLight.intensity, 0.58, 3.0, delta);
        trofferLightEast.intensity = THREE.MathUtils.damp(trofferLightEast.intensity, 0.85, 3.0, delta);
        trofferLightWest.intensity = THREE.MathUtils.damp(trofferLightWest.intensity, 0.85, 3.0, delta);
        corridorFlickerLight.intensity = THREE.MathUtils.damp(corridorFlickerLight.intensity, 1.05, 3.0, delta);
        tubeMat.emissiveIntensity = THREE.MathUtils.damp(tubeMat.emissiveIntensity, 1.0, 3.0, delta);

        // Sin emergencias: baliza y estroboscopios apagados
        alarmLight.intensity = THREE.MathUtils.damp(alarmLight.intensity, 0, 5, delta);
        emergencyCeilingRedLight.intensity = THREE.MathUtils.damp(emergencyCeilingRedLight.intensity, 0, 5, delta);
        emergencyCeilingBlueLight.intensity = THREE.MathUtils.damp(emergencyCeilingBlueLight.intensity, 0.25, 4, delta);
        emergencyStrobeSpot.intensity = THREE.MathUtils.damp(emergencyStrobeSpot.intensity, 0, 5, delta);

        emergencyBeaconLenses.forEach((b) => {
          if (b.type === 'red') {
            b.mat.emissiveIntensity = 0.12; // Standby discreto
          } else {
            b.mat.emissiveIntensity = 0.35;
          }
        });

        if (colorGradePass) {
          colorGradePass.uniforms.uEmergencyTension.value = THREE.MathUtils.damp(
            colorGradePass.uniforms.uEmergencyTension.value,
            0.0,
            3,
            delta
          );
          colorGradePass.uniforms.uAlarmStrobeTone.value = 0.0;
        }
        if (bloomPass) {
          bloomPass.strength = THREE.MathUtils.damp(bloomPass.strength, 0.26, 4, delta);
        }
      }

      // ECG audio simulation (MetaSound):
      // Cuando todos los pacientes están Curados o Fallecidos, se emula la llamada a ECG_AudioComponent->Stop(),
      // silenciando por completo el monitor cardíaco y la alarma en la sala.
      if (hasCardiacArrest || hasActivePatient) {
        ecgBeepTimer += delta;
        if (ecgBeepTimer > (hasCardiacArrest ? 0.35 : 1.1)) {
          ecgBeepTimer = 0;
          if (hasCardiacArrest) playEcgFlatline();
          else playEcgBeep();
        }
      } else {
        ecgBeepTimer = 0;
      }

      // Animación de partículas Niagara (NS_ToxicGas) y visuales de AEEDangerZone
      dangerZoneVisuals.forEach((dz) => {
        if (dz.isContaminated) {
          dz.floorMat.emissiveIntensity = 2.0 + Math.sin(simTime * 5.0) * 0.7;
          dz.beaconLight.intensity = 2.8 + Math.sin(simTime * 6.0) * 1.6;

          dz.particles.forEach((p) => {
            const u = (p as any).userData;
            p.position.y += delta * u.speedY;
            if (p.position.y > 2.5) {
              p.position.y = 0.25;
            }
            p.position.x += Math.sin(simTime * 2.2 + u.phase) * delta * 0.45;
            p.position.z += Math.cos(simTime * 1.8 + u.phase) * delta * 0.45;
          });
        }
      });

      // Reacción de Emergencia: Detección de Transición a Código Azul (Paro Cardíaco)
      if (hasCardiacArrest && !prevHadCardiacArrest) {
        // Vibración sutil pero impactante de la cámara (Camera Screen Shake)
        triggerCameraShake(0.65);
        triggerScreenFlashRef.current('cardiac');
        playCodeBlueAlarm();
      }
      prevHadCardiacArrest = hasCardiacArrest;

      // Parpadeo Estroboscópico de Monitores en Paro Cardíaco (Alerta Roja Intensa)
      activePatientMonitors.forEach((m) => {
        if (m.isCardiacArrest) {
          // Destello estroboscópico de alta frecuencia (~14Hz) en rojo intenso
          const alertPulse = Math.sin(simTime * 14.0);
          const flashIntensity = alertPulse > 0.05 ? 4.5 + alertPulse * 3.0 : 0.35;
          m.screenMat.emissive.setHex(0xff0505);
          m.screenMat.emissiveIntensity = flashIntensity;
          m.beaconMat.emissive.setHex(0xff0000);
          m.beaconMat.emissiveIntensity = flashIntensity * 1.6;
        } else {
          m.screenMat.emissive.setHex(0xffffff);
          m.screenMat.emissiveIntensity = 1.8;
          m.beaconMat.emissive.setHex(0x22c55e);
          m.beaconMat.emissiveIntensity = 1.2;
        }
      });

      // =========================================================================
      // SIMULACIÓN DE PARTÍCULAS NIAGARA HEALING JUICE & SHOCKWAVES
      // =========================================================================
      // 1. Partículas 3D de Curación (Confeti flotante, cruces médicas, destellos verdes)
      for (let i = activeJuiceParticles.length - 1; i >= 0; i--) {
        const p = activeJuiceParticles[i];
        p.life -= delta;
        if (p.life <= 0) {
          healingFxGroup.remove(p.mesh);
          activeJuiceParticles.splice(i, 1);
        } else {
          p.mesh.position.addScaledVector(p.velocity, delta);

          if (p.isConfetti) {
            // Dinámica física de confeti: caída flotante con fricción aerodinámica y oscilación en zigzag
            p.velocity.y -= delta * 2.8;
            p.velocity.x *= 0.95;
            p.velocity.z *= 0.95;
            const flutter = Math.sin(simTime * (p.flutterFreq || 10.0));
            p.mesh.position.x += flutter * delta * 0.45;
            p.mesh.rotation.x += p.rotSpeed.x * delta;
            p.mesh.rotation.y += p.rotSpeed.y * delta;
            p.mesh.rotation.z += (p.rotSpeed.z + flutter * 2.5) * delta;
          } else {
            p.velocity.y -= delta * 5.2; // Arco balístico de destellos
            p.velocity.x *= 0.96;
            p.velocity.z *= 0.96;
            p.mesh.rotation.x += p.rotSpeed.x * delta;
            p.mesh.rotation.y += p.rotSpeed.y * delta;
            p.mesh.rotation.z += p.rotSpeed.z * delta;

            if (p.isHelix && p.helixAngle !== undefined && p.helixSpeed !== undefined) {
              p.helixAngle += delta * p.helixSpeed;
              p.mesh.position.x += Math.cos(p.helixAngle) * delta * 0.9;
              p.mesh.position.z += Math.sin(p.helixAngle) * delta * 0.9;
            }
          }

          const lifeRatio = Math.max(0, p.life / p.maxLife);
          const s = p.baseScale * Math.min(1.0, lifeRatio * 1.6);
          p.mesh.scale.set(s, s, s);
        }
      }

      // 2. Ondas de Choque Radiales (Shockwave Rings sobre el lecho de la camilla)
      for (let i = activeShockwaves.length - 1; i >= 0; i--) {
        const sw = activeShockwaves[i];
        sw.life -= delta;
        if (sw.life <= 0) {
          healingFxGroup.remove(sw.mesh);
          if (sw.mesh.geometry) sw.mesh.geometry.dispose();
          activeShockwaves.splice(i, 1);
        } else {
          const progress = 1.0 - sw.life / sw.maxLife;
          const r = 0.2 + progress * (sw.maxRadius - 0.2);
          sw.mesh.scale.set(r, r, r);
          (sw.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.95 * (1.0 - progress));
        }
      }

      // 3. Badges Holográficos 3D Flotantes y Número Animado (+100 PUNTOS)
      for (let i = activeFloatingBadges.length - 1; i >= 0; i--) {
        const fb = activeFloatingBadges[i];
        fb.life -= delta;
        if (fb.life <= 0) {
          healingFxGroup.remove(fb.mesh);
          if (fb.mesh.geometry) fb.mesh.geometry.dispose();
          activeFloatingBadges.splice(i, 1);
        } else {
          fb.mesh.quaternion.copy(camera.quaternion); // Siempre orientado a la cámara (billboard)
          const progress = 1.0 - fb.life / fb.maxLife;

          let scale = 1.0;
          if (fb.isScoreBadge) {
            // Rebote elástico party-game de gran impacto visual (+100 PUNTOS)
            if (progress < 0.16) {
              // Overshoot rápido hacia 1.35
              scale = (progress / 0.16) * 1.35;
            } else if (progress < 0.30) {
              // Resorte de amortiguación
              const t = (progress - 0.16) / 0.14;
              scale = 1.35 - t * 0.35 + Math.sin(t * Math.PI) * 0.08;
            } else {
              scale = 1.0;
            }
            fb.mesh.position.y = fb.startY + progress * 2.8;
            fb.mesh.position.x += Math.sin(simTime * 3.5) * delta * 0.2;
          } else {
            fb.mesh.position.y = fb.startY + progress * 2.2;
            if (progress < 0.15) {
              scale = (progress / 0.15) * 1.15;
            } else if (progress < 0.25) {
              scale = 1.15 - ((progress - 0.15) / 0.1) * 0.15;
            }
          }

          fb.mesh.scale.set(scale, scale, scale);
          (fb.mesh.material as THREE.MeshBasicMaterial).opacity = Math.min(1.0, (fb.life / fb.maxLife) * 2.2);
        }
      }

      // =========================================================================
      // ANIMACIÓN CINEMÁTICA DEL PACIENTE (Convulsión 200J y Suspiro de Alivio)
      // =========================================================================
      animatedPatientChests.forEach((item, idx) => {
        const animState = patientAnimStateMap.get(item.actorId);
        let convulsion = 0;
        let cureHeave = 0;

        if (animState) {
          if (animState.shockTimer > 0) {
            animState.shockTimer = Math.max(0, animState.shockTimer - delta * 1.5);
            const t = animState.shockTimer;
            // Convulsión de reanimación: violento arqueo dorsal inicial seguido de vibración
            convulsion = Math.sin(t * 26.0) * Math.pow(t, 1.8);
          }
          if (animState.cureTimer > 0) {
            animState.cureTimer = Math.max(0, animState.cureTimer - delta * 1.0);
            const ct = animState.cureTimer;
            // Suspiro profundo de alivio clínico al normalizar saturación y ritmo sinusal
            cureHeave = Math.sin(ct * 4.2) * ct * 0.28;
          }
        }

        if (convulsion !== 0) {
          item.torsoGroup.position.y = 1.08 + Math.abs(convulsion) * 0.42;
          item.torsoGroup.rotation.x = 0.28 - convulsion * 0.48;
          item.mesh.scale.y = 1.0 + Math.abs(convulsion) * 0.45;
        } else {
          item.torsoGroup.position.y = 1.08;
          item.torsoGroup.rotation.x = 0.28;
          if (item.isCardiacArrest) {
            item.mesh.scale.y = 1.0;
          } else {
            item.mesh.scale.y = 1.0 + Math.sin(simTime * 3.5 + idx * 1.5) * 0.12 + cureHeave;
          }
        }
      });

      // Temporizador de acción de tratamiento médico
      if (treatmentActionTimer > 0) {
        treatmentActionTimer = Math.max(0, treatmentActionTimer - delta * 1.5);
      }

      // Doctor Controller Execution
      if (currentMode === 'play_doctor') {
        doctorGroup.visible = true;
        clientDoctorGroup.visible = true;

        const isClientActive = stateRef.current.activeInstance === 'client';
        const activeDoctorPos = isClientActive ? clientDoctorPos : doctorPos;
        const currentHeld = isClientActive ? stateRef.current.clientHeldItem : stateRef.current.heldItem;

        const moveSpeed = (keys['ShiftLeft'] || keys['ShiftRight'] ? 9.0 : 5.5) * delta;
        _vec3B.set(0, 0, 0);
        if (keys['KeyW']) _vec3B.z -= 1;
        if (keys['KeyS']) _vec3B.z += 1;
        if (keys['KeyA']) _vec3B.x -= 1;
        if (keys['KeyD']) _vec3B.x += 1;

        // Enhanced Input Virtual Joystick (IA_Move)
        if (virtualStickRef.current.x !== 0 || virtualStickRef.current.y !== 0) {
          _vec3B.x += virtualStickRef.current.x;
          _vec3B.z += virtualStickRef.current.y;
        }

        // Actualizar pulsación y visual de solapamiento en UBoxComponent de camillas (AEEMedicalCase)
        bedCollisionTriggers.forEach((trigger) => {
          const dx = Math.abs(activeDoctorPos.x - trigger.center[0]);
          const dz = Math.abs(activeDoctorPos.z - trigger.center[2]);
          const isOverlapping = dx <= trigger.extent[0] / 2 && dz <= trigger.extent[2] / 2;

          if (isOverlapping) {
            trigger.floorPlaneMat.opacity = 0.28 + Math.sin(simTime * 8) * 0.12;
            trigger.cornerLinesMat.opacity = 1.0;
            trigger.pulseRingMat.opacity = 0.65 + Math.sin(simTime * 8) * 0.25;
          } else {
            trigger.floorPlaneMat.opacity = 0.12;
            trigger.cornerLinesMat.opacity = 0.65;
            trigger.pulseRingMat.opacity = 0.30;
          }
        });

        // Check nearest interactable periodically for Touch HUD prompt
        promptCheckTimer += delta;
        if (promptCheckTimer > 0.15) {
          promptCheckTimer = 0;
          let nearestD = 999;
          let nearestAct: SceneActor | null = null;
          stateRef.current.actors.forEach((act) => {
            const dist = activeDoctorPos.distanceTo(new THREE.Vector3(act.position[0], 0, act.position[2]));
            if (dist < nearestD && dist < 3.8) {
              nearestD = dist;
              nearestAct = act;
            }
          });
          if (nearestAct) {
            if ((nearestAct as SceneActor).type === 'triage_kiosk') {
              setNearbyPrompt(`[E] KIOSCO EMR/HIS: TRIAJE Y ADMISIÓN (${triageQueueCount}/6 EN ESPERA)`);
            } else if ((nearestAct as SceneActor).type === 'hazmat_station') {
              setNearbyPrompt('[E] ACTIVAR DUCHA DE DESCONTAMINACIÓN HAZMAT');
            } else if ((nearestAct as SceneActor).type === 'pharmacy_cabinet') {
              setNearbyPrompt(
                currentHeld === 'Epinephrine'
                  ? 'PYXIS: CAMBIAR A SUERO SALINO [E]'
                  : currentHeld === 'IVBag'
                  ? 'PYXIS: CAMBIAR A ANTIBIÓTICOS [E]'
                  : 'PYXIS: [E] ADRENALINA | [R] SUERO | [F] ANTIBIÓTICOS'
              );
            } else if ((nearestAct as SceneActor).type === 'defib_station') {
              setNearbyPrompt('TOMAR DESFIBRILADOR');
            } else if ((nearestAct as SceneActor).type === 'patient_stretcher') {
              const pActor = nearestAct as SceneActor;
              const vitals = pActor.patientVitals;
              const caseData = pActor.medicalCaseData;
              const isCured = vitals?.currentState === 'Cured';
              const reqDrug =
                caseData?.requiredDrug ?? (vitals?.currentState === 'CardiacArrest' ? 'Defibrillator' : 'Epinephrine');

              if (isCured) {
                setNearbyPrompt('PACIENTE ESTABILIZADO (RITMO SINUSAL 72 BPM)');
              } else if (currentHeld === reqDrug) {
                setNearbyPrompt(`[E] CURAR PACIENTE: APLICAR ${reqDrug.toUpperCase()} (+100 PTS)`);
              } else if (currentHeld === 'None') {
                setNearbyPrompt(`CASO MÉDICO [${caseData?.patientName ?? pActor.name}]: REQUIERE ${reqDrug.toUpperCase()}`);
              } else {
                setNearbyPrompt(`⚠️ FÁRMACO INCORRECTO: REQUIERE ${reqDrug.toUpperCase()}`);
              }
            } else if ((nearestAct as SceneActor).type === 'danger_zone') {
              const status = (nearestAct as SceneActor).zoneStatus || 'Contaminated';
              if (status === 'Contaminated') {
                setNearbyPrompt('DESINFECTAR ZONA PELIGROSA [E] (4s)');
              } else if (status === 'Disinfecting') {
                setNearbyPrompt('DESINFECCIÓN EN PROCESO...');
              } else {
                setNearbyPrompt('PASILLO DESINFECTADO Y SEGURO');
              }
            } else {
              setNearbyPrompt('INTERACTUAR');
            }
          } else {
            setNearbyPrompt(null);
          }
        }

        const isMoving = _vec3B.lengthSq() > 0.001;

        if (isMoving) {
          _vec3B.normalize();
          const targetDoctorPos = activeDoctorPos.clone().addScaledVector(_vec3B, moveSpeed);

          // NavBlockerBox: Bloqueador físico en modo contaminado
          let isMovementBlocked = false;
          stateRef.current.actors.forEach((act) => {
            if (act.type === 'danger_zone' && (act.zoneStatus === 'Contaminated' || !act.zoneStatus)) {
              const minX = act.position[0] - 2.8;
              const maxX = act.position[0] + 2.8;
              const minZ = act.position[2] - 1.8;
              const maxZ = act.position[2] + 1.8;
              if (
                targetDoctorPos.x >= minX &&
                targetDoctorPos.x <= maxX &&
                targetDoctorPos.z >= minZ &&
                targetDoctorPos.z <= maxZ
              ) {
                isMovementBlocked = true;
              }
            }
          });

          if (!isMovementBlocked) {
            activeDoctorPos.copy(targetDoctorPos);
          }

          const targetRot = Math.atan2(-_vec3B.x, -_vec3B.z);
          const swing = Math.sin(simTime * 14) * 0.45;

          if (isClientActive) {
            clientDoctorRotY = THREE.MathUtils.damp(clientDoctorRotY, targetRot, 14, delta);
            clientLeftLeg.rotation.x = swing;
            clientRightLeg.rotation.x = -swing;
            clientLeftArm.rotation.x = -swing * 0.5;

            // Inactive Host doctor idles
            leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 10, delta);
            rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 10, delta);
            leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, 0, 10, delta);
          } else {
            doctorRotY = THREE.MathUtils.damp(doctorRotY, targetRot, 14, delta);
            leftLeg.rotation.x = swing;
            rightLeg.rotation.x = -swing;
            leftArm.rotation.x = -swing * 0.5;

            // Inactive Client doctor idles
            clientLeftLeg.rotation.x = THREE.MathUtils.damp(clientLeftLeg.rotation.x, 0, 10, delta);
            clientRightLeg.rotation.x = THREE.MathUtils.damp(clientRightLeg.rotation.x, 0, 10, delta);
            clientLeftArm.rotation.x = THREE.MathUtils.damp(clientLeftArm.rotation.x, 0, 10, delta);
          }

          footstepTimer += delta;
          if (footstepTimer > 0.35) {
            footstepTimer = 0;
            playFootstepSound();
          }
        } else {
          leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 10, delta);
          rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 10, delta);
          leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, 0, 10, delta);

          clientLeftLeg.rotation.x = THREE.MathUtils.damp(clientLeftLeg.rotation.x, 0, 10, delta);
          clientRightLeg.rotation.x = THREE.MathUtils.damp(clientRightLeg.rotation.x, 0, 10, delta);
          clientLeftArm.rotation.x = THREE.MathUtils.damp(clientLeftArm.rotation.x, 0, 10, delta);
        }

        // Procedural Right Arm Posture for Server Hand_R_Socket
        if (stateRef.current.heldItem !== 'None') {
          rightArmPivot.rotation.x = THREE.MathUtils.damp(rightArmPivot.rotation.x, -0.75, 12, delta);
          rightArmPivot.rotation.z = THREE.MathUtils.damp(rightArmPivot.rotation.z, -0.15, 12, delta);
          rightArmPivot.rotation.y = THREE.MathUtils.damp(rightArmPivot.rotation.y, 0.2, 12, delta);
        } else {
          const armSwing = (!isClientActive && isMoving) ? Math.sin(simTime * 14) * 0.45 * 0.5 : 0;
          rightArmPivot.rotation.x = THREE.MathUtils.damp(rightArmPivot.rotation.x, armSwing, 10, delta);
          rightArmPivot.rotation.z = THREE.MathUtils.damp(rightArmPivot.rotation.z, 0, 10, delta);
          rightArmPivot.rotation.y = THREE.MathUtils.damp(rightArmPivot.rotation.y, 0, 10, delta);
        }

        // Procedural Right Arm Posture for Client Client_Hand_R_Socket
        if (stateRef.current.clientHeldItem !== 'None') {
          clientRightArmPivot.rotation.x = THREE.MathUtils.damp(clientRightArmPivot.rotation.x, -0.75, 12, delta);
          clientRightArmPivot.rotation.z = THREE.MathUtils.damp(clientRightArmPivot.rotation.z, -0.15, 12, delta);
          clientRightArmPivot.rotation.y = THREE.MathUtils.damp(clientRightArmPivot.rotation.y, 0.2, 12, delta);
        } else {
          const clientArmSwing = (isClientActive && isMoving) ? Math.sin(simTime * 14) * 0.45 * 0.5 : 0;
          clientRightArmPivot.rotation.x = THREE.MathUtils.damp(clientRightArmPivot.rotation.x, clientArmSwing, 10, delta);
          clientRightArmPivot.rotation.z = THREE.MathUtils.damp(clientRightArmPivot.rotation.z, 0, 10, delta);
          clientRightArmPivot.rotation.y = THREE.MathUtils.damp(clientRightArmPivot.rotation.y, 0, 10, delta);
        }

        // =========================================================================
        // CONTROL RIG: ARTICULACIÓN DE PELVIS, ESPALDA (SPINE) Y CUELLO/CABEZA (IK)
        // =========================================================================
        // 1. Pelvis Bobbing & Turn Banking
        const targetBob = isMoving ? Math.abs(Math.sin(simTime * 14)) * 0.07 : Math.sin(simTime * 3) * 0.012;
        docPelvis.position.y = THREE.MathUtils.damp(docPelvis.position.y, targetBob, 12, delta);
        clientPelvis.position.y = THREE.MathUtils.damp(
          clientPelvis.position.y,
          isClientActive && isMoving ? targetBob : Math.sin(simTime * 3 + 1) * 0.012,
          12,
          delta
        );

        const targetBank = isMoving ? -_vec3B.x * 0.12 : 0;
        if (isClientActive) {
          clientPelvis.rotation.z = THREE.MathUtils.damp(clientPelvis.rotation.z, targetBank, 8, delta);
          docPelvis.rotation.z = THREE.MathUtils.damp(docPelvis.rotation.z, 0, 8, delta);
        } else {
          docPelvis.rotation.z = THREE.MathUtils.damp(docPelvis.rotation.z, targetBank, 8, delta);
          clientPelvis.rotation.z = THREE.MathUtils.damp(clientPelvis.rotation.z, 0, 8, delta);
        }

        // 2. Spine / Chest Breathing, Lean & Treatment Compression Thrust
        const spineBreathing = Math.sin(simTime * 2.5) * 0.02;
        let targetSpinePitch = spineBreathing + (isMoving ? 0.08 : 0);
        let targetSpineYaw = 0;

        if (treatmentActionTimer > 0) {
          const thrustPhase = Math.sin(treatmentActionTimer * Math.PI);
          targetSpinePitch = 0.38 * thrustPhase;

          const activeRightArm = isClientActive ? clientRightArmPivot : rightArmPivot;
          const activeLeftArm = isClientActive ? clientLeftArmPivot : leftArmPivot;

          if (treatmentActionType === 'defib') {
            // Poses coordinadas de choque con ambas palas hacia el tórax del paciente
            activeRightArm.rotation.x = THREE.MathUtils.damp(activeRightArm.rotation.x, -1.15 + thrustPhase * 0.4, 14, delta);
            activeLeftArm.rotation.x = THREE.MathUtils.damp(activeLeftArm.rotation.x, -1.15 + thrustPhase * 0.4, 14, delta);
            activeRightArm.rotation.z = THREE.MathUtils.damp(activeRightArm.rotation.z, -0.32, 14, delta);
            activeLeftArm.rotation.z = THREE.MathUtils.damp(activeLeftArm.rotation.z, 0.32, 14, delta);
          } else if (treatmentActionType === 'syringe') {
            activeRightArm.rotation.x = THREE.MathUtils.damp(activeRightArm.rotation.x, -0.92 + thrustPhase * 0.25, 14, delta);
            activeRightArm.rotation.y = THREE.MathUtils.damp(activeRightArm.rotation.y, 0.38, 14, delta);
          }
        }

        docSpineChest.rotation.x = THREE.MathUtils.damp(docSpineChest.rotation.x, isClientActive ? spineBreathing : targetSpinePitch, 10, delta);
        docSpineChest.rotation.y = THREE.MathUtils.damp(docSpineChest.rotation.y, targetSpineYaw, 10, delta);
        clientSpineChest.rotation.x = THREE.MathUtils.damp(
          clientSpineChest.rotation.x,
          isClientActive ? targetSpinePitch : Math.sin(simTime * 2.5 + 1.2) * 0.02,
          10,
          delta
        );

        // 3. Procedural Neck & Head Look-At IK (Focalización en Pacientes e Incidentes)
        let lookTarget: THREE.Vector3 | null = null;
        if (treatmentTargetPos && treatmentActionTimer > 0) {
          lookTarget = treatmentTargetPos;
        } else {
          let minD = 5.2;
          stateRef.current.actors.forEach((act) => {
            if (act.type === 'patient_stretcher') {
              const d = activeDoctorPos.distanceTo(new THREE.Vector3(act.position[0], 0, act.position[2]));
              if (d < minD) {
                minD = d;
                lookTarget = new THREE.Vector3(act.position[0], 1.2, act.position[2]);
              }
            }
          });
        }

        if (lookTarget) {
          const dx = (lookTarget as THREE.Vector3).x - activeDoctorPos.x;
          const dz = (lookTarget as THREE.Vector3).z - activeDoctorPos.z;
          const targetWorldAngle = Math.atan2(-dx, -dz);
          const currentHeading = isClientActive ? clientDoctorRotY : doctorRotY;
          let relAngleY = targetWorldAngle - currentHeading;
          while (relAngleY > Math.PI) relAngleY -= Math.PI * 2;
          while (relAngleY < -Math.PI) relAngleY += Math.PI * 2;
          const clampedHeadY = THREE.MathUtils.clamp(relAngleY, -1.15, 1.15);

          if (isClientActive) {
            clientNeckHead.rotation.y = THREE.MathUtils.damp(clientNeckHead.rotation.y, clampedHeadY, 8, delta);
            clientNeckHead.rotation.x = THREE.MathUtils.damp(clientNeckHead.rotation.x, 0.25, 6, delta);
          } else {
            docNeckHead.rotation.y = THREE.MathUtils.damp(docNeckHead.rotation.y, clampedHeadY, 8, delta);
            docNeckHead.rotation.x = THREE.MathUtils.damp(docNeckHead.rotation.x, 0.25, 6, delta);
          }
        } else {
          docNeckHead.rotation.y = THREE.MathUtils.damp(docNeckHead.rotation.y, 0, 6, delta);
          docNeckHead.rotation.x = THREE.MathUtils.damp(docNeckHead.rotation.x, 0, 6, delta);
          clientNeckHead.rotation.y = THREE.MathUtils.damp(clientNeckHead.rotation.y, 0, 6, delta);
          clientNeckHead.rotation.x = THREE.MathUtils.damp(clientNeckHead.rotation.x, 0, 6, delta);
        }

        doctorGroup.position.copy(doctorPos);
        doctorGroup.rotation.y = doctorRotY;
        clientDoctorGroup.position.copy(clientDoctorPos);
        clientDoctorGroup.rotation.y = clientDoctorRotY;

        // Smooth Isometric Follow Camera pointing to active instance
        const targetCamPos = _vec3A.copy(activeDoctorPos).add(new THREE.Vector3(0, 13, 14));
        camera.position.lerp(targetCamPos, 0.12);
        camera.lookAt(_vec3B.copy(activeDoctorPos).add(new THREE.Vector3(0, 1.2, 0)));

        // =========================================================================
        // CAMERA TRAUMA & SCREEN SHAKE APPLICATION (Falloff Cuadrático)
        // =========================================================================
        cameraTrauma = Math.max(0, cameraTrauma - delta * 2.2);
        const shakePower = cameraTrauma * cameraTrauma;
        if (shakePower > 0.0005) {
          const shakeTime = simTime * 52;
          camera.position.x += Math.sin(shakeTime * 1.1) * shakePower * 0.42;
          camera.position.y += Math.cos(shakeTime * 1.35) * shakePower * 0.35;
          camera.position.z += Math.sin(shakeTime * 0.95) * shakePower * 0.32;

          camera.rotation.x += Math.sin(shakeTime * 1.25) * shakePower * 0.035;
          camera.rotation.y += Math.cos(shakeTime * 1.45) * shakePower * 0.035;
          camera.rotation.z += Math.sin(shakeTime * 0.85) * shakePower * 0.045;
        }
      } else {
        // Flycam
        doctorGroup.visible = false;
        clientDoctorGroup.visible = false;
        _euler.set(camPitch, camYaw, 0, 'YXZ');
        camera.quaternion.setFromEuler(_euler);

        if (isRightMouseDown) {
          const flySpeed = (keys['ShiftLeft'] || keys['ShiftRight'] ? 24 : 10) * delta;
          _vec3A.set(0, 0, 0);
          if (keys['KeyW']) _vec3A.z -= 1;
          if (keys['KeyS']) _vec3A.z += 1;
          if (keys['KeyA']) _vec3A.x -= 1;
          if (keys['KeyD']) _vec3A.x += 1;
          if (keys['KeyE']) _vec3A.y += 1;
          if (keys['KeyQ']) _vec3A.y -= 1;

          _vec3A.normalize();
          _vec3A.applyEuler(_euler);
          camera.position.addScaledVector(_vec3A, flySpeed);
        }
      }

      // Gizmo update
      if (currentSelected && meshMap.has(currentSelected)) {
        const selectedObj = meshMap.get(currentSelected)!;
        gizmoGroup.position.copy(selectedObj.position);
        gizmoGroup.visible = currentMode === 'editor';
      } else {
        gizmoGroup.visible = false;
      }

      try {
        if (composer) {
          composer.render();
        } else {
          renderer.render(scene, camera);
        }
      } catch {
        // Fallback seguro ante pérdidas de contexto WebGL
        renderer.render(scene, camera);
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('resize', onResize);

      if (composer) {
        composer.dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [scenePreset]);

  // Sincronizar reconstrucción de escena ante cambios en actores (ej. estado de AEEDangerZone o pacientes)
  useEffect(() => {
    rebuildSceneRef.current();
  }, [actors]);


  // =========================================================================
  // GESTOR DE OLEADAS Y PROGRESIÓN DE DIFICULTAD (AEEGameModeBase)
  // =========================================================================
  const addScoreFlyer = (points: number, text: string, sub: string) => {
    const flyerId = Date.now() + Math.random();
    setScoreFlyers((prev) => [...prev, { id: flyerId, text, sub }]);
    setTimeout(() => {
      setScoreFlyers((prev) => prev.filter((f) => f.id !== flyerId));
    }, 2200);
  };
  addScoreFlyerRef.current = addScoreFlyer;

  const advanceWave = (targetWave?: number) => {
    const nextWaveNum = targetWave !== undefined ? targetWave : currentWaveIndex + 1;
    const config = WAVE_CONFIGURATIONS[Math.min(nextWaveNum - 1, WAVE_CONFIGURATIONS.length - 1)];
    const isInfinite = nextWaveNum > WAVE_CONFIGURATIONS.length;
    const title = isInfinite ? `Colapso Crítico Nivel ${nextWaveNum}` : config.title;
    const diffMult = isInfinite
      ? (config.deteriorationMultiplier + (nextWaveNum - 3) * 0.45).toFixed(1)
      : config.deteriorationMultiplier.toFixed(1);

    setCurrentWaveIndex(nextWaveNum);
    setWaveSecondsLeft(config.duration);
    triggerCameraShakeRef.current(0.5);
    playBiohazardAlarm();

    setWaveNotification({
      wave: nextWaveNum,
      title,
      subtitle: `Dificultad x${diffMult} • Tasa de Deterioro +${Math.round((Number(diffMult) - 1) * 100)}% • Frecuencia de Paro Elevada`,
    });

    setTimeout(() => {
      setWaveNotification(null);
    }, 4500);

    setRpcToast({
      message: `AEEGameModeBase::StartNextWave(Oleada ${nextWaveNum})`,
      sub: `Afluencia acelerada (${config.patientArrivalInterval}s) • Deterioro x${diffMult}`,
      type: 'use',
    });
    if (rpcToastTimeoutRef.current) window.clearTimeout(rpcToastTimeoutRef.current);
    rpcToastTimeoutRef.current = window.setTimeout(() => setRpcToast(null), 3500);
  };

  const spawnRandomCorridorHazard = () => {
    const cleanZones = stateRef.current.actors.filter(
      (a) => a.type === 'danger_zone' && (a.zoneStatus === 'Clean' || !a.zoneStatus)
    );
    if (cleanZones.length === 0) return;

    const targetZone = cleanZones[Math.floor(Math.random() * cleanZones.length)];
    onUpdateActor({ ...targetZone, zoneStatus: 'Contaminated' });

    playBiohazardAlarm();
    triggerCameraShakeRef.current(0.4);

    const locName =
      targetZone.id === 'danger_zone_corridor'
        ? 'Pasillo Central'
        : targetZone.id === 'danger_zone_pharmacy'
        ? 'Pasillo de Farmacia'
        : 'Pasillo de Tránsito y Camillas';

    setHazardAlert({
      id: targetZone.id,
      name: targetZone.name,
      location: locName,
    });

    setTimeout(() => {
      setHazardAlert(null);
    }, 5000);

    setRpcToast({
      message: `AEEGameModeBase::SpawnRandomCorridorHazard ➔ ${targetZone.name}`,
      sub: `¡Fuga Biológica Activa en ${locName}! Bloqueador físico NavBlockerBox activo`,
      type: 'drop',
    });
    if (rpcToastTimeoutRef.current) window.clearTimeout(rpcToastTimeoutRef.current);
    rpcToastTimeoutRef.current = window.setTimeout(() => setRpcToast(null), 3800);
  };

  const spawnDynamicPatient = () => {
    const stretchers = stateRef.current.actors.filter((a) => a.type === 'patient_stretcher');
    const availableBed = stretchers.find(
      (s) => s.patientVitals?.currentState === 'Cured' || s.patientVitals?.currentState === 'Deceased'
    );
    if (!availableBed) {
      setTriageQueueCount((prev) => Math.min(6, prev + 1));
      return;
    }

    const config = WAVE_CONFIGURATIONS[Math.min(currentWaveIndex - 1, WAVE_CONFIGURATIONS.length - 1)];
    const isResusBed = availableBed.department === 'resuscitation_bay';
    const isSevere = isResusBed || Math.random() < 0.45;
    const disease: EDiseaseType = isSevere ? 'Anaphylaxis' : 'BacterialPneumonia';
    const requiredDrug: MedicalTreatmentItem = isSevere ? 'Epinephrine' : 'IVBag';
    const patientNames = ['Sr. Morales', 'Dra. Silva', 'Carlos Vega', 'Valeria Rios', 'Ignacio Soto', 'Lucía Blanco'];
    const pName = patientNames[Math.floor(Math.random() * patientNames.length)];

    const newVitals: PatientVitals = {
      heartRate: isSevere ? 150 : 118,
      oxygenSaturation: isSevere ? 80 : 89,
      patientHealth: isSevere ? 68 : 84,
      currentState: 'Diagnosed',
      assignedDisease: disease,
      deteriorationRate: (isSevere ? 2.8 : 2.0) * config.deteriorationMultiplier,
    };

    const newCaseData: FMedicalCaseData = {
      caseId: `CASE_W${currentWaveIndex}_${Date.now() % 1000}`,
      patientName: pName,
      requiredDrug,
      diseaseName: disease,
      pointsOnSuccess: isSevere ? 120 : 100,
      triggerBoxExtent: [3.8, 2.5, 4.6],
    };

    onUpdateActor({
      ...availableBed,
      patientVitals: newVitals,
      medicalCaseData: newCaseData,
    });

    setTriageQueueCount((prev) => Math.max(0, prev - 1));
    playBlueprintCompileChime();
    setRpcToast({
      message: `🚑 Admisión Triaje ➔ ${isResusBed ? 'Bahía Reanimación (Código Azul)' : 'Cubículo Tratamiento'}`,
      sub: `Ingreso: ${pName} [${disease}]. Requiere ${requiredDrug}`,
      type: 'pickup',
    });
    if (rpcToastTimeoutRef.current) window.clearTimeout(rpcToastTimeoutRef.current);
    rpcToastTimeoutRef.current = window.setTimeout(() => setRpcToast(null), 3500);
  };

  // Match & Wave Progression Simulation (AEEGameModeBase)
  useEffect(() => {
    if (viewportMode !== 'play_doctor' || isRoundEnded || isGamePaused) return;

    let patientArrivalTimer = 18;
    let hazardTimer = 22;

    const interval = setInterval(() => {
      // 1. Turno de Guardia General
      setShiftTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRoundEnded(true);
          setShowResultsModal(true);
          return 0;
        }
        return prev - 1;
      });

      // 2. Temporizador de Oleada y Escalado de Dificultad
      setWaveSecondsLeft((prev) => {
        if (prev <= 1) {
          advanceWave();
          return 50;
        }
        return prev - 1;
      });

      // 3. Ciclo de Reabastecimiento Dinámico Pyxis (Farmacia Central - Cada 20s)
      setPyxisRestockTimer((prev) => {
        if (prev <= 1) {
          setPyxisRestockFlash(true);
          setTimeout(() => setPyxisRestockFlash(false), 1200);
          playBlueprintCompileChime();
          setRpcToast({
            message: '💊 Farmacia Central Pyxis: Reabastecimiento Dinámico (Ciclo 20s)',
            sub: 'Gabinete Pyxis 4000 reabastecido al 100%: Epinefrina, Suero Salino, Antibióticos',
            type: 'pickup',
          });
          return 20;
        }
        return prev - 1;
      });

      // Configuración de la oleada actual
      const waveConfig =
        WAVE_CONFIGURATIONS[Math.min(currentWaveIndex - 1, WAVE_CONFIGURATIONS.length - 1)];
      const diffMultiplier =
        currentWaveIndex <= WAVE_CONFIGURATIONS.length
          ? waveConfig.deteriorationMultiplier
          : waveConfig.deteriorationMultiplier + (currentWaveIndex - 3) * 0.45;
      const arrestThreshold =
        currentWaveIndex <= WAVE_CONFIGURATIONS.length
          ? waveConfig.cardiacArrestHealthThreshold
          : Math.min(45, waveConfig.cardiacArrestHealthThreshold + (currentWaveIndex - 3) * 4);

      // 4. Tasa de Deterioro de Pacientes (AEEGameModeBase::ApplyWaveDeteriorationTick)
      stateRef.current.actors.forEach((act) => {
        if (act.type === 'patient_stretcher' && act.patientVitals) {
          const v = act.patientVitals;
          if (v.currentState === 'Diagnosed' || v.currentState === 'WaitingForTriage') {
            const baseRate = v.deteriorationRate || 2.0;
            const effectiveLoss = baseRate * diffMultiplier * 0.65;
            const newHealth = Math.max(0, v.patientHealth - effectiveLoss);

            // Caída de SpO2 y taquicardia reactiva proporcional al deterioro
            const newSpo2 = Math.max(45, Math.round(98 - (100 - newHealth) * 0.48));
            const newHr = Math.round(80 + (100 - newHealth) * 1.3);

            if (newHealth <= arrestThreshold) {
              // Colapso inminente a Paro Cardíaco (Código Azul)
              const updatedVitals: PatientVitals = {
                ...v,
                patientHealth: newHealth,
                currentState: 'CardiacArrest',
                heartRate: 215,
                oxygenSaturation: 50,
              };
              const updatedCase: FMedicalCaseData = {
                caseId: act.medicalCaseData?.caseId || 'CASE_COLLAPSE',
                patientName: act.medicalCaseData?.patientName || act.name,
                requiredDrug: 'Defibrillator',
                diseaseName: v.assignedDisease,
                pointsOnSuccess: 120,
                triggerBoxExtent: [3.8, 2.5, 4.6],
              };
              onUpdateActor({ ...act, patientVitals: updatedVitals, medicalCaseData: updatedCase });
              setRpcToast({
                message: `🚨 AEEGameModeBase: ¡CÓDIGO AZUL INMINENTE!`,
                sub: `${act.medicalCaseData?.patientName || act.name} colapsó a Paro Cardíaco (Tiempo Límite Agotado). ¡Desfibrilador 200J!`,
                type: 'drop',
              });
            } else {
              const updatedVitals: PatientVitals = {
                ...v,
                patientHealth: newHealth,
                heartRate: newHr,
                oxygenSaturation: newSpo2,
              };
              onUpdateActor({ ...act, patientVitals: updatedVitals });
            }
          }
        }
      });

      // 5. Temporizador de Llegada de Pacientes (Triage Throughput)
      patientArrivalTimer -= 1;
      if (patientArrivalTimer <= 0) {
        patientArrivalTimer = Math.max(7, Math.round(waveConfig.patientArrivalInterval / (diffMultiplier * 0.75)));
        setTriageQueueCount((prev) => Math.min(6, prev + 1));
        spawnDynamicPatient();
      }

      // 6. Generación Dinámica de Fugas Biológicas en Pasillos (AEEDangerZone)
      hazardTimer -= 1;
      if (hazardTimer <= 0) {
        hazardTimer = Math.max(10, Math.round(waveConfig.hazardSpawnInterval));
        if (Math.random() < waveConfig.hazardSpawnChance) {
          spawnRandomCorridorHazard();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [viewportMode, isRoundEnded, isGamePaused, currentWaveIndex]);

  // Lobby countdown timer when WBP_RoundResults is open
  useEffect(() => {
    if (!showResultsModal) return;

    const timer = setInterval(() => {
      setLobbyCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResultsModal]);

  // Cálculo autoritativo de estrellas (CalculateFinalStars() de AEEGameStateBase)
  const calculateStars = () => {
    if (savedCount >= 3 && deceasedCount === 0) return 3;
    if (savedCount >= 2 && deceasedCount <= 1) return 2;
    if (savedCount >= 1) return 1;
    return 0;
  };

  const currentStars = calculateStars();
  const currentTotalScore = Math.max(0, savedCount * 100 - deceasedCount * 50);

  const getVerdictText = (stars: number) => {
    switch (stars) {
      case 3:
        return '¡GUARDIA MÉDICA IMPECABLE! (3 ESTRELLAS)';
      case 2:
        return 'BUEN DESEMPEÑO CLÍNICO (2 ESTRELLAS)';
      case 1:
        return 'GUARDIA CRÍTICA - PACIENTES AL LÍMITE (1 ESTRELLA)';
      default:
        return 'COLAPSO HOSPITALARIO (0 ESTRELLAS)';
    }
  };

  const handleSimulateEndRound = () => {
    setIsRoundEnded(true);
    setShowResultsModal(true);
    setLobbyCountdown(12);
  };

  const handleRestartShift = () => {
    setShiftTime(180);
    setSavedCount(0);
    setDeceasedCount(0);
    setCurrentWaveIndex(1);
    setWaveSecondsLeft(50);
    setWaveNotification(null);
    setHazardAlert(null);
    setIsRoundEnded(false);
    setShowResultsModal(false);
    setLobbyCountdown(12);
  };

  // Selected patient vitals helper
  const selectedActor = actors.find((a) => a.id === selectedActorId);
  const patientVitals = selectedActor?.patientVitals;
  const dangerActor = actors.find((a) => a.type === 'danger_zone');
  const isDangerContaminated = dangerActor?.zoneStatus === 'Contaminated';
  const hasCardiacArrest = actors.some(
    (a) => a.type === 'patient_stretcher' && a.patientVitals?.currentState === 'CardiacArrest'
  );
  const activePatients = actors.filter(
    (a) =>
      a.type === 'patient_stretcher' &&
      a.patientVitals?.currentState !== 'Cured' &&
      a.patientVitals?.currentState !== 'Deceased'
  ).length;

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#0a0d14]">
      <div ref={mountRef} className="w-full h-full cursor-crosshair brightness-[0.99] contrast-[1.06] saturate-[1.10]" />

      {/* ========================================================================= */}
      {/* POST-PROCESADO ARTÍSTICO & COLOR GRADING CINEMATOGRÁFICO                  */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden">
        {/* 1. Viñeta Cinematográfica Profunda (Grading de Tensión Hospitalaria) */}
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(4,7,14,0.48)_72%,rgba(2,3,8,0.92)_100%)]" />

        {/* 2. Micro-Líneas de Escaneo CRT de Monitor Médico (Efecto Diegético Inmersivo) */}
        <div
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 0, 0, 0.12) 4px)',
          }}
          className="absolute inset-0 opacity-40 mix-blend-multiply"
        />

        {/* 3. Pulso de Tensión de Alarma Código Azul (Borde Carmesí Perimetral y Resplandor Transparente) */}
        {hasCardiacArrest && (
          <div className="w-full h-full absolute inset-0 shadow-[inset_0_0_70px_rgba(239,68,68,0.30)] animate-pulse pointer-events-none" />
        )}

        {/* 4. Halo Perimetral de Peligro Biológico (Zona Contaminada Activa) */}
        {isDangerContaminated && (
          <div className="w-full h-full absolute inset-0 shadow-[inset_0_0_60px_rgba(245,158,11,0.20)] pointer-events-none" />
        )}

        {/* 5. Destellos de Impacto y Reacción Diegética (Camera Flash FX Transparentes) */}
        {screenFlash === 'defib' && (
          <div className="w-full h-full absolute inset-0 bg-cyan-400/20 transition-opacity duration-300 pointer-events-none" />
        )}
        {screenFlash === 'cure' && (
          <div className="w-full h-full absolute inset-0 bg-emerald-400/20 transition-opacity duration-350 pointer-events-none" />
        )}
        {screenFlash === 'cardiac' && (
          <div className="w-full h-full absolute inset-0 bg-rose-600/20 transition-opacity duration-500 pointer-events-none" />
        )}
      </div>

      {/* ========================================================================= */}
      {/* AAA IMMERSIVE HOSPITAL HUD HEADER (WBP_Emergency_HUD)                     */}
      {/* ========================================================================= */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
        {/* Left: Hospital Unit Branding & Real-time Bed Quick-Telemetry */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-[#080b14]/90 border border-slate-700/60 backdrop-blur-xl shadow-2xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-emerald-500/40 flex items-center justify-center shadow-inner">
              <HeartPulse className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider text-white font-sans uppercase">
                  CENTRO DE TRAUMA & URGENCIAS
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SALA ER-1
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>GUARDIA ACTIVA • MONITOR CLÍNICO</span>
              </div>
            </div>
          </div>

          {/* Quick Bed Status Telemetry Strip (Cama 01 & Cama 02) */}
          <div className="hidden xl:flex items-center gap-2">
            {actors
              .filter((a) => a.type === 'patient_stretcher')
              .map((bed, idx) => {
                const vitals = bed.patientVitals;
                const isArrest = vitals?.currentState === 'CardiacArrest';
                const isCured = vitals?.currentState === 'Cured';
                return (
                  <div
                    key={bed.id}
                    className={`px-3 py-1.5 rounded-xl border backdrop-blur-md text-[11px] font-mono flex items-center gap-2 shadow-lg transition-all ${
                      isArrest
                        ? 'bg-rose-950/85 border-rose-500/80 text-rose-200 animate-pulse ring-2 ring-rose-500/30'
                        : isCured
                        ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                        : 'bg-[#0b0e18]/85 border-slate-700/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {isArrest ? (
                        <Zap className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                      ) : isCured ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Activity className="w-3.5 h-3.5 text-sky-400" />
                      )}
                      <span>CAMA 0{idx + 1}:</span>
                    </div>
                    <span className="font-extrabold uppercase text-[10px]">
                      {isArrest ? 'PARO CARDÍACO' : isCured ? 'ESTABLE' : vitals?.assignedDisease || 'TRIAGE'}
                    </span>
                    <span className="text-[9px] opacity-80">
                      {isArrest ? '200J REQ' : `${vitals?.oxygenSaturation || 90}% SpO2`}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Center: Dynamic Emergency Alarm Banner, Wave Progress, and Multiplayer Session */}
        <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
          {hasCardiacArrest ? (
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-950/95 border border-rose-500/80 text-rose-200 text-xs font-mono font-black shadow-2xl shadow-rose-900/50 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
              <span>ALERTA CÓDIGO AZUL: PARO CARDÍACO • ¡LUCES DE AVISO ELEVADAS (+35%)!</span>
            </div>
          ) : isHospitalInEmergencyLight ? (
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/95 border border-amber-500/80 text-amber-200 text-xs font-mono font-black shadow-2xl shadow-amber-900/50 animate-pulse">
              <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>AVISO DE EMERGENCIA: ILUMINACIÓN CLÍNICA ELEVADA (+35% LÚMENES)</span>
            </div>
          ) : isDangerContaminated ? (
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/95 border border-amber-500/80 text-amber-200 text-xs font-mono font-black shadow-2xl shadow-amber-900/40">
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>PELIGRO BIOLÓGICO: PASILLO CONTAMINADO BLOQUEADO [DESINFECCIÓN REQUERIDA]</span>
            </div>
          ) : null}

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Wave Progression Badge */}
            {(() => {
              const activeConfig =
                WAVE_CONFIGURATIONS[Math.min(currentWaveIndex - 1, WAVE_CONFIGURATIONS.length - 1)];
              return (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#090e1c]/95 border border-cyan-500/50 backdrop-blur-xl shadow-2xl text-xs font-mono">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>🌊 OLEADA {currentWaveIndex}</span>
                  </div>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-300 text-[11px] font-semibold hidden md:inline">
                    {activeConfig.title}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    x{activeConfig.deteriorationMultiplier.toFixed(1)} DIFICULTAD
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span className="hidden sm:inline">Sig:</span>
                    <span className="font-bold text-sky-300 font-mono">{waveSecondsLeft}s</span>
                  </div>
                </div>
              );
            })()}

            {/* UMultiplayerSessionSubsystem: Local Dual Instance Tester */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#080c16]/95 border border-sky-500/40 backdrop-blur-xl shadow-2xl text-xs font-mono">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-300 pr-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-sky-300 hidden sm:inline">LAN 127.0.0.1:7777</span>
                <span className="text-emerald-400 font-mono font-bold">({networkPing}ms)</span>
              </div>
              <span className="text-slate-700">|</span>

              {/* Host Button (Dr. Ramírez) */}
              <button
                onClick={() => {
                  if (activeInstance !== 'server') toggleActiveInstance();
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeInstance === 'server'
                    ? 'bg-sky-500 text-slate-950 shadow-md ring-2 ring-sky-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title="Instancia 1: Servidor de Escucha (Listen Server) - Autoridad Absoluta"
              >
                <span>🖥️ HOST</span>
                <span className="hidden md:inline">(Dr. Ramírez)</span>
                {activeInstance === 'server' && (
                  <span className="text-[8px] bg-slate-900/40 px-1 py-0.2 rounded font-black text-white">ACTIVO</span>
                )}
              </button>

              {/* Client Button (Dra. Elena) */}
              <button
                onClick={() => {
                  if (activeInstance !== 'client') toggleActiveInstance();
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeInstance === 'client'
                    ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title="Instancia 2: Cliente Conectado (SimulatedProxy) - Predicción de Red"
              >
                <span>💻 CLIENTE</span>
                <span className="hidden md:inline">(Dra. Elena)</span>
                {activeInstance === 'client' && (
                  <span className="text-[8px] bg-slate-900/40 px-1 py-0.2 rounded font-black text-white">ACTIVO</span>
                )}
              </button>

              <button
                onClick={toggleActiveInstance}
                className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold transition-all border border-slate-700 cursor-pointer hidden lg:inline"
                title="Pulsar tecla Tab para alternar entre instancias locales"
              >
                [TAB]
              </button>
            </div>
          </div>
        </div>

        {/* Right: Hospital Shift Timer, Triage Stats, Pause & Editor Action */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3.5 py-1.5 rounded-2xl bg-[#080b14]/90 border border-slate-700/60 backdrop-blur-xl text-xs font-mono flex items-center gap-3 shadow-2xl">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-400 text-[11px]">TURNO:</span>
              <span className={`font-bold text-sm ${shiftTime < 30 ? 'text-rose-400 animate-pulse' : 'text-sky-300'}`}>
                {Math.floor(shiftTime / 60)}:{(shiftTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">CURADOS:</span>
              <span className="text-emerald-400 font-bold text-sm">+{savedCount}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
              <span className="text-slate-400 text-[11px]">PUNTOS:</span>
              <span className="text-yellow-300 font-black text-sm tracking-wider">{gameScore}</span>
            </div>
          </div>

          {/* Botón & Indicador de Iluminación Hospitalaria (Correcta vs Emergencia) */}
          <button
            onClick={toggleEmergencyLighting}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-lg active:scale-95 ${
              isHospitalInEmergencyLight
                ? 'bg-rose-950/90 border-rose-500 text-rose-200 ring-2 ring-rose-500/50 animate-pulse'
                : 'bg-[#0f1422]/90 border-sky-500/40 text-sky-200 hover:bg-[#161f36]'
            }`}
            title="Control del Sistema de Iluminación: Iluminación clínica estándar (4500K) vs Modo Emergencia (+35% de luz para avisar)"
          >
            {isHospitalInEmergencyLight ? (
              <>
                <Flame className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                <span className="hidden sm:inline">LUZ:</span>
                <span className="text-rose-300 font-black">EMERGENCIA (+35%)</span>
              </>
            ) : (
              <>
                <Lightbulb className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">LUZ:</span>
                <span className="text-sky-300">CLÍNICA NORMAL</span>
              </>
            )}
          </button>

          {/* Botón de Matriz de Departamentos & Flujo */}
          <button
            onClick={() => setShowDepartmentMatrixModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600/80 to-indigo-600/80 hover:from-sky-500 hover:to-indigo-500 text-white font-mono text-[11px] font-bold border border-sky-400/50 shadow-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            title="Abrir Matriz de Departamentos, Capacidad y Flujo de Pacientes"
          >
            <Building2 className="w-3.5 h-3.5 text-sky-200" />
            <span className="hidden sm:inline">MATRIZ</span>
            <span>DEPTOS</span>
            <span className="px-1 py-0.2 rounded bg-sky-950/80 text-[9px] text-sky-300 font-mono">
              {triageQueueCount}/6
            </span>
          </button>

          {/* Telemetría Rápida Pyxis (20s) */}
          <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-mono transition-all ${
            pyxisRestockFlash
              ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400 animate-bounce'
              : 'bg-[#0d101c]/90 border-amber-500/40 text-amber-200'
          }`}>
            <Pill className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>PYXIS:</span>
            <span className="font-bold text-amber-300">{pyxisRestockTimer}s</span>
          </div>

          {/* Pause / Menu Trigger Button */}
          {viewportMode !== 'editor' && (
            <button
              onClick={() => setIsGamePaused(true)}
              className="px-3 py-2 bg-[#0d101c]/90 hover:bg-[#181d30] text-slate-200 hover:text-white rounded-xl text-xs font-mono font-bold tracking-wider cursor-pointer shadow-xl transition-all border border-slate-700/60 hover:border-sky-500/50 flex items-center gap-1.5"
              title="Pausar guardia médica"
            >
              <Pause className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">PAUSA [ESC]</span>
            </button>
          )}

          {/* Direct Editor / Dev Tool Switch */}
          {viewportMode !== 'editor' && onOpenEditorMode && (
            <button
              onClick={onOpenEditorMode}
              className="px-2.5 py-2 bg-[#0d101c]/90 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 rounded-xl text-xs font-mono font-semibold cursor-pointer shadow-xl transition-all border border-slate-800 hover:border-emerald-500/40 flex items-center gap-1"
              title="Abrir Editor de Niveles y C++ Core"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline text-[11px]">DEV</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ANIMATED WAVE TRANSITION ANNOUNCEMENT OVERLAY (AEEGameModeBase)             */}
      {/* ========================================================================= */}
      {waveNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in zoom-in-90 slide-in-from-top duration-300">
          <div className="flex flex-col items-center px-8 py-3.5 rounded-3xl bg-gradient-to-r from-[#0d162d]/95 via-[#132244]/95 to-[#0d162d]/95 border-2 border-sky-400 shadow-[0_0_50px_rgba(56,189,248,0.45)] backdrop-blur-2xl ring-4 ring-sky-500/20 text-center">
            <div className="flex items-center gap-2 text-sky-400 font-black text-xs font-mono uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
              <span>AEEGameModeBase • GESTOR DE OLEADAS</span>
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
            </div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-cyan-300 to-sky-400 font-sans tracking-wide mt-0.5">
              OLEADA {waveNotification.wave}: {waveNotification.title}
            </h2>
            <p className="text-xs text-sky-200/90 font-mono mt-1 font-semibold">
              {waveNotification.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BIOHAZARD CORRIDOR CONTAMINATION BANNER (AEEDangerZone)                     */}
      {/* ========================================================================= */}
      {hazardAlert && (
        <div className="fixed top-36 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-[#1c0808]/95 border-2 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.5)] backdrop-blur-xl ring-4 ring-rose-500/20 text-rose-200 font-mono text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
            <div>
              <span className="font-black text-sm block tracking-wide uppercase text-rose-100">
                ☣️ ALERTA BIOLÓGICA: FUGA TÓXICA EN {hazardAlert.location.toUpperCase()}
              </span>
              <span className="text-[11px] text-rose-300">
                Pasillo bloqueado por NavBlockerBox • Deja los suministros y desinfecta con [E] (4s)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING ANIMATED SCORE BANNERS (+100 PUNTOS)                              */}
      {/* ========================================================================= */}
      {scoreFlyers.length > 0 && (
        <div className="pointer-events-none fixed top-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
          {scoreFlyers.map((flyer) => (
            <div
              key={flyer.id}
              className="flex flex-col items-center animate-bounce duration-500"
            >
              <div className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-[#06121e]/95 border-2 border-yellow-400 text-yellow-300 font-black font-sans text-2xl shadow-[0_0_40px_rgba(250,204,21,0.65)] backdrop-blur-xl ring-4 ring-yellow-400/20">
                <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
                <span className="tracking-wider">{flyer.text}</span>
                <span className="text-xl">⭐</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-300 mt-1 bg-black/75 px-3 py-0.5 rounded-full border border-emerald-500/40 shadow">
                {flyer.sub}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONTEXTUAL ACTION PROMPT (High-contrast AAA In-World Pill)               */}
      {/* ========================================================================= */}
      {nearbyPrompt && viewportMode === 'play_doctor' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#0c0f1a]/95 border-2 border-emerald-400/80 backdrop-blur-md shadow-2xl text-white font-mono text-xs font-bold ring-4 ring-emerald-500/20">
            <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-xs shadow">
              E
            </span>
            <span className="tracking-wide text-slate-100 uppercase">{nearbyPrompt}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NETWORK RPC REPLICATION TOAST (Hand_R_Socket Item Mesh Replication)        */}
      {/* ========================================================================= */}
      {rpcToast && viewportMode === 'play_doctor' && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-1.5 rounded-full bg-[#0a0d18]/95 border border-sky-400/70 backdrop-blur-md shadow-2xl flex items-center gap-2.5 text-xs font-mono ring-2 ring-sky-500/25">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span className="font-bold text-sky-300">{rpcToast.message}</span>
            <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">{rpcToast.sub}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIEGETIC MEDICAL ITEM INVENTORY HUD (Bottom Center)                       */}
      {/* ========================================================================= */}
      {viewportMode === 'play_doctor' && (() => {
        const isClient = activeInstance === 'client';
        const activeHeld = isClient ? clientHeldItem : heldItem;
        const socketName = isClient ? 'Client_Hand_R_Socket' : 'Hand_R_Socket';
        const charName = isClient ? 'Dra. Elena (Cliente)' : 'Dr. Ramírez (Listen Server)';

        return (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-col items-center gap-1.5">
            {/* Instance Badge */}
            <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#0a0e1c]/90 border border-slate-700/80 text-[10px] font-mono shadow-md backdrop-blur-md">
              <span className={`w-2 h-2 rounded-full ${isClient ? 'bg-emerald-400' : 'bg-sky-400'} animate-pulse`} />
              <span className="text-slate-400 font-bold uppercase tracking-wider">INSTANCIA ACTIVA:</span>
              <span className={`font-black ${isClient ? 'text-emerald-300' : 'text-sky-300'}`}>{charName}</span>
              <button
                onClick={toggleActiveInstance}
                className="ml-1 text-[9px] text-slate-400 hover:text-white underline cursor-pointer"
                title="Alternar foco entre Server y Client"
              >
                [TAB Cambiar]
              </button>
            </div>

            <div className="px-5 py-2.5 rounded-2xl bg-[#080b14]/95 border border-slate-700/70 backdrop-blur-2xl shadow-2xl flex items-center gap-4 ring-1 ring-white/10">
              {activeHeld === 'Epinephrine' ? (
                <>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shadow-inner">
                    <Syringe className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-wide">JERINGA DE EPINEFRINA (1mg)</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        EQUIPADA ({socketName})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-3">
                      <span>Inyectar con <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300 font-bold border border-slate-700">[E]</kbd></span>
                      <span className="text-slate-600">|</span>
                      <span>Guardar con <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-bold border border-slate-700">[Q]</kbd></span>
                    </div>
                  </div>
                </>
              ) : activeHeld === 'Defibrillator' ? (
                <>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shadow-inner animate-pulse">
                    <Zap className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-wide">DESFIBRILADOR BIFÁSICO (200J)</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        CARGADO & LISTO ({socketName})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-3">
                      <span>Descarga con <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-rose-300 font-bold border border-slate-700">[E]</kbd></span>
                      <span className="text-slate-600">|</span>
                      <span>Guardar con <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-bold border border-slate-700">[Q]</kbd></span>
                    </div>
                  </div>
                </>
              ) : activeHeld === 'IVBag' ? (
                <>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center shadow-inner">
                    <Droplets className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-wide">BOLSA DE SUERO SALINO (0.9% NaCl)</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        EQUIPADA ({socketName})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-3">
                      <span>Infundir con <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-300 font-bold border border-slate-700">[E]</kbd></span>
                      <span className="text-slate-600">|</span>
                      <span>Guardar con <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-bold border border-slate-700">[Q]</kbd></span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center">
                    <Hand className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-300 tracking-wide">MANOS LIBRES</span>
                      <span className="text-[9px] text-slate-500 font-mono">EQUIPO DISPONIBLE ({socketName})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Toma <strong>Adrenalina [E] / Suero [R]</strong> en Farmacia o <strong>Desfibrilador [E]</strong> en Carro de Paro
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* COLLAPSIBLE DEVELOPER CONSOLE DRAWER [F1] (Hidden by default for AAA UI)   */}
      {/* ========================================================================= */}
      <div className="absolute bottom-3 left-3 z-30">
        <button
          onClick={() => setShowDevConsole((prev) => !prev)}
          className="px-2 py-1 rounded-lg bg-[#0e121d]/80 hover:bg-[#1a2133] border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-lg"
          title="Abrir o cerrar herramientas de desarrollo y testing"
        >
          <Terminal className="w-3 h-3 text-sky-400" />
          <span>{showDevConsole ? 'Cerrar Depuración [F1]' : 'Herramientas Dev [F1]'}</span>
        </button>

        {showDevConsole && (
          <div className="mt-2 w-80 p-3 rounded-xl bg-[#0c0f1a]/95 border border-slate-700/80 backdrop-blur-xl shadow-2xl text-xs font-mono space-y-2.5 animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-sky-400 flex items-center gap-1.5 text-[11px]">
                <Terminal className="w-3.5 h-3.5" />
                <span>CONSOLA DE DEPURACIÓN UE5</span>
              </span>
              <button
                onClick={() => setShowDevConsole(false)}
                className="text-slate-500 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hand Item Spawner Simulation */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block font-bold">
                SPAWN ITEM ({activeInstance === 'client' ? 'Client_Hand_R_Socket' : 'Hand_R_Socket'}):
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (activeInstance === 'client') setAndSyncClientHeldItem('Epinephrine');
                    else setAndSyncHeldItem('Epinephrine');
                    playSyringeInject();
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer flex-1 ${
                    (activeInstance === 'client' ? clientHeldItem : heldItem) === 'Epinephrine'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Jeringa
                </button>
                <button
                  onClick={() => {
                    if (activeInstance === 'client') setAndSyncClientHeldItem('IVBag');
                    else setAndSyncHeldItem('IVBag');
                    playDisinfectSpray();
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer flex-1 ${
                    (activeInstance === 'client' ? clientHeldItem : heldItem) === 'IVBag'
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Suero
                </button>
                <button
                  onClick={() => {
                    if (activeInstance === 'client') setAndSyncClientHeldItem('Defibrillator');
                    else setAndSyncHeldItem('Defibrillator');
                    playDefibrillatorShock();
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer flex-1 ${
                    (activeInstance === 'client' ? clientHeldItem : heldItem) === 'Defibrillator'
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Desfib
                </button>
                <button
                  onClick={() => {
                    if (activeInstance === 'client') setAndSyncClientHeldItem('None');
                    else setAndSyncHeldItem('None');
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                    (activeInstance === 'client' ? clientHeldItem : heldItem) === 'None'
                      ? 'bg-slate-700 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Soltar
                </button>
              </div>
            </div>

            {/* Danger Zone State Simulation */}
            {dangerActor && (
              <div className="space-y-1 pt-1 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">ESTADO ZONA PELIGRO:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onUpdateActor({ ...dangerActor, zoneStatus: 'Contaminated' });
                      playBiohazardAlarm();
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer flex-1 ${
                      dangerActor.zoneStatus === 'Contaminated' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Contaminada
                  </button>
                  <button
                    onClick={() => {
                      onUpdateActor({ ...dangerActor, zoneStatus: 'Clean' });
                      playBlueprintCompileChime();
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer flex-1 ${
                      dangerActor.zoneStatus === 'Clean' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Limpia
                  </button>
                </div>
              </div>
            )}

            {/* Wave Progression & Hazard Testing Tools */}
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <span className="text-[10px] text-cyan-400 block font-bold">GAME MODE: OLEADAS & CAOS:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => advanceWave()}
                  className="px-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 rounded text-[10px] font-mono cursor-pointer transition-all"
                >
                  🌊 Siguiente Oleada
                </button>
                <button
                  onClick={() => spawnDynamicPatient()}
                  className="px-2 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-200 rounded text-[10px] font-mono cursor-pointer transition-all"
                >
                  🚑 Nuevo Paciente
                </button>
              </div>
              <button
                onClick={() => spawnRandomCorridorHazard()}
                className="w-full mt-1 px-2 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 rounded text-[10px] font-mono cursor-pointer transition-all"
              >
                ☣️ Forzar Fuga Biológica en Pasillo
              </button>
            </div>

            {/* Quick End Round Simulation */}
            <div className="pt-1 border-t border-slate-800">
              <button
                onClick={handleSimulateEndRound}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-mono font-bold text-xs rounded-lg shadow-lg cursor-pointer transition-all"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Simular Fin de Guardia (WBP_RoundResults)</span>
              </button>
            </div>
          </div>
        )}
      </div>


      {/* ========================================================================= */}
      {/* VISUAL HEARTBEAT MONITOR (Dynamic Red Pulse Frequency scaled by heartRate) */}
      {/* Sincronizado en tiempo real con las camillas de pacientes de HOSPITAL_ACTORS */}
      {/* ========================================================================= */}
      <VisualHeartbeatMonitor
        actors={actors}
        selectedActorId={selectedActorId}
        onSelectActor={(id) => onSelectActor(id)}
        className="absolute top-20 right-4 z-20"
      />

      {/* ========================================================================= */}
      {/* WBP_PauseMenu (In-Game AAA Pause Modal Overlay)                           */}
      {/* ========================================================================= */}
      {isGamePaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#141829] to-[#0a0d16] border border-sky-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center select-none ring-1 ring-white/10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/40 text-[10px] font-mono font-bold text-sky-300">
                <Pause className="w-3.5 h-3.5 text-sky-400" />
                <span>GUARDIA EN PAUSA • SALA ER-1</span>
              </div>
              <h2 className="text-2xl font-black text-white font-sans uppercase tracking-wide">
                Menú de Guardia Médica
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Tiempo: <strong className="text-sky-300">{Math.floor(shiftTime / 60)}:{(shiftTime % 60).toString().padStart(2, '0')}</strong> • Curados: <strong className="text-emerald-400">+{savedCount}</strong>
              </p>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <button
                onClick={() => setIsGamePaused(false)}
                className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-slate-950 font-black tracking-wider transition-all shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>REANUDAR GUARDIA [ESC]</span>
              </button>

              <button
                onClick={() => setShowInGameGuide(true)}
                className="w-full px-5 py-2.5 rounded-xl bg-[#101422] hover:bg-[#181e33] border border-slate-700 hover:border-sky-500/50 text-slate-200 font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>MANUAL DE TRIAJE & PROTOCOLOS</span>
              </button>

              {onOpenEditorMode && (
                <button
                  onClick={() => {
                    setIsGamePaused(false);
                    onOpenEditorMode();
                  }}
                  className="w-full px-5 py-2.5 rounded-xl bg-[#101422] hover:bg-[#181e33] border border-slate-800 hover:border-emerald-500/40 text-slate-300 font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>MODO EDITOR UE5 & C++ ARCHITECTURE</span>
                </button>
              )}

              <button
                onClick={() => {
                  handleRestartShift();
                  setIsGamePaused(false);
                }}
                className="w-full px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>REINICIAR GUARDIA MÉDICA</span>
              </button>

              <button
                onClick={() => {
                  setIsGamePaused(false);
                  if (onOpenMainMenu) onOpenMainMenu();
                  else onExitGameMode();
                }}
                className="w-full px-5 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Menu className="w-4 h-4" />
                <span>VOLVER AL MENÚ PRINCIPAL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Game Protocol Guide Modal */}
      {showInGameGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#131726] to-[#0c0e17] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 text-left select-none">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="font-bold text-white text-sm font-sans flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Protocolos de Guardia Rápida</span>
              </span>
              <button
                onClick={() => setShowInGameGuide(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#0e121d] border border-amber-500/30">
                <span className="text-amber-300 font-bold block mb-1 flex items-center gap-1.5">
                  <Syringe className="w-3.5 h-3.5 text-amber-400" />
                  <span>Anafilaxia (Cama 01)</span>
                </span>
                <p className="text-slate-300 text-[11px]">
                  Toma la <strong>Jeringa de Adrenalina</strong> en la Farmacia [E] y aplícala sobre la camilla [E].
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0e121d] border border-rose-500/30">
                <span className="text-rose-300 font-bold block mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-rose-400" />
                  <span>Código Azul / Paro Cardíaco (Cama 02)</span>
                </span>
                <p className="text-slate-300 text-[11px]">
                  Toma el <strong>Desfibrilador 200J</strong> en el Carro de Paro [E] y descarga en el tórax [E].
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0e121d] border border-emerald-500/30">
                <span className="text-emerald-300 font-bold block mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pasillo Contaminado</span>
                </span>
                <p className="text-slate-300 text-[11px]">
                  Aproxímate al gas tóxico y pulsa [E] para rociar espuma descontaminante durante 4s.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInGameGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition-all cursor-pointer"
            >
              CERRAR GUÍA
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MATRIZ DE DEPARTAMENTOS, CAPACIDAD Y FLUJO DE PACIENTES (CORE LAYOUT)     */}
      {/* Modal interactivo con datos en vivo de los 5 departamentos                 */}
      {/* ========================================================================= */}
      {showDepartmentMatrixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-gradient-to-b from-[#131728] via-[#0d101c] to-[#070912] border-2 border-sky-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-sky-500/10 space-y-5 select-none ring-1 ring-white/10 text-left">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-700/80 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/40 text-[10px] font-mono font-bold text-sky-300">
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>AEEHospitalLayoutManager • CORE RADIAL ARCHITECTURE</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide font-sans">
                  Matriz de Departamentos, Capacidad y Flujo de Pacientes
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Distribución radial en corredor central para minimizar traslados de suministros y evitar cuellos de botella.
                </p>
              </div>

              <button
                onClick={() => setShowDepartmentMatrixModal(false)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              <div className="p-3 rounded-2xl bg-[#090d18] border border-sky-500/30 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-black">
                  1
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Espera Triaje</span>
                  <span className="text-sm font-bold text-sky-300">{triageQueueCount} / 6 Pacientes</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#090d18] border border-rose-500/30 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black">
                  2
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Reanimación</span>
                  <span className="text-sm font-bold text-rose-300">
                    {actors.filter((a) => a.department === 'resuscitation_bay' && a.type === 'patient_stretcher' && a.patientVitals?.currentState !== 'Cured').length} / 2 Críticas
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#090d18] border border-emerald-500/30 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                  3
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Tratamiento</span>
                  <span className="text-sm font-bold text-emerald-300">
                    {actors.filter((a) => a.department === 'treatment_cubicles' && a.patientVitals?.currentState !== 'Cured').length} / 4 Camillas
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#090d18] border border-amber-500/30 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                  4
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Pyxis 4000</span>
                  <span className="text-sm font-bold text-amber-300">Recarga: {pyxisRestockTimer}s</span>
                </div>
              </div>
            </div>

            {/* Department Table with FDepartmentInfrastructureData */}
            <div className="overflow-x-auto rounded-2xl border border-slate-700/80 bg-[#0a0d16]">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-[#121626] border-b border-slate-700/80 text-[10px] tracking-wider text-slate-400 uppercase">
                    <th className="py-3 px-3.5">Departamento / C++ Row</th>
                    <th className="py-3 px-3">Capacidad & Camillas</th>
                    <th className="py-3 px-3">Personal & Riesgo Infección</th>
                    <th className="py-3 px-3">Maquinaria (FEquipmentRequirement) & Watts</th>
                    <th className="py-3 px-3">Throughput & Carga Eléctrica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {Object.values(HOSPITAL_DEPARTMENTS_CONFIG).map((dept) => {
                    const badgeColor =
                      dept.id === 'triage_admission'
                        ? 'border-sky-500/50 text-sky-300 bg-sky-950/40'
                        : dept.id === 'resuscitation_bay'
                        ? 'border-rose-500/50 text-rose-300 bg-rose-950/40'
                        : dept.id === 'treatment_cubicles'
                        ? 'border-emerald-500/50 text-emerald-300 bg-emerald-950/40'
                        : dept.id === 'central_pharmacy'
                        ? 'border-amber-500/50 text-amber-300 bg-amber-950/40'
                        : 'border-purple-500/50 text-purple-300 bg-purple-950/40';

                    const infra = dept.infrastructureData;
                    const deptTotalWatts = infra?.departmentMachinery?.reduce(
                      (acc, item) => acc + item.requiredQuantity * item.powerConsumptionWatts,
                      0
                    ) || 0;

                    const riskBadgeColor =
                      infra.infectionRiskMultiplier >= 2.0
                        ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                        : infra.infectionRiskMultiplier > 1.0
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';

                    return (
                      <tr key={dept.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-3.5 font-bold text-white">
                          <div className="flex items-start gap-2">
                            <span className={`w-6 h-6 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${badgeColor}`}>
                              {dept.index}
                            </span>
                            <div className="space-y-1">
                              <span className="block font-bold">{dept.shortName}</span>
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-[10px] text-sky-400 font-mono">
                                <span>ID:</span>
                                <span className="text-white font-bold">{infra.departmentId}</span>
                              </div>
                              <span className="block text-[10px] text-slate-400 font-normal leading-tight">{dept.description}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-slate-200 block">{dept.simultaneousCapacity}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            MaxCapacityBeds: <strong className="text-white">{infra.maxCapacityBeds}</strong>
                          </span>
                          {dept.id === 'triage_admission' && (
                            <span className="text-[10px] text-sky-400 font-bold block mt-1">En cola: {triageQueueCount} de 6</span>
                          )}
                          {dept.id === 'central_pharmacy' && (
                            <span className="text-[10px] text-amber-400 font-bold block mt-1">Reabastece en: {pyxisRestockTimer}s</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-slate-300 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-[11px]">{dept.assignedStaff}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Personal Mínimo: <span className="text-slate-200 font-bold">{infra.requiredStaffCount}</span>
                          </div>
                          <div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${riskBadgeColor}`}>
                              <span>InfectionRisk:</span>
                              <span>{infra.infectionRiskMultiplier.toFixed(2)}x</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-300">
                          <div className="space-y-1">
                            {infra.departmentMachinery.map((mach, i) => (
                              <div
                                key={i}
                                className="text-[11px] flex items-center justify-between gap-2 text-slate-300 bg-[#0d101c] px-2 py-1 rounded-md border border-slate-800"
                              >
                                <span className="font-mono text-slate-200 truncate">
                                  <span className="text-amber-400 font-bold">x{mach.requiredQuantity}</span> {mach.equipmentName}
                                </span>
                                <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0">
                                  {mach.powerConsumptionWatts}W
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-200 space-y-2">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px]">
                            {dept.flowRate}
                          </span>
                          <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] font-mono text-amber-200">
                            <div className="flex items-center gap-1 text-[10px] text-amber-400 uppercase tracking-wider">
                              <Zap className="w-3 h-3 text-amber-400" />
                              <span>Consumo Auxiliar:</span>
                            </div>
                            <div className="text-sm font-black text-amber-300">
                              {deptTotalWatts.toFixed(0)} W
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Interactive Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    spawnDynamicPatient();
                    playBlueprintCompileChime();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-sky-600/80 hover:bg-sky-500 text-white font-mono text-xs font-bold border border-sky-400/50 flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Admitir Paciente desde Triaje</span>
                </button>

                <button
                  onClick={() => {
                    setPyxisRestockTimer(1);
                    playBlueprintCompileChime();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-600/80 hover:bg-amber-500 text-white font-mono text-xs font-bold border border-amber-400/50 flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>Forzar Ciclo Pyxis 4000 (20s)</span>
                </button>

                <button
                  onClick={() => {
                    spawnRandomCorridorHazard();
                    playBiohazardAlarm();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-700/80 hover:bg-purple-600 text-white font-mono text-xs font-bold border border-purple-400/50 flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Simular Derrame Hazmat</span>
                </button>
              </div>

              <button
                onClick={() => setShowDepartmentMatrixModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold border border-slate-700 cursor-pointer transition-all"
              >
                CERRAR MATRIZ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WBP_TouchControls Simulation Layer in Doctor Play Mode */}
      {viewportMode === 'play_doctor' && (
        <>
          {/* Stick Virtual Izquierdo (IA_Move) */}
          <div className="absolute bottom-5 left-5 flex flex-col items-center select-none touch-none z-30">
            <div
              onPointerDown={handleJoystickPointerDown}
              onPointerMove={handleJoystickPointerMove}
              onPointerUp={handleJoystickPointerUp}
              onPointerCancel={handleJoystickPointerUp}
              className="relative w-28 h-28 rounded-full bg-[#0b0f1a]/85 border-2 border-sky-500/50 backdrop-blur-md shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing hover:border-sky-400"
            >
              {/* Radial guides */}
              <div className="absolute inset-2.5 rounded-full border border-dashed border-sky-400/25 pointer-events-none" />
              <div className="absolute w-2 h-2 rounded-full bg-sky-400/50 pointer-events-none" />

              {/* Thumb stick knob */}
              <div
                style={{
                  transform: `translate(${stickVisual.x}px, ${stickVisual.y}px)`,
                }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 via-sky-500 to-indigo-600 border-2 border-white/70 shadow-xl flex items-center justify-center transition-transform duration-75 pointer-events-none"
              >
                <Move className="w-5 h-5 text-white/90" />
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[9px] font-mono text-sky-300 font-semibold uppercase tracking-wider bg-slate-900/90 px-2 py-0.5 rounded-full border border-sky-500/30 shadow-md">
              <Smartphone className="w-2.5 h-2.5 text-sky-400" />
              <span>CONTROL ANALÓGICO</span>
            </div>
          </div>

          {/* Botones Táctiles Derecha: Acción e Interacción */}
          <div className="absolute bottom-5 right-5 flex flex-col items-end gap-2.5 select-none z-30">
            {/* Botón de Aplicar Fármaco / Acción Rápida */}
            {heldItem !== 'None' && (
              <button
                onClick={() => performInteractionRef.current()}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 active:scale-95 text-white font-mono font-bold text-xs shadow-2xl border-2 border-amber-300/70 cursor-pointer animate-pulse transition-transform"
              >
                {heldItem === 'Epinephrine' ? (
                  <Syringe className="w-4 h-4 text-white" />
                ) : heldItem === 'Defibrillator' ? (
                  <Zap className="w-4 h-4 text-white" />
                ) : (
                  <Droplets className="w-4 h-4 text-white" />
                )}
                <div className="text-left leading-tight">
                  <span className="block text-[8px] text-amber-200 tracking-wider">ACCIÓN MÉDICA</span>
                  <span className="text-[11px] font-extrabold">
                    {heldItem === 'Epinephrine'
                      ? 'APLICAR ADRENALINA'
                      : heldItem === 'Defibrillator'
                      ? 'DESCARGA (200J)'
                      : 'INFUNDIR SUERO'}
                  </span>
                </div>
              </button>
            )}

            {/* Botón de Interacción */}
            <button
              onClick={() => performInteractionRef.current()}
              className={`flex items-center gap-2.5 px-5 py-3.5 rounded-3xl font-mono text-xs font-black shadow-2xl transition-all cursor-pointer active:scale-95 border-2 ${
                nearbyPrompt
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white border-emerald-300 ring-4 ring-emerald-500/30'
                  : 'bg-[#121622]/90 hover:bg-[#1a1f30] text-slate-200 border-slate-700/80'
              }`}
            >
              <Hand className={`w-5 h-5 ${nearbyPrompt ? 'text-emerald-100 animate-bounce' : 'text-slate-400'}`} />
              <div className="text-left">
                <span className="block text-[8px] tracking-wider text-slate-400 uppercase">INTERACTUAR</span>
                <span className="text-xs uppercase">{nearbyPrompt || 'INTERACTUAR [E]'}</span>
              </div>
            </button>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL UMG: WBP_RoundResults (Widget Blueprint Recreado Fielmente)           */}
      {/* Disparado por AEEGameModeBase::EndRound() cuando RemainingMatchTime <= 0    */}
      {/* ========================================================================= */}
      {showResultsModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-xl bg-gradient-to-b from-[#181c2b] via-[#111420] to-[#0c0e17] border-2 border-amber-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 space-y-6 text-center select-none">
            {/* Unreal Engine UMG Blueprint Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-[11px] font-mono font-bold text-amber-300">
              <Trophy className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>WBP_RoundResults • CLIENT_RPC_SHOW_ROUND_RESULTS</span>
            </div>

            {/* Header Title */}
            <div className="space-y-1">
              <p className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
                Hospital de Urgencias — Informe Final de Guardia Médica
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 tracking-wide font-sans">
                {getVerdictText(currentStars)}
              </h2>
            </div>

            {/* Stars Reveal Container */}
            <div className="flex items-center justify-center gap-4 py-2">
              {[1, 2, 3].map((starIndex) => {
                const isEarned = starIndex <= currentStars;
                return (
                  <div
                    key={starIndex}
                    className={`relative transition-all duration-500 transform ${
                      isEarned
                        ? 'scale-110 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                        : 'text-slate-700 scale-95 opacity-40'
                    }`}
                  >
                    <Star
                      className="w-16 h-16 sm:w-20 sm:h-20"
                      fill={isEarned ? '#f59e0b' : '#1e293b'}
                      stroke={isEarned ? '#fef08a' : '#334155'}
                      strokeWidth={1.5}
                    />
                    {isEarned && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-black text-slate-950 opacity-90">
                        ★
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Clinical Breakdown Metrics (EEGameStateBase Data) */}
            <div className="grid grid-cols-3 gap-3 bg-[#0a0d14]/90 p-4 rounded-xl border border-slate-800 font-mono text-left">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 block uppercase">Pacientes Curados</span>
                <span className="text-xl font-bold text-emerald-400">+{savedCount}</span>
                <span className="text-[9px] text-emerald-500/80 block">+{savedCount * 100} pts</span>
              </div>
              <div className="space-y-0.5 border-x border-slate-800/80 px-3">
                <span className="text-[10px] text-slate-400 block uppercase">Fallecidos</span>
                <span className="text-xl font-bold text-rose-400">-{deceasedCount}</span>
                <span className="text-[9px] text-rose-500/80 block">-{deceasedCount * 50} pts</span>
              </div>
              <div className="space-y-0.5 pl-1">
                <span className="text-[10px] text-amber-300 block uppercase">Puntaje Total</span>
                <span className="text-xl font-black text-amber-400">{currentTotalScore}</span>
                <span className="text-[9px] text-amber-500/80 block">TeamScore Net</span>
              </div>
            </div>

            {/* Status & Seamless Travel Notice */}
            <div className="p-3 bg-[#131622] rounded-xl border border-sky-500/30 text-xs font-mono text-sky-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Estado: <strong>ERoundStatus::RoundEnded</strong></span>
              </div>
              <div className="text-slate-400">
                Regreso automático al Lobby en: <strong className="text-amber-400">{lobbyCountdown}s</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRestartShift}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>REINICIAR GUARDIA (NUEVO TURNO)</span>
              </button>
              <button
                onClick={() => {
                  setShowResultsModal(false);
                  onExitGameMode();
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono text-xs font-black shadow-lg shadow-amber-500/25 transition-all border border-amber-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>VOLVER AL LOBBY (ServerTravel)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
