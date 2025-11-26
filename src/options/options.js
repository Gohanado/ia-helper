// Options Page Script - IA Helper

import { PROFESSIONAL_PRESETS, PRESET_LIST } from '../config/presets.js';
import { t } from '../i18n/translations.js';

// Configuration par defaut (inline)
const DEFAULT_CONFIG = {
  ollamaUrl: 'http://localhost:11434',
  selectedModel: '',
  streamingEnabled: true,
  interfaceLanguage: 'fr',
  responseLanguage: 'fr'
};

// Configuration actuelle
let config = { ...DEFAULT_CONFIG };
let customPrompts = {};
let activePresets = [];
let customPresets = [];
let currentLang = 'fr';

// Elements DOM
const elements = {
  ollamaUrl: document.getElementById('ollama-url'),
  modelSelect: document.getElementById('model-select'),
  streamingEnabled: document.getElementById('streaming-enabled'),
  interfaceLanguage: document.getElementById('interface-language'),
  responseLanguage: document.getElementById('response-language'),
  connectionStatus: document.getElementById('connection-status')
};

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
  await loadAllSettings();
  await loadActivePresets();
  await loadCustomPresets();
  applyTranslations();
  setupNavigation();
  setupEventListeners();
  setupModalListeners();
  setupPresetModalListeners();
  renderAllPresetsGrid();
  // Charger les modeles au demarrage pour restaurer la selection
  refreshModels();
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
    chrome.storage.local.get(['config', 'customPrompts'], (result) => {
      config = result.config || DEFAULT_CONFIG;
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

  // Creer preset
  const btnAddPreset = document.getElementById('btn-add-preset');
  if (btnAddPreset) {
    btnAddPreset.addEventListener('click', showAddPresetModal);
  }
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

  // Si la langue a change, appliquer les traductions
  if (previousLang !== config.interfaceLanguage) {
    currentLang = config.interfaceLanguage;
    applyTranslations();
    renderAllPresetsGrid();
    showNotification(t('languageChanged', currentLang) + ' ' + t('settingsSaved', currentLang), 'success');
  } else {
    showNotification(t('settingsSaved', currentLang), 'success');
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

// Rendre la grille unifiee de tous les presets (personnalises + integres)
function renderAllPresetsGrid() {
  const grid = document.getElementById('all-presets-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const icons = {
    'support_it': 'IT',
    'customer_service': 'SC',
    'sales': 'CO',
    'developer': 'DEV',
    'writer': 'RED',
    'student': 'ETU',
    'researcher': 'REC',
    'hr_recruiter': 'RH',
    'manager': 'MGR',
    'legal': 'JUR',
    'marketing': 'MKT',
    'product_manager': 'PM',
    'ux_designer': 'UX',
    'data_analyst': 'DA',
    'community_manager': 'CM',
    'trainer': 'FOR',
    'translator': 'TRA',
    'journalist': 'JOU',
    'freelance': 'FRE',
    'healthcare': 'MED',
    'ecommerce': 'ECO',
    'copywriter': 'CPY',
    'content_creator': 'YT',
    'personal_assistant': 'PA'
  };

  // D'abord les presets personnalises
  for (const preset of customPresets) {
    const card = document.createElement('div');
    card.className = `preset-card custom-preset-card ${preset.enabled ? 'active' : ''}`;
    card.innerHTML = `
      <div class="preset-toggle">
        <label class="toggle-label">
          <input type="checkbox" ${preset.enabled ? 'checked' : ''} data-custom-preset="${preset.id}">
          <span class="toggle-switch"></span>
        </label>
      </div>
      <div class="preset-icon custom-icon">${t('custom', currentLang).charAt(0)}</div>
      <h4>${preset.name}</h4>
      <p>${preset.description || ''}</p>
      <span class="preset-badge">${preset.actions.length} ${t('actions', currentLang)}</span>
      <div class="preset-card-actions">
        <button class="btn btn-sm edit-preset-btn" data-id="${preset.id}">${t('edit', currentLang)}</button>
        <button class="btn btn-sm btn-danger delete-preset-btn" data-id="${preset.id}">${t('delete', currentLang)}</button>
      </div>
    `;

    // Toggle
    const checkbox = card.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', async (e) => {
      e.stopPropagation();
      preset.enabled = e.target.checked;
      card.classList.toggle('active', e.target.checked);
      await saveCustomPresets();
      chrome.runtime.sendMessage({ type: 'RELOAD_MENUS' });
      showNotification(e.target.checked ? t('presetActivated', currentLang) : t('presetDeactivated', currentLang), 'success');
    });

    // Clic sur la carte
    card.addEventListener('click', (e) => {
      if (e.target.type !== 'checkbox' && !e.target.classList.contains('edit-preset-btn') && !e.target.classList.contains('delete-preset-btn')) {
        showPresetActions(preset.id, true);
      }
    });

    // Modifier
    card.querySelector('.edit-preset-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      editCustomPreset(preset.id);
    });

    // Supprimer
    card.querySelector('.delete-preset-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCustomPreset(preset.id);
    });

    grid.appendChild(card);
  }

  // Ensuite les presets integres
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
      <span class="preset-badge integrated-badge">${t('integrated', currentLang)} - ${preset.actionCount} ${t('actions', currentLang)}</span>
      <div class="preset-card-actions">
        <button class="btn btn-sm customize-preset-btn" data-id="${preset.id}">${t('customize', currentLang)}</button>
      </div>
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
      if (e.target.type !== 'checkbox' && !e.target.classList.contains('customize-preset-btn')) {
        showPresetActions(preset.id, false);
      }
    });

    // Personnaliser le preset integre
    card.querySelector('.customize-preset-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      customizeIntegratedPreset(preset.id);
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
