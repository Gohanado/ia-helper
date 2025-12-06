/**
 * IA Helper - Chat Interface
 * Gestion du chat libre avec l'IA
 */

import { TRANSLATIONS } from '../i18n/translations.js';
import { DEFAULT_AGENT, BUILTIN_AGENTS, BUILTIN_AGENTS_LIST } from '../config/agents.js';
import { setTrustedHTML } from '../utils/dom-sanitizer.js';

// Alias pour compatibilite
const translations = TRANSLATIONS;

// Langue courante (chargee au demarrage)
let currentLang = 'fr';

// Fonction synchrone pour obtenir la langue
function getCurrentLanguage() {
  return currentLang;
}

// Charger la langue depuis le storage
async function loadLanguage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['config'], (result) => {
      currentLang = result.config?.interfaceLanguage || 'fr';
      resolve(currentLang);
    });
  });
}

// Fonction pour appliquer les traductions
function applyTranslations() {
  const t = translations[currentLang] || translations.fr;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) el.placeholder = t[key];
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (t[key]) el.title = t[key];
  });
}

// === CONFIGURATION ===
const STORAGE_KEY = 'chatConversations';
const AGENTS_STORAGE_KEY = 'customAgents';
const SELECTED_AGENT_KEY = 'selectedAgent';
const MAX_CONVERSATIONS = 100;

// === ETAT ===
let conversations = [];
let currentConversationId = null;
let isGenerating = false;
let currentPort = null;
let autoScroll = true;
let userScrolledUp = false;
let selectionMode = false;
let selectedConversations = new Set();
let customAgents = [];
let selectedAgent = null;
let allAgents = [];

// === ELEMENTS DOM ===
const elements = {
  sidebar: null,
  conversationsList: null,
  searchInput: null,
  messagesWrapper: null,
  messagesContainer: null,
  welcomeScreen: null,
  messageInput: null,
  btnSend: null,
  btnNewChat: null,
  btnToggleSidebar: null,
  btnSettings: null,
  btnExport: null,
  btnDeleteChat: null,
  chatTitle: null,
  modelBadge: null,
  controlButtons: null,
  btnStopGeneration: null,
  btnStopSpeech: null
};

// === INITIALISATION ===
document.addEventListener('DOMContentLoaded', async () => {
  initElements();
  await loadLanguage();
  await loadConversations();
  await loadConfig();
  applyTranslations();
  setupEventListeners();
  renderConversationsList();
  
  // Verifier si on doit charger une conversation specifique
  const urlParams = new URLSearchParams(window.location.search);
  const convId = urlParams.get('id');
  if (convId && conversations.find(c => c.id === convId)) {
    loadConversation(convId);
  }
});

// Initialiser les references aux elements DOM
function initElements() {
  elements.sidebar = document.getElementById('sidebar');
  elements.conversationsList = document.getElementById('conversations-list');
  elements.searchInput = document.getElementById('search-conversations');
  elements.messagesWrapper = document.getElementById('messages-wrapper');
  elements.messagesContainer = document.getElementById('messages-container');
  elements.welcomeScreen = document.getElementById('welcome-screen');
  elements.messageInput = document.getElementById('message-input');
  elements.btnSend = document.getElementById('btn-send');
  elements.btnNewChat = document.getElementById('btn-new-chat');
  elements.btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  elements.btnSettings = document.getElementById('btn-settings');
  elements.btnExport = document.getElementById('btn-export');
  elements.btnDeleteChat = document.getElementById('btn-delete-chat');
  elements.chatTitle = document.getElementById('chat-title');
  elements.modelBadge = document.getElementById('model-badge');
  elements.modelDropdown = document.getElementById('model-dropdown');
  elements.agentBadge = document.getElementById('agent-badge');
  elements.agentDropdown = document.getElementById('agent-dropdown');
  elements.controlButtons = document.getElementById('control-buttons');
  elements.btnStopGeneration = document.getElementById('btn-stop-generation');
  elements.btnStopSpeech = document.getElementById('btn-stop-speech');
}

// === CONFIGURATION ===
let config = {};

async function loadConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['config', AGENTS_STORAGE_KEY, SELECTED_AGENT_KEY], (result) => {
      config = result.config || {};
      customAgents = result[AGENTS_STORAGE_KEY] || [];
      selectedAgent = result[SELECTED_AGENT_KEY] || DEFAULT_AGENT.id;

      // Combiner agents built-in et custom
      allAgents = [...BUILTIN_AGENTS_LIST, ...customAgents];

      updateModelBadge();
      populateModelDropdown();
      updateAgentBadge();
      populateAgentDropdown();
      resolve();
    });
  });
}

function updateModelBadge() {
  const model = config.selectedModel || 'Non configure';
  elements.modelBadge.textContent = model;
}

