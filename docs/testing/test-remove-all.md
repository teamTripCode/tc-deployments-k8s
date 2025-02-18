# Borrar todos los recursos - Local Testing

Debes ejecutar los comandos `kubectl delete` en el orden inverso al de creación para asegurar una limpieza adecuada.

## Nodo Semilla

### Eliminar el deployment del nodo semilla
```bash
cd seed
kubectl delete -f seed-node-deployment.yaml
```

### Eliminar el service del nodo semilla
```bash
cd seed
kubectl delete -f seed-node-service.yaml
```

## Nodo Validador

### Eliminar el deployment del nodo Validador
```bash
cd validator
kubectl delete -f validator-node-deployment.yaml
```

### Eliminar el service del nodo validador
```bash
cd validator
kubectl delete -f validator-node-service.yaml
```

## Redis Instances

### Eliminar el servicio de Redis
```bash
cd redis
kubectl delete -f redis-service.yaml
```

### Eliminar el ConfigMap de Redis
```bash
cd redis
kubectl delete -f redis-configmap.yaml
```

## Verificar que los recursos han sido eliminados

### Verificar que no hay pods en ejecución
```bash
kubectl get pods
```

### Verificar que no hay servicios activos
```bash
kubectl get services
```

Si algún recurso persiste, puedes revisar los logs o forzar la eliminación:
```bash
kubectl delete pod <nombre-del-pod> --force --grace-period=0
kubectl delete service <nombre-del-servicio>
```
