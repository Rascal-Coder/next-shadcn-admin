// @ts-ignore
/* eslint-disable */
import request from '@/lib/openapi-request';

/** 此处后端没有提供注释 POST /api/storage/presign-upload */
export async function storageControllerPresignUpload(
  body: API.PresignUploadDto,
  options?: import('@/lib/request').HttpRequestConfig
) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.PresignUploadDataDto;
    requestId: string;
  }>('/api/storage/presign-upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: body,
    ...(options || {})
  });
}
