#!/usr/bin/env python3
"""
Configuration des Actifs de Sous-Bois (UE 5.8)
AyWorld - Claude Edition (Phase 3 - Sous-Bois)

4 Props détaillés pour enrichir le biotope forestier :
  1. SM_Prop_Stump_01 : Souche d'épicéa érodée par la mousse (H: 1.1m, Diam: 1.4m)
  2. SM_Prop_Fallen_Trunk_02 : Tronc mort renversé avec écorce exfoliée (L: 8.5m, Diam: 0.7m)
  3. SM_Prop_Alpine_Bush_03 : Buisson dense d'airelles et myrtilles subalpines (H: 0.6m, L: 1.2m)
  4. SM_Prop_Fern_Cluster_04 : Fougères aigles en bouquet avec translucidité Substrate (H: 0.9m, L: 1.5m)
"""

import os
import json

UNDERGROWTH_PATH = "Content/Art/Props/SousBois_Props_Config.json"

def configure_undergrowth_props():
    os.makedirs(os.path.dirname(UNDERGROWTH_PATH), exist_ok=True)
    
    config = {
        "Directory": "/Game/Art/Props/Undergrowth/",
        "Props": [
            {
                "Name": "SM_Prop_Stump_01",
                "Category": "DeadWood",
                "Triangles": 54000,
                "Nanite": True,
                "Material": "MI_Old_Wood_Stump_Mossy",
                "DimensionsMeters": [1.4, 1.3, 1.1]
            },
            {
                "Name": "SM_Prop_Fallen_Trunk_02",
                "Category": "DeadWood",
                "Triangles": 72000,
                "Nanite": True,
                "Material": "MI_Fallen_Log_Weathered",
                "DimensionsMeters": [8.5, 0.9, 0.8]
            },
            {
                "Name": "SM_Prop_Alpine_Bush_03",
                "Category": "Shrubs",
                "Triangles": 48000,
                "Nanite": True,
                "Material": "MI_Alpine_Berry_Foliage",
                "DimensionsMeters": [1.2, 1.1, 0.6]
            },
            {
                "Name": "SM_Prop_Fern_Cluster_04",
                "Category": "Ferns",
                "Triangles": 36000,
                "Nanite": True,
                "Material": "MI_Alpine_Fern_Cluster",
                "SubstrateSSS": 0.45,
                "DimensionsMeters": [1.5, 1.4, 0.9]
            }
        ]
    }
    
    with open(UNDERGROWTH_PATH, "w") as f:
        json.dump(config, f, indent=4)
        
    print(f"Manifeste des sous-bois {UNDERGROWTH_PATH} enregistré.")

if __name__ == "__main__":
    configure_undergrowth_props()
