/**
 * @umijs/openapi（CLI: openapi2ts）配置。
 *
 * 使用方式：
 * 1. 在后端用 Swagger/OpenAPI 定义 DTO、响应体（含登录 data 结构）。
 * 2. 启动后端后执行：`bun run openapi2ts`（或先 `schemaPath` 指向导出的 `openapi.json`）。
 * 3. 会覆盖/更新 `src/services` 下生成文件；自定义手写类型请放在不会被覆盖的文件，或生成后再合并。
 *
 */
/** @type {import('@umijs/openapi').GenerateServiceProps} */
module.exports = {
  schemaPath: 'http://127.0.0.1:8000/docs-json',
  serversPath: './src/services',
  requestLibPath: "import request from '@/lib/openapi-request'",
  requestOptionsType: "import('@/lib/request').HttpRequestConfig",
  namespace: 'API',
  isCamelCase: true,
  /** 若 OpenAPI 的 200 体为 { code, msg, data } 等包裹结构，可让生成类型指向 data 字段含义 */
  dataFields: ['data']
};
