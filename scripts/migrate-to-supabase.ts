/**
 * LeakLens - Supabase Migration and Cloud Seeding Script
 * 
 * This script:
 * 1. Verifies connectivity to Supabase Storage & Database REST API.
 * 2. Ensures the `documents` bucket exists.
 * 3. Uploads local files in storage/ to Supabase Storage.
 * 4. Backs up the complete system state (storage/db.json) to Supabase Storage.
 */

import fs from 'fs';
import path from 'path';
import {
  testSupabaseHealth,
  ensureSupabaseBucket,
  uploadToSupabaseStorage,
  backupDatabaseToSupabase,
  SUPABASE_BUCKET,
} from '../server/supabase';

async function runMigration() {
  console.log('====================================================');
  console.log('LeakLens -> Supabase Production Migration');
  console.log('====================================================');

  const health = await testSupabaseHealth();
  console.log('1. Testing Supabase Connectivity...');
  if (!health.ok) {
    console.error('Failed to connect to Supabase:', health.error);
    process.exit(1);
  }
  console.log('✓ Connected to Supabase Project:', health.projectUrl);
  console.log('✓ Storage Bucket status:', health.bucketExists ? 'Bucket exists' : 'Creating bucket...');

  await ensureSupabaseBucket();
  console.log(`✓ Bucket "${SUPABASE_BUCKET}" ready.`);

  // 2. Upload storage/db.json to Supabase
  const dbFile = path.resolve(process.cwd(), 'storage/db.json');
  if (fs.existsSync(dbFile)) {
    console.log('\n2. Synchronizing Database state to Supabase...');
    const rawData = fs.readFileSync(dbFile, 'utf-8');
    const parsed = JSON.parse(rawData);

    const backupSuccess = await backupDatabaseToSupabase(parsed);
    if (backupSuccess) {
      console.log('✓ Successfully uploaded storage/db.json to Supabase Storage (system/db.json)');
    } else {
      console.warn('⚠ Could not back up db.json to Supabase Storage');
    }

    console.log(`   - Candidates: ${parsed.candidates?.length || 0}`);
    console.log(`   - Historical Papers: ${parsed.historicalPapers?.length || 0}`);
    console.log(`   - Real Papers: ${parsed.realPapers?.length || 0}`);
    console.log(`   - Exam Metadata: ${parsed.examMetadata?.length || 0}`);
    console.log(`   - Alerts: ${parsed.alerts?.length || 0}`);
    console.log(`   - Reviews: ${parsed.reviews?.length || 0}`);
    console.log(`   - Users: ${parsed.users?.length || 0}`);
  }

  // 3. Upload local raw files if any exist
  console.log('\n3. Scanning and uploading local documents...');
  const storageRoot = path.resolve(process.cwd(), 'storage');
  let uploadedCount = 0;

  function scanAndUpload(dir: string, prefix: string) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fullPath = path.join(dir, f);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanAndUpload(fullPath, `${prefix}/${f}`);
      } else if (stat.isFile() && !f.endsWith('.tmp') && f !== 'db.json') {
        const fileBuf = fs.readFileSync(fullPath);
        const targetPath = `${prefix}/${f}`.replace(/^\/+/, '');
        const ext = path.extname(f).toLowerCase();
        let mime = 'application/octet-stream';
        if (ext === '.pdf') mime = 'application/pdf';
        else if (ext === '.png') mime = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
        else if (ext === '.json') mime = 'application/json';

        uploadToSupabaseStorage(targetPath, fileBuf, mime).then((res) => {
          if (res.success) {
            uploadedCount++;
          }
        });
      }
    }
  }

  scanAndUpload(path.join(storageRoot, 'historical'), 'historical');
  scanAndUpload(path.join(storageRoot, 'real_papers'), 'real-papers');
  scanAndUpload(path.join(storageRoot, 'candidates'), 'detected-content');
  scanAndUpload(path.join(storageRoot, 'uploads'), 'uploads');

  console.log('✓ Migration scan completed!');
  console.log('====================================================');
}

runMigration().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
