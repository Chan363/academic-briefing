const axios = require('axios');
const JOURNALS = require('../config/journals');

/**
 * 使用Crossref API搜索前一天发表的文献
 * Crossref是一个免费的开放数据平台，无需API key即可使用
 */
class DOIFinder {
  constructor() {
    this.crossrefBaseURL = 'https://api.crossref.org/works';
  }

  /**
   * 获取前一天的日期范围
   */
  getYesterdayDateRange() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    return {
      start: yesterday.toISOString().split('T')[0],
      end: endOfYesterday.toISOString().split('T')[0]
    };
  }

  /**
   * 搜索指定期刊在指定日期范围内发表的文章
   */
  async searchJournal(journal, dateRange) {
    try {
      // 使用期刊名称精确匹配
      const params = {
        'filter': `from-pub-date:${dateRange.start},until-pub-date:${dateRange.end}`,
        'query.container-title': journal.name,
        'rows': 100,
        'sort': 'published',
        'order': 'desc'
      };

      const response = await axios.get(this.crossrefBaseURL, {
        params,
        timeout: 30000,
        headers: {
          'User-Agent': 'AcademicBriefingBot/1.0 (mailto:academic-briefing@example.com)'
        }
      });

      if (response.data.status === 'ok') {
        const items = response.data.message.items || [];

        // 过滤出确切匹配该期刊的文章
        const matchedArticles = items.filter(item => {
          if (!item['container-title']) return false;
          const containerName = item['container-title'][0] || '';
          return containerName.toLowerCase() === journal.name.toLowerCase();
        });

        return {
          journal: journal.name,
          articles: matchedArticles
        };
      }

      return { journal: journal.name, articles: [] };
    } catch (error) {
      console.error(`Error searching journal ${journal.name}:`, error.message);
      return { journal: journal.name, articles: [], error: error.message };
    }
  }

  /**
   * 搜索所有UTD24期刊前一天发表的文章
   */
  async searchAllJournals() {
    const dateRange = this.getYesterdayDateRange();
    console.log(`Searching articles from ${dateRange.start} to ${dateRange.end}`);

    const results = [];

    // 串行搜索，避免API限流
    for (const journal of JOURNALS) {
      console.log(`Searching ${journal.name}...`);
      const result = await this.searchJournal(journal, dateRange);
      results.push(result);

      if (result.articles.length > 0) {
        console.log(`  Found ${result.articles.length} article(s)`);
      }

      // 添加延迟，避免API限流
      await this.sleep(1000);
    }

    return results;
  }

  /**
   * 工具方法：延迟
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = DOIFinder;
