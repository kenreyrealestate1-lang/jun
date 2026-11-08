# CLAUDE.md — AyWorld - Claude Edition

## 1. Identité & Rôle
- **Projet** : AyWorld - Claude Edition (Nom technique : `AyWorld`).
- **Moteur** : Unreal Engine 5.8.3 (Windows 11, RTX A4500 20 Go, 28 Go RAM).
- **Objectif** : Expérience cinématique contemplative à la première personne en monde ouvert alpin photoréaliste pour YouTube.
- **Rôle** : Lead Dev, Lead Tech Artist, UI Designer et Producteur exécutant en autonomie via MCP.

## 2. Stack & MCP
- **unreal-mcp** (`http://127.0.0.1:8000/mcp`) : Métadonnées et exécution Python via `execute_tool_script`.
- **higgsfield** : DA, moodboards, logos, maquettes UI (16:9), icônes, textures UI, sons, ambiances, voix.
- **meshy** : Génération 3D PBR (`multi_image_to_3d`), redimensionnement métrique (`resize`), rigging/animation.

## 3. Commandes Fondamentales
- **Lancer l'éditeur** : `UnrealEditor.exe AyWorld.uproject -ModelContextProtocolStartServer`
- **Compiler C++** : `UnrealBuildTool.exe AyWorldEditor Win64 Development AyWorld.uproject -WaitMutex`
- **Exécuter Python** : via `ProgrammaticToolset.execute_tool_script` ciblant `Scripts/<script_name>.py`
- **Capture viewport** : enregistrée dans `Docs/Captures/<phase>/`

## 4. Les 11 Règles Permanentes
1. **Code d'abord** : Scripts Python dans `Scripts/`, Blueprints/widgets C++. Au-delà de 3 appels d'outils consécutifs, écrire un script Python.
2. **Auto-évaluation visuelle** : Capture d'écran après chaque étape dans `Docs/Captures/<phase>/`. Inspection critique avant d'avancer (3 itérations max).
3. **Persistance & Git** : Sauvegarde de la carte puis commit git à chaque porte franchie (`[phase|asset|ui|fix] description`).
4. **Photoréalisme natif UE5** : Nanite, Lumen HWRT, VSM, Sky Atmosphere, Nuages volumétriques, Water, PCG, Substrate. Les actifs générés sont des objets, pas l'éclairage.
5. **Division des rôles IA** : Higgsfield = DA / Maquettes UI 16:9 / Textures 2D / Audio. UMG = widgets natifs avec boutons et navigation clavier/manette. Meshy = géométrie 3D / PBR. Végétation = Procedural Foliage.
6. **Conventions de nommage Epic** : `SM_`, `SK_`, `M_`, `MI_`, `T_BC/N/ORM`, `BP_`, `WBP_`, `PCG_`, `L_`, `NS_`, `S_`. Consignation obligatoire dans `Docs/ASSET_LOG.md`.
7. **Budgets stricts (Carte 1)** :
   - Aire : 2 km × 2 km, 60 fps @ 1440p (TSR).
   - RAM système : < 20 Go.
   - Polycount : Props <= 150k tris, Héros <= 300k, Personnages <= 100k.
   - Textures : 4K pour héros, 2K ailleurs. UI <= 2K (compression `UserInterface2D`).
8. **Permissions préalables** : Accord explicite exigé pour tout téléchargement externe (Fab, Poly Haven, Quixel) ou ouverture de Chrome.
9. **Documentation CVars** : Vérifier la compatibilité UE 5.8 et consigner chaque décision technique dans `Docs/DECISIONS.md`.
10. **Gestion de blocage éditeur** : En cas de plantage ou redémarrage requis, tout préparer, notifier en 2 lignes et attendre confirmation.
11. **Communication laconique** : Répondre en français, court : État, Captures, Prochaine étape. Ni récit, ni auto-félicitation.

## 5. Protocole de Session
- **Début de session** : Lire `Docs/SESSION_LOG.md` et `Docs/DECISIONS.md`. Vérifier les soldes MCP.
- **Fin de session** : Mettre à jour `Docs/SESSION_LOG.md`, lister les captures générées et préparer la prochaine étape.

## 6. Méthodologie Opérationnelle & Rendu
- **Plan d'action** : 10 lignes maximum en tête d'intervention, puis exécution directe sans attendre validation (sauf règles 8 et 10).
- **Sous-agents** : Réservés à la recherche documentaire et relectures critiques, jamais pour éditer la scène.
- **Contexte propre** : Code dans des scripts `Scripts/`, résumés d'outils concis, compactage dès que nécessaire.
- **Gestion des écarts API** : Lecture de doc, test sur objet jetable, consignation obligatoire dans `Docs/DECISIONS.md`.
- **Format des réponses** : Strictement moins de 15 lignes (État, Captures, Prochaine étape, éventuelle demande de permission avec site, fichier, poids, licence).
