/** 视为成功的业务状态码，与后端约定后在此维护 */
export const SUCCESS_CODES: ReadonlySet<number> = new Set([0, 200]);

export function isSuccess(code: unknown): boolean {
  return typeof code === 'number' && SUCCESS_CODES.has(code);
}

/** 业务错误但未返回 msg 时的兜底文案 */
export const DEFAULT_BUSINESS_ERROR_MESSAGE = '操作失败，请稍后重试';
