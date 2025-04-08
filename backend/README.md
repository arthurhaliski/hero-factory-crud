# Hero Factory - Backend API

Esta é a API backend para a aplicação "Hero Factory", responsável por gerenciar informações sobre heróis, construída com Node.js, TypeScript, Express, Prisma e MySQL.

## Índice

- [Pré-requisitos](#pré-requisitos)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Setup do Banco de Dados (Docker)](#setup-do-banco-de-dados-docker)
- [Instalação e Configuração Inicial](#instalação-e-configuração-inicial)
- [Seed do Banco de Dados](#seed-do-banco-de-dados)
- [Migrações do Banco de Dados (Avançado)](#migrações-do-banco-de-dados-avançado)
- [Rodando a Aplicação](#rodando-a-aplicação)
  - [Modo de Desenvolvimento](#modo-de-desenvolvimento)
  - [Modo de Produção](#modo-de-produção)
- [Rodando os Testes](#rodando-os-testes)
- [Documentação da API (Swagger)](#documentação-da-api-swagger)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Arquitetura e Design Patterns](#arquitetura-e-design-patterns)
- [Tecnologias e Justificativas](#tecnologias-e-justificativas)
- [Tratamento de Erros](#tratamento-de-erros)
- [Logging](#logging)
- [Segurança](#segurança)

## Pré-requisitos

- [Node.js](https://nodejs.org/) (Versão >= 18 - Verificado em `package.json`)
- [pnpm](https://pnpm.io/) (Versão >= 8 - Verificado em `package.json`)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

## Configuração do Ambiente

1.  **Clone o repositório.**
2.  **Crie o arquivo `.env`:** Na raiz do diretório `backend/`, copie o arquivo `.env.example` para `.env` ou crie um novo `.env` com as seguintes variáveis:

    ```dotenv
    # Configurações do Servidor
    PORT=3001

    # Configurações do Banco de Dados
    # URL de conexão principal (deve corresponder ao docker-compose.yml)
    DATABASE_URL="mysql://hero_user:hero_password@localhost:3306/hero_factory"
    
    # URL de conexão do banco de dados de teste (IMPORTANTE para evitar perda de dados!)
    # Os testes APENAS usarão este banco, nunca o banco de dados principal
    DATABASE_URL_TEST="mysql://hero_user:hero_password@localhost:3306/hero_factory_test"
    
    # URL de conexão para o Shadow Database (usado pelo Prisma Migrate)
    SHADOW_DATABASE_URL="mysql://hero_user:hero_password@localhost:3306/hero_factory_shadow"

    # Ambiente da Aplicação
    NODE_ENV=development
    ```

    *   **Importante:** Os valores `DATABASE_URL` devem usar as credenciais e o nome do banco definidos no `docker-compose.yml`.
    *   **CRÍTICO:** A variável `DATABASE_URL_TEST` DEVE apontar para um banco de dados diferente do principal para evitar perda de dados durante a execução dos testes!

## Setup do Banco de Dados (Docker)

O banco de dados MySQL roda em um container Docker gerenciado pelo `docker-compose.yml` na raiz do projeto.

1.  **Navegue até a raiz do projeto** (onde está o `docker-compose.yml`).
2.  **Inicie os containers:**
    ```bash
    docker-compose up -d
    ```
    Isso iniciará o container `hero-factory-db`, criará o banco `hero_factory` e o usuário `hero_user`.

3.  **Parar containers:**
    ```bash
    docker-compose down
    ```

4.  **Parar e remover volumes (apaga dados do banco):**
    ```bash
    docker-compose down -v
    ```

## Instalação e Configuração Inicial

1.  Navegue até o diretório `backend/`:
    ```bash
    cd backend
    ```
2.  **Execute o script de setup:**
    Este script irá instalar dependências, gerar o Prisma Client e aplicar as migrações iniciais do banco de dados.
    ```bash
    chmod +x scripts/setup.sh # Garanta que o script seja executável (apenas na primeira vez)
    ./scripts/setup.sh
    ```
    *Opcionalmente, os passos manuais são: `pnpm install`, `pnpm exec prisma generate`, `pnpm exec prisma migrate dev`.*

## Seed do Banco de Dados

O script de setup já inclui a população do banco de dados com dados iniciais. Se você quiser executar apenas o seed manualmente:

```bash
# Dentro do diretório backend/
pnpm seed
```

Isso irá popular o banco de dados com 15 heróis predefinidos (7 da DC Comics e 8 da Marvel), facilitando o teste da aplicação sem precisar criar dados manualmente. Esse conjunto de dados foi especialmente projetado para demonstrar a funcionalidade de paginação no frontend.

## Migrações do Banco de Dados (Avançado)

O setup inicial cuida das migrações. Se você precisar gerar *novas* migrações após modificar o `prisma/schema.prisma`:

```bash
# Dentro do diretório backend/
pnpm exec prisma migrate dev --name <nome-descritivo-da-migracao>
```

Para gerar o Prisma Client manualmente (geralmente não necessário):
```bash
# Dentro do diretório backend/
pnpm exec prisma generate
```

## Rodando a Aplicação

### Modo de Desenvolvimento

Com hot-reloading (usando `ts-node-dev`):

```bash
# Dentro do diretório backend/
pnpm dev
```

A API estará disponível em `http://localhost:3001` (ou a porta no `.env`).

### Modo de Produção

1.  Compile o código TypeScript:
    ```bash
    # Dentro do diretório backend/
    pnpm build
    ```
2.  Inicie a aplicação compilada:
    ```bash
    # Dentro do diretório backend/
    pnpm start
    ```

## Rodando os Testes

Utilizamos Jest e Supertest para os testes. Os testes interagem com um banco de dados real, mas usam EXCLUSIVAMENTE o banco de dados definido em `DATABASE_URL_TEST`, e NÃO o banco de dados principal.

> ⚠️ **ATENÇÃO:** Certifique-se de que a variável `DATABASE_URL_TEST` está configurada no arquivo `.env` e aponta para um banco de dados DIFERENTE do banco de dados principal. Caso contrário, os testes não serão executados (o script de setup configurou isso automaticamente para você).

O arquivo `tests/setup.ts` foi configurado para:
- Verificar se `DATABASE_URL_TEST` está definido
- Criar o banco de dados de teste se não existir
- Aplicar as migrações do Prisma automaticamente
- Limpar os dados entre os testes
- Interromper a execução dos testes se `DATABASE_URL_TEST` não estiver definido

Para executar os testes:

1.  **Rodar todos os testes:**
    ```bash
    # Dentro do diretório backend/
    pnpm test
    ```

2.  **Rodar testes específicos (exemplo):**
    ```bash
    # Dentro do diretório backend/
    pnpm test src/services/hero.service.test.ts
    ```

3.  **Rodar com cobertura:**
    ```bash
    # Dentro do diretório backend/
    pnpm test --coverage
    ```
    *Os testes de integração requerem que o container do banco de dados esteja rodando.*

## Documentação da API (Swagger)

A documentação OpenAPI é gerada automaticamente a partir de comentários JSDoc.

-   **UI Interativa:** `http://localhost:3001/docs` (com a API rodando)
-   **JSON:** `http://localhost:3001/docs-json`

## Estrutura de Pastas

```
backend/
├── prisma/             # Schema e migrações do Prisma
├── src/
│   ├── config/         # Configurações (Prisma, Logger, Swagger)
│   ├── controllers/    # Controladores HTTP
│   ├── errors/         # Erros customizados (AppError)
│   ├── middlewares/    # Middlewares (errorHandler, validateRequest)
│   ├── repositories/   # Acesso a dados (Prisma)
│   ├── routes/         # Definição das rotas
│   ├── services/       # Lógica de negócio
│   ├── types/          # Tipos TypeScript (DTOs, entidades)
│   ├── utils/          # Utilitários (catchAsync, formatters)
│   ├── validators/     # Schemas de validação (Zod)
│   └── server.ts       # Ponto de entrada (Express)
├── tests/              # Testes (unitários e de integração)
│   ├── setup.ts        # Configuração global de testes (ex: limpar DB)
│   └── ...
├── .env                # Variáveis de ambiente (local, não versionado)
├── .env.example        # Exemplo de variáveis de ambiente
├── .gitignore
├── docker-compose.yml  # (Na raiz do projeto)
├── jest.config.js
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

## Arquitetura e Design Patterns

A API adota uma arquitetura em camadas clássica:

1.  **Rotas (`routes/`)**: Mapeamento de endpoints HTTP para Controllers, validação de entrada.
2.  **Controllers (`controllers/`)**: Orquestração da requisição/resposta HTTP, chamando Services.
3.  **Services (`services/`)**: Lógica de negócio, regras de aplicação, orquestração de Repositories.
4.  **Repositories (`repositories/`)**: Abstração da persistência de dados (Prisma Client).

**Design Patterns:**

-   **Repository Pattern:** Encapsula o acesso aos dados.
-   **Service Layer Pattern:** Isola a lógica de negócio.
-   **Dependency Injection (com `tsyringe`):** Facilita a injeção de dependências (Repository -> Service -> Controller), promovendo baixo acoplamento e testabilidade.
-   **Middleware Pattern (Express):** Usado para tratamento de erros, logging, validação, rate limiting, etc.
-   **DTO (Data Transfer Object):** Implícito via interfaces TypeScript e schemas Zod.

## Tecnologias e Justificativas

-   **Node.js & Express:** Plataforma e framework web maduros e eficientes para APIs RESTful.
-   **TypeScript:** Melhora a qualidade do código, segurança de tipos e manutenibilidade.
-   **Prisma:** ORM moderno e type-safe, simplifica interações com o banco e migrações.
-   **MySQL (via Docker):** Banco de dados relacional robusto, conforme requisitos, com ambiente consistente via Docker.
-   **Zod:** Validação de schemas declarativa e type-safe, integrada com OpenAPI.
-   **Jest & Supertest:** Testes unitários e de integração para garantir a qualidade.
-   **Tsyringe:** Container de injeção de dependência leve para gerenciar a criação e injeção de instâncias (controllers, services, repositories).
-   **Pino & pino-http:** Logging estruturado e de alta performance.
-   **Swagger (OpenAPI) & swagger-ui-express & swagger-jsdoc:** Documentação interativa da API gerada a partir do código.
-   **Docker:** Containerização do banco de dados para ambiente padronizado.
-   **Helmet & express-rate-limit:** Medidas básicas de segurança (headers HTTP e limitação de taxa).
-   **pnpm:** Gerenciador de pacotes.

## Tratamento de Erros

A API implementa um mecanismo centralizado de tratamento de erros usando middleware do Express. Classes de erro customizadas estendem uma classe base `AppError`, permitindo respostas de erro consistentes.

Características notáveis do tratamento de erros:
- Classes de erro customizadas para cenários específicos (NotFoundError, ConflictError)
- Tradução de erros do Prisma (ex.: P2025 para NotFoundError nos repositórios)
- Erros de validação do Zod são analisados e retornados com mensagens descritivas
- Tratamento de erros async/await usando o utilitário catchAsync
- Logging detalhado de erros com contexto apropriado

## Logging

-   Utiliza `Pino` para logging estruturado (JSON em produção, formatado com `pino-pretty` em desenvolvimento).
-   `pino-http` loga automaticamente detalhes de cada requisição HTTP (método, URL, status, duração).
-   O `errorHandler` loga erros não tratados ou inesperados com detalhes (incluindo stack trace).

## Segurança

-   **Helmet:** Aplica diversos headers HTTP para mitigar vulnerabilidades comuns (XSS, clickjacking, etc.).
-   **CORS:** Configurado para permitir requisições de origens esperadas (atualmente aberto, pode ser restringido).
-   **Rate Limiting (`express-rate-limit`):** Limita o número de requisições por IP para prevenir ataques de força bruta ou DoS básicos.
-   **Validação de Entrada (Zod):** Garante que apenas dados válidos cheguem à lógica de negócio.
-   **Prisma:** Ajuda a prevenir SQL Injection por padrão.

*Nota: Nenhuma autenticação/autorização foi implementada conforme os requisitos.* 