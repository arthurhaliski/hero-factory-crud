# Hero Factory - Aplicação CRUD Full Stack

Este repositório contém uma aplicação CRUD full-stack para gerenciar heróis, demonstrando várias tecnologias e boas práticas modernas de desenvolvimento web.

## Estrutura do Projeto

- **`backend/`**: Contém o backend da API em Node.js/Express/TypeScript com Prisma e MySQL.
  - Veja [backend/README.md](./backend/README.md) para detalhes.
- **`frontend/`**: Contém a aplicação frontend em Next.js/React/TypeScript.
  - Veja [frontend/README.md](./frontend/README.md) para detalhes.
- **`scripts/`**: Contém scripts auxiliares para gerenciar o projeto completo.
- **`docker-compose.yml`**: Define o serviço de banco de dados MySQL usando Docker.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou posterior recomendado)
- [pnpm](https://pnpm.io/) (Gerenciador de pacotes)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

## Início Rápido (Quick Start)

1.  **Clone o repositório.**

2.  **Configure as variáveis de ambiente:**
    - Para o **backend**: Vá para o diretório `backend/` e copie `.env.example` para `.env`
    - Para o **frontend**: Vá para o diretório `frontend/` e copie `.env.example` para `.env.local` (se necessário)
    
    Os valores padrão nos arquivos de exemplo devem funcionar com a configuração Docker fornecida.

3.  **Execute o script de setup completo do projeto:**
    Isso iniciará o container do banco de dados, instalará as dependências para backend e frontend, gerará o Prisma client, aplicará as migrações do banco de dados e populará o banco com dados iniciais de exemplo.
    ```bash
    chmod +x scripts/setup.sh # Torna o script executável (apenas na primeira vez)
    ./scripts/setup.sh
    ```

4.  **Execute os servidores de desenvolvimento:**
    Isso iniciará os servidores de desenvolvimento do backend e do frontend simultaneamente.
    ```bash
    chmod +x scripts/dev.sh # Torna o script executável (apenas na primeira vez)
    ./scripts/dev.sh
    ```

    - A API Backend estará disponível em `http://localhost:3001`
    - A aplicação Frontend estará disponível em `http://localhost:3000`
    - A Documentação da API Backend (Swagger) estará disponível em `http://localhost:3001/docs`

## Outros Comandos

- **Para rodar os testes do backend:**
  ```bash
  (cd backend && pnpm test)
  ```
- **Para parar o container do banco de dados:**
  ```bash
  docker-compose down
  ```
- **Para parar o container do banco de dados e remover os dados:**
  ```bash
  docker-compose down -v
  ```

Consulte os arquivos `README.md` individuais nos diretórios `backend` e `frontend` para detalhes e comandos mais específicos. 