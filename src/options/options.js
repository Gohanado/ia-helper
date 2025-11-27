// Options Page Script - IA Helper

import { t } from '../i18n/translations.js';

// Version courante - lue depuis le manifest
const VERSION = chrome.runtime.getManifest().version;
const VERSION_URL = 'https://raw.githubusercontent.com/Gohanado/ia-helper/main/version.json';

// Configuration par defaut
const DEFAULT_CONFIG = {
  provider: 'ollama',
  apiUrl: 'http://localhost:11434',
  apiKey: '',
  selectedModel: '',
  streamingEnabled: true,
  interfaceLanguage: 'fr',
  responseLanguage: 'fr'
};

// Providers supportes
const PROVIDERS = {
  ollama: { name: 'Ollama (local)', defaultUrl: 'http://localhost:11434', needsKey: false },
  openai: { name: 'OpenAI', defaultUrl: 'https://api.openai.com/v1', needsKey: true, defaultModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  anthropic: { name: 'Anthropic', defaultUrl: 'https://api.anthropic.com/v1', needsKey: true, defaultModels: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'] },
  groq: { name: 'Groq', defaultUrl: 'https://api.groq.com/openai/v1', needsKey: true, defaultModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'] },
  openrouter: { name: 'OpenRouter', defaultUrl: 'https://openrouter.ai/api/v1', needsKey: true, defaultModels: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet'] },
  custom: { name: 'Personnalise', defaultUrl: '', needsKey: true }
};

// Langues de traduction
const TRANSLATE_LANGUAGES = [
  { code: 'fr', name: 'Francais' },
  { code: 'en', name: 'Anglais' },
  { code: 'es', name: 'Espagnol' },
  { code: 'de', name: 'Allemand' },
  { code: 'it', name: 'Italien' },
  { code: 'pt', name: 'Portugais' },
  { code: 'zh', name: 'Chinois' },
  { code: 'ja', name: 'Japonais' },
  { code: 'ko', name: 'Coreen' },
  { code: 'ar', name: 'Arabe' },
  { code: 'ru', name: 'Russe' },
  { code: 'nl', name: 'Neerlandais' }
];

// Actions de base
const BASE_ACTIONS = {
  correct_errors: { id: 'correct_errors', name: 'Corriger l\'orthographe', description: 'Corrige les fautes', category: 'essential', defaultEnabled: true },
  summarize: { id: 'summarize', name: 'Resumer', description: 'Resume le texte', category: 'essential', defaultEnabled: true },
  explain_simple: { id: 'explain_simple', name: 'Expliquer simplement', description: 'Explique simplement', category: 'essential', defaultEnabled: true },
  improve_style: { id: 'improve_style', name: 'Ameliorer le style', description: 'Ameliore la clarte', category: 'essential', defaultEnabled: true },
  expand_content: { id: 'expand_content', name: 'Developper', description: 'Developpe le texte', category: 'essential', defaultEnabled: true },
  reformat_mail_pro: { id: 'reformat_mail_pro', name: 'Email professionnel', description: 'Format email pro', category: 'essential', defaultEnabled: true },
  bullet_points: { id: 'bullet_points', name: 'Liste a puces', description: 'Convertit en liste', category: 'practical', defaultEnabled: false },
  extract_key_points: { id: 'extract_key_points', name: 'Points cles', description: 'Extrait l\'essentiel', category: 'practical', defaultEnabled: false },
  make_shorter: { id: 'make_shorter', name: 'Raccourcir', description: 'Reduit la longueur', category: 'practical', defaultEnabled: false },
  make_formal: { id: 'make_formal', name: 'Ton formel', description: 'Rend plus formel', category: 'practical', defaultEnabled: false },
  make_casual: { id: 'make_casual', name: 'Ton decontracte', description: 'Rend plus decontracte', category: 'practical', defaultEnabled: false },
  explain_code: { id: 'explain_code', name: 'Expliquer le code', description: 'Explique le code', category: 'technical', defaultEnabled: false },
  review_code: { id: 'review_code', name: 'Revue de code', description: 'Analyse le code', category: 'technical', defaultEnabled: false },
  debug_help: { id: 'debug_help', name: 'Aide debug', description: 'Aide a debugger', category: 'technical', defaultEnabled: false },
  sentiment_analysis: { id: 'sentiment_analysis', name: 'Analyser le sentiment', description: 'Analyse le ton', category: 'analysis', defaultEnabled: false }
};

const DEFAULT_ENABLED_ACTIONS = Object.keys(BASE_ACTIONS).filter(k => BASE_ACTIONS[k].defaultEnabled);

// Raccourcis par defaut
const DEFAULT_SHORTCUTS = {
  quickPrompt: { key: 'i', alt: true, ctrl: false, shift: false, actionId: 'quickPrompt', actionName: 'Prompt rapide' }
};

let shortcuts = {};
let shortcutsEnabled = true;
let defaultTranslateLang = 'en';
let recordingShortcut = null;
let customActions = [];
let enabledTranslations = ['fr', 'en', 'es', 'de'];

// Configuration actuelle
let config = { ...DEFAULT_CONFIG };
let enabledActions = [...DEFAULT_ENABLED_ACTIONS];
let customPresets = [];
let currentLang = 'fr';

// Elements DOM (initialises apres DOMContentLoaded)
let elements = {};

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
  // Initialiser les elements DOM
  elements = {
    providerSelect: document.getElementById('provider-select'),
    apiUrl: document.getElementById('api-url'),
    apiKey: document.getElementById('api-key'),
    apiUrlGroup: document.getElementById('api-url-group'),
    apiKeyGroup: document.getElementById('api-key-group'),
    apiUrlLabel: document.getElementById('api-url-label'),
    modelSelect: document.getElementById('model-select'),
    streamingEnabled: document.getElementById('streaming-enabled'),
    interfaceLanguage: document.getElementById('interface-language'),
    responseLanguage: document.getElementById('response-language'),
    connectionStatus: document.getElementById('connection-status')
  };

  try {
    // Mettre a jour les elements de version
    const currentVersionEl = document.getElementById('current-version');
    const aboutVersionEl = document.getElementById('about-version');
    if (currentVersionEl) currentVersionEl.textContent = 'v' + VERSION;
    if (aboutVersionEl) aboutVersionEl.textContent = 'Version ' + VERSION;

    await loadAllSettings();
    await loadEnabledActions();
    await loadCustomActions();
    await loadShortcuts();
    applyTranslations();
    setupNavigation();
    setupEventListeners();
    setupProviderListeners();
    renderActionsGrid();
    renderShortcutsList();
    refreshModels();

    // Initialiser le systeme de mise a jour (en dernier, non-bloquant)
    initUpdateSystem();
  } catch (error) {
    console.error('IA Helper Options: Erreur initialisation', error);
  }
});

// Appliquer les traductions a l'interface
function applyTranslations() {
  currentLang = config.interfaceLanguage || 'fr';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const translation = t(key, currentLang);
    if (translation && translation !== key) {
      el.textContent = translation;
    }
  });
}

