/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScenePreset = 'emergency_room' | 'operating_theater' | 'triage_bay';

export type ViewportMode = 'editor' | 'play_doctor';

export type TransformGizmoMode = 'translate' | 'rotate' | 'scale';

export type EPatientState =
  | 'WaitingForTriage'
  | 'Diagnosed'
  | 'UnderTreatment'
  | 'Cured'
  | 'CardiacArrest'
  | 'Deceased';

export type EDiseaseType =
  | 'None'
  | 'Appendicitis'
  | 'BacterialPneumonia'
  | 'Anaphylaxis';

export type MedicalTreatmentItem =
  | 'None'
  | 'Epinephrine' // for Anaphylaxis (Jeringa de Adrenalina 1mg)
  | 'IVBag' // for Hypovolemia / Dehydration (Bolsa de Suero Salino 0.9%)
  | 'Antibiotics' // for BacterialPneumonia
  | 'SurgicalKit' // for Appendicitis
  | 'Defibrillator'; // for CardiacArrest (Palas de Desfibrilador 200J)

export type HeldDrugType = MedicalTreatmentItem;

export interface FMedicalCaseData {
  caseId: string;
  patientName: string;
  requiredDrug: MedicalTreatmentItem; // Fármaco requerido según FMedicalCaseData
  diseaseName: EDiseaseType;
  pointsOnSuccess: number;
  triggerBoxExtent?: [number, number, number]; // Extensión del UBoxComponent (Overlap Box)
}

export interface PatientVitals {
  heartRate: number; // Normal: 60-100 bpm
  oxygenSaturation: number; // SpO2 Normal: 95-100%
  patientHealth: number; // 0 to 100%
  currentState: EPatientState;
  assignedDisease: EDiseaseType;
  deteriorationRate: number;
}

export type EZoneStatus = 'Clean' | 'Contaminated' | 'Disinfecting';

export type EHospitalDepartment =
  | 'triage_admission'
  | 'resuscitation_bay'
  | 'treatment_cubicles'
  | 'central_pharmacy'
  | 'hazmat_decon';

export interface FEquipmentRequirement {
  equipmentName: string; // Ej: "Defibrillator_Biphasic_200J"
  requiredQuantity: number; // Ej: 2
  powerConsumptionWatts: number; // Ej: 150.0f - Para simulación de apagones / generadores de emergencia
}

export interface FDepartmentInfrastructureData {
  departmentId: string; // Ej: "ED_Trauma_Bay"
  maxCapacityBeds: number; // Ej: 2
  departmentMachinery: FEquipmentRequirement[];
  requiredStaffCount: number; // Ej: 2 - Médicos/Enfermeros mínimos en zona
  infectionRiskMultiplier: number; // Ej: 1.2f - Multiplicador de aparición de Zonas de Contaminación
}

export interface FDepartmentConfig {
  id: EHospitalDepartment;
  index: number;
  name: string;
  shortName: string;
  simultaneousCapacity: string;
  maxSlots: number;
  assignedStaff: string;
  criticalEquipment: string[];
  flowRate: string;
  accentColor: string;
  accentHex: number;
  description: string;
  infrastructureData: FDepartmentInfrastructureData;
}

