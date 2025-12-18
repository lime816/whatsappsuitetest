/**
 * URL Configuration Utility for WhatsApp Backend
 * Provides dynamic URL generation based on environment
 */

const DEFAULT_CONFIG = {
  development: {
    server: { host: 'localhost', port: 3002, protocol: 'http' },
    frontend: { host: 'localhost', port: 3000, protocol: 'http' }
  },
  staging: {
    server: { host: '0.0.0.0', port: 3002, protocol: 'http' },
    frontend: { host: 'staging.yourapp.com', port: 443, protocol: 'https' }
  },
  production: {
    server: { host: '0.0.0.0', port: 3002, protocol: 'http' },
    frontend: { host: 'yourapp.com', port: 443, protocol: 'https' }
  }
};

/**
 * Get current environment
 */
function getEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  return 'development';
}

/**
 * Get server configuration from environment variables or defaults
 */
function getServerConfig() {
  const env = getEnvironment();
  const defaults = DEFAULT_CONFIG[env].server;
  
  return {
    host: process.env.HOST || defaults.host,
    port: parseInt(process.env.PORT || '') || defaults.port,
    protocol: process.env.SERVER_PROTOCOL || defaults.protocol
  };
}

/**
 * Get frontend configuration from environment variables or defaults
 */
function getFrontendConfig() {
  const env = getEnvironment();
  const defaults = DEFAULT_CONFIG[env].frontend;
  
  return {
    host: process.env.FRONTEND_HOST || defaults.host,
    port: parseInt(process.env.FRONTEND_PORT || '') || defaults.port,
    protocol: process.env.FRONTEND_PROTOCOL || defaults.protocol
  };
}

/**
 * Build URL from config
 */
function buildUrl(config, path = '') {
  const { host, port, protocol } = config;
  const standardPorts = { http: 80, https: 443 };
  
  // Don't include port if it's the standard port for the protocol
  const portSuffix = port === standardPorts[protocol] ? '' : `:${port}`;
  
  // For server binding, use the host as-is, but for URLs use localhost if host is 0.0.0.0
  const urlHost = host === '0.0.0.0' ? 'localhost' : host;
  
  return `${protocol}://${urlHost}${portSuffix}${path}`;
}

/**
 * Get the server URL
 */
function getServerUrl() {
  const config = getServerConfig();
  return buildUrl(config);
}

/**
 * Get the server host for binding
 */
function getServerHost() {
  const config = getServerConfig();
  return config.host;
}

/**
 * Get the server port
 */
function getServerPort() {
  const config = getServerConfig();
  return config.port;
}

/**
 * Get the frontend URL
 */
function getFrontendUrl() {
  // Check for override first
  const override = process.env.FRONTEND_URL;
  if (override) {
    return override;
  }
  
  const config = getFrontendConfig();
  return buildUrl(config);
}

/**
 * Get CORS origins based on environment
 */
function getCorsOrigins() {
  const env = getEnvironment();
  const frontendUrl = getFrontendUrl();
  
  const origins = [frontendUrl];
  
  if (env === 'development') {
    // In development, allow common development ports (avoid duplicates)
    const devPorts = ['3000', '5173', '5174', '5175'];
    const frontendPort = frontendUrl.match(/:(\d+)/)?.[1];
    
    devPorts.forEach(port => {
      const url = `http://localhost:${port}`;
      if (url !== frontendUrl) {
        origins.push(url);
      }
    });
    
    // Allow any localhost port as fallback
    // origins.push(/^http:\/\/localhost:\d+$/);
  } else {
    // In production/staging, allow deployment platforms
    // origins.push(
    //   /^https:\/\/.*\.railway\.app$/,
    //   /^https:\/\/.*\.vercel\.app$/,
    //   /^https:\/\/.*\.netlify\.app$/,
    //   /^https:\/\/.*\.herokuapp\.com$/
    // );
  }
  
  // Remove duplicates and filter out falsy values
  return [...new Set(origins)].filter(Boolean);
}

/**
 * Debug function to show current configuration
 */
function getUrlDebugInfo() {
  return {
    environment: getEnvironment(),
    serverUrl: getServerUrl(),
    serverHost: getServerHost(),
    serverPort: getServerPort(),
    frontendUrl: getFrontendUrl(),
    corsOrigins: getCorsOrigins(),
    envVars: {
      NODE_ENV: process.env.NODE_ENV,
      HOST: process.env.HOST,
      PORT: process.env.PORT,
      FRONTEND_HOST: process.env.FRONTEND_HOST,
      FRONTEND_PORT: process.env.FRONTEND_PORT,
      FRONTEND_PROTOCOL: process.env.FRONTEND_PROTOCOL,
      FRONTEND_URL: process.env.FRONTEND_URL
    }
  };
}

module.exports = {
  getEnvironment,
  getServerUrl,
  getServerHost,
  getServerPort,
  getFrontendUrl,
  getCorsOrigins,
  getUrlDebugInfo
};
