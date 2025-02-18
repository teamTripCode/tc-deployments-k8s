import { createDockerImages } from '../services/docker.js';
import { deployNodes, typeAction } from '../services/kubernetes.js';

export const deployChain = async (type: typeAction) => {
  try {
    if (type !== 'create' && type !== 'remove') throw new Error('type is incorrect');

    // Primero, creamos las imágenes Docker
    await createDockerImages();
    
    // Luego, desplegamos los nodos y servicios de Kubernetes
    console.log('Desplegando red P2P...');
    await deployNodes(type);
    
    console.log('Despliegue exitoso');
  } catch (error) {
    console.error('Error durante el despliegue:', error);
  }
};
