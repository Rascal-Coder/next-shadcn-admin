/** 与后端约定的统一响应体（可按实际字段名调整） */
export namespace Api {
  export interface IResponse<T = unknown> {
    code: number;
    msg: string;
    data: T;
  }
}
