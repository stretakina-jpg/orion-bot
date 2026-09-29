import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ucycjlwmgdnayebmpfmf.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjeWNqbHdtZ2RuYXllYm1wZm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2OTE5NDgsImV4cCI6MjA4MjI2Nzk0OH0.ZO_zA0cZvnVIz9oSstMRW-bKi5iLSDg2UC02M8Olync';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const ADMIN_USERS_FN_URL =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/functions/v1/admin-users';
export const ADMIN_SECRET = '#Orion12';
export const ADMIN_STORAGE_BUCKET = 'admin-files';

export const LOGO_URL =
  'https://ucycjlwmgdnayebmpfmf.supabase.co/storage/v1/object/public/admin-files/1777054984651-ORION-LOGO.png';
