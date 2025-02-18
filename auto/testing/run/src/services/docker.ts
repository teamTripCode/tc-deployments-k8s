import { runCommand } from "./shell";

// Crear múltiples imágenes Docker
export const createDockerImages = async () => {
  const images = [
    { name: 'seed-node-tripcode', path: '../../../../../../seed-node-tripcode' },
    { name: 'validator-node-tripcode', path: '../../../../../../validator-node-tripcode' }
  ];

  const promises = images.map(async (image) => {
    try {
      console.log(`Creando imagen Docker para ${image.name}...`);
      const result = await runCommand(`cd ${image.path} && docker build -t ${image.name}:latest .`);
      console.log(`Imagen Docker para ${image.name} creada exitosamente.`);
      return result;
    } catch (error) {
      console.error(`Error al crear la imagen Docker para ${image.name}:`, error);
      throw error;
    }
  });

  // Ejecutamos todas las creaciones de imagenes en paralelo
  return Promise.all(promises);
};
