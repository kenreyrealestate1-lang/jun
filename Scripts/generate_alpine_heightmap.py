#!/usr/bin/env python3
"""
Générateur de Heightmap Alpin 16-bit Ultra-Rapide pour Unreal Engine 5.8
AyWorld - Claude Edition (Phase 2 - Terrain)

Dimensions : 2017 × 2017 (Standard UE Landscape, 100 cm/quad, Emprise 2 km × 2 km)
Format : Raw 16-bit Little-Endian (.r16, unsigned short uint16 0..65535)
"""

import math
import os
import struct
import time

WIDTH = 2017
HEIGHT = 2017
OUTPUT_PATH = "Content/Environment/Landscape/Heightmap_Alpine_2017.r16"

def generate_fast_alpine_heightmap():
    t0 = time.time()
    print(f"Génération rapide du heightmap alpin {WIDTH}x{HEIGHT}...")
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    valley_y = 0.52
    buffer = bytearray(WIDTH * HEIGHT * 2)
    ptr = 0
    
    # Pré-calcul des tables trigonométriques pour accélération
    sin_x1 = [math.sin(x / (WIDTH - 1.0) * 2.8 * math.pi) for x in range(WIDTH)]
    sin_x2 = [math.sin(x / (WIDTH - 1.0) * 7.0 * math.pi) for x in range(WIDTH)]
    sin_x_micro = [math.sin(x / (WIDTH - 1.0) * 45.0 * math.pi) for x in range(WIDTH)]
    cos_x_macro = [math.cos(x / (WIDTH - 1.0) * 12.0 * math.pi) for x in range(WIDTH)]
    
    inv_w = 1.0 / (WIDTH - 1.0)
    inv_h = 1.0 / (HEIGHT - 1.0)
    
    for y in range(HEIGHT):
        ny = y * inv_h
        dy = ny - valley_y
        
        # Profil glaciaire en U
        u_profile = math.pow(abs(dy) * 2.2, 1.8) * 0.42
        
        # Crête Nord dolomitique (y < 0.40)
        north_ridge = 0.0
        if ny < 0.40:
            dn = (0.40 - ny) * 2.5
            north_ridge = math.pow(dn, 1.4) * 0.55
            
        # Contrefort Sud (y > 0.65)
        south_ridge = 0.0
        if ny > 0.65:
            ds = (ny - 0.65) * 2.85
            south_ridge = math.pow(ds, 1.5) * 0.32
            
        sin_y_macro = math.sin(ny * 16.0 * math.pi)
        cos_y_detail = math.cos(ny * 52.0 * math.pi)
        
        for x in range(WIDTH):
            nx = x * inv_w
            
            # Pente d'amont en aval (Est vers Ouest)
            slope_gradient = nx * 0.12
            
            # Rivière méandrique
            river_y = valley_y + 0.06 * sin_x1[x] + 0.02 * sin_x2[x]
            dist_river = abs(ny - river_y)
            river_carve = 0.0
            if dist_river < 0.025:
                fr = dist_river * 40.0 # / 0.025
                river_carve = (1.0 - fr * fr) * 0.035
                
            # Replat du lac glaciaire
            dx_lake = (nx - 0.72) * 1.25
            dy_lake = (ny - river_y) * 2.0
            dist_lake_sq = dx_lake * dx_lake + dy_lake * dy_lake
            lake_carve = 0.0
            if dist_lake_sq < 0.005:
                fl = 1.0 - math.sqrt(dist_lake_sq) / 0.0707
                lake_carve = fl * 0.028
                
            # Relief multi-fréquence
            macro_noise = 0.12 * (cos_x_macro[x] * sin_y_macro + math.sin(nx * 8.0 * math.pi + ny * 6.0 * math.pi))
            detail_noise = 0.035 * (sin_x_micro[x] * cos_y_detail)
            
            # Élévation totale normalisée
            elev = 0.24 + slope_gradient + u_profile + north_ridge + south_ridge + macro_noise + detail_noise - river_carve - lake_carve
            
            if elev < 0.01:
                elev = 0.01
            elif elev > 0.99:
                elev = 0.99
                
            u16 = int(elev * 65535.0)
            buffer[ptr] = u16 & 0xFF
            buffer[ptr + 1] = (u16 >> 8) & 0xFF
            ptr += 2
            
    with open(OUTPUT_PATH, "wb") as f:
        f.write(buffer)
        
    duration = time.time() - t0
    file_size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
    print(f"Heightmap {OUTPUT_PATH} généré en {duration:.2f}s ({file_size_mb:.2f} Mo, uint16 little-endian).")

if __name__ == "__main__":
    generate_fast_alpine_heightmap()
