import { ManageDockerImages } from '../services/docker';
import { deployNodes } from '../services/kubernetes';
import { setupMiniKubeClusters } from '../services/mini-kube';
import { TypeAction } from '../services/types';

export const AdmindeployChain = async (type: TypeAction) => {
  try {
    if (type !== 'create' && type !== 'remove') throw new Error('type is incorrect');

    // Primero, creamos las imágenes Docker
    await ManageDockerImages(type);

    // Luego creamos los clusters de MiniKube
    await setupMiniKubeClusters(type);

    // Luego, desplegamos los nodos y servicios de Kubernetes
    console.log('Desplegando red P2P...');
    await deployNodes(type);

    console.log('Despliegue exitoso');
  } catch (error) {
    console.error('Error durante el despliegue:', error);
  }
};