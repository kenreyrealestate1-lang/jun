---
paths: ["Art/**", "Content/Art/**"]
---

# Règles de Production d'Actifs (Higgsfield & Meshy)

## 1. Pipeline de Génération
- **Phase Concept** : Higgsfield produit 4 vues sous fond neutre avec éclairage studio équilibré.
- **Modélisation 3D** : Meshy `multi_image_to_3d` en mode PBR complet (Albedo, Normal, Roughness, Metallic, Ambient Occlusion).
- **Métrique & Échelle** : Passage obligatoire par `meshy_resize` en unités métriques réelles (1 unité UE = 1 cm).
- **Rigging/Animation** : Uniquement pour mobs et créatures via `meshy_rig` et `meshy_animate`.
- **Importation UE** : Via script Python (`Scripts/import_asset.py`) avec activation Nanite automatique et collision primitive (Box / Capsule / Convex).

## 2. Conventions & Budgets
- **Nommage** :
  - `SM_<Nom>` : Static Mesh
  - `SK_<Nom>` : Skeletal Mesh
  - `M_<Nom>` : Master Material
  - `MI_<Nom>` : Material Instance
  - `T_<Nom>_BC` : Base Color
  - `T_<Nom>_N` : Normal Map
  - `T_<Nom>_ORM` : Occlusion / Roughness / Metallic packée
- **Budgets Polycount** :
  - Props d'environnement : <= 150 000 triangles
  - Actifs héros / Landmark : <= 300 000 triangles
  - Personnages et créatures : <= 100 000 triangles
- **Consignation** : Chaque création d'actif est enregistrée immédiatement dans `Docs/ASSET_LOG.md`.
