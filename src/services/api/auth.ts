// @ts-ignore
/* eslint-disable */
import request from '@/lib/openapi-request';

/** 此处后端没有提供注释 POST /api/auth/login */
export async function authControllerLogin(
  body: API.LoginDto,
  options?: import('@/lib/request').HttpRequestConfig
) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.AuthSessionDataDto;
    requestId: string;
  }>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: body,
    ...(options || {})
  });
}

/** 此处后端没有提供注释 POST /api/auth/register */
export async function authControllerRegister(
  body: API.RegisterDto,
  options?: import('@/lib/request').HttpRequestConfig
) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.AuthSessionDataDto;
    requestId: string;
  }>('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: body,
    ...(options || {})
  });
}
