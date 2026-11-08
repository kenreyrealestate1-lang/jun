#!/usr/bin/env python3
"""
Génération des 4 Interfaces Utilisateur UMG / Common UI (UE 5.8)
AyWorld - Claude Edition (Phase 4 - Interfaces)

Widgets générés :
  1. WBP_TitleScreen :
     - Carte d'arrière-plan cinématique temps réel L_Title (CineCameraActor en mouvement lent sur rail)
     - Logo officiel vectoriel "AyWorld - Claude Edition"
     - Boutons CommonButtonBase : "COMMENCER L'EXPLORATION", "OPTIONS", "QUITTER"
     - Navigation unifiée manette (D-Pad/Stick), clavier (Flèches/Entrée) et souris
  2. WBP_PauseMenu :
     - Bascule sur Échap / Touche Menu manette
     - Post-process de flou d'arrière-plan temps réel (Background Blur)
     - Boutons : "REPRENDRE L'EXPLORATION", "OPTIONS", "RETOUR AU MENU PRINCIPAL"
  3. WBP_HUD :
     - Boussole fine horizontale en haut uniquement (360° avec repères cardinaux et degrés)
     - Aucun élément en bas d'écran (100% vue cinématique pour exploration contemplative)
  4. WBP_Options :
     - Préréglages graphiques : Cinématographique, Épique, Équilibré
     - Curseur Sensibilité Souris (0.1 à 3.0)
     - Curseur FOV (75° à 105°, défaut 85°)
     - Bascule Head Bob (Activé / Désactivé)
     - Curseur Volume Général (0% à 100%, défaut 80%)
"""

import os
import json

UI_DIR = "Content/UI/Widgets"
MAPS_DIR = "Content/Maps"

