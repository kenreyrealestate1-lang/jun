/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SceneActor, PatientVitals } from '../types/engine';
import {
  Heart,
  Activity,
  AlertTriangle,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Radio,
  Flame,
} from 'lucide-react';

interface VisualHeartbeatMonitorProps {
  actors: SceneActor[];
  selectedActorId?: string | null;
  onSelectActor?: (actorId: string) => void;
  className?: string;
}

export const VisualHeartbeatMonitor: React.FC<VisualHeartbeatMonitorProps> = ({
  actors,
  selectedActorId,
  onSelectActor,
  className = '',
}) => {
  // Extraer todas las camillas con pacientes del array de actores
  const patientBeds = useMemo(() => {
    return actors.filter(
      (a) => a.type === 'patient_stretcher' && a.patientVitals
    );
  }, [actors]);

  // Selección manual de cama para monitorear, o seguimiento dinámico de paciente crítico
  const [activeBedId, setActiveBedId] = useState<string>('');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Sincronizar cama activa: si el usuario selecciona una cama en el outliner/viewport, monitorizar esa;
  // de lo contrario, priorizar el paciente en paro cardíaco o con mayor frecuencia cardíaca
  useEffect(() => {
    if (selectedActorId && patientBeds.some((b) => b.id === selectedActorId)) {
      setActiveBedId(selectedActorId);
    } else if (!activeBedId && patientBeds.length > 0) {
      // Priorizar el más crítico por defecto
      const criticalBed = patientBeds.find(
        (b) => b.patientVitals?.currentState === 'CardiacArrest'
      ) || patientBeds[0];
      setActiveBedId(criticalBed.id);
    }
  }, [selectedActorId, patientBeds, activeBedId]);

  const activePatient = patientBeds.find((b) => b.id === activeBedId) || patientBeds[0];
  const vitals: PatientVitals | undefined = activePatient?.patientVitals;

  // Frecuencia cardíaca autoritativa en BPM
  const heartRate = vitals?.heartRate ?? 75;
  const isCardiacArrest = vitals?.currentState === 'CardiacArrest';
  const isCured = vitals?.currentState === 'Cured';
  const isFlatline = heartRate <= 0 || vitals?.currentState === 'Deceased';

  // =========================================================================
  // CÁLCULO DE FRECUENCIA Y PERÍODO DEL LATIDO (A MAYOR HEART RATE, MAYOR FRECUENCIA)
  // =========================================================================
  // Período T = 60 / BPM (en segundos)
  // 60 BPM -> 1.0s por latido
  // 135 BPM (Cama 01) -> ~0.444s por latido
  // 210 BPM (Cama 02) -> ~0.286s por latido (ritmo frenético de taquicardia/FV)
  const beatPeriodSeconds = useMemo(() => {
    if (isFlatline) return 2.0;
    const clampedBpm = Math.min(300, Math.max(30, heartRate));
    return Number((60 / clampedBpm).toFixed(3));
  }, [heartRate, isFlatline]);

  const frequencyHz = useMemo(() => {
    if (isFlatline) return 0;
    return Number((heartRate / 60).toFixed(2));
  }, [heartRate, isFlatline]);

  // Clasificación médica del ritmo
  const rhythmClassification = useMemo(() => {
    if (isFlatline) return { label: 'LÍNEA ISOELÉCTRICA / ASISTOLIA', color: 'text-rose-500', alert: true };
    if (isCardiacArrest) return { label: 'FIBRILACIÓN VENTRICULAR (200J)', color: 'text-rose-400', alert: true };
    if (heartRate > 150) return { label: 'TAQUICARDIA VENTRICULAR PAROXÍSTICA', color: 'text-rose-400', alert: true };
    if (heartRate > 100) return { label: 'TAQUICARDIA SINUSAL SEVERA', color: 'text-amber-400', alert: true };
    if (heartRate < 60) return { label: 'BRADICARDIA SINUSAL', color: 'text-sky-400', alert: false };
    return { label: 'RITMO SINUSAL NORMAL', color: 'text-emerald-400', alert: false };
  }, [heartRate, isCardiacArrest, isFlatline]);

  // Path SVG dinámico según el ritmo
  const ecgPath = useMemo(() => {
    if (isFlatline) {
      return 'M 0 25 L 240 25';
    }
    if (isCardiacArrest) {
      // Onda de Fibrilación Ventricular caótica y continua
      return 'M 0 25 Q 15 8, 30 25 T 60 25 Q 75 42, 90 25 T 120 25 Q 135 5, 150 25 T 180 25 Q 195 44, 210 25 T 240 25';
    }
    if (heartRate > 110) {
      // Taquicardia sinusal: complejos QRS rápidos y estrechos repetidos 3 veces en pantalla
      return 'M 0 25 L 20 25 L 25 21 L 28 25 L 32 3 L 36 39 L 40 25 L 46 22 L 54 25 ' +
             'L 90 25 L 95 21 L 98 25 L 102 3 L 106 39 L 110 25 L 116 22 L 124 25 ' +
             'L 160 25 L 165 21 L 168 25 L 172 3 L 176 39 L 180 25 L 186 22 L 194 25 L 240 25';
    }
    // Ritmo sinusal regular normal (P-QRS-T clásico)
    return 'M 0 25 L 35 25 L 45 20 L 52 25 L 60 25 L 65 29 L 72 4 L 79 42 L 85 25 L 92 25 L 105 18 L 120 25 L 160 25 L 170 20 L 177 25 L 185 25 L 190 29 L 197 4 L 204 42 L 210 25 L 240 25';
  }, [heartRate, isCardiacArrest, isFlatline]);

  if (!activePatient || patientBeds.length === 0) return null;

  return (
    <div
      className={`relative select-none pointer-events-auto transition-all duration-300 font-mono ${className}`}
    >
      {/* Contenedor del Monitor de Signos Vitales con Brillo Cardíaco Pulsante */}
      <div
        style={{
          animation:
            heartRate > 0 && !isFlatline
              ? `cardiacGlowRed ${beatPeriodSeconds}s infinite ease-in-out`
              : 'none',
        }}
        className={`rounded-2xl border-2 backdrop-blur-2xl shadow-2xl transition-all duration-300 overflow-hidden ${
          isCardiacArrest
            ? 'bg-[#120509]/95 border-rose-500/90 shadow-[0_0_35px_rgba(244,63,94,0.35)] ring-2 ring-rose-500/40'
            : heartRate > 100
            ? 'bg-[#140b0f]/95 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
            : 'bg-[#080d1a]/95 border-slate-700/80 shadow-[0_0_20px_rgba(56,189,248,0.15)]'
        } ${isMinimized ? 'w-64 p-2.5' : 'w-80 p-3.5'}`}
      >
        {/* Cabecera del Monitor Cardíaco */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            {/* Ícono de Corazón con Doble Latido Anatómico Dinámico */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-rose-950/70 border border-rose-500/50 shadow-inner">
              {/* Onda expansiva de sonar cardíaco */}
              {!isFlatline && (
                <span
                  style={{
                    animation: `cardiacRipple ${beatPeriodSeconds}s infinite cubic-bezier(0, 0.2, 0.8, 1)`,
                  }}
                  className="absolute inset-0 rounded-xl border-2 border-rose-500/80 pointer-events-none"
                />
              )}

              {/* Corazón palpitante cuya frecuencia se acelera según heartRate */}
              <Heart
                style={{
                  animation:
                    heartRate > 0 && !isFlatline
                      ? `cardiacPulse ${beatPeriodSeconds}s infinite ease-in-out`
                      : 'none',
                }}
                className={`w-5 h-5 transition-transform ${
                  isFlatline
                    ? 'text-slate-600'
                    : isCardiacArrest
                    ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_12px_#f43f5e]'
                    : heartRate > 100
                    ? 'text-rose-400 fill-rose-500 drop-shadow-[0_0_8px_#ef4444]'
                    : 'text-rose-400 fill-rose-400 drop-shadow-[0_0_5px_#f43f5e]'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black tracking-wide text-white font-sans uppercase">
                  MONITOR CARDÍACO
                </span>
                <span className="text-[8px] px-1.5 py-0.2 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {frequencyHz} Hz
                </span>
              </div>
              <div className="text-[9px] text-slate-400 flex items-center gap-1.5">
                <span
                  style={{
                    animation:
                      heartRate > 0 && !isFlatline
                        ? `ping ${beatPeriodSeconds}s infinite`
                        : 'none',
                  }}
                  className={`w-1.5 h-1.5 rounded-full ${
                    isFlatline
                      ? 'bg-slate-600'
                      : isCardiacArrest
                      ? 'bg-rose-500'
                      : 'bg-emerald-400'
                  }`}
                />
                <span className="truncate">{activePatient.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized((prev) => !prev)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title={isMinimized ? 'Expandir monitor cardíaco' : 'Minimizar'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Selector de Camillas (HOSPITAL_ACTORS Patient Stretchers) */}
        <div className="grid grid-cols-2 gap-1.5 pt-2">
          {patientBeds.map((bed, idx) => {
            const bedVitals = bed.patientVitals;
            const bedHeartRate = bedVitals?.heartRate ?? 75;
            const bedIsArrest = bedVitals?.currentState === 'CardiacArrest';
            const bedIsCured = bedVitals?.currentState === 'Cured';
            const isSelected = bed.id === activeBedId;

            // Frecuencia individual por cama
            const bedPeriod = Number((60 / Math.max(30, bedHeartRate)).toFixed(3));

            return (
              <button
                key={bed.id}
                onClick={() => {
                  setActiveBedId(bed.id);
                  if (onSelectActor) onSelectActor(bed.id);
                }}
                className={`flex items-center justify-between p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? bedIsArrest
                      ? 'bg-rose-950/80 border-rose-500 text-rose-100 ring-2 ring-rose-500/40 shadow-lg'
                      : 'bg-slate-800/90 border-sky-400 text-sky-100 ring-2 ring-sky-500/30'
                    : 'bg-[#0d101a]/70 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {/* Micro led palpitante individual */}
                  <span
                    style={{
                      animation:
                        bedHeartRate > 0
                          ? `cardiacPulse ${bedPeriod}s infinite ease-in-out`
                          : 'none',
                    }}
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      bedIsArrest
                        ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                        : bedIsCured
                        ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                        : 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                    }`}
                  />
                  <div className="truncate">
                    <span className="block text-[10px] font-bold leading-tight truncate">
                      CAMA 0{idx + 1}
                    </span>
                    <span className="block text-[8px] opacity-75 truncate uppercase">
                      {bedIsArrest ? '200J REQ' : bedIsCured ? 'ALTA' : bedVitals?.assignedDisease || 'TRIAGE'}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-1">
                  <span
                    className={`text-[11px] font-black ${
                      bedIsArrest
                        ? 'text-rose-400'
                        : bedHeartRate > 100
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {bedHeartRate}
                  </span>
                  <span className="block text-[7px] text-slate-500 leading-none">BPM</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sección Expandida con Telemetría e Histograma EKG */}
        {!isMinimized && (
          <div className="space-y-2.5 pt-2.5">
            {/* Pantalla Osciloscópica CRT con Trazo Dinámico de Electrocardiograma */}
            <div className="relative h-14 w-full bg-[#03060f] rounded-xl border border-slate-800/90 overflow-hidden shadow-inner flex items-center justify-center">
              {/* Retícula milimétrica médica de fondo */}
              <div
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(14, 30, 48, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 30, 48, 0.5) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
                className="absolute inset-0 pointer-events-none"
              />

              {/* Barrido de escaneo CRT en tiempo real sincronizado a la frecuencia del latido */}
              <div
                style={{
                  animation: `ekgScanSweep ${beatPeriodSeconds * 2.0}s linear infinite`,
                }}
                className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-rose-500/15 to-transparent w-full"
              />

              {/* Trazo vectorial SVG de la onda cardíaca */}
              <svg className="w-full h-full relative z-10 px-1" viewBox="0 0 240 50">
                <path
                  d={ecgPath}
                  fill="none"
                  stroke={
                    isFlatline
                      ? '#ef4444'
                      : isCardiacArrest
                      ? '#ff2222'
                      : heartRate > 100
                      ? '#f59e0b'
                      : '#22c55e'
                  }
                  strokeWidth={isCardiacArrest ? '2.5' : '2'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isCardiacArrest ? 'filter drop-shadow-[0_0_8px_#ef4444]' : 'filter drop-shadow-[0_0_4px_#22c55e]'}
                />
              </svg>

              {/* Indicador de Tasa de Pulso en Vivo */}
              <div className="absolute top-1 right-2 z-20 flex items-center gap-1 text-[8px] font-mono text-slate-400 bg-black/60 px-1.5 py-0.5 rounded border border-slate-800">
                <Radio className="w-2.5 h-2.5 text-rose-400 animate-pulse" />
                <span>LEAD II • ECG 25mm/s</span>
              </div>
            </div>

            {/* Clasificación Diagnóstica del Ritmo */}
            <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-black/40 border border-slate-800/80 text-[9px]">
              <span className="text-slate-400 flex items-center gap-1 font-bold">
                {isCardiacArrest ? (
                  <Zap className="w-3 h-3 text-rose-500 animate-bounce" />
                ) : (
                  <Activity className="w-3 h-3 text-sky-400" />
                )}
                RITMO:
              </span>
              <span className={`font-black tracking-wide ${rhythmClassification.color}`}>
                {rhythmClassification.label}
              </span>
            </div>

            {/* Métricas Clínicas Principales (PULSO BPM, SpO2, SALUD) */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Pulso Cardíaco con Pulso Rojo Reactivo */}
              <div
                style={{
                  animation:
                    heartRate > 0 && !isFlatline
                      ? `cardiacGlowRed ${beatPeriodSeconds}s infinite ease-in-out`
                      : 'none',
                }}
                className={`p-1.5 rounded-xl border ${
                  isCardiacArrest
                    ? 'bg-rose-950/60 border-rose-500/80 text-rose-200'
                    : heartRate > 100
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-200'
                }`}
              >
                <span className="text-slate-400 block text-[8px] font-semibold">PULSO (BPM)</span>
                <div className="flex items-center justify-center gap-1">
                  <span
                    className={`text-xl font-black font-mono tracking-tight ${
                      isCardiacArrest
                        ? 'text-rose-400 drop-shadow-[0_0_10px_#ef4444]'
                        : heartRate > 100
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {isFlatline ? '0' : heartRate}
                  </span>
                  {!isFlatline && (
                    <span
                      style={{
                        animation: `cardiacPulse ${beatPeriodSeconds}s infinite ease-in-out`,
                      }}
                      className="text-xs"
                    >
                      ❤️
                    </span>
                  )}
                </div>
                <span className="text-[7.5px] text-slate-500 block leading-none">
                  {beatPeriodSeconds}s / ciclo
                </span>
              </div>

              {/* Saturación de Oxígeno (SpO2) */}
              <div className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200">
                <span className="text-slate-400 block text-[8px] font-semibold">OXÍGENO SpO2</span>
                <span
                  className={`text-xl font-black font-mono tracking-tight ${
                    (vitals?.oxygenSaturation || 99) < 85
                      ? 'text-rose-400 animate-pulse'
                      : (vitals?.oxygenSaturation || 99) < 92
                      ? 'text-amber-400'
                      : 'text-sky-400'
                  }`}
                >
                  {vitals?.oxygenSaturation || 99}%
                </span>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                  <div
                    style={{ width: `${vitals?.oxygenSaturation || 99}%` }}
                    className={`h-full ${
                      (vitals?.oxygenSaturation || 99) < 85 ? 'bg-rose-500' : 'bg-sky-400'
                    }`}
                  />
                </div>
              </div>

              {/* Nivel de Salud del Paciente */}
              <div className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200">
                <span className="text-slate-400 block text-[8px] font-semibold">ESTADO SALUD</span>
                <span
                  className={`text-xl font-black font-mono tracking-tight ${
                    (vitals?.patientHealth || 100) < 30
                      ? 'text-rose-400 animate-pulse'
                      : (vitals?.patientHealth || 100) < 60
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {vitals?.patientHealth || 100}%
                </span>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                  <div
                    style={{ width: `${vitals?.patientHealth || 100}%` }}
                    className={`h-full ${
                      (vitals?.patientHealth || 100) < 30
                        ? 'bg-rose-500'
                        : (vitals?.patientHealth || 100) < 60
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Aviso de Acción Terapéutica Recomendada */}
            <div
              className={`p-2 rounded-xl border flex items-center justify-between text-[10px] ${
                isCardiacArrest
                  ? 'bg-rose-950/70 border-rose-500/80 text-rose-200'
                  : isCured
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-900/70 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isCardiacArrest ? (
                  <Flame className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                ) : isCured ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>
                  {isCardiacArrest
                    ? '¡PARO CARDÍACO! DESCARGA (200J) EN CURSO'
                    : isCured
                    ? 'PACIENTE ESTABILIZADO Y CURADO'
                    : `DIAGNÓSTICO: ${vitals?.assignedDisease?.toUpperCase() || 'TRIAJE'}`}
                </span>
              </div>
              <span className="text-[9px] font-bold opacity-80 uppercase">
                {isCardiacArrest ? 'CARRO ROJO' : isCured ? 'ALTA' : 'ADRENALINA'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
