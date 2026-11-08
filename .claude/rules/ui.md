---
paths: ["Content/UI/**", "Art/UI/**"]
---

# Règles UI & UMG (Common UI)

## 1. Conception & Maquettage
- Higgsfield génère la maquette de référence en format 16:9 cinématographique.
- Les éléments graphiques individuels (logotype, cadres, boutons, icônes) sont découpés en PNG transparents avec compression `UserInterface2D`.
- Résolution maximale des textures UI : 2048 × 2048 px.

## 2. Implémentation UMG & Common UI
- **Jamais de maquette plate importée en fond d'écran sans interactivité** : chaque écran doit être reconstruit en widgets UMG natifs (`WBP_`).
- Utilisation de `CommonUI` pour une prise en charge fluide et automatique de la navigation au clavier et à la manette.
- Support du focus visuel distinct et des retours audio haptiques/acoustiques lors de la navigation.

## 3. Titre & Menus (Phase 1)
- Écran de titre : Titre "AyWorld - Claude Edition", boutons Jouer, Options, Quitter, fond animé ou caméra cinématique 3D.
- Menu Pause : Reprise, Paramètres graphiques/audio, Retour à l'écran titre.
