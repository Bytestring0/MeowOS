/**
 * 工具函数统一导出
 */

export { TimeUtils, type Holiday, type TimeFormatOptions } from './time';
export { TypeEffect, type TypeEffectOptions, type TypeEffectInstance } from './typeEffect';
export { 
  ApiFetch, 
  type ApiResponse, 
  type HitokotoResponse, 
  type NewsItem, 
  type JokeResponse, 
  type PoetryResponse 
} from './apiFetch';

// 便捷导出
import { TimeUtils } from './time';
import { TypeEffect } from './typeEffect';
import { ApiFetch } from './apiFetch';

export const Time = TimeUtils;
export const Type = TypeEffect;
export const Api = ApiFetch;
