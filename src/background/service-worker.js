// Service Worker Background pour IA Helper
// Gere les menus contextuels et la communication avec plusieurs providers IA

// Configuration par defaut
const DEFAULT_CONFIG = {
  provider: 'ollama',
  apiUrl: 'http://localhost:11434',
  apiKey: '',
  selectedModel: '',
  streamingEnabled: true
};

// Providers supportes
const PROVIDERS = {
  ollama: {
    name: 'Ollama (local)',
    defaultUrl: 'http://localhost:11434',
    needsKey: false,
    modelsEndpoint: '/api/tags',
    chatEndpoint: '/api/chat'
  },
  openai: {
    name: 'OpenAI',
    defaultUrl: 'https://api.openai.com/v1',
    needsKey: true,
    modelsEndpoint: '/models',
    chatEndpoint: '/chat/completions',
    defaultModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo']
  },
  anthropic: {
    name: 'Anthropic',
    defaultUrl: 'https://api.anthropic.com/v1',
    needsKey: true,
    chatEndpoint: '/messages',
    defaultModels: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307']
  },
  groq: {
    name: 'Groq',
    defaultUrl: 'https://api.groq.com/openai/v1',
    needsKey: true,
    modelsEndpoint: '/models',
    chatEndpoint: '/chat/completions',
    defaultModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768']
  },
  openrouter: {
    name: 'OpenRouter',
    defaultUrl: 'https://openrouter.ai/api/v1',
    needsKey: true,
    modelsEndpoint: '/models',
    chatEndpoint: '/chat/completions',
    defaultModels: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro']
  },
  custom: {
    name: 'Personnalise',
    defaultUrl: '',
    needsKey: true,
    modelsEndpoint: '/models',
    chatEndpoint: '/chat/completions'
  }
};

// Actions de base (inline pour le service worker)
const BASE_ACTIONS = {
  // === ESSENTIELS ===
  correct_errors: {
    id: 'correct_errors',
    name: 'Corriger l\'orthographe',
    prompt: 'Corrige uniquement les fautes d\'orthographe et de grammaire. Renvoie le texte corrige.',
    category: 'essential',
    defaultEnabled: true
  },
  summarize: {
    id: 'summarize',
    name: 'Resumer',
    prompt: 'Resume ce texte de maniere concise en gardant les informations essentielles.',
    category: 'essential',
    defaultEnabled: true
  },
  explain_simple: {
    id: 'explain_simple',
    name: 'Expliquer simplement',
    prompt: 'Explique ce texte de maniere simple et accessible.',
    category: 'essential',
    defaultEnabled: true
  },
  improve_style: {
    id: 'improve_style',
    name: 'Ameliorer le style',
    prompt: 'Ameliore le style de ce texte pour le rendre plus clair et fluide.',
    category: 'essential',
    defaultEnabled: true
  },
  expand_content: {
    id: 'expand_content',
    name: 'Developper',
    prompt: 'Developpe ce texte en ajoutant des details et explications.',
    category: 'essential',
    defaultEnabled: true
  },
  reformat_mail_pro: {
    id: 'reformat_mail_pro',
    name: 'Email professionnel',
    prompt: 'Transforme ce texte en email professionnel avec formules de politesse.',
    category: 'essential',
    defaultEnabled: true
  },

  // === PRATIQUES ===
  bullet_points: {
    id: 'bullet_points',
    name: 'Liste a puces',
    prompt: 'Convertis ce texte en une liste a puces claire et organisee.',
    category: 'practical',
    defaultEnabled: false
  },
  extract_key_points: {
    id: 'extract_key_points',
    name: 'Points cles',
    prompt: 'Extrait les points cles et informations importantes de ce texte.',
    category: 'practical',
    defaultEnabled: false
  },
  make_shorter: {
    id: 'make_shorter',
    name: 'Raccourcir',
    prompt: 'Raccourcis ce texte en gardant uniquement l\'essentiel.',
    category: 'practical',
    defaultEnabled: false
  },
  make_formal: {
    id: 'make_formal',
    name: 'Ton formel',
    prompt: 'Reecris ce texte avec un ton plus formel et professionnel.',
    category: 'practical',
    defaultEnabled: false
  },
  make_casual: {
    id: 'make_casual',
    name: 'Ton decontracte',
    prompt: 'Reecris ce texte avec un ton plus decontracte et amical.',
    category: 'practical',
    defaultEnabled: false
  },

  // === TECHNIQUES ===
  explain_code: {
    id: 'explain_code',
    name: 'Expliquer le code',
    prompt: 'Explique ce code de maniere claire.',
    category: 'technical',
    defaultEnabled: false
  },
  review_code: {
    id: 'review_code',
    name: 'Revue de code',
    prompt: 'Fais une revue de ce code et suggere des ameliorations.',
    category: 'technical',
    defaultEnabled: false
  },
  debug_help: {
    id: 'debug_help',
    name: 'Aide debug',
    prompt: 'Analyse cette erreur et suggere des solutions.',
    category: 'technical',
    defaultEnabled: false
  },

  // === ANALYSE ===
  sentiment_analysis: {
    id: 'sentiment_analysis',
    name: 'Analyser le sentiment',
    prompt: 'Analyse le sentiment de ce texte. Positif, negatif ou neutre?',
    category: 'analysis',
    defaultEnabled: false
  }
};

