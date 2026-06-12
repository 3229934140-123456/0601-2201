import type { CanvasState, DraftMeta, DraftVersion } from '@/types';

const DRAFTS_KEY = 'poster_drafts';
const CURRENT_DRAFT_KEY = 'current_draft';
const MAX_VERSIONS = 10;

export const generateId = (): string => {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
};

export const saveDraft = (state: CanvasState, withVersion: boolean = true): void => {
  try {
    const drafts = getAllDrafts();
    const existingIndex = drafts.findIndex(d => d.id === state.id);
    
    const draftMeta: DraftMeta = {
      id: state.id,
      name: state.name,
      thumbnail: '',
      updatedAt: state.updatedAt,
      width: state.width,
      height: state.height,
      versions: [],
    };

    if (existingIndex >= 0) {
      draftMeta.thumbnail = drafts[existingIndex].thumbnail;
      draftMeta.versions = drafts[existingIndex].versions || [];
    }

    if (withVersion) {
      const newVersion: DraftVersion = {
        id: generateId(),
        state: JSON.parse(JSON.stringify(state)),
        savedAt: state.updatedAt,
      };
      draftMeta.versions = [newVersion, ...(draftMeta.versions || [])].slice(0, MAX_VERSIONS);
    }

    if (existingIndex >= 0) {
      drafts[existingIndex] = draftMeta;
    } else {
      drafts.unshift(draftMeta);
    }

    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    localStorage.setItem(`${DRAFTS_KEY}_${state.id}`, JSON.stringify(state));
    localStorage.setItem(CURRENT_DRAFT_KEY, state.id);
  } catch (e) {
    console.error('Failed to save draft:', e);
  }
};

export const getDraftVersions = (draftId: string): DraftVersion[] => {
  try {
    const drafts = getAllDrafts();
    const draft = drafts.find(d => d.id === draftId);
    return draft?.versions || [];
  } catch (e) {
    console.error('Failed to get draft versions:', e);
    return [];
  }
};

export const restoreDraftVersion = (draftId: string, versionId: string): CanvasState | null => {
  try {
    const versions = getDraftVersions(draftId);
    const version = versions.find(v => v.id === versionId);
    if (!version) return null;

    const restoredState = {
      ...version.state,
      updatedAt: Date.now(),
    };

    saveDraft(restoredState, true);
    return restoredState;
  } catch (e) {
    console.error('Failed to restore version:', e);
    return null;
  }
};

export const getDraft = (id: string): CanvasState | null => {
  try {
    const data = localStorage.getItem(`${DRAFTS_KEY}_${id}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to get draft:', e);
    return null;
  }
};

export const getAllDrafts = (): DraftMeta[] => {
  try {
    const data = localStorage.getItem(DRAFTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to get drafts:', e);
    return [];
  }
};

export const deleteDraft = (id: string): void => {
  try {
    const drafts = getAllDrafts().filter(d => d.id !== id);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    localStorage.removeItem(`${DRAFTS_KEY}_${id}`);
    
    const current = localStorage.getItem(CURRENT_DRAFT_KEY);
    if (current === id) {
      localStorage.removeItem(CURRENT_DRAFT_KEY);
    }
  } catch (e) {
    console.error('Failed to delete draft:', e);
  }
};

export const getCurrentDraftId = (): string | null => {
  return localStorage.getItem(CURRENT_DRAFT_KEY);
};

export const updateDraftThumbnail = (id: string, thumbnail: string): void => {
  try {
    const drafts = getAllDrafts();
    const draft = drafts.find(d => d.id === id);
    if (draft) {
      draft.thumbnail = thumbnail;
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    }
  } catch (e) {
    console.error('Failed to update thumbnail:', e);
  }
};

export const generateShareLink = (state: CanvasState): string => {
  try {
    const compressed = btoa(encodeURIComponent(JSON.stringify(state)));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}preview#data=${compressed}`;
  } catch (e) {
    console.error('Failed to generate share link:', e);
    return '';
  }
};

export const parseShareLink = (hash?: string): CanvasState | null => {
  try {
    const targetHash = hash || window.location.hash.slice(1);
    if (!targetHash.startsWith('data=')) return null;
    
    const compressed = targetHash.slice(5);
    const decoded = JSON.parse(decodeURIComponent(atob(compressed)));
    return decoded as CanvasState;
  } catch (e) {
    console.error('Failed to parse share link:', e);
    return null;
  }
};
