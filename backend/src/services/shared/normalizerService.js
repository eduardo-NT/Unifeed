/**
 * Data Normalizer Service - Updated for Gemini Integration
 * Transforms raw Typeform responses into a unified schema
 * This creates a consistent format that can be used across different survey platforms
 */

class NormalizerService {
  
  /**
   * Normalize Typeform responses to unified format
   */
  normalizeTypeformResponses(rawData, formDetails = null) {
    console.log(`🔄 Normalizing ${rawData.items?.length || 0} Typeform responses`);
    
    const normalized = {
      source: 'typeform',
      formId: rawData.form_id || 'unknown',
      formTitle: formDetails?.title || 'Unknown Form',
      totalItems: rawData.total_items || 0,
      pageCount: rawData.page_count || 1,
      responses: [],
      metadata: {
        normalizedAt: new Date().toISOString(),
        rawResponseCount: rawData.items?.length || 0,
        version: '1.0'
      }
    };

    if (rawData.items && Array.isArray(rawData.items)) {
      normalized.responses = rawData.items.map(item => this.normalizeTypeformResponse(item, formDetails));
    }

    console.log(`✅ Normalized ${normalized.responses.length} responses`);
    return normalized;
  }

  /**
   * Normalize a single Typeform response
   */
  normalizeTypeformResponse(rawResponse, formDetails = null) {
    const normalized = {
      // Universal response fields
      id: rawResponse.response_id || rawResponse.token,
      submittedAt: rawResponse.submitted_at,
      landedAt: rawResponse.landed_at,
      
      // Response metadata
      metadata: {
        source: 'typeform',
        responseId: rawResponse.response_id,
        token: rawResponse.token,
        hidden: rawResponse.hidden || {},
        calculated: rawResponse.calculated || {},
        variables: rawResponse.variables || []
      },

      // Normalized answers
      answers: [],
      
      // Response completion status
      completed: true, // Typeform only returns completed responses by default
      
      // Processing metadata
      processing: {
        normalizedAt: new Date().toISOString(),
        originalAnswerCount: rawResponse.answers?.length || 0
      }
    };

    // Normalize answers
    if (rawResponse.answers && Array.isArray(rawResponse.answers)) {
      normalized.answers = rawResponse.answers.map(answer => this.normalizeTypeformAnswer(answer, formDetails));
    }

    return normalized;
  }

  /**
   * Normalize a single Typeform answer
   */
  normalizeTypeformAnswer(rawAnswer, formDetails = null) {
    // Find question details from form if available
    const questionDetails = this.findQuestionDetails(rawAnswer.field.id, formDetails);
    
    const normalized = {
      // Universal answer fields
      questionId: rawAnswer.field.id,
      questionRef: rawAnswer.field.ref,
      questionType: rawAnswer.field.type,
      questionTitle: questionDetails?.title || rawAnswer.field.title || 'Untitled Question',
      
      // Answer value (normalized)
      value: this.normalizeAnswerValue(rawAnswer),
      
      // Original raw answer for reference
      rawValue: rawAnswer,
      
      // Answer metadata
      metadata: {
        fieldType: rawAnswer.field.type,
        hasOther: !!rawAnswer.other,
        otherValue: rawAnswer.other || null
      }
    };

    return normalized;
  }

