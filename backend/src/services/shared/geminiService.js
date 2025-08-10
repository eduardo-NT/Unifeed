/**
 * Gemini AI Service
 * Handles intelligent analysis of survey responses for solopreneurs/indie hackers
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const batchConfig = require('../config/batchConfig');

class GeminiService {
  constructor() {
    this.config = batchConfig.ai.gemini;
    this.client = null;
    this.initializeClient();
  }
  
  /**
   * Initialize Gemini client
   */
  initializeClient() {
    if (!batchConfig.features.enableAISummary) {
      console.log('🤖 Gemini AI service disabled by configuration');
      return;
    }
    
    try {
      if (this.config.apiKey) {
        this.client = new GoogleGenerativeAI(this.config.apiKey);
        console.log('🤖 Gemini client initialized successfully');
      } else {
        console.warn('⚠️  Gemini API key not found in environment variables');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Gemini client:', error.message);
      this.client = null;
    }
  }
  
  /**
   * Check if Gemini service is available
   */
  isAvailable() {
    return this.client !== null && batchConfig.features.enableAISummary && this.config.apiKey;
  }
  
  /**
   * Main method: Analyze all responses in a batch for business insights
   * @param {Array} responses - All responses in this question batch
   * @param {Object} questionMeta - Question metadata (title, type, etc.)
   * @returns {Object} Enhanced batch summary with business intelligence
   */
  async analyzeBatch(responses, questionMeta) {
    const startTime = Date.now();
    
    if (!this.isAvailable()) {
      return this.createFallbackSummary(responses, questionMeta);
    }
    
    try {
      console.log(`🧠 Gemini analyzing ${responses.length} responses for: ${questionMeta.questionTitle}`);
      
      const analysisResult = await this.performIntelligentAnalysis(responses, questionMeta);
      
      // Structure the response for compatibility with existing system
      const enhancedSummary = {
        batchId: `gemini_batch_${Date.now()}`,
        questionId: questionMeta.questionId,
        responseCount: responses.length,
        
        // Enhanced fields
        summary: analysisResult.executiveSummary || `Analyzed ${responses.length} responses with business insights.`,
        keyThemes: analysisResult.keyThemes || [],
        sentiment: analysisResult.overallSentiment,
        
        // New business intelligence fields
        businessIntelligence: {
          criticalIssues: analysisResult.criticalIssues || [],
          quickWins: analysisResult.quickWins || [],
          featureRequests: analysisResult.featureRequests || [],
          customerSegments: analysisResult.customerSegments || [],
          actionableInsights: analysisResult.actionableInsights || []
        },
        
        // Enhanced statistics
        statistics: {
          uniqueAnswers: analysisResult.statistics?.uniqueAnswers || new Set(responses.map(r => JSON.stringify(r.value))).size,
          commonPatterns: analysisResult.statistics?.commonPatterns || {},
          responseDistribution: analysisResult.statistics?.responseDistribution || {},
          priorityDistribution: analysisResult.statistics?.priorityDistribution || {},
          sentimentDistribution: analysisResult.statistics?.sentimentDistribution || {}
        },
        
        metadata: {
          aiProvider: 'gemini',
          model: this.config.model,
          processedAt: new Date().toISOString(),
          answerCount: responses.length,
          processingType: 'business_intelligence'
        },
        
        processingDuration: Date.now() - startTime
      };
      
      console.log(`✅ Gemini analysis completed in ${enhancedSummary.processingDuration}ms`);
      return enhancedSummary;
      
    } catch (error) {
      console.error('❌ Gemini analysis failed:', error.message);
      
      if (batchConfig.features.fallbackToBasicSummary) {
        console.log('🔄 Falling back to basic summary');
        return this.createFallbackSummary(responses, questionMeta);
      }
      
      throw error;
    }
  }
  
  /**
   * Perform intelligent analysis using Gemini
   */
  async performIntelligentAnalysis(responses, questionMeta) {
    const prompt = this.createBusinessAnalysisPrompt(responses, questionMeta);
    
    try {
      const model = this.client.getGenerativeModel({ 
        model: this.config.model,
        generationConfig: {
          maxOutputTokens: this.config.maxTokens,
          temperature: this.config.temperature,
          responseMimeType: "application/json"
        },
        safetySettings: this.config.safetySettings
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();
      
      // Parse JSON response
      return JSON.parse(analysisText);
      
    } catch (error) {
      console.error('❌ Gemini API call failed:', error.message);
      throw error;
    }
  }
  
  /**
   * Create comprehensive business analysis prompt for solopreneurs
   */
  createBusinessAnalysisPrompt(responses, questionMeta) {
    const questionType = questionMeta.questionType || 'unknown';
    const questionTitle = questionMeta.questionTitle || 'Untitled Question';
    
    // Extract actual response content based on question type
    const responseContents = this.extractResponseContents(responses, questionType);
    
    return `You are a business intelligence analyst helping a solopreneur/indie hacker understand their customer feedback.

CONTEXT:
- Question: "${questionTitle}" (Type: ${questionType})
- Total Responses: ${responses.length}
- Business Focus: Extract actionable insights for product/business improvement

ALL CUSTOMER RESPONSES TO ANALYZE:
${responseContents.map((content, index) => `${index + 1}. ${content}`).join('\n')}

ANALYSIS REQUIREMENTS:
Analyze EVERY SINGLE response above and provide business intelligence in the following JSON structure:

{
  "executiveSummary": "2-3 sentences summarizing the key business takeaways from all responses",
  
  "criticalIssues": [
    {
      "issue": "description of critical problem",
      "affectedResponses": ["response numbers that mention this"],
      "businessImpact": "why this hurts the business",
      "urgency": "High/Medium/Low",
      "recommendedAction": "specific action to take"
    }
  ],
  
  "quickWins": [
    {
      "opportunity": "easy improvement to implement",
      "supportingResponses": ["response numbers"],
      "estimatedEffort": "hours/days needed",
      "expectedImpact": "what business benefit this provides"
    }
  ],
  
  "featureRequests": [
    {
      "feature": "requested feature/improvement",
      "demandLevel": "High/Medium/Low based on frequency",
      "requestingResponses": ["response numbers"],
      "businessValue": "revenue/retention impact"
    }
  ],
  
  "customerSegments": [
    {
      "segment": "type of customer (power user, casual, etc.)",
      "characteristics": "what defines this segment",
      "responsePatterns": "how they respond differently",
      "businessRelevance": "why this segment matters"
    }
  ],
  
  "keyThemes": ["theme1", "theme2", "theme3"],
  
  "overallSentiment": {
    "score": 0.7,
    "label": "Positive/Neutral/Negative",
    "reasoning": "why customers feel this way",
    "trendIndicators": "getting better/worse/stable"
  },
  
  "actionableInsights": [
    {
      "insight": "specific business insight",
      "priority": "High/Medium/Low",
      "timeframe": "immediate/this week/this month",
      "action": "what the solopreneur should do"
    }
  ],
  
  "statistics": {
    "uniqueAnswers": ${new Set(responses.map(r => JSON.stringify(r.value))).size},
    "commonPatterns": {"pattern": count},
    "responseDistribution": {"category": count},
    "priorityDistribution": {"high": count, "medium": count, "low": count},
    "sentimentDistribution": {"positive": count, "neutral": count, "negative": count}
  }
}

IMPORTANT INSTRUCTIONS:
1. Read and consider EVERY response individually
2. Focus on business impact and actionable insights
3. Prioritize findings that help the solopreneur make decisions
4. Group similar responses but don't lose unique insights
5. Provide specific, implementable recommendations
6. Return valid JSON only - no additional text`;
  }
  
  /**
   * Extract readable content from responses based on question type
   */
  extractResponseContents(responses, questionType) {
    return responses.map((response, index) => {
      let content = '';
      const value = response.value;
      
      try {
        switch (questionType) {
          case 'short_text':
          case 'long_text':
          case 'email':
          case 'phone_number':
            content = value?.text || value || 'No response';
            break;
            
          case 'multiple_choice':
          case 'picture_choice':
          case 'dropdown':
            content = value?.choice || value?.label || JSON.stringify(value);
            if (value?.other) content += ` (Other: ${value.other})`;
            break;
            
          case 'yes_no':
            content = value?.boolean ? 'Yes' : 'No';
            break;
            
          case 'opinion_scale':
          case 'rating':
            const rating = value?.number || value?.scale;
            content = `Rating: ${rating}/10`;
            break;
            
          case 'number':
            content = `Number: ${value?.number || 'Not provided'}`;
            break;
            
          case 'date':
            content = `Date: ${value?.date || 'Not provided'}`;
            break;
            
          case 'ranking':
            const choices = value?.choices || [];
            content = `Ranking: ${choices.map(c => c.label).join(' > ')}`;
            break;
            
          default:
            content = JSON.stringify(value);
        }
        
        // Ensure we have some content
        if (!content || content.trim() === '' || content === 'undefined') {
          content = 'Empty response';
        }
        
      } catch (error) {
        content = `Error parsing response: ${JSON.stringify(value)}`;
      }
      
      return content;
    });
  }
  
  /**
   * Create fallback summary when Gemini is not available
   */
  createFallbackSummary(responses, questionMeta) {
    const basicStats = this.generateBasicStatistics(responses, questionMeta.questionType);
    
    return {
      batchId: `fallback_batch_${Date.now()}`,
      questionId: questionMeta.questionId,
      responseCount: responses.length,
      summary: `Analyzed ${responses.length} responses. ${basicStats.summary}`,
      keyThemes: basicStats.themes,
      sentiment: null,
      businessIntelligence: {
        criticalIssues: [],
        quickWins: [],
        featureRequests: [],
        customerSegments: [],
        actionableInsights: []
      },
      statistics: basicStats.statistics,
      metadata: {
        aiProvider: 'fallback',
        model: 'basic_statistics',
        processedAt: new Date().toISOString(),
        answerCount: responses.length,
        processingType: 'basic'
      },
      processingDuration: 0
    };
  }
  
  /**
   * Generate basic statistics for fallback
   */
  generateBasicStatistics(responses, questionType) {
    const stats = {
      summary: '',
      themes: [],
      statistics: {
        commonPatterns: {},
        responseDistribution: {},
        uniqueAnswers: 0
      }
    };
    
    if (responses.length === 0) {
      stats.summary = 'No responses to analyze.';
      return stats;
    }
    
    // Basic analysis based on question type
    switch (questionType) {
      case 'rating':
      case 'opinion_scale':
        const ratings = responses.map(r => r.value?.number || r.value?.scale).filter(r => r !== undefined);
        if (ratings.length > 0) {
          const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          stats.summary = `Average rating: ${avg.toFixed(1)} based on ${ratings.length} responses.`;
          stats.statistics.responseDistribution = this.getRatingDistribution(ratings);
        }
        break;
        
      case 'multiple_choice':
      case 'dropdown':
        const choices = responses.map(r => r.value?.choice || r.value?.label || 'Other').filter(c => c);
        if (choices.length > 0) {
          stats.statistics.responseDistribution = this.getChoiceDistribution(choices);
          const topChoice = Object.keys(stats.statistics.responseDistribution)[0];
          stats.summary = `Most popular choice: "${topChoice}" (${stats.statistics.responseDistribution[topChoice]} responses)`;
        }
        break;
        
      case 'yes_no':
        const yesCount = responses.filter(r => r.value?.boolean === true).length;
        const noCount = responses.filter(r => r.value?.boolean === false).length;
        stats.summary = `${yesCount} Yes, ${noCount} No responses.`;
        stats.statistics.responseDistribution = { 'Yes': yesCount, 'No': noCount };
        break;
        
      default:
        stats.summary = `${responses.length} responses collected.`;
        stats.statistics.uniqueAnswers = new Set(responses.map(r => JSON.stringify(r.value))).size;
    }
    
    return stats;
  }
  
  /**
   * Helper methods for basic statistics
   */
  getRatingDistribution(ratings) {
    const distribution = {};
    ratings.forEach(rating => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });
    return Object.fromEntries(Object.entries(distribution).sort(([,a], [,b]) => b - a));
  }
  
  getChoiceDistribution(choices) {
    const distribution = {};
    choices.forEach(choice => {
      distribution[choice] = (distribution[choice] || 0) + 1;
    });
    return Object.fromEntries(Object.entries(distribution).sort(([,a], [,b]) => b - a));
  }
}

module.exports = new GeminiService();