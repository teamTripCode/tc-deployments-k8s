import { runCommand } from './shell';
import { logInfo, logError, logDebug } from '../utils/logger';
import path from 'path';
import fs from 'fs/promises';
import { ClusterConfig, TypeAction } from './types';
import { DEFAULT_CLUSTERS } from './config';

// Validar que minikube está instalado
async function validateMinikube(): Promise<boolean> {
  try {
    await runCommand('minikube version');
    return true;
  } catch (error) {
    logError('Minikube no está instalado o no se puede ejecutar', 
      error instanceof Error ? error : undefined);
    return false;
  }
}

// Crear un cluster de minikube
async function createCluster(cluster: ClusterConfig): Promise<boolean> {
  try {
    logInfo(`Creando cluster ${cluster.name} para nodos ${cluster.role}`);
    
    // Construir comando con recursos configurados
    const createCommand = `minikube start \
      --profile ${cluster.name} \
      --cpus=${cluster.resources.cpu} \
      --memory=${cluster.resources.memory} \
      --nodes=${cluster.nodes} \
      --addons=dashboard \
      --addons=metrics-server \
      --labels="role=${cluster.role}"`;
    
    const { stdout } = await runCommand(createCommand);
    logInfo(`Cluster ${cluster.name} creado exitosamente`, { output: stdout });
    
    // Configurar contexto para este cluster
    await runCommand(`kubectl config use-context ${cluster.name}`);
    
    return true;
  } catch (error) {
    logError(`Error al crear cluster ${cluster.name}`, 
      error instanceof Error ? error : undefined);
    return false;
  }
}

// Eliminar un cluster de minikube
async function deleteCluster(clusterName: string): Promise<boolean> {
  try {
    logInfo(`Eliminando cluster ${clusterName}`);
    const { stdout } = await runCommand(`minikube delete --profile ${clusterName}`);
    logInfo(`Cluster ${clusterName} eliminado exitosamente`, { output: stdout });
    return true;
  } catch (error) {
    logError(`Error al eliminar cluster ${clusterName}`, 
      error instanceof Error ? error : undefined);
    return false;
  }
}

// Desplegar nodo semilla en el cluster de semillas
async function deploySeedNode(action: TypeAction): Promise<boolean> {
  try {
    // Cambiar al contexto del cluster de semillas
    await runCommand('kubectl config use-context seed-cluster');
    
    const manifestPath = path.resolve(__dirname, '../kubernetes/seed-node.yaml');
    
    // Verificar que el archivo existe
    try {
      await fs.access(manifestPath);
    } catch {
      throw new Error(`Archivo de manifiesto no encontrado: ${manifestPath}`);
    }
    
    // Aplicar o eliminar según la acción
    const operation = action === 'create' ? 'apply' : 'delete';
    logInfo(`${operation === 'apply' ? 'Desplegando' : 'Eliminando'} nodo semilla`);
    
    const { stdout } = await runCommand(`kubectl ${operation} -f "${manifestPath}"`);
    logInfo(`Nodo semilla ${operation === 'apply' ? 'desplegado' : 'eliminado'} exitosamente`, 
      { output: stdout });
    
    return true;
  } catch (error) {
    const operation = action === 'create' ? 'desplegar' : 'eliminar';
    logError(`Error al ${operation} nodo semilla`, 
      error instanceof Error ? error : undefined);
    return false;
  }
}

// Desplegar nodos validadores en el cluster de validadores
async function deployValidatorNodes(action: TypeAction, count: number = 3): Promise<boolean> {
  try {
    // Cambiar al contexto del cluster de validadores
    await runCommand('kubectl config use-context validator-cluster');
    
    const manifestPath = path.resolve(__dirname, '../kubernetes/validator-node.yaml');
    
    // Verificar que el archivo existe
    try {
      await fs.access(manifestPath);
    } catch {
      throw new Error(`Archivo de manifiesto no encontrado: ${manifestPath}`);
    }
    
    // Modificar el manifiesto para establecer la réplica según el recuento
    let manifestContent = await fs.readFile(manifestPath, 'utf8');
    manifestContent = manifestContent.replace(/replicas: \d+/, `replicas: ${count}`);
    
    // Guardar temporalmente el manifiesto modificado
    const tempManifestPath = path.resolve(__dirname, '../kubernetes/temp-validator-node.yaml');
    await fs.writeFile(tempManifestPath, manifestContent);
    
    // Aplicar o eliminar según la acción
    const operation = action === 'create' ? 'apply' : 'delete';
    logInfo(`${operation === 'apply' ? 'Desplegando' : 'Eliminando'} ${count} nodos validadores`);
    
    const { stdout } = await runCommand(`kubectl ${operation} -f "${tempManifestPath}"`);
    logInfo(`Nodos validadores ${operation === 'apply' ? 'desplegados' : 'eliminados'} exitosamente`, 
      { output: stdout });
    
    // Limpiar el archivo temporal
    await fs.unlink(tempManifestPath);
    
    return true;
  } catch (error) {
    const operation = action === 'create' ? 'desplegar' : 'eliminar';
    logError(`Error al ${operation} nodos validadores`, 
      error instanceof Error ? error : undefined);
    return false;
  }
}

