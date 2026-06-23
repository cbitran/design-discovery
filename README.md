# Descoberta de Necessidades — Design

Formulário inteligente para mapear necessidades de handoff, construído com Next.js + Airtable + Claude.

## Stack

- **Next.js 15** (App Router)
- **Airtable** — banco de dados das respostas
- **Anthropic Claude** — relatório consolidado por IA
- **Vercel** — hospedagem recomendada

---

## Setup em 5 passos

### 1. Clonar e instalar

```bash
git clone https://github.com/SEU_USER/design-discovery.git
cd design-discovery
npm install
```

### 2. Criar base no Airtable

1. Acesse [airtable.com](https://airtable.com) e crie uma nova base
2. Renomeie a tabela padrão para **`Respostas`**
3. Não precisa criar colunas — a API cria automaticamente no primeiro envio
4. Vá em **airtable.com/create/apikey** e crie um Personal Access Token com permissão `data.records:write` e `data.records:read` na sua base
5. Copie o **Base ID** da URL: `https://airtable.com/appXXXXXXXX/...`

### 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

```env
AIRTABLE_TOKEN=pat_xxxxxxxxxxxxxxxxxxxx
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME=Respostas
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
```

### 4. Rodar localmente

```bash
npm run dev
```

- Formulário: `http://localhost:3000`
- Relatório IA: `http://localhost:3000/relatorio`

### 5. Deploy no Vercel

```bash
npm install -g vercel
vercel --prod
```

No painel do Vercel, adicione as 4 variáveis de ambiente em **Settings → Environment Variables**.

---

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Formulário público (para os colaboradores) |
| `/relatorio` | Painel de relatório consolidado (para o time de Design) |
| `/api/submit` | POST — salva resposta no Airtable |
| `/api/report` | GET — busca respostas + gera relatório com IA |

---

## Estrutura

```
app/
  page.tsx          # Formulário principal
  relatorio/
    page.tsx        # Painel de relatório
  api/
    submit/route.ts # Salvar no Airtable
    report/route.ts # Gerar relatório com Claude
components/
  FormStep.tsx      # Componente de perguntas
lib/
  questions.ts      # Todas as perguntas e seções
```

---

## Customização

Para editar perguntas, edite `lib/questions.ts`. Cada questão tem tipos:
- `text` — campo curto
- `textarea` — texto longo
- `chips-single` — seleção única estilo pill
- `chips-multi` — seleção múltipla
- `scale` — escala de 1 a 5

