#!/bin/bash
# Script para construir imágenes y desplegar los componentes en el orden correcto

echo "==== Build images ===="
docker build -t seed-node-tripcode:latest ./seed-node-tripcode
docker build -t validator-node-tripcode:latest ./validator-node-tripcode
docker build -t full-node-tripcode:latest ./complete-node-tripcode
docker build -t api-node-tripcode:latest ./api-node-tripcode

echo "==== Tag images for Docker Hub (replace "yourusername" with your actual Docker Hub username) ===="
docker tag seed-node-tripcode:latest foultrip/seed-node-tripcode:latest
docker tag validator-node-tripcode:latest foultrip/validator-node-tripcode:latest
docker tag full-node-tripcode:latest foultrip/full-node-tripcode:latest
docker tag api-node-tripcode:latest foultrip/api-node-tripcode:latest

echo "==== Push images to Docker Hub (you need to be logged in with 'docker login') ===="
docker push foultrip/seed-node-tripcode:latest
docker push foultrip/validator-node-tripcode:latest
docker push foultrip/full-node-tripcode:latest
docker push foultrip/api-node-tripcode:latest

echo "===== Creando ConfigMaps y Servicios ====="
kubectl apply -f ./k8s/redis/redis-configmap.yaml
kubectl apply -f ./k8s/redis/redis-service.yaml

echo "===== Creando volúmenes persistentes ====="
kubectl apply -f ./k8s/storage/persistent-volumes.yaml

echo "===== Desplegando nodos semilla ====="
kubectl apply -f ./k8s/seed/seed-node-deployment.yaml
kubectl apply -f ./k8s/seed/seed-node-service.yaml

echo "===== Esperando a que los nodos semilla estén listos ====="
kubectl wait --for=condition=available deployment/seed-node --timeout=300s

echo "===== Desplegando nodos validadores ====="
kubectl apply -f ./k8s/validator/validator-node-deployment.yaml
kubectl apply -f ./k8s/validator/validator-node-service.yaml

echo "===== Desplegando nodos completos ====="
kubectl apply -f ./k8s/full/full-node-deployment.yaml
kubectl apply -f ./k8s/full/full-node-service.yaml

echo "===== Desplegando nodos API ====="
kubectl apply -f ./k8s/api/api-node-deployment.yaml
kubectl apply -f ./k8s/api/api-node-service.yaml

echo "===== Desplegando servicios auxiliares ====="
kubectl apply -f auxiliary/monitoring-deployment.yaml
kubectl apply -f auxiliary/logging-deployment.yaml

echo "===== Verificando despliegue ====="
kubectl get pods
kubectl get services

echo "===== Despliegue completado ====="