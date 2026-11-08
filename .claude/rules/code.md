---
paths: ["Source/**", "Content/Blueprints/**"]
---

# Règles de Code & Blueprints (C++ & Python)

## 1. C++ Architecture
- Standard : Unreal Engine 5.8 C++ moderne.
- Structs de données dérivées de `FTableRowBase` avec `USTRUCT(BlueprintType)` pour exposition DataTable.
- Composants légers et découplés : modularité d'acteurs, interfaces `IInteractableInterface`.
- Gestion mémoire rigoureuse avec `TWeakObjectPtr`, `TObjectPtr` et destruction d'acteurs temporaires.

## 2. Automatisation Python (`Scripts/`)
- Tous les scripts d'automatisation doivent s'exécuter via `ProgrammaticToolset.execute_tool_script`.
- Opérations par script :
  - Importation d'actifs FBX/GLB avec génération de matériaux instanciés.
  - Configuration Nanite et génération de collisions complexes en simples.
  - Placement procédural PCG et génération de biomes.
  - Prises de vue automatisées de caméras de review dans `Docs/Captures/<phase>/`.

## 3. Blueprints
- Les Blueprints logiques (`BP_`) sont compilés proprement sans avertissements ni nœuds dépréciés.
- Préfixe strict : `BP_<Nom>`, `BPC_<Nom>` pour les Actor Components, `BPI_<Nom>` pour les Interfaces.
