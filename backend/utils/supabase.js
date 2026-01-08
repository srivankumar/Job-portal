import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
<<<<<<< HEAD
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendEnvPath = path.join(__dirname, '..', '.env');

dotenv.config({ path: backendEnvPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);
=======

dotenv.config();

export const supabase = createClient(
  "https://xwkrbhadnpnkbjiyzbvh.supabase.co",
 "sb_publishable_x3r1xyeLxuQ76pfjqwkwNQ_9vfNeYr5"
);

export const supabaseAdmin = createClient(
  "https://xwkrbhadnpnkbjiyzbvh.supabase.co",
  "sb_publishable_x3r1xyeLxuQ76pfjqwkwNQ_9vfNeYr5"
);
>>>>>>> b2682ac6e781bf09ca869f12e70fbc2bbffda57c
