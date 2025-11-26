// Configuration par defaut de IA Helper
export const DEFAULT_CONFIG = {
  // Serveur Ollama
  ollamaUrl: 'http://localhost:11434',
  selectedModel: '',
  
  // Options generales
  streamingEnabled: true,
  autoDetectContext: true,
  
  // Theme
  theme: 'auto', // 'light', 'dark', 'auto'
  
  // Langues disponibles pour la traduction
  languages: [
    { code: 'fr', name: 'Francais', flag: 'FR' },
    { code: 'en', name: 'English', flag: 'GB' },
    { code: 'it', name: 'Italiano', flag: 'IT' },
    { code: 'es', name: 'Espanol', flag: 'ES' }
  ]
};

// Actions disponibles pour les champs de saisie
export const INPUT_ACTIONS = [
  {
    id: 'correct_errors',
    name: 'Corriger les erreurs',
    icon: 'spell-check',
    enabled: true,
    category: 'editing'
  },
  {
    id: 'translate',
    name: 'Traduire',
    icon: 'translate',
    enabled: true,
    category: 'translation',
    hasSubmenu: true
  },
  {
    id: 'reformat_mail_pro',
    name: 'Reformuler en Mail Pro',
    icon: 'mail',
    enabled: true,
    category: 'professional'
  },
  {
    id: 'expand_content',
    name: 'Developper le contenu',
    icon: 'expand',
    enabled: true,
    category: 'creative'
  },
  {
    id: 'summarize_input',
    name: 'Resumer',
    icon: 'compress',
    enabled: true,
    category: 'editing'
  },
  {
    id: 'improve_style',
    name: 'Ameliorer le style',
    icon: 'brush',
    enabled: true,
    category: 'editing'
  }
];

// Actions disponibles pour la selection de texte
export const SELECTION_ACTIONS = [
  {
    id: 'summarize',
    name: 'Resumer le texte',
    icon: 'compress',
    enabled: true,
    category: 'analysis'
  },
  {
    id: 'translate_selection',
    name: 'Traduire',
    icon: 'translate',
    enabled: true,
    category: 'translation',
    hasSubmenu: true
  },
  {
    id: 'explain_chronology',
    name: 'Expliquer la chronologie',
    icon: 'timeline',
    enabled: true,
    category: 'analysis'
  },
  {
    id: 'explain_simple',
    name: 'Expliquer simplement',
    icon: 'lightbulb',
    enabled: true,
    category: 'analysis'
  },
  {
    id: 'extract_key_points',
    name: 'Extraire les points cles',
    icon: 'list',
    enabled: true,
    category: 'analysis'
  },
  {
    id: 'analyze_sentiment',
    name: 'Analyser le sentiment',
    icon: 'emotion',
    enabled: true,
    category: 'analysis'
  }
];

// Actions IA Helper Pro (page complete)
export const PRO_ACTIONS = [
  {
    id: 'summarize_ticket',
    name: 'Resumer ce ticket',
    icon: 'ticket',
    enabled: true,
    category: 'pro'
  },
  {
    id: 'last_client_message',
    name: 'Resume du dernier message client',
    icon: 'user-message',
    enabled: true,
    category: 'pro'
  },
  {
    id: 'current_situation',
    name: 'Expliquer la situation actuelle',
    icon: 'info',
    enabled: true,
    category: 'pro'
  },
  {
    id: 'ticket_chronology',
    name: 'Chronologie du ticket',
    icon: 'timeline',
    enabled: true,
    category: 'pro'
  },
  {
    id: 'suggest_response',
    name: 'Suggerer une reponse',
    icon: 'reply',
    enabled: true,
    category: 'pro'
  },
  {
    id: 'extract_action_items',
    name: 'Extraire les actions a faire',
    icon: 'checklist',
    enabled: true,
    category: 'pro'
  }
];

