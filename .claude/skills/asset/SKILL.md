---
name: asset
description: Pipeline de création et d'importation d'actifs 3D via Higgsfield, Meshy et Unreal Engine Python
---

# Skill : /asset <nom> <catégorie>

Ce skill standardise le cycle de vie d'un actif 3D de la conception conceptuelle jusqu'à son intégration finale dans l'Unreal Engine.

## Déroulement des Étapes :
1. **Brief & Concept 2D (Higgsfield)** :
   - Générer 4 vues orthographiques/angulaires sous fond neutre studio (Face, Profil, 3/4, Dos).
   - Enregistrer les références dans `Art/Refs/<catégorie>/`.
2. **Reconstruction 3D PBR (Meshy)** :
   - Lancer `meshy_multi_image_to_3d` en mode PBR complet.
   - Contrôler la topologie et la netteté des normales.
3. **Mise à l'échelle Métrique (Meshy)** :
   - Exécuter `meshy_resize` en mètres réels conformément aux dimensions physiques du monde réel.
4. **Rigging & Animation (Si Mob / Créature)** :
   - Appliquer `meshy_rig` puis `meshy_animate` pour les créatures ou PNJs vivants.
5. **Importation & Intégration UE (Python)** :
   - Exécuter le script `Scripts/import_asset.py` via `execute_tool_script`.
   - Activer automatiquement Nanite sur le Static Mesh (`SM_<Nom>`).
   - Assigner ou générer la collision primitive (Box / Simplified Convex).
   - Créer l'instance de matériau `MI_<Nom>` dérivée de `M_Substrate_Master`.
6. **Capture d'Étalonnage** :
   - Prendre une capture du mesh sur socle étalon d'un cube d'1 mètre sous éclairage neutre.
   - Enregistrer dans `Docs/Captures/Assets/<SM_Nom>.png`.
7. **Consignation & Commit** :
   - Ajouter l'entrée dans `Docs/ASSET_LOG.md` (Nom, Outil, Job ID, Coût crédits, Date).
   - Exécuter `git add` et `git commit -m "[asset] SM_<Nom> importé et configuré Nanite"`.
