const fs = require('fs');
const path = require('path');
const k8s = require('@kubernetes/client-node');

// Ruta de los archivos YAML
const files = [
    'redis-configmap.yaml',
    'redis-service.yaml',
    'seed-node-app.yaml',
    'validator-node-deployment.yaml'
];

// Cargar los archivos YAML
const loadYamlFile = (file) => {
    try {
        const filePath = path.join(__dirname, file);
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`Error al leer el archivo ${file}:`, error);
        throw error;
    }
};

// Función para aplicar los recursos a Kubernetes
const applyYamlToK8s = async (yamlContent) => {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault(); // Cargar configuración por defecto (asegúrate de tener el kubeconfig correcto)

    const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

    // Aplicar el contenido YAML
    try {
        const response = await k8sApi.apply(yamlContent);
        console.log('Recurso aplicado:', response.body);
    } catch (error) {
        console.error('Error aplicando el recurso:', error);
    }
};

// Ejecutar la aplicación de los archivos YAML en orden
const execute = async () => {
    for (const file of files) {
        console.log(`Aplicando recurso desde ${file}...`);
        const yamlContent = loadYamlFile(file);
        await applyYamlToK8s(yamlContent);
    }
    console.log('Todos los recursos fueron aplicados correctamente.');
};

// Ejecutar el script
execute().catch((error) => {
    console.error('Error en el script:', error);
});