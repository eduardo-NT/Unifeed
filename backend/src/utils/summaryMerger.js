/**
 * Summary Merger Utility
 * Handles combining batch summaries into question and form summaries
 */

class SummaryMerger {
  /**
   * Merge multiple batch summaries into a single question summary
   * @param {Array} batchSummaries - Array of batch summary objects
   * @param {Object} questionMeta - Question metadata (title, type, etc.)
   * @returns {Object} Merged question summary
   */
  static mergeBatchSummaries(batchSummaries, questionMeta = {}) {
    if (!Array.isArray(batchSummaries) || batchSummaries.length === 0) {
      return this.createEmptyQuestionSummary(questionMeta);
    }
    
    const merged = {
      questionId: questionMeta.questionId,
      questionTitle: questionMeta.questionTitle || 'Unknown Question',
      questionType: questionMeta.questionType || 'unknown',
      totalResponses: 0,
      totalBatches: batchSummaries.length,
      summary: '',
      keyThemes: [],
      sentiment: null,
      statistics: {
        uniqueAnswers: new Set(),
        commonPatterns: {},
        responseDistribution: {}
      },
      metadata: {
        mergedAt: new Date().toISOString(),
        processingDuration: 0,
        batchIds: []
      }
    };
    
    let allSummaryTexts = [];
    let allKeyThemes = [];
    let sentimentScores = [];
    let totalProcessingTime = 0;
    
    // Process each batch summary
    batchSummaries.forEach(batchSummary => {
      if (!batchSummary) return;
      
      // Accumulate response counts
      merged.totalResponses += batchSummary.responseCount || 0;
      
      // Collect summaries and themes
      if (batchSummary.summary) {
        allSummaryTexts.push(batchSummary.summary);
      }
      
      if (batchSummary.keyThemes && Array.isArray(batchSummary.keyThemes)) {
        allKeyThemes.push(...batchSummary.keyThemes);
      }
      
      // Collect sentiment scores
      if (batchSummary.sentiment && typeof batchSummary.sentiment.score === 'number') {
        sentimentScores.push(batchSummary.sentiment.score);
      }
      
        // Merge statistics
        if (batchSummary.statistics) {
          // Combine unique answers
          if (batchSummary.statistics.uniqueAnswers) {
            if (typeof batchSummary.statistics.uniqueAnswers === 'number') {
              // If it's already a count, add it to our current count
              merged.statistics.uniqueAnswers.add(batchSummary.statistics.uniqueAnswers);
            } else if (Array.isArray(batchSummary.statistics.uniqueAnswers)) {
              batchSummary.statistics.uniqueAnswers.forEach(answer => {
                merged.statistics.uniqueAnswers.add(JSON.stringify(answer));
              });
            }
          }
          
          // Merge common patterns
          if (batchSummary.statistics.commonPatterns) {
            Object.keys(batchSummary.statistics.commonPatterns).forEach(pattern => {
              merged.statistics.commonPatterns[pattern] = 
                (merged.statistics.commonPatterns[pattern] || 0) + 
                batchSummary.statistics.commonPatterns[pattern];
            });
          }
          
          // Merge response distribution
          if (batchSummary.statistics.responseDistribution) {
            Object.keys(batchSummary.statistics.responseDistribution).forEach(key => {
              merged.statistics.responseDistribution[key] = 
                (merged.statistics.responseDistribution[key] || 0) + 
                batchSummary.statistics.responseDistribution[key];
            });
          }
        }      // Track metadata
      totalProcessingTime += batchSummary.processingDuration || 0;
      if (batchSummary.batchId) {
        merged.metadata.batchIds.push(batchSummary.batchId);
      }
    });
    
    // Create consolidated summary
    merged.summary = this.consolidateSummaryTexts(allSummaryTexts, questionMeta.questionType);
    
    // Consolidate key themes
    merged.keyThemes = this.consolidateKeyThemes(allKeyThemes);
    
    // Calculate average sentiment
    if (sentimentScores.length > 0) {
      const avgScore = sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;
      merged.sentiment = {
        score: Math.round(avgScore * 100) / 100,
        label: this.getSentimentLabel(avgScore),
        confidence: this.calculateSentimentConfidence(sentimentScores)
      };
    }
    
    // Finalize statistics
    merged.statistics.uniqueAnswers = merged.statistics.uniqueAnswers.size;
    merged.metadata.processingDuration = totalProcessingTime;
    
    return merged;
  }
  
