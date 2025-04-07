# Hero Factory

Uma plataforma para gerenciamento de heróis, suas características e poderes.

## Estrutura do Projeto

```
/
├── frontend/     # Aplicação frontend em Next.js
└── backend/      # API REST em Node.js
```

## Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- MySQL 8.0 (via Docker)
- pnpm (gerenciador de pacotes)

## Como Iniciar

1. Clone o repositório
2. Inicie o banco de dados:
   ```bash
   docker-compose up -d
   ```

3. Configuração do Frontend:
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

4. Configuração do Backend:
   ```bash
   cd backend
   pnpm install
   pnpm dev
   ```

## Tecnologias Utilizadas

### Frontend
- Next.js com TypeScript
- React
- TailwindCSS

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- MySQL 8.0

## Desenvolvimento

Mais informações sobre o processo de desenvolvimento e diretrizes serão adicionadas conforme o projeto evolui. 