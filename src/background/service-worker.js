// Service Worker Background pour IA Helper
// Gere les menus contextuels et la communication avec plusieurs providers IA

// Traductions du menu contextuel
const MENU_TRANSLATIONS = {
  fr: {
    openOptions: 'Ouvrir les options',
    translation: 'Traduction',
    summarizePage: 'Resumer cette page',
    extractKeyPoints: 'Extraire les points essentiels',
    myActions: 'Mes actions',
    essentials: 'Essentiels',
    practical: 'Pratique',
    technical: 'Technique',
    analysis: 'Analyse',
    pageActions: 'Actions de page',
    createCustomAction: 'Creer une action personnalisee'
  },
  en: {
    openOptions: 'Open options',
    translation: 'Translation',
    summarizePage: 'Summarize this page',
    extractKeyPoints: 'Extract key points',
    myActions: 'My actions',
    essentials: 'Essentials',
    practical: 'Practical',
    technical: 'Technical',
    analysis: 'Analysis',
    pageActions: 'Page actions',
    createCustomAction: 'Create custom action'
  },
  es: {
    openOptions: 'Abrir opciones',
    translation: 'Traduccion',
    summarizePage: 'Resumir esta pagina',
    extractKeyPoints: 'Extraer puntos clave',
    myActions: 'Mis acciones',
    essentials: 'Esenciales',
    practical: 'Practico',
    technical: 'Tecnico',
    analysis: 'Analisis',
    pageActions: 'Acciones de pagina',
    createCustomAction: 'Crear accion personalizada'
  },
  it: {
    openOptions: 'Apri opzioni',
    translation: 'Traduzione',
    summarizePage: 'Riassumi questa pagina',
    extractKeyPoints: 'Estrai punti chiave',
    myActions: 'Le mie azioni',
    essentials: 'Essenziali',
    practical: 'Pratico',
    technical: 'Tecnico',
    analysis: 'Analisi',
    pageActions: 'Azioni pagina',
    createCustomAction: 'Crea azione personalizzata'
  },
  pt: {
    openOptions: 'Abrir opcoes',
    translation: 'Traducao',
    summarizePage: 'Resumir esta pagina',
    extractKeyPoints: 'Extrair pontos-chave',
    myActions: 'Minhas acoes',
    essentials: 'Essenciais',
    practical: 'Pratico',
    technical: 'Tecnico',
    analysis: 'Analise',
    pageActions: 'Acoes da pagina',
    createCustomAction: 'Criar acao personalizada'
  }
};

// Langue courante pour les menus
let interfaceLanguage = 'en';

// Fonction pour obtenir une traduction de menu
function mt(key) {
  return MENU_TRANSLATIONS[interfaceLanguage]?.[key] || MENU_TRANSLATIONS.en[key] || key;
}

