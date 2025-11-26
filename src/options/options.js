// Options Page Script - IA Helper

import { DEFAULT_CONFIG, INPUT_ACTIONS, SELECTION_ACTIONS, PRO_ACTIONS } from '../config/default-config.js';
import { SYSTEM_PROMPTS } from '../config/prompts.js';
import { PROFESSIONAL_PRESETS, PRESET_LIST } from '../config/presets.js';

// Configuration actuelle
let config = { ...DEFAULT_CONFIG };
let inputActions = [...INPUT_ACTIONS];
let selectionActions = [...SELECTION_ACTIONS];
let proActions = [...PRO_ACTIONS];
let customPrompts = {};
let activePresets = [];

// Elements DOM
const elements = {
  ollamaUrl: document.getElementById('ollama-url'),
  modelSelect: document.getElementById('model-select'),
  streamingEnabled: document.getElementById('streaming-enabled'),
  interfaceLanguage: document.getElementById('interface-language'),
  responseLanguage: document.getElementById('response-language'),
  connectionStatus: document.getElementById('connection-status'),
  inputActionsList: document.getElementById('input-actions-list'),
  selectionActionsList: document.getElementById('selection-actions-list'),
  proActionsList: document.getElementById('pro-actions-list'),
  promptsEditor: document.getElementById('prompts-editor')
};

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
  await loadAllSettings();
  await loadCustomActions();
  await loadActivePresets();
  setupNavigation();
  setupEventListeners();
  setupModalListeners();
  renderAllSections();
  renderCustomActionsList();
  renderPresetsGrid();
});

// Charger tous les parametres
async function loadAllSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get([
      'config',
      'inputActions',
      'selectionActions',
      'proActions',
      'customPrompts'
    ], (result) => {
      config = result.config || DEFAULT_CONFIG;
      inputActions = result.inputActions || INPUT_ACTIONS;
      selectionActions = result.selectionActions || SELECTION_ACTIONS;
      proActions = result.proActions || PRO_ACTIONS;
      customPrompts = result.customPrompts || {};
      
      // Remplir les champs
      elements.ollamaUrl.value = config.ollamaUrl || '';
      elements.streamingEnabled.checked = config.streamingEnabled !== false;
      elements.interfaceLanguage.value = config.interfaceLanguage || 'fr';
      elements.responseLanguage.value = config.responseLanguage || 'auto';

      resolve();
    });
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
  document.getElementById('btn-test-connection').addEventListener('click', testConnection);
  
  // Rafraichir modeles
  document.getElementById('btn-refresh-models').addEventListener('click', refreshModels);
  
  // Sauvegarder connexion
  document.getElementById('btn-save-connection').addEventListener('click', saveConnectionSettings);
  
  // Reset
  document.getElementById('btn-reset').addEventListener('click', resetToDefaults);
  
  // Ajouter action personnalisee
  document.getElementById('btn-add-custom').addEventListener('click', showAddCustomActionModal);
}

