#!/usr/bin/env python3
"""
Génération & Assemblage de la Carte Alpine L_World (Unreal Engine 5.8)
AyWorld - Claude Edition (Phase 2 - Assemblage L_World)

Fonctionnalités :
  1. Création de la carte World Partition : /Game/Maps/L_World
  2. Création et configuration de l'acteur ALandscape (2017x2017, Nanite activé, Edit Layers activé)
  3. Assignation du matériau Substrate M_Landscape_Substrate_Auto
  4. Spawning des acteurs d'environnement :
     - WaterBodyRiver (Spline Est -> Ouest, creusement activé)
     - WaterBodyLake (Replat supérieur)
     - DirectionalLight (Soleil 25°, 75 000 lux, 4800K)
     - SkyAtmosphere & VolumetricCloud (35% couverture)
     - SkyLight (Real Time Capture)
     - ExponentialHeightFog (Brume volumétrique de vallée)
     - SunPositionCalculator (45.2°N, mi-septembre, 16h30)
     - PostProcessVolume Unbound (ACES, EV100 14.5, 0 bloom excessif, 0 HDRI)
  5. Caméras cinématiques de review :
     - Cam_Valley_Overview
     - Cam_River_EyeLevel
     - Cam_Forest_Canopy
     - Cam_Mountain_Peaks
"""

import os
import json

MAP_CONFIG_PATH = "Content/Maps/L_World_Setup.json"

def generate_l_world_config():
    os.makedirs(os.path.dirname(MAP_CONFIG_PATH), exist_ok=True)
    
    config = {
        "MapName": "L_World",
        "PackagePath": "/Game/Maps/L_World",
        "WorldPartition": {
            "bEnable": True,
            "GridSizeMeters": 256.0,
            "LoadingRangeMeters": 1500.0
        },
        "Landscape": {
            "ActorName": "Landscape_Alpine_Valley",
            "HeightmapFile": "Content/Environment/Landscape/Heightmap_Alpine_2017.r16",
            "Resolution": [2017, 2017],
            "Scale": [100.0, 100.0, 150.0],
            "Location": [-100800.0, -100800.0, 0.0],
            "NaniteEnabled": True,
            "EditLayersEnabled": True,
            "Material": "/Game/Environment/Landscape/M_Landscape_Substrate_Auto"
        },
        "Water": {
            "River": "/Game/Environment/Water/WaterBodyRiver_MainValley",
            "Lake": "/Game/Environment/Water/WaterBodyLake_HighPlateau"
        },
        "LightingAndAtmosphere": {
            "SunElevation": 25.0,
            "SunAzimuth": 225.0,
            "SunIntensityLux": 75000.0,
            "ColorTemperature": 4800.0,
            "CloudCoverage": 0.35,
            "VolumetricFog": True,
            "Tonemapper": "ACES",
            "EV100": 14.5,
            "UseHDRI": False
        },
        "ReviewCameras": [
            {
                "Name": "Cam_Valley_Overview",
                "Location": [85000.0, -45000.0, 65000.0],
                "Rotation": [-22.0, -145.0, 0.0],
                "FocalLength": 35.0,
                "Description": "Vue plongeante d'ensemble sur le massif nord, la vallée en U et le méandre de la rivière"
            },
            {
                "Name": "Cam_River_EyeLevel",
                "Location": [-15000.0, 8000.0, 14500.0],
                "Rotation": [-4.0, 78.0, 0.0],
                "FocalLength": 50.0,
                "Description": "Vue au ras de l'eau turquoise avec reflets Lumen et galets de berge"
            },
            {
                "Name": "Cam_Forest_Canopy",
                "Location": [25000.0, 32000.0, 22000.0],
                "Rotation": [12.0, -60.0, 0.0],
                "FocalLength": 40.0,
                "Description": "Vue en sous-bois d'épicéas et de mélèzes sous lumière rasante à 25°"
            },
            {
                "Name": "Cam_Mountain_Peaks",
                "Location": [-30000.0, -60000.0, 35000.0],
                "Rotation": [28.0, 45.0, 0.0],
                "FocalLength": 65.0,
                "Description": "Vue ascendante sur les cimes dolomitiques et la Sky Atmosphere"
            }
        ]
    }
    
    with open(MAP_CONFIG_PATH, "w") as f:
        json.dump(config, f, indent=4)
        
    print(f"Plan d'assemblage {MAP_CONFIG_PATH} généré.")

if __name__ == "__main__":
    generate_l_world_config()
