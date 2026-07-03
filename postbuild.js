/**
 * Post-build script — Creates physical folders for all SPA routes
 * so Apache/Hostinger can find them without mod_rewrite.
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
  'shop',
  'checkout',
  'order-confirmed',
];

// Create a folder + index.html for each route
for (const route of routes) {
  const dir = join(distDir, route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), indexHtml);
}

// Also create 404.html at dist root
writeFileSync(join(distDir, '404.html'), indexHtml);

console.log(`✅ Created ${routes.length} route folders + 404.html in dist/`);