async function populateModelDropdown() {
  if (!elements.modelDropdown) return;

  // Recuperer les modeles disponibles selon le provider
  const provider = config.provider || 'ollama';
  let models = [];

  if (provider === 'ollama') {
    // Pour Ollama, faire un fetch pour recuperer les modeles
    try {
      const apiUrl = config.apiUrl || 'http://localhost:11434';
      const response = await fetch(`${apiUrl}/api/tags`);
      const data = await response.json();
      models = (data.models || []).map(m => m.name);
    } catch (error) {
      console.error('Erreur chargement modeles Ollama:', error);
      // Si erreur, utiliser le modele actuel
      if (config.selectedModel) {
        models = [config.selectedModel];
      }
    }
  } else if (provider === 'openai') {
    models = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  } else if (provider === 'anthropic') {
    models = ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'];
  } else if (provider === 'groq') {
    models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];
  } else if (provider === 'openrouter') {
    models = ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro', 'meta-llama/llama-3.3-70b-instruct', 'qwen/qwen-2.5-72b-instruct'];
  } else if (provider === 'custom') {
    // Pour custom, utiliser le modele actuel
    if (config.selectedModel) {
      models = [config.selectedModel];
    }
  }

  // Ajouter le modele actuel s'il n'est pas dans la liste
  if (config.selectedModel && !models.includes(config.selectedModel)) {
    models.unshift(config.selectedModel);
  }

  // Vider le dropdown
  setTrustedHTML(elements.modelDropdown, '');

  // Si aucun modele, afficher un message
  if (models.length === 0) {
    const msg = document.createElement('div');
    msg.className = 'model-option disabled';
    msg.textContent = 'Aucun modele disponible';
    elements.modelDropdown.appendChild(msg);
    return;
  }

  // Ajouter les modeles
  models.forEach(model => {
    const btn = document.createElement('button');
    btn.className = 'model-option';
    btn.textContent = model;
    btn.dataset.model = model;
    if (model === config.selectedModel) {
      btn.classList.add('active');
    }
    elements.modelDropdown.appendChild(btn);
  });
}

// === GESTION DES AGENTS ===
function updateAgentBadge() {
  if (!elements.agentBadge) return;

  const agent = allAgents.find(a => a.id === selectedAgent) || DEFAULT_AGENT;
  const iconEl = elements.agentBadge.querySelector('.agent-badge-icon');
  const nameEl = elements.agentBadge.querySelector('.agent-badge-name');

  if (iconEl) iconEl.textContent = agent.icon || '🤖';
  if (nameEl) nameEl.textContent = agent.name;
}

function populateAgentDropdown() {
  if (!elements.agentDropdown) return;

  setTrustedHTML(elements.agentDropdown, '');

  // Section agents built-in
  const builtinSection = document.createElement('div');
  builtinSection.className = 'agent-dropdown-section';

  const builtinTitle = document.createElement('div');
  builtinTitle.className = 'agent-dropdown-title';
  builtinTitle.textContent = 'Agents integres';
  builtinSection.appendChild(builtinTitle);

  BUILTIN_AGENTS_LIST.forEach(agent => {
    const option = createAgentOption(agent);
    builtinSection.appendChild(option);
  });

  elements.agentDropdown.appendChild(builtinSection);

  // Section agents personnalises
  if (customAgents.length > 0) {
    const customSection = document.createElement('div');
    customSection.className = 'agent-dropdown-section';

    const customTitle = document.createElement('div');
    customTitle.className = 'agent-dropdown-title';
    customTitle.textContent = 'Agents personnalises';
    customSection.appendChild(customTitle);

    customAgents.forEach(agent => {
      const option = createAgentOption(agent);
      customSection.appendChild(option);
    });

    elements.agentDropdown.appendChild(customSection);
  }
}

function createAgentOption(agent) {
  const btn = document.createElement('button');
  btn.className = 'agent-option';
  btn.dataset.agentId = agent.id;

  if (agent.id === selectedAgent) {
    btn.classList.add('active');
  }

  setTrustedHTML(btn, `
    <div class="agent-option-icon">${agent.icon || '🤖'}</div>
    <div class="agent-option-info">
      <div class="agent-option-name">${agent.name}</div>
      <div class="agent-option-description">${agent.description}</div>
    </div>
  `);

  return btn;
}

async function selectAgent(agentId) {
  selectedAgent = agentId;

  // Sauvegarder la selection
  await new Promise((resolve) => {
    chrome.storage.local.set({ [SELECTED_AGENT_KEY]: selectedAgent }, resolve);
  });

  // Mettre a jour l'interface
  updateAgentBadge();
  populateAgentDropdown();

  // Mettre a jour la conversation courante
  if (currentConversationId) {
    const conv = conversations.find(c => c.id === currentConversationId);
    if (conv) {
      conv.agentId = agentId;
      await saveConversations();
    }
  }

  const agent = allAgents.find(a => a.id === agentId) || DEFAULT_AGENT;
  const t = translations[currentLang] || translations.fr;
  showToast(`Agent: ${agent.name}`);
}

// === GESTION DES CONVERSATIONS ===
async function loadConversations() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      conversations = result[STORAGE_KEY] || [];
      resolve();
    });
  });
}

async function saveConversations() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: conversations }, resolve);
  });
}

