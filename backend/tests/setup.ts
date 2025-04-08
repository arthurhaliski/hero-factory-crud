import 'reflect-metadata';
import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process'; 
import prisma from '../src/config/prisma'; 

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Verificar e configurar a URL do banco de dados para testes
if (process.env.DATABASE_URL_TEST) {
  console.log('Usando DATABASE_URL_TEST para os testes.');
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
} else {
  console.error('AVISO: DATABASE_URL_TEST não está definido no arquivo .env!');
  console.error('Os testes vão usar o banco de dados principal, o que pode causar perda de dados!');
  console.error('Por favor, defina DATABASE_URL_TEST no arquivo .env e execute os testes novamente.');
  process.exit(1); // Interromper os testes para evitar danos ao banco de dados principal
}

const resetTestDatabase = () => {
  console.log('Resetando o banco de dados de teste...');
  const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
  console.log(`Usando schema: ${schemaPath}`);
  try {
    execSync(`pnpm prisma migrate reset --force --skip-generate --schema=${schemaPath}`, { stdio: 'inherit' }); 
    console.log('Banco de dados de teste resetado com sucesso.');
  } catch (error) {
    console.error('Falha ao resetar o banco de dados de teste:', error);
    process.exit(1); 
  }
};

resetTestDatabase();

beforeAll(async () => {
  try {
    await prisma.hero.deleteMany({}); 
  } catch (error) {
    console.error('Erro ao limpar banco de dados de teste:', error);
    await prisma.$disconnect();
    throw error; 
  }
});

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro ao desconectar cliente Prisma:', error);
  }
});