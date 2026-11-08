---
name: review
description: Audit visuel et de performance de la scène Unreal Engine via caméras fixes et métriques GPU/CPU
---

# Skill : /review

Effectue une revue critique complète de l'état visuel et des performances de la scène active.

## Déroulement :
1. **Prises de Vues Multi-Angles** :
   - Déclencher le script `Scripts/capture_review.py` via `execute_tool_script`.
   - 4 caméras fixes nommées dans la vallée :
     - `Cam_Valley_Overview` : Vue plongeante d'ensemble sur le massif et la rivière.
     - `Cam_River_EyeLevel` : Vue au ras de l'eau avec reflets Lumen et feuillage de berge.
     - `Cam_Forest_Canopy` : Vue en sous-bois avec occlusion de la canopée et rayons crépusculaires.
     - `Cam_Mountain_Peaks` : Vue ascendante sur les cimes enneigées et la Sky Atmosphere.
   - Images sauvegardées dans `Docs/Captures/Reviews/<timestamp>/`.
2. **Mesure des Performances (Stats UE)** :
   - Exécution de `stat unit` et `stat gpu`.
   - Relevé : Frame Time (ms), GPU Time (ms), Draw Calls, VRAM consommée, RAM système active (< 20 Go).
3. **Vérification du Veredict** :
   - Respect des budgets de 60 fps @ 1440p TSR.
   - Détection d'artefacts visuels (ghosting TSR, fuites Lumen, débordements de distance fields).
   - Rapport synthétique inscrit dans `Docs/SESSION_LOG.md`.
