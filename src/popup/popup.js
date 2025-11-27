// Popup Script - IA Helper v3 - Professional Redesign
import { TRANSLATIONS } from '../i18n/translations.js';

// Langue courante
let currentLang = 'fr';

// Fonction de traduction
function t(key) {
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.fr[key] || key;
}

// Appliquer les traductions
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.title = t(key);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Charger la configuration
  const config = await loadConfig();
  currentLang = config.interfaceLanguage || 'fr';

  // Appliquer les traductions
  applyTranslations();

  // Afficher la version
  const versionEl = document.getElementById('version');
  if (versionEl) {
    versionEl.textContent = 'v' + chrome.runtime.getManifest().version;
  }

  // Elements
  const statusIndicator = document.getElementById('status-indicator');
  const statusDot = statusIndicator?.querySelector('.status-dot');
  const statusText = statusIndicator?.querySelector('.status-text');
  const providerBadge = document.getElementById('provider-badge');
  const modelNameEl = document.getElementById('model-name');
  const promptInput = document.getElementById('quick-prompt-input');
  const sendBtn = document.getElementById('send-prompt-btn');
  const moreLangsBtn = document.getElementById('more-langs-btn');
  const langPillsExtended = document.getElementById('lang-pills-extended');

  // Afficher les infos du provider
  const providerName = getProviderDisplayName(config.provider);
  if (providerBadge) providerBadge.textContent = providerName;
  if (modelNameEl) modelNameEl.textContent = config.selectedModel || t('notConfigured');

  // Verifier la connexion
  await checkConnection(config);

  // Toggle more languages
  if (moreLangsBtn && langPillsExtended) {
    moreLangsBtn.addEventListener('click', () => {
      const isVisible = langPillsExtended.style.display !== 'none';
      langPillsExtended.style.display = isVisible ? 'none' : 'flex';
      moreLangsBtn.textContent = isVisible ? '...' : 'x';
    });
  }

  // Quick prompt - send on Enter (without Shift)
  if (promptInput) {
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendQuickPrompt();
      }
    });
  }

  // Send button
  if (sendBtn) {
    sendBtn.addEventListener('click', sendQuickPrompt);
  }

  // Action buttons
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      executeAction(btn.dataset.action);
    });
  });

  // Page action buttons
  document.querySelectorAll('.page-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      executeAction(btn.dataset.action, null, 'quick');
    });
  });

  // Language pills
  document.querySelectorAll('.lang-pill[data-lang]').forEach(pill => {
    pill.addEventListener('click', () => {
      executeAction('translate', pill.dataset.lang);
    });
  });

  // Footer buttons
  document.getElementById('btn-options')?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('btn-shortcuts')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });

  // === FONCTIONS ===

  async function loadConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['config'], (result) => {
        resolve(result.config || {
          provider: 'ollama',
          apiUrl: 'http://localhost:11434',
          selectedModel: '',
          interfaceLanguage: 'fr'
        });
      });
    });
  }

  function getProviderDisplayName(provider) {
    const names = {
      ollama: 'Ollama',
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      groq: 'Groq',
      openrouter: 'OpenRouter'
    };
    return names[provider] || provider || 'Ollama';
  }

  async function checkConnection(config) {
    if (!statusDot || !statusText) return;

    try {
      let testUrl = config.apiUrl || 'http://localhost:11434';

      // Adapter l'endpoint selon le provider
      if (config.provider === 'ollama') {
        testUrl += '/api/tags';
      } else if (config.provider === 'openai' || config.provider === 'groq' || config.provider === 'openrouter') {
        testUrl += '/models';
      } else {
        // Pour Anthropic, on ne peut pas vraiment tester sans faire un appel
        statusDot.classList.add('connected');
        statusText.textContent = t('ready');
        return;
      }

      const headers = {};
      if (config.apiKey && config.provider !== 'ollama') {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const response = await fetch(testUrl, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        statusDot.classList.add('connected');
        statusDot.classList.remove('error');
        statusText.textContent = t('ready');
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      statusDot.classList.add('error');
      statusDot.classList.remove('connected');
      statusText.textContent = t('offline');
    }
  }

  async function sendQuickPrompt() {
    const prompt = promptInput?.value?.trim();
    if (!prompt) return;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    chrome.tabs.sendMessage(tab.id, {
      type: 'EXECUTE_ACTION',
      actionType: 'custom_prompt',
      customPrompt: prompt,
      selectedText: '',
      isEditable: false
    });

    window.close();
  }

  async function executeAction(actionId, targetLanguage = null, actionType = 'selection') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    chrome.tabs.sendMessage(tab.id, {
      type: 'EXECUTE_ACTION',
      actionType: actionType,
      actionId: actionId,
      targetLanguage: targetLanguage,
      selectedText: '',
      isEditable: false
    });

    window.close();
  }
});
