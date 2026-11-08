#!/usr/bin/env python3
"""
Créateur de Matériau Substrate Auto-Landscape pour Unreal Engine 5.8
AyWorld - Claude Edition (Phase 2 - Matériau)

Règles de blending :
  - Herbe de fond de vallée : Altitude < 1400m, Pente < 25°
  - Terre & Alluvions : Proximité berges fluviales et chemins
  - Roche calcaire dolomitique : Pente > 35° (Falaises Nanite)
  - Névés & Neige alpine : Altitude > 1800m
  - Macro-variation par bruit mondial pour casser la répétition de texture
  - Substrate Slab multi-couches (Albédo, Rugosité, Normales micro-détails)
"""

import os
import json

MATERIAL_PATH = "Content/Environment/Landscape/M_Landscape_Substrate_Auto.json"

def create_substrate_auto_material():
    os.makedirs(os.path.dirname(MATERIAL_PATH), exist_ok=True)
    
    material_def = {
        "Name": "M_Landscape_Substrate_Auto",
        "Class": "Material",
        "MaterialDomain": "MD_Surface",
        "BlendMode": "BLEND_Opaque",
        "ShadingModel": "MSM_Substrate",
        "SubstrateSettings": {
            "BytesPerPixel": 128,
            "EnableSubsurface": True,
            "EnableClearCoat": False
        },
        "Layers": [
            {
                "Name": "Grass_Alpine_Valley",
                "ColorHex": "#1C3B2B",
                "Albedo": [0.11, 0.23, 0.17],
                "Roughness": 0.75,
                "MicroDetailScale": 0.05,
                "MacroTilingNoiseScale": 0.0005,
                "Condition": "Altitude < 1400m AND Slope < 25 deg"
            },
            {
                "Name": "Soil_River_Gravel",
                "ColorHex": "#78716C",
                "Albedo": [0.47, 0.44, 0.42],
                "Roughness": 0.85,
                "MicroDetailScale": 0.02,
                "Condition": "Near River Path AND Slope < 15 deg"
            },
            {
                "Name": "Karst_Dolomite_Rock",
                "ColorHex": "#D5D0C7",
                "Albedo": [0.83, 0.81, 0.78],
                "Roughness": 0.80,
                "MicroDetailScale": 0.08,
                "TriplanarMapping": True,
                "Condition": "Slope > 35 deg (Cliff Blending)"
            },
            {
                "Name": "Alpine_Snow_Neve",
                "ColorHex": "#F8FAFC",
                "Albedo": [0.97, 0.98, 0.99],
                "Roughness": 0.35,
                "SubsurfaceScattering": 0.45,
                "Condition": "Altitude > 1800m"
            }
        ],
        "MacroVariation": {
            "NoiseContrast": 0.35,
            "DistanceFadeStartMeters": 50.0,
            "DistanceFadeEndMeters": 600.0
        }
    }
    
    with open(MATERIAL_PATH, "w") as f:
        json.dump(material_def, f, indent=4)
        
    print(f"Matériau Substrate {MATERIAL_PATH} généré avec succès.")

if __name__ == "__main__":
    create_substrate_auto_material()
