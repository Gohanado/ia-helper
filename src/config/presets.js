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
  },

  // ========== NOUVEAUX PRESETS ==========

  hr_recruiter: {
    id: 'hr_recruiter',
    name: 'RH / Recruteur',
    description: 'Actions pour ressources humaines et recrutement',
    icon: 'users',
    actions: [
      { id: 'analyze_cv', name: 'Analyser un CV', prompt: 'Analyse ce CV. Identifie les points forts, les competences cles, l\'experience pertinente et les eventuels points d\'attention.' },
      { id: 'job_posting', name: 'Rediger une offre', prompt: 'Redige une offre d\'emploi attractive et complete basee sur ces informations. Inclus les missions, competences requises et avantages.' },
      { id: 'interview_prep', name: 'Preparer entretien', prompt: 'Genere une liste de questions d\'entretien pertinentes pour ce poste ou ce candidat.' },
      { id: 'candidate_eval', name: 'Evaluer candidat', prompt: 'Cree une grille d\'evaluation pour ce candidat basee sur les criteres mentionnes.' },
      { id: 'candidate_email', name: 'Email candidat', prompt: 'Redige un email professionnel pour ce candidat (convocation, refus, ou suivi).' },
      { id: 'onboarding_plan', name: 'Plan d\'integration', prompt: 'Cree un plan d\'integration/onboarding pour ce nouveau collaborateur.' }
    ]
  },

  manager: {
    id: 'manager',
    name: 'Manager / Chef de projet',
    description: 'Actions pour managers et chefs de projet',
    icon: 'briefcase',
    actions: [
      { id: 'meeting_summary', name: 'Resume de reunion', prompt: 'Resume cette reunion avec les decisions prises, les actions a mener et les responsables.' },
      { id: 'raci_matrix', name: 'Matrice RACI', prompt: 'Cree une matrice RACI (Responsible, Accountable, Consulted, Informed) pour ce projet ou ces taches.' },
      { id: 'progress_report', name: 'Rapport d\'avancement', prompt: 'Redige un rapport d\'avancement professionnel base sur ces informations.' },
      { id: 'feedback_360', name: 'Feedback constructif', prompt: 'Formule un feedback constructif et bienveillant base sur ces observations.' },
      { id: 'sprint_planning', name: 'Planifier sprint', prompt: 'Aide a planifier ce sprint: priorisation, estimation, et repartition des taches.' },
      { id: 'risk_assessment', name: 'Evaluer les risques', prompt: 'Identifie les risques potentiels de ce projet et propose des mesures de mitigation.' }
    ]
  },

  legal: {
    id: 'legal',
    name: 'Juriste / Legal',
    description: 'Actions pour juristes et services juridiques',
    icon: 'gavel',
    actions: [
      { id: 'contract_analysis', name: 'Analyser contrat', prompt: 'Analyse ce contrat. Identifie les clauses importantes, les obligations de chaque partie et les points d\'attention.' },
      { id: 'legal_risks', name: 'Identifier risques', prompt: 'Identifie les risques juridiques potentiels dans ce document ou cette situation.' },
      { id: 'legal_summary', name: 'Resume juridique', prompt: 'Resume ce document juridique en termes simples et accessibles.' },
      { id: 'clause_draft', name: 'Rediger clause', prompt: 'Redige une clause contractuelle basee sur ces specifications.' },
      { id: 'legal_vulgarize', name: 'Vulgariser', prompt: 'Explique ce texte juridique en langage simple et comprehensible pour un non-juriste.' },
      { id: 'compliance_check', name: 'Verifier conformite', prompt: 'Verifie la conformite de ce document par rapport aux normes et reglementations mentionnees.' }
    ]
  },

  marketing: {
    id: 'marketing',
    name: 'Marketing',
    description: 'Actions pour professionnels du marketing',
    icon: 'bullhorn',
    actions: [
      { id: 'persona_create', name: 'Creer persona', prompt: 'Cree un persona marketing detaille base sur ces informations (demographie, comportements, motivations, freins).' },
      { id: 'ad_copy', name: 'Copy publicitaire', prompt: 'Redige un texte publicitaire accrocheur pour ce produit ou service.' },
      { id: 'ab_test_ideas', name: 'Idees A/B test', prompt: 'Propose des idees de tests A/B pour optimiser ce contenu ou cette campagne.' },
      { id: 'competitor_analysis', name: 'Analyse concurrence', prompt: 'Analyse ce concurrent: positionnement, forces, faiblesses, opportunites.' },
      { id: 'hashtag_suggest', name: 'Suggerer hashtags', prompt: 'Suggere des hashtags pertinents et tendance pour ce contenu.' },
      { id: 'campaign_brief', name: 'Brief campagne', prompt: 'Cree un brief de campagne marketing structure base sur ces objectifs.' }
    ]
  },

  product_manager: {
    id: 'product_manager',
    name: 'Product Manager',
    description: 'Actions pour chefs de produit',
    icon: 'box',
    actions: [
      { id: 'user_story', name: 'User Story', prompt: 'Redige une user story complete avec criteres d\'acceptation au format: En tant que... Je veux... Afin de...' },
      { id: 'specs_write', name: 'Rediger specs', prompt: 'Redige des specifications fonctionnelles detaillees pour cette feature.' },
      { id: 'prioritize_features', name: 'Prioriser features', prompt: 'Aide a prioriser ces features selon la methode MoSCoW ou RICE.' },
      { id: 'release_notes', name: 'Release notes', prompt: 'Redige des release notes claires et engageantes pour cette mise a jour.' },
      { id: 'feedback_analysis', name: 'Analyser feedback', prompt: 'Analyse ces retours utilisateurs. Identifie les themes recurrents et les insights.' },
      { id: 'roadmap_item', name: 'Item roadmap', prompt: 'Structure cet item de roadmap avec objectifs, KPIs et jalons.' }
    ]
  },

  ux_designer: {
    id: 'ux_designer',
    name: 'Designer UX/UI',
    description: 'Actions pour designers UX et UI',
    icon: 'palette',
    actions: [
      { id: 'design_critique', name: 'Critique design', prompt: 'Fais une critique constructive de ce design: points forts, ameliorations, accessibilite.' },
      { id: 'ux_persona', name: 'Persona UX', prompt: 'Cree un persona utilisateur detaille avec ses objectifs, frustrations et parcours.' },
      { id: 'user_flow', name: 'User flow', prompt: 'Decris le user flow optimal pour cette fonctionnalite ou ce parcours.' },
      { id: 'microcopy', name: 'Microcopy', prompt: 'Redige le microcopy (textes d\'interface) pour ces elements UI.' },
      { id: 'accessibility_check', name: 'Accessibilite', prompt: 'Analyse l\'accessibilite de ce design et suggere des ameliorations WCAG.' },
      { id: 'design_system', name: 'Design system', prompt: 'Propose des guidelines de design system pour cet element.' }
    ]
  },

  data_analyst: {
    id: 'data_analyst',
    name: 'Data Analyst',
    description: 'Actions pour analystes de donnees',
    icon: 'chart-bar',
    actions: [
      { id: 'interpret_data', name: 'Interpreter donnees', prompt: 'Interprete ces donnees et identifie les tendances, anomalies et insights cles.' },
      { id: 'sql_query', name: 'Requete SQL', prompt: 'Genere une requete SQL optimisee pour obtenir ces donnees.' },
      { id: 'data_report', name: 'Rapport donnees', prompt: 'Redige un rapport d\'analyse clair avec conclusions et recommandations.' },
      { id: 'viz_suggest', name: 'Suggerer visualisation', prompt: 'Suggere les meilleures visualisations pour representer ces donnees.' },
      { id: 'data_clean', name: 'Nettoyer donnees', prompt: 'Identifie les problemes de qualite dans ces donnees et propose un plan de nettoyage.' },
      { id: 'kpi_define', name: 'Definir KPIs', prompt: 'Propose des KPIs pertinents pour mesurer cet objectif.' }
    ]
  },

  community_manager: {
    id: 'community_manager',
    name: 'Community Manager',
    description: 'Actions pour community managers',
    icon: 'comments',
    actions: [
      { id: 'social_post', name: 'Post social', prompt: 'Cree un post engageant pour les reseaux sociaux adapte a cette plateforme.' },
      { id: 'comment_reply', name: 'Repondre commentaire', prompt: 'Redige une reponse appropriee a ce commentaire (positive, negative, ou question).' },
      { id: 'moderation_response', name: 'Moderation', prompt: 'Redige une reponse de moderation professionnelle pour ce contenu problematique.' },
      { id: 'content_calendar', name: 'Calendrier contenu', prompt: 'Propose un calendrier de contenu pour la periode et le theme mentionnes.' },
      { id: 'engagement_boost', name: 'Booster engagement', prompt: 'Suggere des actions pour augmenter l\'engagement sur ce contenu ou cette communaute.' },
      { id: 'crisis_response', name: 'Gestion de crise', prompt: 'Redige une reponse de communication de crise pour cette situation.' }
    ]
  },

  trainer: {
    id: 'trainer',
    name: 'Formateur / Enseignant',
    description: 'Actions pour formateurs et enseignants',
    icon: 'chalkboard',
    actions: [
      { id: 'lesson_plan', name: 'Plan de cours', prompt: 'Cree un plan de cours structure avec objectifs, activites et timing.' },
      { id: 'quiz_create', name: 'Creer quiz', prompt: 'Cree un quiz avec questions variees (QCM, vrai/faux, ouvertes) sur ce sujet.' },
      { id: 'exercise_create', name: 'Creer exercices', prompt: 'Cree des exercices pratiques progressifs pour ce sujet.' },
      { id: 'rubric_create', name: 'Grille d\'evaluation', prompt: 'Cree une grille d\'evaluation avec criteres et niveaux pour ce travail.' },
      { id: 'student_feedback', name: 'Feedback etudiant', prompt: 'Redige un feedback pedagogique constructif pour ce travail d\'etudiant.' },
      { id: 'simplify_concept', name: 'Simplifier concept', prompt: 'Explique ce concept complexe de maniere simple avec analogies et exemples.' }
    ]
  },

  translator: {
    id: 'translator',
    name: 'Traducteur Pro',
    description: 'Actions pour traducteurs professionnels',
    icon: 'language',
    actions: [
      { id: 'localize', name: 'Localiser', prompt: 'Localise ce texte pour le marche cible en adaptant les references culturelles.' },
      { id: 'cultural_adapt', name: 'Adapter culturellement', prompt: 'Adapte ce contenu aux specificites culturelles du public cible.' },
      { id: 'glossary_create', name: 'Creer glossaire', prompt: 'Cree un glossaire des termes techniques de ce texte avec leurs traductions.' },
      { id: 'consistency_check', name: 'Verifier coherence', prompt: 'Verifie la coherence terminologique de cette traduction.' },
      { id: 'proofread', name: 'Relecture', prompt: 'Fais une relecture approfondie de cette traduction: style, grammaire, fidelite.' },
      { id: 'back_translate', name: 'Retro-traduction', prompt: 'Fais une retro-traduction pour verifier la fidelite de la traduction.' }
    ]
  },

  journalist: {
    id: 'journalist',
    name: 'Journaliste',
    description: 'Actions pour journalistes et redacteurs presse',
    icon: 'newspaper',
    actions: [
      { id: 'article_angle', name: 'Trouver l\'angle', prompt: 'Propose des angles originaux pour traiter ce sujet d\'actualite.' },
      { id: 'fact_check', name: 'Fact-checking', prompt: 'Identifie les affirmations a verifier dans ce texte et suggere des sources.' },
      { id: 'interview_questions', name: 'Questions interview', prompt: 'Prepare des questions pertinentes pour cette interview.' },
      { id: 'article_lead', name: 'Chapeau article', prompt: 'Redige un chapeau accrocheur pour cet article.' },
      { id: 'source_evaluate', name: 'Evaluer sources', prompt: 'Evalue la fiabilite et la pertinence de ces sources.' },
      { id: 'press_release', name: 'Communique presse', prompt: 'Redige un communique de presse professionnel.' }
    ]
  },

  freelance: {
    id: 'freelance',
    name: 'Freelance / Independant',
    description: 'Actions pour travailleurs independants',
    icon: 'laptop',
    actions: [
      { id: 'quote_create', name: 'Creer devis', prompt: 'Cree un devis professionnel detaille pour cette prestation.' },
      { id: 'payment_reminder', name: 'Relance paiement', prompt: 'Redige un email de relance de paiement professionnel mais ferme.' },
      { id: 'proposal_write', name: 'Proposition commerciale', prompt: 'Redige une proposition commerciale convaincante pour ce prospect.' },
      { id: 'contract_points', name: 'Points contrat', prompt: 'Liste les points essentiels a inclure dans le contrat pour cette mission.' },
      { id: 'client_report', name: 'Rapport client', prompt: 'Redige un rapport d\'avancement professionnel pour ce client.' },
      { id: 'testimonial_request', name: 'Demander temoignage', prompt: 'Redige un email pour demander un temoignage client.' }
    ]
  },

  healthcare: {
    id: 'healthcare',
    name: 'Sante / Medical',
    description: 'Actions pour professionnels de sante',
    icon: 'heartbeat',
    actions: [
      { id: 'vulgarize_medical', name: 'Vulgariser medical', prompt: 'Explique ce terme ou concept medical en langage simple pour un patient.' },
      { id: 'patient_summary', name: 'Resume patient', prompt: 'Resume cette situation patient de maniere structuree pour transmission.' },
      { id: 'protocol_explain', name: 'Expliquer protocole', prompt: 'Explique ce protocole de soin de maniere claire et rassurante.' },
      { id: 'consent_info', name: 'Info consentement', prompt: 'Redige une information claire pour le consentement eclaire du patient.' },
      { id: 'discharge_summary', name: 'Resume sortie', prompt: 'Redige un resume de sortie avec consignes pour le patient.' },
      { id: 'medical_letter', name: 'Courrier medical', prompt: 'Redige un courrier medical professionnel (correspondant, mutuelle, etc.).' }
    ]
  },

  ecommerce: {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Actions pour vendeurs en ligne',
    icon: 'shopping-cart',
    actions: [
      { id: 'product_desc', name: 'Fiche produit', prompt: 'Redige une fiche produit complete et vendeuse avec caracteristiques et benefices.' },
      { id: 'review_response', name: 'Repondre avis', prompt: 'Redige une reponse professionnelle a cet avis client (positif ou negatif).' },
      { id: 'seo_description', name: 'Description SEO', prompt: 'Optimise cette description produit pour le SEO avec mots-cles pertinents.' },
      { id: 'faq_create', name: 'Creer FAQ', prompt: 'Cree une FAQ complete pour ce produit ou cette categorie.' },
      { id: 'product_compare', name: 'Comparatif', prompt: 'Cree un comparatif structure entre ces produits.' },
      { id: 'upsell_suggest', name: 'Suggestions upsell', prompt: 'Propose des produits complementaires et des arguments d\'upsell.' }
    ]
  },

  copywriter: {
    id: 'copywriter',
    name: 'Copywriter',
    description: 'Actions pour redacteurs publicitaires',
    icon: 'pen-fancy',
    actions: [
      { id: 'headlines', name: 'Accroches', prompt: 'Genere 10 accroches percutantes pour ce produit ou service.' },
      { id: 'cta_create', name: 'CTA efficaces', prompt: 'Propose des calls-to-action convaincants pour cette page ou email.' },
      { id: 'landing_copy', name: 'Copy landing page', prompt: 'Redige le texte complet d\'une landing page persuasive.' },
      { id: 'email_sequence', name: 'Sequence email', prompt: 'Cree une sequence d\'emails marketing (welcome, nurturing, conversion).' },
      { id: 'storytelling', name: 'Storytelling', prompt: 'Transforme ces informations en histoire captivante pour la marque.' },
      { id: 'value_prop', name: 'Proposition valeur', prompt: 'Formule une proposition de valeur claire et differenciante.' }
    ]
  },

  content_creator: {
    id: 'content_creator',
    name: 'Createur de contenu',
    description: 'Actions pour YouTubers, podcasters, influenceurs',
    icon: 'video',
    actions: [
      { id: 'video_script', name: 'Script video', prompt: 'Ecris un script de video structure avec intro, corps et outro.' },
      { id: 'video_description', name: 'Description video', prompt: 'Redige une description YouTube optimisee avec timestamps et liens.' },
      { id: 'chapters_create', name: 'Creer chapitres', prompt: 'Decoupe ce contenu en chapitres avec titres et timestamps.' },
      { id: 'thumbnail_ideas', name: 'Idees miniatures', prompt: 'Propose des idees de miniatures accrocheuses pour cette video.' },
      { id: 'hook_create', name: 'Creer hooks', prompt: 'Genere des hooks percutants pour les premieres secondes de la video.' },
      { id: 'content_repurpose', name: 'Reutiliser contenu', prompt: 'Propose des facons de reutiliser ce contenu sur differentes plateformes.' }
    ]
  },

  personal_assistant: {
    id: 'personal_assistant',
    name: 'Assistant Personnel',
    description: 'Actions pour la vie quotidienne',
    icon: 'user-tie',
    actions: [
      { id: 'personal_email', name: 'Email personnel', prompt: 'Redige un email personnel adapte au contexte (invitation, remerciement, nouvelle, etc.).' },
      { id: 'cover_letter', name: 'Lettre motivation', prompt: 'Redige une lettre de motivation personnalisee pour ce poste.' },
      { id: 'complaint_letter', name: 'Lettre reclamation', prompt: 'Redige une lettre de reclamation ferme mais polie.' },
      { id: 'thank_you', name: 'Remerciements', prompt: 'Redige un message de remerciement sincere et personnalise.' },
      { id: 'apology', name: 'Excuses', prompt: 'Redige un message d\'excuses sincere et approprie.' },
      { id: 'recommendation', name: 'Recommandation', prompt: 'Redige une lettre de recommandation professionnelle.' }
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

