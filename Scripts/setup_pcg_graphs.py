#!/usr/bin/env python3
"""
Génération des Graphes PCG (Procedural Content Generation UE 5.8)
AyWorld - Claude Edition (Phase 3 - PCG)

Graphes :
  1. PCG_Biome_Forest :
     - Densité des arbres selon pente (5°-32°) et altitude (850m-2050m)
     - Exclusion absolue : pas d'arbres dans l'eau (spline WaterBodyRiver) ni > 2 100 m
     - Clairières et prairies ouvertes préservées le long des berges
     - Répartition du sous-bois (souches, troncs, fougères, buissons) sous la canopée
     - Sentier pédestre dégagé de 3.5 m de largeur reliant le Belvédère au Lac
  2. PCG_Rocks_Cliffs :
     - Détection des zones à forte déclivité (> 38°)
     - Placement instancié des falaises et aiguilles calcaires
"""

import os
import json

PCG_FOREST_PATH = "Content/Environment/PCG/PCG_Biome_Forest.json"
PCG_CLIFFS_PATH = "Content/Environment/PCG/PCG_Rocks_Cliffs.json"

def configure_pcg_graphs():
    os.makedirs(os.path.dirname(PCG_FOREST_PATH), exist_ok=True)
    
    forest_graph = {
        "GraphName": "PCG_Biome_Forest",
        "TargetActor": "Landscape_Alpine_Valley",
        "InputData": [
            {"Type": "Landscape", "Name": "LandscapeData"},
            {"Type": "Spline", "Name": "RiverExclusionSpline", "BufferMeters": 12.0},
            {"Type": "Spline", "Name": "TrailPathSpline", "ClearanceRadiusMeters": 3.5}
        ],
        "FilterNodes": [
            {
                "Node": "AltitudeRangeFilter",
                "MinAltitudeMeters": 850.0,
                "MaxAltitudeMeters": 2100.0, # Règle : aucun arbre au-dessus de 2100m
                "StrictCutoff": True
            },
            {
                "Node": "SlopeAngleFilter",
                "MinSlopeDeg": 2.0,
                "MaxSlopeDeg": 34.0, # Au-delà, place aux roches nues
                "FalloffRange": 4.0
            },
            {
                "Node": "DifferenceRiverWater",
                "Source": "TreePoints",
                "Difference": "RiverExclusionSpline",
                "Mode": "Subtract"
            },
            {
                "Node": "DifferenceWalkingTrail",
                "Source": "TreePoints",
                "Difference": "TrailPathSpline",
                "Mode": "Subtract"
            }
        ],
        "SpawnRules": {
            "Trees": {
                "DensityPerHectare": 420,
                "SpeciesRatio": {
                    "Epicea_Commun": 0.55,
                    "Meleze_Europe": 0.30,
                    "Hetre_Commun": 0.15
                },
                "ScaleRange": [0.85, 1.25],
                "RandomYawRotation": [0.0, 360.0],
                "AlignToSurfaceNormal": 0.25 # Les arbres alpins poussent principalement verticaux
            },
            "Undergrowth": {
                "ParentRequirement": "InsideTreeCanopyRadius",
                "PropsPerTree": [1, 3],
                "Items": ["SM_Prop_Stump_01", "SM_Prop_Fallen_Trunk_02", "SM_Prop_Alpine_Bush_03", "SM_Prop_Fern_Cluster_04"]
            },
            "LooseBoulders": {
                "SlopeTriggerMinDeg": 22.0,
                "SlopeTriggerMaxDeg": 38.0,
                "Items": ["SM_Rock_Karst_Boulder_01", "SM_Rock_Forest_Moss_03", "SM_Rock_Cliff_Fragment_04"]
            }
        }
    }
    
    cliffs_graph = {
        "GraphName": "PCG_Rocks_Cliffs",
        "TargetActor": "Landscape_Alpine_Valley",
        "FilterNodes": [
            {
                "Node": "SlopeCliffFilter",
                "MinSlopeDeg": 38.0,
                "MaxSlopeDeg": 90.0
            }
        ],
        "SpawnRules": {
            "Cliffs": {
                "Items": ["SM_Karst_Cliff_Plate_01", "SM_Karst_Cliff_Tower_02"],
                "AlignToNormal": True,
                "ScaleRange": [0.9, 1.4],
                "RandomRollPitchDeg": [-8.0, 8.0]
            }
        }
    }
    
    with open(PCG_FOREST_PATH, "w") as f:
        json.dump(forest_graph, f, indent=4)
        
    with open(PCG_CLIFFS_PATH, "w") as f:
        json.dump(cliffs_graph, f, indent=4)
        
    print(f"Graphes PCG {PCG_FOREST_PATH} et {PCG_CLIFFS_PATH} configurés.")

if __name__ == "__main__":
    configure_pcg_graphs()
