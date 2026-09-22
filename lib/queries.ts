import 'server-only';
import {admin} from './server';
import type {Startup} from './data';

type LeaderboardRow={id:string;slug:string;name:string;url:string;domain:string;description:string;category:string;logo_url:string|null;total:number;created_at:string};
const map=(row:LeaderboardRow):Startup=>({id:row.id,slug:row.slug,name:row.name,url:row.url,domain:row.domain,description:row.description,category:row.category,logo:row.logo_url||undefined,total:Number(row.total||0),createdAt:row.created_at});

export async function getLeaderboard():Promise<Startup[]>{const db=admin();if(!db)return[];const {data,error}=await db.from('startup_leaderboard').select('*').order('total',{ascending:false}).order('created_at',{ascending:true});if(error){console.error('Leaderboard query failed:',error.code);return[]}return (data as LeaderboardRow[]).map(map)}

export async function getStartupBySlug(slug:string):Promise<Startup|null>{const db=admin();if(!db)return null;const {data,error}=await db.from('startup_leaderboard').select('*').eq('slug',slug).maybeSingle();if(error||!data)return null;return map(data as LeaderboardRow)}
