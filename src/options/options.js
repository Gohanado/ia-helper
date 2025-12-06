// Options Page Script - IA Helper

import { t } from '../i18n/translations.js';
import { DEFAULT_AGENT, BUILTIN_AGENTS, BUILTIN_AGENTS_LIST, createCustomAgent } from '../config/agents.js';
import { setTrustedHTML } from '../utils/dom-sanitizer.js';

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
  inlinePopupEnabled: true,
  directInputEnabled: false,
  directInputMode: 'replace',
  interfaceLanguage: 'fr',
  responseLanguage: 'fr',
  speechEnabled: true,
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVoiceName: '',
  speechLanguageMode: 'auto',
  speechFixedLanguage: 'fr'
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

// Actions de base avec prompts
const BASE_ACTIONS = {
  // === ESSENTIELS ===
  correct_errors: { id: 'correct_errors', name: 'Corriger l\'orthographe', description: 'Corrige les fautes', prompt: 'Corrige les fautes. Retourne uniquement le texte corrige.', category: 'essential', defaultEnabled: true },
  summarize: { id: 'summarize', name: 'Resumer', description: 'Resume le texte', prompt: 'Resume en un paragraphe fluide. Pas de listes ni tableaux.', category: 'essential', defaultEnabled: true },
  explain_simple: { id: 'explain_simple', name: 'Expliquer simplement', description: 'Explique simplement', prompt: 'Explique simplement. Texte fluide, pas de listes ni tableaux.', category: 'essential', defaultEnabled: true },
  improve_style: { id: 'improve_style', name: 'Ameliorer le style', description: 'Ameliore la clarte', prompt: 'Ameliore le style. Pas de formatage special.', category: 'essential', defaultEnabled: true },
  expand_content: { id: 'expand_content', name: 'Developper', description: 'Developpe le texte', prompt: 'Developpe avec plus de details. Style fluide, pas de tableaux.', category: 'essential', defaultEnabled: true },
  reformat_mail_pro: { id: 'reformat_mail_pro', name: 'Email professionnel', description: 'Format email pro', prompt: 'Transforme en email professionnel. Texte fluide, pas de tableaux.', category: 'essential', defaultEnabled: true },
  // === PRATIQUES ===
  bullet_points: { id: 'bullet_points', name: 'Liste a puces', description: 'Convertit en liste', prompt: 'Convertis en liste avec des tirets simples. Pas de tableaux.', category: 'practical', defaultEnabled: false },
  extract_key_points: { id: 'extract_key_points', name: 'Points cles', description: 'Extrait l\'essentiel', prompt: 'Donne 3-5 points essentiels avec des tirets. Pas de tableaux.', category: 'practical', defaultEnabled: false },
  make_shorter: { id: 'make_shorter', name: 'Raccourcir', description: 'Reduit la longueur', prompt: 'Raccourcis de moitie. Texte fluide.', category: 'practical', defaultEnabled: false },
  make_formal: { id: 'make_formal', name: 'Ton formel', description: 'Rend plus formel', prompt: 'Reecris en ton formel. Pas de formatage special.', category: 'practical', defaultEnabled: false },
  make_casual: { id: 'make_casual', name: 'Ton decontracte', description: 'Rend plus decontracte', prompt: 'Reecris en ton decontracte. Pas de formatage special.', category: 'practical', defaultEnabled: false },
  // === TECHNIQUES ===
  explain_code: { id: 'explain_code', name: 'Expliquer le code', description: 'Explique le code', prompt: 'Explique ce code clairement. Pas de tableaux.', category: 'technical', defaultEnabled: false },
  review_code: { id: 'review_code', name: 'Revue de code', description: 'Analyse le code', prompt: 'Revue de code avec tirets pour les points. Pas de tableaux.', category: 'technical', defaultEnabled: false },
  debug_help: { id: 'debug_help', name: 'Aide debug', description: 'Aide a debugger', prompt: 'Analyse l\'erreur et propose des solutions. Pas de tableaux.', category: 'technical', defaultEnabled: false },
  // === ANALYSE ===
  sentiment_analysis: { id: 'sentiment_analysis', name: 'Analyser le sentiment', description: 'Analyse le ton', prompt: 'Analyse le sentiment en 2-3 phrases. Pas de tableaux.', category: 'analysis', defaultEnabled: false }
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
let customPrompts = {}; // Prompts personnalises pour les actions de base

// Configuration actuelle
let config = { ...DEFAULT_CONFIG };
let enabledActions = [...DEFAULT_ENABLED_ACTIONS];
let customPresets = [];
let currentLang = 'fr';

// Agents
let customAgents = [];
let selectedAgent = null;
let editingAgentId = null;

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
    inlinePopupEnabled: document.getElementById('inline-popup-enabled'),
    interfaceLanguage: document.getElementById('interface-language'),
    responseLanguage: document.getElementById('response-language'),
    connectionStatus: document.getElementById('connection-status'),
    directInputEnabled: document.getElementById('direct-input-enabled'),
    directInputMode: document.getElementById('direct-input-mode'),
    directInputModeGroup: document.getElementById('direct-input-mode-group'),
    speechEnabled: document.getElementById('speech-enabled'),
    speechRate: document.getElementById('speech-rate'),
    speechRateValue: document.getElementById('speech-rate-value'),
    speechPitch: document.getElementById('speech-pitch'),
    speechPitchValue: document.getElementById('speech-pitch-value'),
    speechOptions: document.getElementById('speech-options'),
    speechTestGroup: document.getElementById('speech-test-group'),
    btnTestSpeech: document.getElementById('btn-test-speech'),
    speechVoice: document.getElementById('speech-voice'),
    speechVoiceGroup: document.getElementById('speech-voice-group'),
    speechLanguageMode: document.getElementById('speech-language-mode'),
    speechLanguageModeGroup: document.getElementById('speech-language-mode-group'),
    speechFixedLanguage: document.getElementById('speech-fixed-language'),
    speechFixedLanguageGroup: document.getElementById('speech-fixed-language-group'),
    btnPitchLow: document.getElementById('btn-pitch-low'),
    btnPitchHigh: document.getElementById('btn-pitch-high')
  };

  // Charger les voix disponibles
  loadAvailableVoices();

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
    await loadCustomAgents();
    applyTranslations();
    setupNavigation();
    setupEventListeners();
    setupProviderListeners();
    setupAgentsListeners();
    renderActionsGrid();
    renderShortcutsList();
    renderAgentsGrids();
    refreshModels();

    // Initialiser le systeme de mise a jour (en dernier, non-bloquant)
    initUpdateSystem();

    // Gerer le hash URL pour ouvrir directement un onglet
    handleHashNavigation();
  } catch (error) {
    console.error('IA Helper Options: Erreur initialisation', error);
  }
});