// Función principal para crear/eliminar todos los clusters y desplegar nodos
export async function setupMiniKubeClusters(
  action: TypeAction, 
  customClusters?: ClusterConfig[]
): Promise<boolean> {
  try {
    if (action !== 'create' && action !== 'remove') {
      throw new Error('Tipo de acción incorrecto. Debe ser "create" o "remove"');
    }
    
    logInfo(`Iniciando operación "${action}" para clusters de minikube`);
    
    // Validar minikube está instalado
    if (!await validateMinikube()) {
      throw new Error('Minikube no está disponible');
    }
    
    const clusters = customClusters || DEFAULT_CLUSTERS;
    let success = true;
    
    if (action === 'create') {
      // Crear los clusters
      for (const cluster of clusters) {
        if (!await createCluster(cluster)) {
          success = false;
          break;
        }
      }
      
      if (success) {
        // Desplegar nodos en sus respectivos clusters
        const seedSuccess = await deploySeedNode('create');
        const validatorSuccess = await deployValidatorNodes('create');
        
        success = seedSuccess && validatorSuccess;
      }
    } else {
      // Para eliminar, primero eliminamos los recursos
      await deploySeedNode('remove');
      await deployValidatorNodes('remove');
      
      // Luego eliminamos los clusters
      for (const cluster of clusters) {
        if (!await deleteCluster(cluster.name)) {
          success = false;
        }
      }
    }
    
    if (success) {
      logInfo(`Operación "${action}" completada exitosamente para todos los clusters`);
    } else {
      logError(`Operación "${action}" completada con errores`);
    }
    
    return success;
  } catch (error) {
    logError(`Error fatal durante operación "${action}" de clusters`, 
      error instanceof Error ? error : undefined);
    
    if (action === 'create') {
      logInfo('Intentando eliminar recursos desplegados debido al error...');
      await setupMiniKubeClusters('remove');
    }
    
    return false;
  }
}

// Función para obtener el status de los clusters
export async function getClusterStatus(): Promise<Record<string, any>> {
  try {
    // Obtener lista de perfiles de minikube
    const { stdout: profilesOutput } = await runCommand('minikube profile list -o json');
    const profiles = JSON.parse(profilesOutput);
    
    const result: Record<string, any> = {
      clusters: {}
    };
    
    // Procesar cada perfil
    for (const profile of profiles.valid || []) {
      // Cambiar al contexto de este cluster
      await runCommand(`kubectl config use-context ${profile.Name}`);
      
      // Obtener nodos
      const { stdout: nodesOutput } = await runCommand('kubectl get nodes -o json');
      const nodes = JSON.parse(nodesOutput);
      
      // Obtener pods
      const { stdout: podsOutput } = await runCommand('kubectl get pods -o json');
      const pods = JSON.parse(podsOutput);
      
      result.clusters[profile.Name] = {
        status: profile.Status,
        nodes: nodes.items.length,
        nodeDetails: nodes.items.map((node: any) => ({
          name: node.metadata.name,
          status: node.status.conditions.find((c: any) => c.type === 'Ready')?.status === 'True' ? 'Ready' : 'NotReady',
          labels: node.metadata.labels
        })),
        pods: pods.items.length,
        podDetails: pods.items.map((pod: any) => ({
          name: pod.metadata.name,
          status: pod.status.phase,
          node: pod.spec.nodeName
        }))
      };
    }
    
    return result;
  } catch (error) {
    logError('Error al obtener estado de los clusters', 
      error instanceof Error ? error : undefined);
    return { error: 'Failed to get cluster status' };
  }
}

export const minikubeUtils = {
  validateMinikube,
  createCluster,
  deleteCluster,
  deploySeedNode,
  deployValidatorNodes,
  getClusterStatus
};