// Actions de base pour IA Helper
// Actions simples activables individuellement

export const BASE_ACTIONS = {
  // === ACTIONS ESSENTIELLES (actives par defaut) ===
  correct_errors: {
    id: 'correct_errors',
    name: 'Corriger l\'orthographe',
    description: 'Corrige les fautes d\'orthographe et de grammaire',
    prompt: 'Corrige uniquement les fautes d\'orthographe et de grammaire de ce texte. Garde le meme style et le meme sens. Renvoie uniquement le texte corrige.',
    category: 'essential',
    defaultEnabled: true
  },
  summarize: {
    id: 'summarize',
    name: 'Resumer',
    description: 'Resume le texte en quelques phrases',
    prompt: 'Resume ce texte de maniere concise en gardant les informations essentielles.',
    category: 'essential',
    defaultEnabled: true
  },
  explain_simple: {
    id: 'explain_simple',
    name: 'Expliquer simplement',
    description: 'Explique le texte de maniere simple',
    prompt: 'Explique ce texte de maniere simple et accessible, comme si tu l\'expliquais a quelqu\'un qui ne connait pas le sujet.',
    category: 'essential',
    defaultEnabled: true
  },
  improve_style: {
    id: 'improve_style',
    name: 'Ameliorer le style',
    description: 'Ameliore la clarte et le style du texte',
    prompt: 'Ameliore le style de ce texte pour le rendre plus clair, fluide et professionnel. Garde le meme sens.',
    category: 'essential',
    defaultEnabled: true
  },
  expand_content: {
    id: 'expand_content',
    name: 'Developper',
    description: 'Developpe et enrichit le texte',
    prompt: 'Developpe ce texte en ajoutant des details, des exemples et des explications supplementaires.',
    category: 'essential',
    defaultEnabled: true
  },

  // === ACTIONS PRATIQUES ===
  reformat_mail_pro: {
    id: 'reformat_mail_pro',
    name: 'Email professionnel',
    description: 'Transforme en email professionnel',
    prompt: 'Transforme ce texte en email professionnel bien structure avec formules de politesse appropriees.',
    category: 'practical',
    defaultEnabled: true
  },
  bullet_points: {
    id: 'bullet_points',
    name: 'Liste a puces',
    description: 'Convertit en liste a puces',
    prompt: 'Convertis ce texte en une liste a puces claire et organisee.',
    category: 'practical',
    defaultEnabled: false
  },
  extract_key_points: {
    id: 'extract_key_points',
    name: 'Points cles',
    description: 'Extrait les points essentiels',
    prompt: 'Extrait les points cles et informations importantes de ce texte.',
    category: 'practical',
    defaultEnabled: false
  },
  make_shorter: {
    id: 'make_shorter',
    name: 'Raccourcir',
    description: 'Reduit la longueur du texte',
    prompt: 'Raccourcis ce texte en gardant uniquement l\'essentiel. Reduis la longueur de moitie environ.',
    category: 'practical',
    defaultEnabled: false
  },
  make_formal: {
    id: 'make_formal',
    name: 'Ton formel',
    description: 'Rend le texte plus formel',
    prompt: 'Reecris ce texte avec un ton plus formel et professionnel.',
    category: 'practical',
    defaultEnabled: false
  },
  make_casual: {
    id: 'make_casual',
    name: 'Ton decontracte',
    description: 'Rend le texte plus decontracte',
    prompt: 'Reecris ce texte avec un ton plus decontracte et amical.',
    category: 'practical',
    defaultEnabled: false
  },

  // === ACTIONS TECHNIQUES ===
  explain_code: {
    id: 'explain_code',
    name: 'Expliquer le code',
    description: 'Explique ce que fait le code',
    prompt: 'Explique ce code de maniere claire. Decris ce qu\'il fait, sa logique et comment il fonctionne.',
    category: 'technical',
    defaultEnabled: false
  },
  review_code: {
    id: 'review_code',
    name: 'Revue de code',
    description: 'Analyse et suggere des ameliorations',
    prompt: 'Fais une revue de ce code. Identifie les problemes potentiels et suggere des ameliorations.',
    category: 'technical',
    defaultEnabled: false
  },
  debug_help: {
    id: 'debug_help',
    name: 'Aide debug',
    description: 'Analyse une erreur et propose des solutions',
    prompt: 'Analyse cette erreur ou ce probleme et suggere des solutions pour le resoudre.',
    category: 'technical',
    defaultEnabled: false
  },

  // === ACTIONS ANALYSE ===
  sentiment_analysis: {
    id: 'sentiment_analysis',
    name: 'Analyser le sentiment',
    description: 'Determine le ton du texte',
    prompt: 'Analyse le sentiment de ce texte. Est-il positif, negatif ou neutre? Explique brievement.',
    category: 'analysis',
    defaultEnabled: false
  },
  identify_language: {
    id: 'identify_language',
    name: 'Identifier la langue',
    description: 'Detecte la langue du texte',
    prompt: 'Identifie la langue de ce texte et confirme ta detection.',
    category: 'analysis',
    defaultEnabled: false
  }
};

// Categories pour l'interface
export const ACTION_CATEGORIES = {
  essential: { name: 'Essentiels', description: 'Actions de base recommandees' },
  practical: { name: 'Pratiques', description: 'Actions utiles au quotidien' },
  technical: { name: 'Techniques', description: 'Pour developpeurs et techniques' },
  analysis: { name: 'Analyse', description: 'Analyse et comprehension de texte' }
};

// Actions actives par defaut
export const DEFAULT_ENABLED_ACTIONS = Object.keys(BASE_ACTIONS)
  .filter(key => BASE_ACTIONS[key].defaultEnabled);

