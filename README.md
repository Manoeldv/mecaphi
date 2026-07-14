# ⚙️ Mecaphi - Sistema de Gestão Automotiva

Olá! Eu sou o Manoel e este é o **Mecaphi**, um ERP completo que construí especialmente para modernizar e resolver as maiores dores do setor de autopeças e desmanches de veículos. 

Minha ideia ao criar o Mecaphi foi sair do básico e trazer tecnologia de ponta para o dia a dia da oficina. O sistema não apenas gerencia vendas, mas tem um foco gigantesco na facilidade de uso, segurança e inteligência.

---

## 🚀 Principais Funcionalidades

- **🧠 Busca Visual com Inteligência Artificial (Google Gemini):** Sabe aquela peça que perdeu a etiqueta ou que é difícil de identificar? Basta abrir a câmera pelo sistema (tanto no celular quanto no PC), apontar para a peça e a nossa IA fará o reconhecimento visual da geometria e cruzará com o nosso banco de dados para encontrá-la instantaneamente!
- **🛒 Frente de Caixa (PDV) Ágil:** Um PDV rápido, focado em atalhos de teclado para o operador, totalmente integrado ao estoque.
- **🚗 Gestão de Desmanche:** Controle completo dos veículos que entram para sucata e rastreabilidade total das peças retiradas.
- **📱 100% Responsivo e PWA:** O Mecaphi foi desenhado para rodar perfeito no PC do balcão e no smartphone do funcionário no pátio. Você pode "instalar" o sistema direto na tela do celular como um App nativo (PWA).
- **💸 Painel Financeiro:** Visão clara de faturamento, ticket médio e relatórios rápidos em PDF.
- **🛡️ Auditoria e Controle de Acessos:** Telas de gerência exclusivas ("Acesso") e logs rigorosos que registram o usuário e o horário de cada venda, edição ou movimentação para evitar sumiços no estoque.

---

## 🛠️ Tecnologias Utilizadas

Para garantir que o sistema não trave e seja rápido, utilizei o que há de mais moderno no mercado:

- **Frontend:** React + Vite (para máxima performance de tela)
- **Estilização:** CSS Vanilla, com suporte nativo a Tema Escuro e layouts flexíveis (Totalmente Mobile-First).
- **Backend:** Node.js com Express 5.
- **Banco de Dados:** MongoDB (Escalável e em Nuvem).
- **Inteligência Artificial:** API `@google/genai` utilizando os modelos ultrarrápidos `gemini-1.5-flash` / `gemini-2.5-flash`.

---

## ⚙️ Como rodar o projeto localmente

Se você for rodar ou testar o código na sua máquina, siga estes passos simples:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Manoeldv/mecaphi.git
   cd mecaphi
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na pasta raiz e adicione suas chaves (Peça a mim as chaves seguras caso não as tenha):
   ```env
   VITE_API_URL=http://localhost:5000
   MONGO_URI=SuaStringConexaoAqui
   GEMINI_API_KEY=SuaChaveDoGoogleAqui
   ```

4. **Inicie o Servidor e o Frontend juntos:**
   ```bash
   npm run dev
   ```
   *O sistema estará rodando simultaneamente na porta 5173 (Interface) e 5000 (Servidor de Banco de Dados).*

---

## ☁️ Hospedagem (Deploy)

Este projeto está configurado para Deploy Contínuo via **Render**. Qualquer alteração empurrada (push) para a branch `main` atualizará automaticamente o sistema em produção, construindo os arquivos estáticos e subindo o Node.js em menos de 2 minutos.

---

> Feito com muita dedicação para transformar a gestão de peças. Qualquer dúvida sobre a arquitetura do sistema, só entrar em contato!
> *- Manoel*