// Charger tous les parametres
async function loadAllSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['config'], (result) => {
      config = { ...DEFAULT_CONFIG, ...result.config };

      // Remplir les champs
      if (elements.providerSelect) elements.providerSelect.value = config.provider || 'ollama';
      if (elements.apiUrl) elements.apiUrl.value = config.apiUrl || PROVIDERS[config.provider]?.defaultUrl || '';
      if (elements.apiKey) elements.apiKey.value = config.apiKey || '';
      if (elements.streamingEnabled) elements.streamingEnabled.checked = config.streamingEnabled !== false;
      if (elements.interfaceLanguage) elements.interfaceLanguage.value = config.interfaceLanguage || 'fr';
      if (elements.responseLanguage) elements.responseLanguage.value = config.responseLanguage || 'auto';

      updateProviderUI(config.provider);
      resolve();
    });
  });
}

// Charger les actions personnalisees
async function loadCustomActions() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['customActions'], (result) => {
      customActions = result.customActions || [];
      resolve();
    });
  });
}

// Mettre a jour l'UI selon le provider
function updateProviderUI(provider) {
  const providerConfig = PROVIDERS[provider];
  if (!providerConfig) return;

  // Afficher/masquer le champ API key
  if (elements.apiKeyGroup) {
    elements.apiKeyGroup.style.display = providerConfig.needsKey ? 'block' : 'none';
  }

  // Mettre a jour le label de l'URL
  if (elements.apiUrlLabel) {
    if (provider === 'ollama') {
      elements.apiUrlLabel.textContent = 'URL du serveur Ollama';
    } else if (provider === 'custom') {
      elements.apiUrlLabel.textContent = 'URL de l\'API (compatible OpenAI)';
    } else {
      elements.apiUrlLabel.textContent = `URL de l\'API ${providerConfig.name}`;
    }
  }

  // Pre-remplir l'URL par defaut si vide
  if (elements.apiUrl && !elements.apiUrl.value && providerConfig.defaultUrl) {
    elements.apiUrl.value = providerConfig.defaultUrl;
  }
}

// Listeners pour le changement de provider
function setupProviderListeners() {
  elements.providerSelect?.addEventListener('change', (e) => {
    const provider = e.target.value;
    const providerConfig = PROVIDERS[provider];

    // Mettre a jour l'URL par defaut
    if (elements.apiUrl && providerConfig?.defaultUrl) {
      elements.apiUrl.value = providerConfig.defaultUrl;
    }

    updateProviderUI(provider);

    // Mettre a jour les modeles par defaut
    if (providerConfig?.defaultModels) {
      elements.modelSelect.innerHTML = '<option value="">Selectionnez un modele</option>';
      providerConfig.defaultModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        elements.modelSelect.appendChild(option);
      });
    }
  });
}

