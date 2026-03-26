declare namespace API {
  type AuthSessionDataDto = {
    user: UserSessionDto;
    /** JWT Access Token */
    accessToken: string;
  };

  type CreateUserDto = {
    email: string;
    password: string;
    name?: string;
  };

  type HealthDataDto = {
    status: string;
  };

  type LoginDto = {
    email: string;
    password: string;
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

  type UpdateUserDto = {
    email?: string;
    password?: string;
    name?: string;
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
    /** ISO 8601 时间字符串 */
    createdAt: string;
    /** ISO 8601 时间字符串 */
    updatedAt: string;
  };

  type UserSessionDto = {
    id: string;
    email: string;
    name?: string;
    /** 注册接口返回时包含 */
    createdAt?: string;
  };
}
