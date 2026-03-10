# 📚 UTD24期刊学术简报系统

这是一个自动化的学术助手系统，每天自动翻阅UTD24本管理学国际顶刊前一天新发表的文献，筛选出实证研究文献，生成学术简报并发送到指定邮箱。

## ✨ 功能特性

- 🔍 **全面检索**: 自动搜索UTD24期刊前一天发表的所有新文献
- 🎯 **智能筛选**: 准确识别实证研究文献（包括实证+优化研究）
- 📧 **自动推送**: 每天早上8点自动发送HTML格式的学术简报到邮箱
- 💰 **完全免费**: 使用GitHub Actions + 免费邮件服务，无需付费
- 📊 **格式规范**: 简报包含英文标题、作者、期刊名称、中文标题、研究问题、研究结果、中文摘要、DOI号

## 📋 简报内容

每篇文献的简报包含以下信息：

1. **英文原标题** - 文章的英文标题
2. **作者** - 英文作者列表
3. **期刊名称** - 英文期刊名称
4. **中文标题** - （暂为占位符，可后续集成翻译API）
5. **研究问题** - （暂为占位符，可后续集成AI分析）
6. **研究结果** - （暂为占位符，可后续集成AI分析）
7. **中文摘要** - （暂为占位符，可后续集成翻译API）
8. **文章DOI号** - 文章的数字对象标识符

## 🚀 快速开始

### 1. 克隆或创建项目

将本项目的所有文件复制到你的本地目录。

### 2. 安装依赖

```bash
npm install
```

### 3. 配置邮件服务

创建 `.env` 文件，参考 `.env.example` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置邮件发送信息：

```env
# 邮件配置
EMAIL_FROM=noreply@yourdomain.com
EMAIL_TO=1192634650@qq.com
EMAIL_SMTP_HOST=smtp.qq.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@qq.com
EMAIL_SMTP_PASS=your-authorization-code
```

### 4. 邮件服务配置说明

#### 使用QQ邮箱（推荐）

1. 登录QQ邮箱 → 设置 → 账户
2. 开启"POP3/SMTP服务"
3. 获取授权码（不是QQ密码）
4. 在 `.env` 中配置：
   ```env
   EMAIL_SMTP_HOST=smtp.qq.com
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_USER=your-email@qq.com
   EMAIL_SMTP_PASS=your-authorization-code
   ```

#### 使用Gmail

1. 开启两步验证
2. 生成应用专用密码
3. 在 `.env` 中配置：
   ```env
   EMAIL_SMTP_HOST=smtp.gmail.com
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_USER=your-email@gmail.com
   EMAIL_SMTP_PASS=your-app-password
   ```

#### 使用163邮箱

1. 开启SMTP服务
2. 获取授权码
3. 在 `.env` 中配置：
   ```env
   EMAIL_SMTP_HOST=smtp.163.com
   EMAIL_SMTP_PORT=465
   EMAIL_SMTP_USER=your-email@163.com
   EMAIL_SMTP_PASS=your-authorization-code
   ```

### 5. 本地测试

```bash
# 测试邮件连接
node test.js

# 运行主程序（获取当天文献）
node index.js
```

### 6. 部署到GitHub Actions

#### 步骤 1: 创建GitHub仓库

1. 在GitHub上创建一个新的公开仓库
2. 将所有文件提交到该仓库

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### 步骤 2: 配置GitHub Secrets

进入仓库 → Settings → Secrets and variables → Actions → New repository secret

添加以下Secrets：

| Secret名称 | 值 | 说明 |
|-----------|---|------|
| `EMAIL_TO` | 1192634650@qq.com | 接收邮箱 |
| `EMAIL_FROM` | your-email@qq.com | 发送邮箱 |
| `EMAIL_SMTP_HOST` | smtp.qq.com | SMTP服务器 |
| `EMAIL_SMTP_PORT` | 587 | SMTP端口 |
| `EMAIL_SMTP_USER` | your-email@qq.com | SMTP用户名 |
| `EMAIL_SMTP_PASS` | your-authorization-code | SMTP授权码 |

#### 步骤 3: 启用GitHub Actions

