# Aplicativo de Gestão de Estoque para FF Mercadinho

Este projeto faz parte de um trabalho de extensão desenvolvido para o FF Mercadinho, um estabelecimento comercial localizado em Mesquita, RJ.
O aplicativo mobile desenvolvido tem como objetivo facilitar o controle de estoque, reduzir perdas por vencimento de produtos e melhorar a tomada de decisões relacionadas a compras e reposições.

## Objetivos

- Desenvolver um aplicativo móvel intuitivo para controle de estoque.
- Implementar funcionalidades para registro de entradas e saídas de produtos.
- Criar sistema de alertas para produtos com estoque baixo ou próximos ao vencimento.
- Capacitar a equipe do mercadinho para utilizar o aplicativo em suas rotinas diárias.
- Reduzir perdas por vencimento e faltas de estoque.

## Estrutura do Projeto

O projeto está estruturado seguindo a arquitetura do Expo Router:

1. **app/**: Contém as telas e rotas do aplicativo
   - **produtos/**: Páginas relacionadas ao gerenciamento de produtos
   - **alertas/**: Sistema de alertas para produtos com estoque baixo ou próximos ao vencimento
2. **components/**: Componentes reutilizáveis como itens de lista
3. **hooks/**: Hooks customizados para gerenciamento de dados
   - **useStorage.ts**: Gerenciamento do armazenamento local (AsyncStorage)

## Requisitos

- Node.js 14+
- React Native / Expo
- TypeScript

## Instalação das Dependências

Para instalar as dependências, execute:

```bash
npm install
```

## Funcionalidades

### 1. Gerenciamento de Produtos:

- Cadastro de novos produtos com informações detalhadas
- Visualização de lista de produtos com indicadores de estoque
- Detalhes do produto com histórico de movimentações

### 2. Controle de Estoque:

- Registro de entradas (compras, devoluções, etc.)
- Registro de saídas (vendas, perdas, etc.)
- Acompanhamento do histórico de movimentações por produto

### 3. Sistema de Alertas:

- Produtos com estoque abaixo do mínimo
- Produtos próximos à data de vencimento
- Interface visual destacando produtos críticos

## Uso

1. **Iniciar o aplicativo:**

   ```bash
   npx expo start
   ```

2. **Cadastro de Produtos:**
   Na tela de produtos, toque no botão "+" para adicionar um novo produto com informações como nome, categoria, preço, estoque atual e mínimo.

3. **Registrar Movimentações:**
   Na tela de detalhes do produto, utilize os botões "Entrada" ou "Saída" para registrar movimentações de estoque.

4. **Consultar Alertas:**
   Acesse a tela de alertas para visualizar produtos que precisam de atenção, como itens com estoque baixo ou próximos ao vencimento.

## Resultados Esperados

- Redução de pelo menos 20% nas perdas por vencimento de produtos.
- Diminuição da ocorrência de rupturas de estoque em itens essenciais.
- Otimização do tempo gasto com inventário e controle manual.
- Melhoria na capacidade de planejamento de compras da empresa.
- Feedback positivo dos colaboradores quanto à facilidade de uso e utilidade do aplicativo.

## Contribuição

Este projeto foi desenvolvido por Anderson Luiz Diniz de Oliveira como parte de um projeto de extensão para a disciplina de Programação Para Dispositivos Móveis em Android. Feedback e sugestões são bem-vindos.

## Licença

Este projeto está sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.
