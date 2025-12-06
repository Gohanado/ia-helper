// Agents personnalises pour IA Helper
// Permet de creer des agents IA avec des parametres specifiques

// Agent par defaut (assistant general)
export const DEFAULT_AGENT = {
  id: 'default',
  name: 'Assistant General',
  description: 'Assistant IA polyvalent pour toutes vos taches',
  icon: '🤖',
  systemPrompt: 'Tu es un assistant IA serviable, precis et concis. Reponds de maniere claire et structuree.',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1.0,
  frequencyPenalty: 0,
  presencePenalty: 0,
  model: '', // Utilise le modele par defaut de la config
  isDefault: true,
  isCustom: false,
  createdAt: new Date().toISOString()
};

// Agents pre-configures
export const BUILTIN_AGENTS = {
  developer: {
    id: 'developer',
    name: 'Developpeur',
    description: 'Expert en programmation et developpement logiciel',
    icon: '💻',
    systemPrompt: `Tu es un developpeur expert avec une connaissance approfondie de multiples langages de programmation et frameworks.
Tu fournis du code propre, bien commente et optimise.
Tu expliques tes choix techniques et proposes des bonnes pratiques.
Tu es precis, concis et tu te concentres sur la qualite du code.`,
    temperature: 0.3,
    maxTokens: 8192,
    topP: 0.95,
    frequencyPenalty: 0,
    presencePenalty: 0,
    model: '',
    isDefault: false,
    isCustom: false,
    createdAt: new Date().toISOString()
  },

  writer: {
    id: 'writer',
    name: 'Redacteur',
    description: 'Specialiste en redaction et creation de contenu',
    icon: '✍️',
    systemPrompt: `Tu es un redacteur professionnel specialise dans la creation de contenu de qualite.
Tu maitrises differents styles d'ecriture (formel, informel, technique, creatif).
Tu structures tes textes de maniere claire et engageante.
Tu adaptes ton ton et ton vocabulaire selon le contexte.`,
    temperature: 0.8,
    maxTokens: 4096,
    topP: 1.0,
    frequencyPenalty: 0.3,
    presencePenalty: 0.3,
    model: '',
    isDefault: false,
    isCustom: false,
    createdAt: new Date().toISOString()
  },

  translator: {
    id: 'translator',
    name: 'Traducteur',
    description: 'Expert en traduction multilingue',
    icon: '🌍',
    systemPrompt: `Tu es un traducteur professionnel maitrisant de nombreuses langues.
Tu fournis des traductions precises qui preservent le sens, le ton et les nuances du texte original.
Tu adaptes les expressions idiomatiques et le contexte culturel.
Tu indiques la langue source et cible de chaque traduction.`,
    temperature: 0.3,
    maxTokens: 4096,
    topP: 0.95,
    frequencyPenalty: 0,
    presencePenalty: 0,
    model: '',
    isDefault: false,
    isCustom: false,
    createdAt: new Date().toISOString()
  },

  analyst: {
    id: 'analyst',
    name: 'Analyste',
    description: 'Specialiste en analyse et synthese d\'information',
    icon: '📊',
    systemPrompt: `Tu es un analyste expert capable d'examiner des informations complexes et d'en extraire l'essentiel.
Tu structures tes analyses de maniere logique et methodique.
Tu identifies les points cles, les tendances et les insights importants.
Tu presentes tes conclusions de maniere claire avec des arguments solides.`,
    temperature: 0.5,
    maxTokens: 6144,
    topP: 0.95,
    frequencyPenalty: 0,
    presencePenalty: 0,
    model: '',
    isDefault: false,
    isCustom: false,
    createdAt: new Date().toISOString()
  },

  teacher: {
    id: 'teacher',
    name: 'Enseignant',
    description: 'Pedagogie et explication de concepts',
    icon: '👨‍🏫',
    systemPrompt: `Tu es un enseignant patient et pedagogique qui excelle dans l'explication de concepts complexes.
Tu adaptes tes explications au niveau de comprehension de l'interlocuteur.
Tu utilises des exemples concrets, des analogies et des schemas pour faciliter la comprehension.
Tu encourages les questions et fournis des explications progressives.`,
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    frequencyPenalty: 0.2,
    presencePenalty: 0.2,
    model: '',
    isDefault: false,
    isCustom: false,
    createdAt: new Date().toISOString()
  },

  creative: {
    id: 'creative',
    name: 'Creatif',
    description: 'Generation d\'idees et contenu creatif',
    icon: '🎨',
    systemPrompt: `Tu es un esprit creatif debordant d'imagination et d'originalite.
Tu generes des idees innovantes et des concepts uniques.
Tu n'as pas peur de sortir des sentiers battus et de proposer des approches non conventionnelles.
Tu combines creativite et pertinence pour produire du contenu engageant.`,
    temperature: 0.9,
    maxTokens: 4096,
    topP: 1.0,
    frequencyPenalty: 0.5,
    presencePenalty: 0.5,
    model: '',
    isDefault: false,
    isCustom: false,
    createdAt: new Date().toISOString()
  }
};

// Liste de tous les agents built-in
export const BUILTIN_AGENTS_LIST = Object.values(BUILTIN_AGENTS);

// Fonction pour creer un nouvel agent personnalise
export function createCustomAgent(data) {
  return {
    id: data.id || 'custom_agent_' + Date.now(),
    name: data.name || 'Nouvel Agent',
    description: data.description || '',
    icon: data.icon || '🤖',
    systemPrompt: data.systemPrompt || '',
    temperature: data.temperature ?? 0.7,
    maxTokens: data.maxTokens ?? 4096,
    topP: data.topP ?? 1.0,
    frequencyPenalty: data.frequencyPenalty ?? 0,
    presencePenalty: data.presencePenalty ?? 0,
    model: data.model || '',
    isDefault: false,
    isCustom: true,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