// Navigation entre sections
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const sectionId = item.dataset.section;
      
      // Mettre a jour la nav
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // Afficher la section
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${sectionId}`).classList.add('active');
    });
  });
}

// Event listeners
function setupEventListeners() {
  // Test connexion
  document.getElementById('btn-test-connection')?.addEventListener('click', testConnection);

  // Rafraichir modeles
  document.getElementById('btn-refresh-models')?.addEventListener('click', refreshModels);

  // Sauvegarder connexion
  document.getElementById('btn-save-connection')?.addEventListener('click', saveConnectionSettings);

  // Reset
  document.getElementById('btn-reset')?.addEventListener('click', resetToDefaults);

  // Actions
  document.getElementById('btn-enable-all')?.addEventListener('click', () => toggleAllActions(true));
  document.getElementById('btn-disable-all')?.addEventListener('click', () => toggleAllActions(false));
  document.getElementById('btn-reset-actions')?.addEventListener('click', resetActionsToDefault);
  document.getElementById('btn-add-custom-action')?.addEventListener('click', showAddCustomActionModal);

  // Raccourcis
  document.getElementById('btn-add-shortcut')?.addEventListener('click', showAddShortcutModal);
  document.getElementById('btn-save-shortcuts')?.addEventListener('click', saveShortcuts);
  document.getElementById('shortcuts-enabled')?.addEventListener('change', (e) => {
    shortcutsEnabled = e.target.checked;
  });
  document.getElementById('default-translate-lang')?.addEventListener('change', (e) => {
    defaultTranslateLang = e.target.value;
  });
}

// Tester la connexion
async function testConnection() {
  const provider = elements.providerSelect?.value || 'ollama';
  const url = elements.apiUrl?.value.trim();
  const apiKey = elements.apiKey?.value.trim();
  const status = elements.connectionStatus;

  if (!url) {
    showStatus(status, 'Veuillez entrer une URL', 'error');
    return;
  }

  try {
    let testUrl, headers = {};

    if (provider === 'ollama') {
      testUrl = `${url}/api/tags`;
    } else if (provider === 'anthropic') {
      // Anthropic n'a pas d'endpoint de test simple
      showStatus(status, 'Cle API enregistree. Test lors de la premiere requete.', 'success');
      return;
    } else {
      testUrl = `${url}/models`;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(testUrl, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data = await response.json();
      const modelCount = data.models?.length || data.data?.length || 0;
      showStatus(status, `Connexion reussie ! ${modelCount} modele(s) disponible(s)`, 'success');
      await refreshModels();
    } else {
      showStatus(status, `Erreur: ${response.status} ${response.statusText}`, 'error');
    }
  } catch (error) {
    showStatus(status, `Impossible de se connecter: ${error.message}`, 'error');
  }
}

// Rafraichir la liste des modeles
async function refreshModels() {
  const provider = elements.providerSelect?.value || 'ollama';
  const url = elements.apiUrl?.value.trim();
  const apiKey = elements.apiKey?.value.trim();
  const providerConfig = PROVIDERS[provider];

  elements.modelSelect.innerHTML = '<option value="">Selectionnez un modele</option>';

  // Si le provider a des modeles par defaut, les utiliser
  if (providerConfig?.defaultModels && provider !== 'ollama') {
    providerConfig.defaultModels.forEach(model => {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      if (model === config.selectedModel) option.selected = true;
      elements.modelSelect.appendChild(option);
    });
    return;
  }

  try {
    let headers = {};
    let modelsUrl = url;

    if (provider === 'ollama') {
      modelsUrl = `${url}/api/tags`;
    } else {
      modelsUrl = `${url}/models`;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(modelsUrl, { headers });
    const data = await response.json();

    let models = [];
    if (provider === 'ollama') {
      models = data.models || [];
    } else {
      models = (data.data || []).map(m => ({ name: m.id }));
    }

    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.name || model.id;
      option.textContent = model.size ? `${model.name} (${formatSize(model.size)})` : model.name;
      if ((model.name || model.id) === config.selectedModel) option.selected = true;
      elements.modelSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Erreur lors du chargement des modeles:', error);
  }
}

// Formater la taille
function formatSize(bytes) {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}

// Afficher le status
function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `connection-status ${type}`;
}

// Sauvegarder les parametres de connexion
async function saveConnectionSettings() {
  const previousLang = config.interfaceLanguage;

  config.provider = elements.providerSelect?.value || 'ollama';
  config.apiUrl = elements.apiUrl?.value.trim() || '';
  config.apiKey = elements.apiKey?.value.trim() || '';
  config.selectedModel = elements.modelSelect?.value || '';
  config.streamingEnabled = elements.streamingEnabled?.checked !== false;
  config.interfaceLanguage = elements.interfaceLanguage?.value || 'fr';
  config.responseLanguage = elements.responseLanguage?.value || 'auto';

  await saveConfig();

  // Si la langue a change, appliquer les traductions
  if (previousLang !== config.interfaceLanguage) {
    currentLang = config.interfaceLanguage;
    applyTranslations();
    renderActionsGrid();
    showNotification('Langue changee. Parametres sauvegardes.', 'success');
  } else {
    showNotification('Parametres sauvegardes.', 'success');
  }
}

// Sauvegarder la configuration
async function saveConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ config }, resolve);
  });
}



// Reset aux valeurs par defaut
async function resetToDefaults() {
  if (confirm('Etes-vous sur de vouloir reinitialiser tous les parametres ?')) {
    await new Promise((resolve) => {
      chrome.storage.local.clear(resolve);
    });
    location.reload();
  }
}

// Initialiser les event listeners du modal action (pour ajouter action dans preset)
function setupModalListeners() {
  const modalClose = document.getElementById('modal-close');
  const modalCancel = document.getElementById('modal-cancel');
  const modalSave = document.getElementById('modal-save');
  const modalOverlay = document.getElementById('modal-overlay');

  if (modalClose) modalClose.addEventListener('click', closeActionModal);
  if (modalCancel) modalCancel.addEventListener('click', closeActionModal);
  if (modalSave) modalSave.addEventListener('click', saveActionToPreset);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') closeActionModal();
    });
  }
}

// Fermer le modal action
function closeActionModal() {
  const modal = document.getElementById('modal-overlay');
  if (modal) modal.classList.remove('active');
}

// Afficher une notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 10px;
    color: white;
    font-size: 14px;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
  `;

  switch (type) {
    case 'success':
      notification.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
      break;
    case 'error':
      notification.style.background = 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)';
      break;
    default:
      notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// ========== ACTIONS INDIVIDUELLES ==========

// Charger les actions activees
async function loadEnabledActions() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['enabledActions'], (result) => {
      enabledActions = result.enabledActions || [...DEFAULT_ENABLED_ACTIONS];
      resolve();
    });
  });
}

// Sauvegarder les actions activees
async function saveEnabledActions() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ enabledActions }, () => {
      chrome.runtime.sendMessage({ type: 'RELOAD_MENUS' });
      resolve();
    });
  });
}

// Rendre la grille des actions par categorie
function renderActionsGrid() {
  const categories = ['essential', 'practical', 'technical', 'analysis'];

  for (const category of categories) {
    const container = document.getElementById(`actions-${category}`);
    if (!container) continue;

    container.innerHTML = '';

    const actionsInCategory = Object.values(BASE_ACTIONS).filter(a => a.category === category);

    for (const action of actionsInCategory) {
      const isEnabled = enabledActions.includes(action.id);
      container.appendChild(createActionToggle(action, isEnabled));
    }
  }

  // Traductions
  renderTranslationsGrid();

  // Actions personnalisees
  renderCustomActionsGrid();
}

