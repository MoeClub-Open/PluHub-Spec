# PluHub Spec

公开契约：schemas/manifest.schema.json、schemas/host-config.schema.json、src/index.ts、独立可选的 src/ai.ts。

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm check:compat
```

发布包 @pluhub/contracts。Schema、TS 类型与共享样例随同一个版本发布。compat/v1 是 Manifest v1 基线；同一主版本不得删除属性、收紧类型或添加必填字段。

Manifest v1 的可选 `ui.group`、`ui.order` 支持控制台聚合设置；`ui.pages` 额外声明同一前端模块的页面，每页独立声明可见性，默认仅管理员可见。旧的单页声明继续兼容，`pnpm check:compat` 检查既有基线。

可选 `category` 标注插件管理分类，使用 1–64 位小写字母、数字、点或连字符，以字母开头。官方分类为 `core`（基础设施）、`identity`（账号与验证）、`routing`（渠道与路由）、`ingress`（入口协议）、`upstream`（上游适配）、`commerce`（计费与支付）、`traffic`（流量控制）、`operations`（观测与支持）、`tools`（模型工具）。第三方可声明自定义分类；未声明的旧插件继续兼容，控制台按公开元数据兼容识别，无法识别时显示为“其他”。分类只用于展示和筛选，不影响加载、依赖和授权。

可选领域模块 `/workflow` 定义渠道工作流节点、配置和结果；`/ai` 的计划增加可选响应模型、重定向路径、工作流轨迹与输出策略。通用 Kernel、Engine 和 Runtime 不依赖这些领域模块。

`/analytics` 定义用户公开目录、内部聚合查询及脱敏后的排行榜响应。排行榜只返回汇总用量，不包含用户内部 ID、邮箱、凭证或请求明细。

`observability.model-metrics@1` 按目录指定的平台模型与渠道聚合近 24 小时数据，排除个人渠道。延迟只统计成功请求，首 Token 延迟与输出 TPS 只统计流式请求；TPS 使用排除思考 Token 后的可见输出 Token 除以首末输出内容事件间的总秒数，单块响应不计入。缓存命中率以明确报告缓存读取用量的成功请求为分母，未知用量不当作未命中。公开目录提供渠道 ID、名称、倍率、计费价格和汇总指标，不提供连接配置、上游地址或凭证。模型原价与渠道计费价格分别保留，试算使用渠道计费价格与消耗倍率。

`ai.routing@2` 与 `ai.catalog@2` 共用授权范围。平台密钥使用 `groupId`，由 Router 校验分组启停、用户和目标渠道；个人密钥使用 `channelIds`，只能读取拥有者的个人渠道。`channelId` 是当前范围内的显式选择，`x-pluhub-channel` 不能扩大范围，客户端请求体不能覆盖可信授权。未指定分组的登录会话使用默认分组。旧平台渠道绑定通过离线迁移改为受限分组，不作为另一种业务模式延续。标准 `/v1/models` 对重复模型 ID 保留默认匹配项。

`RoutingRequest.operation` 指定没有完整请求时的试算端点，实际执行仍从解码后的请求获取端点。`RoutingRequest.purpose: "quote"` 解析最终价格而不调用生成接口、远程决策器或凭证租约；条件图没有请求内容时返回 `quote_request_required`，自动路由尚未确定目标时返回 `quote_route_required`。普通执行、自动路由候选及试算共用路径解析、分组与协议检查。`AutoRoutingInput.consumptionMultiplier` 携带入口渠道倍率，使候选价格与最终计费一致；分组倍率在此基础上应用。输出节拍统一使用 `ai.output-pace@2`，自动选型仅使用 `ai.auto-routing@1`，旧能力绑定由离线迁移移除或更新。

`ModelPricing.mode: "expression"` 以 `expression` 定义价格，不能混入 `request`、`tiers` 或独立缓存价格表。表达式的 Token 系数为 USD / 百万 Token，`fixed()` 为 USD / 次；渠道与使用分组倍率在表达式金额之后应用。`PricingContext` 固定请求开始时间和所需标量参数、请求头，随路由、预留及结算传递。时间、参数和请求头不在结算时重新读取；最终快照仅保留表达式引用的标量事实，不保留提示词或认证凭证。计费档位、表达式、归一化用量与上下文随账本和调用日志保存。

`/subscription` 的 `SubscriptionQuota` 支持提供商自有的周期标识、可选展示名称与更新时间，兼容既有 `primary`、`secondary` 周期，用于展示模型或功能专属的订阅额度。

`/ai` 的 `AIRequest.sessionId` 是入口根据客户端会话信息生成的内部隔离标识，经过渠道和提供商节点作用域派生后传给上游。`/subscription` 的 `acquire.sessionId` 用于持久会话账号绑定，不替代 `ownerId` 的归属检查或 `ids` 的渠道授权范围。

`/subscription` 的 `availability` 按账号归属与上游模型查询池状态，不占用并发租约；`acquire.model` 与 `excludeIds` 支持模型额度隔离和请求内去重切换。`report.quotaExhausted`、`resetAt` 表示明确的额度拒绝及重置提示，成功的额度控制查询负责解除冷却。调用方对返回的每个租约独立执行 `release`，且只在响应尚未返回事件时切换账号。

`SiteBranding` 定义 `site.branding@1` 的站点名称、默认语言与主题色；不包含管理配置。`/security` 的 `MailMessage` 支持可选 HTML 正文，同时保留必填纯文本正文，兼容既有 `mail.send@1` 调用。

`/security` 的 `CaptchaOptions` 通过可选 `provider` 区分 Turnstile、reCAPTCHA 和极验 v4，省略时兼容旧 Turnstile 提供商。reCAPTCHA 可声明 v2/v3 版本和官方服务域名。`AuthenticationOptions.captchaProvider` 提供通用前端配置，旧 `turnstile` 字段仅用于 Turnstile；`CaptchaVerification.token` 为提供商令牌或极验 v4 验证结果的 JSON 字符串。

进程协议 v1 使用 UTF-8 JSON-RPC 2.0，每行一个消息，最大 1 MiB；stdout 只输出协议，日志写 stderr。

宿主依次调用 plugin.initialize、plugin.health。初始化结果返回 protocolVersion: 1 与声明一致的能力列表。capability.invoke 接收 capability、input、config 与 contextId，其中 config 是当前调用的插件配置快照。$/cancelRequest 携带调用 id；调用有超时。排空和停止使用 plugin.drain、plugin.stop。

插件可反向调用 host.call、host.providers、host.secret、host.log。控制通道不传输逐 Chunk 数据。进程外执行本身不等于沙箱。

请求内的 host.call、host.secret 应携带原 capability.invoke 的 contextId，宿主恢复该请求的配置及能力绑定快照，并传递取消信号。调用完成后不得继续复用 contextId；未知或过期的标识会被拒绝。Go SDK 自动传递 Handler Context 中的标识。

生命周期：Discovered → Validated → Installed → Resolved → Starting → Ready → Active → Draining → Stopped，另有 Failed 状态。

请求阶段：Ingress、Identity、Planning、Admission、Execution、Streaming、Finalize。Finalize 在取消后仍执行；每个 Hook 均会执行，结束后汇总报告错误。依赖图与执行图独立；请求绑定配置快照。

许可证：Apache-2.0。

宿主 `0.1.0-alpha.15` 起支持 `Host.providers(capability)` 和 `Host.call(capability, input, signal, providerId)`。显式提供商必须存在于该请求绑定的活动快照且声明该能力；调用方仍须声明依赖。未指定提供商时维持唯一实现/显式绑定规则。进程 RPC `host.providers` 接收 `capability` 和 `contextId`，`host.call` 增加可选 `providerId`。这些接口不暴露插件内部对象。`http.dispatch` 授权允许 Native 插件通过标准 Request 调用宿主 API，目标路由仍执行身份及权限检查。

`payments.provider@1` 使用 `/commerce` 的 `PaymentProviderStatus` 声明稳定 ID、名称、支付方式、币种、模式及续订/门户能力；Commerce 枚举并按选定插件调用。原提供商品牌专用能力已移除。`billing.request-charges@1` 接收 `{ requests: [{ id, userId }] }`（最多 500 个），返回 `RequestCharge[]`；未找到的记录不返回，不能解释成免费。

`billing.request-totals@1` 接收同样的请求身份集合（最多 5000 个，重复身份只计算一次），返回 `RequestChargeTotals`：已扣费或明确释放的请求数、待结算请求数、实际扣费及预留金额。金额单位为微美元，未找到的请求不计入已知或待结算数。观测插件按授权范围提供请求身份，计费插件只返回账本事实，不依赖日志存储。

`ModelDefinition` 包含模型展示、能力与原价，`ModelRoute` 在其上增加渠道映射和启停状态。平台和个人渠道共用定义与价格校验，渠道倍率独立保留。旧工作流插件由离线迁移转换为渠道节点，不再暴露 `ai.workflow@1` 或 `ai.converter@1`。
