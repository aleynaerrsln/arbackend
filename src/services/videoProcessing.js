const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

/**
 * Video'dan frame'leri çıkar
 * @param {string} videoPath - Video dosya yolu
 * @param {string} outputDir - Frame'lerin kaydedileceği klasör
 * @returns {Promise<string[]>} - Oluşturulan frame dosya yolları
 */
const extractFrames = (videoPath, outputDir) => {
  return new Promise((resolve, reject) => {
    // Output klasörü yoksa oluştur
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const frames = [];
    const framePattern = path.join(outputDir, 'frame-%04d.jpg');

    console.log('🎬 Video frame extraction başlıyor...');
    console.log('Video:', videoPath);
    console.log('Output:', outputDir);

    ffmpeg(videoPath)
      .outputOptions([
        '-vf fps=2', // Saniyede 2 frame (0.5sn aralıklarla)
        '-q:v 2'     // Yüksek kalite
      ])
      .output(framePattern)
      .on('start', (command) => {
        console.log('FFmpeg komutu:', command);
      })
      .on('progress', (progress) => {
        console.log(`İşleme: ${Math.round(progress.percent || 0)}%`);
      })
      .on('end', () => {
        // Oluşturulan frame'leri listele
        const files = fs.readdirSync(outputDir)
          .filter(file => file.startsWith('frame-') && file.endsWith('.jpg'))
          .map(file => path.join(outputDir, file));

        console.log(`✅ ${files.length} frame çıkarıldı`);
        resolve(files);
      })
      .on('error', (err) => {
        console.error('❌ Frame extraction hatası:', err);
        reject(err);
      })
      .run();
  });
};

/**
 * Python 3D reconstruction script'ini çalıştır
 * @param {string[]} framePaths - Frame dosya yolları
 * @param {string} outputPath - Çıktı .glb dosya yolu
 * @returns {Promise<string>} - Oluşturulan model yolu
 */
const reconstruct3D = (framePaths, outputPath) => {
  return new Promise((resolve, reject) => {
    console.log('🔨 3D reconstruction başlıyor...');
    console.log(`Frame sayısı: ${framePaths.length}`);
    console.log(`Çıktı: ${outputPath}`);

    const pythonScript = path.join(__dirname, 'reconstruction3D.py');
    const framesDir = path.dirname(framePaths[0]);

    // Python script'ini çalıştır
    const pythonProcess = spawn('python', [
      pythonScript,
      framesDir,
      outputPath
    ]);

    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      const message = data.toString();
      console.log('Python:', message);
      outputData += message;
    });

    pythonProcess.stderr.on('data', (data) => {
      const message = data.toString();
      console.error('Python Error:', message);
      errorData += message;
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Python script hata kodu: ${code}`);
        reject(new Error(`3D reconstruction failed: ${errorData}`));
      } else {
        console.log('✅ 3D model başarıyla oluşturuldu');
        resolve(outputPath);
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('❌ Python process hatası:', err);
      reject(err);
    });
  });
};

/**
 * Video'dan 3D model oluşturma - tam pipeline
 * @param {string} videoPath - Video dosya yolu
 * @param {string} modelName - Model adı
 * @returns {Promise<object>} - Model bilgileri
 */
const processVideoTo3D = async (videoPath, modelName) => {
  try {
    console.log('🚀 Video → 3D Model pipeline başlıyor...');

    // 1. Frame extraction için klasör oluştur
    const timestamp = Date.now();
    const framesDir = path.join(__dirname, '../../uploads/frames', `${modelName}-${timestamp}`);
    
    // 2. Video'dan frame'leri çıkar
    console.log('📸 Frame extraction...');
    const framePaths = await extractFrames(videoPath, framesDir);

    if (framePaths.length < 10) {
      throw new Error('Yeterli frame bulunamadı. En az 10 frame gerekli.');
    }

    // 3. 3D model çıktı yolu
    const modelsDir = path.join(__dirname, '../../uploads/models');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }

    const modelFileName = `${modelName}-${timestamp}.glb`;
    const modelPath = path.join(modelsDir, modelFileName);

    // 4. 3D reconstruction
    console.log('🔨 3D reconstruction...');
    await reconstruct3D(framePaths, modelPath);

    // 5. Dosya boyutunu al
    const stats = fs.statSync(modelPath);
    const fileSizeInBytes = stats.size;

    // 6. Geçici frame'leri temizle (opsiyonel)
    // fs.rmSync(framesDir, { recursive: true, force: true });

    console.log('✅ Pipeline tamamlandı!');

    return {
      modelUrl: `/uploads/models/${modelFileName}`,
      fileName: modelFileName,
      fileSize: fileSizeInBytes,
      frameCount: framePaths.length,
      framesDir: framesDir
    };

  } catch (error) {
    console.error('❌ Pipeline hatası:', error);
    throw error;
  }
};

module.exports = {
  extractFrames,
  reconstruct3D,
  processVideoTo3D
};