// Express server for AI Inspection Dashboard
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Mock assistant API endpoint
app.post('/api/assistant/query', (req, res) => {
  const { query, sessionId = 'default' } = req.body;
  
  console.log(`Received query: ${query}`);
  
  // Return mock response
  res.json({
    success: true,
    response: `Mock response: ${query}`,
    sessionId,
    timestamp: Date.now()
  });
});

// Mock inventory API
app.get('/api/inventory', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, materialCode: 'M12345', name: '高强度钢板', quantity: 500, unit: 'kg', location: 'A-101' },
      { id: 2, materialCode: 'M12346', name: '铝合金板', quantity: 300, unit: 'kg', location: 'A-102' },
      { id: 3, materialCode: 'M12347', name: '不锈钢管', quantity: 200, unit: 'm', location: 'B-201' }
    ]
  });
});

// Mock lab tests API
app.get('/api/lab-tests', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, testCode: 'T001', materialCode: 'M12345', testDate: '2025-05-30', result: 'PASS', tester: '张工' },
      { id: 2, testCode: 'T002', materialCode: 'M12346', testDate: '2025-05-31', result: 'FAIL', tester: '李工' },
      { id: 3, testCode: 'T003', materialCode: 'M12347', testDate: '2025-06-01', result: 'PASS', tester: '王工' }
    ]
  });
});

// Mock quality issues API
app.get('/api/quality-issues', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, issueCode: 'QI001', materialCode: 'M12346', description: '铝合金板厚度不均', severity: 'HIGH', status: 'OPEN' },
      { id: 2, issueCode: 'QI002', materialCode: 'M12347', description: '不锈钢管表面有划痕', severity: 'MEDIUM', status: 'IN_PROGRESS' }
    ]
  });
});

// Mock API for materials
app.get('/api/materials', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, materialCode: 'M12345', name: '高强度钢板', supplier: '金田金属', riskLevel: 'LOW' },
      { id: 2, materialCode: 'M12346', name: '铝合金板', supplier: '华铝集团', riskLevel: 'MEDIUM' },
      { id: 3, materialCode: 'M12347', name: '不锈钢管', supplier: '鑫钢有限公司', riskLevel: 'LOW' }
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