function generateId() {
  return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function createNewConversation() {
  const lang = getCurrentLanguage();
  const t = translations[lang] || translations.fr;

  const conversation = {
    id: generateId(),
    title: t.newConversation || 'Nouvelle conversation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
    agentId: selectedAgent || DEFAULT_AGENT.id
  };

  conversations.unshift(conversation);
  saveConversations();
  return conversation;
}

function getCurrentConversation() {
  return conversations.find(c => c.id === currentConversationId);
}

function updateConversationTitle(conversation) {
  // Generer un titre a partir du premier message utilisateur
  const firstUserMsg = conversation.messages.find(m => m.role === 'user');
  if (firstUserMsg) {
    const title = firstUserMsg.content.substring(0, 50);
    conversation.title = title + (firstUserMsg.content.length > 50 ? '...' : '');
  }
}

// === RENDU ===
function renderConversationsList(filter = '') {
  const filtered = filter
    ? conversations.filter(c => c.title.toLowerCase().includes(filter.toLowerCase()))
    : conversations;

  setTrustedHTML(elements.conversationsList, filtered.map(conv => `
    <div class="conversation-item ${conv.id === currentConversationId ? 'active' : ''} ${selectionMode ? 'selection-mode' : ''}" data-id="${conv.id}">
      ${selectionMode ? `
        <div class="conversation-checkbox">
          <input type="checkbox" class="conv-checkbox" data-conv-id="${conv.id}" ${selectedConversations.has(conv.id) ? 'checked' : ''}>
        </div>
      ` : `
        <div class="conversation-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
      `}
      <div class="conversation-info">
        <div class="conversation-title">${escapeHtml(conv.title)}</div>
        <div class="conversation-date">${formatDate(conv.updatedAt)}</div>
      </div>
      ${!selectionMode ? `
        <div class="conversation-actions">
          <button class="btn-conv-action delete" data-action="delete" title="Supprimer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      ` : ''}
    </div>
  `).join('');
}

function loadConversation(id) {
  currentConversationId = id;
  const conv = getCurrentConversation();
  if (!conv) return;

  // Charger l'agent de la conversation
  if (conv.agentId) {
    selectedAgent = conv.agentId;
    updateAgentBadge();
    populateAgentDropdown();
  }

  // Masquer l'ecran de bienvenue
  elements.welcomeScreen.style.display = 'none';

  // Afficher les messages
  renderMessages(conv.messages);
  renderConversationsList();

  // Mettre a jour le titre
  elements.chatTitle.textContent = conv.title;
}

function renderMessages(messages) {
  const lang = getCurrentLanguage();
  const t = translations[lang] || translations.fr;

  // Supprimer les anciens messages (garder welcome-screen)
  const existingMessages = elements.messagesWrapper.querySelectorAll('.message');
  existingMessages.forEach(m => m.remove());

  messages.forEach(msg => {
    const messageEl = createMessageElement(msg, t);
    elements.messagesWrapper.appendChild(messageEl);
  });

  scrollToBottom();
}

function createMessageElement(msg, t) {
  const div = document.createElement('div');
  div.className = `message ${msg.role}`);

  const isUser = msg.role === 'user';
  const authorName = isUser ? (t.you || 'Vous') : 'IA';
  const avatarText = isUser ? 'U' : 'IA';

  // Construire le contenu du message avec thinking si present
  let messageTextContent = '';
  if (msg.thinking && msg.thinking.trim()) {
    messageTextContent = `
      <div class="thinking-section">
        <div class="thinking-header">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
          <span>Reflexion</span>
        </div>
        <div class="thinking-content">${formatMessageContent(msg.thinking)}</div>
      </div>
      <div class="response-content">${formatMessageContent(msg.content)}</div>
    `);
  } else {
    messageTextContent = formatMessageContent(msg.content);
  }

  setTrustedHTML(div, `
    <div class="message-avatar">${avatarText}</div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-author">${authorName}</span>
        <span class="message-time">${msg.timestamp ? formatTime(msg.timestamp) : ''}</span>
      </div>
      <div class="message-text">${messageTextContent}</div>
      ${!isUser ? `
        <div class="message-actions">
          <div class="copy-menu">
            <button class="btn-msg-action" data-action="copy-text">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              ${t.copy || 'Copier'}
            </button>
            <button class="btn-copy-dropdown" data-action="copy-dropdown">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div class="copy-dropdown-menu">
              <button data-action="copy-text">${t.copyText || 'Copier texte brut'}</button>
              <button data-action="copy-markdown">${t.copyMarkdown || 'Copier Markdown'}</button>
            </div>
          </div>
          <button class="btn-msg-action" data-action="speak">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
            ${t.listen || 'Ecouter'}
          </button>
        </div>
      ` : ''}
    </div>
  `);

  return div;
}

function formatMessageContent(content) {
  // Conversion complete Markdown -> HTML avec protection des blocs speciaux
  let html = content;

  // Stocker les blocs proteges (code blocks, tableaux) pour les remettre a la fin
  const protectedBlocks = [];
  let blockIndex = 0;

  // Code blocks avec langage et bouton copie (ECHAPPER le code seulement)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
    const cleanCode = escapeHtml(code.trim()); // Echapper SEULEMENT le code

    const block = `<div class="code-block-wrapper"><div class="code-block-header"><span class="code-lang">${lang || 'code'}</span><button class="btn-copy-code" data-code-id="${codeId}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copier</button></div><pre><code id="${codeId}" class="language-${lang}">${cleanCode}</code></pre></div>`);

    // Utiliser § au lieu de _ pour eviter les conflits avec italic
    const placeholder = `§§§PROTECTEDBLOCK${blockIndex}§§§`);
    protectedBlocks[blockIndex] = block;
    blockIndex++;
    return placeholder;
  });

  // Tableaux Markdown - PROTEGER aussi
  // IMPORTANT: Parser le contenu des cellules (inline code, bold, italic, links) AVANT de creer le HTML
  html = html.replace(/(^|\n)(\|.+\|)\n(\|[\s\-\|:]+\|)\n((?:\|.+\|\n?)+)/gm, (match, prefix, header, separator, rows) => {
    const tableId = 'table-' + Math.random().toString(36).substr(2, 9);

    // Parser le contenu des cellules d'en-tete
    const headerCells = header.split('|').filter(c => c.trim()).map(c => {
      let cellContent = c.trim();
      // Inline code
      cellContent = cellContent.replace(/`([^`]+)`/g, (m, code) => {
        const codeId = 'inline-' + Math.random().toString(36).substr(2, 9);
        return `<code id="${codeId}">${escapeHtml(code)}</code>`);
      });
      // Bold
      cellContent = cellContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      cellContent = cellContent.replace(/__([^_]+)__/g, '<strong>$1</strong>');
      // Italic
      cellContent = cellContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      cellContent = cellContent.replace(/_([^_]+)_/g, '<em>$1</em>');
      // Links
      cellContent = cellContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
      return `<th>${cellContent}</th>`);
    }).join('');

    // Parser le contenu des cellules de lignes
    const rowsHtml = rows.trim().split('\n').map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => {
        let cellContent = c.trim();
        // Inline code
        cellContent = cellContent.replace(/`([^`]+)`/g, (m, code) => {
          const codeId = 'inline-' + Math.random().toString(36).substr(2, 9);
          return `<code id="${codeId}">${escapeHtml(code)}</code>`);
        });
        // Bold
        cellContent = cellContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        cellContent = cellContent.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        // Italic
        cellContent = cellContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        cellContent = cellContent.replace(/_([^_]+)_/g, '<em>$1</em>');
        // Links
        cellContent = cellContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        return `<td>${cellContent}</td>`);
      }).join('');
      return `<tr>${cells}</tr>`);
    }).join('');

    const block = `<div class="table-wrapper"><div class="table-header"><button class="btn-copy-table" data-table-id="${tableId}" title="Copier le tableau"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copier</button></div><table id="${tableId}" class="markdown-table"><thead><tr>${headerCells}</tr></thead><tbody>${rowsHtml}</tbody></table></div>`;

    // Utiliser § au lieu de _ pour eviter les conflits avec italic
    const placeholder = `§§§PROTECTEDBLOCK${blockIndex}§§§`;
    protectedBlocks[blockIndex] = block;
    blockIndex++;
    return prefix + placeholder; // Remettre le prefix AVANT le placeholder
  });

  // Inline code avec bouton copie discret (AVANT les autres formatages, ECHAPPER le code seulement)
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const codeId = 'inline-' + Math.random().toString(36).substr(2, 9);
    const cleanCode = escapeHtml(code); // Echapper SEULEMENT le code
    return `<span class="inline-code-wrapper"><code id="${codeId}">${cleanCode}</code><button class="btn-copy-inline" data-code-id="${codeId}" title="Copier"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button></span>`;
  });

  // Formules LaTeX block \[ ... \]
  html = html.replace(/\\\[([\s\S]*?)\\\]/g, '<div class="latex-block">$1</div>');

  // Formules LaTeX inline \( ... \)
  html = html.replace(/\\\((.*?)\\\)/g, '<span class="latex-inline">$1</span>');

  // Headers (h1-h6) - PAS d'echappement car texte normal
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Horizontal rules (---, ***, ___)
  html = html.replace(/^[\-\*_]{3,}$/gm, '<hr>');

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Bold (** ou __)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic (* ou _)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Strikethrough (~~)
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Images ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Unordered lists (-, *, +)
  html = html.replace(/^[\-\*\+]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Ordered lists (1., 2., etc.)
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Task lists (- [ ] ou - [x])
  html = html.replace(/^[\-\*]\s+\[\s\]\s+(.+)$/gm, '<li class="task-item"><input type="checkbox" disabled> $1</li>');
  html = html.replace(/^[\-\*]\s+\[x\]\s+(.+)$/gm, '<li class="task-item"><input type="checkbox" checked disabled> $1</li>');

  // IMPORTANT: Restaurer les blocs proteges AVANT de remplacer les \n
  // Sinon les placeholders seront casses par les <br>
  protectedBlocks.forEach((block, index) => {
    const placeholder = `§§§PROTECTEDBLOCK${index}§§§`;
    html = html.replace(new RegExp(placeholder, 'g'), block);
  });

  // Line breaks - Remplacer les \n par <br> maintenant que les blocs sont restaures
  html = html.replace(/\n\n+/g, '<br><br>'); // Double newlines = paragraphes
  html = html.replace(/\n/g, '<br>'); // Single newlines = line breaks

  return html;
}

