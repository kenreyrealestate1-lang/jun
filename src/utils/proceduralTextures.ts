/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

const textureCache = new Map<string, THREE.Texture>();

export function getProceduralImpastoTexture(): THREE.Texture {
  if (textureCache.has('impasto')) return textureCache.get('impasto')!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm Gesso Primer canvas background
  ctx.fillStyle = '#1c1b18';
  ctx.fillRect(0, 0, 512, 512);

  // Layered thick oil paint impasto strokes with palette knife relief
  const strokes = 45;
  for (let i = 0; i < strokes; i++) {
    const startX = Math.random() * 512;
    const startY = Math.random() * 512;
    const length = 60 + Math.random() * 120;
    const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.4;
    const strokeWidth = 14 + Math.random() * 22;

    const grad = ctx.createLinearGradient(
      startX,
      startY,
      startX + Math.cos(angle) * length,
      startY + Math.sin(angle) * length
    );

    const huePick = i % 4 === 0 ? 'rgba(235, 140, 50, 0.25)' : i % 4 === 1 ? 'rgba(40, 160, 220, 0.2)' : 'rgba(255, 255, 255, 0.12)';
    grad.addColorStop(0, 'rgba(0,0,0,0.4)');
    grad.addColorStop(0.3, huePick);
    grad.addColorStop(0.7, 'rgba(255,255,255,0.22)');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');

    ctx.strokeStyle = grad;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      startX + Math.cos(angle) * length * 0.5 + (Math.random() - 0.5) * 20,
      startY + Math.sin(angle) * length * 0.5 + (Math.random() - 0.5) * 20,
      startX + Math.cos(angle) * length,
      startY + Math.sin(angle) * length
    );
    ctx.stroke();
  }

  // Cross-woven linen canvas texture
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 512; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y < 512; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('impasto', texture);
  return texture;
}

export function getProceduralGridTexture(): THREE.Texture {
  if (textureCache.has('grid')) return textureCache.get('grid')!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#14161c';
  ctx.fillRect(0, 0, 512, 512);

  // Sub-grid
  ctx.strokeStyle = '#232733';
  ctx.lineWidth = 1;
  const subStep = 32;
  for (let i = 0; i <= 512; i += subStep) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Major architectural grid
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  const majorStep = 128;
  for (let i = 0; i <= 512; i += majorStep) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('grid', texture);
  return texture;
}

export function getProceduralMetalNormalMap(): THREE.Texture {
  if (textureCache.has('metalNormal')) return textureCache.get('metalNormal')!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 256, 256);

  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;

  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const idx = (y * 256 + x) * 4;
      const noise = Math.sin(y * 0.8) * 15 + (Math.random() - 0.5) * 8;
      data[idx] = Math.min(255, Math.max(0, 128 + noise));
      data[idx + 1] = 128;
      data[idx + 2] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  textureCache.set('metalNormal', texture);
  return texture;
}

export function getProceduralConcreteTexture(): THREE.Texture {
  if (textureCache.has('concrete')) return textureCache.get('concrete')!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#64748b';
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 35;
    data[i] = Math.min(255, Math.max(0, 100 + n));
    data[i + 1] = Math.min(255, Math.max(0, 110 + n));
    data[i + 2] = Math.min(255, Math.max(0, 125 + n));
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('concrete', texture);
  return texture;
}

