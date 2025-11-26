// Results Page Script - IA Helper

// Configuration
let config = {
  ollamaUrl: 'http://localhost:11434',
  selectedModel: ''
};

let pendingResult = null;
let currentResult = '';
let startTime = 0;

// Elements DOM
const elements = {
  actionName: document.getElementById('action-name'),
  originalContent: document.getElementById('original-content'),
  resultContent: document.getElementById('result-content'),
  statusDot: document.querySelector('.status-dot'),
  statusText: document.querySelector('.status-text'),
  tokenCount: document.getElementById('token-count'),
  generationTime: document.getElementById('generation-time'),
  customPrompt: document.getElementById('custom-prompt')
};

// Noms des actions
const ACTION_NAMES = {
  correct_errors: 'Correction',
  translate: 'Traduction',
  reformat_mail_pro: 'Mail Pro',
  expand_content: 'Developpement',
  summarize_input: 'Resume',
  improve_style: 'Style',
  summarize: 'Resume',
  explain_chronology: 'Chronologie',
  explain_simple: 'Explication',
  extract_key_points: 'Points cles',
  analyze_sentiment: 'Sentiment',
  summarize_ticket: 'Resume Ticket',
  last_client_message: 'Dernier Message',
  current_situation: 'Situation',
  ticket_chronology: 'Chronologie Ticket',
  suggest_response: 'Suggestion',
  extract_action_items: 'Actions'
};

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  await loadPendingResult();
  setupEventListeners();
  
  if (pendingResult) {
    startGeneration();
  }
});

// Charger la configuration
async function loadConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['config'], (result) => {
      if (result.config) {
        config = { ...config, ...result.config };
      }
      resolve();
    });
  });
}

// Charger le resultat en attente
async function loadPendingResult() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['pendingResult'], (result) => {
      if (result.pendingResult) {
        pendingResult = result.pendingResult;
        
        // Afficher l'action
        elements.actionName.textContent = ACTION_NAMES[pendingResult.actionId] || pendingResult.actionId;
        
        // Afficher le contenu original
        elements.originalContent.textContent = pendingResult.content;
        
        // Nettoyer
        chrome.storage.local.remove(['pendingResult']);
      }
      resolve();
    });
  });
}

// Setup des event listeners
function setupEventListeners() {
  // Menu copie dropdown
  const copyMenuBtn = document.getElementById('btn-copy-menu');
  const copyMenu = document.getElementById('copy-menu');

  copyMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    copyMenu.classList.toggle('active');
  });

  // Fermer le menu au clic ailleurs
  document.addEventListener('click', () => {
    copyMenu.classList.remove('active');
  });

  // Copier en Markdown (texte brut avec formatage MD)
  document.getElementById('btn-copy-markdown').addEventListener('click', () => {
    navigator.clipboard.writeText(currentResult);
    copyMenu.classList.remove('active');
    showNotification('Copie en Markdown !');
  });

  // Copier en texte brut (sans formatage)
  document.getElementById('btn-copy-text').addEventListener('click', () => {
    // Supprimer les caracteres Markdown
    const plainText = currentResult
      .replace(/#{1,6}\s/g, '')           // Titres
      .replace(/\*\*(.+?)\*\*/g, '$1')    // Gras
      .replace(/\*(.+?)\*/g, '$1')        // Italique
      .replace(/__(.+?)__/g, '$1')        // Gras alt
      .replace(/_(.+?)_/g, '$1')          // Italique alt
      .replace(/`(.+?)`/g, '$1')          // Code inline
      .replace(/```[\s\S]*?```/g, '')     // Blocs de code
      .replace(/^\s*[-*+]\s/gm, '')       // Listes
      .replace(/^\s*\d+\.\s/gm, '')       // Listes numerotees
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Liens
      .replace(/!\[.*?\]\(.+?\)/g, '')    // Images
      .replace(/>\s/g, '')                // Citations
      .trim();
    navigator.clipboard.writeText(plainText);
    copyMenu.classList.remove('active');
    showNotification('Copie en texte brut !');
  });

  // Copier en HTML
  document.getElementById('btn-copy-html').addEventListener('click', () => {
    const html = convertMarkdownToHtml(currentResult);
    navigator.clipboard.writeText(html);
    copyMenu.classList.remove('active');
    showNotification('Copie en HTML !');
  });

  // Fermer
  document.getElementById('btn-close').addEventListener('click', () => {
    window.close();
  });
  
  // Refinement buttons
  document.getElementById('btn-regenerate').addEventListener('click', () => regenerate());
  document.getElementById('btn-shorter').addEventListener('click', () => refine('Fais une version plus courte et concise.'));
  document.getElementById('btn-longer').addEventListener('click', () => refine('Developpe davantage avec plus de details.'));
  document.getElementById('btn-formal').addEventListener('click', () => refine('Reformule de maniere plus formelle et professionnelle.'));
  document.getElementById('btn-casual').addEventListener('click', () => refine('Reformule de maniere plus decontractee et accessible.'));
  
  // Custom prompt
  document.getElementById('btn-send-custom').addEventListener('click', () => {
    const customPrompt = elements.customPrompt.value.trim();
    if (customPrompt) {
      refine(customPrompt);
      elements.customPrompt.value = '';
    }
  });
  
  // Toggle original
  document.getElementById('btn-toggle-original').addEventListener('click', (e) => {
    const panel = document.querySelector('.panel-original');
    const content = elements.originalContent;
    if (content.style.display === 'none') {
      content.style.display = 'block';
      e.target.textContent = 'Reduire';
    } else {
      content.style.display = 'none';
      e.target.textContent = 'Afficher';
    }
  });
}

