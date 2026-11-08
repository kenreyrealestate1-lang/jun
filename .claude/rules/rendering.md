---
paths: ["Config/**", "Content/Environment/**"]
---

# Règles de Rendu & Environnement (UE 5.8)

## 1. Pipeline Graphique
- **Nanite** : Actif pour l'ensemble des géométries statiques, rochers, falaises et troncs.
- **Lumen HWRT** : Hardware Ray Tracing activé avec prise en charge du Skin Cache (`r.SkinCache.CompileShaders=True`).
- **Ombres** : Virtual Shadow Maps (VSM) pour toutes les sources directionnelles et locales.
- **Matériaux** : Substrate activé dès la phase 0. Conversion des shaders standards en structures Substrate.
- **Anti-Aliasing** : TSR (Temporal Super Resolution) configuré pour cibler 1440p @ 60 fps avec mise à l'échelle dynamique.
- **MegaLights** : Activé pour la gestion unifiée des lumières directes et volumétriques.

## 2. Atmosphère & Ciel
- Composants obligatoires : `SkyAtmosphere`, `DirectionalLight` (Movable, Sun Atmosphere/Atmosphere Sun Light activé), `SkyLight` (Real Time Capture), `VolumetricCloud` et `ExponentialHeightFog`.
- Éclairage naturel calé sur des valeurs lux physiques réelles (Soleil d'altitude ~100 000 lux à midi, ciel bleu ~15 000 lux).

## 3. Eau & Terrain
- Utilisation du système d'eau Unreal (`WaterBodyRiver`, `WaterBodyLake`) avec maillage dynamique et interactions de rive par distance fields.
- Terrain Landscape partitionné en World Partition avec calques d'édition Landmass et textures RVT (Runtime Virtual Texturing).
