import express from 'express';
import { getPods, getServices, getDeployments } from './services/kube_metrics';
import { open } from 'fs';
import { mainMenu } from './cli/p2pclli';

const app = express();
const port = 3000;

// Middleware para parsear JSON (si es necesario)
app.use(express.json());

// Endpoint de ejemplo para la API
app.get('/', (req, res) => {
    res.send('¡Bienvenido a la API de desarrollo de TripCode Chain!');
});

// Endpoint para verificar el estado de los pods
app.get('/status/pods', async (req, res) => {
    try {
        const pods = await getPods();
        res.json(pods);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Error al obtener los pods', details: error.message });
        }
    }
});

// Endpoint para verificar el estado de los servicios
app.get('/status/services', async (req, res) => {
    try {
        const services = await getServices();
        res.json(services);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Error al obtener los servicios', details: error.message });
        }
    }
});

// Endpoint para verificar el estado de los deployments
app.get('/status/deployments', async (req, res) => {
    try {
        const deployments = await getDeployments();
        res.json(deployments);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Error al obtener los deployments', details: error.message });
        }
    }
});

// Función para iniciar el servidor
const startServer = async () => {
    app.listen(port, () => {
        console.log(`Servidor web corriendo en http://localhost:${port}`);
    });
};

(async () => {
    await startServer();
    await mainMenu()
})