// Configuration par defaut
const DEFAULT_CONFIG = {
  provider: 'ollama',
  apiUrl: 'http://localhost:11434',
  apiKey: '',
  selectedModel: '',
  streamingEnabled: true,
  interfaceLanguage: 'en'
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

// Actions de base (inline pour le service worker) - SANS TABLEAUX
const BASE_ACTIONS = {
  // === ESSENTIELS ===
  correct_errors: {
    id: 'correct_errors',
    name: 'Corriger l\'orthographe',
    prompt: 'Corrige les fautes. Retourne uniquement le texte corrige.',
    category: 'essential',
    defaultEnabled: true
  },
  summarize: {
    id: 'summarize',
    name: 'Resumer',
    prompt: 'Resume en un paragraphe fluide. Pas de listes ni tableaux.',
    category: 'essential',
    defaultEnabled: true
  },
  explain_simple: {
    id: 'explain_simple',
    name: 'Expliquer simplement',
    prompt: 'Explique simplement. Texte fluide, pas de listes ni tableaux.',
    category: 'essential',
    defaultEnabled: true
  },
  improve_style: {
    id: 'improve_style',
    name: 'Ameliorer le style',
    prompt: 'Ameliore le style. Pas de formatage special.',
    category: 'essential',
    defaultEnabled: true
  },
  expand_content: {
    id: 'expand_content',
    name: 'Developper',
    prompt: 'Developpe avec plus de details. Style fluide, pas de tableaux.',
    category: 'essential',
    defaultEnabled: true
  },
  reformat_mail_pro: {
    id: 'reformat_mail_pro',
    name: 'Email professionnel',
    prompt: 'Transforme en email professionnel. Texte fluide, pas de tableaux.',
    category: 'essential',
    defaultEnabled: true
  },

  // === PRATIQUES ===
  bullet_points: {
    id: 'bullet_points',
    name: 'Liste a puces',
    prompt: 'Convertis en liste avec des tirets simples. Pas de tableaux.',
    category: 'practical',
    defaultEnabled: false
  },
  extract_key_points: {
    id: 'extract_key_points',
    name: 'Points cles',
    prompt: 'Donne 3-5 points essentiels avec des tirets. Pas de tableaux.',
    category: 'practical',
    defaultEnabled: false
  },
  make_shorter: {
    id: 'make_shorter',
    name: 'Raccourcir',
    prompt: 'Raccourcis de moitie. Texte fluide.',
    category: 'practical',
    defaultEnabled: false
  },
  make_formal: {
    id: 'make_formal',
    name: 'Ton formel',
    prompt: 'Reecris en ton formel. Pas de formatage special.',
    category: 'practical',
    defaultEnabled: false
  },
  make_casual: {
    id: 'make_casual',
    name: 'Ton decontracte',
    prompt: 'Reecris en ton decontracte. Pas de formatage special.',
    category: 'practical',
    defaultEnabled: false
  },

  // === TECHNIQUES ===
  explain_code: {
    id: 'explain_code',
    name: 'Expliquer le code',
    prompt: 'Explique ce code clairement. Pas de tableaux.',
    category: 'technical',
    defaultEnabled: false
  },
  review_code: {
    id: 'review_code',
    name: 'Revue de code',
    prompt: 'Revue de code avec tirets pour les points. Pas de tableaux.',
    category: 'technical',
    defaultEnabled: false
  },
  debug_help: {
    id: 'debug_help',
    name: 'Aide debug',
    prompt: 'Analyse l\'erreur et propose des solutions. Pas de tableaux.',
    category: 'technical',
    defaultEnabled: false
  },

  // === ANALYSE ===
  sentiment_analysis: {
    id: 'sentiment_analysis',
    name: 'Analyser le sentiment',
    prompt: 'Analyse le sentiment en 2-3 phrases. Pas de tableaux.',
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
      // Charger la langue pour les menus
      interfaceLanguage = config.interfaceLanguage || 'en';
      resolve(config);
    });
  });
}

// Verrou pour eviter les creations multiples de menus
let menuCreationInProgress = false;

// Detecter si on est sur Firefox
const isFirefox = typeof browser !== 'undefined' && typeof browser.runtime !== 'undefined';

