#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "🚀 Iniciando configuração completa do projeto Hero Factory..."

# Verifica se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente."
  exit 1
fi

# Inicia os containers do Docker se não estiverem rodando
if ! docker ps | grep -q 'hero-factory-db'; then
  echo "🐋 Iniciando containers Docker..."
  docker-compose up -d
fi

# Espera o MySQL estar pronto para aceitar conexões
echo "⏳ Aguardando o MySQL iniciar (pode levar até 30 segundos)..."
for i in {1..30}; do
  if docker exec hero-factory-db mysqladmin ping -h localhost -u root -proot --silent > /dev/null 2>&1; then
    echo "✅ MySQL está pronto!"
    break
  fi
  echo -n "."
  sleep 2
  if [ $i -eq 30 ]; then
    echo "❌ Timeout aguardando MySQL iniciar. Verifique os logs do container: docker logs hero-factory-db"
    exit 1
  fi
done

# Cria os bancos de dados e configura permissões
echo "🔐 Configurando bancos de dados e permissões..."
docker exec -i hero-factory-db mysql -u root -proot <<EOF
CREATE DATABASE IF NOT EXISTS hero_factory;
CREATE DATABASE IF NOT EXISTS hero_factory_test;
CREATE DATABASE IF NOT EXISTS hero_factory_shadow;

# Recria o usuário para garantir permissões corretas
DROP USER IF EXISTS 'hero_user'@'%';
CREATE USER 'hero_user'@'%' IDENTIFIED BY 'hero_password';

# Concede todas as permissões necessárias
GRANT ALL PRIVILEGES ON hero_factory.* TO 'hero_user'@'%';
GRANT ALL PRIVILEGES ON hero_factory_test.* TO 'hero_user'@'%';
GRANT ALL PRIVILEGES ON hero_factory_shadow.* TO 'hero_user'@'%';
GRANT ALL PRIVILEGES ON *.* TO 'hero_user'@'%' WITH GRANT OPTION;

FLUSH PRIVILEGES;
EOF

echo "✅ Bancos de dados e usuários configurados!"

# Configurar o backend
echo "🛠️ Configurando backend..."
cd backend

# Criar .env se não existir
if [ ! -f .env ]; then
  echo "📝 Criando arquivo .env a partir do .env.example..."
  cp .env.example .env
fi

echo "📦 Instalando dependências backend..."
pnpm install

echo "🔍 Gerando Prisma Client..."
npx prisma generate

echo "⏳ Aplicando migrações do banco de dados..."
npx prisma migrate dev --name initial_migration

echo "🌱 Populando o banco de dados com dados iniciais..."
pnpm seed

echo "✅ Backend configurado com sucesso!"

# Configurar o frontend
echo "🎨 Configurando frontend..."
cd ../frontend

# Criar .env.local se não existir
if [ ! -f .env.local ]; then
  echo "📝 Criando arquivo .env.local a partir do .env.example..."
  cp .env.example .env.local
fi

echo "📦 Instalando dependências frontend..."
pnpm install

echo "✅ Frontend configurado com sucesso!"

cd ..

echo "🎉 Configuração completa finalizada!"

read -p "Deseja iniciar a aplicação agora? (S/n): " iniciar
if [[ $iniciar == "s" || $iniciar == "S" || $iniciar == "sim" || $iniciar == "Sim" || $iniciar == "" ]]; then
  echo "🚀 Iniciando aplicação..."
  ./scripts/dev.sh
else
  echo "Para iniciar a aplicação manualmente, execute: ./scripts/dev.sh" 
fi 