// Creer un toggle d'action
function createActionToggle(action, isEnabled, isCustom = false) {
  const toggle = document.createElement('label');
  toggle.className = `action-toggle ${isEnabled ? 'active' : ''}`;
  toggle.innerHTML = `
    <input type="checkbox" ${isEnabled ? 'checked' : ''} data-action-id="${action.id}">
    <span class="toggle-indicator"></span>
    <span class="action-info">
      <span class="action-name">${action.name}</span>
      <span class="action-desc">${action.description || ''}</span>
    </span>
    ${isCustom ? '<button class="btn-delete-action" data-id="' + action.id + '">X</button>' : ''}
  `;

  toggle.querySelector('input').addEventListener('change', (e) => {
    toggleAction(action.id, e.target.checked, isCustom);
    toggle.classList.toggle('active', e.target.checked);
  });

  if (isCustom) {
    toggle.querySelector('.btn-delete-action')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteCustomAction(action.id);
    });
  }

  return toggle;
}

// Rendre les traductions
function renderTranslationsGrid() {
  const container = document.getElementById('actions-translate');
  if (!container) return;

  container.innerHTML = '';

  for (const lang of TRANSLATE_LANGUAGES) {
    const actionId = `translate_${lang.code}`;
    const isEnabled = enabledTranslations.includes(lang.code);
    const action = { id: actionId, name: `Traduire en ${lang.name}`, description: lang.code.toUpperCase() };

    const toggle = document.createElement('label');
    toggle.className = `action-toggle ${isEnabled ? 'active' : ''}`;
    toggle.innerHTML = `
      <input type="checkbox" ${isEnabled ? 'checked' : ''} data-lang="${lang.code}">
      <span class="toggle-indicator"></span>
      <span class="action-info">
        <span class="action-name">${action.name}</span>
        <span class="action-desc">${action.description}</span>
      </span>
    `;

    toggle.querySelector('input').addEventListener('change', (e) => {
      toggleTranslation(lang.code, e.target.checked);
      toggle.classList.toggle('active', e.target.checked);
    });

    container.appendChild(toggle);
  }
}

// Activer/desactiver une traduction
function toggleTranslation(langCode, enabled) {
  if (enabled && !enabledTranslations.includes(langCode)) {
    enabledTranslations.push(langCode);
  } else if (!enabled) {
    enabledTranslations = enabledTranslations.filter(c => c !== langCode);
  }
  saveEnabledTranslations();
}

// Sauvegarder les traductions activees
async function saveEnabledTranslations() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ enabledTranslations }, resolve);
  });
}

// Rendre les actions personnalisees
function renderCustomActionsGrid() {
  const container = document.getElementById('actions-custom');
  if (!container) return;

  container.innerHTML = '';

  if (customActions.length === 0) {
    container.innerHTML = '<p class="empty-message">Aucune action personnalisee. Cliquez sur le bouton ci-dessous pour en creer une.</p>';
    return;
  }

  for (const action of customActions) {
    const isEnabled = enabledActions.includes(action.id);
    container.appendChild(createActionToggle(action, isEnabled, true));
  }
}

// Activer/desactiver toutes les actions
function toggleAllActions(enable) {
  if (enable) {
    enabledActions = [...Object.keys(BASE_ACTIONS), ...customActions.map(a => a.id)];
    enabledTranslations = TRANSLATE_LANGUAGES.map(l => l.code);
  } else {
    enabledActions = [];
    enabledTranslations = [];
  }
  saveEnabledActions();
  saveEnabledTranslations();
  renderActionsGrid();
  showNotification(enable ? 'Toutes les actions activees' : 'Toutes les actions desactivees', 'success');
}

// Reset actions par defaut
function resetActionsToDefault() {
  enabledActions = [...DEFAULT_ENABLED_ACTIONS];
  enabledTranslations = ['fr', 'en', 'es', 'de'];
  saveEnabledActions();
  saveEnabledTranslations();
  renderActionsGrid();
  showNotification('Actions par defaut restaurees', 'success');
}

// Activer/desactiver une action
function toggleAction(actionId, enabled, isCustom = false) {
  if (enabled && !enabledActions.includes(actionId)) {
    enabledActions.push(actionId);
  } else if (!enabled) {
    enabledActions = enabledActions.filter(id => id !== actionId);
  }
  saveEnabledActions();
}

// ========== ACTIONS PERSONNALISEES ==========

// Afficher le modal pour ajouter une action personnalisee
function showAddCustomActionModal() {
  // Supprimer un eventuel modal existant
  const existingModal = document.getElementById('custom-action-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'custom-action-modal';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Nouvelle action personnalisee</h3>
        <button class="modal-close" type="button">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Nom de l'action</label>
          <input type="text" class="custom-action-name-input" placeholder="Ex: Reformuler en langage juridique">
        </div>
        <div class="form-group">
          <label>Prompt</label>
          <textarea class="custom-action-prompt-input" rows="5" placeholder="Ex: Reformule ce texte en utilisant un langage juridique precis et formel."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel" type="button">Annuler</button>
        <button class="btn btn-primary modal-save" type="button">Creer</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Focus sur le premier champ
  const nameInput = modal.querySelector('.custom-action-name-input');
  const promptInput = modal.querySelector('.custom-action-prompt-input');
  setTimeout(() => nameInput.focus(), 100);

  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-cancel').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-save').addEventListener('click', () => {
    const name = nameInput.value.trim();
    const prompt = promptInput.value.trim();

    if (!name || !prompt) {
      showNotification('Veuillez remplir tous les champs', 'error');
      return;
    }

    const newAction = {
      id: 'custom_' + Date.now(),
      name,
      prompt,
      description: prompt.substring(0, 50) + '...',
      category: 'custom'
    };

    customActions.push(newAction);
    enabledActions.push(newAction.id);
    saveCustomActions();
    saveEnabledActions();
    renderActionsGrid();
    modal.remove();
    showNotification('Action personnalisee creee !', 'success');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Supprimer une action personnalisee
function deleteCustomAction(actionId) {
  if (!confirm('Supprimer cette action personnalisee ?')) return;

  customActions = customActions.filter(a => a.id !== actionId);
  enabledActions = enabledActions.filter(id => id !== actionId);

  // Supprimer aussi les raccourcis associes
  delete shortcuts[actionId];

  saveCustomActions();
  saveEnabledActions();
  saveShortcuts();
  renderActionsGrid();
  renderShortcutsList();
  showNotification('Action supprimee', 'success');
}

// Sauvegarder les actions personnalisees
async function saveCustomActions() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ customActions }, resolve);
  });
}

