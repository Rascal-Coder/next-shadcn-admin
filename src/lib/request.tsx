'use client';

/**
 * Axios 请求封装：Loading、业务码校验、统一 Toast、便捷 get/post 等。
 * 含 React 与 sonner，仅能在 Client Component 或客户端逻辑中引用。
 */
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios';
import { CircleX, XIcon } from 'lucide-react';
import queryString from 'query-string';
import { toast } from 'sonner';

import { Alert, AlertTitle } from '@/components/ui/alert';
import type { Api } from '@/types/api-response';
import { DEFAULT_BUSINESS_ERROR_MESSAGE, isSuccess } from '@/lib/response-code';
import { getAccessToken } from '@/lib/auth-storage';
import {
  finishRequestLoading,
  startRequestLoading
} from '@/lib/request-nprogress';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** 为 true 时跳过默认业务错误 / 网络错误的 Toast */
    skipErrorHandler?: boolean;
  }
}

export type HttpRequestConfig = AxiosRequestConfig;

type ApiResponseShape<T> = Api.IResponse<T>;

/** 解析 HTTP 或业务错误中的可读文案 */
export function getRequestErrorMessage(
  error: unknown,
  fallback = '请求失败，请稍后重试'
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string; msg?: string }
      | undefined;
    const msg = data?.msg ?? data?.message ?? data?.error ?? error.message;
    if (msg) return msg;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function resolveDefaultBaseURL(): string {
  const fromEnv =
    typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_API_URL
      : (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL);
  const trimmed = fromEnv?.trim();
  return trimmed ?? '';
}

function showDestructiveToast(message: string): void {
  toast.custom(
    (id) => (
      <div className='flex w-[min(100vw-2rem,22rem)] items-start gap-2'>
        <Alert variant='destructive' className='flex-1 shadow-md'>
          <CircleX className='size-4' />
          <AlertTitle>{message}</AlertTitle>
        </Alert>
        <button
          type='button'
          className='text-muted-foreground hover:text-foreground focus-visible:ring-ring hover:bg-accent/50 mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none [&_svg]:pointer-events-none [&_svg]:shrink-0'
          aria-label='关闭'
          onClick={() => toast.dismiss(id)}
        >
          <XIcon className='size-4' />
        </button>
      </div>
    ),
    { duration: 5000 }
  );
}

const request: AxiosInstance = axios.create({
  baseURL: resolveDefaultBaseURL(),
  timeout: 30 * 1000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false
});

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    startRequestLoading();
    const token = getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => {
    showDestructiveToast(error.message || '请求配置错误');
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response: AxiosResponse) => {
    finishRequestLoading();
    const body = response.data as Partial<ApiResponseShape<unknown>> &
      Record<string, unknown>;
    const code = body?.code;
    const msg =
      typeof body?.msg === 'string'
        ? body.msg
        : typeof body?.message === 'string'
          ? body.message
          : '';

    if (
      typeof code === 'number' &&
      !isSuccess(code) &&
      !response.config.skipErrorHandler
    ) {
      showDestructiveToast(msg || DEFAULT_BUSINESS_ERROR_MESSAGE);
    }
    return response.data;
  },
  (error: AxiosError) => {
    finishRequestLoading();
    if (!error.config?.skipErrorHandler) {
      showDestructiveToast(getRequestErrorMessage(error));
    }
    return Promise.reject(error);
  }
);

export const httpRequest = {
  get<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: HttpRequestConfig
  ): Promise<ApiResponseShape<T>> {
    const qs = queryString.stringify(params ?? {}, {
      skipNull: true,
      skipEmptyString: true
    });
    const path = qs ? `${url}${url.includes('?') ? '&' : '?'}${qs}` : url;
    return request.get(path, config) as Promise<ApiResponseShape<T>>;
  },

  post<T = unknown>(
    url: string,
    data?: object,
    config?: HttpRequestConfig
  ): Promise<ApiResponseShape<T>> {
    return request.post(url, data, config) as Promise<ApiResponseShape<T>>;
  },

  put<T = unknown>(
    url: string,
    data?: object,
    config?: HttpRequestConfig
  ): Promise<ApiResponseShape<T>> {
    return request.put(url, data, config) as Promise<ApiResponseShape<T>>;
  },

  patch<T = unknown>(
    url: string,
    data?: object,
    config?: HttpRequestConfig
  ): Promise<ApiResponseShape<T>> {
    return request.patch(url, data, config) as Promise<ApiResponseShape<T>>;
  },

  delete<T = unknown>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<ApiResponseShape<T>> {
    return request.delete(url, config) as Promise<ApiResponseShape<T>>;
  }
};

export default request;
