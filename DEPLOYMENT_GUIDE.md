# 🚀 部署指南

本文档将指导你完成学术简报系统的部署。

## 📋 前提条件

- 一个GitHub账号
- 一个邮箱账号（推荐QQ邮箱、Gmail或163邮箱）
- Node.js环境（仅本地测试需要）

## 🔥 快速部署（5分钟）

### 第1步：准备本地文件

1. 下载本项目所有文件到一个文件夹
2. 打开文件夹，确认包含以下文件：
   - `package.json`
   - `index.js`
   - `test.js`
   - `.env.example`
   - `README.md`
   - `config/journals.js`
   - `src/` 目录下的所有文件
   - `.github/workflows/daily-briefing.yml`

### 第2步：配置邮箱

以QQ邮箱为例（推荐）：

1. 登录QQ邮箱网页版
2. 点击右上角 **设置** → **账户**
3. 找到 **POP3/SMTP服务**，点击 **开启**
4. 按提示发送短信验证
5. 获得 **授权码**（16位字符串，记录下来）

### 第3步：创建GitHub仓库

1. 访问 https://github.com/new
2. 创建一个新的公开仓库，命名为 `academic-briefing`（或其他名称）
3. 不要初始化README、.gitignore或LICENSE
4. 点击 **Create repository**

### 第4步：上传代码

在本地文件夹中，打开终端/命令提示符：

```bash
# 初始化git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库（替换your-username为你的GitHub用户名）
git remote add origin https://github.com/your-username/academic-briefing.git

# 推送到GitHub
git push -u origin main
```

### 第5步：配置GitHub Secrets

1. 打开你的GitHub仓库
2. 点击 **Settings** 标签
3. 左侧菜单点击 **Secrets and variables** → **Actions**
4. 点击 **New repository secret**

依次添加以下Secrets（名称和值要准确对应）：

| Secret名称 | 值 |
|-----------|---|
| `EMAIL_TO` | 1192634650@qq.com |
| `EMAIL_FROM` | your-email@qq.com |
| `EMAIL_SMTP_HOST` | smtp.qq.com |
| `EMAIL_SMTP_PORT` | 587 |
| `EMAIL_SMTP_USER` | your-email@qq.com |
| `EMAIL_SMTP_PASS` | （刚才获得的16位授权码） |

每个Secret添加步骤：
1. Name 输入Secret名称（如 `EMAIL_TO`）
2. Value 输入对应的值
3. 点击 **Add secret**

### 第6步：手动触发测试

1. 在仓库页面点击 **Actions** 标签
2. 左侧选择 **Daily Academic Briefing**
3. 点击右侧 **Run workflow**
4. 选择 `main` 分支，点击绿色按钮 **Run workflow**

### 第7步：查看运行结果

1. 等待1-2分钟
2. 点击运行中的workflow查看日志
3. 确认显示"✅ 任务完成"
4. 检查邮箱是否收到测试邮件

## ✅ 部署完成！

系统将自动在每天早上8点（北京时间）发送学术简报到你的邮箱。

## 📊 监控和管理

### 查看运行历史

- 进入仓库 → Actions → 查看所有运行记录
- 点击任意运行可查看详细日志
- 可以下载生成的报告文件

### 手动触发

如果需要立即运行，重复第6步操作。

### 修改配置

如需修改：
1. 修改本地文件
2. 提交并推送到GitHub
3. 下次运行时自动使用新配置

## 📧 邮件服务对比

| 邮箱 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| QQ邮箱 | 配置简单，国内稳定 | 附件大小限制 | ⭐⭐⭐⭐⭐ |
| Gmail | 全球稳定，功能强大 | 需要科学上网 | ⭐⭐⭐⭐ |
| 163邮箱 | 国内稳定 | 配置稍复杂 | ⭐⭐⭐⭐ |

## ❓ 常见部署问题

### Q1: GitHub Actions报错"SMTP connection failed"

**解决方法**：
- 检查Secrets配置是否正确
- 确认授权码/应用密码是否有效
- 尝试使用不同的邮箱服务

### Q2: 没有收到测试邮件

**解决方法**：
- 检查垃圾邮件文件夹
- 确认接收邮箱地址正确
- 查看GitHub Actions日志中的错误信息

### Q3: Actions工作流没有自动执行

**解决方法**：
- 确认仓库是公开的
- 检查Actions是否启用（Settings → Actions → General）
- 手动触发测试（第6步）

### Q4: 定时任务执行时间不对

**解决方法**：
- GitHub Actions使用UTC时间
- UTC 0:00 = 北京时间 8:00
- 修改 `.github/workflows/daily-briefing.yml` 中的cron表达式

## 🔄 从其他邮箱迁移

如果需要更换邮件服务，只需修改GitHub Secrets中的对应值即可，无需修改代码。

## 📞 技术支持

如遇到问题：
1. 查看README.md的常见问题部分
2. 检查GitHub Actions运行日志
3. 在GitHub上提交Issue

---

**恭喜！你已经完成了学术简报系统的部署！** 🎉