// ========== RACCOURCIS ==========

// Charger les raccourcis
async function loadShortcuts() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['shortcuts', 'shortcutsEnabled', 'defaultTranslateLang', 'enabledTranslations'], (result) => {
      shortcuts = result.shortcuts || { ...DEFAULT_SHORTCUTS };
      shortcutsEnabled = result.shortcutsEnabled !== false;
      defaultTranslateLang = result.defaultTranslateLang || 'en';
      enabledTranslations = result.enabledTranslations || ['fr', 'en', 'es', 'de'];

      document.getElementById('shortcuts-enabled').checked = shortcutsEnabled;
      document.getElementById('default-translate-lang').value = defaultTranslateLang;

      resolve();
    });
  });
}

// Rendre la liste des raccourcis
function renderShortcutsList() {
  const container = document.getElementById('shortcuts-list');
  if (!container) return;

  container.innerHTML = '';

  // Raccourcis existants
  for (const [actionId, shortcut] of Object.entries(shortcuts)) {
    const actionName = getActionName(actionId);
    const keyDisplay = formatShortcut(shortcut);

    const item = document.createElement('div');
    item.className = 'shortcut-item';
    item.innerHTML = `
      <div class="shortcut-info">
        <span class="shortcut-name">${actionName}</span>
      </div>
      <div class="shortcut-key-wrapper">
        <button class="shortcut-key-btn" data-action="${actionId}">
          <span class="key-display">${keyDisplay}</span>
        </button>
        <button class="btn btn-small btn-secondary btn-delete-shortcut" data-action="${actionId}">X</button>
      </div>
    `;

    item.querySelector('.shortcut-key-btn').addEventListener('click', (e) => {
      startRecordingShortcut(e.currentTarget, actionId);
    });

    item.querySelector('.btn-delete-shortcut').addEventListener('click', () => {
      delete shortcuts[actionId];
      renderShortcutsList();
    });

    container.appendChild(item);
  }

  if (Object.keys(shortcuts).length === 0) {
    container.innerHTML = '<p class="empty-message">Aucun raccourci configure. Cliquez sur le bouton ci-dessous pour en ajouter.</p>';
  }
}

// Obtenir le nom d'une action
function getActionName(actionId) {
  if (actionId === 'quickPrompt') return 'Prompt rapide';
  if (BASE_ACTIONS[actionId]) return BASE_ACTIONS[actionId].name;
  const customAction = customActions.find(a => a.id === actionId);
  if (customAction) return customAction.name;
  if (actionId.startsWith('translate_')) {
    const lang = TRANSLATE_LANGUAGES.find(l => l.code === actionId.replace('translate_', ''));
    return lang ? `Traduire en ${lang.name}` : actionId;
  }
  return actionId;
}

// Formater un raccourci pour affichage
function formatShortcut(shortcut) {
  const parts = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  parts.push(shortcut.key.toUpperCase());
  return parts.join(' + ');
}

// Commencer l'enregistrement d'un raccourci
function startRecordingShortcut(button, actionId) {
  button.classList.add('recording');
  button.querySelector('.key-display').textContent = 'Appuyez sur une touche...';

  const handler = (e) => {
    e.preventDefault();

    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

    shortcuts[actionId] = {
      key: e.key.toLowerCase(),
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      actionId,
      actionName: getActionName(actionId)
    };

    button.classList.remove('recording');
    button.querySelector('.key-display').textContent = formatShortcut(shortcuts[actionId]);
    document.removeEventListener('keydown', handler);
  };

  document.addEventListener('keydown', handler);
}

