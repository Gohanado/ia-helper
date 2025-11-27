// Popup Script - IA Helper v2

document.addEventListener('DOMContentLoaded', async () => {
  // Afficher la version depuis le manifest
  const versionEl = document.querySelector('.version');
  if (versionEl) {
    versionEl.textContent = 'v' + chrome.runtime.getManifest().version;
  }

  // Elements
  const statusBadge = document.getElementById('status-badge');
  const statusDot = statusBadge.querySelector('.status-dot');
  const statusText = statusBadge.querySelector('.status-text');
  const serverUrlEl = document.getElementById('server-url');
  const modelNameEl = document.getElementById('model-name');
  const modelDisplay = document.getElementById('model-display');
  const presetsList = document.getElementById('presets-list');

  // Charger la configuration et les presets actifs
  const config = await loadConfig();
  const activePresets = await loadActivePresets();

  // Afficher les infos
  const serverHost = (config.ollamaUrl || 'http://localhost:11434').replace('http://', '').replace('https://', '');
  serverUrlEl.textContent = serverHost;
  modelNameEl.textContent = config.selectedModel || 'Non selectionne';
  modelDisplay.textContent = `Modele: ${config.selectedModel || '...'}`;

  // Verifier la connexion
  await checkConnection(config.ollamaUrl);

  // Charger les presets actifs dans l'onglet
  await renderActivePresets(activePresets);

  // Tabs navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all tabs and contents
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      // Add active to clicked tab and corresponding content
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // Action cards (main actions)
  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', () => {
      executeAction(card.dataset.action);
    });
  });

  // Page action buttons (actions sur la page entiere)
  document.querySelectorAll('.page-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      executeAction(btn.dataset.action, null, 'quick');
    });
  });

  // Language cards
  document.querySelectorAll('.lang-card').forEach(card => {
    card.addEventListener('click', () => {
      executeAction('translate', card.dataset.lang);
    });
  });

  // Footer buttons
  document.getElementById('btn-options').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('btn-help').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/Gohanado/ia-helper/blob/main/docs/README.md' });
  });

  // === FONCTIONS ===

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

  async function loadActivePresets() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['activePresets', 'customPresets'], (result) => {
        // Presets par defaut si aucun n'est configure
        const defaultActive = ['student', 'personal_assistant', 'writer', 'developer'];
        const active = result.activePresets || defaultActive;
        const custom = result.customPresets || [];
        resolve({ active, custom });
      });
    });
  }

  async function renderActivePresets(presetsData) {
    const { active, custom } = presetsData;

    // Importer les presets integres
    const { PROFESSIONAL_PRESETS } = await import('../config/presets.js');

    presetsList.innerHTML = '';

    // Afficher les presets actifs
    for (const presetId of active) {
      const preset = PROFESSIONAL_PRESETS[presetId];
      if (preset) {
        const item = createPresetItem(preset);
        presetsList.appendChild(item);
      }
    }

    // Afficher les presets custom
    for (const customPreset of custom) {
      const item = createPresetItem(customPreset, true);
      presetsList.appendChild(item);
    }

    if (presetsList.children.length === 0) {
      presetsList.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.4);font-size:11px;padding:20px;">Aucun preset actif. Activez-en dans les Options.</p>';
    }
  }

  function createPresetItem(preset, isCustom = false) {
    const item = document.createElement('div');
    item.className = 'preset-item';
    item.dataset.presetId = preset.id;
    item.innerHTML = `
      <div class="preset-icon">${getPresetIcon(preset.icon)}</div>
      <div class="preset-info">
        <div class="preset-name">${preset.name}</div>
        <div class="preset-actions-count">${preset.actions?.length || 0} actions</div>
      </div>
      <span class="preset-arrow">></span>
    `;

    item.addEventListener('click', () => {
      showPresetActions(preset, isCustom);
    });

    return item;
  }

  function getPresetIcon(iconName) {
    const icons = {
      'headset': 'HS', 'users': 'US', 'briefcase': 'BR', 'code': '<>', 'pen': 'WR',
      'graduation-cap': 'ST', 'search': 'RE', 'gavel': 'JU', 'bullhorn': 'MK',
      'box': 'PM', 'palette': 'UX', 'chart-bar': 'DA', 'comments': 'CM',
      'chalkboard': 'TR', 'language': 'LA', 'newspaper': 'JO', 'laptop': 'FR',
      'heartbeat': 'HC', 'shopping-cart': 'EC', 'pen-fancy': 'CW', 'video': 'VD',
      'user-tie': 'PA'
    };
    return icons[iconName] || iconName?.substring(0, 2).toUpperCase() || '??';
  }

  async function showPresetActions(preset, isCustom) {
    // Creer un overlay pour afficher les actions du preset
    const overlay = document.createElement('div');
    overlay.className = 'preset-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%);
      padding: 12px 14px; z-index: 100; overflow-y: auto;
    `;

    let actionsHTML = preset.actions.map(action => `
      <button class="page-action-btn preset-action-btn" data-action-id="${action.id}" data-prompt="${encodeURIComponent(action.prompt)}">
        <span class="btn-icon">${action.name.substring(0, 2).toUpperCase()}</span>
        <span>${action.name}</span>
      </button>
    `).join('');

    overlay.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <button id="back-to-presets" style="background:rgba(255,255,255,0.1);border:none;color:#fff;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px;">< Retour</button>
        <h3 style="font-size:14px;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${preset.name}</h3>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">${actionsHTML}</div>
    `;

    document.body.appendChild(overlay);

    // Back button
    overlay.querySelector('#back-to-presets').addEventListener('click', () => {
      overlay.remove();
    });

    // Action buttons
    overlay.querySelectorAll('.preset-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = decodeURIComponent(btn.dataset.prompt);
        executePresetAction(preset.id, btn.dataset.actionId, prompt);
        overlay.remove();
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
        statusText.textContent = 'OK';
      } else {
        throw new Error('Erreur');
      }
    } catch (error) {
      statusDot.classList.add('error');
      statusDot.classList.remove('connected');
      statusText.textContent = 'Off';
    }
  }

  async function executeAction(actionId, targetLanguage = null, actionType = 'selection') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      console.error('Aucun onglet actif');
      return;
    }

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

  async function executePresetAction(presetId, actionId, prompt) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      console.error('Aucun onglet actif');
      return;
    }

    chrome.tabs.sendMessage(tab.id, {
      type: 'EXECUTE_ACTION',
      actionType: 'preset',
      presetId: presetId,
      actionId: actionId,
      presetPrompt: prompt,
      selectedText: '',
      isEditable: false
    });

    window.close();
  }
});

