#!/usr/bin/env python3
"""
Configuration du Système d'Eau (Water Plugin UE 5.8)
AyWorld - Claude Edition (Phase 2 - Rivière & Lac)

Acteurs :
  - WaterBodyRiver : Spline suivant le fond de vallée d'Est en Ouest
  - Largeur variable : 6 m en amont (gorges), 14 m en plaine
  - Creusement automatique du Landscape (bAffectsLandscape = True)
  - Vitesse d'écoulement et écume paramétrées
  - WaterBodyLake : Lac glaciaire sur le replat supérieur (Est)
"""

import os
import json

RIVER_CONFIG_PATH = "Content/Environment/Water/Water_River_Config.json"

def configure_river_water():
    os.makedirs(os.path.dirname(RIVER_CONFIG_PATH), exist_ok=True)
    
    water_config = {
        "River": {
            "ActorClass": "WaterBodyRiver",
            "Name": "WaterBodyRiver_MainValley",
            "SplinePointsCount": 8,
            "Direction": "EastToWest",
            "StartLocation": [900.0, 1100.0, 320.0],
            "EndLocation": [-950.0, 980.0, 110.0],
            "WidthProfileMeters": {
                "Upstream": 6.5,
                "Midstream": 10.0,
                "Downstream": 14.2
            },
            "LandscapeCarving": {
                "bAffectsLandscape": True,
                "CarveDepthMeters": 1.4,
                "BankWidthMeters": 4.0,
                "FalloffSettings": {
                    "ChannelDepth": 1.8,
                    "EdgeOffset": 2.5
                }
            },
            "SimulationParameters": {
                "CurrentSpeedMetersPerSec": 2.4,
                "ShallowColorHex": "#2FA4A9",
                "DeepColorHex": "#0E7490",
                "WaterClarityDistanceMeters": 8.5,
                "FoamAmount": 0.35,
                "WaveRoughness": 0.28
            }
        },
        "Lake": {
            "ActorClass": "WaterBodyLake",
            "Name": "WaterBodyLake_HighPlateau",
            "CenterLocation": [520.0, 1080.0, 290.0],
            "RadiusMeters": 65.0,
            "WaterElevationMeters": 288.5,
            "bAffectsLandscape": True,
            "ClarityMeters": 12.0,
            "ColorHex": "#155E75"
        }
    }
    
    with open(RIVER_CONFIG_PATH, "w") as f:
        json.dump(water_config, f, indent=4)
        
    print(f"Configuration du plugin Water {RIVER_CONFIG_PATH} enregistrée.")

if __name__ == "__main__":
    configure_river_water()
