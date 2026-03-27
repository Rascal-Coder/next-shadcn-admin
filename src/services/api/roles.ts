// @ts-ignore
/* eslint-disable */
import request from '@/lib/openapi-request';

/** 角色列表（分页） GET /api/roles */
export async function roleControllerList(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.RoleControllerListParams,
  options?: import('@/lib/request').HttpRequestConfig
) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.RoleListDataDto;
    requestId: string;
  }>('/api/roles', {
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

/** 创建角色 权限字符即 code；菜单 id 与 GET /menus/tree 节点 id 一致，保存后按节点绑定的 permission 写入 Casbin。 POST /api/roles */
export async function roleControllerCreate(
  body: API.CreateRoleDto,
  options?: import('@/lib/request').HttpRequestConfig
) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.RoleDetailDto;
    requestId: string;
  }>('/api/roles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: body,
    ...(options || {})
  });
}

/** 角色详情 GET /api/roles/${param0} */
export async function roleControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.RoleControllerFindOneParams,
  options?: import('@/lib/request').HttpRequestConfig
) {
  const { id: param0, ...queryParams } = params;
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.RoleDetailDto;
    requestId: string;
  }>(`/api/roles/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {})
  });
}

/** 删除角色（系统内置角色不可删） DELETE /api/roles/${param0} */
export async function roleControllerRemove(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.RoleControllerRemoveParams,
  options?: import('@/lib/request').HttpRequestConfig
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/roles/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {})
  });
}

/** 更新角色 code 不可改；传入 menuIds 时全量替换菜单勾选并同步权限；不传 menuIds 则只改名称/顺序/状态/备注。 PATCH /api/roles/${param0} */
export async function roleControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.RoleControllerUpdateParams,
  body: API.UpdateRoleDto,
  options?: import('@/lib/request').HttpRequestConfig
) {
  const { id: param0, ...queryParams } = params;
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.RoleDetailDto;
    requestId: string;
  }>(`/api/roles/${param0}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    params: { ...queryParams },
    data: body,
    ...(options || {})
  });
}

/** 替换角色权限（按 permissionId） 全量替换权限 id；会清空「菜单权限」勾选；若主要用菜单树配置，请用 PATCH 角色并传 menuIds。 PATCH /api/roles/${param0}/permissions */
export async function roleControllerReplacePermissions(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.RoleControllerReplacePermissionsParams,
  body: API.UpdateRolePermissionsDto,
  options?: import('@/lib/request').HttpRequestConfig
) {
  const { id: param0, ...queryParams } = params;
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.RoleDetailDto;
    requestId: string;
  }>(`/api/roles/${param0}/permissions`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    params: { ...queryParams },
    data: body,
    ...(options || {})
  });
}

/** 权限字典（用于分配角色权限） GET /api/roles/permissions */
export async function roleControllerPermissionCatalog(
  options?: import('@/lib/request').HttpRequestConfig
) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.PermissionCatalogDto;
    requestId: string;
  }>('/api/roles/permissions', {
    method: 'GET',
    ...(options || {})
  });
}
