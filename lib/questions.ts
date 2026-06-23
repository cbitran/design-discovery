export type QuestionType = 'text' | 'textarea' | 'chips-single' | 'chips-multi' | 'scale'

export interface Question {
  id: string
  label: string
  type: QuestionType
  placeholder?: string
  options?: string[]
  scaleMin?: string
  scaleMax?: string
  required?: boolean
}

export interface Section {
  id: string
  title: string
  description?: string
  questions: Question[]
}

export const SECTIONS: Section[] = [
  {
    id: 'identificacao',
    title: 'Quem é você?',
    description: 'Algumas informações rápidas para contextualizar suas respostas.',
    questions: [
      {
        id: 'nome',
        label: 'Seu nome',
        type: 'text',
        placeholder: 'Como você se chama?',
        required: true,
      },
      {
        id: 'funcao',
        label: 'Qual é a sua função na equipe?',
        type: 'chips-single',
        options: ['Dev front-end', 'Dev back-end', 'Full stack', 'QA / Testes', 'Product Manager', 'Scrum Master', 'Outra'],
        required: true,
      },
      {
        id: 'interacao_design',
        label: 'Quais atividades do seu dia a dia têm interação direta com Design?',
        type: 'textarea',
        placeholder: 'Ex: revisão de PRs, refinamento, implementação de interfaces...',
      },
    ],
  },
  {
    id: 'papel_do_design',
    title: 'O papel do Design',
    description: 'Entenda como o time de Design pode contribuir melhor com você.',
    questions: [
      {
        id: 'expectativa_design',
        label: 'O que você espera do Design durante o desenvolvimento de um produto ou funcionalidade?',
        type: 'textarea',
        placeholder: 'Seja direto — o que faria sua vida mais fácil?',
      },
      {
        id: 'participacao_design',
        label: 'Em quais momentos o Design deveria participar mais do processo?',
        type: 'chips-multi',
        options: ['Refinamento', 'Planning', 'Daily', 'Review', 'Retrospectiva', 'Grooming técnico', 'Kick-off de features'],
      },
      {
        id: 'responsabilidade_faltante',
        label: 'Existe alguma responsabilidade que o Design deveria assumir e que hoje ainda não acontece?',
        type: 'textarea',
        placeholder: 'Se houver, descreva brevemente.',
      },
      {
        id: 'design_ideal',
        label: 'O que um time de Design ideal forneceria para facilitar seu trabalho?',
        type: 'textarea',
        placeholder: 'Pense no dia a dia — o que mudaria tudo?',
      },
    ],
  },
  {
    id: 'processo_atual',
    title: 'Processo atual',
    description: 'O que funciona e o que trava o fluxo hoje.',
    questions: [
      {
        id: 'processo_bom',
        label: 'Quais partes do fluxo de trabalho com Design funcionam bem hoje?',
        type: 'textarea',
        placeholder: 'O que você já considera positivo.',
      },
      {
        id: 'processo_ruim',
        label: 'O que gera mais dúvidas, retrabalho ou atrasos?',
        type: 'textarea',
        placeholder: 'Seja específico — qualquer detalhe ajuda.',
      },
      {
        id: 'alinhamento',
        label: 'Em quais momentos você sente mais falta de alinhamento ou validação?',
        type: 'textarea',
        placeholder: 'Ex: antes de iniciar implementação, durante, ao revisar...',
      },
    ],
  },
  {
    id: 'layouts_handoff',
    title: 'Layouts e handoff',
    description: 'A qualidade das entregas impacta diretamente na implementação.',
    questions: [
      {
        id: 'layout_clareza',
        label: 'Ao receber um layout, o que te ajuda a compreender rapidamente a solução?',
        type: 'chips-multi',
        options: ['Fluxo de navegação', 'Estados do componente', 'Anotações no Figma', 'Prototipo clicável', 'Critérios de aceite', 'Vídeo explicativo', 'Reunião de passagem'],
      },
      {
        id: 'infos_arquivo',
        label: 'Quais informações você gostaria que estivessem sempre presentes nos arquivos de Design?',
        type: 'chips-multi',
        options: ['Tokens e variáveis', 'Responsividade', 'Casos de erro', 'Acessibilidade', 'Animações', 'Breakpoints', 'Comportamento de scroll'],
      },
      {
        id: 'handoff_indispensavel',
        label: 'No handoff, o que é absolutamente indispensável para você?',
        type: 'textarea',
        placeholder: 'O que não pode faltar nunca.',
      },
      {
        id: 'handoff_ideal',
        label: 'Como seria um processo de handoff ideal para você?',
        type: 'textarea',
        placeholder: 'Descreva o fluxo perfeito.',
      },
      {
        id: 'duvidas_frequentes',
        label: 'Quais dúvidas surgem com mais frequência durante a implementação?',
        type: 'textarea',
        placeholder: 'O que você mais precisa perguntar para o Design.',
      },
    ],
  },
  {
    id: 'design_system',
    title: 'Design System e componentes',
    description: 'A base que sustenta a consistência visual do produto.',
    questions: [
      {
        id: 'componente_expectativa',
        label: 'O que você espera encontrar em um componente antes de utilizá-lo?',
        type: 'chips-multi',
        options: ['Variações', 'Estados', 'Regras de uso', 'Comportamentos', 'Responsividade', 'Tokens', 'Acessibilidade', 'Exemplos de código'],
      },
      {
        id: 'ds_falta',
        label: 'Existe alguma documentação ou padrão que você sente falta hoje?',
        type: 'textarea',
        placeholder: 'Seja específico — componente, padrão, regra...',
      },
      {
        id: 'ds_prioridade',
        label: 'Quais componentes deveriam ser priorizados em uma evolução do Design System?',
        type: 'textarea',
        placeholder: 'Liste por ordem de impacto no seu trabalho.',
      },
    ],
  },
  {
    id: 'assets',
    title: 'Assets e recursos visuais',
    description: 'Como os recursos saem do Design e chegam até você.',
    questions: [
      {
        id: 'assets_tipos',
        label: 'Quais tipos de recursos visuais você usa com mais frequência?',
        type: 'chips-multi',
        options: ['Ícones SVG', 'Imagens PNG/JPG', 'Ilustrações', 'Animações Lottie', 'Vídeos', 'Fontes', 'Tokens CSS'],
      },
      {
        id: 'assets_dificuldade',
        label: 'Existe alguma dificuldade recorrente com exportação ou uso desses materiais?',
        type: 'textarea',
        placeholder: 'Formatos errados, nomes confusos, tamanhos inadequados...',
      },
    ],
  },
  {
    id: 'qualidade_comunicacao',
    title: 'Qualidade e comunicação',
    description: 'O gap entre o design e o produto final.',
    questions: [
      {
        id: 'inconsistencia',
        label: 'O que mais gera inconsistência entre o que foi desenhado e o produto final?',
        type: 'textarea',
        placeholder: 'O que mais foge do esperado na implementação.',
      },
      {
        id: 'comunicacao_preferencia',
        label: 'Como você prefere esclarecer dúvidas sobre Design?',
        type: 'chips-single',
        options: ['Slack / mensagem', 'Reunião rápida', 'Comentário no Figma', 'Issue no board', 'E-mail', 'Sem preferência'],
      },
      {
        id: 'cerimonias',
        label: 'Quais rituais ainda não temos que ajudariam a melhorar o alinhamento entre as áreas?',
        type: 'textarea',
        placeholder: 'Ex: design review semanal, sync de handoff, office hours...',
      },
      {
        id: 'impacto_atraso',
        label: 'O quanto problemas de handoff impactam o prazo das suas entregas?',
        type: 'scale',
        scaleMin: 'Nenhum impacto',
        scaleMax: 'Impacto alto',
      },
    ],
  },
  {
    id: 'futuro',
    title: 'O futuro que queremos',
    description: 'Suas prioridades para a evolução do processo.',
    questions: [
      {
        id: 'prioridades',
        label: 'Se você pudesse definir três prioridades para a evolução do Design nos próximos meses, quais seriam?',
        type: 'textarea',
        placeholder: '1.\n2.\n3.',
      },
      {
        id: 'melhoria_significativa',
        label: 'O que faria você sentir que a colaboração com Design melhorou significativamente?',
        type: 'textarea',
        placeholder: 'O sinal mais claro de que as coisas mudaram.',
      },
      {
        id: 'extra',
        label: 'Tem algo importante que não perguntamos?',
        type: 'textarea',
        placeholder: 'Espaço livre — qualquer coisa que queira compartilhar.',
      },
    ],
  },
]
