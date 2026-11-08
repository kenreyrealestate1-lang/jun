#!/usr/bin/env python3
"""
Configuration du Système Végétal Procedural Foliage (UE 5.8)
AyWorld - Claude Edition (Phase 3 - Arbres & Végétation)

3 espèces avec 3 variations d'âge chacune (9 modèles) :
  1. Épicéa commun (Picea abies) : Jeune (8m), Adulte (22m), Vénérable (34m)
  2. Mélèze d'Europe (Larix decidua) : Jeune (7m), Adulte (18m), Vénérable (28m)
  3. Hêtre commun (Fagus sylvatica) : Baliveau (6m), Adulte (19m), Arbre Cathédrale (27m)

Caractéristiques techniques :
  - Géométrie Nanite sur les troncs et grosses branches
  - Matériau Substrate Foliage avec diffusion sous-surfacique (SSS 0.35)
  - Animation de vent hiérarchique World Position Offset (WPO)
"""

import os
import json

TREES_CONFIG_PATH = "Content/Environment/Foliage/PVE_Alpine_Trees.json"

def configure_alpine_trees():
    os.makedirs(os.path.dirname(TREES_CONFIG_PATH), exist_ok=True)
    
    config = {
        "FoliageSystem": "ProceduralFoliageEditor",
        "WindSimulation": {
            "Method": "Substrate_Hierarchical_WPO",
            "MainTrunkBending": 0.08,
            "BranchFlutter": 0.22,
            "LeafRustleFrequency": 3.8
        },
        "Species": [
            {
                "Name": "Epicea_Commun",
                "LatinName": "Picea abies",
                "Type": "Conifer_Evergreen",
                "SubstrateSSS": 0.15,
                "AltitudeRangeMeters": [900.0, 2050.0],
                "PreferredAspect": ["North", "NorthEast", "ValleyFloor"],
                "Variations": [
                    {"ID": "SM_Tree_Epicea_Young", "HeightMeters": 8.5, "CanopyRadiusMeters": 2.2, "Nanite": True, "Triangles": 42000},
                    {"ID": "SM_Tree_Epicea_Adult", "HeightMeters": 22.0, "CanopyRadiusMeters": 4.5, "Nanite": True, "Triangles": 88000},
                    {"ID": "SM_Tree_Epicea_Old", "HeightMeters": 34.0, "CanopyRadiusMeters": 6.8, "Nanite": True, "Triangles": 135000}
                ]
            },
            {
                "Name": "Meleze_Europe",
                "LatinName": "Larix decidua",
                "Type": "Conifer_Deciduous",
                "SubstrateSSS": 0.28,
                "AutumnGoldenToneHex": "#F59E0B",
                "AltitudeRangeMeters": [1200.0, 2100.0],
                "PreferredAspect": ["South", "West", "RockyRidges"],
                "Variations": [
                    {"ID": "SM_Tree_Meleze_Young", "HeightMeters": 7.0, "CanopyRadiusMeters": 2.0, "Nanite": True, "Triangles": 38000},
                    {"ID": "SM_Tree_Meleze_Adult", "HeightMeters": 18.5, "CanopyRadiusMeters": 4.2, "Nanite": True, "Triangles": 79000},
                    {"ID": "SM_Tree_Meleze_Old", "HeightMeters": 28.0, "CanopyRadiusMeters": 6.2, "Nanite": True, "Triangles": 128000}
                ]
            },
            {
                "Name": "Hetre_Commun",
                "LatinName": "Fagus sylvatica",
                "Type": "Broadleaf_Deciduous",
                "SubstrateSSS": 0.42,
                "SilverBarkRoughness": 0.45,
                "AltitudeRangeMeters": [850.0, 1450.0],
                "PreferredAspect": ["ValleyFloor", "RiverBanks", "LowerSlopes"],
                "Variations": [
                    {"ID": "SM_Tree_Hetre_Young", "HeightMeters": 6.2, "CanopyRadiusMeters": 2.8, "Nanite": True, "Triangles": 34000},
                    {"ID": "SM_Tree_Hetre_Adult", "HeightMeters": 19.0, "CanopyRadiusMeters": 5.8, "Nanite": True, "Triangles": 92000},
                    {"ID": "SM_Tree_Hetre_Old", "HeightMeters": 27.5, "CanopyRadiusMeters": 8.5, "Nanite": True, "Triangles": 142000}
                ]
            }
        ]
    }
    
    with open(TREES_CONFIG_PATH, "w") as f:
        json.dump(config, f, indent=4)
        
    print(f"Configuration PVE des arbres {TREES_CONFIG_PATH} enregistrée.")

if __name__ == "__main__":
    configure_alpine_trees()
