import 'reflect-metadata';
import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process'; // Import execSync
// import { PrismaClient } from '@prisma/client';
import prisma from '../src/config/prisma'; // <- Importar instância configurada

// Carregar variáveis de ambiente do .env de teste, se existir
dotenv.config({ path: path.resolve(__dirname, '.env.test') });
// Carregar .env padrão se .env.test não existir ou não contiver tudo
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Use a URL do banco de dados de teste, se disponível
if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
  // console.log(`Using test database: ${process.env.DATABASE_URL}`); // Log opcional para debug
} else {
  // Aviso se a URL de teste não for encontrada (raro em CI/local dev)
  console.warn('DATABASE_URL_TEST not defined. Using default DATABASE_URL for tests.');
}

// Não precisa mais instanciar aqui
// const prisma = new PrismaClient();

// Função para garantir que o banco de dados de teste esteja sincronizado e limpo
const resetTestDatabase = () => {
  console.log('Resetting test database...');
  const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
  console.log(`Using schema: ${schemaPath}`);
  try {
    // Usar migrate reset para dropar, recriar, e aplicar migrações
    execSync(`pnpm prisma migrate reset --force --skip-generate --schema=${schemaPath}`, { stdio: 'inherit' }); 
    console.log('Test database reset successfully.');
  } catch (error) {
    console.error('Failed to reset test database:', error);
    process.exit(1); 
  }
};

// Resetar o banco ANTES de qualquer teste rodar
resetTestDatabase();

// Limpa o banco de dados ANTES de todos os testes na suíte
beforeAll(async () => {
  // console.log('Cleaning test database before tests...'); // Log opcional
  try {
    // Ordem de delete importa se houver FKs
    await prisma.hero.deleteMany({}); 
    // console.log('Test database cleaned.'); // Log opcional
  } catch (error) {
    console.error('Error cleaning test database:', error);
    await prisma.$disconnect();
    throw error; 
  }
});

// Desconecta o client DEPOIS de todos os testes na suíte
afterAll(async () => {
  try {
    await prisma.$disconnect();
    // console.log('Prisma client disconnected after tests.'); // Log opcional
  } catch (error) {
    console.error('Error disconnecting Prisma client:', error);
  }
});

// Você também pode adicionar um beforeAll para garantir que as migrações estejam aplicadas
// antes de rodar os testes, usando `prisma migrate deploy` ou similar.
// Por enquanto, vamos assumir que as migrações são gerenciadas manualmente.

// Limpar o banco de dados antes de cada suíte de testes (ou antes de tudo)
// Adicionaremos isso em breve. 

// Mock de console.log/error para não poluir a saída dos testes (opcional)
// let originalConsoleLog: any;
// let originalConsoleError: any;

// beforeAll(() => {
//   originalConsoleLog = console.log;
//   originalConsoleError = console.error;
//   console.log = jest.fn(); // Mock console.log
//   console.error = jest.fn(); // Mock console.error
// });

// afterAll(() => {
//   console.log = originalConsoleLog; // Restore console.log
//   console.error = originalConsoleError; // Restore console.error
// }); 