  /**
   * Normalize the answer value based on field type
   */
  normalizeAnswerValue(rawAnswer) {
    const fieldType = rawAnswer.field.type;
    
    switch (fieldType) {
      case 'short_text':
      case 'long_text':
      case 'email':
      case 'url':
      case 'phone_number':
        return rawAnswer.text || '';
        
      case 'multiple_choice':
        return {
          choice: rawAnswer.choice?.label || rawAnswer.choice?.other || '',
          choiceId: rawAnswer.choice?.id || null,
          other: rawAnswer.other || null
        };
        
      case 'picture_choice':
        return {
          choice: rawAnswer.choice?.label || '',
          choiceId: rawAnswer.choice?.id || null,
          other: rawAnswer.other || null
        };
        
      case 'yes_no':
        return {
          boolean: rawAnswer.boolean,
          text: rawAnswer.boolean ? 'Yes' : 'No'
        };
        
      case 'opinion_scale':
      case 'rating':
        return {
          number: rawAnswer.number,
          scale: rawAnswer.number
        };
        
      case 'number':
        return {
          number: rawAnswer.number
        };
        
      case 'date':
        return {
          date: rawAnswer.date,
          formatted: rawAnswer.date
        };
        
      case 'dropdown':
        return {
          choice: rawAnswer.choice?.label || '',
          choiceId: rawAnswer.choice?.id || null,
          other: rawAnswer.other || null
        };
        
      case 'ranking':
        return {
          choices: rawAnswer.choices?.map(choice => ({
            label: choice.label,
            id: choice.id
          })) || []
        };
        
      case 'file_upload':
        return {
          fileUrl: rawAnswer.file_url,
          fileName: this.extractFileName(rawAnswer.file_url)
        };
        
      case 'payment':
        return {
          amount: rawAnswer.payment?.amount,
          currency: rawAnswer.payment?.currency,
          name: rawAnswer.payment?.name,
          email: rawAnswer.payment?.email
        };
        
      default:
        // Fallback for unknown types
        return {
          raw: rawAnswer,
          type: fieldType,
          processed: false
        };
    }
  }

  /**
   * Find question details from form structure
   */
  findQuestionDetails(fieldId, formDetails) {
    if (!formDetails || !formDetails.fields) {
      return null;
    }
    
    return formDetails.fields.find(field => field.id === fieldId);
  }

  /**
   * Extract filename from file URL
   */
  extractFileName(fileUrl) {
    if (!fileUrl) return null;
    
    try {
      const url = new URL(fileUrl);
      const pathname = url.pathname;
      return pathname.split('/').pop() || 'unknown_file';
    } catch (error) {
      return 'unknown_file';
    }
  }

  /**
   * Generate summary statistics for normalized responses
   * Updated to use Gemini instead of OpenAI/Anthropic
   */
  generateResponseSummary(normalizedData, options = {}) {
    // Check if batch processing is enabled and should be used
    const batchConfig = require('../config/batchConfig');
    
    if (batchConfig.features.enableBatchProcessing && options.useBatchProcessing !== false) {
      console.log('🧠 Using Gemini-powered batch processing for enhanced summary...');
      
      try {
        const batchSummarizerService = require('./batchSummarizerService');
        return batchSummarizerService.processSurveyData(normalizedData, {
          incrementalOnly: options.incrementalOnly || false,
          batchSize: options.batchSize
        });
      } catch (error) {
        console.error('❌ Gemini batch processing failed, falling back to basic summary:', error.message);
        // Fall through to basic summary
      }
    }
    
    // Original basic summary generation
    const summary = {
      totalResponses: normalizedData.responses.length,
      completedResponses: normalizedData.responses.filter(r => r.completed).length,
      questionStats: {},
      responseRate: 0,
      avgResponseTime: null,
      generatedAt: new Date().toISOString(),
      processingType: 'basic'
    };

    if (normalizedData.responses.length > 0) {
      // Calculate response times
      const responseTimes = normalizedData.responses
        .filter(r => r.landedAt && r.submittedAt)
        .map(r => {
          const landed = new Date(r.landedAt);
          const submitted = new Date(r.submittedAt);
          return submitted - landed;
        });

      if (responseTimes.length > 0) {
        summary.avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000); // seconds
      }

      // Generate question statistics
      normalizedData.responses.forEach(response => {
        response.answers.forEach(answer => {
          const questionId = answer.questionId;
          if (!summary.questionStats[questionId]) {
            summary.questionStats[questionId] = {
              questionTitle: answer.questionTitle,
              questionType: answer.questionType,
              responseCount: 0,
              uniqueValues: new Set()
            };
          }
          
          summary.questionStats[questionId].responseCount++;
          
          // Track unique values (simplified)
          const valueStr = JSON.stringify(answer.value);
          summary.questionStats[questionId].uniqueValues.add(valueStr);
        });
      });

      // Convert Sets to counts
      Object.keys(summary.questionStats).forEach(questionId => {
        summary.questionStats[questionId].uniqueAnswers = summary.questionStats[questionId].uniqueValues.size;
        delete summary.questionStats[questionId].uniqueValues;
      });
    }

    return summary;
  }
}

module.exports = new NormalizerService();