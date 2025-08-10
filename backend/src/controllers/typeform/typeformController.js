const typeformService = require('../../services/typeform/typeformService');
const normalizerService = require('../../services/shared/normalizerService');
const memoryStore = require('../../utils/memoryStore');

/**
 * Typeform Controller
 * Handles fetching and normalizing Typeform data
 */

class TypeformController {

  /**
   * Get form responses with normalization
   * GET /typeform/responses/:formId
   */
  async getResponses(req, res) {
    try {
      const { formId } = req.params;
      const { userId } = req.query;
      
      // Query parameters for filtering responses
      const options = {
        pageSize: parseInt(req.query.pageSize) || 1000,
        since: req.query.since || null,
        until: req.query.until || null,
        completed: req.query.completed !== undefined ? req.query.completed === 'true' : null,
        includeRaw: req.query.includeRaw !== undefined ? req.query.includeRaw === 'true' : false,
        includeSummary: req.query.includeSummary !== undefined ? req.query.includeSummary === 'true' : false,
        
        // Batch processing options
        useBatchProcessing: req.query.useBatchProcessing !== 'false', // Default to true
        incrementalOnly: req.query.incrementalOnly === 'true', // Default to false
        batchSize: parseInt(req.query.batchSize) || undefined
      };

      console.log(`📊 Fetching responses for form: ${formId}`);

      // Validate required parameters
      if (!formId) {
        return res.status(400).json({
          error: 'Missing form ID',
          message: 'Form ID is required in the URL path'
        });
      }

      if (!userId) {
        return res.status(400).json({
          error: 'Missing user ID',
          message: 'Please provide userId query parameter'
        });
      }

      // Get user's access token
      const tokenData = memoryStore.getToken(userId);
      if (!tokenData) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'No valid access token found. Please authenticate first.',
          authUrl: '/auth/typeform'
        });
      }

      // Fetch form details (optional, for better normalization)
      let formDetails = null;
      try {
        console.log('📋 Fetching form details for better normalization...');
        formDetails = await typeformService.getForm(tokenData.access_token, formId);
      } catch (formError) {
        console.warn('⚠️  Could not fetch form details, proceeding without:', formError.message);
      }

      // Fetch raw responses from Typeform
      console.log('📊 Fetching raw responses...');
      const rawResponses = await typeformService.getFormResponses(
        tokenData.access_token, 
        formId, 
        options
      );

      // Normalize the responses
      console.log('🔄 Normalizing responses...');
      const normalizedData = normalizerService.normalizeTypeformResponses(rawResponses, formDetails);

      // Generate summary if requested
      let summary = null;
      if (options.includeSummary) {
        console.log('📈 Generating response summary...');
        summary = await normalizerService.generateResponseSummary(normalizedData, {
          useBatchProcessing: options.useBatchProcessing,
          incrementalOnly: options.incrementalOnly,
          batchSize: options.batchSize
        });
      }

      // Prepare response
      const response = {
        success: true,
        data: normalizedData,
        meta: {
          formId: formId,
          userId: userId,
          fetchedAt: new Date().toISOString(),
          totalResponses: normalizedData.responses.length,
          options: options
        }
      };

      // Include raw data if requested
      if (options.includeRaw) {
        response.rawData = rawResponses;
      }

      // Include summary if requested
      if (summary) {
        response.summary = summary;
      }

      console.log(`✅ Successfully processed ${normalizedData.responses.length} responses`);
      res.json(response);

    } catch (error) {
      console.error('❌ Failed to fetch responses:', error.message);
      
      // Handle specific error types
      if (error.message.includes('Token exchange failed') || error.message.includes('401')) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Access token may be expired. Please re-authenticate.',
          authUrl: '/auth/typeform'
        });
      }

      if (error.message.includes('404')) {
        return res.status(404).json({
          error: 'Form not found',
          message: `Form ${req.params.formId} not found or you don't have access to it`
        });
      }

      res.status(500).json({
        error: 'Failed to fetch responses',
        message: error.message
      });
    }
  }

  /**
   * Get list of user's forms
   * GET /typeform/forms
   */
  async getForms(req, res) {
    try {
      const { userId } = req.query;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 200;

      console.log(`📋 Fetching forms for user: ${userId}`);

      if (!userId) {
        return res.status(400).json({
          error: 'Missing user ID',
          message: 'Please provide userId query parameter'
        });
      }

      // Get user's access token
      const tokenData = memoryStore.getToken(userId);
      if (!tokenData) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'No valid access token found. Please authenticate first.',
          authUrl: '/auth/typeform'
        });
      }

      // Fetch forms from Typeform
      const formsData = await typeformService.getUserForms(tokenData.access_token, page, pageSize);

      const response = {
        success: true,
        data: formsData,
        meta: {
          userId: userId,
          page: page,
          pageSize: pageSize,
          totalItems: formsData.total_items,
          fetchedAt: new Date().toISOString()
        }
      };

      console.log(`✅ Successfully fetched ${formsData.items?.length || 0} forms`);
      res.json(response);

    } catch (error) {
      console.error('❌ Failed to fetch forms:', error.message);
      
      if (error.message.includes('401')) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Access token may be expired. Please re-authenticate.',
          authUrl: '/auth/typeform'
        });
      }

      res.status(500).json({
        error: 'Failed to fetch forms',
        message: error.message
      });
    }
  }

  /**
   * Get specific form details
   * GET /typeform/forms/:formId
   */
  async getFormDetails(req, res) {
    try {
      const { formId } = req.params;
      const { userId } = req.query;

      console.log(`📋 Fetching form details: ${formId}`);

      if (!formId) {
        return res.status(400).json({
          error: 'Missing form ID',
          message: 'Form ID is required in the URL path'
        });
      }

      if (!userId) {
        return res.status(400).json({
          error: 'Missing user ID',
          message: 'Please provide userId query parameter'
        });
      }

      // Get user's access token
      const tokenData = memoryStore.getToken(userId);
      if (!tokenData) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'No valid access token found. Please authenticate first.',
          authUrl: '/auth/typeform'
        });
      }

      // Fetch form details
      const formDetails = await typeformService.getForm(tokenData.access_token, formId);

      const response = {
        success: true,
        data: formDetails,
        meta: {
          formId: formId,
          userId: userId,
          fetchedAt: new Date().toISOString()
        }
      };

      console.log(`✅ Successfully fetched form details: ${formId}`);
      res.json(response);

    } catch (error) {
      console.error(`❌ Failed to fetch form details for ${req.params.formId}:`, error.message);
      
      if (error.message.includes('404')) {
        return res.status(404).json({
          error: 'Form not found',
          message: `Form ${req.params.formId} not found or you don't have access to it`
        });
      }

      if (error.message.includes('401')) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Access token may be expired. Please re-authenticate.',
          authUrl: '/auth/typeform'
        });
      }

      res.status(500).json({
        error: 'Failed to fetch form details',
        message: error.message
      });
    }
  }

  /**
   * Test endpoint to validate normalization
   * GET /typeform/test-normalization/:formId
   */
  async testNormalization(req, res) {
    try {
      const { formId } = req.params;
      const { userId } = req.query;

      console.log(`🧪 Testing normalization for form: ${formId}`);

      if (!formId || !userId) {
        return res.status(400).json({
          error: 'Missing required parameters',
          message: 'Both formId and userId are required'
        });
      }

      // Get user's access token
      const tokenData = memoryStore.getToken(userId);
      if (!tokenData) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'No valid access token found. Please authenticate first.',
          authUrl: '/auth/typeform'
        });
      }

      // Fetch a small sample of responses for testing
      const rawResponses = await typeformService.getFormResponses(
        tokenData.access_token, 
        formId, 
        { pageSize: 5 } // Small sample for testing
      );

      // Fetch form details
      const formDetails = await typeformService.getForm(tokenData.access_token, formId);

      // Normalize the responses
      const normalizedData = normalizerService.normalizeTypeformResponses(rawResponses, formDetails);

      // Generate summary
      const summary = normalizerService.generateResponseSummary(normalizedData);

      const response = {
        success: true,
        test: true,
        originalCount: rawResponses.items?.length || 0,
        normalizedCount: normalizedData.responses.length,
        sampleRawResponse: rawResponses.items?.[0] || null,
        sampleNormalizedResponse: normalizedData.responses[0] || null,
        summary: summary,
        formDetails: {
          id: formDetails.id,
          title: formDetails.title,
          fieldCount: formDetails.fields?.length || 0
        },
        meta: {
          formId: formId,
          userId: userId,
          testedAt: new Date().toISOString()
        }
      };

      console.log(`✅ Normalization test completed successfully`);
      res.json(response);

    } catch (error) {
      console.error('❌ Normalization test failed:', error.message);
      res.status(500).json({
        error: 'Normalization test failed',
        message: error.message
      });
    }
  }
}

module.exports = new TypeformController();