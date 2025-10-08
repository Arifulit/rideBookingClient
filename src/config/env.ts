/**
 * Environment Configuration
 * Centralized environment variable management
 */

interface AppConfig {
  api: {
    baseURL: string;
    timeout: number;
  };
  app: {
    title: string;
    environment: string;
    isDevelopment: boolean;
    isProduction: boolean;
  };
  features: {
    enableLogging: boolean;
  };
}

export const config: AppConfig = {
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  },
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'RideBook',
    environment: import.meta.env.VITE_APP_ENV || 'development',
    isDevelopment: import.meta.env.VITE_APP_ENV === 'development',
    isProduction: import.meta.env.VITE_APP_ENV === 'production',
  },
  features: {
    enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true',
  },
};

// Logging utility that respects environment
export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (config.features.enableLogging || config.app.isDevelopment) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (config.features.enableLogging || config.app.isDevelopment) {
      console.error(`❌ ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (config.features.enableLogging || config.app.isDevelopment) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  },
  debug: (message: string, ...args: unknown[]) => {
    if (config.features.enableLogging && config.app.isDevelopment) {
      console.debug(`🐛 ${message}`, ...args);
    }
  },
};

// Export individual config parts for convenience
export const { api: apiConfig, app: appConfig, features: featureConfig } = config;

export default config;