// Gerer la navigation par hash (ex: options.html#shortcuts)
function handleHashNavigation() {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const navItem = document.querySelector(`.nav-item[data-section="${hash}"]`);
    if (navItem) {
      navItem.click();
    }
  }
}

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
      if (elements.inlinePopupEnabled) elements.inlinePopupEnabled.checked = config.inlinePopupEnabled !== false;
      if (elements.directInputEnabled) elements.directInputEnabled.checked = config.directInputEnabled === true;
      if (elements.directInputMode) elements.directInputMode.value = config.directInputMode || 'replace';
      if (elements.interfaceLanguage) elements.interfaceLanguage.value = config.interfaceLanguage || 'fr';
      if (elements.responseLanguage) elements.responseLanguage.value = config.responseLanguage || 'auto';

      // Options de lecture vocale
      if (elements.speechEnabled) elements.speechEnabled.checked = config.speechEnabled !== false;
      if (elements.speechRate) {
        elements.speechRate.value = config.speechRate || 1.0;
        if (elements.speechRateValue) elements.speechRateValue.textContent = (config.speechRate || 1.0).toFixed(1) + 'x';
      }
      if (elements.speechPitch) {
        elements.speechPitch.value = config.speechPitch || 1.0;
        if (elements.speechPitchValue) elements.speechPitchValue.textContent = (config.speechPitch || 1.0).toFixed(1);
      }

      // Options TTS avancees
      if (elements.speechLanguageMode) {
        elements.speechLanguageMode.value = config.speechLanguageMode || 'auto';
      }
      if (elements.speechFixedLanguage) {
        elements.speechFixedLanguage.value = config.speechFixedLanguage || 'fr';
      }
      // La voix sera selectionnee dans loadAvailableVoices() apres chargement des voix

      updateSpeechOptionsVisibility();

      // Afficher/masquer le mode d'insertion selon l'etat du toggle
      updateDirectInputModeVisibility();

      updateProviderUI(config.provider);
      resolve();
    });
  });
}

// Afficher/masquer le selecteur de mode d'insertion
function updateDirectInputModeVisibility() {
  if (elements.directInputModeGroup && elements.directInputEnabled) {
    elements.directInputModeGroup.style.display = elements.directInputEnabled.checked ? 'block' : 'none';
  }
}

// Afficher/masquer les options de lecture vocale
function updateSpeechOptionsVisibility() {
  const isEnabled = elements.speechEnabled?.checked;
  const speechOptionsEls = document.querySelectorAll('#speech-options, #speech-pitch-group, #speech-test-group, #speech-voice-gender-group, #speech-language-mode-group');
  speechOptionsEls.forEach(el => {
    if (el) el.style.display = isEnabled ? 'block' : 'none';
  });

  // Afficher/masquer le selecteur de langue fixe selon le mode
  updateSpeechFixedLanguageVisibility();
}

// Afficher/masquer le selecteur de langue fixe
function updateSpeechFixedLanguageVisibility() {
  if (elements.speechFixedLanguageGroup && elements.speechLanguageMode) {
    const showFixed = elements.speechLanguageMode.value === 'fixed' && elements.speechEnabled?.checked;
    elements.speechFixedLanguageGroup.style.display = showFixed ? 'block' : 'none';
  }
}

// Charger les voix disponibles dans le selecteur
function loadAvailableVoices() {
  const populateVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!elements.speechVoice || voices.length === 0) return;

    // Vider le selecteur sauf la premiere option (defaut)
    while (elements.speechVoice.options.length > 1) {
      elements.speechVoice.remove(1);
    }

    // Grouper les voix par langue
    const voicesByLang = {};
    voices.forEach(voice => {
      const lang = voice.lang.split('-')[0];
      if (!voicesByLang[lang]) voicesByLang[lang] = [];
      voicesByLang[lang].push(voice);
    });

    // Ajouter les voix au selecteur, groupees par langue
    const langOrder = ['fr', 'en', 'es', 'it', 'pt'];
    const addedLangs = new Set();

    // D'abord les langues prioritaires
    langOrder.forEach(lang => {
      if (voicesByLang[lang]) {
        addedLangs.add(lang);
        voicesByLang[lang].forEach(voice => {
          const option = document.createElement('option');
          option.value = voice.name;
          option.textContent = `${voice.name} (${voice.lang})`;
          elements.speechVoice.appendChild(option);
        });
      }
    });

    // Puis les autres langues
    Object.keys(voicesByLang).sort().forEach(lang => {
      if (!addedLangs.has(lang)) {
        voicesByLang[lang].forEach(voice => {
          const option = document.createElement('option');
          option.value = voice.name;
          option.textContent = `${voice.name} (${voice.lang})`;
          elements.speechVoice.appendChild(option);
        });
      }
    });

    // Restaurer la selection sauvegardee
    if (config.speechVoiceName && elements.speechVoice) {
      elements.speechVoice.value = config.speechVoiceName;
    }
  };

  // Les voix peuvent ne pas etre chargees immediatement
  if (window.speechSynthesis.getVoices().length > 0) {
    populateVoices();
  }
  window.speechSynthesis.addEventListener('voiceschanged', populateVoices);
}

// Obtenir une voix par son nom
function getVoiceByName(voiceName) {
  if (!voiceName) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find(v => v.name === voiceName) || null;
}

// Variable pour stocker l'utterance de test en cours
let testSpeechUtterance = null;

// Mapping des langues
const LANG_MAP = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', it: 'it-IT', pt: 'pt-BR' };

