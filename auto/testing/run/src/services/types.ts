// Interface for Docker image configuration
export interface DockerImage {
    name: string;
    path: string; // Ruta directa, ej: "C:/Users/app/docker" o "/home/user/app/docker"
    system: SystemType;
    tag?: string;
    buildArgs?: Record<string, string>;
    dockerfile?: string;
}

export type SystemType = 'linux' | 'windows';

// Interface for build result
export interface BuildResult {
    imageName: string;
    success: boolean;
    output?: string;
    error?: Error;
    buildTime?: number;
}

export interface KubernetesResource {
    name: string;
    path: string;
    type: 'deployment' | 'service' | 'configmap';
    namespace?: string;
}

export interface DeploymentResult {
    resource: string;
    success: boolean;
    action: string;
    error?: Error;
    output?: string;
    timestamp: Date;
}

export interface ClusterConfig {
  name: string;
  role: 'seed' | 'validator';
  resources: {
    cpu: string;
    memory: string;
  };
  nodes: number;
}

export type TypeAction = 'create' | 'remove';
export type OSType = 'linux' | 'windows';