def setup_umg_interfaces():
    os.makedirs(UI_DIR, exist_ok=True)
    os.makedirs(MAPS_DIR, exist_ok=True)

    # 1. Carte cinématique L_Title
    l_title_config = {
        "MapName": "L_Title",
        "Type": "RealTime_Cinematic_Title_Level",
        "CameraSetup": {
            "ActorClass": "CineCameraActor",
            "Name": "CineCam_Title_SlowTrack",
            "InitialLocation": [62000.0, -28000.0, 48000.0],
            "SplinePathLengthMeters": 450.0,
            "TrackingSpeedMetersPerSec": 1.2, # Défilement panoramique très lent et contemplatif
            "LookAtTarget": [-12000.0, 4500.0, 18000.0], # Cible la rivière et les falaises dolomitiques
            "FocalLength": 32.0,
            "FocusDistance": 120000.0, # Infini net
            "Aperture": 8.0
        },
        "Lighting": {
            "TimeOfDay": "16h30 (Fin d'après-midi)",
            "SunElevation": 25.0,
            "SunIntensityLux": 75000.0,
            "VolumetricFog": True
        }
    }

    # 2. WBP_TitleScreen
    title_screen_config = {
        "WidgetName": "WBP_TitleScreen",
        "ParentClass": "CommonUserWidget",
        "Root": "Overlay",
        "Elements": [
            {
                "Type": "Image",
                "Name": "Img_Logo_AyWorld",
                "Source": "/Game/UI/Textures/T_Logo_AyWorld_Light",
                "Alignment": "TopCenter",
                "MarginTop": 110,
                "Size": [680, 204]
            },
            {
                "Type": "VerticalBox",
                "Name": "VBox_NavButtons",
                "Alignment": "BottomCenter",
                "MarginBottom": 140,
                "ButtonSpacing": 18,
                "Buttons": [
                    {
                        "ID": "Btn_StartGame",
                        "Text": "COMMENCER L'EXPLORATION",
                        "Action": "OpenLevel('/Game/Maps/L_World')",
                        "FocusedByDefault": True,
                        "HoverSound": "/Game/Audio/UI/Cue_Button_Hover",
                        "ClickSound": "/Game/Audio/UI/Cue_Button_Confirm"
                    },
                    {
                        "ID": "Btn_Options",
                        "Text": "OPTIONS & PARAMÈTRES",
                        "Action": "OpenWidget('WBP_Options')",
                        "HoverSound": "/Game/Audio/UI/Cue_Button_Hover",
                        "ClickSound": "/Game/Audio/UI/Cue_Button_Confirm"
                    },
                    {
                        "ID": "Btn_Quit",
                        "Text": "QUITTER L'EXPÉRIENCE",
                        "Action": "QuitGame()",
                        "HoverSound": "/Game/Audio/UI/Cue_Button_Hover",
                        "ClickSound": "/Game/Audio/UI/Cue_Button_Back"
                    }
                ]
            },
            {
                "Type": "TextBlock",
                "Name": "Txt_GamepadPrompt",
                "Text": "Appuyez sur [A] / [Entrée] pour sélectionner",
                "Font": "Plus Jakarta Sans 12pt Regular",
                "ColorHex": "#94A3B8",
                "Alignment": "BottomRight",
                "Margin": [0, 0, 40, 25]
            }
        ]
    }

    # 3. WBP_PauseMenu
    pause_menu_config = {
        "WidgetName": "WBP_PauseMenu",
        "ParentClass": "CommonActivatableWidget",
        "TriggerKey": "Escape / Gamepad_Special_Right",
        "Root": "BackgroundBlur_Overlay",
        "BlurStrength": 18.0,
        "TintOverlayColor": [0.03, 0.04, 0.07, 0.75],
        "Elements": [
            {
                "Type": "TextBlock",
                "Name": "Txt_PauseTitle",
                "Text": "EXPÉDITION EN PAUSE",
                "Font": "Plus Jakarta Sans 36pt Bold",
                "LetterSpacing": 6,
                "ColorHex": "#F8FAFC",
                "Alignment": "TopCenter",
                "MarginTop": 160
            },
            {
                "Type": "VerticalBox",
                "Name": "VBox_PauseButtons",
                "Alignment": "Center",
                "ButtonSpacing": 20,
                "Buttons": [
                    {
                        "ID": "Btn_Resume",
                        "Text": "REPRENDRE L'EXPLORATION",
                        "Action": "ResumeGame()",
                        "FocusedByDefault": True
                    },
                    {
                        "ID": "Btn_PauseOptions",
                        "Text": "PARAMÈTRES GRAPHIQUES & AUDIO",
                        "Action": "ShowOptionsMenu()"
                    },
                    {
                        "ID": "Btn_ReturnToTitle",
                        "Text": "RETOUR AU MENU PRINCIPAL",
                        "Action": "OpenLevel('/Game/Maps/L_Title')"
                    }
                ]
            }
        ]
    }

    # 4. WBP_HUD (Boussole uniquement)
    hud_config = {
        "WidgetName": "WBP_HUD",
        "ParentClass": "UserWidget",
        "Root": "CanvasPanel",
        "DesignPhilosophy": "Contemplative Zero-Clutter",
        "BottomElementsAllowed": False,
        "TopCompass": {
            "Name": "Compass_Ribbon_Horizontal",
            "Alignment": "TopCenter",
            "MarginTop": 25,
            "Width": 420,
            "Height": 28,
            "Opacity": 0.65,
            "CardinalMarks": [
                {"Degree": 0, "Label": "N"},
                {"Degree": 45, "Label": "NE"},
                {"Degree": 90, "Label": "E"},
                {"Degree": 135, "Label": "SE"},
                {"Degree": 180, "Label": "S"},
                {"Degree": 225, "Label": "SW"},
                {"Degree": 270, "Label": "W"},
                {"Degree": 315, "Label": "NW"}
            ],
            "TickSpacingDeg": 5.0,
            "CenterIndicatorTriangle": True,
            "ColorHex": "#F8FAFC"
        }
    }

    # 5. WBP_Options
    options_config = {
        "WidgetName": "WBP_Options",
        "ParentClass": "CommonActivatableWidget",
        "Root": "Border_Window",
        "Size": [720, 640],
        "Alignment": "Center",
        "Title": "PARAMÈTRES DU JEU",
        "Settings": [
            {
                "ID": "Setting_GraphicsPreset",
                "Label": "Préréglage Graphique",
                "Type": "RadioSelect",
                "Options": ["Cinématographique (Lumen HWRT + Nanite)", "Épique (VSM + TSR)", "Équilibré (60 FPS Fixe)"],
                "DefaultIndex": 0
            },
            {
                "ID": "Setting_MouseSens",
                "Label": "Sensibilité Souris",
                "Type": "Slider",
                "Range": [0.1, 3.0],
                "DefaultValue": 1.0,
                "Step": 0.05
            },
            {
                "ID": "Setting_FOV",
                "Label": "Champ de Vision (FOV)",
                "Type": "Slider",
                "Range": [75.0, 105.0],
                "DefaultValue": 85.0,
                "Step": 1.0,
                "Unit": "°"
            },
            {
                "ID": "Setting_HeadBob",
                "Label": "Mouvement de Tête (Head Bob)",
                "Type": "ToggleSwitch",
                "DefaultValue": True,
                "Description": "Oscillation douce naturelle lors de la marche et du sprint"
            },
            {
                "ID": "Setting_MasterVolume",
                "Label": "Volume Général",
                "Type": "Slider",
                "Range": [0.0, 1.0],
                "DefaultValue": 0.80,
                "Step": 0.05,
                "DisplayPercent": True
            }
        ],
        "FooterButtons": [
            {"ID": "Btn_Apply", "Text": "APPLIQUER LES MODIFICATIONS", "Action": "ApplySettings()"},
            {"ID": "Btn_Close", "Text": "RETOUR", "Action": "CloseWidget()"}
        ]
    }

    with open(os.path.join(MAPS_DIR, "L_Title_Setup.json"), "w") as f:
        json.dump(l_title_config, f, indent=4)

    with open(os.path.join(UI_DIR, "WBP_TitleScreen.json"), "w") as f:
        json.dump(title_screen_config, f, indent=4)

    with open(os.path.join(UI_DIR, "WBP_PauseMenu.json"), "w") as f:
        json.dump(pause_menu_config, f, indent=4)

    with open(os.path.join(UI_DIR, "WBP_HUD.json"), "w") as f:
        json.dump(hud_config, f, indent=4)

    with open(os.path.join(UI_DIR, "WBP_Options.json"), "w") as f:
        json.dump(options_config, f, indent=4)

    print("Ensemble des 4 widgets UMG et carte L_Title configurés avec succès.")

if __name__ == "__main__":
    setup_umg_interfaces()
