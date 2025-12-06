// Content Script pour IA Helper
// Gere l'interaction avec les pages web

(function() {
  'use strict';

  // Eviter les injections multiples (iframes, etc.)
  if (window.__iaHelperLoaded) return;
  window.__iaHelperLoaded = true;

  // Fonction utilitaire pour definir innerHTML de maniere securisee
  function setTrustedHTML(element, html) {
    if (!element) return;
    // eslint-disable-next-line no-unsanitized/property
    element.innerHTML = html; // SAFE: Content is already sanitized
  }

  // Ne s'executer que dans le top frame
  if (window !== window.top) return;

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
    speechEnabled: true,
    speechRate: 1.0,
    speechPitch: 1.0,
    speechVoiceName: '',
    speechLanguageMode: 'auto',
    speechFixedLanguage: 'fr'
  };

  let config = { ...DEFAULT_CONFIG };

  // Mini-systeme de traduction pour le content-script
  const CONTENT_TRANSLATIONS = {
    fr: {
      connectingToAI: 'Connexion a l\'IA en cours...',
      copy: 'Copier',
      viewDetails: 'Voir en detail',
      close: 'Fermer',
      error: 'Erreur',
      nothingToCopy: 'Aucun contenu a copier',
      copied: 'Copie !',
      storageError: 'Erreur de stockage',
      response: 'Reponse',
      plainText: 'Texte brut',
      speak: 'Lire',
      stopSpeaking: 'Stop',
      speaking: 'Lecture...',
      noTextToRead: 'Aucun texte a lire'
    },
    en: {
      connectingToAI: 'Connecting to AI...',
      copy: 'Copy',
      viewDetails: 'View details',
      close: 'Close',
      error: 'Error',
      nothingToCopy: 'Nothing to copy',
      copied: 'Copied!',
      storageError: 'Storage error',
      response: 'Response',
      plainText: 'Plain text',
      speak: 'Read',
      stopSpeaking: 'Stop',
      speaking: 'Reading...',
      noTextToRead: 'No text to read'
    },
    es: {
      connectingToAI: 'Conectando con la IA...',
      copy: 'Copiar',
      viewDetails: 'Ver detalles',
      close: 'Cerrar',
      error: 'Error',
      nothingToCopy: 'Nada que copiar',
      copied: 'Copiado!',
      storageError: 'Error de almacenamiento',
      response: 'Respuesta',
      plainText: 'Texto plano',
      speak: 'Leer',
      stopSpeaking: 'Detener',
      speaking: 'Leyendo...',
      noTextToRead: 'No hay texto'
    },
    it: {
      connectingToAI: 'Connessione all\'IA in corso...',
      copy: 'Copia',
      viewDetails: 'Vedi dettagli',
      close: 'Chiudi',
      error: 'Errore',
      nothingToCopy: 'Niente da copiare',
      copied: 'Copiato!',
      storageError: 'Errore di archiviazione',
      response: 'Risposta',
      plainText: 'Testo semplice',
      speak: 'Leggi',
      stopSpeaking: 'Stop',
      speaking: 'Lettura...',
      noTextToRead: 'Nessun testo'
    },
    pt: {
      connectingToAI: 'Conectando com a IA...',
      copy: 'Copiar',
      viewDetails: 'Ver detalhes',
      close: 'Fechar',
      error: 'Erro',
      nothingToCopy: 'Nada para copiar',
      copied: 'Copiado!',
      storageError: 'Erro de armazenamento',
      response: 'Resposta',
      plainText: 'Texto simples',
      speak: 'Ler',
      stopSpeaking: 'Parar',
      speaking: 'Lendo...',
      noTextToRead: 'Nenhum texto'
    }
  };

  function ct(key) {
    const lang = config.interfaceLanguage || 'fr';
    return CONTENT_TRANSLATIONS[lang]?.[key] || CONTENT_TRANSLATIONS['fr'][key] || key;
  }

  // Element actif actuel
  let activeElement = null;
  let originalContent = '';

  // Charger la configuration
  async function loadConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['config'], (result) => {
        if (result.config) {
          config = { ...DEFAULT_CONFIG, ...result.config };
          // Migration: ollamaUrl -> apiUrl
          if (result.config.ollamaUrl && !result.config.apiUrl) {
            config.apiUrl = result.config.ollamaUrl;
          }
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
    // Injecter les styles si pas deja fait
    if (!document.getElementById('ia-helper-styles')) {
      const style = document.createElement('style');
      style.id = 'ia-helper-styles';
      style.textContent = `
        @keyframes ia-helper-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ia-helper-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .ia-helper-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          animation: ia-helper-pulse 1.5s ease-in-out infinite;
        }
        .ia-helper-loading-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: ia-helper-spin 0.8s linear infinite;
        }
      `;
      document.head.appendChild(style);
    }

    const indicator = document.createElement('div');
    indicator.id = 'ia-helper-loading';
    indicator.className = 'ia-helper-loading';
    setTrustedHTML(indicator, `
      <div class="ia-helper-loading-spinner"></div>
      <span>IA Helper genere...</span>
    `);

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

  // Generer avec streaming dans un champ (multi-provider)
  async function generateWithStreaming(element, prompt, systemPrompt) {
    const indicator = showLoadingIndicator(element);
    const provider = config.provider || 'ollama';

    try {
      let response;
      let headers = { 'Content-Type': 'application/json' };

      if (provider === 'ollama') {
        response = await fetch(`${config.apiUrl}/api/generate`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: config.selectedModel,
            prompt: prompt,
            system: systemPrompt,
            stream: true
          })
        });
      } else if (provider === 'anthropic') {
        headers['x-api-key'] = config.apiKey;
        headers['anthropic-version'] = '2023-06-01';
        headers['anthropic-dangerous-direct-browser-access'] = 'true';
        response = await fetch(`${config.apiUrl}/messages`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: config.selectedModel,
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{ role: 'user', content: prompt }],
            stream: true
          })
        });
      } else {
        // OpenAI, Groq, OpenRouter, Custom (format OpenAI)
        headers['Authorization'] = `Bearer ${config.apiKey}`;
        response = await fetch(`${config.apiUrl}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: config.selectedModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            stream: true
          })
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText.substring(0, 100)}`);
      }

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
            // Enlever le prefixe "data: " pour SSE
            const cleanLine = line.startsWith('data: ') ? line.slice(6) : line;
            if (cleanLine === '[DONE]') continue;

            const json = JSON.parse(cleanLine);
            let content = '';

            if (provider === 'ollama') {
              content = json.response || '';
            } else if (provider === 'anthropic') {
              if (json.type === 'content_block_delta') {
                content = json.delta?.text || '';
              }
            } else {
              // Format OpenAI
              content = json.choices?.[0]?.delta?.content || '';
            }

            if (content) {
              fullResponse += content;
              setEditableContent(element, fullResponse);
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

  // Prompts systeme - IMPORTANT: pas de tableaux, pas de formatage markdown excessif
  const PROMPTS = {
    // Essentiels
    correct_errors: `Tu es un correcteur orthographique. Corrige UNIQUEMENT les fautes d'orthographe et de grammaire. Retourne le texte corrige, rien d'autre. Pas de commentaires, pas d'explications.`,
    summarize: `Resume ce texte de maniere concise. Ecris un paragraphe fluide, pas de listes ni tableaux.`,
    explain_simple: `Explique ce texte simplement, comme si tu parlais a quelqu'un. Pas de listes, pas de tableaux. Un texte clair et accessible.`,
    improve_style: `Ameliore le style de ce texte pour le rendre plus fluide et agreable a lire. Conserve le sens. Pas de formatage special.`,
    expand_content: `Developpe et enrichis ce texte. Garde un style fluide et naturel. Pas de tableaux ni de formatage excessif.`,
    reformat_mail_pro: `Reformule ce texte en email professionnel. Conserve tout le contenu. Pas de tableaux, pas de listes a puces sauf si necessaire. Texte fluide.`,

    // Pratiques
    bullet_points: `Convertis ce texte en liste a puces claire. Utilise des tirets simples. Pas de tableaux.`,
    extract_key_points: `Donne les 3-5 points essentiels de ce texte. Utilise des tirets simples. Pas de tableaux.`,
    make_shorter: `Raccourcis ce texte en gardant l'essentiel. Texte fluide, pas de tableaux.`,
    make_formal: `Reformule ce texte avec un ton plus formel et professionnel. Pas de tableaux.`,
    make_casual: `Reformule ce texte avec un ton plus decontracte et amical. Pas de tableaux.`,

    // Techniques
    explain_code: `Explique ce code de maniere claire. Pas de tableaux. Texte fluide avec eventuellement des exemples.`,
    review_code: `Fais une revue de ce code: qualite, bugs potentiels, ameliorations. Texte fluide, pas de tableaux.`,
    debug_help: `Aide a debugger ce code. Identifie les problemes potentiels et propose des solutions. Pas de tableaux.`,

    // Analyse
    sentiment_analysis: `Analyse brievement le ton et le sentiment de ce texte en 2-3 phrases. Pas de tableaux.`,
    analyze_sentiment: `Analyse brievement le ton de ce texte en 2-3 phrases. Pas de tableaux ni de formatage special.`,

    // Autres
    translate: `Tu es un traducteur. Traduis le texte en {lang}. Retourne uniquement la traduction, sans commentaires ni explications.`,
    summarize_input: `Resume ce texte en quelques phrases. Pas de listes, pas de tableaux. Juste un resume clair et fluide.`,
    explain_chronology: `Presente les evenements du texte dans l'ordre chronologique. Utilise des tirets simples: - [Date] Evenement. Pas de tableaux.`
  };

  // Noms des langues
  const LANG_NAMES = {
    fr: 'francais',
    en: 'anglais',
    it: 'italien',
    es: 'espagnol',
    pt: 'portugais',
    de: 'allemand',
    nl: 'neerlandais',
    ru: 'russe',
    zh: 'chinois',
    ja: 'japonais',
    ar: 'arabe',
    ko: 'coreen'
  };

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

  // Prompts pour les actions rapides - SANS TABLEAUX
  const QUICK_PROMPTS = {
    'quick_summarize_page': 'Resume cette page en quelques paragraphes fluides. Pas de tableaux, pas de listes complexes. Juste un resume clair et naturel.',
    'quick_extract_main': 'Donne les 5 points essentiels de cette page avec des tirets simples. Pas de tableaux.',
    'quick_translate_page': 'Traduis le contenu principal en francais. Pas de formatage special.'
  };

  // Gerer une action
  async function handleAction(message) {
    console.log('IA Helper: Traitement action', message.actionId || message.actionType);
    await loadConfig();

    let { actionType, actionId, targetLanguage, selectedText, isEditable } = message;

    // Pour custom_prompt, definir un actionId par defaut
    if (actionType === 'custom_prompt' && !actionId) {
      actionId = 'custom_prompt';
    }

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
    } else if (actionType === 'translate') {
      // Traduction: utiliser la selection, le champ editable ou la page
      if (isEditable) {
        targetElement = document.activeElement;
        content = getEditableContent(targetElement) || selectedText;
      } else {
        content = selectedText || window.getSelection().toString() || document.body.innerText.substring(0, 15000);
      }
    } else if (actionType === 'custom_prompt') {
      // Prompt personnalise depuis le popup: utiliser la selection ou la page comme contexte
      content = selectedText || window.getSelection().toString() || document.body.innerText.substring(0, 15000);
    } else if (actionType === 'action' || actionType === 'custom' || actionType === 'preset' || actionType === 'custompreset') {
      // Pour les actions (categories), custom et preset, utiliser la selection ou la page
      content = selectedText || window.getSelection().toString() || document.body.innerText.substring(0, 15000);
    }

    // Pour custom_prompt, le contenu peut etre vide si pas de selection et c'est OK
    if (!content.trim() && actionType !== 'custom_prompt') {
      showNotification('Aucun contenu a traiter', 'error');
      return;
    }

    console.log('IA Helper: Contenu a traiter', content.substring(0, 100) + '...');

    // Obtenir le prompt systeme
    let systemPrompt = '';
    let userPrompt = '';

    if (actionType === 'custom_prompt') {
      // Prompt personnalise depuis le popup - combiner la question avec le contexte
      userPrompt = message.customPrompt || '';
      if (content.trim()) {
        systemPrompt = `L'utilisateur te demande: "${userPrompt}"\n\nVoici le contexte (texte selectionne ou contenu de la page):\n\n${content}`;
      } else {
        systemPrompt = userPrompt;
      }
      // Utiliser le contenu comme contexte, pas comme contenu a traiter
      content = userPrompt;
      console.log('IA Helper: Custom prompt', userPrompt);
    } else if (actionType === 'quick') {
      systemPrompt = QUICK_PROMPTS[actionId] || '';
    } else if (actionType === 'translate') {
      // Traduction globale
      const langName = LANG_NAMES[targetLanguage] || targetLanguage;
      systemPrompt = `Traduis le texte en ${langName}. Retourne uniquement la traduction, sans commentaires.`;
    } else if (actionType === 'action' || actionType === 'custom' || actionType === 'preset' || actionType === 'custompreset') {
      // Les actions des categories + custom: le prompt est fourni par le service worker
      systemPrompt = message.presetPrompt || '';
      console.log('IA Helper: Action avec prompt', systemPrompt);
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

    // Detecter si on est dans un champ de saisie editable
    const activeEl = document.activeElement;
    const isInEditableField = activeEl && (
      activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'TEXTAREA' ||
      activeEl.isContentEditable ||
      activeEl.getAttribute('contenteditable') === 'true'
    );

    try {
      // Option 1: Reponse directe dans le champ de saisie (si active et dans un champ)
      if (config.directInputEnabled && isInEditableField && config.streamingEnabled) {
        console.log('IA Helper: Reponse directe dans le champ de saisie');
        await generateDirectInField(activeEl, content, systemPrompt, config.directInputMode);
        showNotification('Traitement termine', 'success');
      }
      // Option 2: Ancien mode - streaming dans le champ (depuis menu contextuel sur input)
      else if (actionType === 'input' && isEditable && config.streamingEnabled) {
        // Streaming dans le champ de saisie
        await generateWithStreaming(targetElement, content, systemPrompt);
        showNotification('Traitement termine', 'success');
      } else if (config.inlinePopupEnabled) {
        // Afficher dans un popup inline
        console.log('IA Helper: Affichage popup inline');
        showActionPopup(actionId, content, systemPrompt);
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

  // Generer directement dans le champ de saisie (nouvelle option)
  async function generateDirectInField(element, originalContent, systemPrompt, mode = 'replace') {
    const provider = config.provider || 'ollama';
    const indicator = showLoadingIndicator(element);

    // Sauvegarder le contenu original pour restauration en cas d'erreur
    const savedContent = getEditableContent(element) || '';

    try {
      // Determiner le contenu initial selon le mode
      let currentContent = '';
      if (mode === 'append') {
        currentContent = savedContent;
        if (currentContent && !currentContent.endsWith('\n')) {
          currentContent += '\n\n';
        }
      }

      // Vider ou preparer le champ selon le mode
      if (mode === 'replace') {
        setEditableContent(element, '');
      } else {
        setEditableContent(element, currentContent);
      }

      let requestBody, headers = { 'Content-Type': 'application/json' };
      let apiUrl = config.apiUrl;

      if (provider === 'ollama') {
        requestBody = {
          model: config.selectedModel,
          prompt: `${systemPrompt}\n\nContenu:\n${originalContent}`,
          stream: true
        };
        apiUrl = `${config.apiUrl}/api/generate`;
      } else if (provider === 'anthropic') {
        requestBody = {
          model: config.selectedModel,
          max_tokens: 4096,
          stream: true,
          messages: [
            { role: 'user', content: `${systemPrompt}\n\nContenu:\n${originalContent}` }
          ]
        };
        apiUrl = `${config.apiUrl}/messages`;
        headers['x-api-key'] = config.apiKey;
        headers['anthropic-version'] = '2023-06-01';
        headers['anthropic-dangerous-direct-browser-access'] = 'true';
      } else {
        requestBody = {
          model: config.selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: originalContent }
          ],
          stream: true
        };
        apiUrl = `${config.apiUrl}/chat/completions`;
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = mode === 'append' ? currentContent : '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          let text = '';

          if (provider === 'ollama') {
            try {
              const data = JSON.parse(line);
              text = data.response || '';
            } catch (e) { continue; }
          } else if (provider === 'anthropic') {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'content_block_delta') {
                  text = data.delta?.text || '';
                }
              } catch (e) { continue; }
            }
          } else {
            if (line.startsWith('data: ')) {
              if (line === 'data: [DONE]') continue;
              try {
                const data = JSON.parse(line.slice(6));
                text = data.choices?.[0]?.delta?.content || '';
              } catch (e) { continue; }
            }
          }

          if (text) {
            fullResponse += text;
            setEditableContent(element, fullResponse);
            // Garder le curseur a la fin
            if (element.setSelectionRange) {
              element.setSelectionRange(fullResponse.length, fullResponse.length);
            }
          }
        }
      }

      hideLoadingIndicator(indicator);
    } catch (error) {
      hideLoadingIndicator(indicator);
      // Restaurer le contenu original en cas d'erreur
      setEditableContent(element, savedContent);
      throw error;
    }
  }

  // Variable pour stocker le resultat genere
  let currentPopupResult = '';

  // Variable pour la synthese vocale
  let currentSpeechUtterance = null;
  let isSpeaking = false;

  // Fonction pour nettoyer le texte Markdown pour la lecture
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
  const TTS_LANG_NAMES = { fr: 'French', en: 'English', es: 'Spanish', it: 'Italian', pt: 'Portuguese' };

  // Detecter la langue d'un texte via l'IA
  async function detectLanguage(text) {
    return new Promise((resolve) => {
      const sampleText = text.substring(0, 500); // Limiter pour la detection
      const prompt = `Detect the language of this text and respond with ONLY the language code (fr, en, es, it, or pt). If uncertain, respond with "fr". Text: "${sampleText}"`;

      const port = chrome.runtime.connect({ name: 'ollama-stream' });
      let response = '';

      port.onMessage.addListener((msg) => {
        if (msg.type === 'chunk') {
          response += msg.content || '';
        } else if (msg.type === 'done' || msg.type === 'error') {
          port.disconnect();
          // Extraire le code de langue de la reponse
          const langCode = response.toLowerCase().trim().match(/^(fr|en|es|it|pt)/);
          resolve(langCode ? langCode[1] : 'fr');
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
        systemPrompt: 'You are a language detection assistant. Respond only with a language code.'
      });

      // Timeout de securite
      setTimeout(() => {
        port.disconnect();
        resolve('fr');
      }, 10000);
    });
  }

  // Traduire un texte dans une langue cible via l'IA
  async function translateText(text, targetLang) {
    return new Promise((resolve) => {
      const targetLangName = TTS_LANG_NAMES[targetLang] || 'French';
      const prompt = `Translate the following text to ${targetLangName}. Respond ONLY with the translation, no explanations or comments:\n\n${text}`;

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
        systemPrompt: 'You are a professional translator. Translate accurately and naturally.'
      });

      // Timeout de securite
      setTimeout(() => {
        port.disconnect();
        resolve(text);
      }, 30000);
    });
  }

  // Obtenir une voix par son nom, ou une voix par defaut pour la langue
  function getVoiceByNameOrLang(voiceName, langCode) {
    const voices = window.speechSynthesis.getVoices();

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
  // Fonction principale pour lancer/arreter la lecture vocale
  async function toggleSpeech(text, speakBtn) {
    if (!('speechSynthesis' in window)) {
      showNotification(ct('speechNotSupported') || 'Speech not supported', 'error');
      return;
    }

    if (isSpeaking) {
      // Arreter la lecture
      window.speechSynthesis.cancel();
      isSpeaking = false;
      speakBtn.textContent = ct('speak');
      speakBtn.classList.remove('ia-action-speaking');
      return;
    }

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) {
      showNotification(ct('noTextToRead') || 'No text to read', 'error');
      return;
    }

    // Determiner la langue et le texte a lire
    let textToRead = cleanText;
    let targetLang = config.speechFixedLanguage || 'fr';

    if (config.speechLanguageMode === 'auto') {
      // Mode automatique: detecter la langue du texte
      speakBtn.textContent = ct('detectingLanguage') || 'Detecting...';
      speakBtn.classList.add('ia-action-speaking');
      try {
        targetLang = await detectLanguage(cleanText);
      } catch (e) {
        targetLang = config.interfaceLanguage || 'fr';
      }
    } else {
      // Mode fixe: verifier si traduction necessaire
      speakBtn.textContent = ct('detectingLanguage') || 'Detecting...';
      speakBtn.classList.add('ia-action-speaking');
      try {
        const detectedLang = await detectLanguage(cleanText);
        if (detectedLang !== targetLang) {
          // Traduction necessaire
          speakBtn.textContent = ct('translatingText') || 'Translating...';
          textToRead = await translateText(cleanText, targetLang);
        }
      } catch (e) {
        // En cas d'erreur, lire le texte original
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
      speakBtn.textContent = ct('stopSpeaking');
      speakBtn.classList.add('ia-action-speaking');
    };

    currentSpeechUtterance.onend = () => {
      isSpeaking = false;
      speakBtn.textContent = ct('speak');
      speakBtn.classList.remove('ia-action-speaking');
    };

    currentSpeechUtterance.onerror = () => {
      isSpeaking = false;
      speakBtn.textContent = ct('speak');
      speakBtn.classList.remove('ia-action-speaking');
    };

    // Lancer la lecture
    window.speechSynthesis.speak(currentSpeechUtterance);
  }

  // Afficher le popup inline pour une action
  function showActionPopup(actionId, content, systemPrompt) {
    currentPopupResult = '';

    // Creer le modal
    const modal = document.createElement('div');
    modal.id = 'ia-helper-action-modal';
    setTrustedHTML(modal, `
      <div class="ia-action-overlay"></div>
      <div class="ia-action-container">
        <div class="ia-action-header">
          <span class="ia-action-title">IA Helper - ${ct('response') || 'Reponse'}</span>
          <button class="ia-action-close">&times;</button>
        </div>
        <div class="ia-action-response-area">
          <div class="ia-action-response-content">
            <span class="ia-action-waiting">${ct('connectingToAI')}</span>
            <span class="ia-action-cursor"></span>
          </div>
        </div>
        <div class="ia-action-actions">
          <div class="ia-action-copy-dropdown">
            <button class="ia-action-btn ia-action-btn-secondary ia-action-copy-toggle">${ct('copy')}</button>
            <div class="ia-action-copy-menu">
              <button class="ia-action-copy-option" data-format="markdown">Markdown</button>
              <button class="ia-action-copy-option" data-format="text">${ct('plainText') || 'Texte brut'}</button>
              <button class="ia-action-copy-option" data-format="html">HTML</button>
            </div>
          </div>
          ${config.speechEnabled !== false ? `<button class="ia-action-btn ia-action-btn-secondary ia-action-speak">${ct('speak')}</button>` : ''}
          <button class="ia-action-btn ia-action-btn-secondary ia-action-detail">${ct('viewDetails')}</button>
          <button class="ia-action-btn ia-action-btn-primary ia-action-close-final">${ct('close')}</button>
        </div>
      </div>
    `);

    // Styles
    const styles = document.createElement('style');
    styles.id = 'ia-helper-action-styles';
    styles.textContent = `
      #ia-helper-action-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .ia-action-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
      }
      .ia-action-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 16px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .ia-action-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .ia-action-title {
        font-size: 16px;
        font-weight: 600;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .ia-action-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.2s;
      }
      .ia-action-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
      .ia-action-response-area {
        padding: 20px;
        max-height: 400px;
        overflow-y: auto;
        flex: 1;
      }
      .ia-action-response-content {
        font-size: 14px;
        line-height: 1.7;
        color: rgba(255, 255, 255, 0.9);
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      .ia-action-cursor {
        display: inline-block;
        width: 8px;
        height: 16px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        animation: ia-action-blink 1s infinite;
        vertical-align: middle;
        margin-left: 2px;
      }
      @keyframes ia-action-blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      .ia-action-waiting {
        color: rgba(255, 255, 255, 0.5);
        font-style: italic;
      }
      .ia-action-error {
        color: #ff6b6b;
      }
      .ia-action-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        background: rgba(0, 0, 0, 0.2);
      }
      .ia-action-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }
      .ia-action-btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.8);
      }
      .ia-action-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.15);
      }
      .ia-action-btn-primary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: #fff;
      }
      .ia-action-btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      }
      .ia-action-copy-dropdown {
        position: relative;
      }
      .ia-action-copy-menu {
        display: none;
        position: absolute;
        bottom: 100%;
        left: 0;
        background: #1a1a2e;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        padding: 4px;
        margin-bottom: 4px;
        min-width: 140px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
      }
      .ia-action-copy-menu.active {
        display: block;
      }
      .ia-action-copy-option {
        display: block;
        width: 100%;
        padding: 10px 14px;
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        font-size: 13px;
        text-align: left;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.15s;
      }
      .ia-action-copy-option:hover {
        background: rgba(102, 126, 234, 0.2);
        color: #fff;
      }
      .ia-action-speaking {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: #fff !important;
        animation: ia-pulse 1.5s infinite;
      }
      @keyframes ia-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `;

    if (!document.getElementById('ia-helper-action-styles')) {
      document.head.appendChild(styles);
    }

    document.body.appendChild(modal);

    // Fonction pour fermer
    const closeModal = () => {
      // Arreter la lecture vocale si en cours
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
      }
      const m = document.getElementById('ia-helper-action-modal');
      if (m) m.remove();
    };

    // Menu copie dropdown
    const copyToggle = modal.querySelector('.ia-action-copy-toggle');
    const copyMenu = modal.querySelector('.ia-action-copy-menu');

    copyToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      copyMenu.classList.toggle('active');
    });

    // Options de copie
    modal.querySelectorAll('.ia-action-copy-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const format = btn.dataset.format;
        copyInFormat(format);
        copyMenu.classList.remove('active');
      });
    });

    // Fermer menu au clic ailleurs
    modal.addEventListener('click', () => {
      copyMenu.classList.remove('active');
    });

    // Event listeners
    modal.querySelector('.ia-action-close').addEventListener('click', closeModal);
    modal.querySelector('.ia-action-close-final').addEventListener('click', closeModal);
    modal.querySelector('.ia-action-overlay').addEventListener('click', closeModal);

    modal.querySelector('.ia-action-detail').addEventListener('click', () => {
      closeModal();
      // Passer le resultat deja genere au lieu de regenerer
      openResultsPageWithResult(actionId, content, systemPrompt, currentPopupResult);
    });

    // Bouton de lecture vocale (si active)
    const speakBtn = modal.querySelector('.ia-action-speak');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        toggleSpeech(currentPopupResult, speakBtn);
      });
    }

    // Lancer la generation
    const responseEl = modal.querySelector('.ia-action-response-content');
    generateActionResponse(responseEl, content, systemPrompt);
  }

  // Copier dans un format specifique
  function copyInFormat(format) {
    if (!currentPopupResult) {
      showNotification(ct('nothingToCopy'), 'error');
      return;
    }

    let textToCopy = currentPopupResult;

    if (format === 'text') {
      // Texte brut sans formatage Markdown
      textToCopy = currentPopupResult
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/`{3}[\s\S]*?`{3}/g, (match) => match.replace(/`{3}\w*\n?/g, ''))
        .replace(/`(.+?)`/g, '$1')
        .replace(/^[-*+]\s/gm, '')
        .replace(/^\d+\.\s/gm, '')
        .replace(/\[(.+?)\]\(.+?\)/g, '$1')
        .replace(/!\[.*?\]\(.+?\)/g, '')
        .replace(/>\s/g, '')
        .trim();
    } else if (format === 'html') {
      // Conversion basique Markdown vers HTML
      textToCopy = currentPopupResult
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    }
    // format === 'markdown' garde le texte tel quel

    navigator.clipboard.writeText(textToCopy);
    const formatNames = { markdown: 'Markdown', text: ct('plainText'), html: 'HTML' };
    showNotification(`${ct('copied')} (${formatNames[format]})`, 'success');
  }

  // Generer la reponse pour une action via le background script avec STREAMING
  async function generateActionResponse(element, content, systemPrompt) {
    try {
      // Utiliser un port pour le streaming
      const port = chrome.runtime.connect({ name: 'streaming' });

      // Vider le contenu initial
      setTrustedHTML(element, '');
      currentPopupResult = '';

      // Creer le curseur de streaming
      const cursor = document.createElement('span');
      cursor.className = 'ia-action-cursor';
      element.appendChild(cursor);

      port.onMessage.addListener((message) => {
        if (message.type === 'chunk') {
          // Ajouter le texte avant le curseur
          currentPopupResult += message.text;
          element.textContent = currentPopupResult;
          element.appendChild(cursor);

          // Scroll vers le bas si necessaire
          const responseArea = element.closest('.ia-action-response-area');
          if (responseArea) {
            responseArea.scrollTop = responseArea.scrollHeight;
          }
        } else if (message.type === 'done') {
          // Retirer le curseur
          cursor.remove();
          port.disconnect();
        } else if (message.type === 'error') {
          setTrustedHTML(element, `<span class="ia-action-error">Erreur: ${message.error}</span>`);
          port.disconnect();
        }
      });

      port.onDisconnect.addListener(() => {
        if (chrome.runtime.lastError) {
          console.error('IA Helper: Port disconnected', chrome.runtime.lastError.message);
        }
      });

      // Envoyer la demande de generation
      port.postMessage({
        type: 'GENERATE_STREAMING',
        content: content,
        systemPrompt: systemPrompt
      });

    } catch (error) {
      console.error('IA Helper: Erreur generation', error);
      setTrustedHTML(element, `<span class="ia-action-error">Erreur: ${error.message}</span>`);
    }
  }

  // Ouvrir la page de resultats avec un resultat deja genere
  function openResultsPageWithResult(actionId, content, systemPrompt, result) {
    const resultData = {
      actionId,
      content,
      systemPrompt,
      targetLanguage: null,
      timestamp: Date.now(),
      preGeneratedResult: result // Resultat deja genere
    };

    chrome.storage.local.set({ pendingResult: resultData }, () => {
      if (chrome.runtime.lastError) {
        console.error('IA Helper: Erreur stockage', chrome.runtime.lastError);
        return;
      }
      chrome.runtime.sendMessage({ type: 'OPEN_RESULTS_PAGE' });
    });
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

    // Utiliser une Promise pour s'assurer que le stockage est termine avant d'ouvrir la page
    chrome.storage.local.set({ pendingResult: resultData }, () => {
      if (chrome.runtime.lastError) {
        console.error('IA Helper: Erreur stockage', chrome.runtime.lastError);
        showNotification('Erreur de stockage', 'error');
        return;
      }

      console.log('IA Helper: Donnees stockees, ouverture page...');

      // Ouvrir directement la page via chrome.tabs (via message au background)
      try {
        chrome.runtime.sendMessage({ type: 'OPEN_RESULTS_PAGE' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('IA Helper: Erreur envoi message', chrome.runtime.lastError);
            // Fallback: ouvrir via window.open si le message echoue
            const resultsUrl = chrome.runtime.getURL('src/results/results.html');
            window.open(resultsUrl, '_blank');
          } else {
            console.log('IA Helper: Page ouverte', response);
          }
        });
      } catch (e) {
        console.error('IA Helper: Exception', e);
        // Fallback: ouvrir via window.open
        const resultsUrl = chrome.runtime.getURL('src/results/results.html');
        window.open(resultsUrl, '_blank');
      }
    });
  }

  // Ecouter les changements de focus pour tracker l'element actif
  document.addEventListener('focusin', (e) => {
    if (isEditableElement(e.target)) {
      activeElement = e.target;
    }
  });

  // === RACCOURCIS CLAVIER ET POPUP RAPIDE ===

  // Raccourcis par defaut
  const DEFAULT_SHORTCUTS = {
    quickPrompt: { key: 'i', alt: true, ctrl: false, shift: false, actionId: 'quickPrompt', actionName: 'Prompt rapide' }
  };

  let shortcuts = { ...DEFAULT_SHORTCUTS };
  let shortcutsEnabled = true;
  let defaultTranslateLang = 'en';
  let customActions = [];

  // Charger les raccourcis
  async function loadShortcuts() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['shortcuts', 'shortcutsEnabled', 'defaultTranslateLang', 'customActions'], (result) => {
        shortcuts = result.shortcuts || { ...DEFAULT_SHORTCUTS };
        shortcutsEnabled = result.shortcutsEnabled !== false;
        defaultTranslateLang = result.defaultTranslateLang || 'en';
        customActions = result.customActions || [];
        resolve();
      });
    });
  }

  // Verifier si un raccourci correspond
  function matchShortcut(e, shortcut) {
    if (!shortcut) return false;
    return e.key.toLowerCase() === shortcut.key.toLowerCase() &&
           e.altKey === (shortcut.alt || false) &&
           e.ctrlKey === (shortcut.ctrl || false) &&
           e.shiftKey === (shortcut.shift || false);
  }

  // Listener de raccourcis
  document.addEventListener('keydown', async (e) => {
    if (!shortcutsEnabled) return;

    // Ignorer si on est dans le modal de prompt rapide
    if (document.getElementById('ia-helper-quick-modal')) {
      if (e.key === 'Escape') {
        closeQuickModal();
      }
      return;
    }

    // Parcourir tous les raccourcis configures
    for (const [actionId, shortcut] of Object.entries(shortcuts)) {
      if (matchShortcut(e, shortcut)) {
        e.preventDefault();

        // Prompt rapide
        if (actionId === 'quickPrompt') {
          openQuickPromptModal();
          return;
        }

        // Traduction
        if (actionId.startsWith('translate_')) {
          const lang = actionId.replace('translate_', '');
          executeShortcutAction('translate', lang);
          return;
        }

        // Action personnalisee
        if (actionId.startsWith('custom_')) {
          const customAction = customActions.find(a => a.id === actionId);
          if (customAction) {
            executeCustomAction(customAction);
          }
          return;
        }

        // Action standard
        executeShortcutAction(actionId);
        return;
      }
    }
  });

  // Executer une action via raccourci - demande le prompt au service-worker
  function executeShortcutAction(actionId, targetLang = null) {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';

    if (!selectedText) {
      showNotification('Selectionnez du texte d\'abord', 'error');
      return;
    }

    // Demander le prompt au service-worker pour avoir le meme que le menu contextuel
    chrome.runtime.sendMessage({
      type: 'GET_ACTION_PROMPT',
      actionId: actionId
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('IA Helper: Erreur get prompt', chrome.runtime.lastError);
        // Fallback sur les prompts locaux
        handleAction({
          actionId: actionId,
          actionType: targetLang ? 'translate' : 'selection',
          selectedText: selectedText,
          targetLanguage: targetLang,
          isEditable: false
        });
        return;
      }

      // Utiliser le prompt du service-worker
      handleAction({
        actionId: actionId,
        actionType: targetLang ? 'translate' : 'action',
        selectedText: selectedText,
        targetLanguage: targetLang,
        presetPrompt: response?.prompt || '',
        isEditable: false
      });
    });
  }

  // Executer une action personnalisee
  function executeCustomAction(customAction) {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';

    if (!selectedText) {
      showNotification('Selectionnez du texte d\'abord', 'error');
      return;
    }

    // Envoyer au handler d'action avec le prompt personnalise
    handleAction({
      actionId: customAction.id,
      actionType: 'custom',
      selectedText: selectedText,
      presetPrompt: customAction.prompt,
      isEditable: false
    });
  }

  // Creer et ouvrir le modal de prompt rapide
  function openQuickPromptModal() {
    // Capturer le texte selectionne avant d'ouvrir le modal
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';

    // Supprimer un modal existant
    closeQuickModal();

    // Creer le modal
    const modal = document.createElement('div');
    modal.id = 'ia-helper-quick-modal';
    setTrustedHTML(modal, `
      <div class="ia-quick-overlay"></div>
      <div class="ia-quick-container">
        <div class="ia-quick-header">
          <span class="ia-quick-title">IA Helper - Prompt rapide</span>
          <button class="ia-quick-close">&times;</button>
        </div>
        ${selectedText ? `
          <div class="ia-quick-context">
            <div class="ia-quick-context-label">Texte selectionne:</div>
            <div class="ia-quick-context-text">${escapeHtml(selectedText.substring(0, 200))}${selectedText.length > 200 ? '...' : ''}</div>
          </div>
          <div class="ia-quick-mode">
            <label class="ia-quick-mode-option">
              <input type="radio" name="ia-mode" value="with" checked>
              <span>Utiliser comme contexte</span>
            </label>
            <label class="ia-quick-mode-option">
              <input type="radio" name="ia-mode" value="only">
              <span>Traiter le texte uniquement</span>
            </label>
            <label class="ia-quick-mode-option">
              <input type="radio" name="ia-mode" value="without">
              <span>Ignorer la selection</span>
            </label>
          </div>
        ` : ''}
        <div class="ia-quick-input-wrapper">
          <textarea class="ia-quick-input" placeholder="${selectedText ? 'Que voulez-vous faire avec ce texte?' : 'Posez votre question ou donnez une instruction...'}" rows="3"></textarea>
        </div>
        <div class="ia-quick-actions">
          <button class="ia-quick-btn ia-quick-btn-secondary ia-quick-cancel">Annuler</button>
          <button class="ia-quick-btn ia-quick-btn-primary ia-quick-send">
            <span>Envoyer</span>
            <span class="ia-quick-shortcut">Enter</span>
          </button>
        </div>
      </div>
    `);

    // Ajouter les styles
    const styles = document.createElement('style');
    styles.id = 'ia-helper-quick-styles';
    styles.textContent = `
      #ia-helper-quick-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .ia-quick-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(3px);
      }
      .ia-quick-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 560px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 16px;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
        overflow: hidden;
        animation: ia-quick-appear 0.2s ease-out;
      }
      @keyframes ia-quick-appear {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      .ia-quick-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .ia-quick-title {
        font-weight: 600;
        font-size: 16px;
        color: #fff;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .ia-quick-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.2s;
      }
      .ia-quick-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
      .ia-quick-context {
        padding: 16px 20px;
        background: rgba(102, 126, 234, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .ia-quick-context-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .ia-quick-context-text {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.5;
        max-height: 80px;
        overflow-y: auto;
      }
      .ia-quick-mode {
        padding: 12px 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .ia-quick-mode-option {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
      }
      .ia-quick-mode-option input {
        accent-color: #667eea;
      }
      .ia-quick-mode-option:hover {
        color: #fff;
      }
      .ia-quick-input-wrapper {
        padding: 20px;
      }
      .ia-quick-input {
        width: 100%;
        box-sizing: border-box;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 14px 16px;
        font-size: 15px;
        color: #fff;
        resize: none;
        outline: none;
        transition: all 0.2s;
        font-family: inherit;
      }
      .ia-quick-input::placeholder {
        color: rgba(255, 255, 255, 0.4);
      }
      .ia-quick-input:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
      }
      .ia-quick-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        background: rgba(0, 0, 0, 0.2);
      }
      .ia-quick-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }
      .ia-quick-btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.8);
      }
      .ia-quick-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.15);
      }
      .ia-quick-btn-primary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: #fff;
      }
      .ia-quick-btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      }
      .ia-quick-shortcut {
        font-size: 11px;
        padding: 2px 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
      }
    `;

    if (!document.getElementById('ia-helper-quick-styles')) {
      document.head.appendChild(styles);
    }

    document.body.appendChild(modal);

    // Focus sur le champ de saisie
    const input = modal.querySelector('.ia-quick-input');
    setTimeout(() => input.focus(), 100);

    // Stocker le texte selectionne
    modal.dataset.selectedText = selectedText;

    // Event listeners
    modal.querySelector('.ia-quick-close').addEventListener('click', closeQuickModal);
    modal.querySelector('.ia-quick-cancel').addEventListener('click', closeQuickModal);
    modal.querySelector('.ia-quick-overlay').addEventListener('click', closeQuickModal);
    modal.querySelector('.ia-quick-send').addEventListener('click', () => sendQuickPrompt(modal));

    // Enter pour envoyer (Shift+Enter pour nouvelle ligne)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendQuickPrompt(modal);
      }
    });
  }

  // Fermer le modal
  function closeQuickModal() {
    // Arreter la lecture vocale si en cours
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
    }
    const modal = document.getElementById('ia-helper-quick-modal');
    if (modal) modal.remove();
  }

  // Echapper le HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Envoyer le prompt rapide
  async function sendQuickPrompt(modal) {
    const input = modal.querySelector('.ia-quick-input').value.trim();
    const selectedText = modal.dataset.selectedText || '';

    if (!input) {
      showNotification('Entrez une instruction', 'error');
      return;
    }

    // Determiner le mode
    let mode = 'without';
    const modeRadio = modal.querySelector('input[name="ia-mode"]:checked');
    if (modeRadio) mode = modeRadio.value;

    // Construire le contenu et le prompt
    let content = '';
    let systemPrompt = '';

    if ((mode === 'with' || mode === 'only') && selectedText) {
      content = selectedText;
      systemPrompt = `${input}\n\nReponds de maniere claire et naturelle. Pas de tableaux.`;
    } else {
      content = input;
      systemPrompt = 'Tu es un assistant IA. Reponds de maniere claire et naturelle. Pas de tableaux.';
    }

    console.log('IA Helper: Quick prompt envoi', { mode, content: content.substring(0, 50), systemPrompt });

    // Recharger la config pour avoir les derniers parametres
    await loadConfig();

    // Mode popup inline ou ouverture dans un nouvel onglet
    if (config.inlinePopupEnabled) {
      showInlineResponse(modal, content, systemPrompt);
    } else {
      closeQuickModal();
      openResultsPage('quick_prompt', content, systemPrompt, null);
    }
  }

  // Afficher la reponse en streaming dans le popup
  async function showInlineResponse(modal, content, systemPrompt) {
    const container = modal.querySelector('.ia-quick-container');

    // Transformer le modal en mode reponse
    setTrustedHTML(container, `
      <div class="ia-quick-header">
        <span class="ia-quick-title">IA Helper - ${ct('response')}</span>
        <button class="ia-quick-close">&times;</button>
      </div>
      <div class="ia-quick-response-area">
        <div class="ia-quick-response-content">
          <span class="ia-quick-waiting">${ct('connectingToAI')}</span>
          <span class="ia-quick-cursor"></span>
        </div>
      </div>
      <div class="ia-quick-response-actions">
        <button class="ia-quick-btn ia-quick-btn-secondary ia-quick-copy">${ct('copy')}</button>
        ${config.speechEnabled !== false ? `<button class="ia-quick-btn ia-quick-btn-secondary ia-quick-speak">${ct('speak')}</button>` : ''}
        <button class="ia-quick-btn ia-quick-btn-secondary ia-quick-detail">${ct('viewDetails')}</button>
        <button class="ia-quick-btn ia-quick-btn-primary ia-quick-close-final">${ct('close')}</button>
      </div>
    `);

    // Ajouter les styles de reponse
    addResponseStyles();

    // Event listeners
    container.querySelector('.ia-quick-close').addEventListener('click', closeQuickModal);
    container.querySelector('.ia-quick-close-final').addEventListener('click', closeQuickModal);
    container.querySelector('.ia-quick-copy').addEventListener('click', () => {
      const responseText = container.querySelector('.ia-quick-response-content').textContent;
      navigator.clipboard.writeText(responseText);
      showNotification(ct('copied'), 'success');
    });

    // Bouton de lecture vocale (si active)
    const speakBtn = container.querySelector('.ia-quick-speak');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        const responseText = container.querySelector('.ia-quick-response-content').textContent;
        toggleSpeech(responseText, speakBtn);
      });
    }

    container.querySelector('.ia-quick-detail').addEventListener('click', () => {
      closeQuickModal();
      openResultsPage('quick_prompt', content, systemPrompt, null);
    });

    // Lancer la generation
    const responseEl = container.querySelector('.ia-quick-response-content');
    await generateResponse(responseEl, content, systemPrompt);
  }

  // Ajouter les styles pour le mode reponse
  function addResponseStyles() {
    if (document.getElementById('ia-helper-response-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'ia-helper-response-styles';
    styles.textContent = `
      .ia-quick-response-area {
        padding: 20px;
        max-height: 400px;
        overflow-y: auto;
      }
      .ia-quick-response-content {
        font-size: 14px;
        line-height: 1.7;
        color: rgba(255, 255, 255, 0.9);
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      .ia-quick-cursor {
        display: inline-block;
        width: 8px;
        height: 16px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        animation: ia-blink 1s infinite;
        vertical-align: middle;
        margin-left: 2px;
      }
      @keyframes ia-blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      .ia-quick-response-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        background: rgba(0, 0, 0, 0.2);
      }
      .ia-quick-error {
        color: #ff6b6b;
      }
      .ia-quick-waiting {
        color: rgba(255, 255, 255, 0.5);
        font-style: italic;
      }
      .ia-quick-speak.ia-action-speaking {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: #fff !important;
        animation: ia-pulse 1.5s infinite;
      }
      @keyframes ia-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `;
    document.head.appendChild(styles);
  }

  // Generer la reponse via le background script (sans streaming pour le popup)
  async function generateResponse(element, content, systemPrompt) {
    try {
      // Demander au background script de generer la reponse
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type: 'GENERATE_RESPONSE',
          content: content,
          systemPrompt: systemPrompt
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
          }
        });
      });

      if (response && response.result) {
        element.textContent = response.result;
      } else {
        setTrustedHTML(element, `<span class="ia-quick-error">Aucune reponse recue</span>`);
      }
    } catch (error) {
      console.error('IA Helper: Erreur generation', error);
      setTrustedHTML(element, `<span class="ia-quick-error">Erreur: ${error.message}</span>`);
    }
  }

  // Recharger les raccourcis si mis a jour
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SHORTCUTS_UPDATED') {
      loadShortcuts();
    }
  });

  // Initialisation
  loadConfig().then(() => {
    loadShortcuts();
    console.log('IA Helper Content Script charge');
  });
})();

