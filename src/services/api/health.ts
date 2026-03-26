// @ts-ignore
/* eslint-disable */
import request from '@/lib/openapi-request';

/** 此处后端没有提供注释 GET /api/health */
export async function appControllerHealth(
  options?: import('@/lib/request').HttpRequestConfig
) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.HealthDataDto;
    requestId: string;
  }>('/api/health', {
    method: 'GET',
    ...(options || {})
  });
}
