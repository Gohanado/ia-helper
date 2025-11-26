// Service Worker Background pour IA Helper
// Gere les menus contextuels et la communication avec Ollama

// Configuration par defaut (inline pour eviter les problemes d'import)
const DEFAULT_CONFIG = {
  ollamaUrl: 'http://localhost:11434',
  selectedModel: '',
  streamingEnabled: true,
  languages: [
    { code: 'fr', name: 'Francais', flag: 'FR' },
    { code: 'en', name: 'English', flag: 'GB' },
    { code: 'it', name: 'Italiano', flag: 'IT' },
    { code: 'es', name: 'Espanol', flag: 'ES' }
  ]
};

const INPUT_ACTIONS = [
  { id: 'correct_errors', name: 'Corriger les erreurs', enabled: true },
  { id: 'translate', name: 'Traduire', enabled: true, hasSubmenu: true },
  { id: 'reformat_mail_pro', name: 'Reformuler en Mail Pro', enabled: true },
  { id: 'expand_content', name: 'Developper le contenu', enabled: true },
  { id: 'summarize_input', name: 'Resumer', enabled: true },
  { id: 'improve_style', name: 'Ameliorer le style', enabled: true }
];

const SELECTION_ACTIONS = [
  { id: 'summarize', name: 'Resumer le texte', enabled: true },
  { id: 'translate_selection', name: 'Traduire', enabled: true, hasSubmenu: true },
  { id: 'explain_chronology', name: 'Expliquer la chronologie', enabled: true },
  { id: 'explain_simple', name: 'Expliquer simplement', enabled: true },
  { id: 'extract_key_points', name: 'Extraire les points cles', enabled: true },
  { id: 'analyze_sentiment', name: 'Analyser le sentiment', enabled: true }
];

const PRO_ACTIONS = [];

// Presets professionnels (inline)
const PROFESSIONAL_PRESETS = {
  support_it: {
    name: 'Support IT',
    actions: [
      { id: 'ticket_summary', name: 'Resumer le ticket', prompt: 'Resume ce ticket de support.' },
      { id: 'last_message', name: 'Dernier message', prompt: 'Extrait le dernier message client.' },
      { id: 'suggest_solution', name: 'Suggerer solution', prompt: 'Suggere des solutions.' },
      { id: 'draft_response', name: 'Rediger reponse', prompt: 'Redige une reponse professionnelle.' }
    ]
  },
  customer_service: {
    name: 'Service Client',
    actions: [
      { id: 'customer_sentiment', name: 'Analyser sentiment', prompt: 'Analyse le sentiment du client.' },
      { id: 'complaint_summary', name: 'Resumer reclamation', prompt: 'Resume cette reclamation.' },
      { id: 'empathetic_response', name: 'Reponse empathique', prompt: 'Redige une reponse empathique.' }
    ]
  },
  developer: {
    name: 'Developpeur',
    actions: [
      { id: 'code_explain', name: 'Expliquer code', prompt: 'Explique ce code.' },
      { id: 'code_review', name: 'Revue de code', prompt: 'Fais une revue de ce code.' },
      { id: 'code_refactor', name: 'Refactoriser', prompt: 'Propose une refactorisation.' },
      { id: 'debug_help', name: 'Aide debug', prompt: 'Aide a debugger cette erreur.' }
    ]
  },
  student: {
    name: 'Etudiant',
    actions: [
      { id: 'explain_simple', name: 'Expliquer simplement', prompt: 'Explique simplement ce concept.' },
      { id: 'create_summary', name: 'Creer resume', prompt: 'Cree un resume de revision.' },
      { id: 'quiz_me', name: 'Me tester', prompt: 'Pose-moi des questions sur ce sujet.' }
    ]
  },
  writer: {
    name: 'Redacteur',
    actions: [
      { id: 'improve_style', name: 'Ameliorer style', prompt: 'Ameliore le style de ce texte.' },
      { id: 'seo_optimize', name: 'Optimiser SEO', prompt: 'Optimise ce texte pour le SEO.' },
      { id: 'headline_ideas', name: 'Idees titres', prompt: 'Propose des titres accrocheurs.' }
    ]
  },
  sales: {
    name: 'Commercial',
    actions: [
      { id: 'lead_analysis', name: 'Analyser prospect', prompt: 'Analyse ce prospect.' },
      { id: 'sales_pitch', name: 'Argumentaire', prompt: 'Genere un argumentaire de vente.' },
      { id: 'follow_up_email', name: 'Email suivi', prompt: 'Redige un email de suivi.' }
    ]
  },
  researcher: {
    name: 'Chercheur',
    actions: [
      { id: 'extract_key_points', name: 'Points cles', prompt: 'Extrait les points cles.' },
      { id: 'identify_bias', name: 'Identifier biais', prompt: 'Identifie les biais potentiels.' },
      { id: 'literature_summary', name: 'Resume article', prompt: 'Resume cet article pour revue.' }
    ]
  }
};

