import {
    CoreV1Api,
    AppsV1Api,
    V1Pod,
    V1Service,
    V1Deployment,
    V1ServicePort,
    NetworkingV1Api,
    CustomObjectsApi,
    V1ConfigMap,
    V1Secret,
    V1Node,
    V1Namespace,
    V1PersistentVolumeClaim,
    V1Ingress,
} from '@kubernetes/client-node';
import kc from '../config/kubernetesConfig';

// Crear instancias de las APIs de Kubernetes
const k8sCoreApi = kc.makeApiClient(CoreV1Api);
const k8sAppsApi = kc.makeApiClient(AppsV1Api);
const k8sNetworkingApi = kc.makeApiClient(NetworkingV1Api);
const k8sCustomApi = kc.makeApiClient(CustomObjectsApi);

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

// Función para obtener detalles de un pod específico
export const getPodDetails = async (namespace: string, podName: string) => {
    try {
        const result = await k8sCoreApi.readNamespacedPod(podName, namespace);
        const pod = result;
        return {
            name: pod.metadata?.name,
            namespace: pod.metadata?.namespace,
            status: pod.status?.phase,
            nodeName: pod.spec?.nodeName,
            hostIP: pod.status?.hostIP,
            podIP: pod.status?.podIP,
            startTime: pod.status?.startTime,
            containers: pod.spec?.containers.map(container => ({
                name: container.name,
                image: container.image,
                ports: container.ports?.map(port => ({
                    containerPort: port.containerPort,
                    protocol: port.protocol
                })),
                resources: container.resources,
                readinessProbe: container.readinessProbe ? true : false,
                livenessProbe: container.livenessProbe ? true : false
            })),
            conditions: pod.status?.conditions,
            volumes: pod.spec?.volumes,
            labels: pod.metadata?.labels,
            annotations: pod.metadata?.annotations
        };
    } catch (error) {
        console.error(`Error al obtener detalles del pod ${podName}:`, error);
        throw new Error(`Error al obtener detalles del pod ${podName}`);
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

// Función para obtener detalles de un servicio específico
export const getServiceDetails = async (namespace: string, serviceName: string) => {
    try {
        const result = await k8sCoreApi.readNamespacedService(serviceName, namespace);
        const service = result;
        return {
            name: service.metadata?.name,
            namespace: service.metadata?.namespace,
            type: service.spec?.type,
            clusterIP: service.spec?.clusterIP,
            externalIPs: service.spec?.externalIPs,
            loadBalancerIP: service.spec?.loadBalancerIP,
            externalName: service.spec?.externalName,
            ports: service.spec?.ports?.map(port => ({
                name: port.name,
                protocol: port.protocol,
                port: port.port,
                targetPort: port.targetPort,
                nodePort: port.nodePort
            })),
            selector: service.spec?.selector,
            sessionAffinity: service.spec?.sessionAffinity,
            loadBalancerStatus: service.status?.loadBalancer,
            labels: service.metadata?.labels,
            annotations: service.metadata?.annotations,
            creationTimestamp: service.metadata?.creationTimestamp
        };
    } catch (error) {
        console.error(`Error al obtener detalles del servicio ${serviceName}:`, error);
        throw new Error(`Error al obtener detalles del servicio ${serviceName}`);
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

// Función para obtener detalles de un deployment específico
export const getDeploymentDetails = async (namespace: string, deploymentName: string) => {
    try {
        const result = await k8sAppsApi.readNamespacedDeployment(deploymentName, namespace);
        const deployment = result;
        return {
            name: deployment.metadata?.name,
            namespace: deployment.metadata?.namespace,
            replicas: deployment.spec?.replicas,
            strategy: deployment.spec?.strategy,
            selector: deployment.spec?.selector,
            template: {
                labels: deployment.spec?.template.metadata?.labels,
                containers: deployment.spec?.template.spec?.containers.map(container => ({
                    name: container.name,
                    image: container.image,
                    ports: container.ports,
                    env: container.env,
                    resources: container.resources,
                    volumeMounts: container.volumeMounts
                })),
                volumes: deployment.spec?.template.spec?.volumes
            },
            status: {
                availableReplicas: deployment.status?.availableReplicas,
                readyReplicas: deployment.status?.readyReplicas,
                updatedReplicas: deployment.status?.updatedReplicas,
                unavailableReplicas: deployment.status?.unavailableReplicas,
                conditions: deployment.status?.conditions
            },
            labels: deployment.metadata?.labels,
            annotations: deployment.metadata?.annotations,
            creationTimestamp: deployment.metadata?.creationTimestamp
        };
    } catch (error) {
        console.error(`Error al obtener detalles del deployment ${deploymentName}:`, error);
        throw new Error(`Error al obtener detalles del deployment ${deploymentName}`);
    }
};

// Función para obtener todos los nodos
export const getNodes = async () => {
    try {
        const result = await k8sCoreApi.listNode();
        return result.items.map((node: V1Node) => {
            // Extraer información de capacidad y asignación de recursos
            const capacity = node.status?.capacity || {};
            const allocatable = node.status?.allocatable || {};

            // Extraer información de condición Ready
            const readyCondition = node.status?.conditions?.find(condition =>
                condition.type === 'Ready'
            );

            return {
                name: node.metadata?.name,
                status: readyCondition?.status === 'True' ? 'Ready' : 'NotReady',
                roles: node.metadata?.labels ?
                    Object.keys(node.metadata.labels)
                        .filter(key => key.startsWith('node-role.kubernetes.io/'))
                        .map(key => key.replace('node-role.kubernetes.io/', '')) :
                    [],
                kubeletVersion: node.status?.nodeInfo?.kubeletVersion,
                osImage: node.status?.nodeInfo?.osImage,
                kernelVersion: node.status?.nodeInfo?.kernelVersion,
                architecture: node.status?.nodeInfo?.architecture,
                capacity: {
                    cpu: capacity['cpu'],
                    memory: capacity['memory'],
                    pods: capacity['pods']
                },
                allocatable: {
                    cpu: allocatable['cpu'],
                    memory: allocatable['memory'],
                    pods: allocatable['pods']
                },
                addresses: node.status?.addresses?.map(addr => ({
                    type: addr.type,
                    address: addr.address
                })),
                taints: node.spec?.taints,
                labels: node.metadata?.labels
            };
        });
    } catch (error) {
        console.error('Error al obtener los nodos:', error);
        throw new Error('Error al obtener los nodos desde Kubernetes');
    }
};

// Función para obtener detalles de un nodo específico
export const getNodeDetails = async (nodeName: string) => {
    try {
        const result = await k8sCoreApi.readNode(nodeName);
        const node = result;

        // Obtener pods que se ejecutan en este nodo
        const podsResult = await k8sCoreApi.listPodForAllNamespaces(
            undefined, undefined, `spec.nodeName=${nodeName}`
        );

        return {
            name: node.metadata?.name,
            labels: node.metadata?.labels,
            annotations: node.metadata?.annotations,
            creationTimestamp: node.metadata?.creationTimestamp,
            conditions: node.status?.conditions,
            addresses: node.status?.addresses,
            capacity: node.status?.capacity,
            allocatable: node.status?.allocatable,
            systemInfo: node.status?.nodeInfo,
            taints: node.spec?.taints,
            unschedulable: node.spec?.unschedulable,
            podsRunning: podsResult.items.map(pod => ({
                name: pod.metadata?.name,
                namespace: pod.metadata?.namespace,
                status: pod.status?.phase,
                startTime: pod.status?.startTime
            }))
        };
    } catch (error) {
        console.error(`Error al obtener detalles del nodo ${nodeName}:`, error);
        throw new Error(`Error al obtener detalles del nodo ${nodeName}`);
    }
};

// Función para obtener todos los namespaces
export const getNamespaces = async () => {
    try {
        const result = await k8sCoreApi.listNamespace();
        return result.items.map((namespace: V1Namespace) => ({
            name: namespace.metadata?.name,
            status: namespace.status?.phase,
            labels: namespace.metadata?.labels,
            creationTimestamp: namespace.metadata?.creationTimestamp
        }));
    } catch (error) {
        console.error('Error al obtener los namespaces:', error);
        throw new Error('Error al obtener los namespaces desde Kubernetes');
    }
};

// Función para obtener recursos dentro de un namespace
export const getNamespaceResources = async (namespace: string) => {
    try {
        const [
            podsResult,
            servicesResult,
            deploymentsResult,
            configMapsResult,
            secretsResult,
            pvcsResult,
            ingressesResult
        ] = await Promise.all([
            k8sCoreApi.listNamespacedPod(namespace),
            k8sCoreApi.listNamespacedService(namespace),
            k8sAppsApi.listNamespacedDeployment(namespace),
            k8sCoreApi.listNamespacedConfigMap(namespace),
            k8sCoreApi.listNamespacedSecret(namespace),
            k8sCoreApi.listNamespacedPersistentVolumeClaim(namespace),
            k8sNetworkingApi.listNamespacedIngress(namespace)
        ]);

        return {
            namespace,
            resourceCounts: {
                pods: podsResult.items.length,
                services: servicesResult.items.length,
                deployments: deploymentsResult.items.length,
                configMaps: configMapsResult.items.length,
                secrets: secretsResult.items.length,
                persistentVolumeClaims: pvcsResult.items.length,
                ingresses: ingressesResult.items.length
            },
            pods: podsResult.items.map((pod: V1Pod) => ({
                name: pod.metadata?.name,
                status: pod.status?.phase
            })),
            services: servicesResult.items.map((service: V1Service) => ({
                name: service.metadata?.name,
                type: service.spec?.type,
                clusterIP: service.spec?.clusterIP
            })),
            deployments: deploymentsResult.items.map((deployment: V1Deployment) => ({
                name: deployment.metadata?.name,
                replicas: `${deployment.status?.readyReplicas || 0}/${deployment.spec?.replicas}`
            }))
        };
    } catch (error) {
        console.error(`Error al obtener recursos del namespace ${namespace}:`, error);
        throw new Error(`Error al obtener recursos del namespace ${namespace}`);
    }
};

// Función para obtener volúmenes persistentes
export const getPersistentVolumeClaims = async () => {
    try {
        const result = await k8sCoreApi.listPersistentVolumeClaimForAllNamespaces();
        return result.items.map((pvc: V1PersistentVolumeClaim) => ({
            name: pvc.metadata?.name,
            namespace: pvc.metadata?.namespace,
            status: pvc.status?.phase,
            storageClassName: pvc.spec?.storageClassName,
            accessModes: pvc.spec?.accessModes,
            storage: pvc.spec?.resources?.requests?.['storage'],
            volumeName: pvc.spec?.volumeName
        }));
    } catch (error) {
        console.error('Error al obtener los PVCs:', error);
        throw new Error('Error al obtener los PVCs desde Kubernetes');
    }
};

// Función para obtener ingresses
export const getIngresses = async () => {
    try {
        const result = await k8sNetworkingApi.listIngressForAllNamespaces();
        return result.items.map((ingress: V1Ingress) => ({
            name: ingress.metadata?.name,
            namespace: ingress.metadata?.namespace,
            hosts: ingress.spec?.rules?.map(rule => rule.host),
            tls: ingress.spec?.tls?.map(tls => ({
                hosts: tls.hosts,
                secretName: tls.secretName
            }))
        }));
    } catch (error) {
        console.error('Error al obtener los ingresses:', error);
        throw new Error('Error al obtener los ingresses desde Kubernetes');
    }
};

// Función para obtener configmaps
export const getConfigMaps = async () => {
    try {
        const result = await k8sCoreApi.listConfigMapForAllNamespaces();
        return result.items.map((configMap: V1ConfigMap) => ({
            name: configMap.metadata?.name,
            namespace: configMap.metadata?.namespace,
            dataKeys: configMap.data ? Object.keys(configMap.data) : [],
            creationTimestamp: configMap.metadata?.creationTimestamp
        }));
    } catch (error) {
        console.error('Error al obtener los configmaps:', error);
        throw new Error('Error al obtener los configmaps desde Kubernetes');
    }
};

// Función para obtener secretos (sin exponer datos confidenciales)
export const getSecrets = async () => {
    try {
        const result = await k8sCoreApi.listSecretForAllNamespaces();
        return result.items.map((secret: V1Secret) => ({
            name: secret.metadata?.name,
            namespace: secret.metadata?.namespace,
            type: secret.type,
            dataKeys: secret.data ? Object.keys(secret.data) : [],
            creationTimestamp: secret.metadata?.creationTimestamp
        }));
    } catch (error) {
        console.error('Error al obtener los secretos:', error);
        throw new Error('Error al obtener los secretos desde Kubernetes');
    }
};

// Función para obtener información de los clusters de Minikube
export const getMinikubeClusters = async () => {
    try {
        // Comando para obtener perfiles de minikube via shell command
        const { exec } = require('child_process');
        return new Promise((resolve, reject) => {
            exec('minikube profile list -o json', (error: any, stdout: string, stderr: string) => {
                if (error) {
                    console.error(`Error executing minikube command: ${error}`);
                    reject(new Error('Failed to get minikube profiles'));
                    return;
                }

                try {
                    const profiles = JSON.parse(stdout);
                    resolve(profiles.valid || []);
                } catch (parseError) {
                    console.error(`Error parsing minikube output: ${parseError}`);
                    reject(new Error('Failed to parse minikube profiles'));
                }
            });
        });
    } catch (error) {
        console.error('Error al obtener clusters de Minikube:', error);
        throw new Error('Error al obtener clusters de Minikube');
    }
};

// Función para obtener métricas de uso de recursos (requiere metrics-server)
export const getResourceUsage = async () => {
    try {
        // Verificar si metrics API está disponible
        const apiGroups = await k8sCoreApi.getAPIVersions();
        const hasMetricsAPI = apiGroups.body.groups.some(
            group => group.name === 'metrics.k8s.io'
        );

        if (!hasMetricsAPI) {
            return { error: 'Metrics API no está disponible en el cluster' };
        }

        // Obtener métricas de nodos
        const nodeMetrics = await k8sCustomApi.listClusterCustomObject(
            'metrics.k8s.io',
            'v1beta1',
            'nodes'
        );

        // Obtener métricas de pods
        const podMetrics = await k8sCustomApi.listClusterCustomObject(
            'metrics.k8s.io',
            'v1beta1',
            'pods'
        );

        return {
            nodes: (nodeMetrics as any).body.items.map((item: any) => ({
                name: item.metadata.name,
                usage: item.usage,
                window: item.window
            })),
            pods: (podMetrics as any).body.items.map((item: any) => ({
                name: item.metadata.name,
                namespace: item.metadata.namespace,
                containers: item.containers.map((container: any) => ({
                    name: container.name,
                    usage: container.usage
                }))
            }))
        };
    } catch (error) {
        console.error('Error al obtener métricas de recursos:', error);
        return { error: 'Error al obtener métricas de recursos' };
    }
};

// Función para obtener eventos del cluster
export const getClusterEvents = async (namespace?: string) => {
    try {
        let events;
        if (namespace) {
            events = await k8sCoreApi.listNamespacedEvent(namespace);
        } else {
            events = await k8sCoreApi.listEventForAllNamespaces();
        }

        return events.items
            .sort((a, b) => {
                const timeA = new Date(a.lastTimestamp || a.eventTime || a.metadata?.creationTimestamp || '').getTime();
                const timeB = new Date(b.lastTimestamp || b.eventTime || b.metadata?.creationTimestamp || '').getTime();
                return timeB - timeA; // Ordenar por más reciente primero
            })
            .slice(0, 100) // Limitar a los 100 eventos más recientes
            .map(event => ({
                type: event.type,
                reason: event.reason,
                message: event.message,
                involvedObject: {
                    kind: event.involvedObject.kind,
                    name: event.involvedObject.name,
                    namespace: event.involvedObject.namespace
                },
                count: event.count,
                firstTimestamp: event.firstTimestamp,
                lastTimestamp: event.lastTimestamp,
                source: event.source
            }));
    } catch (error) {
        console.error('Error al obtener eventos del cluster:', error);
        throw new Error('Error al obtener eventos del cluster');
    }
};

// Función para obtener estadísticas generales del cluster
export const getClusterSummary = async () => {
    try {
        const [
            nodes,
            namespaces,
            pods,
            deployments,
            services,
            pvcs
        ] = await Promise.all([
            getNodes(),
            getNamespaces(),
            getPods(),
            getDeployments(),
            getServices(),
            getPersistentVolumeClaims()
        ]);

        const readyNodes = nodes.filter(node => node.status === 'Ready').length;
        const runningPods = pods.filter(pod => pod.status === 'Running').length;

        // Calcular recursos totales del cluster
        const totalResources = nodes.reduce((acc, node) => {
            if (node.capacity) {
                acc.cpu += parseInt(node.capacity.cpu || '0');
                // Convertir memoria de Ki a Gi para mejor visualización
                const memoryInKi = parseInt(node.capacity.memory?.replace('Ki', '') || '0');
                acc.memoryGi += memoryInKi / (1024 * 1024);
                acc.pods += parseInt(node.capacity.pods || '0');
            }
            return acc;
        }, { cpu: 0, memoryGi: 0, pods: 0 });

        return {
            health: {
                nodes: `${readyNodes}/${nodes.length}`,
                pods: `${runningPods}/${pods.length}`
            },
            counts: {
                nodes: nodes.length,
                namespaces: namespaces.length,
                pods: pods.length,
                deployments: deployments.length,
                services: services.length,
                persistentVolumeClaims: pvcs.length
            },
            capacity: {
                cpu: totalResources.cpu,
                memoryGi: Math.round(totalResources.memoryGi * 100) / 100,
                pods: totalResources.pods
            },
            topNamespaces: namespaces
                .map(ns => ({
                    name: ns.name,
                    podCount: pods.filter(pod => pod.namespace === ns.name).length
                }))
                .sort((a, b) => b.podCount - a.podCount)
                .slice(0, 5)
        };
    } catch (error) {
        console.error('Error al obtener resumen del cluster:', error);
        throw new Error('Error al obtener resumen del cluster');
    }
};