const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 文章元数据解析器
 * 从DOI和Crossref数据中提取完整的信息
 */
class ArticleParser {
  constructor() {
    this.doiBaseURL = 'https://api.crossref.org/works/';
  }

  /**
   * 标准化作者信息
   */
  parseAuthors(article) {
    if (!article.author || !Array.isArray(article.author)) {
      return [];
    }

    return article.author.map(a => {
      const given = a.given || '';
      const family = a.family || '';
      return given && family ? `${family}, ${given}` : (family || given || '');
    }).join('; ');
  }

  /**
   * 解析文章基本信息
   */
  parseBasicInfo(article) {
    return {
      doi: article.DOI || '',
      title: article.title ? article.title[0] : '',
      authors: this.parseAuthors(article),
      journal: article['container-title'] ? article['container-title'][0] : '',
      published: article['published-print'] || article['published-online'] || article['published'] || null,
      publisher: article.publisher || '',
      type: article.type || '',
      url: article.URL || '',
      subject: article.subject || []
    };
  }

  /**
   * 从Crossref API获取文章的完整元数据
   */
  async getArticleMetadata(doi) {
    try {
      const response = await axios.get(`${this.doiBaseURL}${encodeURIComponent(doi)}`, {
        headers: {
          'User-Agent': 'AcademicBriefingBot/1.0'
        },
        timeout: 10000
      });

      if (response.data.status === 'ok') {
        const article = response.data.message;
        return this.parseBasicInfo(article);
      }
      return null;
    } catch (error) {
      console.error(`Error fetching metadata for ${doi}:`, error.message);
      return null;
    }
  }

  /**
   * 批量获取文章元数据
   */
  async getBatchMetadata(dois) {
    const results = [];

    for (const doi of dois) {
      const metadata = await this.getArticleMetadata(doi);
      if (metadata) {
        results.push(metadata);
      }

      // 添加延迟避免限流
      await this.sleep(500);
    }

    return results;
  }

  /**
   * 尝试从出版社API获取文章摘要
   * 由于不同出版社API不同，这里提供一个通用的方法框架
   */
  async fetchAbstract(doi, articleType) {
    try {
      // 对于Elsevier期刊
      if (doi.startsWith('10.1016/')) {
        return await this.fetchElsevierAbstract(doi);
      }
      // 对于Wiley期刊
      else if (doi.startsWith('10.1111/') || doi.startsWith('10.1002/')) {
        return await this.fetchWileyAbstract(doi);
      }
      // 对于Springer期刊
      else if (doi.startsWith('10.1007/')) {
        return await this.fetchSpringerAbstract(doi);
      }

      return null;
    } catch (error) {
      console.error(`Error fetching abstract for ${doi}:`, error.message);
      return null;
    }
  }

  /**
   * 从Elsevier API获取摘要（需要API key）
   */
  async fetchElsevierAbstract(doi) {
    // 由于Elsevier API需要付费或注册，这里使用备用方案
    // 尝试从Crossref获取摘要信息
    try {
      const response = await axios.get(`${this.doiBaseURL}${encodeURIComponent(doi)}`, {
        headers: {
          'User-Agent': 'AcademicBriefingBot/1.0'
        }
      });

      if (response.data.status === 'ok') {
        return response.data.message.abstract || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 从Wiley获取摘要（尝试）
   */
  async fetchWileyAbstract(doi) {
    try {
      const response = await axios.get(`${this.doiBaseURL}${encodeURIComponent(doi)}`, {
        headers: {
          'User-Agent': 'AcademicBriefingBot/1.0'
        }
      });

      if (response.data.status === 'ok') {
        return response.data.message.abstract || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 从Springer获取摘要（尝试）
   */
  async fetchSpringerAbstract(doi) {
    try {
      const response = await axios.get(`${this.doiBaseURL}${encodeURIComponent(doi)}`, {
        headers: {
          'User-Agent': 'AcademicBriefingBot/1.0'
        }
      });

      if (response.data.status === 'ok') {
        return response.data.message.abstract || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ArticleParser;
