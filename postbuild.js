/**
 * Post-build script — Creates physical folders for all SPA routes
 * so Apache/Hostinger can find them without mod_rewrite.
 * Also copies PHP scripts and .htaccess to dist/.
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, 'dist');
const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf-8');

// All routes that need physical folders
const routes = [
  'admin',
  'admin/products',
  'admin/products/new',
  'admin/orders',
  'admin/reels',
  'admin/analytics',
  'admin/settings',
  'collections/men',
  'collections/women',
  'collections/unisex',
  'checkout',
  'order-confirmed',
  'terms',
  'privacy',
  'contact',
];

// Create a folder + index.html for each route
for (const route of routes) {
  const dir = join(distDir, route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), indexHtml);
}

// Also create 404.html at dist root
writeFileSync(join(distDir, '404.html'), indexHtml);

// ─── Copy PHP scripts into dist for Hostinger deployment ───

const phpFiles = ['api-proxy.php', 'upload.php', 'serve-upload.php'];
for (const file of phpFiles) {
  try {
    const content = readFileSync(join(__dirname, file));
    writeFileSync(join(distDir, file), content);
    console.log(`✅ Copied ${file} to dist/`);
  } catch (e) {
    console.warn(`⚠️ ${file} not found, skipping`);
  }
}

// ─── Copy .htaccess into dist ───
try {
  const htaccess = readFileSync(join(__dirname, '.htaccess'));
  writeFileSync(join(distDir, '.htaccess'), htaccess);
  console.log('✅ Copied .htaccess to dist/');
} catch (e) {
  console.warn('⚠️ .htaccess not found, skipping');
}

// NOTE: Uploads are now stored OUTSIDE public_html in /home/<user>/tarik_uploads/
// No need to create uploads/ directories in dist — they would just get wiped on deploy anyway.
// Files are served via serve-upload.php (rewritten by .htaccess).

console.log(`✅ Created ${routes.length} route folders + 404.html in dist/`);
