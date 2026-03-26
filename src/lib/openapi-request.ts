'use client';

import type { AxiosRequestConfig } from 'axios';

import axiosInstance from '@/lib/request';

/**
 * 与 @umijs/openapi 生成代码兼容的 (url, options) 形态，内部走项目统一 Axios 实例（拦截器、Toast、Loading 等）。
 */
export default function request<T = unknown>(
  url: string,
  options?: AxiosRequestConfig
): Promise<T> {
  return axiosInstance.request({
    url,
    ...options
  }) as Promise<T>;
}