// Tester la lecture vocale avec les parametres actuels
function testSpeech() {
  if (!('speechSynthesis' in window)) {
    showNotification(t('speechNotSupported', currentLang) || 'Speech not supported', 'error');
    return;
  }

  // Si deja en lecture, arreter
  if (testSpeechUtterance && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    elements.btnTestSpeech.textContent = t('testSpeech', currentLang);
    elements.btnTestSpeech.classList.remove('speaking');
    testSpeechUtterance = null;
    return;
  }

  // Texte de test selon la langue
  const testTexts = {
    fr: 'Bonjour, ceci est un test de lecture vocale. Vous pouvez ajuster la vitesse et la tonalite selon vos preferences.',
    en: 'Hello, this is a speech test. You can adjust the speed and pitch according to your preferences.',
    es: 'Hola, esta es una prueba de voz. Puede ajustar la velocidad y el tono segun sus preferencias.',
    it: 'Ciao, questo e un test vocale. Puoi regolare la velocita e il tono secondo le tue preferenze.',
    pt: 'Ola, este e um teste de voz. Voce pode ajustar a velocidade e o tom de acordo com suas preferencias.',
    de: 'Hallo, dies ist ein Sprachtest. Sie koennen die Geschwindigkeit und Tonhoehe nach Ihren Wuenschen anpassen.',
    nl: 'Hallo, dit is een spraaktest. U kunt de snelheid en toonhoogte naar wens aanpassen.',
    ru: 'Zdravstvuyte, eto test golosa. Vy mozhete nastroit skorost i ton po svoim predpochteniyam.',
    zh: 'Nin hao, zhe shi yuyin ceshi. Nin keyi genju ziji de xihao tiaozheng sudu he yindiao.',
    ja: 'Konnichiwa, kore wa onsei tesuto desu. Sokudo to pitchi wo okonomi ni awasete chousei dekimasu.',
    ko: 'Annyeonghaseyo, igeos-eun eumseong teseuteui ibnida. Sokdowa tongeul wonhaneun daelo jojeonhal su issseubnida.',
    ar: 'Marhaba, hadha ikhtbar sawti. Yumkinuk taadil alsura walnabra hasab tafdilatik.',
    hi: 'Namaste, yah ek awaaz ka pareekshan hai. Aap apni pasand ke anusaar gati aur swar ko samayojit kar sakte hain.',
    pl: 'Czesc, to jest test glosu. Mozesz dostosowac predkosc i ton wedlug wlasnych preferencji.',
    tr: 'Merhaba, bu bir ses testidir. Hizi ve tonu tercihlerinize gore ayarlayabilirsiniz.',
    sv: 'Hej, det har ar ett rosttest. Du kan justera hastigheten och tonhoejden efter dina oenskemael.',
    da: 'Hej, dette er en stemmetest. Du kan justere hastigheden og tonehojden efter dine praeferencer.',
    no: 'Hei, dette er en stemmetest. Du kan justere hastigheten og tonehoyden etter dine preferanser.',
    fi: 'Hei, tama on aanitesti. Voit saataa nopeutta ja aanenkorkeutta mieltymystesi mukaan.',
    cs: 'Ahoj, toto je hlasovy test. Muzete upravit rychlost a vysku podle svych preferencí.',
    el: 'Geia sas, afto einai ena test fonis. Mporite na prosamoste tin tachytita kai ton tono kata tis protimiseis sas.',
    he: 'Shalom, ze bdikhat kol. Ata yachol lehatim et hamehirut vehatonaliyut lefi hahaafahot shelcha.',
    th: 'Sawatdee, nee khue karn thotsob siang. Khun samard prab khwam rew lae siang tam thi khun tongkarn.',
    vi: 'Xin chao, day la bai kiem tra giong noi. Ban co the dieu chinh toc do va am theo so thich cua minh.',
    id: 'Halo, ini adalah tes suara. Anda dapat menyesuaikan kecepatan dan nada sesuai preferensi Anda.',
    ms: 'Halo, ini adalah ujian suara. Anda boleh melaraskan kelajuan dan nada mengikut pilihan anda.',
    uk: 'Pryvit, tse test holosu. Vy mozhete nalashtuvatyi shvydkist i ton vidpovidno do vashykh upodoban.',
    ro: 'Buna, acesta este un test vocal. Puteti ajusta viteza si tonul conform preferintelor dumneavoastra.',
    hu: 'Szia, ez egy hangteszt. A sebesseg es a hangmagassag a preferenciaidnak megfeleloen allithato.',
    bg: 'Zdravey, tova e glasov test. Mozhete da nastrayte skorostta i tona spored vashhite predpochtaniya.',
    ca: 'Hola, aixo es una prova de veu. Podeu ajustar la velocitat i el to segons les vostres preferencies.'
  };

  // Determiner la langue a utiliser : priorite a la voix selectionnee
  let testLang = currentLang;
  let selectedVoice = null;
  const selectedVoiceName = elements.speechVoice?.value;

  if (selectedVoiceName) {
    selectedVoice = getVoiceByName(selectedVoiceName);
    if (selectedVoice && selectedVoice.lang) {
      // Extraire le code langue (ex: "fr-FR" -> "fr", "en-US" -> "en")
      const voiceLangCode = selectedVoice.lang.split('-')[0].toLowerCase();
      // Utiliser cette langue si un texte de test existe
      if (testTexts[voiceLangCode]) {
        testLang = voiceLangCode;
      }
    }
  }

  const text = testTexts[testLang] || testTexts['fr'];
  testSpeechUtterance = new SpeechSynthesisUtterance(text);

  // Appliquer la langue de la voix selectionnee ou fallback
  if (selectedVoice) {
    testSpeechUtterance.lang = selectedVoice.lang;
    testSpeechUtterance.voice = selectedVoice;
  } else {
    testSpeechUtterance.lang = LANG_MAP[currentLang] || 'fr-FR';
  }

  // Appliquer les parametres actuels des sliders
  testSpeechUtterance.rate = parseFloat(elements.speechRate?.value) || 1.0;
  testSpeechUtterance.pitch = parseFloat(elements.speechPitch?.value) || 1.0;

  // Evenements
  testSpeechUtterance.onstart = () => {
    elements.btnTestSpeech.textContent = t('stopSpeaking', currentLang) || 'Stop';
    elements.btnTestSpeech.classList.add('speaking');
  };

  testSpeechUtterance.onend = () => {
    elements.btnTestSpeech.textContent = t('testSpeech', currentLang);
    elements.btnTestSpeech.classList.remove('speaking');
    testSpeechUtterance = null;
  };

  testSpeechUtterance.onerror = () => {
    elements.btnTestSpeech.textContent = t('testSpeech', currentLang);
    elements.btnTestSpeech.classList.remove('speaking');
    testSpeechUtterance = null;
  };

  // Lancer la lecture
  window.speechSynthesis.speak(testSpeechUtterance);
}

