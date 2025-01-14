type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const logger = {
    log: (level: LogLevel, component: string, message: string, data?: any) => {
        // Force console output regardless of environment
        const timestamp = new Date().toISOString();
        const style = {
            info: 'color: #2196F3',
            warn: 'color: #FF9800',
            error: 'color: #F44336',
            debug: 'color: #4CAF50'
        };

        console.log(
            `%c[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}`,
            style[level],
            data ? data : ''
        );
    }
};

export default logger;