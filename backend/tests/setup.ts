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

// Função para configurar o banco de dados de teste
const setupTestDatabase = () => {
  console.log('Configurando o banco de dados de teste...');
  const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
  console.log(`Usando schema: ${schemaPath}`);
  
  try {
    // Criar o banco de dados se não existir
    console.log('Verificando se o banco de dados de teste existe...');
    // Extrair informações de conexão da DATABASE_URL_TEST
    const dbUrl = process.env.DATABASE_URL_TEST || '';
    const dbName = dbUrl.split('/').pop()?.split('?')[0];
    
    if (!dbName) {
      throw new Error('Não foi possível extrair o nome do banco de dados da DATABASE_URL_TEST');
    }
    
    console.log(`Nome do banco de dados de teste: ${dbName}`);
    
    // Executar as migrações no banco de dados de teste - isso também cria o banco se não existir
    console.log('Aplicando migrações ao banco de dados de teste...');
    execSync(`npx prisma migrate deploy --schema=${schemaPath}`, { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL_TEST }
    });
    
    console.log('Banco de dados de teste configurado com sucesso.');
  } catch (error) {
    console.error('Falha ao configurar o banco de dados de teste:', error);
    process.exit(1); 
  }
};

// Configuramos o banco de dados de teste imediatamente
setupTestDatabase();

// As funções beforeAll e afterAll do Jest estarão disponíveis quando este módulo for
// importado como setupFilesAfterEnv, mas não como setupFiles.
// Por isso, colocamos em um módulo exportado que só é executado quando as funções do Jest estão disponíveis
export const setupJestHooks = () => {
  // Verificar se estamos em um ambiente de teste do Jest
  if (typeof beforeAll === 'function' && typeof afterAll === 'function') {
    beforeAll(async () => {
      try {
        // Limpa os dados existentes - agora deve funcionar pois as tabelas existem
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
  }
};

// Chamar setupJestHooks, que só executará os hooks se estiver no ambiente correto do Jest
setupJestHooks();