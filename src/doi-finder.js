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
   * 获取前一天的日期范围（北京时间）
   * GitHub Actions使用UTC时间，需要调整时区
   */
  getYesterdayDateRange() {
    // 获取当前时间（UTC）
    const now = new Date();

    // 转换为北京时间（UTC+8）
    const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));

    // 昨天的北京时间
    const yesterday = new Date(beijingTime.getTime() - (24 * 60 * 60 * 1000));
    yesterday.setHours(0, 0, 0, 0);

    // 将北京时间转回UTC用于API查询
    const yesterdayUTC = new Date(yesterday.getTime() - (8 * 60 * 60 * 1000));
    const endOfYesterdayUTC = new Date(yesterdayUTC.getTime() + (23 * 60 * 60 * 1000));

    return {
      start: yesterdayUTC.toISOString().split('T')[0],
      end: endOfYesterdayUTC.toISOString().split('T')[0]
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

        // 放宽匹配条件：包含期刊名称即可，不再要求完全匹配
        // 同时考虑ISSN匹配
        const matchedArticles = items.filter(item => {
          // 方法1: ISSN匹配（最准确）
          if (item.ISSN && journal.ISSN) {
            return item.ISSN.some(issn => issn === journal.ISSN);
          }

          // 方法2: 期刊名称包含匹配（更宽松）
          if (item['container-title']) {
            const containerName = item['container-title'][0] || '';
            return containerName.toLowerCase().includes(journal.name.toLowerCase()) ||
                   journal.name.toLowerCase().includes(containerName.toLowerCase());
          }

          return false;
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
