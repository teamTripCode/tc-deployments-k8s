import { runCommand } from './shell';

export type typeAction = "create" | "remove";


export const deployNodes = async (type: typeAction) => {
    try {
        console.log('Desplegando nodos...');

        if (type !== 'create' && type !== 'remove') throw new Error('type is incorrect')

        // Rutas de los archivos YAML del nodo semilla
        const seedNodeDeploymentPath = '../../../../../seed/seed-node-deployment.yaml';
        const seedNodeServicePath = '../../../../../seed/seed-node-service.yaml'

        // Rutas de los archivos YAML del nodo validador
        const validatorNodeDeploymentPath = '../../../../../validator/validator-node-deployment.yaml';
        const validatorNodeServicePath = '../../../../../validator/validator-node-service.yaml';

        // Rutas de los archivos YAML de Redis
        const redisConfigMapPath = '../../../../../redis/redis-configmap.yaml';
        const redisServicePath = '../../../../../redis/redis-service.yaml';

        // Determinar la acción basada en el tipo
        const action = type === 'create' ? 'apply' : 'delete';

        // Aplicamos los archivos de deployment y service de Kubernetes

        // Seed Node
        await runCommand(`kubectl ${action} -f ${seedNodeDeploymentPath}`);
        await runCommand(`kubectl ${action} -f ${seedNodeServicePath}`);

        // Validator Node
        await runCommand(`kubectl ${action} -f ${validatorNodeDeploymentPath}`);
        await runCommand(`kubectl ${action} -f ${validatorNodeServicePath}`);

        // Redis Service in Red
        await runCommand(`kubectl ${action} -f ${redisConfigMapPath}`);
        await runCommand(`kubectl ${action} -f ${redisServicePath}`);

        console.log('Despliegue de nodos realizado exitosamente.');
    } catch (error) {
        console.error('Error al desplegar los nodos:', error);
        throw error;
    }
};