// === ENVOI DE MESSAGE ===
async function sendMessage(content) {
  if (!content.trim() || isGenerating) return;

  // Creer une nouvelle conversation si necessaire
  if (!currentConversationId) {
    const conv = createNewConversation();
    currentConversationId = conv.id;
    elements.welcomeScreen.style.display = 'none';
    renderConversationsList();
  }

  const conv = getCurrentConversation();
  if (!conv) return;

  // Ajouter le message utilisateur
  const userMessage = {
    role: 'user',
    content: content.trim(),
    timestamp: new Date().toISOString()
  };
  conv.messages.push(userMessage);
  conv.updatedAt = new Date().toISOString();

  // Mettre a jour le titre si c'est le premier message
  if (conv.messages.length === 1) {
    updateConversationTitle(conv);
    elements.chatTitle.textContent = conv.title;
  }

  // Afficher le message
  const lang = getCurrentLanguage();
  const t = translations[lang] || translations.fr;
  const userEl = createMessageElement(userMessage, t);
  elements.messagesWrapper.appendChild(userEl);

  // Vider l'input
  elements.messageInput.value = '';
  elements.messageInput.style.height = 'auto';
  elements.btnSend.disabled = true;

  // Afficher l'indicateur de frappe
  const typingEl = document.createElement('div');
  typingEl.className = 'message assistant typing';
  setTrustedHTML(typingEl, `
    <div class="message-avatar">IA</div>
    <div class="message-content">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  `);
  elements.messagesWrapper.appendChild(typingEl);
  scrollToBottom();

  // Generer la reponse
  isGenerating = true;

  // Afficher le bouton stop
  if (elements.controlButtons) {
    elements.controlButtons.style.display = 'flex';
  }

  try {
    // Supprimer l'indicateur de frappe et creer le message assistant vide
    typingEl.remove();

    const assistantMessage = {
      role: 'assistant',
      content: '',
      thinking: '',
      timestamp: new Date().toISOString()
    };

    const assistantEl = createMessageElement(assistantMessage, t);
    elements.messagesWrapper.appendChild(assistantEl);
    const messageTextEl = assistantEl.querySelector('.message-text');

    let thinkingEl = null;
    let responseEl = null;

    // Generer avec streaming
    const result = await generateResponseStreaming(conv.messages, (chunk, isThinking, thinkingEnd) => {
      if (isThinking) {
        // Creer la section thinking si elle n'existe pas
        if (!thinkingEl) {
          thinkingEl = document.createElement('div');
          thinkingEl.className = 'thinking-section';
          setTrustedHTML(thinkingEl, `
            <div class="thinking-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
              <span>Reflexion...</span>
            </div>
            <div class="thinking-content"></div>
          `);
          messageTextEl.insertBefore(thinkingEl, messageTextEl.firstChild);
          responseEl = document.createElement('div');
          responseEl.className = 'response-content';
          messageTextEl.appendChild(responseEl);
        }
        assistantMessage.thinking += chunk;
        setTrustedHTML(thinkingEl.querySelector('.thinking-content'), formatMessageContent(assistantMessage.thinking));
      } else if (thinkingEnd) {
        // Fin du thinking
        if (thinkingEl) {
          thinkingEl.querySelector('.thinking-header span').textContent = 'Reflexion';
        }
      } else {
        // Reponse normale
        assistantMessage.content += chunk;
        if (responseEl) {
          setTrustedHTML(responseEl, formatMessageContent(assistantMessage.content));
        } else {
          setTrustedHTML(messageTextEl, formatMessageContent(assistantMessage.content));
        }
      }
      scrollToBottom();
    });

    // Finaliser
    if (result.response !== undefined) {
      assistantMessage.content = result.response;
      assistantMessage.thinking = result.thinking || '';
    } else {
      assistantMessage.content = result;
    }

    conv.messages.push(assistantMessage);
    conv.updatedAt = new Date().toISOString();

    // Sauvegarder
    await saveConversations();
    renderConversationsList();

  } catch (error) {
    typingEl.remove();
    showError(error.message);
  } finally {
    isGenerating = false;
    // Masquer le bouton stop
    if (elements.controlButtons) {
      elements.controlButtons.style.display = 'none';
    }
    scrollToBottom();
  }
}

