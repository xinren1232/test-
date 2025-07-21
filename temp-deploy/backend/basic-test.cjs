console.log('Hello from Node.js!');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

try {
  const express = require('express');
  console.log('Express loaded successfully');
} catch (error) {
  console.log('Express load failed:', error.message);
}

try {
  const cors = require('cors');
  console.log('CORS loaded successfully');
} catch (error) {
  console.log('CORS load failed:', error.message);
}
