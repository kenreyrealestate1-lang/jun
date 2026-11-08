/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Party Game Stylized Color Grading & Ambient Occlusion Shader
 * Designed for Hospital Overcooked-style visual identity:
 * - High vibrance and saturation (+28%)
 * - Punchy contrast with filmic S-curve (+16%)
 * - Soft edge vignette and simulated contact ambient occlusion (depth & grounding)
 * - Dynamic Emergency Tension Alarm wash: pulsing red-blue emergency tint during Code Blue
 * - Subtle chromatic aberration during intense defibrillator shock and resuscitation tension
 */
export const PartyGamePostProcessShader = {
  name: 'PartyGamePostProcessShader',
  uniforms: {
    tDiffuse: { value: null },
    uContrast: { value: 1.05 },
    uSaturation: { value: 1.15 },
    uBrightness: { value: 0.98 },
    uVignette: { value: 0.28 },
    uAmbientOcclusion: { value: 0.20 },
    uEmergencyTension: { value: 0.0 }, // 0.0 (Normal) to 1.0 (Code Blue Alarm)
    uAlarmStrobeTone: { value: 0.0 },  // Alternating -1.0 (Red Alert) to +1.0 (Soft Cyan Blue)
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uContrast;
    uniform float uSaturation;
    uniform float uBrightness;
    uniform float uVignette;
    uniform float uAmbientOcclusion;
    uniform float uEmergencyTension;
    uniform float uAlarmStrobeTone;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;

      // 1. Subtle chromatic edge fringe during intense Code Blue emergency
      vec4 baseColor;
      if (uEmergencyTension > 0.05) {
        float chromOffset = 0.0020 * uEmergencyTension;
        float r = texture2D(tDiffuse, uv + vec2(chromOffset, 0.0)).r;
        float g = texture2D(tDiffuse, uv).g;
        float b = texture2D(tDiffuse, uv - vec2(chromOffset, 0.0)).b;
        baseColor = vec4(r, g, b, 1.0);
      } else {
        baseColor = texture2D(tDiffuse, uv);
      }

      vec3 color = baseColor.rgb;

      // 2. Brightness & Contrast curve (Balanced, anti-glare, pristine clarity)
      color *= uBrightness;
      color = (color - 0.5) * uContrast + 0.5;

      // 3. Vibrance & Saturation Boost (Party Game Medical Palette)
      float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(vec3(luminance), color, uSaturation);

      // 4. Stylized Lift & Clinical Clean Highlights
      color.r = mix(color.r, pow(max(color.r, 0.0), 0.98), 0.3);
      color.b = mix(color.b, pow(max(color.b, 0.0), 0.96) * 1.02, 0.3);

      // 5. Emergency Tension Alarm Wash (Transparent tint that preserves full visibility & playability)
      if (uEmergencyTension > 0.01) {
        // -1.0 = Emergency Red Alert, +1.0 = High-Tension Soft Blue
        vec3 redAlert = vec3(1.0, 0.25, 0.25);
        vec3 softBlueAlert = vec3(0.25, 0.70, 1.0);
        vec3 alarmColor = mix(redAlert, softBlueAlert, clamp((uAlarmStrobeTone + 1.0) * 0.5, 0.0, 1.0));
        float alarmStrength = abs(uAlarmStrobeTone) * 0.22 * uEmergencyTension;
        // Modulación cromática transparente: nunca quema a blanco
        color = mix(color, color * (0.84 + alarmColor * 0.34), alarmStrength);
      }

      // 6. Ambient Occlusion & Corner Falloff (Simulated Screen-Space Contact Depth)
      vec2 coord = (uv - 0.5) * 2.0;
      float distSq = dot(coord, coord);

      // Soft vignette centering focus on the medical emergency action
      float vig = clamp(1.0 - distSq * uVignette, 0.0, 1.0);
      color *= (0.84 + 0.16 * vig);

      // Stylized ambient contact darkening around borders and crevices
      float ao = clamp(1.0 - pow(distSq * 0.5, 2.0) * uAmbientOcclusion, 0.0, 1.0);
      color *= ao;

      gl_FragColor = vec4(clamp(color, 0.0, 1.0), baseColor.a);
    }
  `
};