  /**
   * Merge question summaries into a form summary
   * @param {Array} questionSummaries - Array of question summary objects
   * @param {Object} formMeta - Form metadata
   * @returns {Object} Merged form summary
   */
  static mergeQuestionSummaries(questionSummaries, formMeta = {}) {
    if (!Array.isArray(questionSummaries) || questionSummaries.length === 0) {
      return this.createEmptyFormSummary(formMeta);
    }
    
    const merged = {
      formId: formMeta.formId || 'unknown',
      formTitle: formMeta.formTitle || 'Unknown Form',
      totalQuestions: questionSummaries.length,
      totalResponses: 0,
      overview: '',
      keyInsights: [],
      questionSummaries: questionSummaries,
      overallSentiment: null,
      metadata: {
        mergedAt: new Date().toISOString(),
        totalProcessingDuration: 0,
        questionIds: []
      }
    };
    
    let allInsights = [];
    let allSentiments = [];
    let totalProcessingTime = 0;
    
    // Process each question summary
    questionSummaries.forEach(questionSummary => {
      if (!questionSummary) return;
      
      // Accumulate totals
      merged.totalResponses = Math.max(merged.totalResponses, questionSummary.totalResponses || 0);
      
      // Collect insights
      if (questionSummary.keyThemes) {
        allInsights.push(...questionSummary.keyThemes);
      }
      
      // Collect sentiments
      if (questionSummary.sentiment && typeof questionSummary.sentiment.score === 'number') {
        allSentiments.push(questionSummary.sentiment.score);
      }
      
      // Track metadata
      totalProcessingTime += questionSummary.metadata?.processingDuration || 0;
      if (questionSummary.questionId) {
        merged.metadata.questionIds.push(questionSummary.questionId);
      }
    });
    
    // Create form overview
    merged.overview = this.createFormOverview(questionSummaries, formMeta);
    
    // Consolidate insights
    merged.keyInsights = this.consolidateKeyThemes(allInsights);
    
    // Calculate overall sentiment
    if (allSentiments.length > 0) {
      const avgScore = allSentiments.reduce((a, b) => a + b, 0) / allSentiments.length;
      merged.overallSentiment = {
        score: Math.round(avgScore * 100) / 100,
        label: this.getSentimentLabel(avgScore),
        confidence: this.calculateSentimentConfidence(allSentiments)
      };
    }
    
    merged.metadata.totalProcessingDuration = totalProcessingTime;
    
    return merged;
  }
  
  /**
   * Consolidate multiple summary texts into one
   */
  static consolidateSummaryTexts(summaryTexts, questionType) {
    if (!summaryTexts || summaryTexts.length === 0) {
      return 'No responses available for analysis.';
    }
    
    if (summaryTexts.length === 1) {
      return summaryTexts[0];
    }
    
    // For now, create a simple consolidated summary
    // In a full implementation, this could use AI to create a better consolidation
    const uniqueSummaries = [...new Set(summaryTexts)];
    
    if (uniqueSummaries.length === 1) {
      return uniqueSummaries[0];
    }
    
    return `Based on ${summaryTexts.length} batches of responses, the key findings include: ${uniqueSummaries.join(' ')}`;
  }
  
  /**
   * Consolidate key themes, removing duplicates and ranking by frequency
   */
  static consolidateKeyThemes(allThemes) {
    if (!allThemes || allThemes.length === 0) {
      return [];
    }
    
    // Count theme frequency
    const themeCount = {};
    allThemes.forEach(theme => {
      if (typeof theme === 'string') {
        themeCount[theme.toLowerCase()] = (themeCount[theme.toLowerCase()] || 0) + 1;
      }
    });
    
    // Sort by frequency and return top themes
    return Object.keys(themeCount)
      .sort((a, b) => themeCount[b] - themeCount[a])
      .slice(0, 10) // Top 10 themes
      .map(theme => ({
        theme: theme,
        frequency: themeCount[theme]
      }));
  }
  
  /**
   * Create form overview from question summaries
   */
  static createFormOverview(questionSummaries, formMeta) {
    const responseCount = Math.max(...questionSummaries.map(q => q.totalResponses || 0));
    const questionCount = questionSummaries.length;
    
    let overview = `This form received ${responseCount} responses across ${questionCount} questions. `;
    
    // Add sentiment overview if available
    const sentiments = questionSummaries
      .filter(q => q.sentiment && q.sentiment.label)
      .map(q => q.sentiment.label);
    
    if (sentiments.length > 0) {
      const sentimentCounts = {};
      sentiments.forEach(s => sentimentCounts[s] = (sentimentCounts[s] || 0) + 1);
      const dominantSentiment = Object.keys(sentimentCounts)
        .sort((a, b) => sentimentCounts[b] - sentimentCounts[a])[0];
      
      overview += `Overall sentiment appears to be ${dominantSentiment.toLowerCase()}. `;
    }
    
    return overview;
  }
  
  /**
   * Helper methods
   */
  static getSentimentLabel(score) {
    if (score >= 0.6) return 'Positive';
    if (score >= 0.4) return 'Neutral';
    return 'Negative';
  }
  
  static calculateSentimentConfidence(scores) {
    if (scores.length === 0) return 0;
    const variance = this.calculateVariance(scores);
    return Math.max(0, 1 - variance); // Lower variance = higher confidence
  }
  
  static calculateVariance(numbers) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }
  
  static createEmptyQuestionSummary(questionMeta) {
    return {
      questionId: questionMeta.questionId,
      questionTitle: questionMeta.questionTitle || 'Unknown Question',
      questionType: questionMeta.questionType || 'unknown',
      totalResponses: 0,
      totalBatches: 0,
      summary: 'No responses available for this question.',
      keyThemes: [],
      sentiment: null,
      statistics: {
        uniqueAnswers: 0,
        commonPatterns: {},
        responseDistribution: {}
      },
      metadata: {
        mergedAt: new Date().toISOString(),
        processingDuration: 0,
        batchIds: []
      }
    };
  }
  
  static createEmptyFormSummary(formMeta) {
    return {
      formId: formMeta.formId || 'unknown',
      formTitle: formMeta.formTitle || 'Unknown Form',
      totalQuestions: 0,
      totalResponses: 0,
      overview: 'No responses available for this form.',
      keyInsights: [],
      questionSummaries: [],
      overallSentiment: null,
      metadata: {
        mergedAt: new Date().toISOString(),
        totalProcessingDuration: 0,
        questionIds: []
      }
    };
  }
}

module.exports = SummaryMerger;
