# Registre des Décisions Techniques & Moteur — AyWorld

## Phase 0 — Fondations & Paramétrage UE 5.8.3 (2026-11-08)

### 1. Titre & Identité (`Config/DefaultGame.ini`)
- `ProjectDisplayedTitle = "AyWorld - Claude Edition"` : Titre officiel de la fenêtre d'exécution et de l'interface en jeu.
- `ProjectName = "AyWorld"` : Nom technique du module C++ et du fichier `.uproject`.

### 2. Pipeline de Rendu & Éclairage (`Config/DefaultEngine.ini`)
- `r.Nanite=1` & `r.Nanite.MaxNodesPerFrame=262144` : Activation intégrale du système géométrique Nanite pour afficher des millions de polygones sans LOD pop-in dans le monde alpin.
- `r.DynamicGlobalIlluminationMethod=1` & `r.ReflectionMethod=1` : Lumen sélectionné pour l'illumination globale et les réflexions dynamiques.
- `r.Lumen.HardwareRayTracing=1` & `r.Lumen.Reflections.HardwareRayTracing=1` : Passage en Hardware Ray Tracing (HWRT) sur la RTX A4500 (cœurs RT dédiés).
- `r.RayTracing=True` & `r.SkinCache.CompileShaders=True` : Activation du Ray Tracing au niveau du projet et compilation des shaders Skin Cache pour les déformations géométriques.
- `r.Shadow.Virtual.Enable=1` : Virtual Shadow Maps (VSM) pour un rendu d'ombres nettes et haute fidélité des micro-feuillages et des parois rocheuses.
- `r.Substrate=1` & `r.Substrate.BytesPerPixel=128` : Activation native de Substrate dès la phase 0 pour un rendu physique multicouche des matériaux rocheux, de l'eau et de la mousse.
- `r.AntiAliasingMethod=4` (TSR) : Temporal Super Resolution sélectionné comme méthode d'anti-aliasing pour délivrer une image nette en 1440p tout en stabilisant les reflets Lumen.
- `r.GenerateMeshDistanceFields=1` : Génération des champs de distance de maillage pour l'occlusion ambiante de distance, les interactions de mousse de rive fluviale et le feuillage.
- `r.MegaLights=1` : Activation du système MegaLights d'Unreal Engine 5.8 pour l'échantillonnage volumétrique des lumières sans saccades.
- `r.DefaultFeature.AutoExposure=1` & `r.EyeAdaptationQuality=2` : Exposition automatique physiquement basée (Eye Adaptation) pour reproduire les transitions sous-bois / crêtes ensoleillées.

### 3. Plugins Moteur (`AyWorld.uproject`)
- `Water` : Rendu physique de la rivière alpine et du lit de galets.
- `ProceduralContentGeneration` (PCG) : Distribution de roches et débris géologiques selon la topographie.
- `ProceduralFoliage` : Écosystème végétal automatisé (sapins, mélèzes, mousses).
- `PythonScriptPlugin` & `EditorScriptingUtilities` : Exécution autonome d'opérations éditeur via unreal-mcp.
- `SunPosition` : Positionnement astronomique du soleil pour correspondre aux coordonnées d'une vallée alpine.
- `CommonUI` : Architecture UI avec gestion unifiée clavier / souris / manette.
- `Landmass` : Brosses de modelage de terrain non-destructives.

## Phase 2 — Terrain, Eau & Ciel (2026-11-08)

