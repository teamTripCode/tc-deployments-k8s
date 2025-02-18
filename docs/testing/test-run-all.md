# Iniciar todos los recursos - Local Testing - Comandos

Debes ejecutar los comandos `kubectl apply` en orden para asegurar una ejecucion adecuada.

## 1. Creacion de imagenes

### Imagen `seed-node-tripcode`
```bash
docker build -t seed-node-tripcode:latest ./seed-node-tripcode
```

### Imagen `validator-node-tripcode`
```bash
docker build -t validator-node-tripcode:latest ./validator-node-tripcode
```

## 2. Despliegue Nodo Semilla

### Aplicar deployment del nodo semilla
```bash
cd seed
kubectl apply -f seed-node-deployment.yaml
```

### Aplicar el service del nodo semilla
```bash
cd seed
kubectl apply -f seed-node-service.yaml
```

## 3. Despliegue Nodo Validador

### Aplicar el deployment del nodo Validador
```bash
cd validator
kubectl apply -f seed-node-deployment.yaml
```

### Aplicar el service del nodo validador
```bash
cd validator
kubectl apply -f seed-node-service.yaml
```

## 4. Redis Instances

### Eliminar el servicio de Redis
```bash
cd redis
kubectl apply -f redis-service.yaml
```

### Eliminar el ConfigMap de Redis
```bash
cd redis
kubectl apply -f redis-configmap.yaml
```

## 5. Verificar que todo está funcionando

### Verificar pods
```bash
kubectl get pods
```

### Verificar Servicios
```bash
kubectl get services
```

Si algún pod no está en estado "Running", puedes verificar los logs:
```bash
kubectl describe pod <nombre-del-pod>
kubectl logs <nombre-del-pod> -c tc-seed-node  # Para el contenedor del nodo
kubectl logs <nombre-del-pod> -c redis-seed     # Para el contenedor Redis
```

## Después de aplicar estos servicios, podrás acceder a:

### Seed Node API:
```bash
http://localhost:30000
```

### Seed Node WebSocket:
```bash
ws://localhost:30001
```

### Validator Node API
```bash
http://localhost:30002
```

### Validator Node WebSocket
```bash
ws://localhost:30003
```