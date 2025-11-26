// Service de communication avec Ollama

export class OllamaService {
  constructor(baseUrl = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url) {
    this.baseUrl = url.replace(/\/$/, ''); // Enlever le slash final
  }

  // Recuperer la liste des modeles disponibles
  async getModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Erreur lors de la recuperation des modeles:', error);
      throw error;
    }
  }

  // Verifier la connexion au serveur
  async checkConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      console.error('Erreur de connexion a Ollama:', error);
      return false;
    }
  }

  // Generer une reponse (sans streaming)
  async generate(model, prompt, systemPrompt = '') {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          system: systemPrompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Erreur lors de la generation:', error);
      throw error;
    }
  }

  // Generer une reponse en streaming
  async *generateStream(model, prompt, systemPrompt = '') {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          system: systemPrompt,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

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
              yield json.response;
            }
            if (json.done) {
              return;
            }
          } catch (e) {
            // Ignorer les lignes non-JSON
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du streaming:', error);
      throw error;
    }
  }

  // Chat avec historique (sans streaming)
  async chat(model, messages, systemPrompt = '') {
    try {
      const formattedMessages = [];
      
      if (systemPrompt) {
        formattedMessages.push({ role: 'system', content: systemPrompt });
      }
      
      formattedMessages.push(...messages);

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: formattedMessages,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.message?.content || '';
    } catch (error) {
      console.error('Erreur lors du chat:', error);
      throw error;
    }
  }
}

// Instance singleton
export const ollamaService = new OllamaService();

