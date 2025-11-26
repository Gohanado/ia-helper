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

    // === ACTIONS RAPIDES (toujours visible) ===
    chrome.contextMenus.create({
      id: 'quick-section',
      title: 'Actions rapides',
      parentId: 'ia-helper-main',
      contexts: ctx
    });

    chrome.contextMenus.create({
      id: 'quick_summarize_page',
      title: 'Resumer cette page',
      parentId: 'quick-section',
      contexts: ctx
    });

    chrome.contextMenus.create({
      id: 'quick_extract_main',
      title: 'Extraire les points essentiels',
      parentId: 'quick-section',
      contexts: ctx
    });

    // === ACTIONS POUR CHAMPS DE SAISIE ===
    chrome.contextMenus.create({
      id: 'input-section',
      title: 'Edition de texte',
      parentId: 'ia-helper-main',
      contexts: ['editable']
    });

    for (const action of INPUT_ACTIONS.filter(a => a.enabled)) {
      if (action.hasSubmenu && action.id === 'translate') {
        chrome.contextMenus.create({
          id: `input-${action.id}`,
          title: action.name,
          parentId: 'input-section',
          contexts: ['editable']
        });
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

    for (const action of SELECTION_ACTIONS.filter(a => a.enabled)) {
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

    // === PRESETS INTEGRES ===
    const activePresets = await getStoredActions('activePresets', []);

    if (activePresets.length > 0) {
      for (const presetId of activePresets) {
        const preset = PROFESSIONAL_PRESETS[presetId];
        if (!preset) continue;

        chrome.contextMenus.create({
          id: `preset-${presetId}`,
          title: preset.name,
          parentId: 'ia-helper-main',
          contexts: ctx
        });

        for (const action of preset.actions) {
          chrome.contextMenus.create({
            id: `preset-${presetId}-${action.id}`,
            title: action.name,
            parentId: `preset-${presetId}`,
            contexts: ctx
          });
        }
      }
    }

    // === PRESETS PERSONNALISES ===
    const customPresets = await getStoredActions('customPresets', []);
    const enabledCustomPresets = customPresets.filter(p => p.enabled);

    if (enabledCustomPresets.length > 0) {
      for (const preset of enabledCustomPresets) {
        chrome.contextMenus.create({
          id: `custompreset-${preset.id}`,
          title: preset.name,
          parentId: 'ia-helper-main',
          contexts: ctx
        });

        for (const action of preset.actions) {
          chrome.contextMenus.create({
            id: `custompreset-${preset.id}-${action.id}`,
            title: action.name,
            parentId: `custompreset-${preset.id}`,
            contexts: ctx
          });
        }
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
  // Parser les presets integres (format: preset-{presetId}-{actionId})
  else if (menuId.match(/^preset-([^-]+)-(.+)$/)) {
    actionType = 'preset';
    actionId = menuId;
    const match = menuId.match(/^preset-([^-]+)-(.+)$/);
    if (match) {
      const presetId = match[1];
      const presetActionId = match[2];
      const preset = PROFESSIONAL_PRESETS[presetId];
      const action = preset?.actions.find(a => a.id === presetActionId);
      // Verifier si un prompt personnalise existe
      const customPrompts = await getStoredActions('customPrompts', {});
      const customKey = `${presetId}_${presetActionId}`;
      presetPrompt = customPrompts[customKey] || action?.prompt || '';
    }
  }
  // Parser les presets personnalises (format: custompreset-{presetId}-{actionId})
  else if (menuId.match(/^custompreset-([^-]+)-(.+)$/)) {
    actionType = 'custompreset';
    actionId = menuId;
    const match = menuId.match(/^custompreset-([^-]+)-(.+)$/);
    if (match) {
      const presetId = match[1];
      const presetActionId = match[2];
      const customPresets = await getStoredActions('customPresets', []);
      const preset = customPresets.find(p => p.id === presetId);
      const action = preset?.actions.find(a => a.id === presetActionId);
      presetPrompt = action?.prompt || '';
    }
  }
  else if (menuId.startsWith('input-translate-')) {
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
  } else if (menuId.startsWith('quick_')) {
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
  // Si c'est une nouvelle installation, activer les presets par defaut
  if (details.reason === 'install') {
    const defaultActivePresets = ['student', 'personal_assistant', 'writer', 'developer'];
    await chrome.storage.local.set({ activePresets: defaultActivePresets });
    console.log('Presets par defaut actives:', defaultActivePresets);
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

