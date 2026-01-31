# moltbot-feishu

[![npm version](https://img.shields.io/npm/v/moltbot-feishu.svg)](https://www.npmjs.com/package/moltbot-feishu)

让 Clawdbot/Moltbot AI 助手接入飞书，一行命令搞定。

Connect your Clawdbot/Moltbot AI assistant to Feishu (Lark) with one command.

---

## 🚀 最快安装方式 / Quickest Install

**非技术用户**：直接把这段话发给你的 Clawdbot：

> 帮我安装飞书插件：https://github.com/AlexAnys/moltbot-feishu

Clawdbot 会自动完成安装和配置引导。

**For non-technical users**: Just send this to your Clawdbot:

> Install the Feishu plugin for me: https://github.com/AlexAnys/moltbot-feishu

---

## 手动安装 / Manual Install

```bash
clawdbot plugins install moltbot-feishu
```

---

## 你必须做的事 / What You Must Do

### 1. 创建飞书机器人 / Create Feishu Bot

1. [飞书开放平台](https://open.feishu.cn/app) → 创建企业自建应用
2. 添加「机器人」能力
3. **权限配置**，开启：
   - `im:message`（发消息）
   - `im:message.group_at_msg`（群聊@消息）  
   - `im:message.p2p_msg`（私聊消息）
4. **事件订阅** → `im.message.receive_v1` → ⚠️ 选「**使用长连接接收事件**」
5. 版本管理 → 创建版本 → 发布上线
6. 记下 **App ID**（`cli_xxx`）和 **App Secret**

### 2. 配置 / Configure

```bash
clawdbot config set channels.feishu.enabled true --json
clawdbot config set channels.feishu.appId "cli_你的AppID"
clawdbot config set channels.feishu.appSecret "你的AppSecret"
clawdbot gateway restart
```

### 3. 测试 / Test

去飞书私聊或群里 @机器人 🎉

---

## ⚠️ 常见问题 / Common Issues

### 收不到消息？/ Not receiving messages?

| 检查项 | Check |
|--------|-------|
| 应用已发布（不是草稿） | App is published (not draft) |
| 事件订阅选的是「长连接」**不是** webhook | Event subscription uses "long connection", **not** webhook |
| 权限都已开启 | All permissions are enabled |

### 配置报错 `not configured`？

⚠️ **必须用 `appSecret`，不是 `appSecretPath`**

```bash
# ✅ 正确
clawdbot config set channels.feishu.appSecret "你的secret"

# ❌ 错误 — 插件不支持从文件读取
clawdbot config set channels.feishu.appSecretPath "/path/to/file"
```

### 群聊不回复？/ Bot not responding in groups?

@机器人，或消息末尾加问号。

---

## 特点 / Features

- **无需服务器** — WebSocket 长连接，本地运行
- **私聊+群聊** — 都支持
- **图片文件** — 收发都行
- **多账号** — 可同时接多个机器人

---

## 链接 / Links

- [Clawdbot 文档](https://docs.clawd.bot)
- [飞书开放平台](https://open.feishu.cn/document/home/index)
- [问题反馈 / Issues](https://github.com/AlexAnys/moltbot-feishu/issues)

## License

MIT