// === GENERATION IA ===
async function generateResponseStreaming(messages, onChunk) {
  return new Promise((resolve, reject) => {
    // Recuperer l'agent actuel
    const agent = allAgents.find(a => a.id === selectedAgent) || DEFAULT_AGENT;

    // Construire le contexte de conversation
    const conversationContext = messages.map(m =>
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
    ).join('\n\n');

    // Utiliser le system prompt de l'agent
    const systemPrompt = agent.systemPrompt;

    const lastUserMessage = messages[messages.length - 1].content;
    const fullPrompt = messages.length > 1
      ? `Contexte de la conversation:\n${conversationContext}\n\nReponds au dernier message de l'utilisateur.`
      : lastUserMessage;

    // Utiliser le port de streaming
    currentPort = chrome.runtime.connect({ name: 'streaming' });
    let fullResponse = '';
    let thinkingContent = '';
    let isInThinking = false;

    currentPort.onMessage.addListener((msg) => {
      if (msg.type === 'chunk') {
        if (msg.isThinking) {
          isInThinking = true;
          thinkingContent += msg.text;
          if (onChunk) onChunk(msg.text, true);
        } else {
          fullResponse += msg.text;
          if (onChunk) onChunk(msg.text, false);
        }
      } else if (msg.type === 'thinking_end') {
        isInThinking = false;
        if (onChunk) onChunk('', false, true); // Signal fin du thinking
      } else if (msg.type === 'done') {
        currentPort.disconnect();
        currentPort = null;
        resolve({ response: fullResponse, thinking: thinkingContent });
      } else if (msg.type === 'error') {
        currentPort.disconnect();
        currentPort = null;
        reject(new Error(msg.error));
      } else if (msg.type === 'aborted') {
        currentPort.disconnect();
        currentPort = null;
        reject(new Error('Generation annulee'));
      }
    });

    // Envoyer les parametres de l'agent
    currentPort.postMessage({
      type: 'GENERATE_STREAMING',
      content: fullPrompt,
      systemPrompt: systemPrompt,
      agentParams: {
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        topP: agent.topP,
        frequencyPenalty: agent.frequencyPenalty,
        presencePenalty: agent.presencePenalty,
        model: agent.model || config.selectedModel
      }
    });
  });
}

