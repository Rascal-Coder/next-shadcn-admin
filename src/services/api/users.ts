// @ts-ignore
/* eslint-disable */
import request from '@/lib/openapi-request';

/** 此处后端没有提供注释 GET /api/users/me */
export async function userControllerMe(
  options?: import('@/lib/request').HttpRequestConfig
) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.UserProfileDto;
    requestId: string;
  }>('/api/users/me', {
    method: 'GET',
    ...(options || {})
  });
}
