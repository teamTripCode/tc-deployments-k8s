import { DockerImage, KubernetesResource } from "./types";

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