export const HOSPITAL_DEPARTMENTS_CONFIG: Record<EHospitalDepartment, FDepartmentConfig> = {
  triage_admission: {
    id: 'triage_admission',
    index: 1,
    name: '1. Sala de Admisión & Triaje',
    shortName: 'Admisión & Triaje',
    simultaneousCapacity: '6 Pacientes en espera',
    maxSlots: 6,
    assignedStaff: '1 Enfermera de Triaje',
    criticalEquipment: ['Kiosco EMR/HIS', 'Termómetros infrarrojos', 'Oxímetros de pulso'],
    flowRate: '1 paciente cada 15-30 seg (Oleada)',
    accentColor: 'sky',
    accentHex: 0x38bdf8,
    description: 'Recepción frontal y clasificación de gravedad Manchester. Determina prioridad inmediata hacia Reanimación o Cubículos de Observación.',
    infrastructureData: {
      departmentId: 'ED_Triage_Admission',
      maxCapacityBeds: 6,
      requiredStaffCount: 1,
      infectionRiskMultiplier: 1.0,
      departmentMachinery: [
        { equipmentName: 'Kiosk_EMR_HIS', requiredQuantity: 1, powerConsumptionWatts: 90.0 },
        { equipmentName: 'Infrared_Thermometer_Pro', requiredQuantity: 2, powerConsumptionWatts: 15.0 },
        { equipmentName: 'Pulse_Oximeter_SpO2', requiredQuantity: 4, powerConsumptionWatts: 25.0 },
      ],
    },
  },
  resuscitation_bay: {
    id: 'resuscitation_bay',
    index: 2,
    name: '2. Bahías de Reanimación (Trauma / Código Azul)',
    shortName: 'Reanimación (Código Azul)',
    simultaneousCapacity: '2 Camillas Críticas',
    maxSlots: 2,
    assignedStaff: '1 Médico Urgenciólogo, 1 Enfermero/a',
    criticalEquipment: ['Desfibrilador Bifásico', 'Monitor ECG 12 derivaciones', 'Carro Rojo'],
    flowRate: 'Límite de colapso: 30-45s antes de paro',
    accentColor: 'rose',
    accentHex: 0xef4444,
    description: 'Atención a pacientes en colapso hemodinámico, paro cardíaco inminente o anafilaxia grave con riesgo de muerte en segundos.',
    infrastructureData: {
      departmentId: 'ED_Trauma_Bay',
      maxCapacityBeds: 2,
      requiredStaffCount: 2,
      infectionRiskMultiplier: 1.2,
      departmentMachinery: [
        { equipmentName: 'Defibrillator_Biphasic_200J', requiredQuantity: 2, powerConsumptionWatts: 150.0 },
        { equipmentName: 'Monitor_ECG_12Lead', requiredQuantity: 2, powerConsumptionWatts: 120.0 },
        { equipmentName: 'Crash_Cart_Pediatric_Adult', requiredQuantity: 1, powerConsumptionWatts: 45.0 },
      ],
    },
  },
  treatment_cubicles: {
    id: 'treatment_cubicles',
    index: 3,
    name: '3. Cubículos de Tratamiento Estándar',
    shortName: 'Tratamiento Estándar',
    simultaneousCapacity: '4 Camillas de observación',
    maxSlots: 4,
    assignedStaff: '1 Médico General / Residente',
    criticalEquipment: ['Bombas de infusión IV', 'Nebulizadores', 'Estetoscopios'],
    flowRate: 'Resolución en 60-90s por caso',
    accentColor: 'emerald',
    accentHex: 0x10b981,
    description: 'Estabilización de neumonías bacterianas, deshidratación aguda y cuadros agudos con sueroterapia y antibioterapia controlada.',
    infrastructureData: {
      departmentId: 'ED_Treatment_Cubicles',
      maxCapacityBeds: 4,
      requiredStaffCount: 1,
      infectionRiskMultiplier: 1.15,
      departmentMachinery: [
        { equipmentName: 'IV_Infusion_Pump_Dual', requiredQuantity: 4, powerConsumptionWatts: 65.0 },
        { equipmentName: 'Ultrasonic_Nebulizer', requiredQuantity: 2, powerConsumptionWatts: 110.0 },
        { equipmentName: 'Electronic_Stethoscope', requiredQuantity: 2, powerConsumptionWatts: 10.0 },
      ],
    },
  },
  central_pharmacy: {
    id: 'central_pharmacy',
    index: 4,
    name: '4. Farmacia Central (Dispenser Station)',
    shortName: 'Farmacia Pyxis',
    simultaneousCapacity: '1 Estación de estantería',
    maxSlots: 1,
    assignedStaff: '1 Técnico de Farmacia / Asistente',
    criticalEquipment: ['Armario automatizado Pyxis (Epinefrina, Suero, Antibióticos)', 'Lector de códigos', 'Bandejas estériles'],
    flowRate: 'Reabastecimiento dinámico cada 20s',
    accentColor: 'amber',
    accentHex: 0xf59e0b,
    description: 'Dispensación rápida de fármacos y fluidos mediante gabinete digital Pyxis con ciclo de reposición activa cada 20 segundos.',
    infrastructureData: {
      departmentId: 'PHARM_Central_Pyxis',
      maxCapacityBeds: 1,
      requiredStaffCount: 1,
      infectionRiskMultiplier: 0.8,
      departmentMachinery: [
        { equipmentName: 'Pyxis_MedStation_Automated', requiredQuantity: 1, powerConsumptionWatts: 250.0 },
        { equipmentName: 'Barcode_Scanner_Sterile', requiredQuantity: 2, powerConsumptionWatts: 20.0 },
        { equipmentName: 'Cold_Storage_Insulin_Epi', requiredQuantity: 1, powerConsumptionWatts: 180.0 },
      ],
    },
  },
  hazmat_decon: {
    id: 'hazmat_decon',
    index: 5,
    name: '5. Zona de Contaminación / Hazmat',
    shortName: 'Hazmat & Descontaminación',
    simultaneousCapacity: '1 Área de Descontaminación',
    maxSlots: 1,
    assignedStaff: '1 Especialista Hazmat / Desinfección',
    criticalEquipment: ['Ducha química descontaminante', 'Aspersores de alta presión', 'Contenedores estancos Biohazard'],
    flowRate: 'Protocolo activo ante fuga/derrame',
    accentColor: 'purple',
    accentHex: 0xa855f7,
    description: 'Aislamiento de fluidos patológicos y biológicos. Requiere limpieza con rociador para despejar el corredor central y restaurar el tránsito.',
    infrastructureData: {
      departmentId: 'DECON_Hazmat_Chamber',
      maxCapacityBeds: 1,
      requiredStaffCount: 1,
      infectionRiskMultiplier: 2.5,
      departmentMachinery: [
        { equipmentName: 'Chemical_Decon_Shower_HighPressure', requiredQuantity: 1, powerConsumptionWatts: 450.0 },
        { equipmentName: 'Biohazard_Air_Scrubber_HEPA', requiredQuantity: 1, powerConsumptionWatts: 350.0 },
        { equipmentName: 'UV_C_Sterilization_Beacon', requiredQuantity: 2, powerConsumptionWatts: 120.0 },
      ],
    },
  },
};

