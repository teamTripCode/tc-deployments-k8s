#!/bin/bash
# Script para desplegar los componentes en el orden correcto

echo "===== Creando ConfigMaps y Servicios ====="
kubectl apply -f redis/redis-configmap.yaml
kubectl apply -f redis/redis-service.yaml

echo "===== Creando volúmenes persistentes ====="
kubectl apply -f storage/persistent-volumes.yaml

echo "===== Desplegando nodos semilla ====="
kubectl apply -f seed-nodes/seed-node-deployment.yaml
kubectl apply -f seed-nodes/seed-node-service.yaml

echo "===== Esperando a que los nodos semilla estén listos ====="
kubectl wait --for=condition=available deployment/seed-node --timeout=300s

echo "===== Desplegando nodos validadores ====="
kubectl apply -f validators/validator-node-deployment.yaml
kubectl apply -f validators/validator-node-service.yaml

echo "===== Desplegando nodos completos ====="
kubectl apply -f full-nodes/full-node-deployment.yaml
kubectl apply -f full-nodes/full-node-service.yaml

echo "===== Desplegando nodos API ====="
kubectl apply -f api/api-node-deployment.yaml
kubectl apply -f api/api-node-service.yaml

echo "===== Desplegando servicios auxiliares ====="
kubectl apply -f auxiliary/monitoring-deployment.yaml
kubectl apply -f auxiliary/logging-deployment.yaml

echo "===== Verificando despliegue ====="
kubectl get pods
kubectl get services

echo "===== Despliegue completado ====="