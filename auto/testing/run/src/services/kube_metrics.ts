import {
    CoreV1Api,
    AppsV1Api,
    V1Pod,
    V1Service,
    V1Deployment,
    V1ServicePort,
} from '@kubernetes/client-node';
import kc from '../config/kubernetesConfig';

// Crear instancias de las APIs de Kubernetes
const k8sCoreApi = kc.makeApiClient(CoreV1Api);
const k8sAppsApi = kc.makeApiClient(AppsV1Api);

// Función para obtener todos los pods
export const getPods = async () => {
    try {
        const result = await k8sCoreApi.listPodForAllNamespaces();
        return result.items.map((pod: V1Pod) => ({
            name: pod.metadata?.name,
            namespace: pod.metadata?.namespace,
            status: pod.status?.phase,
        }));
    } catch (error) {
        console.error('Error al obtener los pods:', error);
        throw new Error('Error al obtener los pods desde Kubernetes');
    }
};

// Función para obtener todos los servicios
export const getServices = async () => {
    try {
        const result = await k8sCoreApi.listServiceForAllNamespaces();
        return result.items.map((service: V1Service) => ({
            name: service.metadata?.name,
            namespace: service.metadata?.namespace,
            type: service.spec?.type,
            clusterIP: service.spec?.clusterIP,
            ports: service.spec?.ports?.map((port: V1ServicePort) => ({
                port: port.port,
                targetPort: port.targetPort,
                protocol: port.protocol,
            })),
        }));
    } catch (error) {
        console.error('Error al obtener los servicios:', error);
        throw new Error('Error al obtener los servicios desde Kubernetes');
    }
};

// Función para obtener todos los deployments
export const getDeployments = async () => {
    try {
        const result = await k8sAppsApi.listDeploymentForAllNamespaces();
        return result.items.map((deployment: V1Deployment) => ({
            name: deployment.metadata?.name,
            namespace: deployment.metadata?.namespace,
            replicas: deployment.spec?.replicas,
            availableReplicas: deployment.status?.availableReplicas,
        }));
    } catch (error) {
        console.error('Error al obtener los deployments:', error);
        throw new Error('Error al obtener los deployments desde Kubernetes');
    }
};