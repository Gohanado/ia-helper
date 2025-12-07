// Results Page Script - IA Helper
import { t, getCurrentLanguage } from '../i18n/translations.js';
import { setTrustedHTML } from '../utils/dom-sanitizer.js';

// Langue courante
let currentLang = 'en';

// Configuration
let config = {
  provider: 'ollama',
  apiUrl: 'http://localhost:11434',
  apiKey: '',
  selectedModel: '',
  interfaceLanguage: 'en',
  speechEnabled: true,
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVoiceName: '',
  speechLanguageMode: 'auto',
  speechFixedLanguage: 'en'
};

let pendingResult = null;
let currentResult = '';
let startTime = 0;

// Variables TTS
let isSpeaking = false;
let currentSpeechUtterance = null;

// Port de streaming
let currentPort = null;

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
  currentLang = config.interfaceLanguage || 'en';
  applyTranslations();
  await loadPendingResult();
  setupEventListeners();

  if (pendingResult) {
    // Si on a un resultat pre-genere, l'afficher directement
    if (pendingResult.preGeneratedResult) {
      currentResult = pendingResult.preGeneratedResult;
      const html = convertMarkdownToHtml(currentResult);
      setTrustedHTML(elements.resultContent, '<div class="markdown-body">' + html + '</div>');
      setStatus('done', t('generating', currentLang).replace('...', ''));
      updateStats();
    } else {
      startGeneration();
    }
  }
});

// Appliquer les traductions
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key, currentLang);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key, currentLang);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.title = t(key, currentLang);
  });
}

// Nettoyer le texte Markdown pour la lecture
function cleanTextForSpeech(text) {
  return text
    .replace(/#{1,6}\s/g, '')           // Titres
    .replace(/\*\*(.+?)\*\*/g, '$1')    // Gras
    .replace(/\*(.+?)\*/g, '$1')        // Italique
    .replace(/__(.+?)__/g, '$1')        // Gras alt
    .replace(/_(.+?)_/g, '$1')          // Italique alt
    .replace(/`{3}[\s\S]*?`{3}/g, '')   // Blocs de code
    .replace(/`(.+?)`/g, '$1')          // Code inline
    .replace(/^[-*+]\s/gm, '')          // Listes
    .replace(/^\d+\.\s/gm, '')          // Listes numerotees
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Liens
    .replace(/!\[.*?\]\(.+?\)/g, '')    // Images
    .replace(/>\s/g, '')                // Citations
    .trim();
}

// Mapping des langues pour la synthese vocale
const LANG_MAP = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', it: 'it-IT', pt: 'pt-BR' };
const LANG_NAMES = { fr: 'French', en: 'English', es: 'Spanish', it: 'Italian', pt: 'Portuguese' };

// Detecter la langue d'un texte (detection rapide cote client)
function detectLanguage(text) {
  const sample = text.toLowerCase().substring(0, 500);

  // Mots courants par langue
  const patterns = {
    fr: ['le', 'la', 'les', 'de', 'et', 'est', 'un', 'une', 'dans', 'pour', 'que', 'qui', 'avec', 'sur', 'par', 'ce', 'cette', 'sont', 'des', 'du'],
    en: ['the', 'is', 'are', 'and', 'or', 'of', 'to', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'this', 'that', 'was', 'were', 'have', 'has'],
    es: ['el', 'la', 'los', 'las', 'de', 'y', 'es', 'en', 'un', 'una', 'por', 'para', 'con', 'que', 'del', 'al', 'se', 'lo', 'su', 'como'],
    it: ['il', 'la', 'le', 'di', 'e', 'un', 'una', 'per', 'con', 'che', 'del', 'della', 'sono', 'nel', 'nella', 'da', 'come', 'questo', 'questa'],
    pt: ['o', 'a', 'os', 'as', 'de', 'e', 'um', 'uma', 'para', 'com', 'que', 'do', 'da', 'em', 'por', 'se', 'no', 'na', 'como', 'mais']
  };

  // Compter les correspondances pour chaque langue
  const scores = {};
  for (const [lang, words] of Object.entries(patterns)) {
    scores[lang] = 0;
    for (const word of words) {
      // Chercher le mot entoure d'espaces ou de ponctuation
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = sample.match(regex);
      if (matches) {
        scores[lang] += matches.length;
      }
    }
  }

  // Trouver la langue avec le score le plus eleve
  let maxScore = 0;
  let detectedLang = 'en';
  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  }

  // Si aucune correspondance significative, retourner la langue de l'interface
  return maxScore > 2 ? detectedLang : (config.interfaceLanguage || 'en');
}

