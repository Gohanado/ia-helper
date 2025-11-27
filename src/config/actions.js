// Actions de base pour IA Helper
// Actions simples activables individuellement

export const BASE_ACTIONS = {
  // === ACTIONS ESSENTIELLES (actives par defaut) ===
  correct_errors: {
    id: 'correct_errors',
    name: 'Corriger l\'orthographe',
    description: 'Corrige les fautes d\'orthographe et de grammaire',
    prompt: 'Corrige les fautes d\'orthographe et de grammaire. Retourne uniquement le texte corrige, rien d\'autre.',
    category: 'essential',
    defaultEnabled: true
  },
  summarize: {
    id: 'summarize',
    name: 'Resumer',
    description: 'Resume le texte en quelques phrases',
    prompt: 'Resume ce texte en un paragraphe fluide. Pas de listes, pas de tableaux. Juste un resume clair.',
    category: 'essential',
    defaultEnabled: true
  },
  explain_simple: {
    id: 'explain_simple',
    name: 'Expliquer simplement',
    description: 'Explique le texte de maniere simple',
    prompt: 'Explique ce texte simplement, comme si tu parlais a quelqu\'un. Texte fluide, pas de listes ni tableaux.',
    category: 'essential',
    defaultEnabled: true
  },
  improve_style: {
    id: 'improve_style',
    name: 'Ameliorer le style',
    description: 'Ameliore la clarte et le style du texte',
    prompt: 'Ameliore le style pour le rendre plus fluide et agreable. Garde le sens. Pas de formatage special.',
    category: 'essential',
    defaultEnabled: true
  },
  expand_content: {
    id: 'expand_content',
    name: 'Developper',
    description: 'Developpe et enrichit le texte',
    prompt: 'Developpe ce texte avec plus de details. Garde un style fluide et naturel. Pas de tableaux.',
    category: 'essential',
    defaultEnabled: true
  },

  // === ACTIONS PRATIQUES ===
  reformat_mail_pro: {
    id: 'reformat_mail_pro',
    name: 'Email professionnel',
    description: 'Transforme en email professionnel',
    prompt: 'Transforme en email professionnel avec formules de politesse. Texte fluide, pas de tableaux.',
    category: 'practical',
    defaultEnabled: true
  },
  bullet_points: {
    id: 'bullet_points',
    name: 'Liste a puces',
    description: 'Convertit en liste a puces',
    prompt: 'Convertis en liste a puces simple avec des tirets. Pas de tableaux.',
    category: 'practical',
    defaultEnabled: false
  },
  extract_key_points: {
    id: 'extract_key_points',
    name: 'Points cles',
    description: 'Extrait les points essentiels',
    prompt: 'Donne les 3-5 points essentiels avec des tirets simples. Pas de tableaux.',
    category: 'practical',
    defaultEnabled: false
  },
  make_shorter: {
    id: 'make_shorter',
    name: 'Raccourcir',
    description: 'Reduit la longueur du texte',
    prompt: 'Raccourcis ce texte de moitie en gardant l\'essentiel. Texte fluide.',
    category: 'practical',
    defaultEnabled: false
  },
  make_formal: {
    id: 'make_formal',
    name: 'Ton formel',
    description: 'Rend le texte plus formel',
    prompt: 'Reecris avec un ton formel et professionnel. Pas de formatage special.',
    category: 'practical',
    defaultEnabled: false
  },
  make_casual: {
    id: 'make_casual',
    name: 'Ton decontracte',
    description: 'Rend le texte plus decontracte',
    prompt: 'Reecris avec un ton decontracte et amical. Pas de formatage special.',
    category: 'practical',
    defaultEnabled: false
  },

  // === ACTIONS TECHNIQUES ===
  explain_code: {
    id: 'explain_code',
    name: 'Expliquer le code',
    description: 'Explique ce que fait le code',
    prompt: 'Explique ce code clairement. Decris ce qu\'il fait et comment. Pas de tableaux.',
    category: 'technical',
    defaultEnabled: false
  },
  review_code: {
    id: 'review_code',
    name: 'Revue de code',
    description: 'Analyse et suggere des ameliorations',
    prompt: 'Fais une revue de ce code. Liste les problemes et ameliorations avec des tirets.',
    category: 'technical',
    defaultEnabled: false
  },
  debug_help: {
    id: 'debug_help',
    name: 'Aide debug',
    description: 'Analyse une erreur et propose des solutions',
    prompt: 'Analyse cette erreur et propose des solutions. Explications claires, pas de tableaux.',
    category: 'technical',
    defaultEnabled: false
  },

  // === ACTIONS ANALYSE ===
  sentiment_analysis: {
    id: 'sentiment_analysis',
    name: 'Analyser le sentiment',
    description: 'Determine le ton du texte',
    prompt: 'Analyse le sentiment en 2-3 phrases. Positif, negatif ou neutre? Pas de tableaux.',
    category: 'analysis',
    defaultEnabled: false
  },
  identify_language: {
    id: 'identify_language',
    name: 'Identifier la langue',
    description: 'Detecte la langue du texte',
    prompt: 'Identifie la langue de ce texte en une phrase.',
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

