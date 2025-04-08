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

## Internacionalização (i18n)

A interface da aplicação está traduzida para português brasileiro, incluindo:

- Textos dos botões e campos
- Mensagens de erro e sucesso
- Componentes de navegação e paginação
- Confirmações e avisos

Não foi necessário usar bibliotecas de i18n, pois a aplicação foi desenvolvida com foco exclusivo no português.

## Estrutura do Projeto (Visão Geral)

- **`src/app/`**: Contém as rotas principais e layout (App Router).
- **`src/components/`**: Componentes de UI reutilizáveis.
  - **`src/components/ui/`**: Primitivas de UI muito genéricas (frequentemente de bibliotecas como shadcn/ui).
- **`src/lib/`**: Funções utilitárias, configuração do cliente API.
- **`src/styles/`**: Estilos globais (se houver, além do Tailwind).
- **`src/types/`**: Definições de tipos TypeScript, especialmente para respostas da API.
- **`public/`**: Assets estáticos.

## Otimizações de Performance

- **Debouncing:** Implementado na busca de heróis para reduzir chamadas à API durante a digitação do usuário
- **Lazy Loading:** Componentes pesados são carregados dinamicamente através de lazy loading do Next.js
- **Componentes Memorizados:** Uso de callbacks e gerenciamento de estado otimizado para evitar re-renderizações desnecessárias
- **Skeleton Loading:** Implementado em componentes como `hero-card-skeleton` para melhorar a percepção de velocidade enquanto os dados são carregados
- **Paginação:** Implementação de paginação no lado do cliente para lidar eficientemente com grandes conjuntos de dados

## Princípios de Design UI/UX

A aplicação segue princípios de design minimalista para fornecer uma experiência de usuário limpa e intuitiva:

- **Espaçamento consistente:** Espaço em branco balanceado em todos os componentes
- **Hierarquia visual:** Ênfase clara em informações importantes através de tipografia e dimensionamento
- **Componentes responsivos:** Adapta-se elegantemente a diferentes tamanhos de dispositivos
- **Mecanismos de feedback:** Estados de carregamento, transições e indicadores de resposta
- **Acessibilidade:** HTML semântico e atributos ARIA apropriados
- **Suporte ao modo escuro:** Temas consistentes com esquemas de cores para preferências claras e escuras