// Traduire un texte dans une langue cible via l'IA
async function translateText(text, targetLang) {
  return new Promise((resolve) => {
    const targetLangName = LANG_NAMES[targetLang] || 'French';
    const prompt = `Translate the following text to ${targetLangName}. Respond ONLY with the translation, no explanations:\n\n${text}`;

    const port = chrome.runtime.connect({ name: 'ollama-stream' });
    let response = '';

    port.onMessage.addListener((msg) => {
      if (msg.type === 'chunk') {
        response += msg.content || '';
      } else if (msg.type === 'done' || msg.type === 'error') {
        port.disconnect();
        resolve(response.trim() || text);
      }
    });

    port.postMessage({
      type: 'generate',
      config: {
        provider: config.provider,
        apiUrl: config.apiUrl,
        apiKey: config.apiKey,
        selectedModel: config.selectedModel,
        streamingEnabled: false
      },
      prompt: prompt,
      systemPrompt: 'You are a professional translator. Translate accurately.'
    });

    setTimeout(() => { port.disconnect(); resolve(text); }, 30000);
  });
}

// Obtenir une voix par son nom, ou une voix par defaut pour la langue
function getVoiceByNameOrLang(voiceName, langCode) {
  let voices = window.speechSynthesis.getVoices();

  // Si les voix ne sont pas encore chargees, attendre un peu
  if (voices.length === 0) {
    // Forcer le chargement des voix
    window.speechSynthesis.getVoices();
    voices = window.speechSynthesis.getVoices();
  }

  // Si un nom de voix est specifie, le chercher
  if (voiceName) {
    const namedVoice = voices.find(v => v.name === voiceName);
    if (namedVoice) return namedVoice;
  }

  // Sinon, chercher une voix pour la langue cible
  const targetLang = LANG_MAP[langCode] || 'fr-FR';
  const langPrefix = targetLang.split('-')[0];

  const langVoices = voices.filter(v =>
    v.lang.startsWith(langPrefix) || v.lang === targetLang
  );

  return langVoices.length > 0 ? langVoices[0] : null;
}

