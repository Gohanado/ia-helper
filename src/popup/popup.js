// Popup Script - IA Helper

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const statusIndicator = document.getElementById('status-indicator');
  const statusDot = statusIndicator.querySelector('.status-dot');
  const statusText = statusIndicator.querySelector('.status-text');
  const serverUrl = document.getElementById('server-url');
  const modelName = document.getElementById('model-name');
  const translateMenu = document.getElementById('translate-menu');
  const quickActions = document.querySelector('.quick-actions');

  // Charger la configuration
  const config = await loadConfig();
  
  // Afficher les infos
  serverUrl.textContent = config.ollamaUrl || 'Non configure';
  modelName.textContent = config.selectedModel || 'Non selectionne';

  // Verifier la connexion
  await checkConnection(config.ollamaUrl);

  // Event Listeners - Actions rapides
  document.getElementById('btn-correct').addEventListener('click', () => {
    executeAction('correct_errors');
  });

  document.getElementById('btn-translate').addEventListener('click', () => {
    quickActions.classList.add('hidden');
    translateMenu.classList.remove('hidden');
  });

  document.getElementById('btn-summarize').addEventListener('click', () => {
    executeAction('summarize');
  });

  document.getElementById('btn-mail').addEventListener('click', () => {
    executeAction('reformat_mail_pro');
  });

  // Retour du menu traduction
  document.getElementById('btn-back').addEventListener('click', () => {
    translateMenu.classList.add('hidden');
    quickActions.classList.remove('hidden');
  });

  // Boutons de langue
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      executeAction('translate', lang);
    });
  });

  // Actions Pro
  document.getElementById('btn-ticket').addEventListener('click', () => {
    executeAction('summarize_ticket', null, 'pro');
  });

  document.getElementById('btn-chronology').addEventListener('click', () => {
    executeAction('ticket_chronology', null, 'pro');
  });

  // Footer buttons
  document.getElementById('btn-options').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('btn-help').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/ia-helper/docs' });
  });

  // Fonctions
  async function loadConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['config'], (result) => {
        resolve(result.config || {
          ollamaUrl: 'http://localhost:11434',
          selectedModel: ''
        });
      });
    });
  }

  async function checkConnection(url) {
    try {
      const response = await fetch(`${url}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        statusDot.classList.add('connected');
        statusDot.classList.remove('error');
        statusText.textContent = 'Connecte';
      } else {
        throw new Error('Erreur de connexion');
      }
    } catch (error) {
      statusDot.classList.add('error');
      statusDot.classList.remove('connected');
      statusText.textContent = 'Deconnecte';
    }
  }

  async function executeAction(actionId, targetLanguage = null, actionType = 'selection') {
    // Obtenir l'onglet actif
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      console.error('Aucun onglet actif');
      return;
    }

    // Envoyer le message au content script
    chrome.tabs.sendMessage(tab.id, {
      type: 'EXECUTE_ACTION',
      actionType: actionType,
      actionId: actionId,
      targetLanguage: targetLanguage,
      selectedText: '',
      isEditable: false
    });

    // Fermer la popup
    window.close();
  }
});

