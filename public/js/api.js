/**
 * Smart Notes Manager - API Client Module
 * Communicates with the backend server and handles persistent data sync.
 */

const API = {
  baseUrl: '/api',

  async getNotebooks() {
    try {
      const res = await fetch(`${this.baseUrl}/notebooks`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('API Error in getNotebooks:', err);
      // Fallback to local storage if server fails
      const cached = localStorage.getItem('smart_notes_notebooks');
      if (cached) {
        return { success: true, notebooks: JSON.parse(cached), fromCache: true };
      }
      throw err;
    }
  },

  async getNotebook(id) {
    try {
      const res = await fetch(`${this.baseUrl}/notebooks/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.success && data.notebook) {
        localStorage.setItem(`smart_notes_nb_${id}`, JSON.stringify(data.notebook));
      }
      return data;
    } catch (err) {
      console.error(`API Error in getNotebook(${id}):`, err);
      const cached = localStorage.getItem(`smart_notes_nb_${id}`);
      if (cached) {
        return { success: true, notebook: JSON.parse(cached), fromCache: true };
      }
      throw err;
    }
  },

  async analyzeContent(notebookId, rawContent) {
    const res = await fetch(`${this.baseUrl}/learning-content/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notebookId, rawContent })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
      throw new Error(err.error || 'Failed to analyze learning content');
    }
    return await res.json();
  },

  async appendContent(notebookId, payload) {
    const res = await fetch(`${this.baseUrl}/notebooks/${encodeURIComponent(notebookId)}/append`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Save failed' }));
      throw new Error(err.error || 'Failed to append to notebook');
    }
    const data = await res.json();
    if (data.success && data.notebook) {
      localStorage.setItem(`smart_notes_nb_${notebookId}`, JSON.stringify(data.notebook));
    }
    return data;
  },

  async createNotebook(data) {
    const res = await fetch(`${this.baseUrl}/notebooks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Creation failed' }));
      throw new Error(err.error || 'Failed to create notebook');
    }
    return await res.json();
  },

  async deleteSection(notebookId, sectionId) {
    const res = await fetch(`${this.baseUrl}/notebooks/${encodeURIComponent(notebookId)}/sections/${encodeURIComponent(sectionId)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete section');
    return await res.json();
  },

  async resetEmpty(notebookId) {
    const res = await fetch(`${this.baseUrl}/notebooks/${encodeURIComponent(notebookId)}/reset-empty`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to reset notebook');
    return await res.json();
  }
};

window.API = API;