// Lancer/arreter la lecture vocale
async function toggleSpeech() {
  const speakBtn = document.getElementById('btn-speak');

  if (!('speechSynthesis' in window)) {
    showNotification(t('speechNotSupported', currentLang) || 'Speech not supported', 'error');
    return;
  }

  if (isSpeaking) {
    // Arreter la lecture
    window.speechSynthesis.cancel();
    isSpeaking = false;
    speakBtn.classList.remove('speaking');
    speakBtn.title = t('speak', currentLang);
    return;
  }

  const cleanText = cleanTextForSpeech(currentResult);
  if (!cleanText) {
    showNotification(t('noTextToRead', currentLang) || 'No text to read', 'error');
    return;
  }

  // S'assurer que les voix sont chargees
  await new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', () => resolve(), { once: true });
      // Timeout de securite
      setTimeout(() => resolve(), 1000);
    }
  });

  // Determiner la langue et le texte a lire
  let textToRead = cleanText;
  let targetLang = config.speechFixedLanguage || 'en';

  if (config.speechLanguageMode === 'auto') {
    // Mode automatique: detecter la langue du texte (rapide, cote client)
    targetLang = detectLanguage(cleanText);
  } else {
    // Mode fixe: verifier si traduction necessaire
    const detectedLang = detectLanguage(cleanText);
    if (detectedLang !== targetLang) {
      speakBtn.classList.add('speaking');
      speakBtn.title = t('translatingText', currentLang) || 'Translating...';
      try {
        textToRead = await translateText(cleanText, targetLang);
      } catch (e) {
        // En cas d'erreur, lire le texte original
      }
    }
  }

  // Creer l'utterance
  currentSpeechUtterance = new SpeechSynthesisUtterance(textToRead);
  currentSpeechUtterance.lang = LANG_MAP[targetLang] || 'fr-FR';

  // Vitesse et pitch (depuis les options)
  currentSpeechUtterance.rate = config.speechRate || 1.0;
  currentSpeechUtterance.pitch = config.speechPitch || 1.0;

  // Selectionner la voix sauvegardee ou par defaut pour la langue
  const voice = getVoiceByNameOrLang(config.speechVoiceName, targetLang);
  if (voice) {
    currentSpeechUtterance.voice = voice;
  }

  // Evenements
  currentSpeechUtterance.onstart = () => {
    isSpeaking = true;
    speakBtn.classList.add('speaking');
    speakBtn.title = t('stopSpeaking', currentLang);
  };

  currentSpeechUtterance.onend = () => {
    isSpeaking = false;
    speakBtn.classList.remove('speaking');
    speakBtn.title = t('speak', currentLang);
  };

  currentSpeechUtterance.onerror = () => {
    isSpeaking = false;
    speakBtn.classList.remove('speaking');
    speakBtn.title = t('speak', currentLang);
  };

  // Lancer la lecture
  window.speechSynthesis.speak(currentSpeechUtterance);
}

// Charger la configuration
async function loadConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['config'], (result) => {
      if (result.config) {
        config = { ...config, ...result.config };
      }
      console.log('IA Helper Results: Config chargee', config);
      console.log('IA Helper Results: apiUrl =', config.apiUrl);
      console.log('IA Helper Results: selectedModel =', config.selectedModel);
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
    showNotification(t('copied', currentLang) + ' (Markdown)');
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
    showNotification(t('copied', currentLang) + ' (' + t('copyText', currentLang).replace('Copier en ', '').replace('Copy as ', '') + ')');
  });

  // Copier en HTML
  document.getElementById('btn-copy-html').addEventListener('click', () => {
    const html = convertMarkdownToHtml(currentResult);
    navigator.clipboard.writeText(html);
    copyMenu.classList.remove('active');
    showNotification(t('copied', currentLang) + ' (HTML)');
  });

  // Options
  document.getElementById('btn-settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Lecture vocale (si activee)
  const speakBtn = document.getElementById('btn-speak');
  if (config.speechEnabled !== false) {
    speakBtn.addEventListener('click', toggleSpeech);
  } else {
    speakBtn.style.display = 'none';
  }

  // Bouton stop generation
  const stopBtn = document.getElementById('btn-stop-generation');
  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      if (currentPort) {
        try {
          currentPort.disconnect();
        } catch (e) {
          // Ignorer les erreurs
        }
        currentPort = null;
        stopBtn.style.display = 'none';
        setStatus('error', t('generationStopped', currentLang));
      }
    });
  }

  // Refinement buttons - prompts sont en anglais pour l'IA
  document.getElementById('btn-regenerate').addEventListener('click', () => regenerate());
  document.getElementById('btn-shorter').addEventListener('click', () => refine('Make a shorter and more concise version.'));
  document.getElementById('btn-longer').addEventListener('click', () => refine('Expand with more details.'));
  document.getElementById('btn-formal').addEventListener('click', () => refine('Rephrase in a more formal and professional way.'));
  document.getElementById('btn-casual').addEventListener('click', () => refine('Rephrase in a more casual and accessible way.'));

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
    const content = elements.originalContent;
    if (content.style.display === 'none') {
      content.style.display = 'block';
      e.target.textContent = t('reduce', currentLang);
    } else {
      content.style.display = 'none';
      e.target.textContent = t('expand', currentLang);
    }
  });
}