// === EVENT LISTENERS ===
function setupEventListeners() {
  // Nouvelle conversation
  elements.btnNewChat.addEventListener('click', () => {
    currentConversationId = null;
    elements.welcomeScreen.style.display = 'block';
    elements.chatTitle.textContent = translations[getCurrentLanguage()]?.chatWithAI || 'Chat avec l\'IA';

    // Supprimer les messages affiches
    const existingMessages = elements.messagesWrapper.querySelectorAll('.message');
    existingMessages.forEach(m => m.remove());

    renderConversationsList();
  });

  // Toggle sidebar
  elements.btnToggleSidebar.addEventListener('click', () => {
    elements.sidebar.classList.toggle('collapsed');
    document.querySelector('.chat-app').classList.toggle('sidebar-collapsed');
  });

  // Ouvrir les options
  elements.btnSettings.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Supprimer toutes les conversations
  const btnDeleteAll = document.getElementById('btn-delete-all');
  if (btnDeleteAll) {
    btnDeleteAll.addEventListener('click', () => {
      const t = translations[currentLang] || translations.fr;
      if (confirm(t.confirmDeleteAll || 'Voulez-vous vraiment supprimer toutes les conversations ?')) {
        conversations = [];
        currentConversationId = null;
        saveConversations();
        renderConversationsList();
        setTrustedHTML(elements.messagesWrapper, '');
        elements.welcomeScreen.style.display = 'flex';
        showToast(t.allConversationsDeleted || 'Toutes les conversations ont ete supprimees');
      }
    });
  }

  // Recherche
  elements.searchInput.addEventListener('input', (e) => {
    renderConversationsList(e.target.value);
  });

  // Clic sur une conversation
  elements.conversationsList.addEventListener('click', (e) => {
    const checkbox = e.target.closest('.conv-checkbox');
    const item = e.target.closest('.conversation-item');
    const deleteBtn = e.target.closest('[data-action="delete"]');

    if (checkbox) {
      // Toggle selection
      const convId = checkbox.dataset.convId;
      if (checkbox.checked) {
        selectedConversations.add(convId);
      } else {
        selectedConversations.delete(convId);
      }
      updateDeleteSelectedButton();
    } else if (deleteBtn && item) {
      e.stopPropagation();
      deleteConversation(item.dataset.id);
    } else if (item && !selectionMode) {
      loadConversation(item.dataset.id);
    }
  });

  // Mode selection
  const btnSelectMode = document.getElementById('btn-select-mode');
  const btnDeleteSelected = document.getElementById('btn-delete-selected');

  if (btnSelectMode) {
    btnSelectMode.addEventListener('click', () => {
      selectionMode = !selectionMode;
      selectedConversations.clear();

      const t = translations[currentLang] || translations.fr;
      if (selectionMode) {
        btnSelectMode.querySelector('span').textContent = t.cancel || 'Annuler';
        btnSelectMode.classList.add('active');
      } else {
        btnSelectMode.querySelector('span').textContent = t.selectMode || 'Selectionner';
        btnSelectMode.classList.remove('active');
      }

      updateDeleteSelectedButton();
      renderConversationsList();
    });
  }

  if (btnDeleteSelected) {
    btnDeleteSelected.addEventListener('click', () => {
      if (selectedConversations.size === 0) return;

      const t = translations[currentLang] || translations.fr;
      const count = selectedConversations.size;
      if (confirm(`${t.confirmDeleteSelected || 'Supprimer'} ${count} ${t.conversations || 'conversations'} ?`)) {
        // Supprimer les conversations selectionnees
        selectedConversations.forEach(id => {
          const index = conversations.findIndex(c => c.id === id);
          if (index !== -1) {
            conversations.splice(index, 1);
          }
        });

        // Si la conversation courante est supprimee
        if (selectedConversations.has(currentConversationId)) {
          currentConversationId = null;
          setTrustedHTML(elements.messagesWrapper, '');
          elements.welcomeScreen.style.display = 'flex';
        }

        selectedConversations.clear();
        selectionMode = false;
        btnSelectMode.querySelector('span').textContent = t.selectMode || 'Selectionner';
        btnSelectMode.classList.remove('active');

        saveConversations();
        renderConversationsList();
        updateDeleteSelectedButton();
        showToast(`${count} ${t.conversationsDeleted || 'conversations supprimees'}`);
      }
    });
  }

  // Input message
  elements.messageInput.addEventListener('input', () => {
    // Auto-resize
    elements.messageInput.style.height = 'auto';
    elements.messageInput.style.height = Math.min(elements.messageInput.scrollHeight, 150) + 'px';

    // Activer/desactiver le bouton envoyer
    elements.btnSend.disabled = !elements.messageInput.value.trim();
  });

  // Envoi avec Enter
  elements.messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(elements.messageInput.value);
    }
  });

  // Bouton envoyer
  elements.btnSend.addEventListener('click', () => {
    sendMessage(elements.messageInput.value);
  });

  // Suggestions
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt;
      if (prompt) {
        elements.messageInput.value = prompt;
        sendMessage(prompt);
      }
    });
  });

  // Supprimer la conversation courante
  elements.btnDeleteChat.addEventListener('click', () => {
    if (currentConversationId) {
      deleteConversation(currentConversationId);
    }
  });

  // Exporter la conversation
  elements.btnExport.addEventListener('click', exportCurrentConversation);

  // Actions sur les messages (delegation)
  elements.messagesWrapper.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-msg-action, .btn-copy-dropdown, .copy-dropdown-menu button');
    if (!btn) return;

    const action = btn.dataset.action;
    const messageEl = btn.closest('.message');
    const textEl = messageEl.querySelector('.message-text');

    if (action === 'copy-dropdown') {
      // Toggle dropdown
      const dropdown = btn.parentElement.querySelector('.copy-dropdown-menu');
      dropdown.classList.toggle('show');
      e.stopPropagation();
    } else if (action === 'copy-text') {
      // Copier texte brut
      copyToClipboard(textEl.innerText);
      // Fermer dropdown si ouvert
      const dropdown = messageEl.querySelector('.copy-dropdown-menu');
      if (dropdown) dropdown.classList.remove('show');
    } else if (action === 'copy-markdown') {
      // Copier Markdown original
      const conv = getCurrentConversation();
      if (conv) {
        const msgIndex = Array.from(messageEl.parentElement.children).indexOf(messageEl);
        const originalContent = conv.messages[msgIndex]?.content || textEl.innerText;
        copyToClipboard(originalContent);
      }
      // Fermer dropdown
      const dropdown = messageEl.querySelector('.copy-dropdown-menu');
      if (dropdown) dropdown.classList.remove('show');
    } else if (action === 'speak') {
      speakText(textEl.innerText);
    }
  });

  // Fermer les dropdowns quand on clique ailleurs
  document.addEventListener('click', (e) => {
    // Fermer copy dropdown
    if (!e.target.closest('.copy-menu')) {
      document.querySelectorAll('.copy-dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
      });
    }
    // Fermer model dropdown
    if (!e.target.closest('.model-selector')) {
      if (elements.modelDropdown) {
        elements.modelDropdown.classList.remove('show');
      }
    }
    // Fermer agent dropdown
    if (!e.target.closest('.agent-selector')) {
      if (elements.agentDropdown) {
        elements.agentDropdown.classList.remove('show');
      }
    }
  });

  // Toggle model dropdown
  if (elements.modelBadge) {
    elements.modelBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.modelDropdown.classList.toggle('show');
    });
  }

  // Selectionner un modele
  if (elements.modelDropdown) {
    elements.modelDropdown.addEventListener('click', (e) => {
      const option = e.target.closest('.model-option');
      if (!option) return;

      const newModel = option.dataset.model;

      // Mettre a jour la config
      config.selectedModel = newModel;
      chrome.storage.local.set({ config }, () => {
        updateModelBadge();
        populateModelDropdown();
        elements.modelDropdown.classList.remove('show');

        const t = translations[currentLang] || translations.fr;
        showToast(`${t.model || 'Modele'}: ${newModel}`);
      });
    });
  }

  // Toggle agent dropdown
  if (elements.agentBadge) {
    elements.agentBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.agentDropdown.classList.toggle('show');
    });
  }

  // Selectionner un agent
  if (elements.agentDropdown) {
    elements.agentDropdown.addEventListener('click', async (e) => {
      const option = e.target.closest('.agent-option');
      if (!option) return;

      const agentId = option.dataset.agentId;
      await selectAgent(agentId);
      elements.agentDropdown.classList.remove('show');
    });
  }

  // Copier code blocks et inline code
  elements.messagesWrapper.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.btn-copy-code, .btn-copy-inline');
    if (!copyBtn) return;

    const codeId = copyBtn.dataset.codeId;
    const codeEl = document.getElementById(codeId);
    if (codeEl) {
      copyToClipboard(codeEl.textContent);
      // Feedback visuel
      const originalText = copyBtn.innerHTML;
      const isInline = copyBtn.classList.contains('btn-copy-inline');

      if (isInline) {
        setTrustedHTML(copyBtn, '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>');
      } else {
        setTrustedHTML(copyBtn, '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copie!');
      }

      setTimeout(() => {
        setTrustedHTML(copyBtn, originalText);
      }, 2000);
    }
  });

  // Copier tableaux
  elements.messagesWrapper.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.btn-copy-table');
    if (!copyBtn) return;

    const tableId = copyBtn.dataset.tableId;
    const tableEl = document.getElementById(tableId);
    if (tableEl) {
      // Convertir le tableau en texte tabulaire
      let tableText = '';
      const rows = tableEl.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const cellTexts = Array.from(cells).map(cell => cell.textContent.trim());
        tableText += cellTexts.join('\t') + '\n';
      });

      copyToClipboard(tableText.trim());

      // Feedback visuel
      const originalText = copyBtn.innerHTML;
      setTrustedHTML(copyBtn, '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copie!');

      setTimeout(() => {
        setTrustedHTML(copyBtn, originalText);
      }, 2000);
    }
  });

  // Bouton stop generation
  if (elements.btnStopGeneration) {
    elements.btnStopGeneration.addEventListener('click', stopGeneration);
  }

  // Bouton stop speech
  if (elements.btnStopSpeech) {
    elements.btnStopSpeech.addEventListener('click', stopSpeech);
  }

  // Detecter le scroll manuel
  elements.messagesContainer.addEventListener('scroll', () => {
    userScrolledUp = !isScrolledToBottom();
    // Si l'utilisateur scrolle vers le bas, reactiver l'auto-scroll
    if (isScrolledToBottom()) {
      autoScroll = true;
      userScrolledUp = false;
    }
  });
}

