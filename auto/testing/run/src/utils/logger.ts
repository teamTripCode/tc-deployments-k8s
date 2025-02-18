import { format } from 'date-fns';

// Define log levels and their numerical values
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}

// Interface for log entry
interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    metadata?: Record<string, unknown>;
    error?: Error;
}

// Color codes for different log levels
const LOG_COLORS = {
    [LogLevel.DEBUG]: '\x1b[36m', // Cyan
    [LogLevel.INFO]: '\x1b[32m',  // Green
    [LogLevel.WARN]: '\x1b[33m',  // Yellow
    [LogLevel.ERROR]: '\x1b[31m', // Red
    [LogLevel.FATAL]: '\x1b[35m'  // Magenta
} as const;

const RESET_COLOR = '\x1b[0m';

// Logger class with enhanced functionality
class Logger {
    private static instance: Logger;
    private logLevel: LogLevel = LogLevel.INFO;
    private logToFile: boolean = false;
    private logFilePath: string = 'app.log';

    private constructor() { }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    // Set minimum log level
    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    // Enable/disable file logging
    public enableFileLogging(enable: boolean, filePath?: string): void {
        this.logToFile = enable;
        if (filePath) {
            this.logFilePath = filePath;
        }
    }

    // Format log entry
    private formatLogEntry(entry: LogEntry): string {
        const levelStr = LogLevel[entry.level].padEnd(5);
        const color = LOG_COLORS[entry.level];

        let logMessage = `${color}[${entry.timestamp}] [${levelStr}]${RESET_COLOR} ${entry.message}`;

        if (entry.metadata) {
            logMessage += `\n${JSON.stringify(entry.metadata, null, 2)}`;
        }

        if (entry.error) {
            logMessage += `\nError: ${entry.error.message}`;
            if (entry.error.stack) {
                logMessage += `\nStack: ${entry.error.stack}`;
            }
        }

        return logMessage;
    }

    // Core logging function
    private log(level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error): void {
        if (level < this.logLevel) return;

        const entry: LogEntry = {
            timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS'),
            level,
            message,
            metadata,
            error
        };

        const formattedMessage = this.formatLogEntry(entry);
        console.log(formattedMessage);

        if (this.logToFile) {
            // Implement file logging here if needed
            // fs.appendFileSync(this.logFilePath, formattedMessage + '\n');
        }
    }

    // Public logging methods
    public debug(message: string, metadata?: Record<string, unknown>): void {
        this.log(LogLevel.DEBUG, message, metadata);
    }

    public info(message: string, metadata?: Record<string, unknown>): void {
        this.log(LogLevel.INFO, message, metadata);
    }

    public warn(message: string, metadata?: Record<string, unknown>): void {
        this.log(LogLevel.WARN, message, metadata);
    }

    public error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
        this.log(LogLevel.ERROR, message, metadata, error);
    }

    public fatal(message: string, error?: Error, metadata?: Record<string, unknown>): void {
        this.log(LogLevel.FATAL, message, metadata, error);
        process.exit(1);
    }
}

// Create logger instance
const logger = Logger.getInstance();

// Export convenience methods
export const logDebug = (message: string, metadata?: Record<string, unknown>): void => {
    logger.debug(message, metadata);
};

export const logInfo = (message: string, metadata?: Record<string, unknown>): void => {
    logger.info(message, metadata);
};

export const logWarn = (message: string, metadata?: Record<string, unknown>): void => {
    logger.warn(message, metadata);
};

export const logError = (message: string, error?: Error, metadata?: Record<string, unknown>): void => {
    logger.error(message, error, metadata);
};

export const logFatal = (message: string, error?: Error, metadata?: Record<string, unknown>): void => {
    logger.fatal(message, error, metadata);
};

// Export the logger instance for configuration
export const configureLogger = {
    setLogLevel: (level: LogLevel) => logger.setLogLevel(level),
    enableFileLogging: (enable: boolean, filePath?: string) => logger.enableFileLogging(enable, filePath)
};