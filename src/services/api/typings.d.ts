declare namespace API {
  type AuthSessionDataDto = {
    user: UserSessionDto;
    /** JWT Access Token */
    accessToken: string;
  };

  type CreateMenuDto = {
    /** 父级菜单 id；不传或 null 表示顶级 */
    parentId?: string;
    /** 菜单名称（可与 i18n 文案 key 对应） */
    name: string;
    /** 路由地址 */
    path?: string;
    /** 激活路径（用于子路由高亮父级菜单等场景） */
    activePath?: string;
    /** 绑定的权限 id（目录可为空） */
    permissionId?: string;
    /** 排序，默认 0 */
    sortOrder?: number;
    /** 默认 MENU */
    menuType?: 'DIRECTORY' | 'MENU' | 'BUTTON';
    /** 是否在菜单中显示，默认 true */
    visible?: boolean;
    /** 图标类名等 */
    icon?: string;
  };

  type CreateRoleDto = {
    /** 权限字符：唯一标识，小写字母开头，仅含小写字母、数字、下划线 */
    code: string;
    /** 角色名称 */
    name: string;
    /** 默认 ACTIVE */
    status?: 'ACTIVE' | 'DISABLED';
    /** 备注 */
    remark?: string;
    /** 菜单权限（菜单 id 全量）；保存后按节点 permission 汇总到 Casbin */
    menuIds?: string[];
  };

  type CreateUserDto = {
    email: string;
    password: string;
    name?: string;
    /** 备注（可选） */
    remark?: string;
    /** 默认 ACTIVE */
    status?: 'ACTIVE' | 'DISABLED';
  };

  type HealthDataDto = {
    status: string;
  };

  type LoginDto = {
    email: string;
    password: string;
  };

  type MenuControllerFindOneParams = {
    id: string;
  };

  type MenuControllerRemoveParams = {
    id: string;
  };

  type MenuControllerUpdateParams = {
    id: string;
  };

  type MenuDetailDto = {
    id: string;
    parentId: string;
    name: string;
    path?: string;
    /** 激活路径（用于子路由高亮父级菜单等场景） */
    activePath?: string;
    menuType: 'DIRECTORY' | 'MENU' | 'BUTTON';
    sortOrder: number;
    visible: boolean;
    icon?: string;
    /** 节点绑定的权限（目录可为空） */
    permission?: PermissionItemDto;
    createdAt: string;
    updatedAt: string;
  };

  type MenuTreeDataDto = {
    items: MenuTreeNodeDto[];
  };

  type MenuTreeNodeDto = {
    id: string;
    parentId: string;
    name: string;
    path?: string;
    /** 激活路径（用于子路由高亮父级菜单等场景） */
    activePath?: string;
    menuType: 'DIRECTORY' | 'MENU' | 'BUTTON';
    sortOrder: number;
    visible: boolean;
    icon?: string;
    /** 节点绑定的权限（目录可为空；保存角色时汇总所有勾选节点上的 permission） */
    permission?: PermissionItemDto;
    children: MenuTreeNodeDto[];
  };

  type PermissionCatalogDto = {
    items: PermissionItemDto[];
  };

  type PermissionItemDto = {
    id: string;
    code: string;
    name: string;
    /** ISO 8601 时间字符串 */
    createdAt: string;
    /** ISO 8601 时间字符串 */
    updatedAt: string;
  };

  type PresignUploadDataDto = {
    /** 预签名 PUT URL */
    url: string;
    /** 上传提示文案 */
    bucketHint: string;
  };

  type PresignUploadDto = {
    objectKey: string;
    contentType: string;
  };

  type RegisterDto = {
    email: string;
    password: string;
    name?: string;
  };

  type ResetPasswordResultDto = {
    user: UserProfileDto;
    /** 后端随机生成的新密码，仅本次响应明文返回，请管理员妥善转交用户 */
    newPassword: string;
  };

  type RoleControllerFindOneParams = {
    id: string;
  };

  type RoleControllerListParams = {
    page?: number;
    pageSize?: number;
  };

  type RoleControllerRemoveParams = {
    id: string;
  };

  type RoleControllerReplacePermissionsParams = {
    id: string;
  };

  type RoleControllerUpdateParams = {
    id: string;
  };

  type RoleDetailDto = {
    id: string;
    /** 权限字符 / 角色标识 */
    code: string;
    /** 角色名称 */
    name: string;
    /** 角色状态 */
    status: 'ACTIVE' | 'DISABLED';
    /** 备注 */
    remark: string;
    /** 已勾选的菜单 id（与菜单树节点 id 对应） */
    menuIds: string[];
    /** 当前角色在 Casbin 中的权限（由菜单勾选汇总，或由 PATCH permissions 直接分配） */
    permissions: PermissionItemDto[];
    /** ISO 8601 时间字符串 */
    createdAt: string;
    /** ISO 8601 时间字符串 */
    updatedAt: string;
  };

  type RoleListDataDto = {
    items: RoleDetailDto[];
    /** 符合条件的总条数 */
    total: number;
  };

  type UpdateMenuDto = {
    /** 父级菜单 id；传 null 表示改为顶级 */
    parentId?: string;
    /** 菜单名称 */
    name?: string;
    path?: string;
    /** 激活路径 */
    activePath?: string;
    permissionId?: string;
    sortOrder?: number;
    menuType?: 'DIRECTORY' | 'MENU' | 'BUTTON';
    visible?: boolean;
    icon?: string;
  };

  type UpdateRoleDto = {
    /** 角色名称 */
    name?: string;
    status?: 'ACTIVE' | 'DISABLED';
    /** 备注 */
    remark?: string;
    /** 传入则全量替换菜单勾选（不传则不修改菜单与由菜单汇总的权限） */
    menuIds?: string[];
  };

  type UpdateRolePermissionsDto = {
    /** 权限 id 列表（全量替换） */
    permissionIds: string[];
  };

  type UpdateUserDto = {
    email?: string;
    password?: string;
    name?: string;
    /** 备注（可选，传 null 可清空） */
    remark?: string;
    status?: 'ACTIVE' | 'DISABLED';
  };

  type UserControllerFindOneParams = {
    id: string;
  };

  type UserControllerListParams = {
    page?: number;
    pageSize?: number;
  };

  type UserControllerRemoveParams = {
    id: string;
  };

  type UserControllerResetPasswordParams = {
    id: string;
  };

  type UserControllerUpdateParams = {
    id: string;
  };

  type UserListDataDto = {
    items: UserProfileDto[];
    /** 符合条件的总条数 */
    total: number;
  };

  type UserProfileDto = {
    id: string;
    email: string;
    name: string;
    /** 备注 */
    remark: string;
    /** 主角色 code（如 super_admin），与 user_roles 一致；业务权限以 Casbin 为准 */
    roleCode: string;
    /** ACTIVE 正常；DISABLED 停用（不可登录） */
    status: 'ACTIVE' | 'DISABLED';
    /** ISO 8601 时间字符串 */
    createdAt: string;
    /** ISO 8601 时间字符串 */
    updatedAt: string;
  };

  type UserSessionDto = {
    id: string;
    email: string;
    name?: string;
    /** 备注 */
    remark?: string;
    /** 主角色 code（如 super_admin） */
    roleCode: string;
    status: 'ACTIVE' | 'DISABLED';
    /** 注册接口返回时包含 */
    createdAt?: string;
  };
}