// Creer les menus contextuels
async function createContextMenus() {
  // Eviter les appels simultanes
  if (menuCreationInProgress) {
    return;
  }
  menuCreationInProgress = true;

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

    // === ACTIONS DE PAGE (toujours visible) ===
    chrome.contextMenus.create({
      id: 'page-actions-section',
      title: mt('pageActions') || 'Actions de page',
      parentId: 'ia-helper-main',
      contexts: ctx
    });

    chrome.contextMenus.create({
      id: 'quick_summarize_page',
      title: mt('summarizePage'),
      parentId: 'page-actions-section',
      contexts: ctx
    });

    chrome.contextMenus.create({
      id: 'quick_extract_main',
      title: mt('extractKeyPoints'),
      parentId: 'page-actions-section',
      contexts: ctx
    });

    // === MENU TRADUCTION (toujours visible) ===
    chrome.contextMenus.create({
      id: 'translation-section',
      title: mt('translation'),
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

    if (isFirefox && categories.length > 0) {
      // Sur Firefox, regrouper toutes les categories dans un seul menu "Actions"
      chrome.contextMenus.create({
        id: 'all-actions-section',
        title: mt('actions') || 'Actions',
        parentId: 'ia-helper-main',
        contexts: ctx
      });

      for (const category of categories) {
        const categoryInfo = ACTION_CATEGORIES[category];
        const actions = actionsByCategory[category];

        // Creer sous-menu de categorie
        const categoryTitle = mt(category) !== category ? mt(category) : (categoryInfo?.name || category);
        chrome.contextMenus.create({
          id: `category-${category}`,
          title: categoryTitle,
          parentId: 'all-actions-section',
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
    } else {
      // Sur Chrome, garder la structure actuelle
      for (const category of categories) {
        const categoryInfo = ACTION_CATEGORIES[category];
        const actions = actionsByCategory[category];

        // Creer sous-menu de categorie avec traduction
        const categoryTitle = mt(category) !== category ? mt(category) : (categoryInfo?.name || category);
        chrome.contextMenus.create({
          id: `category-${category}`,
          title: categoryTitle,
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
        title: mt('myActions'),
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

    // Separateur avant les options
    chrome.contextMenus.create({
      id: 'separator-bottom',
      type: 'separator',
      parentId: 'ia-helper-main',
      contexts: ctx
    });

    // === RACCOURCI CREATION ACTION ===
    chrome.contextMenus.create({
      id: 'create-custom-action',
      title: mt('createCustomAction') || 'Creer une action personnalisee',
      parentId: 'ia-helper-main',
      contexts: ctx
    });

    // === OPTIONS (toujours visible) ===
    chrome.contextMenus.create({
      id: 'open-options',
      title: mt('openOptions'),
      parentId: 'ia-helper-main',
      contexts: ctx
    });

    console.log('IA Helper: Menus crees avec succes');
  } catch (error) {
    console.error('IA Helper: Erreur creation menus', error);
  } finally {
    menuCreationInProgress = false;
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

  // Creer une action personnalisee
  if (menuId === 'create-custom-action') {
    const optionsUrl = chrome.runtime.getURL('src/options/options.html#presets');
    chrome.tabs.create({ url: optionsUrl }, () => {
      // Envoyer un message pour ouvrir directement la creation d'action
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: 'OPEN_CUSTOM_ACTION_CREATOR',
          selectedText: info.selectionText || ''
        });
      }, 500);
    });
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

    // Verifier d'abord les prompts personnalises
    const customPrompts = await getStoredActions('customPrompts', {});
    if (customPrompts[actionId]) {
      presetPrompt = customPrompts[actionId];
    } else {
      const action = BASE_ACTIONS[actionId];
      if (action) {
        presetPrompt = action.prompt;
      }
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_RESULTS_PAGE') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/results/results.html')
    });
    sendResponse({ success: true });
  } else if (message.type === 'RELOAD_MENUS') {
    (async () => {
      await loadConfig();
      await createContextMenus();
      sendResponse({ success: true });
    })();
    return true;
  } else if (message.type === 'GENERATE_RESPONSE') {
    // Generer une reponse IA (pour le popup inline)
    (async () => {
      try {
        const result = await generateAIResponse(message.content, message.systemPrompt);
        sendResponse({ result: result });
      } catch (error) {
        sendResponse({ error: error.message });
      }
    })();
    return true;
  } else if (message.type === 'GET_ACTION_PROMPT') {
    const actionId = message.actionId;

    (async () => {
      const customPrompts = await getStoredActions('customPrompts', {});
      if (customPrompts[actionId]) {
        sendResponse({ prompt: customPrompts[actionId] });
        return;
      }

      if (BASE_ACTIONS[actionId]) {
        sendResponse({ prompt: BASE_ACTIONS[actionId].prompt });
        return;
      }

      const customActions = await getStoredActions('customActions', []);
      const customAction = customActions.find(a => a.id === actionId);
      if (customAction) {
        sendResponse({ prompt: customAction.prompt });
      } else {
        sendResponse({ prompt: '' });
      }
    })();
    return true;
  }
  return true;
});

// Generer une reponse IA (multi-provider)
async function generateAIResponse(content, systemPrompt) {
  // Recharger la config pour avoir les derniers parametres
  await loadConfig();

  const provider = config.provider || 'ollama';
  const apiUrl = config.apiUrl || DEFAULT_CONFIG.apiUrl;
  const apiKey = config.apiKey || '';
  let model = config.selectedModel || '';
  const temperature = 0.7;
  const maxTokens = 8000;
  const topP = 1.0;
  const frequencyPenalty = 0;
  const presencePenalty = 0;

  let response;
  let result = '';

  if (provider === 'ollama') {
    if (!model) model = 'llama3.2';
    response = await fetch(`${apiUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: content,
        system: systemPrompt,
        stream: false,
        options: {
          temperature: temperature,
          num_predict: maxTokens,
          top_p: topP,
          frequency_penalty: frequencyPenalty,
          presence_penalty: presencePenalty
        }
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    result = data.response || '';
  } else if (provider === 'openai' || provider === 'openrouter' || provider === 'custom') {
    if (!model) model = 'gpt-3.5-turbo';
    const baseUrl = provider === 'openai' ? 'https://api.openai.com/v1' :
                    provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : apiUrl;
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
        { role: 'user', content: content }
      ],
      temperature: temperature,
      max_tokens: maxTokens,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      stream: false
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || data.error);
    result = data.choices?.[0]?.message?.content || '';
  } else if (provider === 'anthropic') {
    if (!model) model = 'claude-3-haiku-20240307';
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: maxTokens,
        temperature: temperature,
        top_p: topP,
        system: systemPrompt,
        messages: [{ role: 'user', content: content }]
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || data.error);
    result = data.content?.[0]?.text || '';
  } else if (provider === 'groq') {
    if (!model) model = 'llama-3.1-8b-instant';
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || data.error);
    result = data.choices?.[0]?.message?.content || '';
  }

  if (!response.ok) {
    throw new Error(`Erreur API ${response.status}`);
  }

  return result;
}

// Map pour stocker les AbortControllers actifs
const activeRequests = new Map();

// Ecouter les connexions pour le streaming
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'streaming') {
    const portId = Date.now() + Math.random();

    port.onMessage.addListener(async (message) => {
      if (message.type === 'GENERATE_STREAMING') {
        try {
          const abortController = new AbortController();
          activeRequests.set(portId, abortController);
          await generateStreamingResponse(
            port,
            message.content,
            message.systemPrompt,
            message.agentParams || {},
            abortController.signal
          );
          activeRequests.delete(portId);
        } catch (error) {
          activeRequests.delete(portId);
          if (error.name === 'AbortError') {
            port.postMessage({ type: 'aborted' });
          } else {
            port.postMessage({ type: 'error', error: error.message });
          }
        }
      } else if (message.type === 'keepalive') {
        // ignore, keeps SW alive
      }
    });

    port.onDisconnect.addListener(() => {
      // Annuler la requete si le port est deconnecte
      const abortController = activeRequests.get(portId);
      if (abortController) {
        abortController.abort();
        activeRequests.delete(portId);
      }
    });
  }
});

// Generer une reponse IA avec streaming
async function generateStreamingResponse(port, content, systemPrompt, agentParams = {}, signal) {
  await loadConfig();

  const provider = config.provider || 'ollama';
  const apiUrl = config.apiUrl || DEFAULT_CONFIG.apiUrl;
  const apiKey = config.apiKey || '';
  const model = agentParams.model || config.selectedModel || '';

  // Parametres de l'agent avec valeurs par defaut
  const temperature = agentParams.temperature ?? 0.7;
  const maxTokens = agentParams.maxTokens ?? 8000;
  const topP = agentParams.topP ?? 1.0;
  const frequencyPenalty = agentParams.frequencyPenalty ?? 0;
  const presencePenalty = agentParams.presencePenalty ?? 0;

  // Keep-alive pour Firefox: envoyer un ping toutes les 10 secondes
  let keepAliveInterval = null;
  let portDisconnected = false;

  const startKeepAlive = () => {
    keepAliveInterval = setInterval(() => {
      if (!portDisconnected) {
        try {
          port.postMessage({ type: 'ping' });
        } catch (e) {
          portDisconnected = true;
          if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
          }
        }
      }
    }, 2000);
  };

  const stopKeepAlive = () => {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }
  };

  // Detecter la deconnexion du port
  const onDisconnect = () => {
    portDisconnected = true;
    stopKeepAlive();
  };
  port.onDisconnect.addListener(onDisconnect);

  // Demarrer le keep-alive
  startKeepAlive();

  let response;

  if (provider === 'ollama') {
    const requestBody = {
      model: model,
      prompt: content,
      system: systemPrompt,
      stream: true,
      options: {
        temperature: temperature,
        num_predict: maxTokens,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty
      }
    };

    response = await fetch(`${apiUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: signal
    });
  } else if (provider === 'openai' || provider === 'openrouter' || provider === 'custom') {
    const baseUrl = provider === 'openai' ? 'https://api.openai.com/v1' :
                    provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : apiUrl;

    const requestBody = {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: content }
      ],
      temperature: temperature,
      max_tokens: maxTokens,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      stream: true
    };

    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: signal
    });
  } else if (provider === 'anthropic') {
    const requestBody = {
      model: model,
      max_tokens: maxTokens,
      temperature: temperature,
      top_p: topP,
      system: systemPrompt,
      messages: [{ role: 'user', content: content }],
      stream: true
    };

    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody),
      signal: signal
    });
  } else if (provider === 'groq') {
    const requestBody = {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: content }
      ],
      temperature: temperature,
      max_tokens: maxTokens,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      stream: true
    };

    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: signal
    });
  }

  if (!response.ok) {
    stopKeepAlive();
    throw new Error(`Erreur API ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let isInThinking = false;

  try {
    while (true) {
      // Verifier si le port est deconnecte
      if (portDisconnected) {
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          // Format Ollama
          if (provider === 'ollama') {
            const json = JSON.parse(line);
            if (json.response) {
              port.postMessage({ type: 'chunk', text: json.response });
            }
          }
          // Format OpenAI/Groq/OpenRouter (SSE)
          else if (provider === 'openai' || provider === 'groq' || provider === 'openrouter' || provider === 'custom') {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              const json = JSON.parse(data);

              // Detecter le thinking (certains modeles utilisent un role special)
              const choice = json.choices?.[0];
              if (choice?.delta?.role === 'reasoning' || choice?.message?.role === 'reasoning') {
                isInThinking = true;
              }

              const text = choice?.delta?.content || '';
              if (text) {
                // Envoyer avec le type approprie
                port.postMessage({
                  type: 'chunk',
                  text: text,
                  isThinking: isInThinking
                });
              }

              // Detecter la fin du thinking
              if (choice?.finish_reason === 'stop' && isInThinking) {
                isInThinking = false;
                port.postMessage({ type: 'thinking_end' });
              }
            }
          }
          // Format Anthropic (SSE)
          else if (provider === 'anthropic') {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              const json = JSON.parse(data);
              if (json.type === 'content_block_delta' && json.delta?.text) {
                port.postMessage({ type: 'chunk', text: json.delta.text });
              }
            }
          }
        } catch (e) {
          // Ignorer les erreurs de parsing JSON
        }
      }
    }

    if (!portDisconnected) {
      port.postMessage({ type: 'done' });
    }
  } finally {
    stopKeepAlive();
    port.onDisconnect.removeListener(onDisconnect);
  }
}

