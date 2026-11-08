---
name: ui
description: Pipeline de création d'interfaces UMG réelles à partir de maquettes Higgsfield 16:9
---

# Skill : /ui <écran>

Ce skill régit la création d'interfaces utilisateur interactives de niveau production via CommonUI et UMG.

## Déroulement des Étapes :
1. **Maquette de Référence (Higgsfield)** :
   - Générer le moodboard et la maquette complète 16:9 dans le style cinématique d'AyWorld.
   - Enregistrer dans `Art/UI/<écran>_mockup.png`.
2. **Découpe & Vectorisation des Éléments** :
   - Isoler les couches graphiques : logo du jeu, boutons d'action, cadres de fenêtres, séparateurs, icônes.
   - Enregistrer en PNG transparents 32-bit dans `Art/UI/Slices/`.
3. **Importation & Compression Textures UI** :
   - Importer dans `Content/UI/Textures/`.
   - Appliquer la compression `UserInterface2D` et désactiver les mipmaps pour les éléments nets.
4. **Assemblage UMG (Common UI)** :
   - Construire le widget natif `WBP_<écran>` avec de vrais éléments de texte (Police OFL), des boutons CommonButtonBase et des conteneurs adaptatifs (Horizontal/Vertical Boxes, Canvas).
   - Configurer la navigation manette (D-Pad / Stick) et clavier (Flèches, Entrée, Échap).
5. **Comparaison Visuelle & Capture** :
   - Lancer une session de jeu PIE et capturer l'écran actif via script Python dans `Docs/Captures/UI/<écran>_ingame.png`.
   - Comparer côte à côte avec la maquette Higgsfield.
6. **Validation & Commit** :
   - Exécuter `git add` et `git commit -m "[ui] WBP_<écran> implémenté avec support CommonUI"`.
