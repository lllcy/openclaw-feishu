# feishu-openclaw

[![npm version](https://img.shields.io/npm/v/feishu-openclaw.svg)](https://www.npmjs.com/package/feishu-openclaw)

> **v0.2.0** — 支持 OpenClaw 和 Clawdbot 双环境

飞书 × AI 助手插件 — 无需服务器，WebSocket 长连接  
Feishu × AI Assistant plugin — no server required, WebSocket long-connection

---

## ⚠️ 安装前必做（约 5 分钟）

### 1. 创建飞书机器人

1. [飞书开放平台](https://open.feishu.cn/app) → **创建企业自建应用**
2. 添加「**机器人**」能力
3. **权限配置** → 开启：
   - `im:message`
   - `im:message.group_at_msg`  
   - `im:message.p2p_msg`
4. **版本管理** → 创建版本 → 发布上线
5. 记下 **App ID** (`cli_xxx`) 和 **App Secret**

### 2. ⚠️ 事件订阅：必须先配好 App ID/Secret

飞书要求先验证 App ID/Secret 才能配置「长连接」，所以顺序是：

```
先安装插件 → 配置 App ID/Secret → 重启 Gateway → 再去飞书开放平台配置长连接
```

---

## 📦 安装

### OpenClaw

```bash
openclaw plugins install feishu-openclaw
```

### Clawdbot

```bash
clawdbot plugins install feishu-openclaw
```

---

## 🔧 配置

### 1. 配置 App ID 和 App Secret

**OpenClaw:**
```bash
openclaw config set channels.feishu.enabled true --json
openclaw config set channels.feishu.appId "cli_你的AppID"
openclaw config set channels.feishu.appSecret "你的AppSecret"
openclaw gateway restart
```

**Clawdbot:**
```bash
clawdbot config set channels.feishu.enabled true --json
clawdbot config set channels.feishu.appId "cli_你的AppID"
clawdbot config set channels.feishu.appSecret "你的AppSecret"
clawdbot gateway restart
```

### 2. 配置飞书事件订阅

Gateway 重启后，再去飞书开放平台：

1. **事件与回调** → 添加 `im.message.receive_v1`
2. **订阅方式** → 选择 **「使用长连接接收事件」** ⚠️ 不是 Webhook！
3. 保存

### 3. 验证

```bash
openclaw status  # 或 clawdbot status
```

应该看到：
```
│ Feishu   │ ON      │ OK     │ configured                    │
```

---

## ❗ 常见问题

### 收不到消息？

| 检查项 | 说明 |
|--------|------|
| 应用已发布 | 不能是草稿状态 |
| 用「长连接」 | **不是 Webhook** |
| 权限已开启 | 三个 im 权限都要开 |

### 报错 `unknown channel id: feishu`？

这是 doctor 检查的 warning，**不影响实际运行**。只要 `openclaw status` 显示 `Feishu: ON | OK` 就是正常的。

### 群聊不回复？

@机器人，或消息末尾加问号。

---

## 特点

- ✅ **无需服务器** — WebSocket 长连接，穿透 NAT
- ✅ **双环境支持** — OpenClaw 和 Clawdbot
- ✅ **私聊 + 群聊** — 支持 @mention
- ✅ **图片文件收发**
- ✅ **多账号支持**

---

## 链接

- 📦 [npm: feishu-openclaw](https://www.npmjs.com/package/feishu-openclaw)
- 🔌 [GitHub: openclaw-feishu](https://github.com/AlexAnys/openclaw-feishu)
- 📖 [OpenClaw 文档](https://docs.openclaw.ai)
- 📖 [Clawdbot 文档](https://docs.clawd.bot)

---

## License

MIT