// Afficher le modal pour ajouter un raccourci
function showAddShortcutModal() {
  // Collecter toutes les actions disponibles
  const allActions = [
    { id: 'quickPrompt', name: 'Prompt rapide' },
    ...Object.values(BASE_ACTIONS).map(a => ({ id: a.id, name: a.name })),
    ...TRANSLATE_LANGUAGES.map(l => ({ id: `translate_${l.code}`, name: `Traduire en ${l.name}` })),
    ...customActions.map(a => ({ id: a.id, name: a.name }))
  ].filter(a => !shortcuts[a.id]); // Exclure ceux qui ont deja un raccourci

  if (allActions.length === 0) {
    showNotification('Toutes les actions ont deja un raccourci', 'info');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'shortcut-modal';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Ajouter un raccourci</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="shortcut-action">Action</label>
          <select id="shortcut-action">
            ${allActions.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Raccourci</label>
          <button class="shortcut-key-btn recording" id="new-shortcut-btn">
            <span class="key-display">Appuyez sur une touche...</span>
          </button>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel">Annuler</button>
        <button class="btn btn-primary modal-save" disabled>Ajouter</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  let newShortcut = null;
  const shortcutBtn = modal.querySelector('#new-shortcut-btn');
  const saveBtn = modal.querySelector('.modal-save');

  const keyHandler = (e) => {
    e.preventDefault();
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

    newShortcut = {
      key: e.key.toLowerCase(),
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey
    };

    shortcutBtn.classList.remove('recording');
    shortcutBtn.querySelector('.key-display').textContent = formatShortcut(newShortcut);
    saveBtn.disabled = false;
  };

  document.addEventListener('keydown', keyHandler);

  modal.querySelector('.modal-close').addEventListener('click', () => {
    document.removeEventListener('keydown', keyHandler);
    modal.remove();
  });
  modal.querySelector('.modal-cancel').addEventListener('click', () => {
    document.removeEventListener('keydown', keyHandler);
    modal.remove();
  });

  saveBtn.addEventListener('click', () => {
    const actionId = document.getElementById('shortcut-action').value;
    shortcuts[actionId] = {
      ...newShortcut,
      actionId,
      actionName: getActionName(actionId)
    };
    document.removeEventListener('keydown', keyHandler);
    modal.remove();
    renderShortcutsList();
    showNotification('Raccourci ajoute !', 'success');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.removeEventListener('keydown', keyHandler);
      modal.remove();
    }
  });
}

// Sauvegarder les raccourcis
async function saveShortcuts() {
  shortcutsEnabled = document.getElementById('shortcuts-enabled')?.checked !== false;
  defaultTranslateLang = document.getElementById('default-translate-lang')?.value || 'en';

  await new Promise((resolve) => {
    chrome.storage.local.set({ shortcuts, shortcutsEnabled, defaultTranslateLang }, resolve);
  });

  showNotification('Raccourcis sauvegardes !', 'success');
}

// Activer/desactiver un preset (legacy)
async function togglePreset(presetId, active) {
  if (active) {
    if (!activePresets.includes(presetId)) {
      activePresets.push(presetId);
    }
  } else {
    activePresets = activePresets.filter(id => id !== presetId);
  }

  await saveActivePresets();
  chrome.runtime.sendMessage({ type: 'RELOAD_MENUS' });
  showNotification(active ? 'Preset active !' : 'Preset desactive', 'success');
}

// Afficher les actions d'un preset (integre ou personnalise)
function showPresetActions(presetId, isCustom = false) {
  const container = document.getElementById('preset-actions-display');
  if (!container) return;

  let preset, actions;

  if (isCustom) {
    preset = customPresets.find(p => p.id === presetId);
    actions = preset?.actions || [];
  } else {
    preset = PROFESSIONAL_PRESETS[presetId];
    actions = preset?.actions || [];
  }

  if (!preset) {
    container.innerHTML = `<h3>${t('presetActions', currentLang)}</h3><p class="empty-state">Preset non trouve.</p>`;
    return;
  }

  let html = `<h3>${t('presetActions', currentLang)}: ${preset.name}</h3>`;
  html += '<div class="preset-actions-list">';

  for (const action of actions) {
    html += `
      <div class="preset-action-item">
        <span>${action.name}</span>
        <button class="btn btn-secondary btn-sm view-prompt-btn" data-preset="${presetId}" data-action="${action.id}" data-custom="${isCustom}">${t('viewPrompt', currentLang)}</button>
        <button class="btn btn-secondary btn-sm edit-prompt-btn" data-preset="${presetId}" data-action="${action.id}" data-custom="${isCustom}">${t('editPrompt', currentLang)}</button>
      </div>
    `;
  }

  html += '</div>';
  container.innerHTML = html;

  // Voir prompt
  container.querySelectorAll('.view-prompt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pId = btn.dataset.preset;
      const aId = btn.dataset.action;
      const custom = btn.dataset.custom === 'true';
      if (custom) {
        const cPreset = customPresets.find(p => p.id === pId);
        const action = cPreset?.actions.find(a => a.id === aId);
        if (action) showPromptModal(action.name, action.prompt);
      } else {
        viewPresetPrompt(pId, aId);
      }
    });
  });

  // Editer prompt
  container.querySelectorAll('.edit-prompt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pId = btn.dataset.preset;
      const aId = btn.dataset.action;
      const custom = btn.dataset.custom === 'true';
      if (custom) {
        editCustomPresetPrompt(pId, aId);
      } else {
        editIntegratedPresetPrompt(pId, aId);
      }
    });
  });
}

// Editer le prompt d'un preset integre (sauvegarde dans customPrompts)
async function editIntegratedPresetPrompt(presetId, actionId) {
  const preset = PROFESSIONAL_PRESETS[presetId];
  const action = preset?.actions.find(a => a.id === actionId);
  if (!action) return;

  // Charger les prompts personnalises
  const stored = await new Promise(resolve => {
    chrome.storage.local.get(['customPrompts'], resolve);
  });
  const customPrompts = stored.customPrompts || {};
  const currentPrompt = customPrompts[`${presetId}_${actionId}`] || action.prompt;

  showEditPromptModal(action.name, currentPrompt, async (newPrompt) => {
    customPrompts[`${presetId}_${actionId}`] = newPrompt;
    await new Promise(resolve => {
      chrome.storage.local.set({ customPrompts }, resolve);
    });
    showNotification(t('promptSaved', currentLang), 'success');
  });
}

// Voir le prompt d'une action de preset
function viewPresetPrompt(presetId, actionId) {
  const preset = PROFESSIONAL_PRESETS[presetId];
  const action = preset?.actions.find(a => a.id === actionId);

  if (action) {
    // Afficher dans une modal stylisee
    showPromptModal(action.name, action.prompt);
  }
}

