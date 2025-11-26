// Presets professionnels pour IA Helper
// Chaque preset contient des actions specifiques a un metier ou contexte

export const PROFESSIONAL_PRESETS = {
  support_it: {
    id: 'support_it',
    name: 'Support Informatique',
    description: 'Actions pour agents de support technique',
    icon: 'headset',
    actions: [
      { id: 'ticket_summary', name: 'Resumer le ticket', prompt: 'Resume ce ticket de support de maniere concise. Identifie le probleme principal, les etapes deja tentees et l\'urgence.' },
      { id: 'last_message', name: 'Dernier message client', prompt: 'Extrait et resume le dernier message du client dans cette conversation.' },
      { id: 'current_situation', name: 'Situation actuelle', prompt: 'Analyse cette conversation de support et resume la situation actuelle: probleme, etapes effectuees, prochaines actions.' },
      { id: 'ticket_timeline', name: 'Chronologie du ticket', prompt: 'Cree une chronologie des evenements de ce ticket de support avec les dates et actions.' },
      { id: 'suggest_solution', name: 'Suggerer une solution', prompt: 'Analyse ce probleme technique et suggere des solutions potentielles avec leurs etapes.' },
      { id: 'draft_response', name: 'Rediger une reponse', prompt: 'Redige une reponse professionnelle et courtoise pour ce ticket de support.' }
    ]
  },
  
  customer_service: {
    id: 'customer_service',
    name: 'Service Client',
    description: 'Actions pour conseillers clientele',
    icon: 'users',
    actions: [
      { id: 'customer_sentiment', name: 'Analyser le sentiment', prompt: 'Analyse le sentiment du client dans ce message. Est-il satisfait, frustre, neutre? Explique brievement.' },
      { id: 'complaint_summary', name: 'Resumer la reclamation', prompt: 'Resume cette reclamation client de maniere structuree: probleme, attentes, historique.' },
      { id: 'empathetic_response', name: 'Reponse empathique', prompt: 'Redige une reponse empathique et professionnelle a ce client.' },
      { id: 'escalation_note', name: 'Note d\'escalade', prompt: 'Redige une note d\'escalade claire pour ce dossier client destine au superviseur.' }
    ]
  },
  
  sales: {
    id: 'sales',
    name: 'Commercial / Ventes',
    description: 'Actions pour commerciaux et vendeurs',
    icon: 'briefcase',
    actions: [
      { id: 'lead_analysis', name: 'Analyser le prospect', prompt: 'Analyse ce profil ou message de prospect. Identifie ses besoins, son budget potentiel et son niveau d\'interet.' },
      { id: 'sales_pitch', name: 'Argumentaire de vente', prompt: 'Genere un argumentaire de vente adapte a ce prospect base sur ses besoins.' },
      { id: 'objection_handler', name: 'Repondre aux objections', prompt: 'Propose des reponses aux objections du client mentionnees dans ce texte.' },
      { id: 'follow_up_email', name: 'Email de suivi', prompt: 'Redige un email de suivi professionnel pour ce prospect.' }
    ]
  },
  
  developer: {
    id: 'developer',
    name: 'Developpeur',
    description: 'Actions pour developpeurs et ingenieurs',
    icon: 'code',
    actions: [
      { id: 'code_explain', name: 'Expliquer le code', prompt: 'Explique ce code de maniere claire. Decris ce qu\'il fait, sa logique et ses points importants.' },
      { id: 'code_review', name: 'Revue de code', prompt: 'Fais une revue de ce code. Identifie les problemes potentiels, les ameliorations et les bonnes pratiques.' },
      { id: 'code_refactor', name: 'Refactoriser', prompt: 'Propose une version refactorisee de ce code avec des explications.' },
      { id: 'code_document', name: 'Documenter', prompt: 'Genere la documentation pour ce code (commentaires, JSDoc, etc.).' },
      { id: 'debug_help', name: 'Aide au debug', prompt: 'Analyse cette erreur ou ce bug et suggere des solutions.' },
      { id: 'code_translate', name: 'Traduire le code', prompt: 'Traduis ce code dans un autre langage de programmation (precise lequel tu souhaites).' }
    ]
  },
  
  writer: {
    id: 'writer',
    name: 'Redacteur / Content',
    description: 'Actions pour redacteurs et createurs de contenu',
    icon: 'pen',
    actions: [
      { id: 'improve_style', name: 'Ameliorer le style', prompt: 'Ameliore le style de ce texte tout en gardant le sens. Rends-le plus fluide et engageant.' },
      { id: 'seo_optimize', name: 'Optimiser SEO', prompt: 'Optimise ce texte pour le SEO. Suggere des mots-cles et ameliorations.' },
      { id: 'headline_ideas', name: 'Idees de titres', prompt: 'Propose 5 titres accrocheurs pour ce contenu.' },
      { id: 'social_adapt', name: 'Adapter pour reseaux', prompt: 'Adapte ce contenu pour les reseaux sociaux (Twitter, LinkedIn, etc.).' },
      { id: 'grammar_check', name: 'Correction grammaticale', prompt: 'Corrige les erreurs grammaticales et orthographiques de ce texte.' }
    ]
  },
  
  student: {
    id: 'student',
    name: 'Etudiant',
    description: 'Actions pour etudiants et apprenants',
    icon: 'graduation-cap',
    actions: [
      { id: 'explain_simple', name: 'Expliquer simplement', prompt: 'Explique ce concept de maniere simple, comme si tu l\'expliquais a un debutant.' },
      { id: 'create_summary', name: 'Creer un resume', prompt: 'Cree un resume structure de ce cours ou document pour revision.' },
      { id: 'create_flashcards', name: 'Creer des flashcards', prompt: 'Cree des flashcards (question/reponse) a partir de ce contenu pour memorisation.' },
      { id: 'quiz_me', name: 'Me poser des questions', prompt: 'Pose-moi 5 questions pour tester ma comprehension de ce sujet.' },
      { id: 'essay_outline', name: 'Plan de dissertation', prompt: 'Cree un plan structure pour une dissertation sur ce sujet.' }
    ]
  },
  
  researcher: {
    id: 'researcher',
    name: 'Chercheur / Analyste',
    description: 'Actions pour chercheurs et analystes',
    icon: 'search',
    actions: [
      { id: 'extract_key_points', name: 'Points cles', prompt: 'Extrait les points cles et les conclusions principales de ce document.' },
      { id: 'methodology_review', name: 'Analyser methodologie', prompt: 'Analyse la methodologie utilisee dans cette etude ou ce rapport.' },
      { id: 'compare_sources', name: 'Comparer sources', prompt: 'Compare les informations et les perspectives presentees dans ce texte.' },
      { id: 'identify_bias', name: 'Identifier les biais', prompt: 'Identifie les biais potentiels dans ce texte ou cette source.' },
      { id: 'literature_summary', name: 'Resume de litterature', prompt: 'Resume cet article ou ce chapitre pour une revue de litterature.' }
    ]
  }
};

