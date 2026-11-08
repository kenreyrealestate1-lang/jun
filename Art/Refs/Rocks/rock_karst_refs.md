# Références de Roches & Falaises Calcaires (Meshy PBR Pipeline)

Spécifications des 4 rochers et 2 falaises calcaires avec préparation des 4 vues sous fond gris neutre (`#7f7f7f`) pour alimentation dans `meshy_multi_image_to_3d`.

## 1. Rocher Karstique Lapiazé (`SM_Rock_Karst_Boulder_01`)
- **Morphologie** : Bloc d'éboulis anguleux de 2.5 m de haut, profondément creusé de cannelures et sillons de dissolution (lapiaz).
- **Vues Neutres** :
  1. Vue Frontale : Cannelures verticales principales, micro-arêtes calcaires vives.
  2. Vue Profil Gauche : Angle d'impact à 45° et strate d'érosion mécanique.
  3. Vue 3/4 Isométrique : Relief de crête et dépression concave d'eau pluviale.
  4. Vue Zénithale : Distribution des micro-cuvettes d'altération chimique.
- **Matériau Substrate** : Albédo gris chaud (`#a8a29e`), Roughness 0.78, Normal micro-rugueuse 2K.

## 2. Galet Fluvioglaciaire Poli (`SM_Rock_River_Pebble_02`)
- **Morphologie** : Bloc ovoïde de 1.2 m, poli par le courant de la rivière turquoise. Surface lisse avec veines de calcite blanche.
- **Vues Neutres** : 4 vues orthogonales sur fond gris neutre 50% avec éclairage diffus uniforme.
- **Matériau Substrate** : Zone immergée avec couche de vernis d'eau (Roughness 0.05, IOR 1.33) et zone émergée sèche (Roughness 0.40).

## 3. Bloc de Sous-Bois Moussu (`SM_Rock_Forest_Moss_03`)
- **Morphologie** : Rocher tabulaire de 3.0 m, partiellement enfoui dans l'humus forestier.
- **Vues Neutres** : Vues mettant en valeur la transition nette entre la roche nue et la couverture de mousse.
- **Matériau Substrate** : Shader bi-couche avec vertex color blending pour la mousse veloutée (Fuzz/Cloth Substrate) et le calcaire sous-jacent.

## 4. Rocher Stratifié Diaclasé (`SM_Rock_Cliff_Fragment_04`)
- **Morphologie** : Fragment parallélépipédique de 4.0 m montrant les empilements sédimentaires alpins (lits de 10 à 30 cm).
- **Vues Neutres** : Vues révélant les lignes de faille et les cassures fraîches de décompression géologique.

## 5. Muraille Calcaire Dolomitique (`SM_Karst_Cliff_Plate_01`)
- **Morphologie** : Pan de falaise modulaire de 60 m × 40 m avec encorbellements, surplombs et grandes diaclases verticales.
- **Intégration Nanite** : Traité en Nanite avec VSM pour projeter des ombres projetées nettes sur la vallée en fin d'après-midi.

## 6. Aiguille Rocheuse / Cime Karstique (`SM_Karst_Cliff_Tower_02`)
- **Morphologie** : Aiguille dolomitique effilée de 120 m de hauteur servant de repère visuel (Landmark d'orientation).
