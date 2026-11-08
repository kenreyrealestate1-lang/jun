#!/usr/bin/env python3
"""
Configuration du Paysage Sonore Immersif (UE 5.8 Audio)
AyWorld - Claude Edition (Phase 3 - Audio)

Composants :
  - Ambience_Alpine_Forest : Vent continu dans les conifères, chants d'oiseaux alpins (chocard, merle à plastron, mésange noire)
  - Ambience_River_Glacial : Écoulement d'eau vive à galets, clapotis, avec Sound Attenuation spatialisé le long de la spline WaterBodyRiver
"""

import os
import json

AUDIO_CONFIG_PATH = "Content/Audio/Audio_Ambience_Config.json"

def configure_audio_ambience():
    os.makedirs(os.path.dirname(AUDIO_CONFIG_PATH), exist_ok=True)
    
    config = {
        "SourceEngine": "Higgsfield_Audio_Studio",
        "AmbienceTracks": [
            {
                "Name": "Ambience_Alpine_Forest",
                "Category": "Background_2D_Quad",
                "SoundCue": "SC_Ambience_Forest_Loop",
                "VolumeMultiplier": 0.65,
                "PitchMultiplier": 1.0,
                "bLooping": True,
                "Layers": [
                    {"SubLayer": "Wind_Canopy_Rustle", "Volume": 0.50},
                    {"SubLayer": "Alpine_Birds_Chocard", "Volume": 0.22, "RandomIntervalSec": [8.0, 24.0]}
                ]
            },
            {
                "Name": "Ambience_River_Glacial",
                "Category": "Spatialized_3D_Spline",
                "SoundCue": "SC_Ambience_River_Loop",
                "VolumeMultiplier": 0.85,
                "bLooping": True,
                "AttenuationSettings": {
                    "AttenuationShape": "Capsule",
                    "CapsuleLengthAlongSplineMeters": 2016.0,
                    "InnerRadiusMeters": 8.0,
                    "FalloffDistanceMeters": 35.0,
                    "OcclusionEnabled": True,
                    "OcclusionLowPassFilter": 1200.0
                }
            }
        ]
    }
    
    with open(AUDIO_CONFIG_PATH, "w") as f:
        json.dump(config, f, indent=4)
        
    print(f"Configuration audio {AUDIO_CONFIG_PATH} enregistrée.")

if __name__ == "__main__":
    configure_audio_ambience()
