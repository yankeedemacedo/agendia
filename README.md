# 📅 Agendia

O **Agendia** é uma plataforma completa e responsiva para publicação, administração e inscrição em eventos. Desenvolvido para facilitar o gerenciamento de vagas e o controle de participantes, o sistema centraliza as operações acadêmicas e corporativas em uma interface unificada.

Este projeto foi construído para lidar com cenários reais de gerenciamento de dados e autenticação, representando a arquitetura de uma aplicação *fullstack* renderizada no servidor (SSR).

## ✨ Funcionalidades

A aplicação possui diferentes escopos de acesso baseados no perfil do usuário:

### Para Usuários (Participantes)
- 🎟️ Exploração do catálogo de eventos disponíveis.
- 📝 Inscrição com um clique em eventos com vagas abertas.
- 📋 Acompanhamento das inscrições realizadas.

### Para Administradores
- ➕ Criação e publicação de novos eventos.
- ⚙️ Gerenciamento de capacidade (vagas totais e preenchidas).
- 👥 Visualização e controle da lista completa de participantes inscritos em cada evento.

## 🚀 Tecnologias Utilizadas

A base tecnológica do Agendia é focada em velocidade de entrega e padronização utilizando o ecossistema JavaScript:

- **Backend:** Node.js com o framework **Express.js**.
- **Frontend / Engine de Visualização:** **Pug** (Server-Side Rendering).
- **Banco de Dados:** **MongoDB** (hospedado no MongoDB Atlas).
- **ODM (Object Data Modeling):** **Mongoose**, para esquematização e validação de dados.

## 🏗️ Arquitetura Detalhada do Sistema

O diagrama abaixo ilustra o fluxo de dados e a arquitetura interna do servidor Node.js. Ele demonstra como uma requisição HTTP do cliente passa pelos *Middlewares* de autenticação, é processada pelos *Controllers*, interage com o MongoDB através do *Mongoose* e retorna uma página HTML totalmente montada pela engine do Pug.

```mermaid
flowchart TD
    %% Ator
    Client(["Navegador do Cliente"])

    %% Servidor Node.js
    subgraph NodeServer ["Servidor Backend - Node.js & Express"]
        direction TB
        Router["Express.js Router"]
        
        %% Middlewares
        subgraph Middlewares ["Camada de Interceptação"]
            Auth["Autenticação & Sessão"]
            Validation["Validação de Dados"]
        end
        
        %% Regras de Negócio
        Controllers["Controllers (Lógica de Negócio)"]
        
        %% Modelagem e Renderização
        subgraph DataView ["Dados e Visualização"]
            Pug["Pug View Engine"]
            Mongoose["Mongoose ODM"]
        end

        %% Fluxo Interno
        Router --> Auth
        Router --> Validation
        Auth & Validation --> Controllers
        Controllers <--> Mongoose
        Controllers --> Pug
    end

    %% Banco de Dados Externo
    subgraph Database ["MongoDB Atlas"]
        Cluster[("Cluster NoSQL")]
    end

    %% Conexões Externas
    Client -->|"Requisição HTTP (GET, POST)"| Router
    Pug -->|"Retorna página HTML renderizada"| Client
    Mongoose <-->|"Queries (BSON)"| Cluster
