import { Router } from "express";
import { logError } from "../utils/logger";
import {
    getConfigMaps,
    getDeploymentDetails,
    getDeployments,
    getIngresses,
    getNamespaceResources,
    getNamespaces,
    getNodeDetails,
    getNodes,
    getPersistentVolumeClaims,
    getPodDetails,
    getPods,
    getSecrets,
    getServiceDetails,
    getServices,
} from "../services/kube_metrics";

const status = Router();

// Endpoint de bienvenida
status.get('/', (req, res) => {
    res.send('¡Bienvenido a la API de desarrollo de TripCode Chain!');
});

// ==================== RECURSOS BÁSICOS DE KUBERNETES ====================

status.get('/status/pods', async (req, res) => {
    try {
        const pods = await getPods();
        res.json(pods);
    } catch (error) {
        logError(`Error getting pods: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener los pods' });
    }
});

status.get('/status/pods/:namespace/:name', async (req, res) => {
    try {
        const { namespace, name } = req.params;
        const podDetails = await getPodDetails(namespace, name);
        res.json(podDetails);
    } catch (error) {
        logError(`Error getting pod details: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener detalles del pod' });
    }
});

status.get('/status/services', async (req, res) => {
    try {
        const services = await getServices();
        res.json(services);
    } catch (error) {
        logError(`Error getting services: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener los servicios' });
    }
});

status.get('/status/services/:namespace/:name', async (req, res) => {
    try {
        const { namespace, name } = req.params;
        const serviceDetails = await getServiceDetails(namespace, name);
        res.json(serviceDetails);
    } catch (error) {
        logError(`Error getting service details: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener detalles del servicio' });
    }
});

status.get('/status/deployments', async (req, res) => {
    try {
        const deployments = await getDeployments();
        res.json(deployments);
    } catch (error) {
        logError(`Error getting deployments: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener los deployments' });
    }
});

status.get('/status/deployments/:namespace/:name', async (req, res) => {
    try {
        const { namespace, name } = req.params;
        const deploymentDetails = await getDeploymentDetails(namespace, name);
        res.json(deploymentDetails);
    } catch (error) {
        logError(`Error getting deployment details: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener detalles del deployment' });
    }
});

// ==================== RECURSOS ADICIONALES DE KUBERNETES ====================

status.get('/status/nodes', async (req, res) => {
    try {
        const nodes = await getNodes();
        res.json(nodes);
    } catch (error) {
        logError(`Error getting nodes: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener los nodos' });
    }
});

status.get('/status/nodes/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const nodeDetails = await getNodeDetails(name);
        res.json(nodeDetails);
    } catch (error) {
        logError(`Error getting node details: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener detalles del nodo' });
    }
});

status.get('/status/namespaces', async (req, res) => {
    try {
        const namespaces = await getNamespaces();
        res.json(namespaces);
    } catch (error) {
        logError(`Error getting namespaces: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener los namespaces' });
    }
});

status.get('/status/namespaces/:namespace/resources', async (req, res) => {
    try {
        const { namespace } = req.params;
        const resources = await getNamespaceResources(namespace);
        res.json(resources);
    } catch (error) {
        logError(`Error getting namespace resources: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener recursos del namespace' });
    }
});

status.get('/status/pvcs', async (req, res) => {
    try {
        const pvcs = await getPersistentVolumeClaims();
        res.json(pvcs);
    } catch (error) {
        logError(`Error getting PVCs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener los PVCs' });
    }
});

status.get('/status/ingresses', async (req, res) => {
    try {
        const ingresses = await getIngresses();
        res.json(ingresses);
    } catch (error) {
        logError(`Error getting ingresses: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener los ingresses' });
    }
});

status.get('/status/configmaps', async (req, res) => {
    try {
        const configMaps = await getConfigMaps();
        res.json(configMaps);
    } catch (error) {
        logError(`Error getting configmaps: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener los configmaps' });
    }
});

status.get('/status/secrets', async (req, res) => {
    try {
        const secrets = await getSecrets();
        res.json(secrets);
    } catch (error) {
        logError(`Error getting secrets: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: 'Error al obtener los secrets' });
    }
});


export default status;


