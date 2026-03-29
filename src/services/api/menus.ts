// @ts-ignore
/* eslint-disable */
import request from '@/lib/openapi-request';

/** 菜单树（列表） 用于菜单管理及角色表单的「菜单权限」勾选；节点可挂 permission，保存角色时据此汇总 Casbin 所需权限。 GET /api/menus */
export async function menuControllerList(
  options?: import('@/lib/request').HttpRequestConfig
) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.MenuTreeDataDto;
    requestId: string;
  }>('/api/menus', {
    method: 'GET',
    ...(options || {})
  });
}

/** 创建菜单 POST /api/menus */
export async function menuControllerCreate(
  body: API.CreateMenuDto,
  options?: import('@/lib/request').HttpRequestConfig
) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.MenuDetailDto;
    requestId: string;
  }>('/api/menus', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: body,
    ...(options || {})
  });
}

/** 菜单详情 GET /api/menus/${param0} */
export async function menuControllerFindOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.MenuControllerFindOneParams,
  options?: import('@/lib/request').HttpRequestConfig
) {
  const { id: param0, ...queryParams } = params;
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.MenuDetailDto;
    requestId: string;
  }>(`/api/menus/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {})
  });
}

/** 删除菜单 删除子级菜单及关联 role_menus 由数据库级联处理。 DELETE /api/menus/${param0} */
export async function menuControllerRemove(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.MenuControllerRemoveParams,
  options?: import('@/lib/request').HttpRequestConfig
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/menus/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {})
  });
}

/** 更新菜单 PATCH /api/menus/${param0} */
export async function menuControllerUpdate(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.MenuControllerUpdateParams,
  body: API.UpdateMenuDto,
  options?: import('@/lib/request').HttpRequestConfig
) {
  const { id: param0, ...queryParams } = params;
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.MenuDetailDto;
    requestId: string;
  }>(`/api/menus/${param0}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    params: { ...queryParams },
    data: body,
    ...(options || {})
  });
}

/** 菜单树（/tree、/list 别名） 与 GET /menus 响应相同。 GET /api/menus/tree */
export async function menuControllerTree(
  options?: import('@/lib/request').HttpRequestConfig
) {
  return request<{
    success: boolean;
    code: number;
    message: string;
    data: API.MenuTreeDataDto;
    requestId: string;
  }>('/api/menus/tree', {
    method: 'GET',
    ...(options || {})
  });
}
