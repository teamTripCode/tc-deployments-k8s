import { runCommand } from './shell';
import { logInfo, logError, logDebug } from '../utils/logger';
import path from 'path';
import fs from 'fs/promises';

export type TypeAction = 'create' | 'remove';

interface KubernetesResource {
    name: string;
    path: string;
    type: 'deployment' | 'service' | 'configmap';
    namespace?: string;
}

interface DeploymentResult {
    resource: string;
    success: boolean;
    action: string;
    error?: Error;
    output?: string;
    timestamp: Date;
}

// Configuration
const KUBERNETES_RESOURCES: KubernetesResource[] = [
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

// Helper functions
async function validateKubernetesConnection(): Promise<boolean> {
    try {
        await runCommand('kubectl cluster-info');
        return true;
    } catch (error) {
        logError('Failed to connect to Kubernetes cluster', error instanceof Error ? error : undefined);
        return false;
    }
}

async function validateYamlFile(filePath: string): Promise<boolean> {
    try {
        const normalizedPath = path.resolve(__dirname, filePath);
        await fs.access(normalizedPath);
        return true;
    } catch {
        return false;
    }
}

async function validateResources(): Promise<boolean> {
    for (const resource of KUBERNETES_RESOURCES) {
        if (!await validateYamlFile(resource.path)) {
            logError(`YAML file not found: ${resource.path}`);
            return false;
        }
    }
    return true;
}

// Main deployment function
export const deployNodes = async (type: TypeAction): Promise<DeploymentResult[]> => {
    const results: DeploymentResult[] = [];
    const startTime = Date.now();

    try {
        logInfo(`Starting ${type} operation for Kubernetes resources`);

        if (type !== 'create' && type !== 'remove') {
            throw new Error('Invalid action type. Must be either "create" or "remove"');
        }

        if (!await validateKubernetesConnection()) {
            throw new Error('Cannot connect to Kubernetes cluster');
        }

        if (!await validateResources()) {
            throw new Error('One or more resource files are missing');
        }

        const action = type === 'create' ? 'apply' : 'delete';

        for (const resource of KUBERNETES_RESOURCES) {
            const normalizedPath = path.resolve(__dirname, resource.path);

            try {
                logDebug(`${action.charAt(0).toUpperCase() + action.slice(1)}ing ${resource.type}: ${resource.name}`, {
                    path: normalizedPath,
                    namespace: resource.namespace || 'default'
                });

                let command = `kubectl ${action} -f "${normalizedPath}"`;
                if (resource.namespace) {
                    command += ` -n ${resource.namespace}`;
                }

                const { stdout, stderr } = await runCommand(command);

                results.push({
                    resource: resource.name,
                    success: true,
                    action,
                    output: stdout,
                    timestamp: new Date()
                });

                logInfo(`Successfully ${action}d ${resource.type}: ${resource.name}`);
            } catch (error) {
                logError(`Failed to ${action} ${resource.type}: ${resource.name}`,
                    error instanceof Error ? error : undefined,
                    { path: normalizedPath }
                );

                results.push({
                    resource: resource.name,
                    success: false,
                    action,
                    error: error instanceof Error ? error : new Error('Unknown error'),
                    timestamp: new Date()
                });

                if (type === 'create') {
                    throw error;
                }
            }
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        logInfo(`${type.charAt(0).toUpperCase() + type.slice(1)} operation completed`, {
            duration: `${duration}ms`,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
        });

        return results;
    } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        logError(`Fatal error during ${type} operation`,
            error instanceof Error ? error : undefined,
            { duration: `${duration}ms` }
        );

        if (type === 'create' && results.some(r => r.success)) {
            logInfo('Attempting to clean up successfully deployed resources...');
            try {
                await deployNodes('remove');
                logInfo('Cleanup completed successfully');
            } catch (cleanupError) {
                logError('Failed to clean up resources', cleanupError instanceof Error ? cleanupError : undefined);
            }
        }

        throw error;
    }
};

export const kubernetesUtils = {
    validateKubernetesConnection,
    validateYamlFile,
    validateResources
};