// Demarrer la generation
async function startGeneration() {
  if (!config.selectedModel) {
    showError(t('connectionError', currentLang) || 'No model configured');
    return;
  }

  setStatus('generating', t('generating', currentLang));
  startTime = Date.now();
  currentResult = '';

  // Creer la structure DOM une seule fois
  elements.resultContent.innerHTML = '';
  const markdownBody = document.createElement('div');
  markdownBody.className = 'markdown-body';
  const cursor = document.createElement('span');
  cursor.className = 'streaming-cursor';
  elements.resultContent.appendChild(markdownBody);
  elements.resultContent.appendChild(cursor);

  try {
    // Utiliser le port de streaming comme dans chat.js
    currentPort = chrome.runtime.connect({ name: 'streaming' });
    let updateScheduled = false;

    // Afficher le bouton stop
    const stopBtn = document.getElementById('btn-stop-generation');
    if (stopBtn) {
      stopBtn.style.display = 'flex';
    }

    currentPort.onMessage.addListener((msg) => {
      if (msg.type === 'ping') {
        // Ignorer les messages de keep-alive
        return;
      } else if (msg.type === 'chunk') {
        currentResult += msg.text;

        // Throttle avec requestAnimationFrame pour limiter a 60fps
        if (!updateScheduled) {
          updateScheduled = true;
          requestAnimationFrame(() => {
            const html = convertMarkdownToHtml(currentResult);
            setTrustedHTML(markdownBody, html);
            updateScheduled = false;
          });
        }
      } else if (msg.type === 'done') {
        currentPort.disconnect();
        currentPort = null;

        // Masquer le bouton stop
        const stopBtn = document.getElementById('btn-stop-generation');
        if (stopBtn) {
          stopBtn.style.display = 'none';
        }

        // Finaliser: supprimer le curseur et parser le markdown
        cursor.remove();
        const html = convertMarkdownToHtml(currentResult);
        setTrustedHTML(markdownBody, html);
        setStatus('done', t('generating', currentLang).replace('...', ''));
        updateStats();
      } else if (msg.type === 'error') {
        currentPort.disconnect();
        currentPort = null;

        // Masquer le bouton stop
        const stopBtn = document.getElementById('btn-stop-generation');
        if (stopBtn) {
          stopBtn.style.display = 'none';
        }

        showError(msg.error);
      }
    });

    // Envoyer la requete
    currentPort.postMessage({
      type: 'GENERATE_STREAMING',
      content: pendingResult.content,
      systemPrompt: pendingResult.systemPrompt,
      agentParams: {
        model: config.selectedModel
      }
    });

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
    showNotification(t('nothingToCopy', currentLang) || 'Nothing to refine', 'error');
    return;
  }

  setStatus('generating', t('generating', currentLang));
  startTime = Date.now();

  const previousResult = currentResult;
  currentResult = '';

  // Creer la structure DOM une seule fois
  elements.resultContent.innerHTML = '';
  const markdownBody = document.createElement('div');
  markdownBody.className = 'markdown-body';
  const cursor = document.createElement('span');
  cursor.className = 'streaming-cursor';
  elements.resultContent.appendChild(markdownBody);
  elements.resultContent.appendChild(cursor);

  try {
    // Utiliser le port de streaming comme dans chat.js
    currentPort = chrome.runtime.connect({ name: 'streaming' });

    // Afficher le bouton stop
    const stopBtn = document.getElementById('btn-stop-generation');
    if (stopBtn) {
      stopBtn.style.display = 'flex';
    }

    currentPort.onMessage.addListener((msg) => {
      if (msg.type === 'ping') {
        // Ignorer les messages de keep-alive
        return;
      } else if (msg.type === 'chunk') {
        currentResult += msg.text;
        // Parser le markdown en live comme dans chat.js
        const html = convertMarkdownToHtml(currentResult);
        setTrustedHTML(markdownBody, html);
      } else if (msg.type === 'done') {
        currentPort.disconnect();
        currentPort = null;

        // Masquer le bouton stop
        const stopBtn = document.getElementById('btn-stop-generation');
        if (stopBtn) {
          stopBtn.style.display = 'none';
        }

        // Finaliser: supprimer le curseur et afficher le resultat final
        cursor.remove();
        const html = convertMarkdownToHtml(currentResult);
        setTrustedHTML(markdownBody, html);
        setStatus('done', t('generating', currentLang).replace('...', ''));
        updateStats();
      } else if (msg.type === 'error') {
        currentPort.disconnect();
        currentPort = null;

        // Masquer le bouton stop
        const stopBtn = document.getElementById('btn-stop-generation');
        if (stopBtn) {
          stopBtn.style.display = 'none';
        }

        showError(msg.error);
      }
    });

    // Envoyer la requete
    currentPort.postMessage({
      type: 'GENERATE_STREAMING',
      content: `Voici le texte a modifier:\n\n${previousResult}\n\nInstruction: ${additionalPrompt}`,
      systemPrompt: '',
      agentParams: {
        model: config.selectedModel
      }
    });

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
  setStatus('error', t('error', currentLang));
  setTrustedHTML(elements.resultContent, `<p style="color: var(--error));">${t('error', currentLang)}: ${message}</p>`);
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

// Convertir Markdown en HTML complet
function convertMarkdownToHtml(markdown) {
  if (!markdown) return '';

  let html = markdown;

  // Echapper les caracteres HTML dangereux
  html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Blocs de code (```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const langClass = lang ? ` class="language-${lang}"` : '';
    return `<pre><code${langClass}>${code.trim()}</code></pre>`;
  });

  // Code inline (`)
  html = html.replace(/`([^`]+)`/g, '<code class="inline">$1</code>');

  // Titres
  html = html.replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Gras et italique (ordre important)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Barre (strikethrough)
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Citations
  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Lignes horizontales
  html = html.replace(/^[-*_]{3,}$/gm, '<hr>');

  // Liens
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Listes non ordonnees
  html = html.replace(/^[\s]*[-*+]\s+(.+)$/gm, '<li>$1</li>');

  // Listes ordonnees
  html = html.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li class="ordered">$1</li>');

  // Regrouper les <li> consecutifs en <ul> ou <ol>
  html = html.replace(/(<li class="ordered">.*<\/li>\n?)+/g, (match) => {
    return '<ol>' + match.replace(/ class="ordered"/g, '') + '</ol>';
  });
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    if (!match.includes('<ol>')) {
      return '<ul>' + match + '</ul>';
    }
    return match;
  });

  // Fusionner les blockquotes consecutifs
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '<br>');

  // Tableaux simples
  html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
    const cells = content.split('|').map(c => c.trim());
    const isHeader = cells.some(c => /^[-:]+$/.test(c));
    if (isHeader) return ''; // Ligne de separation
    const tag = 'td';
    return '<tr>' + cells.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
  });
  html = html.replace(/(<tr>.*<\/tr>\n?)+/g, (match) => {
    return '<table>' + match + '</table>';
  });

  // Paragraphes (lignes non vides qui ne sont pas deja dans un tag)
  const lines = html.split('\n');
  const processedLines = [];
  let inParagraph = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isBlockElement = /^<(h[1-6]|ul|ol|li|pre|blockquote|hr|table|tr|td|th)/.test(line) ||
                           /<\/(ul|ol|pre|blockquote|table)>$/.test(line);

    if (line === '') {
      if (inParagraph) {
        processedLines.push('</p>');
        inParagraph = false;
      }
      processedLines.push('');
    } else if (isBlockElement) {
      if (inParagraph) {
        processedLines.push('</p>');
        inParagraph = false;
      }
      processedLines.push(line);
    } else {
      if (!inParagraph) {
        processedLines.push('<p>' + line);
        inParagraph = true;
      } else {
        processedLines.push('<br>' + line);
      }
    }
  }

  if (inParagraph) {
    processedLines.push('</p>');
  }

  return processedLines.join('\n');
}