// Configuration actuelle
let config = { ...DEFAULT_CONFIG };

// Charger la configuration au demarrage
async function loadConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['config'], (result) => {
      config = result.config || DEFAULT_CONFIG;
      resolve(config);
    });
  });
}

// Creer les menus contextuels
async function createContextMenus() {
  // Supprimer les menus existants
  await chrome.contextMenus.removeAll();

  // Menu parent principal
  chrome.contextMenus.create({
    id: 'ia-helper-main',
    title: 'IA Helper',
    contexts: ['all']
  });

  // Separateur
  chrome.contextMenus.create({
    id: 'separator-1',
    type: 'separator',
    parentId: 'ia-helper-main',
    contexts: ['all']
  });

  // === ACTIONS POUR CHAMPS DE SAISIE ===
  chrome.contextMenus.create({
    id: 'input-section',
    title: 'Edition de texte',
    parentId: 'ia-helper-main',
    contexts: ['editable']
  });

  // Charger les actions input
  const inputActions = await getStoredActions('inputActions', INPUT_ACTIONS);
  for (const action of inputActions.filter(a => a.enabled)) {
    if (action.hasSubmenu && action.id === 'translate') {
      // Sous-menu traduction
      chrome.contextMenus.create({
        id: `input-${action.id}`,
        title: action.name,
        parentId: 'input-section',
        contexts: ['editable']
      });
      // Ajouter les langues
      for (const lang of config.languages) {
        chrome.contextMenus.create({
          id: `input-translate-${lang.code}`,
          title: `${lang.flag} ${lang.name}`,
          parentId: `input-${action.id}`,
          contexts: ['editable']
        });
      }
    } else {
      chrome.contextMenus.create({
        id: `input-${action.id}`,
        title: action.name,
        parentId: 'input-section',
        contexts: ['editable']
      });
    }
  }

  // === ACTIONS POUR SELECTION DE TEXTE ===
  chrome.contextMenus.create({
    id: 'selection-section',
    title: 'Analyser la selection',
    parentId: 'ia-helper-main',
    contexts: ['selection']
  });

  const selectionActions = await getStoredActions('selectionActions', SELECTION_ACTIONS);
  for (const action of selectionActions.filter(a => a.enabled)) {
    if (action.hasSubmenu && action.id === 'translate_selection') {
      chrome.contextMenus.create({
        id: `selection-${action.id}`,
        title: action.name,
        parentId: 'selection-section',
        contexts: ['selection']
      });
      for (const lang of config.languages) {
        chrome.contextMenus.create({
          id: `selection-translate-${lang.code}`,
          title: `${lang.flag} ${lang.name}`,
          parentId: `selection-${action.id}`,
          contexts: ['selection']
        });
      }
    } else {
      chrome.contextMenus.create({
        id: `selection-${action.id}`,
        title: action.name,
        parentId: 'selection-section',
        contexts: ['selection']
      });
    }
  }

  // === ACTIONS RAPIDES PAGE ===
  chrome.contextMenus.create({
    id: 'separator-2',
    type: 'separator',
    parentId: 'ia-helper-main',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'quick-section',
    title: 'Actions rapides',
    parentId: 'ia-helper-main',
    contexts: ['page']
  });

  // Actions rapides pour analyser la page
  const quickActions = [
    { id: 'quick_summarize_page', name: 'Resumer cette page' },
    { id: 'quick_extract_main', name: 'Extraire les points essentiels' },
    { id: 'quick_translate_page', name: 'Traduire cette page' }
  ];

  for (const action of quickActions) {
    chrome.contextMenus.create({
      id: action.id,
      title: action.name,
      parentId: 'quick-section',
      contexts: ['page']
    });
  }

  // === PRESETS PROFESSIONNELS ===
  const activePresets = await getStoredActions('activePresets', []);

  if (activePresets.length > 0) {
    chrome.contextMenus.create({
      id: 'separator-3',
      type: 'separator',
      parentId: 'ia-helper-main',
      contexts: ['all']
    });

    // Ajouter les actions de chaque preset actif
    for (const presetId of activePresets) {
      const preset = PROFESSIONAL_PRESETS[presetId];
      if (!preset) continue;

      chrome.contextMenus.create({
        id: `preset-${presetId}`,
        title: preset.name,
        parentId: 'ia-helper-main',
        contexts: ['all']
      });

      for (const action of preset.actions) {
        chrome.contextMenus.create({
          id: `preset-${presetId}-${action.id}`,
          title: action.name,
          parentId: `preset-${presetId}`,
          contexts: ['all']
        });
      }
    }
  }

  // === ACTIONS PERSONNALISEES ===
  const customActions = await getStoredActions('customActions', []);
  if (customActions.length > 0) {
    chrome.contextMenus.create({
      id: 'separator-4',
      type: 'separator',
      parentId: 'ia-helper-main',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'custom-section',
      title: 'Mes actions',
      parentId: 'ia-helper-main',
      contexts: ['all']
    });

    for (const action of customActions.filter(a => a.enabled)) {
      let contexts;
      if (action.context === 'input') {
        contexts = ['editable'];
      } else if (action.context === 'selection') {
        contexts = ['selection'];
      } else {
        // 'all' ou 'both' - apparait partout
        contexts = ['page', 'selection', 'editable'];
      }
      chrome.contextMenus.create({
        id: `custom-${action.id}`,
        title: action.name,
        parentId: 'custom-section',
        contexts
      });
    }
  }

  // === OPTIONS ===
  chrome.contextMenus.create({
    id: 'separator-5',
    type: 'separator',
    parentId: 'ia-helper-main',
    contexts: ['all']
  });

  chrome.contextMenus.create({
    id: 'open-options',
    title: 'Options',
    parentId: 'ia-helper-main',
    contexts: ['all']
  });
}

