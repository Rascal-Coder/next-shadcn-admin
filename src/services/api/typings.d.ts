declare namespace API {
  type AuthSessionDataDto = {
    user: UserSessionDto;
    /** JWT Access Token */
    accessToken: string;
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
