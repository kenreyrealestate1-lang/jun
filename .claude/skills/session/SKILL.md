---
name: session
description: Gestion des cycles de travail, checkpoints et consignation des sessions AyWorld
---

# Skill : /session start | end

Assure la continuité rigoureuse entre les sessions sans amnésie ni dérive de style.

## /session start :
1. Lire `Docs/SESSION_LOG.md` pour identifier la dernière phase validée et les tâches immédiates.
2. Lire `Docs/DECISIONS.md` pour vérifier les CVars et choix d'architecture actifs.
3. Vérifier les soldes de crédits MCP (Unreal MCP, Meshy, Higgsfield) et les noter au sommet de `Docs/ASSET_LOG.md`.
4. Émettre un état bref en français.

## /session end :
1. Déclencher un `/review` visuel et sauvegarder la carte active.
2. Vérifier la conformité des budgets mémoire et polycount.
3. Mettre à jour `Docs/SESSION_LOG.md` avec le bilan horodaté de la session.
4. Exécuter le commit git de clôture : `git commit -m "[phase] clôture session - <bilan>"`.