// Categories
const ACTION_CATEGORIES = {
  essential: { name: 'Essentiels', order: 1 },
  practical: { name: 'Pratiques', order: 2 },
  technical: { name: 'Techniques', order: 3 },
  analysis: { name: 'Analyse', order: 4 }
};

// Actions par defaut
const DEFAULT_ENABLED_ACTIONS = Object.keys(BASE_ACTIONS)
  .filter(key => BASE_ACTIONS[key].defaultEnabled);

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
  try {
    // Supprimer les menus existants
    await chrome.contextMenus.removeAll();

    const ctx = ['page', 'selection', 'editable', 'link', 'image'];

    // Menu parent principal
    chrome.contextMenus.create({
      id: 'ia-helper-main',
      title: 'IA Helper',
      contexts: ctx
    });

    // === OPTIONS (toujours visible) ===
    chrome.contextMenus.create({
      id: 'open-options',
      title: 'Ouvrir les options',
      parentId: 'ia-helper-main',
      contexts: ctx
    });

    // === MENU TRADUCTION (toujours visible) ===
    chrome.contextMenus.create({
      id: 'translation-section',
      title: 'Traduction',
      parentId: 'ia-helper-main',
      contexts: ctx
    });

    const translationLanguages = [
      { code: 'fr', name: 'Francais', flag: 'FR' },
      { code: 'en', name: 'English', flag: 'GB' },
      { code: 'es', name: 'Espanol', flag: 'ES' },
      { code: 'it', name: 'Italiano', flag: 'IT' },
      { code: 'pt', name: 'Portugues', flag: 'PT' },
      { code: 'de', name: 'Deutsch', flag: 'DE' },
      { code: 'nl', name: 'Nederlands', flag: 'NL' },
      { code: 'ru', name: 'Russkiy', flag: 'RU' },
      { code: 'zh', name: 'Zhongwen', flag: 'CN' },
      { code: 'ja', name: 'Nihongo', flag: 'JP' },
      { code: 'ar', name: 'Arabi', flag: 'SA' }
    ];

    for (const lang of translationLanguages) {
      chrome.contextMenus.create({
        id: `translate-to-${lang.code}`,
        title: `${lang.flag} ${lang.name}`,
        parentId: 'translation-section',
        contexts: ctx
      });
    }

    // === ACTIONS DE PAGE (toujours visible) ===
    chrome.contextMenus.create({
      id: 'quick_summarize_page',
      title: 'Resumer cette page',
      parentId: 'ia-helper-main',
      contexts: ctx
    });

    chrome.contextMenus.create({
      id: 'quick_extract_main',
      title: 'Extraire les points essentiels',
      parentId: 'ia-helper-main',
      contexts: ctx
    });

    // Separateur
    chrome.contextMenus.create({
      id: 'separator-1',
      type: 'separator',
      parentId: 'ia-helper-main',
      contexts: ctx
    });

    // === ACTIONS INDIVIDUELLES ACTIVEES ===
    const enabledActions = await getStoredActions('enabledActions', DEFAULT_ENABLED_ACTIONS);
    const customActions = await getStoredActions('customActions', []);

    // Grouper par categorie
    const actionsByCategory = {};
    for (const actionId of enabledActions) {
      const action = BASE_ACTIONS[actionId];
      if (!action) continue;
      if (!actionsByCategory[action.category]) {
        actionsByCategory[action.category] = [];
      }
      actionsByCategory[action.category].push(action);
    }

    // Creer les menus par categorie
    const categories = Object.keys(actionsByCategory).sort(
      (a, b) => (ACTION_CATEGORIES[a]?.order || 99) - (ACTION_CATEGORIES[b]?.order || 99)
    );

    for (const category of categories) {
      const categoryInfo = ACTION_CATEGORIES[category];
      const actions = actionsByCategory[category];

      // Creer sous-menu de categorie
      chrome.contextMenus.create({
        id: `category-${category}`,
        title: categoryInfo?.name || category,
        parentId: 'ia-helper-main',
        contexts: ctx
      });

      // Ajouter les actions de la categorie
      for (const action of actions) {
        chrome.contextMenus.create({
          id: `action-${action.id}`,
          title: action.name,
          parentId: `category-${category}`,
          contexts: ctx
        });
      }
    }

    // === ACTIONS PERSONNALISEES ===
    const enabledCustomActions = customActions.filter(a => enabledActions.includes(a.id));

    if (enabledCustomActions.length > 0) {
      chrome.contextMenus.create({
        id: 'separator-custom',
        type: 'separator',
        parentId: 'ia-helper-main',
        contexts: ctx
      });

      chrome.contextMenus.create({
        id: 'custom-actions-section',
        title: 'Mes actions',
        parentId: 'ia-helper-main',
        contexts: ctx
      });

      for (const action of enabledCustomActions) {
        chrome.contextMenus.create({
          id: `custom-${action.id}`,
          title: action.name,
          parentId: 'custom-actions-section',
          contexts: ctx
        });
      }
    }

    console.log('IA Helper: Menus crees avec succes');
  } catch (error) {
    console.error('IA Helper: Erreur creation menus', error);
  }
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
  let presetPrompt = '';

  // Menu de traduction global
  if (menuId.startsWith('translate-to-')) {
    actionType = 'translate';
    targetLanguage = menuId.replace('translate-to-', '');
    actionId = 'translate';
  }
  // Actions individuelles (format: action-{actionId})
  else if (menuId.startsWith('action-')) {
    actionType = 'action';
    actionId = menuId.replace('action-', '');
    const action = BASE_ACTIONS[actionId];
    if (action) {
      presetPrompt = action.prompt;
    }
  }
  // Actions personnalisees (format: custom-{actionId})
  else if (menuId.startsWith('custom-')) {
    actionType = 'custom';
    actionId = menuId.replace('custom-', '');
    const customActions = await getStoredActions('customActions', []);
    const action = customActions.find(a => a.id === actionId);
    if (action) {
      presetPrompt = action.prompt;
    }
  }
  else if (menuId.startsWith('quick_')) {
    actionType = 'quick';
    actionId = menuId;
  }

  if (!actionId) {
    console.log('IA Helper: Aucune action trouvee pour', menuId);
    return;
  }

  console.log('IA Helper: Envoi action', { actionType, actionId, targetLanguage });

  // Verifier que l'onglet est valide
  if (!tab || !tab.id) {
    console.error('IA Helper: Onglet invalide');
    return;
  }

  // Fonction pour envoyer le message
  const sendAction = () => {
    chrome.tabs.sendMessage(tab.id, {
      type: 'EXECUTE_ACTION',
      actionType,
      actionId,
      targetLanguage,
      presetPrompt,
      selectedText: info.selectionText || '',
      isEditable: info.editable
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('IA Helper: Erreur envoi message', chrome.runtime.lastError.message);
      } else {
        console.log('IA Helper: Reponse content script', response);
      }
    });
  };

  // Injecter le content script si necessaire puis envoyer l'action
  try {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['src/content/content-script.js']
    }).then(() => {
      console.log('IA Helper: Content script injecte');
      setTimeout(sendAction, 100);
    }).catch((err) => {
      // Le script est peut-etre deja charge, essayer d'envoyer quand meme
      console.log('IA Helper: Script deja charge ou erreur injection', err.message);
      sendAction();
    });
  } catch (error) {
    console.error('IA Helper: Exception', error);
    sendAction();
  }
});

// Initialisation a l'installation
chrome.runtime.onInstalled.addListener(async (details) => {
  // Si c'est une nouvelle installation, activer les actions par defaut
  if (details.reason === 'install') {
    await chrome.storage.local.set({ enabledActions: DEFAULT_ENABLED_ACTIONS });
    console.log('Actions par defaut activees:', DEFAULT_ENABLED_ACTIONS);
  }

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
    if (changes.config || changes.enabledActions || changes.customPresets) {
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

