import express from 'express';
import { getPods, getServices, getDeployments } from './services/kube_metrics';
import { mainMenu } from './cli/p2pclli';
import { logInfo, logError } from './utils/logger';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// API Routes
app.get('/', (req, res) => {
    res.send('¡Bienvenido a la API de desarrollo de TripCode Chain!');
});

app.get('/status/pods', async (req, res) => {
    try {
        const pods = await getPods();
        res.json(pods);
    } catch (error) {
        logError(`Error getting pods: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener los pods' });
    }
});

app.get('/status/services', async (req, res) => {
    try {
        const services = await getServices();
        res.json(services);
    } catch (error) {
        logError(`Error getting services: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener los servicios' });
    }
});

app.get('/status/deployments', async (req, res) => {
    try {
        const deployments = await getDeployments();
        res.json(deployments);
    } catch (error) {
        logError(`Error getting deployments: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener los deployments' });
    }
});

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