# Direction Artistique — AyWorld - Claude Edition

## 1. Vision & Ambiance Générale
AyWorld offre une immersion contemplative et cinématographique dans une haute vallée alpine isolée inspirée du massif du Vercors et des Dolomites italiennes. Le joueur explore à la première personne un milieu naturel sauvage, préservé et grandiose, où chaque élément géologique et végétal obéit aux lois de l'écosystème alpin.

## 2. Palette Chromatique Maîtresse (6 Teintes Normalisées)
| Identifiant | Code Hexadécimal | Nom Clinique / Rôle | Domaine d'Application |
| :--- | :--- | :--- | :--- |
| **01** | `#D5D0C7` | Blanc Minéral Karst | Falaises de calcaire dolomitique au soleil, galets de rivière, pierriers |
| **02** | `#525866` | Gris Diaclase Ombrée | Failles rocheuses, parois nord, ombres de contact Lumen |
| **03** | `#1C3B2B` | Vert Épicéa Profond | Forêt de conifères subalpins, mousses d'humus |
| **04** | `#2FA4A9` | Turquoise Fluvioglaciaire | Rivière d'eau vive à galets, vasques glaciaires translucides |
| **05** | `#F2AF58` | Or Solaire Crépusculaire | Soleil d'altitude à 25°, reflets d'aiguilles de mélèzes |
| **06** | `#F8FAFC` | Blanc Neige & Éléments UI | Névés des sommets, typographie UI nette, repères de boussole |

## 3. Heure de Référence & Éclairage Physique (Fin d'Après-Midi)
- **Élévation Solaire** : 25.0° au-dessus de l'horizon, orientation Sud-Ouest (225° azimut).
- **Intensité Lumineuse** : `DirectionalLight` physique à 75 000 lux (lumière chaude rasante à température de couleur 4800K).
- **Remplissage Ciel** : `SkyAtmosphere` avec diffusion Rayleigh naturelle (ton azur profond en zénith, doré à l'horizon).
- **SkyLight** : Real Time Capture active, fournissant un débouchage naturel des ombres par la réflexion du calcaire environnant.

## 4. Règles de Composition Visuelle
- **Perspective Humaine Naturelle** : Caméra calée à 1.70 m du sol, champ de vision (FOV) horizontal à 90° pour une sensation d'échelle vraie sans distorsion grand-angle irréaliste.
- **Principe des Trois Plans** :
  - *Premier plan* : Galets lisses et berge herbeuse détaillée (micro-détails Nanite et brins d'herbe PCG).
  - *Second plan* : Cours d'eau turquoise sinueux et rideau forestier d'épicéas et de mélèzes.
  - *Arrière-plan* : Murailles calcaires monumentales et pics dentelés s'élevant à pic dans le ciel.
- **Règle de Guidage par la Rivière** : La rivière constitue la ligne directrice majeure guidant l'œil du spectateur vers le fond de la vallée.

## 5. Style de l'Interface Utilisateur (Common UI / UMG)
- **Police de Caractères** : *Plus Jakarta Sans* / *Inter* (Google Fonts, licence OFL).
- **Hiérarchie Typographique** :
  - Titre majeur : 72-84 pt, graisse Black (900), tracking -0.02em.
  - Sous-titre / Catégorie : 18-20 pt, graisse Bold (700), tracking +0.35em (majuscules aérées).
  - Boutons de menu : 16 pt, graisse SemiBold (600), contraste élevé avec état focus clair.
- **Marges & Espacements** : Marge de sécurité TV/Moniteur de 5% (Safe Zone standardisée).
- **HUD en Jeu** :
  - Minimaliste et non-intrusif : aucune barre de vie, aucun mini-map circulaire, aucun compteur persistant.
  - Seule une boussole horizontale discrète apparaît en bord supérieur (opacité 60%, 12 px de hauteur).
  - La moitié inférieure de l'écran reste vierge de tout artifice pour maximiser la contemplation cinématique.
- **Animations** : Transitions en fondu doux (Fade 0.25s) et lissage exponentiel (Ease-Out-Cubic), sans tremblement ni effet de rebond cartoon.

## 6. Proscriptions Absolues (Ce qui est strictement interdit)
- ❌ **Saturation excessive** : Interdiction des verts fluos ou des ciels violets criards non réalistes.
- ❌ **Bloom démesuré** : Pas de halos lumineux diffus qui noient les crêtes de montagnes.
- ❌ **Brouillard volumétrique uniforme** : Interdiction du brouillard uniforme type "soupe de pois" ; le brouillard doit être localisé en nappes de vallée via `ExponentialHeightFog` étagé.
- ❌ **Surcharge d'interface (HUD Clutter)** : Pas de réticule permanent au centre de l'écran en exploration contemplative.
