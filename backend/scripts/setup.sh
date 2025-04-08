#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "📦 Instalando dependências..."
pnpm install

echo "🔍 Gerando Prisma Client..."
# Use pnpm exec to run the locally installed Prisma CLI
pnpm exec prisma generate

echo "⏳ Aplicando migrações do banco de dados..."
pnpm exec prisma migrate dev

echo "🛡️ Criando banco de dados de teste..."
# Extrai host e credenciais a partir do DATABASE_URL
DB_URL=$(grep DATABASE_URL .env | cut -d '"' -f 2)
DB_USER=$(echo $DB_URL | cut -d '/' -f 3 | cut -d '@' -f 1 | cut -d ':' -f 1)
DB_PASSWORD=$(echo $DB_URL | cut -d '/' -f 3 | cut -d '@' -f 1 | cut -d ':' -f 2)
DB_HOST=$(echo $DB_URL | cut -d '@' -f 2 | cut -d ':' -f 1)
DB_PORT=$(echo $DB_URL | cut -d '@' -f 2 | cut -d ':' -f 2 | cut -d '/' -f 1)
TEST_DB_NAME="hero_factory_test"

# Tenta criar o banco de dados de teste se ele não existir
echo "Criando banco de dados de teste '$TEST_DB_NAME'..."
mysql -u$DB_USER -p$DB_PASSWORD -h$DB_HOST -P$DB_PORT -e "CREATE DATABASE IF NOT EXISTS $TEST_DB_NAME;"
if [ $? -eq 0 ]; then
  echo "Banco de dados de teste criado ou já existente."
  
  # Verifica se a variável DATABASE_URL_TEST está presente no .env
  if ! grep -q "DATABASE_URL_TEST" .env; then
    echo "Adicionando DATABASE_URL_TEST ao arquivo .env..."
    echo "" >> .env
    echo "# URL de conexão do banco de dados de teste" >> .env
    echo "DATABASE_URL_TEST=\"mysql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$TEST_DB_NAME\"" >> .env
    echo "DATABASE_URL_TEST adicionada ao arquivo .env."
  else
    echo "DATABASE_URL_TEST já está presente no arquivo .env."
  fi
else
  echo "⚠️ Não foi possível criar o banco de dados de teste. Verifique suas credenciais e permissões."
fi

echo "🌱 Populando o banco de dados com dados iniciais..."
pnpm seed

echo "✅ Setup do backend concluído!" 