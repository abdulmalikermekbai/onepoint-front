const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

process.env.NEXT_OUTPUT_MODE = 'export';

console.log('🚀 [1/3] Начинаем сборку статического экспорта для ps.kz...');

const rootDir = path.join(__dirname, '..');
const apiDir = path.join(rootDir, 'src', 'app', 'api');
const backupApiDir = path.join(rootDir, 'src', 'api_routes_backup');
const nextDir = path.join(rootDir, '.next');
let moved = false;

(async () => {
  try {
  // Очищаем .next перед сборкой
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
  }

  // Next.js static export не поддерживает POST API роуты (заявки идут напрямую в PHP на api.onepoint.kz)
  if (fs.existsSync(apiDir)) {
    fs.renameSync(apiDir, backupApiDir);
    moved = true;
  }

  // 1. Next.js static export
  execSync('npx next build', {
    stdio: 'inherit',
    env: { ...process.env, NEXT_OUTPUT_MODE: 'export' }
  });

  const outDir = path.join(rootDir, 'out');
  const srcHtaccess = path.join(rootDir, 'public', '.htaccess');
  const destHtaccess = path.join(outDir, '.htaccess');

  // 2. Копируем .htaccess в папку out/
  if (fs.existsSync(srcHtaccess) && fs.existsSync(outDir)) {
    fs.copyFileSync(srcHtaccess, destHtaccess);
    console.log('✅ [2/3] Файл public/.htaccess успешно скопирован в out/.htaccess');
  }

  // 3. Создаем zip архив через archiver (100% совместимость с Linux/Plesk unzip)
  const zipPath = path.join(rootDir, 'onepoint-deploy.zip');
  if (fs.existsSync(zipPath)) {
    try { fs.unlinkSync(zipPath); } catch (_) {}
  }

  console.log('📦 [3/3] Создаем архив onepoint-deploy.zip для ps.kz (включая .htaccess)...');
  
  const { ZipArchive } = require('archiver');
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    output.on('close', () => {
      const sizeMb = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2);
      console.log('\n🎉 Всё готово к деплою!');
      console.log('📁 Папка с файлами: ' + outDir);
      console.log('📦 Готовый ZIP-архив: ' + zipPath + ' (' + sizeMb + ' MB)');
      resolve();
    });

    archive.on('error', (err) => reject(err));
    archive.pipe(output);
    archive.glob('**/*', { cwd: outDir, dot: true });
    archive.finalize();
  });
} catch (error) {
  console.error('❌ Ошибка во время сборки:', error);
  process.exit(1);
} finally {
  if (moved && fs.existsSync(backupApiDir)) {
    fs.renameSync(backupApiDir, apiDir);
  }
}
})();
