# feishu-openclaw 开发文档

## 项目概述

飞书 (Feishu/Lark) 机器人插件，支持 **OpenClaw** 和 **Clawdbot** 双环境。

---

## 架构设计

### 双构建策略

OpenClaw 和 Clawdbot 使用不同的 plugin-sdk 模块路径，本项目采用**构建时切换**策略：

```
src/sdk.openclaw.ts   →  静态 import from "openclaw/plugin-sdk"
src/sdk.clawdbot.ts   →  静态 import from "clawdbot/plugin-sdk"
                ↓
        构建脚本复制对应版本到 src/sdk.ts
                ↓
        tsc 编译到临时目录
                ↓
dist/index.openclaw.js   ←  OpenClaw 入口 (引用 sdk.openclaw.js)
dist/index.clawdbot.js   ←  Clawdbot 入口 (引用 sdk.clawdbot.js)
dist/index.js            ←  默认入口 (= openclaw)
dist/src/sdk.openclaw.js ←  OpenClaw SDK
dist/src/sdk.clawdbot.js ←  Clawdbot SDK
dist/src/sdk.js          ←  默认 SDK (= openclaw)
```

### 为什么不能用运行时动态加载？

**这是 0.4.0 ~ 0.4.3 失败的根本原因。**

```js
// ❌ 错误方式 - 运行时 require()
try {
  sdk = require("openclaw/plugin-sdk");  // 失败！
} catch {
  sdk = require("clawdbot/plugin-sdk");  // 也失败！
}
```

**原因**：
1. OpenClaw 插件加载器使用 **jiti**，设置了 `alias: { "openclaw/plugin-sdk": <path> }`
2. 这个 alias 只在**模块加载阶段**生效
3. 代码编译成 JS 后，内部的 `require()` 是**运行时**执行的
4. 运行时 `require()` 走的是 Node 原生模块解析，**不会应用 jiti alias**
5. 所以 `require("openclaw/plugin-sdk")` 失败 → fallback → `require("clawdbot/plugin-sdk")` 也失败

**解决方案**：使用**静态 ESM import**，让 jiti 在加载模块时解析 alias：

```ts
// ✅ 正确方式 - 静态 import
export { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
```

---

## ID 体系

| 标识 | 值 | 用途 |
|------|-----|------|
| npm package name | `feishu-openclaw` | npm 安装 |
| plugin id | `feishu-openclaw` | `plugins.entries.<id>` |
| channel id | `feishu` | `channels.<id>` 配置 |

**关键区分**：
- **Plugin ID** ≠ **Channel ID**
- Plugin ID 用于插件系统识别，必须与 npm 包名一致
- Channel ID 用于消息路由配置，是 `"feishu"`
- OpenClaw 用 npm 包名创建 `plugins.entries.<key>`，所以 plugin id 必须等于 npm 包名

---

## 构建命令

```bash
# 构建所有版本（默认，用于发布）
npm run build

# 仅构建 OpenClaw 版本
npm run build:openclaw

# 仅构建 Clawdbot 版本  
npm run build:clawdbot

# 清理
npm run clean
```

---

## 发布流程

```bash
# 1. 更新版本号（自动同步 manifest）
npm version patch/minor/major

# 2. 发布到 npm
npm publish

# 3. 推送 git
git push && git push --tags
```

---

## 文件结构

```
feishu-openclaw/
├── index.ts                    # 主入口源码
├── src/
│   ├── sdk.openclaw.ts         # OpenClaw SDK 静态导出
│   ├── sdk.clawdbot.ts         # Clawdbot SDK 静态导出
│   ├── sdk.ts                  # (构建时生成，勿手动编辑)
│   ├── plugin-sdk.d.ts         # 类型声明
│   ├── channel.ts              # Channel 实现
│   ├── probe.ts                # 连通性探测 (HTTP)
│   ├── receive.ts              # 消息接收 (WebSocket)
│   ├── send.ts                 # 消息发送
│   └── ...
├── scripts/
│   ├── build.js                # 双构建脚本
│   └── sync-version.js         # 版本同步
├── openclaw.plugin.json        # OpenClaw manifest
├── clawdbot.plugin.json        # Clawdbot manifest
├── package.json
├── DEVELOPMENT.md              # 本文档
└── README.md                   # 用户文档
```

---

## 问题排查历史

### v0.4.0 ~ v0.4.3：Cannot find module 'clawdbot/plugin-sdk'

**症状**：
```
[plugins] feishu-openclaw failed to load: Cannot find module 'clawdbot/plugin-sdk'
```

**根因**：使用 `require()` 动态加载 SDK，绕过了 OpenClaw jiti loader 的 alias 机制。

**修复**：改用静态 ESM import + 双构建。

### v0.4.0 ~ v0.4.2：Plugin ID mismatch

**症状**：
```
plugin id mismatch (manifest uses "feishu", entry hints "feishu-openclaw")
```

**根因**：plugin.id 设为 `"feishu"`，但 OpenClaw 用 npm 包名 `"feishu-openclaw"` 作为 entry key。

**修复**：统一 plugin id = `"feishu-openclaw"`（与 npm 包名一致）。

### v0.4.0：Probe API 路径错误

**症状**：
```
Cannot read properties of undefined (reading 'v3')
```

**根因**：使用了 `client.bot.v3.botInfo.get()` 但 SDK 中不存在。

**修复**：改用 HTTP 直接请求 `tenant_access_token/internal` 验证凭据。

### v0.4.4 ~ v0.4.5：构建脚本问题

**症状**：`sdk.js` 被最后一次构建覆盖为 clawdbot 版本。

**修复**：构建脚本改为输出到临时目录，最后合并并 patch import 路径。

---

## 已知问题（非阻塞）

### Doctor warning: `plugins.entries.feishu: plugin not found`

**现象**：`openclaw gateway status` 或 `openclaw doctor` 显示 warning。

**原因**：Doctor 检查逻辑在找 `plugins.entries.feishu`，但实际 key 是 `plugins.entries.feishu-openclaw`。

**影响**：无。只是 warning，不影响实际运行。`openclaw status` 显示 `Feishu: ON | OK` 即正常。

---

## 本地测试

### 方案 A：使用 profile 隔离

```bash
# 创建测试 profile
openclaw --profile test plugins install ~/Projects/openclaw-feishu
openclaw --profile test gateway start
```

### 方案 B：符号链接

```bash
# 链接到 extensions 目录
ln -s ~/Projects/openclaw-feishu ~/.openclaw/extensions/feishu-openclaw

# 每次修改后重新构建
npm run build
openclaw gateway restart
```

---

## 经验教训

1. **不要假设模块解析机制**
   - OpenClaw 使用 jiti 加载插件，有 alias 机制
   - jiti alias 只对模块加载时的 import 生效，不对运行时 require 生效
   - 静态 import 比运行时 require 更可预测

2. **Plugin ID 必须与 npm 包名一致**
   - OpenClaw 用 npm 包名作为 `plugins.entries.<key>`
   - 但 Channel ID 可以不同

3. **版本号同步**
   - 使用 `npm version` hook 自动同步 manifest 版本
   - 避免 manifest 版本与 npm 版本不一致导致混乱

4. **双构建需要完整隔离**
   - 不同环境的构建产物不能互相覆盖
   - 输出到临时目录，最后合并
   - 需要 patch import 路径指向正确的 SDK