export interface SceneActor {
  id: string;
  name: string;
  type:
    | 'mesh'
    | 'point_light'
    | 'spot_light'
    | 'directional_light'
    | 'camera'
    | 'patient_stretcher'
    | 'pharmacy_cabinet'
    | 'defib_station'
    | 'danger_zone'
    | 'nurse_assistant'
    | 'triage_kiosk'
    | 'hazmat_station'
    | 'pharmacy_dispenser';
  department?: EHospitalDepartment;
  position: [number, number, number];
  rotation: [number, number, number]; // Euler in degrees
  scale: [number, number, number];
  visible: boolean;
  patientVitals?: PatientVitals;
  medicalCaseData?: FMedicalCaseData;
  stationItem?: MedicalTreatmentItem;
  zoneStatus?: EZoneStatus;
  zoneRequiredCleaningTime?: number;
  material?: {
    color: string;
    roughness: number;
    metalness: number;
    clearcoat: number;
    emissive: string;
    emissiveIntensity: number;
    wireframe?: boolean;
    textureType?: 'none' | 'metal' | 'grid' | 'concrete' | 'tiles';
  };
  lightProperties?: {
    color: string;
    intensity: number;
    distance: number;
    decay: number;
    castShadow: boolean;
    angle?: number;
    penumbra?: number;
  };
  locked?: boolean;
}

export interface LightingEnvironment {
  timeOfDay: number; // 0 to 24 hours
  sunAzimuth: number; // 0 to 360
  sunElevation: number; // 0 to 90
  sunIntensity: number;
  sunColor: string;
  skyLightIntensity: number;
  lumenGIMultiplier: number;
  indirectBounce: boolean;
  volumetricFog: boolean;
  fogDensity: number;
  fogColor: string;
  exposure: number;
  bloomIntensity: number;
  bloomThreshold: number;
  screenSpaceReflections: boolean;
  vignette: boolean;
  cameraFov: number;
  emergencyAlarmActive: boolean;
}

export interface BlueprintNode {
  id: string;
  title: string;
  category: 'event' | 'action' | 'variable' | 'math';
  x: number;
  y: number;
  color: string;
  inputs: { id: string; label: string; type: 'exec' | 'boolean' | 'number' | 'vector' | 'color' }[];
  outputs: { id: string; label: string; type: 'exec' | 'boolean' | 'number' | 'vector' | 'color' }[];
  values?: Record<string, any>;
}

export interface BlueprintConnection {
  id: string;
  fromNodeId: string;
  fromPinId: string;
  toNodeId: string;
  toPinId: string;
}

export type ActiveTab = 'viewport' | 'architecture' | 'blueprint' | 'content' | 'installer';

export type Language = 'en' | 'es';