### 1. Méthode d'Importation & Résolution du Landscape
- **Résolution retenue** : 2017 × 2017 quads (taille optimale UE5 : 63 quads/section, 2×2 sections/composant, 16×16 composants = 256 composants, 2016 m × 2016 m au sol). Ce format préserve le budget de RAM (< 20 Go sur les 28 Go système) tout en garantissant une précision métrique de 100 cm par quad.
- **Format du Heightmap** : Raw binaire 16-bit Little-Endian (`Heightmap_Alpine_2017.r16`, 65 536 niveaux d'élévation, Z-Scale = 150.0 pour une amplitude verticale de 1 600 m).
- **Méthode d'importation UE5 retenue** : Importation via `unreal.LandscapeBlueprintLibrary` et commande éditeur avec `NaniteEnabled=True` et `EditLayersEnabled=True`. L'utilisation des Edit Layers est essentielle pour permettre au plugin Water (`WaterBodyRiver` et `WaterBodyLake`) de creuser dynamiquement le lit de la rivière sans détruire la topographie glaciaire de base.

### 2. Auto-Matériau Substrate (`M_Landscape_Substrate_Auto`)
- **Pentes > 35°** : Basculement triplanaire automatique vers la roche calcaire dolomitique (`#D5D0C7` / `#525866`) pour éviter tout étirement de texture sur les parois des falaises.
- **Altitudes > 1 800 m** : Couche de névés et neiges éternelles avec diffusion sous-surfacique (Subsurface Scattering Substrate à 0.45).
- **Fond de vallée (< 1 400 m, Pente < 25°)** : Tapis d'herbe alpine fine (`#1C3B2B`).
- **Macro-Variation** : Injection d'un bruit de variation spatiale à grande échelle (50 m - 600 m) pour rompre toute perception de répétition de texture (anti-tiling).

### 3. Système Fluvial & Lacustre (Plugin Water)
- `WaterBodyRiver_MainValley` : Spline orientée Est vers Ouest épousant le fond de la vallée en U. Largeur calibrée de 6.5 m (gorge en amont) à 14.2 m (plaine alluviale en aval). `bAffectsLandscape = True` avec berges en pente douce. Eau turquoise minérale (`#2FA4A9`), écume dynamique au franchissement des rapides.
- `WaterBodyLake_HighPlateau` : Lac glaciaire profond situé sur le replat supérieur (Est, rayon 65 m, altitude 288.5 m).

### 4. Atmosphère & Éclairage Physique
- `DirectionalLight` calé à 25.0° d'élévation et 225.0° d'azimut (soleil d'or de fin d'après-midi, 75 000 lux réels, 4 800 K).
- `SunPositionCalculator` paramétré sur une latitude alpine (45.2° N) au 15 septembre à 16 h 30.
- `SkyAtmosphere` avec diffusion Rayleigh physique, complété par `VolumetricCloud` (35 % de couverture, plancher à 1.5 km).
- `ExponentialHeightFog` avec composante volumétrique pour simuler la légère nappe de brume au-dessus de la rivière.
- `PostProcessVolume` non borné : Exposition manuelle calibrée (EV100 14.5), courbe tonemapper ACES cinématographique, bloom très contenu (0.15), vignette légère (0.15), aucun grain film, aucun HDRI (100 % procédural physique).

## Phase 3 — Forêt, Roches, Personnage (2026-11-08)

### 1. Système Végétal (PVE & Substrate Foliage)
- **3 Espèces et 9 Modèles Nanite** : Épicéa commun (*Picea abies*), Mélèze d'Europe (*Larix decidua*), Hêtre commun (*Fagus sylvatica*).
- **Animation du Vent WPO** : Déplacement de sommets World Position Offset hiérarchique évitant tout artefact rigide sur les conifères.
- **Translucidité Substrate** : SSS Foliage calibré (0.15 sur épicéa, 0.42 sur hêtre exposé au contre-jour).

### 2. Modélisation Karstique (Meshy PBR)
- 6 Actifs géologiques (`SM_Rock_Karst_Boulder_01` à `04`, `SM_Karst_Cliff_Plate_01`, `SM_Karst_Cliff_Tower_02`) importés avec Nanite et 32 coques convexes simplifiées pour une navigation fluide sans blocage.

### 3. Graphes PCG
- `PCG_Biome_Forest` : Exclusion stricte à moins de 12 m de la rivière et au-dessus de 2 100 m. Préservation des clairières alluviales et sentier dégagé (3.5 m) vers le lac.
- `PCG_Rocks_Cliffs` : Placement automatique d'aiguilles calcaires sur les pentes > 38°.

### 4. Personnage Contemplatif (`AAyWorldCharacter`)
- Suppression intégrale de tout composant d'arme ou de visée (caméra pure à la première personne).
- Hauteur des yeux : 1.70 m. FOV : 85°. Vitesse de marche : 2.0 m/s. Vitesse de sprint : 5.0 m/s. Pente franchissable : 45°. Head bob doux désactivable.
- Point de départ : Belvédère panoramique en bois et pierre surplombant la vallée.

### 5. Conception Sonore
- Ambiance forestière continue (vent + avifaune) et rivière turquoise avec atténuation spatiale (capsule 35 m de rayon) le long de la spline fluviale.

## Phase 4 — Interfaces UMG & Menus (2026-11-08)

### 1. Architecture Common UI & Rendu Temps Réel
- `WBP_TitleScreen` : Utilise la carte `L_Title` avec un rendu temps réel cinématographique (CineCameraActor en traveling lent sur rail à 1.2 m/s) au lieu d'une image plate statique.
- `WBP_PauseMenu` : Flou gaussien d'arrière-plan en temps réel et obscurcissement à 75 % pour garantir une lisibilité absolue des textes sans masquer la beauté du paysage alpin.
- `WBP_HUD` : Déploiement strict du principe d'immersion contemplative : seul un ruban boussole horizontal discret de 28 px de hauteur est affiché en haut de l'écran. Toute la moitié inférieure de l'écran reste vierge de tout élément d'interface ou réticule.
- `WBP_Options` : Intégration de curseurs et boutons interactifs liés directement à `AAyWorldUIPlayerController` pour appliquer instantanément les préréglages graphiques (Cinématographique, Épique, Équilibré), la sensibilité souris, le FOV (75° à 105°), l'activation du Head Bob et le volume sonore général.

### 2. Multi-Input & Accessibilité
- Prise en charge native et fluide du clavier, de la souris et de la manette (D-Pad / Sticks / Boutons de confirmation A et retour B).
- Textes 100 % en français et typographie *Plus Jakarta Sans* (Google Fonts OFL).
