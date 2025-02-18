# Comandos para aplicar los archivos YAML en el orden correcto:

## Aplica el `redis-configmap.yaml`:

```bash
kubectl apply -f redis-configmap.yaml
```

## Aplica el `redis-service.yaml`:

```bash
kubectl apply -f redis-service.yaml
```

## Aplica el `seed-node-app.yaml`:

```bash
kubectl apply -f seed-node-app.yaml
```

## Aplica el `validator-node-deployment.yaml`:

```bash
kubectl apply -f validator-node-deployment.yaml
```

## Consideraciones:

 - Asegúrate de que tu configuración de kubectl esté correctamente configurada (por ejemplo, que tengas acceso a tu clúster de Kubernetes a través del archivo kubeconfig).

 - Los archivos YAML deben estar en el directorio actual o debes especificar la ruta completa de cada archivo.