// === ACTIONS ===
function deleteConversation(id) {
  const lang = getCurrentLanguage();
  const t = translations[lang] || translations.fr;

  if (!confirm(t.confirmDelete || 'Supprimer cette conversation ?')) return;

  conversations = conversations.filter(c => c.id !== id);
  saveConversations();

  if (currentConversationId === id) {
    currentConversationId = null;
    elements.welcomeScreen.style.display = 'block';
    elements.chatTitle.textContent = t.chatWithAI || 'Chat avec l\'IA';

    const existingMessages = elements.messagesWrapper.querySelectorAll('.message');
    existingMessages.forEach(m => m.remove());
  }

  renderConversationsList();
}

function updateDeleteSelectedButton() {
  const btnDeleteSelected = document.getElementById('btn-delete-selected');
  if (!btnDeleteSelected) return;

  if (selectionMode && selectedConversations.size > 0) {
    btnDeleteSelected.classList.remove('hidden');
    const t = translations[currentLang] || translations.fr;
    btnDeleteSelected.querySelector('span').textContent = `${t.deleteSelected || 'Supprimer'} (${selectedConversations.size})`;
  } else {
    btnDeleteSelected.classList.add('hidden');
  }
}

function exportCurrentConversation() {
  const conv = getCurrentConversation();
  if (!conv) return;

  const content = conv.messages.map(m =>
    `[${m.role === 'user' ? 'Vous' : 'IA'}] ${m.content}`
  ).join('\n\n---\n\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conversation-${conv.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(translations[getCurrentLanguage()]?.copied || 'Copie !');
  });
}

