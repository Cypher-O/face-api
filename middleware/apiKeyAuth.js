// API Key Middleware
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.header('X-API-Key');
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is missing' });
    }
    
    // Verify API key (implement your own logic here)
    if (!verifyApiKey(apiKey)) {
      return res.status(403).json({ error: 'Invalid API key' });
    }
    
    next();
  };