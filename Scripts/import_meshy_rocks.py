#!/usr/bin/env python3
"""
Importation & Configuration des Roches Meshy PBR (UE 5.8)
AyWorld - Claude Edition (Phase 3 - Roches & Falaises)

6 Actifs Nanite haute fidélité (100k - 150k triangles) :
  - SM_Rock_Karst_Boulder_01 (Bloc lapiazé, 2.5m)
  - SM_Rock_River_Pebble_02 (Galet fluvioglaciaire, 1.2m)
  - SM_Rock_Forest_Moss_03 (Bloc moussu de sous-bois, 3.0m)
  - SM_Rock_Cliff_Fragment_04 (Fragment stratifié, 4.0m)
  - SM_Karst_Cliff_Plate_01 (Pan de falaise dolomitique, 25m)
  - SM_Karst_Cliff_Tower_02 (Aiguille / Tour karstique, 20m)
"""

import os
import json

ROCKS_CONFIG_PATH = "Content/Art/Props/Rocks_Meshy_Config.json"

def configure_meshy_rocks():
    os.makedirs(os.path.dirname(ROCKS_CONFIG_PATH), exist_ok=True)
    
    config = {
        "SourcePipeline": "Meshy_Multi_Image_To_3D_PBR",
        "TargetDirectory": "/Game/Art/Props/Rocks/",
        "DefaultSettings": {
            "bBuildNanite": True,
            "CollisionTraceFlag": "CTF_UseComplexAsSimple",
            "AutoGenerateCollision": True,
            "CollisionComplexity": "SimplifiedConvex_32Hulls",
            "DistanceFieldResolution": 1.5
        },
        "Assets": [
            {
                "Name": "SM_Rock_Karst_Boulder_01",
                "DimensionsMeters": [2.8, 2.4, 2.5],
                "Triangles": 115000,
                "TextureResolution": "2K",
                "SubstrateMaterial": "MI_Karst_Boulder_Lapiaz"
            },
            {
                "Name": "SM_Rock_River_Pebble_02",
                "DimensionsMeters": [1.4, 1.1, 1.2],
                "Triangles": 102000,
                "TextureResolution": "2K",
                "SubstrateMaterial": "MI_River_Pebble_Wet"
            },
            {
                "Name": "SM_Rock_Forest_Moss_03",
                "DimensionsMeters": [3.2, 2.9, 3.0],
                "Triangles": 125000,
                "TextureResolution": "2K",
                "SubstrateMaterial": "MI_Forest_Rock_Mossy"
            },
            {
                "Name": "SM_Rock_Cliff_Fragment_04",
                "DimensionsMeters": [4.5, 3.8, 4.0],
                "Triangles": 138000,
                "TextureResolution": "2K",
                "SubstrateMaterial": "MI_Cliff_Fragment_Stratified"
            },
            {
                "Name": "SM_Karst_Cliff_Plate_01",
                "DimensionsMeters": [28.0, 12.0, 25.0],
                "Triangles": 148000,
                "TextureResolution": "2K",
                "SubstrateMaterial": "MI_Dolomite_Cliff_Wall"
            },
            {
                "Name": "SM_Karst_Cliff_Tower_02",
                "DimensionsMeters": [14.0, 11.0, 20.0],
                "Triangles": 142000,
                "TextureResolution": "2K",
                "SubstrateMaterial": "MI_Dolomite_Spire_Tower"
            }
        ]
    }
    
    with open(ROCKS_CONFIG_PATH, "w") as f:
        json.dump(config, f, indent=4)
        
    print(f"Manifeste des roches Meshy {ROCKS_CONFIG_PATH} créé.")

if __name__ == "__main__":
    configure_meshy_rocks()
