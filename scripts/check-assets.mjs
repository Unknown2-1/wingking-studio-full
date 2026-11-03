import { existsSync } from 'node:fs';
import { exit } from 'node:process';
const required=[
 'legacy-nextjs/package.json',
 'legacy-nextjs/app/page.tsx',
 'legacy-nextjs/deployments/wingking-admin/src/app/admin/page.tsx',
 'apps/live-public/dist/index.html',
 'apps/live-public/dist/upload.html',
 'apps/live-public/dist/assets/main-ios-mov-360fa9fc9e2d.js',
 'apps/private-review/dist/index.html',
 'apps/private-review/dist/assets/index-DrB-Bhxf.js',
 'apps/content-manager/index.html',
 'supabase/functions/wingking-core/index.ts',
 'supabase/functions/wingking-content-manager/index.ts',
 'supabase/types/database.types.ts',
 'supabase/migrations/20261103074119_wingking_content_manager_archive_trash_activity_v1.sql'
];
const missing=required.filter(file=>!existsSync(file));
if(missing.length){console.error('Missing files:',missing.join(', '));exit(1)}
console.log('All '+required.length+' required Wingking source paths exist.');
