/**
 * 实证研究文献智能识别器
 * 通过多种方法判断一篇文章是否为实证研究
 */
class EmpiricalDetector {
  constructor() {
    // 实证研究关键词
    this.empiricalKeywords = [
      'empirical', 'analysis', 'data', 'experiment', 'survey',
      'case study', 'quantitative', 'qualitative', 'statistical',
      'regression', 'test', 'hypothesis', 'measurement',
      'empirically', 'empiric', '实证', '数据分析', '实验',
      '调查', '统计', '假设检验', '案例研究'
    ];

    // 理论/方法论文章关键词（纯非实证）
    this.theoreticalKeywords = [
      'theoretical model', 'conceptual framework', 'theory development',
      'literature review', 'meta-analysis', 'simulation',
      'optimization only', 'mathematical proof', 'algorithm only',
      '模型', '理论', '综述', '纯优化', '模拟', '算法'
    ];

    // 实证+优化组合关键词
    this.empiricalOptimizationKeywords = [
      'empirical optimization', 'data-driven optimization',
      'empirical analysis optimization', 'experiment optimization',
      '实证优化', '数据驱动优化'
    ];
  }

  /**
   * 方法1: 基于标题的关键词匹配
   */
  checkTitle(title) {
    const titleLower = title.toLowerCase();

    // 检查实证研究关键词
    const hasEmpirical = this.empiricalKeywords.some(keyword =>
      titleLower.includes(keyword)
    );

    // 检查是否是实证+优化组合
    const hasEmpiricalOptimization = this.empiricalOptimizationKeywords.some(keyword =>
      titleLower.includes(keyword)
    );

    // 检查是否是纯理论文章
    const hasTheoreticalOnly = this.theoreticalKeywords.some(keyword =>
      titleLower.includes(keyword) && !titleLower.includes('empirical') && !titleLower.includes('data')
    );

    return {
      isEmpirical: hasEmpirical || hasEmpiricalOptimization,
      isEmpiricalOptimization: hasEmpiricalOptimization,
      isTheoreticalOnly: hasTheoreticalOnly,
      confidence: hasEmpirical ? 0.6 : 0.2
    };
  }

  /**
   * 方法2: 基于摘要的分析
   */
  checkAbstract(abstract) {
    if (!abstract) {
      return { isEmpirical: false, confidence: 0 };
    }

    const abstractLower = abstract.toLowerCase();

    // 检查数据和方法相关词汇
    const dataIndicators = ['data', 'dataset', 'sample', 'survey', 'interview',
                           'experiment', 'observation', '数据库', '样本', '调查'];

    const methodIndicators = ['regression', 'analysis', 'test', 'estimate',
                             'correlation', 'factor', 'cluster', '回归',
                             '分析', '检验', '估计'];

    const resultIndicators = ['result', 'finding', 'evidence', 'significance',
                            'effect', 'relationship', '结果', '发现', '证据'];

    const hasData = dataIndicators.some(word => abstractLower.includes(word));
    const hasMethod = methodIndicators.some(word => abstractLower.includes(word));
    const hasResult = resultIndicators.some(word => abstractLower.includes(word));

    // 计算置信度
    const indicators = [hasData, hasMethod, hasResult].filter(Boolean).length;
    const confidence = indicators / 3;

    return {
      isEmpirical: indicators >= 2 || (indicators === 1 && hasData),
      hasData,
      hasMethod,
      hasResult,
      confidence
    };
  }

  /**
   * 方法3: 基于文章类型
   */
  checkType(articleType, subject) {
    const empiricalTypes = ['article', 'journal-article', 'research-article'];
    const theoreticalTypes = ['review', 'literature-review', 'editorial'];

    const isEmpiricalType = empiricalTypes.includes(articleType);
    const isTheoreticalType = theoreticalTypes.includes(articleType);

    // 检查学科领域
    const subjectStr = Array.isArray(subject) ? subject.join(' ') : '';
    const hasEmpiricalSubject = /management|finance|economics|marketing|operations/i.test(subjectStr);

    return {
      isEmpirical: isEmpiricalType && !isTheoreticalType,
      isTheoretical: isTheoreticalType,
      hasEmpiricalSubject,
      confidence: isEmpiricalType ? 0.5 : 0.3
    };
  }

  /**
   * 综合判断方法
   */
  isEmpiricalArticle(article) {
    const titleResult = this.checkTitle(article.title || '');
    const abstractResult = this.checkAbstract(article.abstract);
    const typeResult = this.checkType(article.type || '', article.subject || []);

    // 计算综合得分
    let score = 0;
    let reasons = [];

    if (titleResult.isEmpirical) {
      score += titleResult.confidence * 0.3;
      reasons.push('标题包含实证研究关键词');
    }

    if (titleResult.isEmpiricalOptimization) {
      score += 0.4; // 实证+优化权重更高
      reasons.push('实证+优化研究');
    }

    if (titleResult.isTheoreticalOnly) {
      score -= 0.5; // 纯理论文章扣分
      reasons.push('纯理论文章');
    }

    if (abstractResult.isEmpirical) {
      score += abstractResult.confidence * 0.4;
      reasons.push('摘要显示有数据分析');
    }

    if (typeResult.isEmpirical) {
      score += typeResult.confidence * 0.2;
      reasons.push('文章类型符合实证研究');
    }

    if (typeResult.isTheoretical) {
      score -= 0.3; // 理论类型文章扣分
      reasons.push('理论类型文章');
    }

    if (typeResult.hasEmpiricalSubject) {
      score += 0.1;
      reasons.push('学科领域符合管理学');
    }

    // 阈值判断
    const threshold = 0.4;

    return {
      isEmpirical: score >= threshold,
      score: Math.max(0, Math.min(1, score)),
      reasons: reasons.length > 0 ? reasons : ['无明显实证特征'],
      details: {
        title: titleResult,
        abstract: abstractResult,
        type: typeResult
      }
    };
  }

  /**
   * 批量检测文章
   */
  detectBatch(articles) {
    return articles.map(article => ({
      ...article,
      empirical: this.isEmpiricalArticle(article)
    })).filter(article => article.empirical.isEmpirical);
  }
}

module.exports = EmpiricalDetector;
