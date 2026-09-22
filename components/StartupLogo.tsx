/* eslint-disable @next/next/no-img-element -- logo host is user-provided and uses a runtime fallback */
'use client';
import {useState} from 'react';
export function StartupLogo({domain,name,className='h-12 w-12'}:{domain?:string;name:string;className?:string}){const [failed,setFailed]=useState(false);const initials=name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();return <span className={`grid shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-[#10221b] bg-[#c9ff57] font-black ${className}`}>{domain&&!failed?<img src={`https://unavatar.io/${encodeURIComponent(domain)}?fallback=false`} alt={`${name} logo`} className="h-full w-full bg-white object-cover" onError={()=>setFailed(true)}/>:initials}</span>}
