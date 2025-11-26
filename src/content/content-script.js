// Content Script pour IA Helper
// Gere l'interaction avec les pages web

(function() {
  'use strict';

  // Configuration par defaut
  const DEFAULT_OLLAMA_URL = 'http://localhost:11434';
  let config = {
    ollamaUrl: DEFAULT_OLLAMA_URL,
    selectedModel: '',
    streamingEnabled: true
  };

  // Element actif actuel
  let activeElement = null;
  let originalContent = '';

  // Charger la configuration
  async function loadConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['config'], (result) => {
        if (result.config) {
          config = { ...config, ...result.config };
        }
        resolve(config);
      });
    });
  }

  // Detecter le contexte actuel
  function detectContext() {
    const element = document.activeElement;
    const selection = window.getSelection();
    
    return {
      isInputField: isEditableElement(element),
      hasSelection: selection && selection.toString().trim().length > 0,
      selectedText: selection ? selection.toString() : '',
      element: element
    };
  }

  // Verifier si un element est editable
  function isEditableElement(element) {
    if (!element) return false;
    
    const tagName = element.tagName?.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea') {
      return !element.disabled && !element.readOnly;
    }
    
    return element.isContentEditable;
  }

  // Obtenir le contenu d'un element editable
  function getEditableContent(element) {
    if (!element) return '';
    
    const tagName = element.tagName?.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea') {
      return element.value;
    }
    
    if (element.isContentEditable) {
      return element.innerText;
    }
    
    return '';
  }

  // Definir le contenu d'un element editable
  function setEditableContent(element, content) {
    if (!element) return;
    
    const tagName = element.tagName?.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea') {
      element.value = content;
      // Declencher les evenements pour les frameworks reactifs
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (element.isContentEditable) {
      element.innerText = content;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  // Afficher l'indicateur de chargement
  function showLoadingIndicator(element) {
    const indicator = document.createElement('div');
    indicator.id = 'ia-helper-loading';
    indicator.className = 'ia-helper-loading';
    indicator.innerHTML = `
      <div class="ia-helper-loading-spinner"></div>
      <span>IA Helper en cours...</span>
    `;
    
    // Positionner pres de l'element
    const rect = element.getBoundingClientRect();
    indicator.style.position = 'fixed';
    indicator.style.top = `${rect.bottom + 10}px`;
    indicator.style.left = `${rect.left}px`;
    indicator.style.zIndex = '999999';
    
    document.body.appendChild(indicator);
    return indicator;
  }

  // Cacher l'indicateur de chargement
  function hideLoadingIndicator() {
    const indicator = document.getElementById('ia-helper-loading');
    if (indicator) {
      indicator.remove();
    }
  }

  // Generer avec streaming dans un champ
  async function generateWithStreaming(element, prompt, systemPrompt) {
    const indicator = showLoadingIndicator(element);
    
    try {
      const response = await fetch(`${config.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.selectedModel,
          prompt: prompt,
          system: systemPrompt,
          stream: true
        })
      });

      if (!response.ok) throw new Error(`Erreur: ${response.status}`);

      hideLoadingIndicator();
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      // Effacer le contenu actuel pour le streaming
      setEditableContent(element, '');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              fullResponse += json.response;
              setEditableContent(element, fullResponse);
              // Scroll vers le bas si necessaire
              if (element.scrollHeight > element.clientHeight) {
                element.scrollTop = element.scrollHeight;
              }
            }
          } catch (e) {}
        }
      }

      return fullResponse;
    } catch (error) {
      hideLoadingIndicator();
      showNotification('Erreur: ' + error.message, 'error');
      throw error;
    }
  }

  // Afficher une notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `ia-helper-notification ia-helper-notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px 25px;
      border-radius: 8px;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 999999;
      animation: ia-helper-slide-in 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    if (type === 'error') {
      notification.style.backgroundColor = '#e74c3c';
    } else if (type === 'success') {
      notification.style.backgroundColor = '#27ae60';
    } else {
      notification.style.backgroundColor = '#3498db';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'ia-helper-slide-out 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Prompts systeme
  const PROMPTS = {
    correct_errors: `Tu es un correcteur orthographique et grammatical expert. Corrige UNIQUEMENT les erreurs d'orthographe, de grammaire et de ponctuation. NE MODIFIE PAS le sens, le style ou la structure du texte. NE RAJOUTE AUCUN contenu. Retourne uniquement le texte corrige.`,
    translate: `Tu es un traducteur professionnel. Traduis le texte suivant en {lang}. Conserve le ton et le style. Retourne uniquement la traduction.`,
    reformat_mail_pro: `Tu es un expert en communication professionnelle. Reformule ce texte en email professionnel structure. CONSERVE ABSOLUMENT TOUT le contenu. NE RAJOUTE AUCUNE information inventee.`,
    expand_content: `Tu es un redacteur professionnel. Developpe et enrichis le texte suivant tout en gardant l'idee principale.`,
    summarize_input: `Tu es un expert en synthese. Resume le texte suivant de maniere concise. NE RAJOUTE AUCUNE information.`,
    improve_style: `Tu es un expert en style redactionnel. Ameliore le style pour le rendre plus fluide. CONSERVE le sens exact.`,
    summarize: `Tu es un expert en synthese. Resume le texte selectionne de maniere claire et concise.`,
    explain_chronology: `Analyse le texte et presente les evenements dans l'ordre chronologique. Format: - [Date/Heure] : Evenement`,
    explain_simple: `Explique le texte suivant de maniere simple et accessible.`,
    extract_key_points: `Extrait les points cles du texte suivant. Format: Liste a puces.`,
    analyze_sentiment: `Analyse le ton et le sentiment du texte. Indique: Sentiment general, mots cles emotionnels.`
  };

  // Noms des langues
  const LANG_NAMES = { fr: 'francais', en: 'anglais', it: 'italien', es: 'espagnol' };

  // Ecouter les messages du background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('IA Helper: Message recu', message);
    if (message.type === 'EXECUTE_ACTION') {
      handleAction(message).then(() => {
        sendResponse({ success: true });
      }).catch((error) => {
        console.error('IA Helper: Erreur', error);
        sendResponse({ success: false, error: error.message });
      });
    }
    return true;
  });

  // Prompts pour les actions rapides
  const QUICK_PROMPTS = {
    'quick_summarize_page': 'Resume cette page web de maniere claire et concise. Extrais les informations principales et presente-les de facon structuree.',
    'quick_extract_main': 'Extrais les points essentiels de cette page. Presente-les sous forme de liste a puces.',
    'quick_translate_page': 'Traduis le contenu principal de cette page en francais.'
  };

  // Gerer une action
  async function handleAction(message) {
    console.log('IA Helper: Traitement action', message.actionId);
    await loadConfig();

    const { actionType, actionId, targetLanguage, selectedText, isEditable } = message;

    // Obtenir le contenu a traiter
    let content = '';
    let targetElement = null;

    if (actionType === 'input' && isEditable) {
      targetElement = document.activeElement;
      content = getEditableContent(targetElement) || selectedText;
    } else if (actionType === 'selection') {
      content = selectedText || window.getSelection().toString();
    } else if (actionType === 'pro' || actionType === 'quick') {
      content = document.body.innerText.substring(0, 15000);
    } else if (actionType === 'custom' || actionType === 'preset') {
      // Pour les actions custom et preset, utiliser la selection ou la page
      content = selectedText || window.getSelection().toString() || document.body.innerText.substring(0, 15000);
    }

    if (!content.trim()) {
      showNotification('Aucun contenu a traiter', 'error');
      return;
    }

    console.log('IA Helper: Contenu a traiter', content.substring(0, 100) + '...');

    // Obtenir le prompt systeme
    let systemPrompt = '';

    if (actionType === 'quick') {
      systemPrompt = QUICK_PROMPTS[actionId] || '';
    } else if (actionType === 'custom') {
      // Charger le prompt custom depuis le storage
      const customData = await new Promise(resolve => {
        chrome.storage.local.get(['customPrompts', 'customActions'], resolve);
      });
      console.log('IA Helper: Donnees custom', customData);
      console.log('IA Helper: Recherche actionId', actionId);
      const customAction = customData.customActions?.find(a => a.id === actionId);
      console.log('IA Helper: Action trouvee', customAction);
      // Le prompt peut etre dans customPrompts ou directement dans l'action
      systemPrompt = customData.customPrompts?.[actionId] || customAction?.prompt || '';
      console.log('IA Helper: Prompt custom', systemPrompt);
    } else if (actionType === 'preset') {
      // Le prompt est fourni par le service worker
      systemPrompt = message.presetPrompt || '';
      console.log('IA Helper: Action preset avec prompt', systemPrompt);
    } else {
      systemPrompt = PROMPTS[actionId] || '';
    }

    if (targetLanguage && LANG_NAMES[targetLanguage]) {
      systemPrompt = systemPrompt.replace('{lang}', LANG_NAMES[targetLanguage]);
    }

    // Ajouter la langue de reponse si configuree (sauf pour les traductions)
    if (config.responseLanguage && config.responseLanguage !== 'auto' && !actionId.includes('translate')) {
      const langNames = {
        'fr': 'francais',
        'en': 'anglais',
        'es': 'espagnol',
        'it': 'italien',
        'pt': 'portugais'
      };
      const langName = langNames[config.responseLanguage] || config.responseLanguage;
      systemPrompt += `\n\nIMPORTANT: Reponds toujours en ${langName}.`;
    }

    // Verifier la configuration
    if (!config.selectedModel) {
      showNotification('Veuillez configurer un modele dans les options de IA Helper', 'error');
      console.log('IA Helper: Aucun modele configure');
      return;
    }

    console.log('IA Helper: Modele utilise', config.selectedModel);

    try {
      if (actionType === 'input' && isEditable && config.streamingEnabled) {
        // Streaming dans le champ de saisie
        await generateWithStreaming(targetElement, content, systemPrompt);
        showNotification('Traitement termine', 'success');
      } else {
        // Ouvrir la page de resultats
        console.log('IA Helper: Ouverture page resultats');
        openResultsPage(actionId, content, systemPrompt, targetLanguage);
      }
    } catch (error) {
      console.error('IA Helper: Erreur', error);
      showNotification('Erreur: ' + error.message, 'error');
    }
  }

  // Ouvrir la page de resultats dans un nouvel onglet
  function openResultsPage(actionId, content, systemPrompt, targetLanguage) {
    // Stocker les donnees pour la page de resultats
    const resultData = {
      actionId,
      content,
      systemPrompt,
      targetLanguage,
      timestamp: Date.now()
    };

    console.log('IA Helper: Stockage des donnees', resultData);

    chrome.storage.local.set({ pendingResult: resultData }, () => {
      if (chrome.runtime.lastError) {
        console.error('IA Helper: Erreur stockage', chrome.runtime.lastError);
        showNotification('Erreur de stockage', 'error');
        return;
      }

      console.log('IA Helper: Envoi message ouverture page');
      chrome.runtime.sendMessage({ type: 'OPEN_RESULTS_PAGE' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('IA Helper: Erreur envoi message', chrome.runtime.lastError);
          showNotification('Erreur: Extension non disponible', 'error');
        } else {
          console.log('IA Helper: Page ouverte', response);
        }
      });
    });
  }

  // Ecouter les changements de focus pour tracker l'element actif
  document.addEventListener('focusin', (e) => {
    if (isEditableElement(e.target)) {
      activeElement = e.target;
    }
  });

  // Initialisation
  loadConfig().then(() => {
    console.log('IA Helper Content Script charge');
  });
})();