// Tester la connexion
async function testConnection() {
  const url = elements.ollamaUrl.value.trim();
  const status = elements.connectionStatus;
  
  if (!url) {
    showStatus(status, 'Veuillez entrer une URL', 'error');
    return;
  }

  try {
    const response = await fetch(`${url}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      const modelCount = data.models?.length || 0;
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
  const url = elements.ollamaUrl.value.trim();
  
  try {
    const response = await fetch(`${url}/api/tags`);
    const data = await response.json();
    
    elements.modelSelect.innerHTML = '<option value="">Selectionnez un modele</option>';
    
    if (data.models && data.models.length > 0) {
      data.models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.name;
        option.textContent = `${model.name} (${formatSize(model.size)})`;
        if (model.name === config.selectedModel) {
          option.selected = true;
        }
        elements.modelSelect.appendChild(option);
      });
    }
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

  config.ollamaUrl = elements.ollamaUrl.value.trim();
  config.selectedModel = elements.modelSelect.value;
  config.streamingEnabled = elements.streamingEnabled.checked;
  config.interfaceLanguage = elements.interfaceLanguage.value;
  config.responseLanguage = elements.responseLanguage.value;

  await saveConfig();

  // Si la langue a change, afficher un message et proposer de recharger
  if (previousLang !== config.interfaceLanguage) {
    showNotification('Langue modifiee - L\'interface sera traduite dans une prochaine version. Parametres sauvegardes !', 'success');
  } else {
    showNotification('Parametres sauvegardes !', 'success');
  }
}

// Sauvegarder la configuration
async function saveConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ config }, resolve);
  });
}

// Render toutes les sections
function renderAllSections() {
  renderActionsList(elements.inputActionsList, inputActions, 'input');
  renderActionsList(elements.selectionActionsList, selectionActions, 'selection');
  renderActionsList(elements.proActionsList, proActions, 'pro');
  renderPromptsEditor();
}

// Rendre une liste d'actions
function renderActionsList(container, actions, type) {
  container.innerHTML = '';

  actions.forEach((action, index) => {
    const item = document.createElement('div');
    item.className = 'action-item';
    item.innerHTML = `
      <div class="action-info" data-action-id="${action.id}" title="Cliquer pour editer le prompt">
        <div class="action-icon">${action.name.charAt(0)}</div>
        <div>
          <div class="action-name">${action.name}</div>
          <div class="action-category">${action.category || 'General'}</div>
        </div>
        <span class="edit-hint">Editer</span>
      </div>
      <label class="toggle-label" onclick="event.stopPropagation()">
        <input type="checkbox" ${action.enabled ? 'checked' : ''} data-type="${type}" data-index="${index}">
        <span class="toggle-switch"></span>
      </label>
    `;

    // Event listener pour le toggle
    item.querySelector('input').addEventListener('change', (e) => {
      e.stopPropagation();
      toggleAction(type, index, e.target.checked);
    });

    // Event listener pour naviguer vers l'editeur de prompt
    item.querySelector('.action-info').addEventListener('click', () => {
      navigateToPrompt(action.id);
    });

    container.appendChild(item);
  });
}

// Naviguer vers l'editeur de prompt d'une action
function navigateToPrompt(actionId) {
  // Activer l'onglet Prompts
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelector('[data-section="prompts"]').classList.add('active');

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('section-prompts').classList.add('active');

  // Ouvrir l'accordeon correspondant et scroller
  setTimeout(() => {
    const promptItem = document.getElementById(`prompt-item-${actionId}`);
    if (promptItem) {
      // Ouvrir l'accordeon
      promptItem.classList.add('open');
      // Scroller vers l'element
      promptItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Effet de highlight
      promptItem.classList.add('highlight');
      setTimeout(() => promptItem.classList.remove('highlight'), 1500);
    }
  }, 100);
}

// Toggle une action
async function toggleAction(type, index, enabled) {
  let actions;
  let storageKey;

  switch (type) {
    case 'input':
      actions = inputActions;
      storageKey = 'inputActions';
      break;
    case 'selection':
      actions = selectionActions;
      storageKey = 'selectionActions';
      break;
    case 'pro':
      actions = proActions;
      storageKey = 'proActions';
      break;
  }

  actions[index].enabled = enabled;

  await new Promise((resolve) => {
    chrome.storage.local.set({ [storageKey]: actions }, resolve);
  });
}

// Render l'editeur de prompts en accordeon
function renderPromptsEditor() {
  const container = elements.promptsEditor;
  container.innerHTML = '';

  // Grouper par type
  const groups = [
    { type: 'input', title: 'Actions d\'edition', actions: inputActions },
    { type: 'selection', title: 'Actions de selection', actions: selectionActions },
    { type: 'pro', title: 'Actions Pro', actions: proActions }
  ];

  groups.forEach(group => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'prompt-group';
    groupDiv.innerHTML = `<h3 class="prompt-group-title">${group.title}</h3>`;

    group.actions.forEach(action => {
      const defaultPrompt = SYSTEM_PROMPTS[action.id] || '';
      const customPrompt = customPrompts[action.id] || '';
      const isCustomized = customPrompt && customPrompt !== defaultPrompt;

      const item = document.createElement('div');
      item.className = 'prompt-item accordion';
      item.id = `prompt-item-${action.id}`;
      item.innerHTML = `
        <div class="prompt-header accordion-header">
          <div class="prompt-header-left">
            <span class="accordion-icon">+</span>
            <span class="prompt-title">${action.name}</span>
            ${isCustomized ? '<span class="prompt-badge">Personnalise</span>' : ''}
          </div>
          <div class="prompt-actions" onclick="event.stopPropagation()">
            <button class="btn btn-secondary btn-sm" onclick="resetPrompt('${action.id}')">Reset</button>
            <button class="btn btn-primary btn-sm" onclick="savePrompt('${action.id}')">Sauvegarder</button>
          </div>
        </div>
        <div class="accordion-content">
          <textarea id="prompt-${action.id}" placeholder="Prompt systeme...">${customPrompt || defaultPrompt}</textarea>
        </div>
      `;

      // Toggle accordeon
      item.querySelector('.accordion-header').addEventListener('click', () => {
        item.classList.toggle('open');
      });

      groupDiv.appendChild(item);
    });

    container.appendChild(groupDiv);
  });
}

// Sauvegarder un prompt
window.savePrompt = async function(actionId) {
  const textarea = document.getElementById(`prompt-${actionId}`);
  if (textarea) {
    customPrompts[actionId] = textarea.value;
    await new Promise((resolve) => {
      chrome.storage.local.set({ customPrompts }, resolve);
    });
    showNotification('Prompt sauvegarde !', 'success');
  }
};

// Reset un prompt
window.resetPrompt = async function(actionId) {
  const textarea = document.getElementById(`prompt-${actionId}`);
  if (textarea) {
    textarea.value = SYSTEM_PROMPTS[actionId] || '';
    delete customPrompts[actionId];
    await new Promise((resolve) => {
      chrome.storage.local.set({ customPrompts }, resolve);
    });
    showNotification('Prompt reinitialise', 'success');
  }
};

// Reset aux valeurs par defaut
async function resetToDefaults() {
  if (confirm('Etes-vous sur de vouloir reinitialiser tous les parametres ?')) {
    await new Promise((resolve) => {
      chrome.storage.local.clear(resolve);
    });
    location.reload();
  }
}

// Variables pour actions personnalisees
let customActions = [];

// Modal pour ajouter une action personnalisee
function showAddCustomActionModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('active');

  // Reset form
  document.getElementById('custom-action-name').value = '';
  document.getElementById('custom-action-context').value = 'selection';
  document.getElementById('custom-action-prompt').value = '';
}

// Fermer le modal
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// Sauvegarder une action personnalisee
async function saveCustomAction() {
  const name = document.getElementById('custom-action-name').value.trim();
  const context = document.getElementById('custom-action-context').value;
  const prompt = document.getElementById('custom-action-prompt').value.trim();

  if (!name) {
    showNotification('Veuillez entrer un nom pour l\'action', 'error');
    return;
  }

  if (!prompt) {
    showNotification('Veuillez entrer un prompt', 'error');
    return;
  }

  // Creer l'ID unique
  const id = 'custom_' + Date.now();

  const newAction = {
    id,
    name,
    context,
    prompt,
    enabled: true,
    icon: name.charAt(0).toUpperCase(),
    category: 'custom'
  };

  customActions.push(newAction);

  // Sauvegarder
  await new Promise((resolve) => {
    chrome.storage.local.set({ customActions }, resolve);
  });

  // Sauvegarder aussi le prompt
  customPrompts[id] = prompt;
  await new Promise((resolve) => {
    chrome.storage.local.set({ customPrompts }, resolve);
  });

  closeModal();
  renderCustomActionsList();
  showNotification('Action personnalisee creee !', 'success');

  // Notifier le background pour reconstruire les menus
  chrome.runtime.sendMessage({ type: 'RELOAD_MENUS' });
}

// Supprimer une action personnalisee
async function deleteCustomAction(actionId) {
  if (!confirm('Supprimer cette action personnalisee ?')) return;

  customActions = customActions.filter(a => a.id !== actionId);
  delete customPrompts[actionId];

  await new Promise((resolve) => {
    chrome.storage.local.set({ customActions, customPrompts }, resolve);
  });

  renderCustomActionsList();
  showNotification('Action supprimee', 'success');

  chrome.runtime.sendMessage({ type: 'RELOAD_MENUS' });
}

// Rendre la liste des actions personnalisees
function renderCustomActionsList() {
  const container = document.getElementById('custom-actions-list');
  container.innerHTML = '';

  if (customActions.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucune action personnalisee. Cliquez sur "Ajouter une action" pour commencer.</p>';
    return;
  }

  customActions.forEach(action => {
    const item = document.createElement('div');
    item.className = 'custom-action-item';
    item.innerHTML = `
      <div class="custom-action-info">
        <h4>${action.name}</h4>
        <span>${action.context === 'input' ? 'Champs de saisie' : action.context === 'selection' ? 'Selection' : 'Tous contextes'}</span>
      </div>
      <div class="custom-action-actions">
        <button class="btn btn-secondary btn-sm" onclick="editCustomAction('${action.id}')">Modifier</button>
        <button class="btn btn-danger btn-sm" onclick="deleteCustomAction('${action.id}')">Supprimer</button>
      </div>
    `;
    container.appendChild(item);
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

// Initialiser les event listeners du modal
function setupModalListeners() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-save').addEventListener('click', saveCustomAction);

  // Fermer en cliquant sur l'overlay
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
}

// Exposer les fonctions globalement
window.deleteCustomAction = deleteCustomAction;
window.editCustomAction = function(actionId) {
  // TODO: Implementer l'edition
  showNotification('Edition en cours de developpement', 'info');
};

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

// ========== PRESETS PROFESSIONNELS ==========

// Charger les presets actifs
async function loadActivePresets() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['activePresets'], (result) => {
      activePresets = result.activePresets || [];
      resolve();
    });
  });
}

// Sauvegarder les presets actifs
async function saveActivePresets() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ activePresets }, resolve);
  });
}

// Rendre la grille des presets
function renderPresetsGrid() {
  const grid = document.getElementById('presets-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const icons = {
    'support_it': 'H',
    'customer_service': 'C',
    'sales': 'V',
    'developer': '</>',
    'writer': 'W',
    'student': 'E',
    'researcher': 'R'
  };

  for (const preset of PRESET_LIST) {
    const isActive = activePresets.includes(preset.id);
    const card = document.createElement('div');
    card.className = `preset-card ${isActive ? 'active' : ''}`;
    card.innerHTML = `
      <div class="preset-toggle">
        <label class="toggle-label">
          <input type="checkbox" ${isActive ? 'checked' : ''} data-preset="${preset.id}">
          <span class="toggle-switch"></span>
        </label>
      </div>
      <div class="preset-icon">${icons[preset.id] || preset.name.charAt(0)}</div>
      <h4>${preset.name}</h4>
      <p>${preset.description}</p>
      <span class="preset-badge">${preset.actionCount} actions</span>
    `;

    // Toggle du preset
    const checkbox = card.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', async (e) => {
      e.stopPropagation();
      await togglePreset(preset.id, e.target.checked);
      card.classList.toggle('active', e.target.checked);
    });

    // Clic sur la carte pour voir les actions
    card.addEventListener('click', (e) => {
      if (e.target.type !== 'checkbox') {
        showPresetActions(preset.id);
      }
    });

    grid.appendChild(card);
  }
}

// Activer/desactiver un preset
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

// Afficher les actions d'un preset
function showPresetActions(presetId) {
  const container = document.getElementById('active-preset-actions');
  const preset = PROFESSIONAL_PRESETS[presetId];

  if (!preset) {
    container.innerHTML = '<h3>Actions du preset</h3><p class="empty-state">Preset non trouve.</p>';
    return;
  }

  let html = `<h3>Actions: ${preset.name}</h3>`;
  html += '<div class="preset-actions-list">';

  for (const action of preset.actions) {
    html += `
      <div class="preset-action-item">
        <span>${action.name}</span>
        <button class="btn btn-secondary btn-sm" onclick="viewPresetPrompt('${presetId}', '${action.id}')">Voir prompt</button>
      </div>
    `;
  }

  html += '</div>';
  container.innerHTML = html;
}

// Voir le prompt d'une action de preset
window.viewPresetPrompt = function(presetId, actionId) {
  const preset = PROFESSIONAL_PRESETS[presetId];
  const action = preset?.actions.find(a => a.id === actionId);

  if (action) {
    alert(`Prompt pour "${action.name}":\n\n${action.prompt}`);
  }
};