// Obtenir les actions stockees
async function getStoredActions(key, defaultActions) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] || defaultActions);
    });
  });
}

// Gestionnaire de clic sur menu contextuel
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const menuId = info.menuItemId;

  // Ouvrir les options
  if (menuId === 'open-options') {
    chrome.runtime.openOptionsPage();
    return;
  }

  // Determiner l'action et le contexte
  let actionType = '';
  let actionId = '';
  let targetLanguage = '';

  // Parser les presets (format: preset-{presetId}-{actionId})
  const presetMatch = menuId.match(/^preset-([^-]+)-(.+)$/);

  if (menuId.startsWith('input-translate-')) {
    actionType = 'input';
    actionId = 'translate';
    targetLanguage = menuId.replace('input-translate-', '');
  } else if (menuId.startsWith('selection-translate-')) {
    actionType = 'selection';
    actionId = 'translate';
    targetLanguage = menuId.replace('selection-translate-', '');
  } else if (menuId.startsWith('input-')) {
    actionType = 'input';
    actionId = menuId.replace('input-', '');
  } else if (menuId.startsWith('selection-')) {
    actionType = 'selection';
    actionId = menuId.replace('selection-', '');
  } else if (presetMatch) {
    actionType = 'preset';
    actionId = menuId; // On garde le format complet pour retrouver le prompt
  } else if (menuId.startsWith('quick_')) {
    actionType = 'quick';
    actionId = menuId;
  } else if (menuId.startsWith('custom-')) {
    actionType = 'custom';
    actionId = menuId.replace('custom-', '');
  }

  if (!actionId) return;

  // Obtenir le prompt pour les presets
  let presetPrompt = '';
  if (actionType === 'preset') {
    const match = actionId.match(/^preset-([^-]+)-(.+)$/);
    if (match) {
      const presetId = match[1];
      const presetActionId = match[2];
      const preset = PROFESSIONAL_PRESETS[presetId];
      const action = preset?.actions.find(a => a.id === presetActionId);
      presetPrompt = action?.prompt || '';
    }
  }

  // Envoyer la commande au content script
  chrome.tabs.sendMessage(tab.id, {
    type: 'EXECUTE_ACTION',
    actionType,
    actionId,
    targetLanguage,
    presetPrompt,
    selectedText: info.selectionText || '',
    isEditable: info.editable
  });
});

// Initialisation a l'installation
chrome.runtime.onInstalled.addListener(async () => {
  await loadConfig();
  await createContextMenus();
  console.log('IA Helper installe avec succes');
});

// Initialisation au demarrage
chrome.runtime.onStartup.addListener(async () => {
  await loadConfig();
  await createContextMenus();
  console.log('IA Helper demarre');
});

// Creer les menus au chargement du service worker
(async () => {
  await loadConfig();
  await createContextMenus();
  console.log('IA Helper service worker charge');
})();

// Ecouter les changements de configuration
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'local') {
    if (changes.config || changes.inputActions || changes.selectionActions || changes.proActions) {
      await loadConfig();
      await createContextMenus();
    }
  }
});

// Ecouter les messages pour ouvrir la page de resultats
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'OPEN_RESULTS_PAGE') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/results/results.html')
    });
    sendResponse({ success: true });
  } else if (message.type === 'RELOAD_MENUS') {
    await loadConfig();
    await createContextMenus();
    sendResponse({ success: true });
  }
  return true;
});

