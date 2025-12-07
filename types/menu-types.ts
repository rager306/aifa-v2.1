// @/aifa-v2/types/menu-types.ts

import { PageData } from "./page-types";


export interface MenuCategory {
  title: string;
  href?: string;
  order?: number;
  pages: PageData[];
}

export interface RateLimitInfo {
  remaining: number;        
  total: number;        
  used: number;             
  resetAt: string;          
  percentUsed: number;    
  willResetIn: string;      
}
