#!/usr/bin/env python3
"""
Configuration de l'Éclairage Physique & Atmosphère (UE 5.8)
AyWorld - Claude Edition (Phase 2 - Ciel & Éclairage)

Composants configurés :
  - DirectionalLight : Soleil à 25° d'élévation, 75 000 lux, 4800K
  - SkyAtmosphere : Modèle photométrique de diffusion Rayleigh
  - VolumetricCloud : Couverture 35 %, altitude plancher 1.5 km
  - SkyLight : Real Time Capture active, indirect lighting multi-rebonds
  - ExponentialHeightFog : Brume volumétrique douce en fond de vallée
  - SunPositionCalculator : Coordonnées alpines (45.2°N), mi-septembre, 16h30
  - PostProcessVolume (Unbound) : ACES tonemapper, exposition manuelle, bloom 0.15, vignette 0.15, 0 grain, 0 HDRI
"""

import os
import json

LIGHTING_CONFIG_PATH = "Content/Environment/Sky/Sky_Lighting_Config.json"

def configure_sky_lighting():
    os.makedirs(os.path.dirname(LIGHTING_CONFIG_PATH), exist_ok=True)
    
    lighting_config = {
        "DirectionalLight_Sun": {
            "Mobility": "Movable",
            "IntensityLux": 75000.0,
            "LightColorTempKelvin": 4800.0,
            "SolarElevationDeg": 25.0,
            "SolarAzimuthDeg": 225.0, # Sud-Ouest
            "bAtmosphereSunLight": True,
            "AtmosphereSunLightIndex": 0,
            "SourceAngle": 0.5357, # Diamètre angulaire réel du soleil
            "DynamicShadowDistanceMovableLight": 25000.0,
            "VirtualShadowMapResolution": "High"
        },
        "SkyAtmosphere": {
            "TransformMode": "PlanetTopAtAbsoluteWorldPosition",
            "PlanetRadiusKm": 6360.0,
            "AtmosphereHeightKm": 60.0,
            "RayleighScatteringCoeff": [0.175, 0.409, 1.0],
            "RayleighExponentialDistribution": 8.0,
            "MieScatteringCoeff": [0.003996, 0.003996, 0.003996],
            "MieAbsorptionCoeff": [0.000444, 0.000444, 0.000444],
            "GroundAlbedo": [0.18, 0.22, 0.15]
        },
        "VolumetricCloud": {
            "LayerBottomAltitudeKm": 1.5,
            "LayerHeightKm": 2.5,
            "CoverageRatio": 0.35, # 35% de couverture
            "ViewDistanceKm": 25.0,
            "TracingMaxDistanceKm": 35.0,
            "ShadowTracingDistanceKm": 15.0
        },
        "SkyLight": {
            "Mobility": "Movable",
            "bRealTimeCapture": True,
            "LowerHemisphereIsBlack": False,
            "LowerHemisphereColor": [0.08, 0.10, 0.08, 1.0],
            "VolumetricScatteringIntensity": 1.25
        },
        "ExponentialHeightFog": {
            "FogDensity": 0.008,
            "FogHeightFalloff": 0.0015,
            "FogInscatteringColor": [0.72, 0.78, 0.85, 1.0],
            "bEnableVolumetricFog": True,
            "VolumetricFogScatteringDistribution": 0.25,
            "VolumetricFogAlbedo": [0.85, 0.88, 0.92, 1.0],
            "VolumetricFogExtinctionScale": 1.0,
            "VolumetricFogDistance": 18000.0
        },
        "SunPositionCalculator": {
            "Latitude": 45.2, # Alpes françaises / Vercors
            "Longitude": 5.5,
            "Timezone": 1.0, # UTC+1
            "Month": 9, # Mi-septembre
            "Day": 15,
            "Hour": 16,
            "Minute": 30,
            "Second": 0,
            "CalculatedElevation": 25.14,
            "CalculatedAzimuth": 224.8
        },
        "PostProcessVolume_Global": {
            "bUnbound": True,
            "Exposure": {
                "Method": "Manual",
                "ApplyPhysicalCameraExposure": True,
                "EV100": 14.5,
                "MinEV100": 12.0,
                "MaxEV100": 16.0
            },
            "ColorGrading": {
                "Tonemapper": "ACES",
                "Temperature": 5200.0,
                "Tint": 0.0,
                "Saturation": 1.02,
                "Contrast": 1.05
            },
            "Lens": {
                "BloomMethod": "Standard",
                "BloomIntensity": 0.15, # Faible bloom, anti-slop
                "BloomThreshold": 1.2,
                "VignetteIntensity": 0.15, # Légère vignette cinématographique
                "FilmGrainIntensity": 0.0 # Strictement aucun grain
            },
            "HDRI": {
                "bUseHDRI": False,
                "Reason": "Éclairage 100% natif physique SkyAtmosphere + DirectionalLight 25°"
            }
        }
    }
    
    with open(LIGHTING_CONFIG_PATH, "w") as f:
        json.dump(lighting_config, f, indent=4)
        
    print(f"Configuration du ciel et de l'éclairage {LIGHTING_CONFIG_PATH} enregistrée.")

if __name__ == "__main__":
    configure_sky_lighting()
