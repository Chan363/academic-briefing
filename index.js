require('dotenv').config();
const DOIFinder = require('./src/doi-finder');
const ArticleParser = require('./src/article-parser');
const EmpiricalDetector = require('./src/empirical-detector');
const ReportGenerator = require('./src/report-generator');
const EmailSender = require('./src/email-sender');
const fs = require('fs');
const path = require('path');

/**
 * 主程序
 */
async function main() {
  console.log('='.repeat(60));
  console.log('📚 UTD24期刊学术简报系统启动');
  console.log('='.repeat(60));

  const doiFinder = new DOIFinder();
  const articleParser = new ArticleParser();
  const empiricalDetector = new EmpiricalDetector();
  const reportGenerator = new ReportGenerator();
  const emailSender = new EmailSender();

  // 创建输出目录
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // 步骤1: 搜索前一天发表的文章
    console.log('\n📖 步骤 1/5: 搜索UTD24期刊新发表文章...');
    const searchResults = await doiFinder.searchAllJournals();

    // 收集所有文章
    let allArticles = [];
    searchResults.forEach(result => {
      if (result.articles && result.articles.length > 0) {
        console.log(`  ✅ ${result.journal}: ${result.articles.length} 篇`);
        allArticles = allArticles.concat(result.articles);
      } else {
        console.log(`  ⏭️  ${result.journal}: 无新文章`);
      }
    });

    console.log(`\n📊 总计找到 ${allArticles.length} 篇文章`);

    if (allArticles.length === 0) {
      // 没有文章，发送空报告
      console.log('\n📝 生成空报告...');
      const htmlContent = reportGenerator.generate(null);
      const reportPath = path.join(outputDir, `briefing-${Date.now()}.html`);
      fs.writeFileSync(reportPath, htmlContent);

      console.log('\n📧 发送邮件...');
      const emailResult = await emailSender.sendBriefing(htmlContent, 0);

      if (emailResult.success) {
        console.log('✅ 任务完成! 已发送无新文献通知');
      } else {
        console.error('❌ 邮件发送失败:', emailResult.error);
        process.exit(1);
      }
      return;
    }

    // 步骤2: 获取文章详细元数据
    console.log('\n📖 步骤 2/5: 获取文章详细元数据...');
    const dois = allArticles.map(a => a.DOI);
    const detailedArticles = await articleParser.getBatchMetadata(dois);
    console.log(`  ✅ 成功获取 ${detailedArticles.length} 篇文章的元数据`);

    // 步骤3: 尝试获取摘要
    console.log('\n📖 步骤 3/5: 获取文章摘要...');
    for (const article of detailedArticles) {
      try {
        const abstract = await articleParser.fetchAbstract(article.doi, article.type);
        if (abstract) {
          article.abstract = abstract;
        }
        await articleParser.sleep(200);
      } catch (error) {
        console.error(`  ⚠️  获取 ${article.doi} 摘要失败`);
      }
    }

    // 步骤4: 识别实证研究文献
    console.log('\n📖 步骤 4/5: 识别实证研究文献...');
    const empiricalArticles = empiricalDetector.detectBatch(detailedArticles);
    console.log(`  ✅ 识别出 ${empiricalArticles.length} 篇实证研究文献`);

    if (empiricalArticles.length === 0) {
      console.log('  ⚠️  未找到实证研究文献，发送空报告');
      const htmlContent = reportGenerator.generate(null);
      await emailSender.sendBriefing(htmlContent, 0);
      return;
    }

    // 准备报告数据
    const reportData = empiricalArticles.map(article => ({
      titleEn: article.title,
      titleCn: '', // 暂时为空，可以后续集成翻译API
      authors: article.authors,
      journal: article.journal,
      doi: article.doi,
      researchQuestion: '', // 需要AI分析或人工标注
      researchResults: '', // 需要AI分析或人工标注
      abstractCn: article.abstract || '', // 可以后续集成翻译API
      abstractEn: article.abstract || '',
      empirical: article.empirical
    }));

    // 步骤5: 生成报告并发送邮件
    console.log('\n📖 步骤 5/5: 生成报告并发送邮件...');
    const htmlContent = reportGenerator.generate(reportData);

    // 保存报告到本地
    const reportPath = path.join(outputDir, `briefing-${Date.now()}.html`);
    reportGenerator.saveToFile(reportData, reportPath);

    // 发送邮件
    console.log('📧 发送邮件...');
    const emailResult = await emailSender.sendBriefing(htmlContent, empiricalArticles.length);

    if (emailResult.success) {
      console.log('\n' + '='.repeat(60));
      console.log('✅ 任务完成!');
      console.log(`  - 搜索文章: ${allArticles.length} 篇`);
      console.log(`  - 识别实证: ${empiricalArticles.length} 篇`);
      console.log(`  - 邮件发送: 成功`);
      console.log('='.repeat(60));
    } else {
      console.error('\n❌ 邮件发送失败:', emailResult.error);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ 程序执行出错:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行主程序
main();