// Charger les actions personnalisees
async function loadCustomActions() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['customActions', 'customPrompts'], (result) => {
      customActions = result.customActions || [];
      customPrompts = result.customPrompts || {};
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
      elements.apiUrlLabel.textContent = t('ollamaServerUrl', currentLang);
    } else if (provider === 'custom') {
      elements.apiUrlLabel.textContent = t('customApiUrl', currentLang);
    } else {
      elements.apiUrlLabel.textContent = `${t('providerApiUrl', currentLang)} ${providerConfig.name}`;
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
      setTrustedHTML(elements.modelSelect, '<option value="">Selectionnez un modele</option>');
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

  // Direct input toggle - afficher/masquer le mode d'insertion
  elements.directInputEnabled?.addEventListener('change', () => {
    updateDirectInputModeVisibility();
  });

  // Speech toggle - afficher/masquer les options
  elements.speechEnabled?.addEventListener('change', () => {
    updateSpeechOptionsVisibility();
  });

  // Speech rate slider
  elements.speechRate?.addEventListener('input', () => {
    const value = parseFloat(elements.speechRate.value);
    if (elements.speechRateValue) elements.speechRateValue.textContent = value.toFixed(1) + 'x';
  });

  // Speech pitch slider
  elements.speechPitch?.addEventListener('input', () => {
    const value = parseFloat(elements.speechPitch.value);
    if (elements.speechPitchValue) elements.speechPitchValue.textContent = value.toFixed(1);
    // Retirer les classes active des presets si changement manuel
    elements.btnPitchLow?.classList.remove('active');
    elements.btnPitchHigh?.classList.remove('active');
  });

  // Speech language mode - afficher/masquer langue fixe
  elements.speechLanguageMode?.addEventListener('change', () => {
    updateSpeechFixedLanguageVisibility();
  });

  // Boutons preset tonalite grave/aigue
  elements.btnPitchLow?.addEventListener('click', () => {
    setPitchPreset(0.5, 0.9, 'low');
  });
  elements.btnPitchHigh?.addEventListener('click', () => {
    setPitchPreset(1.8, 1.1, 'high');
  });

  // Bouton de test de lecture vocale
  elements.btnTestSpeech?.addEventListener('click', testSpeech);
}

// Appliquer un preset de tonalite (pitch + rate pour un effet plus prononce)
function setPitchPreset(pitchValue, rateValue, type) {
  // Ajuster le pitch
  if (elements.speechPitch) {
    elements.speechPitch.value = pitchValue;
    if (elements.speechPitchValue) {
      elements.speechPitchValue.textContent = pitchValue.toFixed(1);
    }
  }
  // Ajuster le rate aussi pour un effet plus naturel
  if (elements.speechRate) {
    elements.speechRate.value = rateValue;
    if (elements.speechRateValue) {
      elements.speechRateValue.textContent = rateValue.toFixed(1) + 'x';
    }
  }
  // Mettre a jour les boutons actifs
  elements.btnPitchLow?.classList.toggle('active', type === 'low');
  elements.btnPitchHigh?.classList.toggle('active', type === 'high');
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

  setTrustedHTML(elements.modelSelect, '<option value="">Selectionnez un modele</option>');

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
  config.inlinePopupEnabled = elements.inlinePopupEnabled?.checked !== false;
  config.directInputEnabled = elements.directInputEnabled?.checked === true;
  config.directInputMode = elements.directInputMode?.value || 'replace';
  config.interfaceLanguage = elements.interfaceLanguage?.value || 'fr';
  config.responseLanguage = elements.responseLanguage?.value || 'auto';
  config.speechEnabled = elements.speechEnabled?.checked !== false;
  config.speechRate = parseFloat(elements.speechRate?.value) || 1.0;
  config.speechPitch = parseFloat(elements.speechPitch?.value) || 1.0;
  config.speechLanguageMode = elements.speechLanguageMode?.value || 'auto';
  config.speechFixedLanguage = elements.speechFixedLanguage?.value || 'fr';
  config.speechVoiceName = elements.speechVoice?.value || '';

  await saveConfig();

  // Si la langue a change, appliquer les traductions
  if (previousLang !== config.interfaceLanguage) {
    currentLang = config.interfaceLanguage;
    applyTranslations();
    renderActionsGrid();
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
  const confirmMsg = currentLang === 'fr' ? 'Etes-vous sur de vouloir reinitialiser tous les parametres ?' :
    currentLang === 'en' ? 'Are you sure you want to reset all settings?' :
    currentLang === 'es' ? 'Esta seguro de que desea restablecer todos los ajustes?' :
    currentLang === 'it' ? 'Sei sicuro di voler reimpostare tutte le impostazioni?' :
    currentLang === 'pt' ? 'Tem certeza de que deseja redefinir todas as configuracoes?' :
    'Are you sure you want to reset all settings?';
  if (confirm(confirmMsg)) {
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

    setTrustedHTML(container, '');

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

  // Verifier si le prompt a ete personnalise
  const hasCustomPrompt = customPrompts[action.id] !== undefined;

  setTrustedHTML(toggle, `
    <input type="checkbox" ${isEnabled ? 'checked' : ''} data-action-id="${action.id}">
    <span class="toggle-indicator"></span>
    <span class="action-info">
      <span class="action-name">${action.name}${hasCustomPrompt ? ' *' : ''}</span>
      <span class="action-desc">${action.description || ''}</span>
    </span>
    <div class="action-buttons">
      <button class="btn-edit-action" data-id="${action.id}" title="Modifier le prompt">&#9998;</button>
      ${isCustom ? '<button class="btn-delete-action" data-id="' + action.id + '" title="Supprimer">X</button>' : ''}
    </div>
  `);

  toggle.querySelector('input').addEventListener('change', (e) => {
    toggleAction(action.id, e.target.checked, isCustom);
    toggle.classList.toggle('active', e.target.checked);
  });

  toggle.querySelector('.btn-edit-action')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showEditActionModal(action, isCustom);
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

  setTrustedHTML(container, '');

  for (const lang of TRANSLATE_LANGUAGES) {
    const actionId = `translate_${lang.code}`;
    const isEnabled = enabledTranslations.includes(lang.code);
    const action = { id: actionId, name: `Traduire en ${lang.name}`, description: lang.code.toUpperCase() };

    const toggle = document.createElement('label');
    toggle.className = `action-toggle ${isEnabled ? 'active' : ''}`;
    setTrustedHTML(toggle, `
      <input type="checkbox" ${isEnabled ? 'checked' : ''} data-lang="${lang.code}">
      <span class="toggle-indicator"></span>
      <span class="action-info">
        <span class="action-name">${action.name}</span>
        <span class="action-desc">${action.description}</span>
      </span>
    `);

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

  setTrustedHTML(container, '');

  if (customActions.length === 0) {
    setTrustedHTML(container, '<p class="empty-message">Aucune action personnalisee. Cliquez sur le bouton ci-dessous pour en creer une.</p>');
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
  showNotification(enable ? t('allActionsEnabled', currentLang) : t('allActionsDisabled', currentLang), 'success');
}

// Reset actions par defaut
function resetActionsToDefault() {
  enabledActions = [...DEFAULT_ENABLED_ACTIONS];
  enabledTranslations = ['fr', 'en', 'es', 'de'];
  saveEnabledActions();
  saveEnabledTranslations();
  renderActionsGrid();
  showNotification(t('defaultActionsRestored', currentLang), 'success');
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
  setTrustedHTML(modal, `
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
  `);

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
      showNotification(t('fillAllFields', currentLang), 'error');
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
    showNotification(t('actionCustomCreated', currentLang), 'success');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Supprimer une action personnalisee
function deleteCustomAction(actionId) {
  const confirmMsg = currentLang === 'fr' ? 'Supprimer cette action personnalisee ?' :
    currentLang === 'en' ? 'Delete this custom action?' :
    currentLang === 'es' ? 'Eliminar esta accion personalizada?' :
    currentLang === 'it' ? 'Eliminare questa azione personalizzata?' :
    currentLang === 'pt' ? 'Excluir esta acao personalizada?' :
    'Delete this custom action?';
  if (!confirm(confirmMsg)) return;

  customActions = customActions.filter(a => a.id !== actionId);
  enabledActions = enabledActions.filter(id => id !== actionId);

  // Supprimer aussi les raccourcis associes
  delete shortcuts[actionId];

  saveCustomActions();
  saveEnabledActions();
  saveShortcuts();
  renderActionsGrid();
  renderShortcutsList();
  showNotification(t('actionDeleted', currentLang), 'success');
}

// Sauvegarder les actions personnalisees
async function saveCustomActions() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ customActions }, resolve);
  });
}

