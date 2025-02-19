import express from 'express';
import { getPods, getServices, getDeployments } from './services/kube_metrics';
import { mainMenu } from './cli/p2pclli';
import { logInfo, logError } from './utils/logger';
import status from './routes/status';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// API Routes
app.use("/api", status);

// Server startup function with proper error handling
const startServer = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            const server = app.listen(port, () => {
                logInfo(`Servidor web corriendo en http://localhost:${port}`);
                resolve();
            });

            server.on('error', (error) => {
                logError(`Error starting server: ${error instanceof Error ? error.message : 'Unknown error'}`);
                reject(error);
            });

            // Handle process termination
            process.on('SIGTERM', () => {
                logInfo('SIGTERM received. Closing server...');
                server.close(() => {
                    logInfo('Server closed');
                    process.exit(0);
                });
            });

            process.on('SIGINT', () => {
                logInfo('SIGINT received. Closing server...');
                server.close(() => {
                    logInfo('Server closed');
                    process.exit(0);
                });
            });
        } catch (error) {
            reject(error);
        }
    });
};

// Main application function
const startApplication = async () => {
    try {
        await startServer();
        logInfo('Starting CLI menu...');
        await mainMenu();
    } catch (error) {
        logError(`Application error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
};

// Start the application
startApplication();