1. 进入仓库 → Actions
2. 确认工作流已启用
3. 可以手动触发测试：Actions → Daily Academic Briefing → Run workflow

#### 步骤 4: 查看运行日志

- Actions → Daily Academic Briefing → 查看运行详情
- 可以下载运行日志和生成的报告文件

## ⏰ 定时任务说明

GitHub Actions工作流配置为每天UTC 0:00执行，即北京时间上午8:00。

如果需要调整时间，修改 `.github/workflows/daily-briefing.yml` 中的cron表达式：

```yaml
schedule:
  - cron: '0 0 * * *'  # UTC 0:00 = 北京时间 8:00
```

## 📊 实证研究识别逻辑

系统使用多维度方法识别实证研究文献：

1. **标题关键词匹配**: 识别包含 empirical, analysis, data, experiment 等关键词
2. **摘要分析**: 检测数据、方法、结果等实证特征
3. **文章类型**: 排除纯理论文章、综述等
4. **综合评分**: 使用加权评分机制判断

**包含类型**:
- ✅ 纯实证研究
- ✅ 实证+优化研究
- ❌ 纯优化研究（已过滤）
- ❌ 纯理论文章（已过滤）

## 📁 项目结构

```
Claw/
├── .github/
│   └── workflows/
│       └── daily-briefing.yml    # GitHub Actions配置
├── config/
│   └── journals.js               # UTD24期刊列表
├── src/
│   ├── doi-finder.js             # 文献搜索模块
│   ├── article-parser.js         # 文章元数据解析
│   ├── empirical-detector.js     # 实证研究识别
│   ├── report-generator.js       # 简报生成
│   └── email-sender.js           # 邮件发送
├── output/                       # 输出目录（自动创建）
├── index.js                      # 主程序
├── test.js                       # 测试脚本
├── package.json                  # 项目配置
├── .env                          # 环境变量（需手动创建）
├── .env.example                  # 环境变量示例
└── README.md                     # 说明文档
```

## 🔧 高级配置

### 集成AI翻译（可选）

如需自动翻译标题和摘要，可以集成免费翻译API。修改 `src/report-generator.js` 添加翻译逻辑。

### 使用OpenAI进行智能分析（可选）

如需自动提取研究问题和结果，可以添加OpenAI API：

```env
# .env
OPENAI_API_KEY=your-openai-api-key
```

### 调整搜索范围

修改 `config/journals.js` 可以添加或移除期刊。

## ❓ 常见问题

### 1. 邮件发送失败

- 检查SMTP配置是否正确
- 确认授权码/应用密码是否有效
- 查看GitHub Actions运行日志

### 2. 没有找到新文献

- 期刊可能在该日期未发表新文章
- 数据库可能有延迟，文章尚未被收录
- 检查Crossref API是否正常工作

### 3. 实证研究识别不准确

- 当前的识别算法基于关键词匹配
- 可以调整 `src/empirical-detector.js` 中的关键词列表
- 后续可以集成AI进行更精确的识别

### 4. 如何手动触发运行

在GitHub仓库的Actions页面：
1. 选择 "Daily Academic Briefing"
2. 点击 "Run workflow"
3. 选择分支，点击 "Run workflow" 按钮

## 📝 注意事项

1. **免费额度**: GitHub Actions公开仓库有充足的免费额度（每月2000分钟）
2. **API限制**: Crossref API有速率限制，已添加延迟处理
3. **时区**: 定时任务使用UTC时间，注意时区转换
4. **隐私**: 不要在代码中硬编码密码，使用GitHub Secrets

## 🔄 更新日志

### v1.0.0 (初始版本)

- ✅ UTD24期刊全面检索
- ✅ 实证研究智能识别
- ✅ HTML格式简报生成
- ✅ GitHub Actions自动部署
- ✅ 免费邮件发送

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📮 联系方式

如有问题或建议，请通过以下方式联系：
- 提交GitHub Issue
- 邮箱: 1192634650@qq.com

---

**免责声明**: 本系统仅供学术参考使用，文献识别和翻译可能存在误差，请以原文为准。