// Sauvegarder les prompts personnalises
async function saveCustomPrompts() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ customPrompts }, resolve);
  });
}

// Afficher le modal pour modifier une action
function showEditActionModal(action, isCustom = false) {
  const existingModal = document.getElementById('edit-action-modal');
  if (existingModal) existingModal.remove();

  // Obtenir le prompt actuel (personnalise ou par defaut)
  let currentPrompt = '';
  if (isCustom) {
    currentPrompt = action.prompt || '';
  } else {
    currentPrompt = customPrompts[action.id] || BASE_ACTIONS[action.id]?.prompt || '';
  }

  const defaultPrompt = isCustom ? '' : (BASE_ACTIONS[action.id]?.prompt || '');
  const isModified = !isCustom && customPrompts[action.id] !== undefined;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'edit-action-modal';
  setTrustedHTML(modal, `
    <div class="modal">
      <div class="modal-header">
        <h3>Modifier: ${action.name}</h3>
        <button class="modal-close" type="button">&times;</button>
      </div>
      <div class="modal-body">
        ${isCustom ? `
        <div class="form-group">
          <label>Nom de l'action</label>
          <input type="text" class="edit-action-name-input" value="${action.name}">
        </div>
        ` : ''}
        <div class="form-group">
          <label>Prompt</label>
          <textarea class="edit-action-prompt-input" rows="6" placeholder="Entrez votre prompt personnalise...">${currentPrompt}</textarea>
          ${!isCustom ? `<p class="form-hint">Prompt par defaut: "${defaultPrompt}"</p>` : ''}
        </div>
        ${isModified ? `
        <div class="form-group">
          <button class="btn btn-secondary btn-reset-prompt" type="button">Restaurer le prompt par defaut</button>
        </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel" type="button">Annuler</button>
        <button class="btn btn-primary modal-save" type="button">Sauvegarder</button>
      </div>
    </div>
  `);

  document.body.appendChild(modal);

  // Event listeners
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-cancel').addEventListener('click', () => modal.remove());

  // Restaurer le prompt par defaut
  modal.querySelector('.btn-reset-prompt')?.addEventListener('click', () => {
    modal.querySelector('.edit-action-prompt-input').value = defaultPrompt;
  });

  // Sauvegarder
  modal.querySelector('.modal-save').addEventListener('click', async () => {
    const newPrompt = modal.querySelector('.edit-action-prompt-input').value.trim();

    if (!newPrompt) {
      showNotification(t('promptEmpty', currentLang), 'error');
      return;
    }

    if (isCustom) {
      // Modifier l'action personnalisee
      const newName = modal.querySelector('.edit-action-name-input')?.value.trim() || action.name;
      const actionIndex = customActions.findIndex(a => a.id === action.id);
      if (actionIndex !== -1) {
        customActions[actionIndex].name = newName;
        customActions[actionIndex].prompt = newPrompt;
        await saveCustomActions();
      }
    } else {
      // Sauvegarder le prompt personnalise pour une action de base
      if (newPrompt === defaultPrompt) {
        // Si c'est le prompt par defaut, supprimer la personnalisation
        delete customPrompts[action.id];
      } else {
        customPrompts[action.id] = newPrompt;
      }
      await saveCustomPrompts();
    }

    // Notifier le service worker de recharger les menus
    chrome.runtime.sendMessage({ type: 'RELOAD_MENUS' });

    renderActionsGrid();
    modal.remove();
    showNotification(t('actionModified', currentLang), 'success');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
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

  setTrustedHTML(container, '');

  // Raccourcis existants
  for (const [actionId, shortcut] of Object.entries(shortcuts)) {
    const actionName = getActionName(actionId);
    const keyDisplay = formatShortcut(shortcut);

    const item = document.createElement('div');
    item.className = 'shortcut-item';
    setTrustedHTML(item, `
      <div class="shortcut-info">
        <span class="shortcut-name">${actionName}</span>
      </div>
      <div class="shortcut-key-wrapper">
        <button class="shortcut-key-btn" data-action="${actionId}">
          <span class="key-display">${keyDisplay}</span>
        </button>
        <button class="btn btn-small btn-secondary btn-delete-shortcut" data-action="${actionId}">X</button>
      </div>
    `);

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
    setTrustedHTML(container, '<p class="empty-message">Aucun raccourci configure. Cliquez sur le bouton ci-dessous pour en ajouter.</p>');
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

// Raccourcis systeme/navigateur courants a eviter
const SYSTEM_SHORTCUTS = [
  { key: 'c', ctrl: true }, { key: 'v', ctrl: true }, { key: 'x', ctrl: true }, { key: 'z', ctrl: true },
  { key: 'a', ctrl: true }, { key: 's', ctrl: true }, { key: 'f', ctrl: true }, { key: 'p', ctrl: true },
  { key: 'n', ctrl: true }, { key: 't', ctrl: true }, { key: 'w', ctrl: true }, { key: 'r', ctrl: true },
  { key: 'l', ctrl: true }, { key: 'd', ctrl: true }, { key: 'h', ctrl: true }, { key: 'j', ctrl: true },
  { key: 'tab', alt: true }, { key: 'f4', alt: true }, { key: 'escape', alt: false }
];

// Verifier si un raccourci est en conflit
function checkShortcutConflict(newShortcut, excludeActionId = null) {
  // Verifier les raccourcis systeme
  for (const sys of SYSTEM_SHORTCUTS) {
    if (newShortcut.key === sys.key &&
        newShortcut.ctrl === (sys.ctrl || false) &&
        !newShortcut.alt && !newShortcut.shift) {
      return { conflict: true, reason: 'systeme', message: `${formatShortcut(newShortcut)} est un raccourci systeme/navigateur` };
    }
  }

  // Verifier les raccourcis existants
  for (const [actionId, shortcut] of Object.entries(shortcuts)) {
    if (actionId === excludeActionId) continue;
    if (newShortcut.key === shortcut.key &&
        newShortcut.ctrl === shortcut.ctrl &&
        newShortcut.alt === shortcut.alt &&
        newShortcut.shift === shortcut.shift) {
      return { conflict: true, reason: 'existant', message: `Deja utilise pour "${shortcut.actionName}"` };
    }
  }

  return { conflict: false };
}

// Commencer l'enregistrement d'un raccourci
function startRecordingShortcut(button, actionId) {
  button.classList.add('recording');
  button.querySelector('.key-display').textContent = t('pressKeyPrompt', currentLang);

  const handler = (e) => {
    e.preventDefault();

    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

    const newShortcut = {
      key: e.key.toLowerCase(),
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey
    };

    // Verifier les conflits
    const conflict = checkShortcutConflict(newShortcut, actionId);
    if (conflict.conflict) {
      showNotification(conflict.message, 'error');
      button.classList.remove('recording');
      button.querySelector('.key-display').textContent = formatShortcut(shortcuts[actionId] || { key: '?' });
      document.removeEventListener('keydown', handler);
      return;
    }

    shortcuts[actionId] = {
      ...newShortcut,
      actionId,
      actionName: getActionName(actionId)
    };

    button.classList.remove('recording');
    button.querySelector('.key-display').textContent = formatShortcut(shortcuts[actionId]);
    document.removeEventListener('keydown', handler);
    showNotification(t('shortcutSaved', currentLang), 'success');
  };

  document.addEventListener('keydown', handler);
}

// Afficher le modal pour ajouter un raccourci
function showAddShortcutModal() {
  // Collecter toutes les actions disponibles
  const quickPromptName = currentLang === 'fr' ? 'Prompt rapide' : currentLang === 'en' ? 'Quick prompt' : currentLang === 'es' ? 'Prompt rapido' : currentLang === 'it' ? 'Prompt rapido' : 'Prompt rapido';
  const translatePrefix = currentLang === 'fr' ? 'Traduire en' : currentLang === 'en' ? 'Translate to' : currentLang === 'es' ? 'Traducir a' : currentLang === 'it' ? 'Traduci in' : 'Traduzir para';
  const allActions = [
    { id: 'quickPrompt', name: quickPromptName },
    ...Object.values(BASE_ACTIONS).map(a => ({ id: a.id, name: a.name })),
    ...TRANSLATE_LANGUAGES.map(l => ({ id: `translate_${l.code}`, name: `${translatePrefix} ${l.name}` })),
    ...customActions.map(a => ({ id: a.id, name: a.name }))
  ].filter(a => !shortcuts[a.id]); // Exclure ceux qui ont deja un raccourci

  if (allActions.length === 0) {
    showNotification(t('allActionsHaveShortcuts', currentLang), 'info');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'shortcut-modal';
  setTrustedHTML(modal, `
    <div class="modal">
      <div class="modal-header">
        <h3>${t('addShortcut', currentLang)}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="shortcut-action">${t('actions', currentLang)}</label>
          <select id="shortcut-action">
            ${allActions.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>${t('shortcuts', currentLang)}</label>
          <button class="shortcut-key-btn recording" id="new-shortcut-btn">
            <span class="key-display">${t('pressKey', currentLang)}</span>
          </button>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-cancel">${t('cancel', currentLang)}</button>
        <button class="btn btn-primary modal-save" disabled>${t('add', currentLang)}</button>
      </div>
    </div>
  `);

  document.body.appendChild(modal);

  let newShortcut = null;
  const shortcutBtn = modal.querySelector('#new-shortcut-btn');
  const saveBtn = modal.querySelector('.modal-save');

  const keyHandler = (e) => {
    e.preventDefault();
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

    const testShortcut = {
      key: e.key.toLowerCase(),
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey
    };

    // Verifier les conflits
    const conflict = checkShortcutConflict(testShortcut);
    const clickToDefine = currentLang === 'fr' ? 'Cliquez pour definir' : currentLang === 'en' ? 'Click to define' : currentLang === 'es' ? 'Haga clic para definir' : currentLang === 'it' ? 'Clicca per definire' : 'Clique para definir';
    if (conflict.conflict) {
      showNotification(conflict.message, 'error');
      shortcutBtn.classList.remove('recording');
      shortcutBtn.querySelector('.key-display').textContent = clickToDefine;
      saveBtn.disabled = true;
      newShortcut = null;
      return;
    }

    newShortcut = testShortcut;
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
    if (!newShortcut) return;
    const actionId = document.getElementById('shortcut-action').value;
    shortcuts[actionId] = {
      ...newShortcut,
      actionId,
      actionName: getActionName(actionId)
    };
    document.removeEventListener('keydown', keyHandler);
    modal.remove();
    renderShortcutsList();
    showNotification(t('shortcutAdded', currentLang), 'success');
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

  showNotification(t('shortcutsSaved', currentLang), 'success');
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
  showNotification(active ? t('presetActivated', currentLang) : t('presetDeactivated', currentLang), 'success');
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
    setTrustedHTML(container, `<h3>${t('presetActions', currentLang)}</h3><p class="empty-state">Preset non trouve.</p>`);
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
  setTrustedHTML(container, html);

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
  setTrustedHTML(modal, `
    <div class="prompt-view-content">
      <h3>${title}</h3>
      <pre>${prompt}</pre>
      <button class="btn btn-primary close-modal">Fermer</button>
    </div>
  `);

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
  setTrustedHTML(document.getElementById('preset-actions-items'), `<p class="empty-state">${t('noActionsInPreset', currentLang)}</p>`);
  document.querySelector('#modal-preset-overlay .modal-title').textContent = t('createPresetTitle', currentLang);

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
    setTrustedHTML(container, '<p class="empty-state">Aucune action. Cliquez sur "+ Ajouter action".</p>');
    return;
  }

  setTrustedHTML(container, currentPresetActions.map((action, index) => `
    <div class="preset-action-edit-item" data-index="${index}">
      <input type="text" placeholder="Nom de l'action" value="${action.name}" class="action-name-input">
      <textarea placeholder="Prompt systeme..." class="action-prompt-input">${action.prompt}</textarea>
      <button class="btn-remove" data-index="${index}">X</button>
    </div>
  `).join(''));

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
    showNotification(t('enterPresetName', currentLang), 'error');
    return;
  }

  if (currentPresetActions.length === 0) {
    showNotification(t('addAtLeastOneAction', currentLang), 'error');
    return;
  }

  // Valider les actions
  for (const action of currentPresetActions) {
    if (!action.name.trim() || !action.prompt.trim()) {
      showNotification(t('allActionsMustHaveNameAndPrompt', currentLang), 'error');
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
  setTrustedHTML(modal, `
    <div class="prompt-view-content">
      <h3>${t('editPrompt', currentLang)}: ${title}</h3>
      <textarea id="edit-prompt-textarea" rows="10" style="width:100%; font-family: monospace; resize: vertical;">${prompt}</textarea>
      <div style="display: flex; gap: 10px; margin-top: 15px;">
        <button class="btn btn-secondary cancel-edit">${t('cancel', currentLang)}</button>
        <button class="btn btn-primary save-edit">${t('save', currentLang)}</button>
      </div>
    </div>
  `);

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
    setTrustedHTML(container, `<h3>${t('presetActions', currentLang)}</h3><p class="empty-state">${t('clickPresetToSee', currentLang)}</p>`);
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
    updateStatus.textContent = t('checkingForUpdates', currentLang);
  }

  try {
    const response = await fetch(VERSION_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error('Network error');

    const data = await response.json();
    const currentVersion = VERSION;

    if (compareVersions(data.version, currentVersion) > 0) {
      // Mise a jour disponible
      if (updateStatus) {
        const versionText = t('newVersionAvailable', currentLang).replace('{version}', data.version);
        setTrustedHTML(updateStatus, `<strong style="color: var(--success);">${versionText}</strong><br><small>${data.releaseNotes || ''}</small>`);
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
        updateStatus.textContent = t('youHaveLatest', currentLang);
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
      updateStatus.textContent = t('unableToCheckUpdates', currentLang);
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
      const versionText = t('newVersionAvailable', currentLang).replace('{version}', result.updateAvailable.version);
      setTrustedHTML(updateStatus, `<strong style="color: var(--success);">${versionText}</strong>`);
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

// ========== AGENTS PERSONNALISES ==========

// Charger les agents personnalises
async function loadCustomAgents() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['customAgents', 'selectedAgent'], (result) => {
      customAgents = result.customAgents || [];
      selectedAgent = result.selectedAgent || DEFAULT_AGENT.id;
      resolve();
    });
  });
}

// Sauvegarder les agents personnalises
async function saveCustomAgents() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ customAgents }, resolve);
  });
}

// Sauvegarder l'agent selectionne
async function saveSelectedAgent() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ selectedAgent }, resolve);
  });
}

// Afficher les grilles d'agents
function renderAgentsGrids() {
  renderBuiltinAgents();
  renderCustomAgents();
}

// Afficher les agents built-in
function renderBuiltinAgents() {
  const grid = document.getElementById('builtin-agents-grid');
  if (!grid) return;

  setTrustedHTML(grid, '');

  BUILTIN_AGENTS_LIST.forEach(agent => {
    const card = createAgentCard(agent, false);
    grid.appendChild(card);
  });
}

// Afficher les agents personnalises
function renderCustomAgents() {
  const grid = document.getElementById('custom-agents-grid');
  const emptyState = document.getElementById('no-custom-agents');
  if (!grid) return;

  setTrustedHTML(grid, '');

  if (customAgents.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    grid.style.display = 'none';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    grid.style.display = 'grid';

    customAgents.forEach(agent => {
      const card = createAgentCard(agent, true);
      grid.appendChild(card);
    });
  }
}

// Creer une carte d'agent
function createAgentCard(agent, isCustom) {
  const card = document.createElement('div');
  card.className = 'agent-card';
  card.dataset.agentId = agent.id;

  const isDefault = agent.id === DEFAULT_AGENT.id;

  setTrustedHTML(card, `
    ${isDefault ? `<div class="agent-badge">${t('defaultAgent', currentLang)}</div>` : ''}
    <div class="agent-card-header">
      <div class="agent-icon">${agent.icon || '🤖'}</div>
      <div class="agent-info">
        <div class="agent-name">${agent.name}</div>
        <div class="agent-description">${agent.description}</div>
      </div>
    </div>
    <div class="agent-params">
      <div class="agent-param">
        <span class="agent-param-label">Temp:</span>
        <span class="agent-param-value">${agent.temperature}</span>
      </div>
      <div class="agent-param">
        <span class="agent-param-label">Tokens:</span>
        <span class="agent-param-value">${agent.maxTokens}</span>
      </div>
      <div class="agent-param">
        <span class="agent-param-label">Top P:</span>
        <span class="agent-param-value">${agent.topP}</span>
      </div>
    </div>
    <div class="agent-actions">
      ${isCustom ? `
        <button class="agent-action-btn" data-action="edit" data-agent-id="${agent.id}">${t('edit', currentLang)}</button>
        <button class="agent-action-btn danger" data-action="delete" data-agent-id="${agent.id}">${t('delete', currentLang)}</button>
      ` : `
        <button class="agent-action-btn" data-action="duplicate" data-agent-id="${agent.id}">${t('duplicate', currentLang)}</button>
      `}
    </div>
  `);

  return card;
}

// Configurer les event listeners pour les agents
function setupAgentsListeners() {
  // Bouton creer agent
  const btnCreateAgent = document.getElementById('btn-create-agent');
  if (btnCreateAgent) {
    btnCreateAgent.addEventListener('click', () => openAgentModal());
  }

  // Modal agent
  const modalOverlay = document.getElementById('modal-agent-overlay');
  const modalClose = document.getElementById('modal-agent-close');
  const modalCancel = document.getElementById('modal-agent-cancel');
  const modalSave = document.getElementById('modal-agent-save');

  if (modalClose) modalClose.addEventListener('click', closeAgentModal);
  if (modalCancel) modalCancel.addEventListener('click', closeAgentModal);
  if (modalSave) modalSave.addEventListener('click', saveAgent);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeAgentModal();
    });
  }

  // Sliders
  setupAgentSliders();

  // Event delegation pour les actions des cartes
  document.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('.agent-action-btn');
    if (!actionBtn) return;

    const action = actionBtn.dataset.action;
    const agentId = actionBtn.dataset.agentId;

    if (action === 'edit') {
      editAgent(agentId);
    } else if (action === 'delete') {
      deleteAgent(agentId);
    } else if (action === 'duplicate') {
      duplicateAgent(agentId);
    }
  });
}

// Configurer les sliders du modal agent
function setupAgentSliders() {
  const sliders = [
    { id: 'agent-temperature', valueId: 'agent-temperature-value', decimals: 1 },
    { id: 'agent-top-p', valueId: 'agent-top-p-value', decimals: 2 },
    { id: 'agent-frequency-penalty', valueId: 'agent-frequency-penalty-value', decimals: 1 },
    { id: 'agent-presence-penalty', valueId: 'agent-presence-penalty-value', decimals: 1 }
  ];

  sliders.forEach(({ id, valueId, decimals }) => {
    const slider = document.getElementById(id);
    const valueDisplay = document.getElementById(valueId);
    if (slider && valueDisplay) {
      slider.addEventListener('input', () => {
        valueDisplay.textContent = parseFloat(slider.value).toFixed(decimals);
      });
    }
  });
}

// Ouvrir le modal agent (creation ou edition)
function openAgentModal(agent = null) {
  const modal = document.getElementById('modal-agent-overlay');
  const title = document.getElementById('modal-agent-title');
  if (!modal) return;

  editingAgentId = agent ? agent.id : null;

  // Titre du modal
  if (title) {
    title.textContent = agent ? 'Modifier l\'agent' : 'Creer un agent';
  }

  // Remplir les champs
  document.getElementById('agent-name').value = agent?.name || '';
  document.getElementById('agent-description').value = agent?.description || '';
  document.getElementById('agent-icon').value = agent?.icon || '🤖';
  document.getElementById('agent-system-prompt').value = agent?.systemPrompt || '';
  document.getElementById('agent-temperature').value = agent?.temperature ?? 0.7;
  document.getElementById('agent-max-tokens').value = agent?.maxTokens ?? 4096;
  document.getElementById('agent-top-p').value = agent?.topP ?? 1.0;
  document.getElementById('agent-frequency-penalty').value = agent?.frequencyPenalty ?? 0;
  document.getElementById('agent-presence-penalty').value = agent?.presencePenalty ?? 0;
  document.getElementById('agent-model').value = agent?.model || '';

  // Mettre a jour les affichages des sliders
  document.getElementById('agent-temperature-value').textContent = (agent?.temperature ?? 0.7).toFixed(1);
  document.getElementById('agent-top-p-value').textContent = (agent?.topP ?? 1.0).toFixed(2);
  document.getElementById('agent-frequency-penalty-value').textContent = (agent?.frequencyPenalty ?? 0).toFixed(1);
  document.getElementById('agent-presence-penalty-value').textContent = (agent?.presencePenalty ?? 0).toFixed(1);

  modal.style.display = 'flex';
}

// Fermer le modal agent
function closeAgentModal() {
  const modal = document.getElementById('modal-agent-overlay');
  if (modal) modal.style.display = 'none';
  editingAgentId = null;
}

// Sauvegarder un agent
async function saveAgent() {
  const name = document.getElementById('agent-name').value.trim();
  const description = document.getElementById('agent-description').value.trim();
  const icon = document.getElementById('agent-icon').value.trim();
  const systemPrompt = document.getElementById('agent-system-prompt').value.trim();
  const temperature = parseFloat(document.getElementById('agent-temperature').value);
  const maxTokens = parseInt(document.getElementById('agent-max-tokens').value);
  const topP = parseFloat(document.getElementById('agent-top-p').value);
  const frequencyPenalty = parseFloat(document.getElementById('agent-frequency-penalty').value);
  const presencePenalty = parseFloat(document.getElementById('agent-presence-penalty').value);
  const model = document.getElementById('agent-model').value.trim();

  // Validation
  if (!name) {
    showNotification('Le nom de l\'agent est requis', 'error');
    return;
  }

  if (!systemPrompt) {
    showNotification('Les instructions systeme sont requises', 'error');
    return;
  }

  // Creer ou mettre a jour l'agent
  const agentData = {
    id: editingAgentId || 'custom_agent_' + Date.now(),
    name,
    description,
    icon: icon || '🤖',
    systemPrompt,
    temperature,
    maxTokens,
    topP,
    frequencyPenalty,
    presencePenalty,
    model
  };

  if (editingAgentId) {
    // Modification
    const index = customAgents.findIndex(a => a.id === editingAgentId);
    if (index !== -1) {
      customAgents[index] = createCustomAgent(agentData);
    }
  } else {
    // Creation
    customAgents.push(createCustomAgent(agentData));
  }

  await saveCustomAgents();
  renderCustomAgents();
  closeAgentModal();
  showNotification(editingAgentId ? 'Agent modifie avec succes' : 'Agent cree avec succes', 'success');
}

// Editer un agent
function editAgent(agentId) {
  const agent = customAgents.find(a => a.id === agentId);
  if (agent) {
    openAgentModal(agent);
  }
}

// Supprimer un agent
async function deleteAgent(agentId) {
  if (!confirm('Etes-vous sur de vouloir supprimer cet agent ?')) return;

  customAgents = customAgents.filter(a => a.id !== agentId);
  await saveCustomAgents();
  renderCustomAgents();
  showNotification('Agent supprime avec succes', 'success');
}

// Dupliquer un agent (built-in ou custom)
function duplicateAgent(agentId) {
  // Chercher dans les built-in
  let agent = BUILTIN_AGENTS[agentId];

  // Si pas trouve, chercher dans les custom
  if (!agent) {
    agent = customAgents.find(a => a.id === agentId);
  }

  if (agent) {
    // Creer une copie avec un nouveau nom
    const duplicatedAgent = {
      ...agent,
      id: null, // Sera genere lors de la sauvegarde
      name: agent.name + ' (copie)',
      isCustom: true,
      isDefault: false
    };
    openAgentModal(duplicatedAgent);
  }
}
