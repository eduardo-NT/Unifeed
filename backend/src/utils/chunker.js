/**
 * Chunker Utility
 * Handles splitting arrays into batches while preserving data integrity
 */

class Chunker {
  /**
   * Split an array into chunks of specified size
   * @param {Array} array - Array to split
   * @param {number} chunkSize - Size of each chunk
   * @returns {Array<Array>} Array of chunks
   */
  static chunk(array, chunkSize) {
    if (!Array.isArray(array)) {
      throw new Error('Input must be an array');
    }
    
    if (chunkSize <= 0) {
      throw new Error('Chunk size must be greater than 0');
    }
    
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    
    return chunks;
  }
  
  /**
   * Group answers by form and question, then split into batches
   * @param {Array} answers - Array of normalized answers
   * @param {number} batchSize - Size of each batch
   * @returns {Object} Grouped and batched answers
   */
  static groupAndBatchAnswers(answers, batchSize = 150) {
    if (!Array.isArray(answers)) {
      return {};
    }
    
    // Group answers by formId and questionId
    const grouped = {};
    
    answers.forEach(answer => {
      const formId = answer.formId || 'unknown';
      const questionId = answer.questionId;
      
      if (!grouped[formId]) {
        grouped[formId] = {};
      }
      
      if (!grouped[formId][questionId]) {
        grouped[formId][questionId] = {
          questionTitle: answer.questionTitle,
          questionType: answer.questionType,
          answers: []
        };
      }
      
      grouped[formId][questionId].answers.push(answer);
    });
    
    // Split each question's answers into batches
    Object.keys(grouped).forEach(formId => {
      Object.keys(grouped[formId]).forEach(questionId => {
        const questionData = grouped[formId][questionId];
        const answerChunks = this.chunk(questionData.answers, batchSize);
        
        grouped[formId][questionId] = {
          ...questionData,
          batches: answerChunks.map((batch, index) => ({
            batchId: `${formId}_${questionId}_batch_${index}`,
            batchIndex: index,
            totalBatches: answerChunks.length,
            answers: batch,
            processed: false,
            createdAt: new Date().toISOString()
          }))
        };
        
        // Remove the original answers array to avoid duplication
        delete grouped[formId][questionId].answers;
      });
    });
    
    return grouped;
  }
  
  /**
   * Get processing statistics for batched data
   * @param {Object} batchedData - Data from groupAndBatchAnswers
   * @returns {Object} Processing statistics
   */
  static getBatchStatistics(batchedData) {
    let totalBatches = 0;
    let totalAnswers = 0;
    let processedBatches = 0;
    let processedAnswers = 0;
    
    Object.keys(batchedData).forEach(formId => {
      Object.keys(batchedData[formId]).forEach(questionId => {
        const questionData = batchedData[formId][questionId];
        
        if (questionData.batches) {
          questionData.batches.forEach(batch => {
            totalBatches++;
            totalAnswers += batch.answers.length;
            
            if (batch.processed) {
              processedBatches++;
              processedAnswers += batch.answers.length;
            }
          });
        }
      });
    });
    
    return {
      totalBatches,
      totalAnswers,
      processedBatches,
      processedAnswers,
      completionRate: totalBatches > 0 ? (processedBatches / totalBatches) * 100 : 0,
      answerProcessingRate: totalAnswers > 0 ? (processedAnswers / totalAnswers) * 100 : 0
    };
  }
  
  /**
   * Filter batches to get only unprocessed ones
   * @param {Object} batchedData - Data from groupAndBatchAnswers
   * @returns {Array} Array of unprocessed batches
   */
  static getUnprocessedBatches(batchedData) {
    const unprocessedBatches = [];
    
    Object.keys(batchedData).forEach(formId => {
      Object.keys(batchedData[formId]).forEach(questionId => {
        const questionData = batchedData[formId][questionId];
        
        if (questionData.batches) {
          questionData.batches.forEach(batch => {
            if (!batch.processed) {
              unprocessedBatches.push({
                formId,
                questionId,
                questionTitle: questionData.questionTitle,
                questionType: questionData.questionType,
                ...batch
              });
            }
          });
        }
      });
    });
    
    return unprocessedBatches;
  }
}

module.exports = Chunker;
