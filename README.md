# PluHub Spec

PluHub 的公开类型、配置 Schema 和协议样例，以 `@pluhub/contracts` 发布。运行、部署和使用说明见 [PluHub 文档](https://github.com/MoeClub-Open/PluHub/blob/main/docs/README.md)。

## 开发

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm typecheck
pnpm test
```

Schema、TypeScript 类型和 `fixtures/` 中的样例随同一个包版本发布。通用宿主契约不依赖 AI 或支付领域类型。

## 契约目录

| 入口                                                | 内容                                                        |
| --------------------------------------------------- | ----------------------------------------------------------- |
| `@pluhub/contracts`                                 | 插件 Manifest、宿主配置、权限、能力调用、生命周期和请求阶段 |
| `/ai`                                               | 模型请求、事件、用量、渠道、模型定义、价格和路由计划        |
| `/workflow`                                         | 渠道流程节点、类型化连线、校验与执行结果                    |
| `/routing`                                          | 自动路由策略、候选与决策模型配置                            |
| `/security`                                         | 邮件、人机验证与登录配置                                    |
| `/subscription`                                     | 上游订阅账号、额度和并发租约                                |
| `/commerce`                                         | 钱包结算、商品、支付与退款事实                              |
| `/analytics`                                        | 授权聚合查询、模型指标与公开排行榜                          |
| `/workflow-data`                                    | 流程节点参数绑定、静态与动态求值规则                        |
| `/manifest.schema.json`、`/host-config.schema.json` | 插件及宿主配置校验                                          |

接口字段及单位以 `src/` 的类型说明和 `schemas/` 为准。能力版本、依赖和插件协作规则见 [插件 API](https://github.com/MoeClub-Open/PluHub/blob/main/docs/PLUGIN_API.md) 与 [插件架构](https://github.com/MoeClub-Open/PluHub/blob/main/docs/PLUGIN_ARCHITECTURE.md)。

## 版本规则

同一主版本内保持 Manifest Schema v1 核心字段稳定，`pnpm test` 校验 Schema 与共享样例。

领域能力使用各自的版本号。改变调用或数据含义时同步更新对应契约与实现，不在在线请求中叠加旧格式兼容分支。进程插件的 JSON-RPC 协议与取消、排空规则见 [插件 API](https://github.com/MoeClub-Open/PluHub/blob/main/docs/PLUGIN_API.md)。

## 许可证

[Apache-2.0](LICENSE)。
