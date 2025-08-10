/**
 * Batch Summarizer Service - Updated for Gemini Integration
 * Main service for processing survey data in batches and generating intelligent summaries
 */

const Chunker = require('../utils/chunker');
const SummaryMerger = require('../utils/summaryMerger');
const geminiService = require('./geminiService'); // Changed from aiSummaryService
const batchConfig = require('../config/batchConfig');

class BatchSummarizerService {
  constructor() {
    this.config = batchConfig;
    this.processedAnswers = new Map(); // In-memory cache for tracking processed answers
  }
  
  /**
   * Main entry point for batch processing survey responses
   * @param {Object} normalizedData - Normalized survey data
   * @param {Object} options - Processing options
   * @returns {Object} Enhanced summary with batch processing
   */
  async processSurveyData(normalizedData, options = {}) {
    console.log('🔄 Starting Gemini-powered batch processing for survey data...');
    const startTime = Date.now();
    
    try {
      // Extract answers with metadata for processing
      const answersWithMeta = this.extractAnswersWithMetadata(normalizedData);
      
      // Filter out already processed answers if incremental processing is enabled
      const newAnswers = options.incrementalOnly ? 
        this.filterNewAnswers(answersWithMeta) : 
        answersWithMeta;
      
      if (newAnswers.length === 0) {
        console.log('✅ No new answers to process');
        return this.createEmptyProcessingResult(normalizedData);
      }
      
      console.log(`📊 Processing ${newAnswers.length} answers with Gemini AI (${answersWithMeta.length - newAnswers.length} already processed)`);
      
      // Group answers by form and question, then create batches
      const batchedData = Chunker.groupAndBatchAnswers(
        newAnswers, 
        options.batchSize || this.config.batch.defaultSize
      );
      
      // Process each batch and generate summaries using Gemini
      const processedData = await this.processBatchedData(batchedData, options);
      
      // Generate final merged summary with cross-question analysis
      const finalSummary = await this.generateEnhancedSummary(processedData, normalizedData);
      
      // Mark answers as processed
      this.markAnswersAsProcessed(newAnswers);
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ Gemini batch processing completed in ${processingTime}ms`);
      
      return {
        ...finalSummary,
        batchProcessing: {
          enabled: true,
          aiProvider: 'gemini',
          processedAnswers: newAnswers.length,
          totalBatches: this.countTotalBatches(batchedData),
          processingTimeMs: processingTime,
          completedAt: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('❌ Gemini batch processing failed:', error.message);
      
      // Fallback to basic processing
      if (this.config.features.fallbackToBasicSummary) {
        console.log('🔄 Falling back to basic summary generation...');
        return this.createFallbackSummary(normalizedData);
      }
      
      throw error;
    }
  }
  
  /**
   * Process batched data by calling Gemini service for each batch
   */
  async processBatchedData(batchedData, options) {
    const processedData = {};
    
    for (const formId of Object.keys(batchedData)) {
      processedData[formId] = {
        formTitle: batchedData[formId][Object.keys(batchedData[formId])[0]]?.questionTitle || 'Unknown Form',
        questions: {}
      };
      
      for (const questionId of Object.keys(batchedData[formId])) {
        const questionData = batchedData[formId][questionId];
        console.log(`📝 Gemini processing question: ${questionData.questionTitle} (${questionData.batches?.length || 0} batches)`);
        
        // Process each batch for this question using Gemini
        const batchSummaries = await this.processBatchesForQuestion(
          questionData.batches || [], 
          questionData,
          options
        );
        
        // Merge batch summaries into question summary
        const questionSummary = SummaryMerger.mergeBatchSummaries(batchSummaries, {
          questionId: questionId,
          questionTitle: questionData.questionTitle,
          questionType: questionData.questionType
        });
        
        processedData[formId].questions[questionId] = questionSummary;
      }
    }
    
    return processedData;
  }
  
  /**
   * Process all batches for a specific question using Gemini
   */
  async processBatchesForQuestion(batches, questionMeta, options) {
    const batchSummaries = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`  📦 Gemini processing batch ${i + 1}/${batches.length} (${batch.answers.length} responses)`);
      
      try {
        // Use Gemini for intelligent analysis
        let batchSummary;
        if (this.shouldUseAIForQuestion(questionMeta, batch.answers.length) && geminiService.isAvailable()) {
          batchSummary = await geminiService.analyzeBatch(batch.answers, questionMeta);
        } else {
          batchSummary = this.createBasicBatchSummary(batch.answers, questionMeta);
        }
        
        batchSummary.batchId = batch.batchId;
        batchSummary.batchIndex = batch.batchIndex;
        batchSummaries.push(batchSummary);
        
        // Mark batch as processed
        batch.processed = true;
        batch.processedAt = new Date().toISOString();
        
      } catch (error) {
        console.error(`❌ Failed to process batch ${batch.batchId}:`, error.message);
        
        // Create error summary for failed batch
        batchSummaries.push(this.createErrorBatchSummary(batch, questionMeta, error));
      }
    }
    
    return batchSummaries;
  }
  
  /**
   * Generate enhanced summary with cross-question business intelligence
   */
  async generateEnhancedSummary(processedData, originalData) {
    const allQuestionSummaries = [];
    
    // Collect all question summaries
    Object.keys(processedData).forEach(formId => {
      const formData = processedData[formId];
      Object.keys(formData.questions).forEach(questionId => {
        allQuestionSummaries.push(formData.questions[questionId]);
      });
    });
    
    // Merge into form summary
    const formSummary = SummaryMerger.mergeQuestionSummaries(allQuestionSummaries, {
      formId: originalData.formId,
      formTitle: originalData.formTitle
    });
    
    // Generate cross-question business insights using Gemini
    let businessIntelligence = null;
    if (geminiService.isAvailable() && allQuestionSummaries.length > 1) {
      try {
        businessIntelligence = await this.generateCrossQuestionInsights(allQuestionSummaries, originalData);
      } catch (error) {
        console.error('❌ Failed to generate cross-question insights:', error.message);
      }
    }
    
    return {
      // Preserve original structure
      ...originalData,
      
      // Add enhanced summary
      enhancedSummary: formSummary,
      
      // Add question-level summaries
      questionSummaries: allQuestionSummaries,
      
      // Add cross-question business intelligence
      businessIntelligence: businessIntelligence,
      
      // Add processing metadata
      processing: {
        batchProcessingEnabled: true,
        aiSummaryEnabled: geminiService.isAvailable(),
        aiProvider: 'gemini',
        processedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * Generate cross-question business insights using Gemini
   */
  async generateCrossQuestionInsights(questionSummaries, formData) {
    console.log('🧠 Generating cross-question business insights with Gemini...');
    
    const prompt = `You are a business consultant analyzing feedback for a solopreneur's product/service.

FORM CONTEXT:
- Form: "${formData.formTitle}"
- Questions Analyzed: ${questionSummaries.length}
- Total Responses: ${Math.max(...questionSummaries.map(q => q.totalResponses || 0))}

INDIVIDUAL QUESTION INSIGHTS:
${questionSummaries.map((q, i) => `
Question ${i+1}: ${q.questionTitle}
- Summary: ${q.summary}
- Key Themes: ${q.keyThemes?.map(t => t.theme || t).join(', ')}
- Business Intelligence: ${JSON.stringify(q.businessIntelligence || {})}
`).join('\n')}

CROSS-QUESTION ANALYSIS REQUIRED:
Analyze patterns ACROSS all questions to provide strategic business insights.

Return JSON:
{
  "overallBusinessHealth": {
    "score": 0-10,
    "status": "Excellent/Good/Concerning/Critical",
    "reasoning": "why this score based on all questions"
  },
  
  "strategicInsights": [
    {
      "insight": "cross-question pattern discovered",
      "supportingQuestions": ["question titles that support this"],
      "businessImpact": "how this affects the business",
      "recommendedAction": "specific action for solopreneur"
    }
  ],
  
  "customerJourneyAnalysis": {
    "strengths": ["what customers love across all touchpoints"],
    "painPoints": ["consistent problems across questions"],
    "opportunities": ["growth areas identified from multiple questions"]
  },
  
  "prioritizedActionPlan": {
    "immediate": ["urgent actions based on all feedback"],
    "shortTerm": ["1-4 week initiatives"],
    "longTerm": ["strategic moves for next quarter"]
  },
  
  "competitivePositioning": {
    "advantages": ["strengths vs competitors mentioned"],
    "vulnerabilities": ["areas where competitors might win"],
    "uniqueValueProps": ["what makes this product special"]
  }
}`;

    try {
      const model = geminiService.client.getGenerativeModel({ 
        model: geminiService.config.model,
        generationConfig: {
          maxOutputTokens: geminiService.config.maxTokens,
          temperature: geminiService.config.temperature,
          responseMimeType: "application/json"
        },
        safetySettings: geminiService.config.safetySettings
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();
      
      return JSON.parse(analysisText);
      
    } catch (error) {
      console.error('❌ Cross-question analysis failed:', error.message);
      return null;
    }
  }
  
  /**
   * Extract answers with metadata for processing
   */
  extractAnswersWithMetadata(normalizedData) {
    const answers = [];
    
    if (!normalizedData.responses || !Array.isArray(normalizedData.responses)) {
      return answers;
    }
    
    normalizedData.responses.forEach(response => {
      if (response.answers && Array.isArray(response.answers)) {
        response.answers.forEach(answer => {
          answers.push({
            ...answer,
            formId: normalizedData.formId,
            formTitle: normalizedData.formTitle,
            responseId: response.id,
            submittedAt: response.submittedAt,
            // Create unique identifier for tracking
            uniqueId: `${normalizedData.formId}_${response.id}_${answer.questionId}`
          });
        });
      }
    });
    
    return answers;
  }
  
  /**
   * Filter out answers that have already been processed
   */
  filterNewAnswers(answersWithMeta) {
    return answersWithMeta.filter(answer => {
      return !this.processedAnswers.has(answer.uniqueId);
    });
  }
  
  /**
   * Determine if AI should be used for this question
   */
  shouldUseAIForQuestion(questionMeta, answerCount) {
    // Check if question type supports AI
    if (!this.config.summary.aiSupportedTypes.includes(questionMeta.questionType)) {
      return false;
    }
    
    // Check if we have enough responses
    if (answerCount < this.config.summary.minResponsesForAI) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Create basic batch summary without AI
   */
  createBasicBatchSummary(answers, questionMeta) {
    const responseCount = answers.length;
    
    return {
      batchId: `basic_batch_${Date.now()}`,
      questionId: questionMeta.questionId,
      responseCount: responseCount,
      summary: `${responseCount} responses collected for ${questionMeta.questionType} question.`,
      keyThemes: [],
      sentiment: null,
      businessIntelligence: {
        criticalIssues: [],
        quickWins: [],
        featureRequests: [],
        customerSegments: [],
        actionableInsights: []
      },
      statistics: {
        uniqueAnswers: new Set(answers.map(a => JSON.stringify(a.value))).size,
        commonPatterns: {},
        responseDistribution: {}
      },
      metadata: {
        processingType: 'basic',
        processedAt: new Date().toISOString(),
        answerCount: responseCount
      },
      processingDuration: 0
    };
  }
  
  /**
   * Create error summary for failed batch processing
   */
  createErrorBatchSummary(batch, questionMeta, error) {
    return {
      batchId: batch.batchId,
      questionId: questionMeta.questionId,
      responseCount: batch.answers.length,
      summary: `Error processing batch: ${error.message}`,
      keyThemes: [],
      sentiment: null,
      businessIntelligence: {
        criticalIssues: [],
        quickWins: [],
        featureRequests: [],
        customerSegments: [],
        actionableInsights: []
      },
      statistics: {
        uniqueAnswers: 0,
        commonPatterns: {},
        responseDistribution: {}
      },
      metadata: {
        processingType: 'error',
        processedAt: new Date().toISOString(),
        error: error.message,
        answerCount: batch.answers.length
      },
      processingDuration: 0
    };
  }
  
  /**
   * Mark answers as processed to avoid reprocessing
   */
  markAnswersAsProcessed(answers) {
    answers.forEach(answer => {
      this.processedAnswers.set(answer.uniqueId, {
        processedAt: new Date().toISOString(),
        questionId: answer.questionId,
        formId: answer.formId
      });
    });
  }
  
  /**
   * Count total batches in batched data
   */
  countTotalBatches(batchedData) {
    let totalBatches = 0;
    Object.keys(batchedData).forEach(formId => {
      Object.keys(batchedData[formId]).forEach(questionId => {
        totalBatches += batchedData[formId][questionId].batches?.length || 0;
      });
    });
    return totalBatches;
  }
  
  /**
   * Create empty result when no processing is needed
   */
  createEmptyProcessingResult(normalizedData) {
    return {
      ...normalizedData,
      enhancedSummary: null,
      questionSummaries: [],
      businessIntelligence: null,
      batchProcessing: {
        enabled: true,
        aiProvider: 'gemini',
        processedAnswers: 0,
        totalBatches: 0,
        processingTimeMs: 0,
        completedAt: new Date().toISOString(),
        message: 'No new answers to process'
      }
    };
  }
  
  /**
   * Create fallback summary when batch processing fails
   */
  createFallbackSummary(normalizedData) {
    // Use the existing basic summary generation
    const normalizerService = require('./normalizerService');
    const basicSummary = normalizerService.generateResponseSummary(normalizedData, { useBatchProcessing: false });
    
    return {
      ...normalizedData,
      enhancedSummary: basicSummary,
      questionSummaries: [],
      businessIntelligence: null,
      batchProcessing: {
        enabled: false,
        aiProvider: 'gemini',
        error: 'Batch processing failed, using fallback',
        processedAnswers: 0,
        totalBatches: 0,
        processingTimeMs: 0,
        completedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * Clear processed answers cache (useful for testing or manual reprocessing)
   */
  clearProcessedCache() {
    this.processedAnswers.clear();
    console.log('🗑️  Cleared processed answers cache');
  }
  
  /**
   * Get processing statistics
   */
  getProcessingStats() {
    return {
      processedAnswersCount: this.processedAnswers.size,
      aiServiceAvailable: geminiService.isAvailable(),
      aiProvider: 'gemini',
      configuredBatchSize: this.config.batch.defaultSize,
      lastClearTime: null // Could be tracked if needed
    };
  }
}

module.exports = new BatchSummarizerService();