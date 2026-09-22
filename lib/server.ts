import 'server-only';
import {createClient} from '@supabase/supabase-js';

/** Admin-only database client. The secret is read exclusively on the server. */
export function admin(){
  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SECRET_KEY;
  if(!url||!key)return null;
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

export function error(message:string,status=400,code='BAD_REQUEST'){
  return Response.json({error:{code,message}},{status});
}

export const slugify=(value:string)=>value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