// Demarrer la generation
async function startGeneration() {
  if (!config.selectedModel) {
    showError('Aucun modele configure. Veuillez configurer un modele dans les options.');
    return;
  }
  
  setStatus('generating', 'Generation en cours...');
  startTime = Date.now();
  currentResult = '';
  elements.resultContent.innerHTML = '<span class="streaming-cursor"></span>';
  
  try {
    const response = await fetch(`${config.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.selectedModel,
        prompt: pendingResult.content,
        system: pendingResult.systemPrompt,
        stream: true
      })
    });

    if (!response.ok) throw new Error(`Erreur: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            currentResult += json.response;
            elements.resultContent.innerHTML = currentResult + '<span class="streaming-cursor"></span>';
          }
        } catch (e) {}
      }
    }

    elements.resultContent.innerHTML = currentResult;
    setStatus('done', 'Termine');
    updateStats();

  } catch (error) {
    showError(error.message);
  }
}

// Regenerer
async function regenerate() {
  if (pendingResult) {
    startGeneration();
  }
}

// Affiner avec un prompt supplementaire
async function refine(additionalPrompt) {
  if (!currentResult) {
    showNotification('Aucun resultat a affiner', 'error');
    return;
  }

  setStatus('generating', 'Affinage en cours...');
  startTime = Date.now();

  try {
    const response = await fetch(`${config.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.selectedModel,
        prompt: `Voici le texte a modifier:\n\n${currentResult}\n\nInstruction: ${additionalPrompt}`,
        stream: true
      })
    });

    if (!response.ok) throw new Error(`Erreur: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    currentResult = '';
    elements.resultContent.innerHTML = '<span class="streaming-cursor"></span>';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            currentResult += json.response;
            elements.resultContent.innerHTML = currentResult + '<span class="streaming-cursor"></span>';
          }
        } catch (e) {}
      }
    }

    elements.resultContent.innerHTML = currentResult;
    setStatus('done', 'Affinage termine');
    updateStats();

  } catch (error) {
    showError(error.message);
  }
}

// Mettre a jour le statut
function setStatus(status, text) {
  elements.statusDot.className = `status-dot ${status}`;
  elements.statusText.textContent = text;
}

// Mettre a jour les stats
function updateStats() {
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  elements.generationTime.textContent = `${duration}s`;

  // Estimation approximative des tokens
  const tokens = Math.round(currentResult.length / 4);
  elements.tokenCount.textContent = `~${tokens} tokens`;
}

// Afficher une erreur
function showError(message) {
  setStatus('error', 'Erreur');
  elements.resultContent.innerHTML = `<p style="color: var(--error);">Erreur: ${message}</p>`;
}

// Afficher une notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 10px;
    color: white;
    font-size: 14px;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
  `;

  if (type === 'error') {
    notification.style.background = 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)';
  } else {
    notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 2000);
}

// Convertir Markdown en HTML basique
function convertMarkdownToHtml(markdown) {
  return markdown
    // Titres
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Gras et italique
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Liens
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // Listes
    .replace(/^\s*[-*+]\s(.+)$/gm, '<li>$1</li>')
    // Paragraphes
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}
