import { ClusterConfig, DockerImage, KubernetesResource } from "./types";

// Configuration
export const KUBERNETES_RESOURCES: KubernetesResource[] = [
    {
        name: 'seed-node-deployment',
        path: '../../../../../seed/seed-node-deployment.yaml',
        type: 'deployment'
    },
    {
        name: 'seed-node-service',
        path: '../../../../../seed/seed-node-service.yaml',
        type: 'service'
    },
    {
        name: 'validator-node-deployment',
        path: '../../../../../validator/validator-node-deployment.yaml',
        type: 'deployment'
    },
    {
        name: 'validator-node-service',
        path: '../../../../../validator/validator-node-service.yaml',
        type: 'service'
    },
    {
        name: 'redis-configmap',
        path: '../../../../../redis/redis-configmap.yaml',
        type: 'configmap'
    },
    {
        name: 'redis-service',
        path: '../../../../../redis/redis-service.yaml',
        type: 'service'
    }
];

// Definición de clusters predeterminados
export const DEFAULT_CLUSTERS: ClusterConfig[] = [
  {
    name: 'seed-cluster',
    role: 'seed',
    resources: {
      cpu: '1',
      memory: '2Gi'
    },
    nodes: 1
  },
  {
    name: 'validator-cluster',
    role: 'validator',
    resources: {
      cpu: '2',
      memory: '4Gi'
    },
    nodes: 3
  }
];

export const PathsDockers: DockerImage[] = [
    {
        name: "seed-node-tripcode",
        path: "C:\\Users\\davim\\Desktop\\TripCode Workspace\\Tripcode-blockchain-workspace\\seed-node-tripcode",
        system: "windows"
    },
    {
        name: "validator-node-tripcode",
        path: "C:\\Users\\davim\\Desktop\\TripCode Workspace\\Tripcode-blockchain-workspace\\validator-node-tripcode",
        system: "windows"
    }
];