# PluHub Spec

公开契约：schemas/manifest.schema.json、schemas/host-config.schema.json、src/index.ts、独立可选的 src/ai.ts。

~~~sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm check:compat
~~~

发布包 @pluhub/contracts。Schema、TS 类型与共享样例随同一个版本发布。compat/v1 是 Manifest v1 基线；同一主版本不得删除属性、收紧类型或添加必填字段。

Manifest v1 的可选 `ui.group`、`ui.order` 支持控制台聚合设置；`ui.pages` 额外声明同一前端模块的页面，每页独立声明可见性，默认仅管理员可见。旧的单页声明继续兼容，`pnpm check:compat` 检查既有基线。

可选 `category` 标注插件管理分类，使用 1–64 位小写字母、数字、点或连字符，以字母开头。官方分类为 `core`（基础设施）、`identity`（账号与验证）、`routing`（渠道与路由）、`ingress`（入口协议）、`upstream`（上游适配）、`commerce`（计费与支付）、`traffic`（流量控制）、`operations`（观测与支持）、`tools`（模型工具）。第三方可声明自定义分类；未声明的旧插件继续兼容，控制台按公开元数据兼容识别，无法识别时显示为“其他”。分类只用于展示和筛选，不影响加载、依赖和授权。

可选领域模块 `/workflow` 定义渠道工作流节点、配置和结果；`/ai` 的计划增加可选响应模型、重定向路径、工作流轨迹与输出策略。通用 Kernel、Engine 和 Runtime 不依赖这些领域模块。

`/analytics` 定义用户公开目录、内部聚合查询及脱敏后的排行榜响应。排行榜只返回汇总用量，不包含用户内部 ID、邮箱、凭证或请求明细。

`observability.model-metrics@1` 按目录指定的平台模型与渠道聚合近 24 小时数据，排除个人渠道。延迟只统计成功请求，首 Token 延迟与输出 TPS 只统计流式请求；TPS 使用排除思考 Token 后的可见输出 Token 除以首末输出内容事件间的总秒数，单块响应不计入。缓存命中率以明确报告缓存读取用量的成功请求为分母，未知用量不当作未命中。公开目录移除内部渠道关联，只发布汇总指标及样本数。

`/subscription` 的 `SubscriptionQuota` 支持提供商自有的周期标识、可选展示名称与更新时间，兼容既有 `primary`、`secondary` 周期，用于展示模型或功能专属的订阅额度。

`/ai` 的 `AIRequest.sessionId` 是入口根据客户端会话信息生成的内部隔离标识，经过渠道和提供商节点作用域派生后传给上游。`/subscription` 的 `acquire.sessionId` 用于持久会话账号绑定，不替代 `ownerId` 的归属检查或 `ids` 的渠道授权范围。

`/subscription` 的 `availability` 按账号归属与上游模型查询池状态，不占用并发租约；`acquire.model` 与 `excludeIds` 支持模型额度隔离和请求内去重切换。`report.quotaExhausted`、`resetAt` 表示明确的额度拒绝及重置提示，成功的额度控制查询负责解除冷却。调用方对返回的每个租约独立执行 `release`，且只在响应尚未返回事件时切换账号。

`SiteBranding` 定义 `site.branding@1` 的站点名称、默认语言与主题色；不包含管理配置。`/security` 的 `MailMessage` 支持可选 HTML 正文，同时保留必填纯文本正文，兼容既有 `mail.send@1` 调用。

`/security` 的 `CaptchaOptions` 通过可选 `provider` 区分 Turnstile、reCAPTCHA 和极验 v4，省略时兼容旧 Turnstile 提供商。reCAPTCHA 可声明 v2/v3 版本和官方服务域名。`AuthenticationOptions.captchaProvider` 提供通用前端配置，旧 `turnstile` 字段仅用于 Turnstile；`CaptchaVerification.token` 为提供商令牌或极验 v4 验证结果的 JSON 字符串。

进程协议 v1 使用 UTF-8 JSON-RPC 2.0，每行一个消息，最大 1 MiB；stdout 只输出协议，日志写 stderr。

宿主依次调用 plugin.initialize、plugin.health。初始化结果返回 protocolVersion: 1 与声明一致的能力列表。capability.invoke 接收 capability、input、config 与 contextId，其中 config 是当前调用的插件配置快照。$/cancelRequest 携带调用 id；调用有超时。排空和停止使用 plugin.drain、plugin.stop。

插件可反向调用 host.call、host.secret、host.log。控制通道不传输逐 Chunk 数据。进程外执行本身不等于沙箱。

请求内的 host.call、host.secret 应携带原 capability.invoke 的 contextId，宿主恢复该请求的配置及能力绑定快照，并传递取消信号。调用完成后不得继续复用 contextId；未知或过期的标识会被拒绝。Go SDK 自动传递 Handler Context 中的标识。

生命周期：Discovered → Validated → Installed → Resolved → Starting → Ready → Active → Draining → Stopped，另有 Failed 状态。

请求阶段：Ingress、Identity、Planning、Admission、Execution、Streaming、Finalize。Finalize 在取消后仍执行。依赖图与执行图独立；请求绑定配置快照。

许可证：Apache-2.0。
