#!/bin/bash
# Script para construir imágenes y desplegar los componentes en el orden correcto

echo "===== Construyendo imágenes Docker ====="
# Construir imagen del nodo semilla
docker build -t seed-node-tripcode:latest ../seed-node-tripcode
# Construir imagen del nodo validador
docker build -t validator-node-tripcode:latest ../validator-node-tripcode
# Construir imagen del nodo completo
docker build -t full-node-tripcode:latest ../full-node-tripcode
# Construir imagen del nodo API
docker build -t api-node-tripcode:latest ../api-node-tripcode

echo "===== Creando ConfigMaps y Servicios ====="
kubectl apply -f redis/redis-configmap.yaml
kubectl apply -f redis/redis-service.yaml

echo "===== Creando volúmenes persistentes ====="
kubectl apply -f storage/persistent-volumes.yaml

echo "===== Desplegando nodos semilla ====="
kubectl apply -f seed/seed-node-deployment.yaml
kubectl apply -f seed/seed-node-service.yaml

echo "===== Esperando a que los nodos semilla estén listos ====="
kubectl wait --for=condition=available deployment/seed-node --timeout=300s

echo "===== Desplegando nodos validadores ====="
kubectl apply -f validator/validator-node-deployment.yaml
kubectl apply -f validator/validator-node-service.yaml

echo "===== Desplegando nodos completos ====="
kubectl apply -f full/full-node-deployment.yaml
kubectl apply -f full/full-node-service.yaml

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