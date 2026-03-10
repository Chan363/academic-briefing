/**
 * 学术简报生成器
 * 生成HTML格式的学术简报
 */
class ReportGenerator {
  constructor() {
    this.template = this.getHTMLTemplate();
  }

  /**
   * 获取HTML模板
   */
  getHTMLTemplate() {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>学术简报</title>
    <style>
        body {
            font-family: "Microsoft YaHei", "SimHei", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .header .date {
            font-size: 14px;
            opacity: 0.9;
        }
        .summary {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary h2 {
            color: #667eea;
            margin-top: 0;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .article {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .article .journal {
            color: #764ba2;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .article .title-en {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .article .title-cn {
            font-size: 16px;
            color: #34495e;
            margin-bottom: 10px;
            font-weight: 500;
        }
        .article .authors {
            color: #7f8c8d;
            font-size: 13px;
            margin-bottom: 15px;
        }
        .article .section {
            margin-bottom: 15px;
        }
        .article .section-title {
            color: #667eea;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .article .section-content {
            color: #555;
            font-size: 14px;
        }
        .article .doi {
            color: #95a5a6;
            font-size: 12px;
            word-break: break-all;
        }
        .no-articles {
            background: white;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
            color: #7f8c8d;
        }
        .footer {
            text-align: center;
            color: #95a5a6;
            font-size: 12px;
            margin-top: 30px;
            padding: 20px;
            border-top: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    {{content}}
</body>
</html>
    `;
  }

  /**
   * 生成日期
   */
  getDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  }

  /**
   * 生成报告头部
   */
  generateHeader(totalArticles) {
    const date = this.getDate();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}年${yesterday.getMonth() + 1}月${yesterday.getDate()}日`;

    return `
        <div class="header">
            <h1>📚 UTD24期刊学术简报</h1>
            <div class="date">${yesterdayStr}新发表文献</div>
            <div class="date">发送日期: ${date}</div>
        </div>
        <div class="summary">
            <h2>📊 今日摘要</h2>
            <p>本次简报共收录 <strong>${totalArticles}</strong> 篇实证研究文献，涵盖UTD24期刊。</p>
            <p><em>注: 仅包含实证研究及实证+优化研究文献，纯理论研究文献已自动过滤。</em></p>
        </div>
    `;
  }

  /**
   * 生成单篇文章HTML
   */
  generateArticle(article) {
    // 如果没有中文信息，使用占位符或提示
    const titleCn = article.titleCn || '[需人工翻译] ' + article.titleEn;
    const researchQuestion = article.researchQuestion || '[待补充]';
    const researchResults = article.researchResults || '[待补充]';
    const abstractCn = article.abstractCn || '[待补充]';

    return `
        <div class="article">
            <div class="journal">📖 ${article.journal}</div>
            <div class="title-en">${article.titleEn}</div>
            <div class="title-cn">${titleCn}</div>
            <div class="authors">👤 作者: ${article.authors}</div>

            <div class="section">
                <div class="section-title">🎯 研究问题</div>
                <div class="section-content">${researchQuestion}</div>
            </div>

            <div class="section">
                <div class="section-title">📈 研究结果</div>
                <div class="section-content">${researchResults}</div>
            </div>

            <div class="section">
                <div class="section-title">📝 中文摘要</div>
                <div class="section-content">${abstractCn}</div>
            </div>

            <div class="doi">🔗 DOI: <a href="https://doi.org/${article.doi}">${article.doi}</a></div>
        </div>
    `;
  }

  /**
   * 生成无文章时的提示
   */
  generateNoArticles() {
    const date = this.getDate();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return `
        <div class="header">
            <h1>📚 UTD24期刊学术简报</h1>
            <div class="date">${yesterday.getFullYear()}年${yesterday.getMonth() + 1}月${yesterday.getDate()}日</div>
            <div class="date">发送日期: ${date}</div>
        </div>
        <div class="summary">
            <h2>📊 今日摘要</h2>
        </div>
        <div class="no-articles">
            <h3>😊 今日无新发表的实证研究文献</h3>
            <p>UTD24期刊昨日无新的实证研究文章发表，或者文章尚未被数据库收录。</p>
            <p>系统将继续每日自动监控，如有新文献将及时推送。</p>
        </div>
    `;
  }

  /**
   * 生成页脚
   */
  generateFooter() {
    return `
        <div class="footer">
            <p>本简报由智能学术助手自动生成</p>
            <p>如有问题或建议，请联系管理员</p>
            <p>数据来源: Crossref API</p>
        </div>
    `;
  }

  /**
   * 生成完整报告
   */
  generate(articles) {
    if (!articles || articles.length === 0) {
      const content = this.generateNoArticles() + this.generateFooter();
      return this.template.replace('{{content}}', content);
    }

    let content = this.generateHeader(articles.length);

    articles.forEach(article => {
      content += this.generateArticle(article);
    });

    content += this.generateFooter();

    return this.template.replace('{{content}}', content);
  }

  /**
   * 保存报告到文件
   */
  saveToFile(articles, filepath) {
    const fs = require('fs');
    const html = this.generate(articles);
    fs.writeFileSync(filepath, html, 'utf8');
    console.log(`Report saved to ${filepath}`);
    return html;
  }
}

module.exports = ReportGenerator;
