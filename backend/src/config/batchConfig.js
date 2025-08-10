/**
 * Batch Processing Configuration
 * Updated for Gemini AI integration
 */

const config = {
  // Feature flags
  features: {
    enableBatchProcessing: process.env.ENABLE_BATCH_PROCESSING === 'true',
    enableAISummary: process.env.ENABLE_AI_SUMMARY === 'true',
    fallbackToBasicSummary: true
  },

  // Batch configuration
  batch: {
    defaultSize: parseInt(process.env.BATCH_SIZE) || 150,
    maxSize: 500,
    minSize: 10,
    processingTimeout: parseInt(process.env.PROCESSING_TIMEOUT) || 30000
  },

  // AI service configuration
  ai: {
    provider: process.env.AI_PROVIDER || 'gemini',
    
    // Gemini configuration
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
      maxTokens: 8192,
      temperature: 0.3,
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    }
  },

  // Summary configuration
  summary: {
    aiSupportedTypes: [
      'short_text',
      'long_text',
      'multiple_choice',
      'opinion_scale',
      'rating',
      'yes_no',
      'dropdown',
      'email',
      'phone_number'
    ],
    minResponsesForAI: 3,
    maxKeyThemes: 10,
    sentimentAnalysis: true
  },

  // Performance configuration
  performance: {
    maxConcurrentBatches: 3,
    retryAttempts: 2,
    retryDelay: 1000
  }
};

module.exports = config;