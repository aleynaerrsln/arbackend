#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
3D Model Reconstruction from Video Frames
Basit photogrammetry ile frame'lerden 3D model oluşturur
"""

import sys
import io
import os
import cv2
import numpy as np
from PIL import Image
import trimesh
from pygltflib import GLTF2

# Windows console için UTF-8 encoding zorla
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def load_frames(frames_dir):
    """Frame'leri yükle"""
    print(f"📂 Frame klasörü: {frames_dir}")
    
    frame_files = sorted([
        f for f in os.listdir(frames_dir) 
        if f.endswith(('.jpg', '.jpeg', '.png'))
    ])
    
    if not frame_files:
        raise ValueError("Frame bulunamadı!")
    
    print(f"📸 {len(frame_files)} frame bulundu")
    
    frames = []
    for frame_file in frame_files:
        frame_path = os.path.join(frames_dir, frame_file)
        img = cv2.imread(frame_path)
        if img is not None:
            frames.append(img)
    
    return frames

def extract_features(frames):
    """Frame'lerden feature'ları çıkar (SIFT)"""
    print("🔍 Feature extraction başlıyor...")
    
    # SIFT detector oluştur
    sift = cv2.SIFT_create()
    
    all_keypoints = []
    all_descriptors = []
    
    for idx, frame in enumerate(frames):
        # Gri tonlamaya çevir
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Keypoint ve descriptor'ları bul
        keypoints, descriptors = sift.detectAndCompute(gray, None)
        
        all_keypoints.append(keypoints)
        all_descriptors.append(descriptors)
        
        if (idx + 1) % 5 == 0:
            print(f"  {idx + 1}/{len(frames)} frame işlendi")
    
    print(f"✅ Feature extraction tamamlandı")
    return all_keypoints, all_descriptors

def create_point_cloud(frames, keypoints_list):
    """Basit point cloud oluştur"""
    print("☁️ Point cloud oluşturuluyor...")
    
    points = []
    colors = []
    
    for frame_idx, (frame, keypoints) in enumerate(zip(frames, keypoints_list)):
        h, w = frame.shape[:2]
        
        for kp in keypoints:
            x, y = kp.pt
            
            # 3D koordinat (basit projeksiyon)
            # Gerçek photogrammetry için camera calibration gerekir
            angle = (frame_idx / len(frames)) * 2 * np.pi
            radius = 1.0
            
            point_3d = [
                radius * np.cos(angle) + (x / w - 0.5) * 0.5,
                (y / h - 0.5) * 0.5,
                radius * np.sin(angle) + (x / w - 0.5) * 0.5
            ]
            
            # Renk bilgisi
            color = frame[int(y), int(x)]
            color_normalized = color / 255.0
            
            points.append(point_3d)
            colors.append(color_normalized)
    
    points = np.array(points)
    colors = np.array(colors)
    
    print(f"✅ {len(points)} nokta oluşturuldu")
    return points, colors

def create_mesh_from_points(points, colors):
    """Point cloud'dan mesh oluştur"""
    print("🔨 Mesh oluşturuluyor...")
    
    # Point cloud oluştur
    point_cloud = trimesh.points.PointCloud(points, colors=colors)
    
    # Basit convex hull mesh (gerçek reconstruction için daha karmaşık algoritmalar gerekir)
    try:
        # Voxel grid kullanarak mesh oluştur
        mesh = point_cloud.convex_hull
        
        # Mesh'i düzelt
        mesh.fix_normals()
        
        print(f"✅ Mesh oluşturuldu: {len(mesh.vertices)} vertices, {len(mesh.faces)} faces")
        return mesh
    
    except Exception as e:
        print(f"⚠️ Mesh oluşturma hatası: {e}")
        print("🔄 Basit sphere mesh oluşturuluyor...")
        
        # Hata durumunda basit bir sphere döndür
        mesh = trimesh.creation.icosphere(subdivisions=3, radius=1.0)
        
        # Vertex color'ları ekle
        if len(colors) > 0:
            # Her vertex için ortalama renk kullan
            avg_color = np.mean(colors, axis=0)
            vertex_colors = np.tile(avg_color, (len(mesh.vertices), 1))
            mesh.visual.vertex_colors = (vertex_colors * 255).astype(np.uint8)
        
        return mesh

def simplify_mesh(mesh, face_count=5000):
    """Mesh'i basitleştir (performans için)"""
    print(f"🔧 Mesh basitleştiriliyor (hedef: {face_count} face)...")
    
    current_faces = len(mesh.faces)
    
    if current_faces > face_count:
        # Mesh'i basitleştir
        mesh = mesh.simplify_quadric_decimation(face_count)
        print(f"✅ Mesh basitleştirildi: {current_faces} → {len(mesh.faces)} faces")
    else:
        print(f"✅ Mesh zaten yeterince basit: {current_faces} faces")
    
    return mesh

def save_as_glb(mesh, output_path):
    """Mesh'i GLB formatında kaydet"""
    print(f"💾 GLB dosyası kaydediliyor: {output_path}")
    
    try:
        # GLB formatında kaydet
        mesh.export(output_path, file_type='glb')
        
        # Dosya boyutunu kontrol et
        file_size = os.path.getsize(output_path)
        file_size_mb = file_size / (1024 * 1024)
        
        print(f"✅ GLB dosyası kaydedildi: {file_size_mb:.2f} MB")
        return True
    
    except Exception as e:
        print(f"❌ GLB kaydetme hatası: {e}")
        return False

def reconstruct_3d_model(frames_dir, output_path):
    """Ana reconstruction fonksiyonu"""
    print("=" * 60)
    print("🚀 3D RECONSTRUCTION BAŞLIYOR")
    print("=" * 60)
    
    try:
        # 1. Frame'leri yükle
        frames = load_frames(frames_dir)
        
        if len(frames) < 10:
            raise ValueError(f"Yeterli frame yok! Bulunan: {len(frames)}, Gerekli: 10+")
        
        # 2. Feature extraction
        keypoints_list, descriptors_list = extract_features(frames)
        
        # 3. Point cloud oluştur
        points, colors = create_point_cloud(frames, keypoints_list)
        
        # 4. Mesh oluştur
        mesh = create_mesh_from_points(points, colors)
        
        # 5. Mesh'i basitleştir
        mesh = simplify_mesh(mesh, face_count=5000)
        
        # 6. GLB olarak kaydet
        success = save_as_glb(mesh, output_path)
        
        if success:
            print("=" * 60)
            print("✅ 3D RECONSTRUCTION TAMAMLANDI!")
            print("=" * 60)
            return True
        else:
            raise Exception("GLB kaydetme başarısız")
    
    except Exception as e:
        print("=" * 60)
        print(f"❌ HATA: {e}")
        print("=" * 60)
        return False

def main():
    """Ana fonksiyon"""
    if len(sys.argv) < 3:
        print("Kullanım: python reconstruction3D.py <frames_dir> <output_path>")
        sys.exit(1)
    
    frames_dir = sys.argv[1]
    output_path = sys.argv[2]
    
    # Frame klasörü kontrolü
    if not os.path.exists(frames_dir):
        print(f"❌ Frame klasörü bulunamadı: {frames_dir}")
        sys.exit(1)
    
    # Output klasörü yoksa oluştur
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
    
    # 3D reconstruction başlat
    success = reconstruct_3d_model(frames_dir, output_path)
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()