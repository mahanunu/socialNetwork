export function setCorsHeaders(res) {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://snfront.vercel.app',
    'https://socialfront-mu.vercel.app'
  ];

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie');
}