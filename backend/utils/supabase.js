import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export const supabase = createClient(
  "https://xwkrbhadnpnkbjiyzbvh.supabase.co",
 "sb_publishable_x3r1xyeLxuQ76pfjqwkwNQ_9vfNeYr5"
);

export const supabaseAdmin = createClient(
  "https://xwkrbhadnpnkbjiyzbvh.supabase.co",
  "sb_publishable_x3r1xyeLxuQ76pfjqwkwNQ_9vfNeYr5"
);
