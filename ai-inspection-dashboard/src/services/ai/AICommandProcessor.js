/**
 * AI Command Processor
 * Handles specific commands and function calls from the AI chat interface
 */

import aiService from './AIService.js';
import dataInterface from '../data/DataInterface.js';

class AICommandProcessor {
  constructor() {
    this.mockData = {
      materials: [
        { material_code: 'M001', material_name: 'Steel Plate', quantity: 500, status: 'Available' },
        { material_code: 'M002', material_name: 'Aluminum Sheet', quantity: 320, status: 'Available' },
        { material_code: 'M003', material_name: 'Copper Wire', quantity: 150, status: 'Low Stock' },
        { material_code: 'M004', material_name: 'Plastic Resin', quantity: 0, status: 'Out of Stock' }
      ],
      testResults: [
        { test_id: 'T001', material_code: 'M001', result: 'Pass', defect_rate: '0.05%' },
        { test_id: 'T002', material_code: 'M002', result: 'Pass', defect_rate: '0.12%' },
        { test_id: 'T003', material_code: 'M003', result: 'Fail', defect_rate: '3.45%' }
      ]
    };
  }

  /**
   * Process a command from the user
   * @param {string} command - The command text
   * @returns {Promise<Object>} - The processing result
   */
  async processCommand(command) {
    // Normalize the command
    const normalizedCommand = command.trim().toLowerCase();
    
    try {
      // Check for specific command patterns
      if (normalizedCommand.includes('material') || normalizedCommand.includes('inventory')) {
        return {
          response: 'Here are the current materials in inventory:',
          data: this.mockData.materials
        };
      }
      else if (normalizedCommand.includes('test') || normalizedCommand.includes('quality')) {
        return {
          response: 'Here are the latest test results:',
          data: this.mockData.testResults
        };
      }
      else if (normalizedCommand.includes('help')) {
        return {
          response: `
I can help you with the following commands:
- Check material inventory
- Show test results
- Get quality data
- Analyze defect rates

Just ask what you need in natural language!`
        };
      }
      
      // Default response for unrecognized commands
      return {
        response: `I received your command: "${command}". This appears to be a general query. How else can I assist you?`
      };
    } catch (error) {
      console.error('Error processing command:', error);
      return {
        response: `Error processing your command: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Process a function call from the AI model
   * @param {Object} functionCall - The function call information
   * @returns {Promise<Object>} - The processing result
   */
  async processFunctionCall(functionCall) {
    try {
      const { name, arguments: argsString } = functionCall;
      const args = JSON.parse(argsString);
      
      console.log(`[AICommandProcessor] Processing function call: ${name}`, args);
      
      // Execute the function based on the function name
      switch (name) {
        case 'queryMaterial':
          return await dataInterface.getMaterialInfo(args.materialCode, args.fields);
          
        case 'analyzeQualityIssue':
          return await dataInterface.analyzeQualityIssue(
            args.materialCode,
            args.batchId,
            args.timeRange || '最近30天'
          );
          
        case 'queryLabData':
          return await dataInterface.getLabData(
            args.materialCode,
            args.testType,
            args.timeRange
          );
          
        case 'predictQualityRisk':
          return await dataInterface.predictQualityRisk(
            args.materialCode,
            args.days || 7
          );
          
        default:
          throw new Error(`Unknown function: ${name}`);
      }
    } catch (error) {
      console.error('[AICommandProcessor] Error processing function call:', error);
      return {
        error: error.message,
        summary: 'Error processing function call'
      };
    }
  }
}

export { AICommandProcessor };

