// Service de stockage local avec chrome.storage

import { DEFAULT_CONFIG, INPUT_ACTIONS, SELECTION_ACTIONS, PRO_ACTIONS } from '../config/default-config.js';

export class StorageService {
  // Obtenir la configuration complete
  async getConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['config'], (result) => {
        resolve(result.config || DEFAULT_CONFIG);
      });
    });
  }

  // Sauvegarder la configuration
  async saveConfig(config) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ config }, resolve);
    });
  }

  // Obtenir une valeur specifique de la config
  async getConfigValue(key) {
    const config = await this.getConfig();
    return config[key];
  }

  // Mettre a jour une valeur specifique
  async updateConfigValue(key, value) {
    const config = await this.getConfig();
    config[key] = value;
    await this.saveConfig(config);
  }

  // Obtenir les actions pour les champs de saisie
  async getInputActions() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['inputActions'], (result) => {
        resolve(result.inputActions || INPUT_ACTIONS);
      });
    });
  }

  // Sauvegarder les actions pour les champs de saisie
  async saveInputActions(actions) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ inputActions: actions }, resolve);
    });
  }

  // Obtenir les actions pour la selection de texte
  async getSelectionActions() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['selectionActions'], (result) => {
        resolve(result.selectionActions || SELECTION_ACTIONS);
      });
    });
  }

  // Sauvegarder les actions pour la selection
  async saveSelectionActions(actions) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ selectionActions: actions }, resolve);
    });
  }

  // Obtenir les actions Pro
  async getProActions() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['proActions'], (result) => {
        resolve(result.proActions || PRO_ACTIONS);
      });
    });
  }

  // Sauvegarder les actions Pro
  async saveProActions(actions) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ proActions: actions }, resolve);
    });
  }

  // Obtenir les prompts personnalises
  async getCustomPrompts() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['customPrompts'], (result) => {
        resolve(result.customPrompts || {});
      });
    });
  }

  // Sauvegarder un prompt personnalise
  async saveCustomPrompt(actionId, prompt) {
    const customPrompts = await this.getCustomPrompts();
    customPrompts[actionId] = prompt;
    return new Promise((resolve) => {
      chrome.storage.local.set({ customPrompts }, resolve);
    });
  }

  // Supprimer un prompt personnalise (retour au defaut)
  async deleteCustomPrompt(actionId) {
    const customPrompts = await this.getCustomPrompts();
    delete customPrompts[actionId];
    return new Promise((resolve) => {
      chrome.storage.local.set({ customPrompts }, resolve);
    });
  }

  // Obtenir les actions personnalisees de l'utilisateur
  async getUserCustomActions() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userCustomActions'], (result) => {
        resolve(result.userCustomActions || []);
      });
    });
  }

  // Ajouter une action personnalisee
  async addUserCustomAction(action) {
    const actions = await this.getUserCustomActions();
    action.id = `custom_${Date.now()}`;
    actions.push(action);
    return new Promise((resolve) => {
      chrome.storage.local.set({ userCustomActions: actions }, resolve);
    });
  }

  // Supprimer une action personnalisee
  async deleteUserCustomAction(actionId) {
    let actions = await this.getUserCustomActions();
    actions = actions.filter(a => a.id !== actionId);
    return new Promise((resolve) => {
      chrome.storage.local.set({ userCustomActions: actions }, resolve);
    });
  }

  // Reinitialiser toutes les options aux valeurs par defaut
  async resetToDefaults() {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve();
      });
    });
  }
}

// Instance singleton
export const storageService = new StorageService();