// Actions contextuelles enrichies pour tous les utilisateurs
export const ENHANCED_CONTEXT_ACTIONS = {
  selection: [
    { id: 'summarize', name: 'Resumer', icon: 'compress', prompt: 'Resume ce texte de maniere claire et concise.' },
    { id: 'explain', name: 'Expliquer', icon: 'lightbulb', prompt: 'Explique ce texte de maniere simple et detaillee.' },
    { id: 'translate', name: 'Traduire', icon: 'globe', hasSubmenu: true },
    { id: 'key_points', name: 'Points cles', icon: 'list', prompt: 'Extrait les points cles de ce texte sous forme de liste.' },
    { id: 'simplify', name: 'Simplifier', icon: 'feather', prompt: 'Reecris ce texte de maniere plus simple et accessible.' },
    { id: 'elaborate', name: 'Developper', icon: 'expand', prompt: 'Developpe et enrichis ce texte avec plus de details.' },
    { id: 'fact_check', name: 'Verifier les faits', icon: 'check-circle', prompt: 'Analyse ce texte et identifie les affirmations qui necessitent verification.' },
    { id: 'sentiment', name: 'Analyser le ton', icon: 'smile', prompt: 'Analyse le ton et le sentiment de ce texte.' },
    { id: 'define_terms', name: 'Definir les termes', icon: 'book', prompt: 'Identifie et definis les termes techniques ou complexes dans ce texte.' },
    { id: 'create_outline', name: 'Creer un plan', icon: 'sitemap', prompt: 'Cree un plan structure a partir de ce texte.' }
  ],

  input: [
    { id: 'correct', name: 'Corriger', icon: 'spell-check', prompt: 'Corrige les erreurs orthographiques et grammaticales de ce texte.' },
    { id: 'rephrase', name: 'Reformuler', icon: 'sync', prompt: 'Reformule ce texte en gardant le meme sens mais avec un style different.' },
    { id: 'professional', name: 'Ton professionnel', icon: 'tie', prompt: 'Reecris ce texte avec un ton plus professionnel et formel.' },
    { id: 'casual', name: 'Ton decontracte', icon: 'coffee', prompt: 'Reecris ce texte avec un ton plus decontracte et amical.' },
    { id: 'shorten', name: 'Raccourcir', icon: 'minus', prompt: 'Raccourcis ce texte en gardant l\'essentiel.' },
    { id: 'expand', name: 'Allonger', icon: 'plus', prompt: 'Developpe ce texte en ajoutant des details et des exemples.' },
    { id: 'email_pro', name: 'Email professionnel', icon: 'envelope', prompt: 'Transforme ce texte en email professionnel avec objet, corps et signature.' },
    { id: 'translate', name: 'Traduire', icon: 'globe', hasSubmenu: true },
    { id: 'improve_clarity', name: 'Clarifier', icon: 'eye', prompt: 'Ameliore la clarte et la lisibilite de ce texte.' },
    { id: 'add_structure', name: 'Structurer', icon: 'columns', prompt: 'Ajoute une structure avec titres et paragraphes a ce texte.' }
  ],

  page: [
    { id: 'page_summary', name: 'Resumer la page', icon: 'file-text', prompt: 'Resume le contenu principal de cette page web.' },
    { id: 'main_points', name: 'Points principaux', icon: 'list-ol', prompt: 'Extrait les points principaux de cette page.' },
    { id: 'page_translate', name: 'Traduire la page', icon: 'globe', prompt: 'Traduis le contenu principal de cette page.' },
    { id: 'tldr', name: 'TL;DR', icon: 'bolt', prompt: 'Donne un resume tres court (TL;DR) de cette page en 2-3 phrases.' },
    { id: 'analyze_article', name: 'Analyser l\'article', icon: 'newspaper', prompt: 'Analyse cet article: theme, arguments, conclusion, et ton.' },
    { id: 'extract_data', name: 'Extraire les donnees', icon: 'table', prompt: 'Extrait les donnees structurees (chiffres, dates, noms) de cette page.' }
  ]
};

// Liste des presets disponibles pour l'interface
export const PRESET_LIST = Object.values(PROFESSIONAL_PRESETS).map(p => ({
  id: p.id,
  name: p.name,
  description: p.description,
  icon: p.icon,
  actionCount: p.actions.length
}));