function stripMarkdown(text) {
  // Retirer le Markdown pour la lecture vocale
  let clean = text;

  // Retirer les emojis (Unicode emoji ranges)
  clean = clean.replace(/[\u{1F600}-\u{1F64F}]/gu, ''); // Emoticons
  clean = clean.replace(/[\u{1F300}-\u{1F5FF}]/gu, ''); // Symbols & Pictographs
  clean = clean.replace(/[\u{1F680}-\u{1F6FF}]/gu, ''); // Transport & Map
  clean = clean.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, ''); // Flags
  clean = clean.replace(/[\u{2600}-\u{26FF}]/gu, '');   // Misc symbols
  clean = clean.replace(/[\u{2700}-\u{27BF}]/gu, '');   // Dingbats
  clean = clean.replace(/[\u{1F900}-\u{1F9FF}]/gu, ''); // Supplemental Symbols
  clean = clean.replace(/[\u{1FA00}-\u{1FA6F}]/gu, ''); // Extended Symbols
  clean = clean.replace(/[\u{1FA70}-\u{1FAFF}]/gu, ''); // Symbols and Pictographs Extended-A

  // Retirer les tableaux Markdown (lignes avec |)
  clean = clean.replace(/^\|.*\|$/gm, '');
  clean = clean.replace(/^\s*[\|\-\+:]+\s*$/gm, '');

  // Code blocks
  clean = clean.replace(/```[\s\S]*?```/g, '');

  // Inline code
  clean = clean.replace(/`([^`]+)`/g, '$1');

  // Headers
  clean = clean.replace(/^#{1,6}\s+/gm, '');

  // Bold/Italic
  clean = clean.replace(/\*\*([^*]+)\*\*/g, '$1');
  clean = clean.replace(/\*([^*]+)\*/g, '$1');
  clean = clean.replace(/__([^_]+)__/g, '$1');
  clean = clean.replace(/_([^_]+)_/g, '$1');

  // Links
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Lists
  clean = clean.replace(/^[\*\-\+]\s+/gm, '');
  clean = clean.replace(/^\d+\.\s+/gm, '');

  // Blockquotes
  clean = clean.replace(/^>\s+/gm, '');

  // Horizontal rules
  clean = clean.replace(/^[\-\*_]{3,}$/gm, '');

  // Nettoyer les lignes vides multiples
  clean = clean.replace(/\n{3,}/g, '\n\n');

  return clean.trim();
}

async function speakText(text) {
  // Charger la config TTS
  const result = await new Promise(resolve => {
    chrome.storage.local.get(['config'], resolve);
  });
  const cfg = result.config || {};

  if (!cfg.speechEnabled) {
    showToast('TTS desactive dans les options');
    return;
  }

  // Arreter la lecture en cours
  speechSynthesis.cancel();

  // Nettoyer le Markdown
  const cleanText = stripMarkdown(text);

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = cfg.speechRate || 1;
  utterance.pitch = cfg.speechPitch || 1;

  // Trouver la voix
  if (cfg.speechVoiceName) {
    const voices = speechSynthesis.getVoices();
    const voice = voices.find(v => v.name === cfg.speechVoiceName);
    if (voice) utterance.voice = voice;
  }

  // Afficher le conteneur de controle et le bouton stop speech
  if (elements.controlButtons) {
    elements.controlButtons.style.display = 'flex';
  }
  if (elements.btnStopSpeech) {
    elements.btnStopSpeech.style.display = 'flex';
  }
  // Masquer le bouton stop generation si on n'est pas en generation
  if (!isGenerating && elements.btnStopGeneration) {
    elements.btnStopGeneration.style.display = 'none';
  }

  // Masquer le bouton quand la lecture est terminee
  utterance.onend = () => {
    if (elements.btnStopSpeech) {
      elements.btnStopSpeech.style.display = 'none';
    }
    // Masquer le conteneur si on n'est pas en generation
    if (!isGenerating && elements.controlButtons) {
      elements.controlButtons.style.display = 'none';
    }
    // Reafficher le bouton stop generation
    if (elements.btnStopGeneration) {
      elements.btnStopGeneration.style.display = 'flex';
    }
  };

  utterance.onerror = () => {
    if (elements.btnStopSpeech) {
      elements.btnStopSpeech.style.display = 'none';
    }
    // Masquer le conteneur si on n'est pas en generation
    if (!isGenerating && elements.controlButtons) {
      elements.controlButtons.style.display = 'none';
    }
    // Reafficher le bouton stop generation
    if (elements.btnStopGeneration) {
      elements.btnStopGeneration.style.display = 'flex';
    }
  };

  speechSynthesis.speak(utterance);
}

function stopGeneration() {
  if (currentPort) {
    currentPort.disconnect();
    currentPort = null;
  }
  isGenerating = false;
  if (elements.controlButtons) {
    elements.controlButtons.style.display = 'none';
  }
  showToast('Generation arretee');
}

function stopSpeech() {
  speechSynthesis.cancel();
  if (elements.btnStopSpeech) {
    elements.btnStopSpeech.style.display = 'none';
  }
}

// === UTILITAIRES ===
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;

  // Aujourd'hui
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Cette semaine
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }

  // Plus ancien
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
  if (autoScroll && !userScrolledUp) {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
  }
}

function isScrolledToBottom() {
  const container = elements.messagesContainer;
  return container.scrollHeight - container.scrollTop - container.clientHeight < 50;
}

function showError(message) {
  const lang = getCurrentLanguage();
  const t = translations[lang] || translations.fr;

  const errorEl = document.createElement('div');
  errorEl.className = 'message assistant error';
  setTrustedHTML(errorEl, `
    <div class="message-avatar" style="background: var(--chat-danger);">!</div>
    <div class="message-content">
      <div class="message-text" style="color: var(--chat-danger);">
        ${t.error || 'Erreur'}: ${escapeHtml(message)}
      </div>
    </div>
  `);
  elements.messagesWrapper.appendChild(errorEl);
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--chat-accent);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 13px;
    z-index: 1000;
    animation: fadeInOut 2s ease;
  `);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// Ajouter l'animation CSS pour le toast
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
    15% { opacity: 1; transform: translateX(-50%) translateY(0); }
    85% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
  }
`);
document.head.appendChild(style);