// Modal pour afficher un prompt
function showPromptModal(title, prompt) {
  const existingModal = document.querySelector('.prompt-view-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.className = 'prompt-view-modal';
  modal.innerHTML = `
    <div class="prompt-view-content">
      <h3>${title}</h3>
      <pre>${prompt}</pre>
      <button class="btn btn-primary close-modal">Fermer</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// ========== PRESETS PERSONNALISES ==========

// Charger les presets personnalises
async function loadCustomPresets() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['customPresets'], (result) => {
      customPresets = result.customPresets || [];
      resolve();
    });
  });
}

// Sauvegarder les presets personnalises
async function saveCustomPresets() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ customPresets }, resolve);
  });
}

// Variables temporaires pour l'edition de preset
let currentPresetActions = [];
let editingPresetId = null;

// Afficher le modal pour creer un preset
function showAddPresetModal() {
  currentPresetActions = [];
  editingPresetId = null;

  document.getElementById('preset-name').value = '';
  document.getElementById('preset-description').value = '';
  document.getElementById('preset-actions-items').innerHTML = '<p class="empty-state">Aucune action. Cliquez sur "+ Ajouter action".</p>';
  document.querySelector('#modal-preset-overlay .modal-title').textContent = 'Creer un preset';

  document.getElementById('modal-preset-overlay').classList.add('active');
}

// Fermer le modal preset
function closePresetModal() {
  document.getElementById('modal-preset-overlay').classList.remove('active');
  currentPresetActions = [];
  editingPresetId = null;
}

// Setup des listeners pour le modal preset
function setupPresetModalListeners() {
  const closeBtn = document.getElementById('modal-preset-close');
  const cancelBtn = document.getElementById('modal-preset-cancel');
  const saveBtn = document.getElementById('modal-preset-save');
  const addActionBtn = document.getElementById('btn-add-preset-action');
  const overlay = document.getElementById('modal-preset-overlay');

  if (closeBtn) closeBtn.addEventListener('click', closePresetModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closePresetModal);
  if (saveBtn) saveBtn.addEventListener('click', saveCustomPreset);
  if (addActionBtn) addActionBtn.addEventListener('click', addActionToPresetEditor);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'modal-preset-overlay') closePresetModal();
    });
  }
}

// Ajouter une action dans l'editeur de preset
function addActionToPresetEditor() {
  const actionId = 'action_' + Date.now();
  currentPresetActions.push({ id: actionId, name: '', prompt: '', context: 'selection' });
  renderPresetActionsEditor();
}

// Rendre l'editeur d'actions du preset
function renderPresetActionsEditor() {
  const container = document.getElementById('preset-actions-items');

  if (currentPresetActions.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucune action. Cliquez sur "+ Ajouter action".</p>';
    return;
  }

  container.innerHTML = currentPresetActions.map((action, index) => `
    <div class="preset-action-edit-item" data-index="${index}">
      <input type="text" placeholder="Nom de l'action" value="${action.name}" class="action-name-input">
      <textarea placeholder="Prompt systeme..." class="action-prompt-input">${action.prompt}</textarea>
      <button class="btn-remove" data-index="${index}">X</button>
    </div>
  `).join('');

  // Event listeners pour les inputs
  container.querySelectorAll('.preset-action-edit-item').forEach((item, index) => {
    item.querySelector('.action-name-input').addEventListener('input', (e) => {
      currentPresetActions[index].name = e.target.value;
    });
    item.querySelector('.action-prompt-input').addEventListener('input', (e) => {
      currentPresetActions[index].prompt = e.target.value;
    });
    item.querySelector('.btn-remove').addEventListener('click', () => {
      currentPresetActions.splice(index, 1);
      renderPresetActionsEditor();
    });
  });
}

// Sauvegarder un preset personnalise
async function saveCustomPreset() {
  const name = document.getElementById('preset-name').value.trim();
  const description = document.getElementById('preset-description').value.trim();

  if (!name) {
    showNotification('Veuillez entrer un nom pour le preset', 'error');
    return;
  }

  if (currentPresetActions.length === 0) {
    showNotification('Ajoutez au moins une action', 'error');
    return;
  }

  // Valider les actions
  for (const action of currentPresetActions) {
    if (!action.name.trim() || !action.prompt.trim()) {
      showNotification('Toutes les actions doivent avoir un nom et un prompt', 'error');
      return;
    }
  }

  const presetId = editingPresetId || 'custom_preset_' + Date.now();

  const preset = {
    id: presetId,
    name,
    description,
    actions: currentPresetActions.map(a => ({
      id: a.id,
      name: a.name.trim(),
      prompt: a.prompt.trim(),
      context: a.context || 'selection'
    })),
    enabled: true
  };

  if (editingPresetId) {
    const index = customPresets.findIndex(p => p.id === editingPresetId);
    if (index !== -1) customPresets[index] = preset;
  } else {
    customPresets.push(preset);
  }

  await saveCustomPresets();
  closePresetModal();
  renderAllPresetsGrid();
  showNotification(editingPresetId ? t('presetModified', currentLang) : t('presetCreated', currentLang), 'success');
  chrome.runtime.sendMessage({ type: 'RELOAD_MENUS' });
}

// Editer un preset personnalise
function editCustomPreset(presetId) {
  const preset = customPresets.find(p => p.id === presetId);
  if (!preset) return;

  editingPresetId = presetId;
  currentPresetActions = preset.actions.map(a => ({ ...a }));

  document.getElementById('preset-name').value = preset.name;
  document.getElementById('preset-description').value = preset.description || '';
  document.querySelector('#modal-preset-overlay .modal-title').textContent = t('editPreset', currentLang);

  renderPresetActionsEditor();
  document.getElementById('modal-preset-overlay').classList.add('active');
}

// Personnaliser un preset integre (copie comme preset personnalise)
function customizeIntegratedPreset(presetId) {
  const preset = PROFESSIONAL_PRESETS[presetId];
  if (!preset) return;

  // Creer un nouveau preset personnalise base sur l'integre
  editingPresetId = null; // Nouveau preset
  currentPresetActions = preset.actions.map(a => ({
    id: a.id + '_custom_' + Date.now(),
    name: a.name,
    prompt: a.prompt,
    context: a.context || 'selection'
  }));

  document.getElementById('preset-name').value = preset.name + ' (perso)';
  document.getElementById('preset-description').value = preset.description || '';
  document.querySelector('#modal-preset-overlay .modal-title').textContent = t('customizePreset', currentLang);

  renderPresetActionsEditor();
  document.getElementById('modal-preset-overlay').classList.add('active');
}

// Editer le prompt d'une action de preset personnalise
function editCustomPresetPrompt(presetId, actionId) {
  const preset = customPresets.find(p => p.id === presetId);
  const action = preset?.actions.find(a => a.id === actionId);
  if (!action) return;

  showEditPromptModal(action.name, action.prompt, async (newPrompt) => {
    action.prompt = newPrompt;
    await saveCustomPresets();
    showNotification(t('promptSaved', currentLang), 'success');
    showCustomPresetActions(presetId);
  });
}

// Modal pour editer un prompt
function showEditPromptModal(title, prompt, onSave) {
  const existingModal = document.querySelector('.prompt-edit-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.className = 'prompt-edit-modal prompt-view-modal';
  modal.innerHTML = `
    <div class="prompt-view-content">
      <h3>${t('editPrompt', currentLang)}: ${title}</h3>
      <textarea id="edit-prompt-textarea" rows="10" style="width:100%; font-family: monospace; resize: vertical;">${prompt}</textarea>
      <div style="display: flex; gap: 10px; margin-top: 15px;">
        <button class="btn btn-secondary cancel-edit">${t('cancel', currentLang)}</button>
        <button class="btn btn-primary save-edit">${t('save', currentLang)}</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.cancel-edit').addEventListener('click', () => modal.remove());
  modal.querySelector('.save-edit').addEventListener('click', () => {
    const newPrompt = document.getElementById('edit-prompt-textarea').value;
    onSave(newPrompt);
    modal.remove();
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Supprimer un preset personnalise
async function deleteCustomPreset(presetId) {
  if (!confirm('Supprimer ce preset ?')) return;

  customPresets = customPresets.filter(p => p.id !== presetId);
  await saveCustomPresets();

  // Vider l'affichage des actions
  const container = document.getElementById('preset-actions-display');
  if (container) {
    container.innerHTML = `<h3>${t('presetActions', currentLang)}</h3><p class="empty-state">${t('clickPresetToSee', currentLang)}</p>`;
  }

  renderAllPresetsGrid();
  showNotification(t('presetDeleted', currentLang), 'success');
  chrome.runtime.sendMessage({ type: 'RELOAD_MENUS' });
}

// Fonction placeholder pour sauvegarder action dans preset (depuis modal action)
function saveActionToPreset() {
  // Cette fonction est utilisee quand on ajoute une action depuis le modal simple
  // Pour l'instant on ferme juste le modal
  closeActionModal();
}

// ============================================
// SYSTEME DE MISE A JOUR
// ============================================

function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

async function checkForUpdates() {
  const updateStatus = document.getElementById('update-status');
  const updateCard = document.getElementById('update-card');
  const updateBanner = document.getElementById('update-banner');

  if (updateStatus) {
    updateStatus.textContent = 'Verification en cours...';
  }

  try {
    const response = await fetch(VERSION_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error('Network error');

    const data = await response.json();
    const currentVersion = VERSION;

    if (compareVersions(data.version, currentVersion) > 0) {
      // Mise a jour disponible
      if (updateStatus) {
        updateStatus.innerHTML = `<strong style="color: var(--success);">Nouvelle version ${data.version} disponible!</strong><br><small>${data.releaseNotes || ''}</small>`;
      }
      if (updateCard) {
        updateCard.classList.add('update-available');
      }
      if (updateBanner) {
        updateBanner.style.display = 'flex';
        document.getElementById('update-version').textContent = `v${data.version}`;
        document.getElementById('update-link').href = data.downloadUrl || 'https://github.com/Gohanado/ia-helper/releases/latest';
      }

      // Sauvegarder l'info de mise a jour
      await chrome.storage.local.set({
        updateAvailable: {
          version: data.version,
          downloadUrl: data.downloadUrl,
          releaseNotes: data.releaseNotes
        }
      });
    } else {
      if (updateStatus) {
        updateStatus.textContent = 'Vous avez la derniere version.';
      }
      if (updateBanner) {
        updateBanner.style.display = 'none';
      }
      await chrome.storage.local.remove(['updateAvailable']);
    }

    // Sauvegarder le timestamp de verification
    await chrome.storage.local.set({ lastUpdateCheck: Date.now() });

  } catch (error) {
    console.error('Erreur verification mise a jour:', error);
    if (updateStatus) {
      updateStatus.textContent = 'Impossible de verifier les mises a jour.';
    }
  }
}

async function loadUpdateStatus() {
  // Afficher la version courante
  const versionEl = document.getElementById('current-version');
  const aboutVersionEl = document.getElementById('about-version');
  if (versionEl) versionEl.textContent = `v${VERSION}`;
  if (aboutVersionEl) aboutVersionEl.textContent = `Version ${VERSION}`;

  // Verifier si une mise a jour est deja connue
  const result = await chrome.storage.local.get(['updateAvailable', 'lastUpdateCheck']);

  if (result.updateAvailable) {
    const updateBanner = document.getElementById('update-banner');
    const updateStatus = document.getElementById('update-status');
    const updateCard = document.getElementById('update-card');

    if (updateBanner) {
      updateBanner.style.display = 'flex';
      document.getElementById('update-version').textContent = `v${result.updateAvailable.version}`;
      document.getElementById('update-link').href = result.updateAvailable.downloadUrl || 'https://github.com/Gohanado/ia-helper/releases/latest';
    }
    if (updateStatus) {
      updateStatus.innerHTML = `<strong style="color: var(--success);">Nouvelle version ${result.updateAvailable.version} disponible!</strong>`;
    }
    if (updateCard) {
      updateCard.classList.add('update-available');
    }
  }

  // Verifier automatiquement si derniere verification > 24h
  const lastCheck = result.lastUpdateCheck || 0;
  const dayInMs = 24 * 60 * 60 * 1000;

  if (Date.now() - lastCheck > dayInMs) {
    checkForUpdates();
  }
}

// Initialiser les mises a jour (appele depuis le DOMContentLoaded principal)
function initUpdateSystem() {
  const btnCheckUpdate = document.getElementById('btn-check-update');
  if (btnCheckUpdate) {
    btnCheckUpdate.addEventListener('click', () => {
      checkForUpdates();
    });
  }

  // Charger le statut des mises a jour
  loadUpdateStatus();
}
