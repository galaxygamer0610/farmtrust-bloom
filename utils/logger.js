const config = require('../config/config');

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = LOG_LEVELS[config.logLevel] || LOG_LEVELS.INFO;

const logger = {
  debug: (message, data = {}) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.log(JSON.stringify({ level: 'DEBUG', message, ...data, timestamp: new Date().toISOString() }));
    }
  },
  
  info: (message, data = {}) => {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.log(JSON.stringify({ level: 'INFO', message, ...data, timestamp: new Date().toISOString() }));
    }
  },
  
  warn: (message, data = {}) => {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn(JSON.stringify({ level: 'WARN', message, ...data, timestamp: new Date().toISOString() }));
    }
  },
  
  error: (message, data = {}) => {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      console.error(JSON.stringify({ level: 'ERROR', message, ...data, timestamp: new Date().toISOString() }));
    }
  },
};

module.exports = logger;
