type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'EMAIL';

const formatMessage = (level: LogLevel, message: string, details?: any) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const prefix = `[${timestamp}] [${level}]`;
  if (details) {
    return `${prefix} ${message} ${typeof details === 'object' ? JSON.stringify(details) : details}`;
  }
  return `${prefix} ${message}`;
};

export const logger = {
  info: (message: string, details?: any) => console.log(formatMessage('INFO', message, details)),
  warn: (message: string, details?: any) => console.warn(formatMessage('WARN', message, details)),
  error: (message: string, details?: any) => console.error(formatMessage('ERROR', message, details)),
  success: (message: string, details?: any) => console.log(formatMessage('SUCCESS', message, details)),
  email: (message: string, details?: any) => console.log(formatMessage('EMAIL', message, details)),
};
