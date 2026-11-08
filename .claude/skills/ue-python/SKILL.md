---
name: ue-python
description: Bibliothèque de gabarits Python prêts à l'emploi pour l'Unreal Engine Editor Scripting
---

# Skill : ue-python (Gabarits d'automatisation)

Ce skill met à disposition les gabarits Python standards pour toutes les manipulations courantes de l'éditeur via `ProgrammaticToolset.execute_tool_script`.

## Gabarits inclus :

### 1. Importation FBX/GLB avec Nanite & Collision
```python
import unreal

def import_mesh(file_path, destination_path, asset_name):
    task = unreal.AssetImportTask()
    task.filename = file_path
    task.destination_path = destination_path
    task.destination_name = asset_name
    task.replace_existing = True
    task.automated = True
    task.save = True
    
    options = unreal.FbxImportUI()
    options.import_mesh = True
    options.import_textures = False
    options.import_materials = False
    options.static_mesh_import_data.build_nanite = True
    options.static_mesh_import_data.auto_generate_collision = True
    task.options = options
    
    unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
```

### 2. Spawning d'Acteurs & Caméras
```python
import unreal

def spawn_cine_camera(location, rotation, camera_name):
    world = unreal.EditorLevelLibrary.get_editor_world()
    cam_actor = unreal.EditorLevelLibrary.spawn_actor_from_class(unreal.CineCameraActor, location, rotation)
    cam_actor.set_actor_label(camera_name)
    return cam_actor
```

### 3. Capture de Viewport Haute Résolution
```python
import unreal

def capture_editor_viewport(output_file_path):
    unreal.AutomationLibrary.take_high_res_screenshot(1920, 1080, output_file_path)
```

### 4. Création de Graphe PCG (Procedural Content Generation)
```python
import unreal

def create_pcg_component_on_actor(actor, pcg_graph_path):
    pcg_comp = unreal.PCGComponent()
    # Configuration du graphe procédural
    return pcg_comp
```
