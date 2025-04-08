# Hero Factory - Frontend

Este diretório contém a aplicação frontend para o projeto CRUD Hero Factory, construída com Next.js, React e TypeScript.

## Pré-requisitos

- Node.js (v18 ou posterior recomendado)
- pnpm (Gerenciador de pacotes)
- O [serviço backend](../backend/README.md) deve estar rodando.

## Setup

1.  **Navegue até o diretório frontend:**
    ```bash
    cd frontend
    ```

2.  **Instale as dependências:**
    ```bash
    pnpm install
    ```

3.  **Variáveis de Ambiente:**
    Este frontend conecta-se à API backend. Garanta que o backend esteja rodando (geralmente na porta 3001). A URL base da API está configurada no código (ex: em `src/lib/apiClient.ts`) ou pode ser movida para uma variável de ambiente (`.env.local`) se necessário (ex: `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api`). Atualmente, assume-se `http://localhost:3001/api`.

## Rodando o Servidor de Desenvolvimento

Para iniciar o servidor de desenvolvimento do frontend (geralmente na porta 3000):

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## Tecnologias Utilizadas (Tech Stack)

- **Framework:** Next.js (com App Router)
- **Linguagem:** TypeScript
- **UI Library:** React
- **Estilização:** Tailwind CSS
- **Gerenciamento de Estado:** React Hooks (useState, useCallback, etc.)
- **Busca de Dados:** `apiClient` customizado usando `fetch`
- **Formulários:** React Hook Form com Zod para validação
- **Notificações:** Sonner
- **Linting/Formatação:** ESLint, Prettier

## Estrutura do Projeto (Visão Geral)

- **`src/app/`**: Contém as rotas principais e layout (App Router).
- **`src/components/`**: Componentes de UI reutilizáveis.
  - **`src/components/ui/`**: Primitivas de UI muito genéricas (frequentemente de bibliotecas como shadcn/ui).
- **`src/lib/`**: Funções utilitárias, configuração do cliente API.
- **`src/styles/`**: Estilos globais (se houver, além do Tailwind).
- **`src/types/`**: Definições de tipos TypeScript, especialmente para respostas da API.
- **`public/`**: Assets estáticos.