export function getProceduralTilesTexture(): THREE.Texture {
  if (textureCache.has('tiles')) return textureCache.get('tiles')!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Shiny clean clinical linoleum tiles
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle terrazzo / antimicrobial ceramic flecks
  for (let i = 0; i < 400; i++) {
    const fx = Math.random() * 512;
    const fy = Math.random() * 512;
    const size = 1 + Math.random() * 2;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(148, 163, 184, 0.15)' : 'rgba(203, 213, 225, 0.25)';
    ctx.beginPath();
    ctx.arc(fx, fy, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Thin sealed antimicrobial grouting
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  const tileSize = 128;
  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Hospital corridor colored guidance striping (Blue ER Guide Line)
  ctx.fillStyle = 'rgba(2, 132, 199, 0.85)';
  ctx.fillRect(246, 0, 20, 512);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(254, 0, 4, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('tiles', texture);
  return texture;
}

export function getHospitalWallTexture(): THREE.Texture {
  if (textureCache.has('hospital_wall')) return textureCache.get('hospital_wall')!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Upper wall: Clean antimicrobial hospital soft slate (anti-glare)
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, 512, 340);

  // Subtle clean paint stipple
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.fillRect(Math.random() * 512, Math.random() * 340, 2, 2);
  }

  // Lower wall: Protective medical vinyl wainscot (teal / hospital seafoam green)
  ctx.fillStyle = '#0f766e';
  ctx.fillRect(0, 340, 512, 172);

  // Protective rubber handrail/bumper rail (prevents stretcher damage)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 330, 512, 24);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(0, 338, 512, 6);

  // Baseboard (Rodapié sanitario higiénico)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 492, 512, 20);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('hospital_wall', texture);
  return texture;
}

export function getXRayViewerTexture(): THREE.Texture {
  if (textureCache.has('xray_viewer')) return textureCache.get('xray_viewer')!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Backlit negative film background
  ctx.fillStyle = '#050811';
  ctx.fillRect(0, 0, 256, 256);

  // Chest radiograph silhouette
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.7)';
  ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';

  // Spine & vertebrae
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(128, 30);
  ctx.lineTo(128, 220);
  ctx.stroke();

  // Ribs arching outward
  ctx.lineWidth = 3.5;
  for (let y = 60; y <= 180; y += 18) {
    const span = 45 + (y > 120 ? (180 - y) * 0.4 : (y - 60) * 0.5);
    // Left rib
    ctx.beginPath();
    ctx.moveTo(128, y);
    ctx.quadraticCurveTo(128 - span * 0.7, y - 8, 128 - span, y + 14);
    ctx.stroke();
    // Right rib
    ctx.beginPath();
    ctx.moveTo(128, y);
    ctx.quadraticCurveTo(128 + span * 0.7, y - 8, 128 + span, y + 14);
    ctx.stroke();
  }

  // Heart silhouette (cardiac shadow on left chest)
  ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
  ctx.beginPath();
  ctx.ellipse(142, 138, 26, 34, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();

  // Clavicles
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(70, 52);
  ctx.quadraticCurveTo(128, 58, 186, 52);
  ctx.stroke();

  // Film corner markers and patient ID label
  ctx.fillStyle = '#38bdf8';
  ctx.font = '10px monospace';
  ctx.fillText('ST. JUDE ER #042', 12, 20);
  ctx.fillText('R [PA CHEST]', 180, 20);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('xray_viewer', texture);
  return texture;
}

export function getMedicalPosterTexture(type: 'hygiene' | 'biohazard' | 'code_blue'): THREE.Texture {
  const key = `poster_${type}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  // Poster paper background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 360);

  if (type === 'biohazard') {
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, 256, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('BIOHAZARD', 60, 48);

    // Biohazard triangle
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(20, 100, 216, 216);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 100, 216, 216);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('INFECTIOUS RISK', 54, 280);
  } else if (type === 'code_blue') {
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(0, 0, 256, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('CÓDIGO AZUL', 48, 48);

    ctx.fillStyle = '#eff6ff';
    ctx.fillRect(16, 96, 224, 240);
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 96, 224, 240);

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('PROTOCOLO RCP / DESFIB', 32, 140);
    ctx.font = '11px sans-serif';
    ctx.fillText('1. Desfibrilación inmediata', 36, 180);
    ctx.fillText('2. Adrenalina 1mg IV cada 3-5m', 36, 210);
    ctx.fillText('3. Vía aérea permeable SpO2 >95%', 36, 240);
  } else {
    // Hygiene
    ctx.fillStyle = '#059669';
    ctx.fillRect(0, 0, 256, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('HIGIENE CLÍNICA', 48, 48);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('LAVADO Y DESINFECCIÓN', 36, 140);
    ctx.fillStyle = '#334155';
    ctx.font = '11px sans-serif';
    ctx.fillText('• Frotar con alcohol en gel 20s', 36, 180);
    ctx.fillText('• Usar guantes y mascarilla', 36, 210);
    ctx.fillText('• Desinfectar superficies críticas', 36, 240);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

export function getEcgScreenTexture(isFlatline: boolean): THREE.Texture {
  const key = `ecg_screen_${isFlatline ? 'flat' : 'normal'}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  // Medical monitor dark background with CRT grid
  ctx.fillStyle = '#050811';
  ctx.fillRect(0, 0, 512, 320);

  ctx.strokeStyle = '#0e1e2e';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 320; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // ECG Trace
  ctx.strokeStyle = isFlatline ? '#ef4444' : '#22c55e';
  ctx.lineWidth = 4;
  ctx.shadowColor = isFlatline ? '#ef4444' : '#22c55e';
  ctx.shadowBlur = 8;
  ctx.beginPath();

  if (isFlatline) {
    ctx.moveTo(0, 160);
    ctx.lineTo(512, 160);
  } else {
    // Normal sinus rhythm wave
    ctx.moveTo(0, 160);
    const wavePoints = [
      [40, 160], [60, 150], [70, 160], // P wave
      [80, 160], [90, 175], [100, 70], [112, 195], [120, 160], // QRS complex
      [145, 160], [165, 140], [185, 160], // T wave
    ];
    let offset = 0;
    while (offset < 512) {
      wavePoints.forEach(([px, py]) => {
        ctx.lineTo(offset + px, py);
      });
      offset += 200;
    }
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Numerical Telemetry
  ctx.fillStyle = isFlatline ? '#ef4444' : '#22c55e';
  ctx.font = 'bold 36px monospace';
  ctx.fillText(isFlatline ? '0' : '78', 380, 60);
  ctx.font = '12px sans-serif';
  ctx.fillText('HR (BPM)', 380, 20);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 32px monospace';
  ctx.fillText(isFlatline ? '52' : '98', 380, 140);
  ctx.font = '12px sans-serif';
  ctx.fillText('SpO2 (%)', 380, 100);

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 26px monospace';
  ctx.fillText('120/80', 380, 220);
  ctx.font = '12px sans-serif';
  ctx.fillText('NIBP (mmHg)', 380, 180);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

export function getDefibScreenTexture(): THREE.Texture {
  const key = 'defib_screen';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // CRT oscilloscope high-contrast background
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, 512, 256);

  // Oscilloscope grid lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y <= 256; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Header status banner
  ctx.fillStyle = '#065f46';
  ctx.fillRect(16, 12, 480, 28);
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('● MODO MANUAL: DESFIBRILACION BIFASICA (SINCRO OFF)', 28, 31);

  // Big Energy indicator
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 44px monospace';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 10;
  ctx.fillText('200 J', 32, 95);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('ENERGIA SELECCIONADA', 32, 120);

  // Charge Ready Bar
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(240, 60, 250, 26);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('⚡ CARGA COMPLETA (100%)', 255, 78);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px sans-serif';
  ctx.fillText('IMPEDANCIA DE PADS: 64 OHM (OPTIMA)', 240, 115);

  // VF Waveform (Ventricular Fibrillation rhythm)
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(0, 180);
  for (let x = 0; x <= 512; x += 8) {
    const y = 180 + Math.sin(x * 0.15) * 22 + Math.sin(x * 0.4) * 14 + (Math.random() - 0.5) * 8;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Bottom warning text
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('ALERTA: APARTARSE DEL PACIENTE! PULSAR BOTONES DE PALAS', 32, 238);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

export function getCrashCartDrawerTexture(drawerIndex: number, title: string, subtitle: string, colorHex: string): THREE.Texture {
  const key = `drawer_${drawerIndex}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Powder-coated red emergency cart drawer background
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(0, 0, 512, 128);

  // Drawer recessed bezel
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 500, 116);

  // Identification label plate
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(30, 24, 452, 80);

  // Left color accent bar for rapid clinical categorization
  ctx.fillStyle = colorHex;
  ctx.fillRect(30, 24, 18, 80);

  // Main drawer title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(title, 64, 60);

  // Subtitle / Contents
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(subtitle, 64, 88);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

export function getCabinetHeaderTexture(): THREE.Texture {
  const key = 'cabinet_header';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Brushed steel banner background
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 128);

  // Header border
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 504, 120);

  // Red Cross emblem box
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(24, 24, 80, 80);

  ctx.fillStyle = '#dc2626';
  // Vertical bar of cross
  ctx.fillRect(52, 34, 24, 60);
  // Horizontal bar of cross
  ctx.fillRect(34, 52, 60, 24);

  // Hospital pharmacy title
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('FARMACIA DE URGENCIAS', 124, 60);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('MEDICACION CRITICA & CARRO ROJO', 124, 88);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

export function getFloatingBadgeTexture(title: string, sub: string, accentHex: string): THREE.Texture {
  const key = `badge_${title}_${sub}_${accentHex}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 160);

  // Pill badge background with glow
  ctx.fillStyle = 'rgba(10, 15, 26, 0.92)';
  ctx.beginPath();
  ctx.roundRect(16, 16, 480, 128, 36);
  ctx.fill();

  ctx.lineWidth = 6;
  ctx.strokeStyle = accentHex;
  ctx.shadowColor = accentHex;
  ctx.shadowBlur = 18;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 256, 74);

  // Subtitle
  ctx.fillStyle = accentHex;
  ctx.font = 'bold 22px monospace';
  ctx.fillText(sub, 256, 114);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Genera textura diegética de alta visibilidad para el feedback de puntuación (+100 PUNTOS)
 * con estética estilizada party-game (estrellas doradas, borde resplandeciente esmeralda y relieve cómic).
 */
export function getScoreFloatingTexture(pointsText: string, subtitle: string, isBigCure: boolean = true): THREE.Texture {
  const key = `score_float_${pointsText}_${subtitle}_${isBigCure}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 200;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 200);

  // Contenedor translúcido con desenfoque de fondo y borde redondeado
  ctx.fillStyle = 'rgba(8, 14, 28, 0.95)';
  ctx.beginPath();
  ctx.roundRect(16, 16, 480, 168, 42);
  ctx.fill();

  // Borde degradado brillante Esmeralda -> Oro -> Esmeralda
  const grad = ctx.createLinearGradient(16, 0, 496, 0);
  grad.addColorStop(0, '#22c55e');
  grad.addColorStop(0.5, '#facc15');
  grad.addColorStop(1, '#22c55e');

  ctx.lineWidth = 8;
  ctx.strokeStyle = grad;
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 26;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Estrellas decorativas doradas en las esquinas superiores
  ctx.fillStyle = '#facc15';
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⭐', 56, 68);
  ctx.fillText('⭐', 456, 68);

  // Texto Principal de Puntuación (+100 PUNTOS)
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 18;
  ctx.font = '900 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(pointsText, 256, 92);

  // Subtítulo de Éxito Clínico (¡PACIENTE CURADO! / ALTA HOSPITALARIA)
  ctx.fillStyle = '#4ade80';
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 12;
  ctx.font = 'bold 22px monospace';
  ctx.fillText(subtitle, 256, 145);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Genera un mapa de suelo hospitalario de alta fidelidad (1024x1024)
 * con baldosas de linóleo sanitario brillante, líneas tácticas de emergencia
 * (Guía Roja a Paro Cardíaco / Cama 02 y Guía Verde a Farmacia / Cama 01)
 * y marcadores estarcidos de estacionamiento de camillas y carros.
 */
export function getHospitalFloorTacticalTexture(): THREE.Texture {
  const key = 'hospital_floor_tactical_v3';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Base: Suelo clínico de linóleo sanitario azul pizarra oscuro (Anti-reflejo y anti-destellos)
  ctx.fillStyle = '#1c2331';
  ctx.fillRect(0, 0, 1024, 1024);

  // Moteado sutil de terrazo sanitario suave (mate, sin sobreexposición)
  for (let i = 0; i < 800; i++) {
    const fx = Math.random() * 1024;
    const fy = Math.random() * 1024;
    const size = 1 + Math.random() * 2.2;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(51, 65, 85, 0.45)' : 'rgba(30, 41, 59, 0.6)';
    ctx.beginPath();
    ctx.arc(fx, fy, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Juntas de sellado higiénico entre baldosas (cuadrícula de 64px)
  ctx.strokeStyle = '#141822';
  ctx.lineWidth = 2;
  const step = 64;
  for (let x = 0; x <= 1024; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // 2. Línea de Guía Roja: RUTA DE TRAUMA / CÓDIGO AZUL (Hacia Cama 02 y Desfibrilador)
  // Eje X = 650 (zona derecha)
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(632, 80, 20, 880);
  ctx.fillStyle = '#fca5a5';
  ctx.fillRect(639, 80, 6, 880);

  // Flechas y texto en la guía roja
  ctx.fillStyle = '#fca5a5';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  for (let y = 180; y <= 840; y += 180) {
    ctx.save();
    ctx.translate(612, y);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('▲ RUTA REANIMACIÓN [200J]', 0, 0);
    ctx.restore();
  }

  // 3. Línea de Guía Verde: RUTA DE FARMACIA & MEDICACIÓN (Hacia Farmacia y Cama 01)
  // Eje X = 390 (zona izquierda)
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(372, 80, 20, 880);
  ctx.fillStyle = '#86efac';
  ctx.fillRect(379, 80, 6, 880);

  // Flechas y texto en la guía verde
  ctx.fillStyle = '#86efac';
  ctx.font = 'bold 14px monospace';
  for (let y = 180; y <= 840; y += 180) {
    ctx.save();
    ctx.translate(414, y);
    ctx.rotate(Math.PI / 2);
    ctx.fillText('▲ RUTA FARMACIA / INYECCIÓN', 0, 0);
    ctx.restore();
  }

  // 4. Franjas de Advertencia de Peligro Biológico (Zona Contaminada Central)
  // Perímetro rectangular central
  ctx.save();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 10;
  ctx.setLineDash([20, 14]);
  ctx.strokeRect(320, 220, 384, 280);
  ctx.restore();

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚠ ZONA BIOLÓGICA • DESINFECCIÓN REQUERIDA ⚠', 512, 210);

  // 5. Bahías Estarcidas de Camilla (Bed Parking Bays)
  // Cama 01 (Izquierda: X=180..320, Y=440..740)
  ctx.fillStyle = 'rgba(14, 165, 233, 0.08)';
  ctx.fillRect(160, 420, 180, 320);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 4;
  ctx.strokeRect(160, 420, 180, 320);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 17px monospace';
  ctx.fillText('ESTACIÓN 01', 250, 455);
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('CAMA PACIENTE [TRIAGE]', 250, 480);

  // Cama 02 (Derecha: X=704..884, Y=420..740)
  ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
  ctx.fillRect(684, 420, 180, 320);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 4;
  ctx.strokeRect(684, 420, 180, 320);

  ctx.fillStyle = '#f87171';
  ctx.font = 'bold 17px monospace';
  ctx.fillText('ESTACIÓN 02', 774, 455);
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#fca5a5';
  ctx.fillText('CAMA TRAUMA [CÓDIGO AZUL]', 774, 480);

  // 6. Emblema Circular Central Hospitalario
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(512, 680, 88, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(512, 680, 84, 0, Math.PI * 2);
  ctx.stroke();

  // Cruz médica central
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(500, 624, 24, 112);
  ctx.fillRect(456, 668, 112, 24);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('CENTRO DE TRAUMA & URGENCIAS', 512, 790);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

/**
 * Crea una pantalla de desfibrilador dinámicamente animada en tiempo real.
 * Renderiza el ritmo cardíaco (Fibrilación Ventricular en Paro, Sinusal en Estable),
 * capacitor de carga a 200J y frecuencia cardíaca.
 */
export function createAnimatedDefibScreen() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const update = (simTime: number, isCardiacArrest: boolean) => {
    // Fondo de tubo de rayos catódicos con retícula
    ctx.fillStyle = '#040711';
    ctx.fillRect(0, 0, 512, 256);

    // Retícula verde/azul del osciloscopio
    ctx.strokeStyle = '#0e1c2d';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y <= 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Cabecera superior
    ctx.fillStyle = isCardiacArrest ? '#7f1d1d' : '#064e3b';
    ctx.fillRect(12, 10, 488, 28);
    ctx.fillStyle = isCardiacArrest ? '#fca5a5' : '#6ee7b7';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(
      isCardiacArrest
        ? '● ALERTA: FIBRILACIÓN VENTRICULAR DETECTADA • DESCARGA RECOMENDADA'
        : '● MODO MONITOR: RITMO CARDÍACO REGULAR • ENERGÍA SELECCIONADA',
      24,
      28
    );

    // Indicador grande de Joules
    ctx.fillStyle = isCardiacArrest ? '#ef4444' : '#38bdf8';
    ctx.font = 'bold 46px monospace';
    ctx.fillText('200 J', 24, 95);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('ENERGÍA SELECCIONADA BIFÁSICA', 24, 118);

    // Barra de estado de carga
    const chargeBlink = isCardiacArrest ? Math.sin(simTime * 12) > 0 : true;
    ctx.fillStyle = isCardiacArrest ? (chargeBlink ? '#ef4444' : '#991b1b') : '#10b981';
    ctx.fillRect(230, 56, 260, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(
      isCardiacArrest ? '⚡ CAPACITOR CARGADO (100% - LISTO)' : '✓ EN ESPERA • 200J ARMADO',
      242,
      75
    );

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText(
      isCardiacArrest ? 'IMPEDANCIA: 68 Ω (ADECUADA) • PADS CONECTADOS' : 'SPO2: 99% • FC: 74 BPM',
      230,
      112
    );

    // Trazado en tiempo real de onda cardíaca (Osciloscopio dinámico)
    ctx.lineWidth = 3;
    ctx.strokeStyle = isCardiacArrest ? '#ef4444' : '#22c55e';
    ctx.shadowColor = isCardiacArrest ? '#ef4444' : '#22c55e';
    ctx.shadowBlur = 8;
    ctx.beginPath();

    const waveY = 190;
    const scrollOffset = (simTime * 180) % 512;

    for (let x = 0; x < 512; x += 4) {
      const sampleX = (x + scrollOffset) * 0.045;
      let yOffset = 0;

      if (isCardiacArrest) {
        // Ventricular Fibrillation (caótica y desordenada)
        yOffset =
          Math.sin(sampleX * 4.2) * 26 +
          Math.sin(sampleX * 9.5) * 14 +
          Math.cos(sampleX * 17.2) * 8;
      } else {
        // Ritmo Sinusal Normal con complejo QRS
        const phase = sampleX % 6;
        if (phase < 0.6) yOffset = Math.sin((phase / 0.6) * Math.PI) * 7; // Onda P
        else if (phase >= 1.0 && phase < 1.2) yOffset = -8; // Onda Q
        else if (phase >= 1.2 && phase < 1.5) yOffset = 42; // Pico R
        else if (phase >= 1.5 && phase < 1.7) yOffset = -14; // Onda S
        else if (phase >= 2.2 && phase < 3.0) yOffset = Math.sin(((phase - 2.2) / 0.8) * Math.PI) * 12; // Onda T
      }

      const drawY = waveY - yOffset;
      if (x === 0) ctx.moveTo(x, drawY);
      else ctx.lineTo(x, drawY);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    texture.needsUpdate = true;
  };

  return { texture, update };
}

/**
 * Textura procedural para Rótulos Luminosos de Departamentos Hospitalarios
 */
export function getDepartmentSignTexture(
  index: number,
  title: string,
  capacity: string,
  accentColor: string
): THREE.Texture {
  const cacheKey = `dept_sign_${index}_${accentColor}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  // Fondo panel oscuro metálico
  ctx.fillStyle = '#0a0d16';
  ctx.fillRect(0, 0, 512, 160);

  // Borde exterior
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 504, 152);

  // Barra de acento lateral según departamento
  ctx.fillStyle = accentColor;
  ctx.fillRect(6, 6, 14, 148);

  // Badge numérico
  ctx.fillStyle = accentColor;
  ctx.fillRect(32, 22, 38, 38);
  ctx.fillStyle = '#0a0d16';
  ctx.font = 'black 26px sans-serif';
  ctx.fillText(`${index}`, 42, 51);

  // Título Principal del Departamento
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(title.toUpperCase(), 80, 48);

  // Subtítulo con Capacidad y Flujo
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 13px monospace';
  ctx.fillText(capacity.toUpperCase(), 34, 96);

  // Barra inferior con indicador LED
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(34, 118, 444, 22);

  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(48, 129, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('ESTADO: ACTIVO • ENLACE RADIAL A CORREDOR CENTRAL', 62, 133);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Textura procedural para Pantalla de Kiosco EMR/HIS de Admisión & Triaje
 */
export function getTriageScreenTexture(): THREE.Texture {
  if (textureCache.has('triage_emr_screen')) return textureCache.get('triage_emr_screen')!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 340;
  const ctx = canvas.getContext('2d')!;

  // Fondo pantalla clínica digital
  ctx.fillStyle = '#080d1a';
  ctx.fillRect(0, 0, 512, 340);

  // Barra superior
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, 512, 42);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('SISTEMA EMR/HIS • TRIAJE MANCHESTER V4', 20, 27);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('ONLINE', 440, 27);

  // Panel de Espera y Admisión
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(18, 56, 476, 110);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(18, 56, 476, 110);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('SALA DE ADMISIÓN (CAPACIDAD: 6 PACIENTES)', 32, 82);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px monospace';
  ctx.fillText('• PACIENTES EN ESPERA DE TRIAJE: 3 / 6', 32, 108);
  ctx.fillText('• TIEMPO MEDIO DE INGRESO: 15-30s (POR OLEADA)', 32, 128);
  ctx.fillText('• CLASIFICACIÓN VITAL: SpO2, FC, TEMP INFRARROJA', 32, 148);

  // Dos columnas de derivación
  // Derivación 1: Reanimación
  ctx.fillStyle = '#1c0e14';
  ctx.fillRect(18, 180, 230, 138);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1;
  ctx.strokeRect(18, 180, 230, 138);

  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('PRIORIDAD 1 (ROJO) -> REANIMACIÓN', 26, 204);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '10px monospace';
  ctx.fillText('Colapso hemodinámico', 26, 226);
  ctx.fillText('Paro cardíaco inminente', 26, 244);
  ctx.fillText('Destino: Camillas 01 & 02', 26, 262);
  ctx.fillStyle = '#f87171';
  ctx.fillText('Tiempo Límite: 30-45s', 26, 286);

  // Derivación 2: Tratamiento Estándar
  ctx.fillStyle = '#061c14';
  ctx.fillRect(264, 180, 230, 138);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1;
  ctx.strokeRect(264, 180, 230, 138);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('PRIORIDAD 3 (VERDE) -> CUBÍCULOS', 272, 204);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '10px monospace';
  ctx.fillText('Neumonía bacteriana', 272, 226);
  ctx.fillText('Deshidratación aguda', 272, 244);
  ctx.fillText('Destino: Cubículos 01-04', 272, 262);
  ctx.fillStyle = '#34d399';
  ctx.fillText('Resolución: 60-90s', 272, 286);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set('triage_emr_screen', texture);
  return texture;
}

/**
 * Textura procedural para Dispensador Automatizado Pyxis de Farmacia
 */
export function getPyxisScreenTexture(restockSecondsLeft: number): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;

  // Fondo gabinete Pyxis digital
  ctx.fillStyle = '#0c111d';
  ctx.fillRect(0, 0, 512, 300);

  // Encabezado
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 0, 512, 40);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('PYXIS MEDSTATION 4000 • FARMACIA CENTRAL', 18, 26);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`CICLO: ${restockSecondsLeft}s`, 420, 26);

  // Medicamentos en stock
  const meds = [
    { name: 'EPINEFRINA 1mg/mL (Ampollas)', status: 'DISPONIBLE', col: '#ef4444', stock: '8 / 8' },
    { name: 'SUERO SALINO 0.9% (Bolsas 500mL)', status: 'DISPONIBLE', col: '#0284c7', stock: '12 / 12' },
    { name: 'ANTIBIÓTICOS IV (Cefazolina 1g)', status: 'DISPONIBLE', col: '#10b981', stock: '6 / 6' },
  ];

  meds.forEach((m, idx) => {
    const y = 60 + idx * 64;
    ctx.fillStyle = '#161e2e';
    ctx.fillRect(18, y, 476, 52);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(18, y, 476, 52);

    ctx.fillStyle = m.col;
    ctx.fillRect(22, y + 6, 8, 40);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(m.name, 42, y + 26);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText(`STOCK: ${m.stock} • BLOQUEO SEGURIDAD: DESACTIVADO`, 42, y + 42);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(m.status, 395, y + 32);
  });

  // Barra de reposición dinámica
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(18, 258, 476, 26);

  const pct = Math.max(0, Math.min(1, (20 - restockSecondsLeft) / 20));
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(18, 258, 476 * pct, 26);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`REABASTECIMIENTO DINÁMICO ACTIVO: ${restockSecondsLeft}s PARA PRÓXIMO CICLO`, 40, 275);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}




