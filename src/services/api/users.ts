// @ts-ignore
/* eslint-disable */
import request from '@/lib/openapi-request';

/** 用户列表（分页） GET /api/users */
export async function userControllerList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UserControllerListParams,
  options?: import('@/lib/request').HttpRequestConfig
) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.UserListDataDto;
    requestId: string;
  }>('/api/users', {
    method: 'GET',
    params: {
      // page has a default value: 1
      page: '1',
      // pageSize has a default value: 10
      pageSize: '10',
      ...params
    },
    ...(options || {})
  });
}

/** 创建用户 POST /api/users */
export async function userControllerCreate(
  body: API.CreateUserDto,
  options?: import('@/lib/request').HttpRequestConfig
) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.UserProfileDto;
    requestId: string;
  }>('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: body,
    ...(options || {})
  });
}

/** 用户详情 GET /api/users/${param0} */
export async function userControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UserControllerFindOneParams,
  options?: import('@/lib/request').HttpRequestConfig
) {
  const { id: param0, ...queryParams } = params;
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.UserProfileDto;
    requestId: string;
  }>(`/api/users/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {})
  });
}

/** 删除用户 DELETE /api/users/${param0} */
export async function userControllerRemove(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UserControllerRemoveParams,
  options?: import('@/lib/request').HttpRequestConfig
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/users/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {})
  });
}

/** 更新用户 PATCH /api/users/${param0} */
export async function userControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UserControllerUpdateParams,
  body: API.UpdateUserDto,
  options?: import('@/lib/request').HttpRequestConfig
) {
  const { id: param0, ...queryParams } = params;
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.UserProfileDto;
    requestId: string;
  }>(`/api/users/${param0}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    params: { ...queryParams },
    data: body,
    ...(options || {})
  });
}

/** 当前登录用户资料 GET /api/users/me */
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
