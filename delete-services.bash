#!/bin/bash
# Script para eliminar todos los recursos creados por run-services.bash en orden inverso

echo "===== Eliminando servicios auxiliares ====="
kubectl delete -f auxiliary/logging-deployment.yaml
kubectl delete -f auxiliary/monitoring-deployment.yaml

echo "===== Eliminando nodos API ====="
kubectl delete -f api/api-node-service.yaml
kubectl delete -f api/api-node-deployment.yaml

echo "===== Eliminando nodos completos ====="
kubectl delete -f full/full-node-service.yaml
kubectl delete -f full/full-node-deployment.yaml

echo "===== Eliminando nodos validadores ====="
kubectl delete -f validator/validator-node-service.yaml
kubectl delete -f validator/validator-node-deployment.yaml

echo "===== Eliminando nodos semilla ====="
kubectl delete -f seed/seed-node-service.yaml
kubectl delete -f seed/seed-node-deployment.yaml

echo "===== Eliminando volúmenes persistentes ====="
kubectl delete -f storage/persistent-volumes.yaml

echo "===== Eliminando ConfigMaps y Servicios ====="
kubectl delete -f redis/redis-service.yaml
kubectl delete -f redis/redis-configmap.yaml

echo "===== Verificando que todos los recursos se han eliminado ====="
kubectl get pods
kubectl get services
kubectl get pv
kubectl get pvc

echo "===== Si algún recurso persiste, puede usar los siguientes comandos ====="
echo "kubectl delete pod <nombre-del-pod> --force --grace-period=0"
echo "kubectl delete service <nombre-del-servicio>"
echo "kubectl delete pv <nombre-del-volumen-persistente>"
echo "kubectl delete pvc <nombre-del-claim-de-volumen>"

echo "===== Limpieza completada ====="