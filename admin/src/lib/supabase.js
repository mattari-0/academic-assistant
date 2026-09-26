import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hdheotqkjxnvplgphnms.supabase.co';
const supabaseKey = 'sb_publishable_i9PuToqD7zJ2e8uJD0q3mw_U2FUdr1K';

export const supabase = createClient(supabaseUrl, supabaseKey);
