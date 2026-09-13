/**
 * Offline Sync and Storage Manager
 * Stores changes when offline and replays them when connectivity resumes.
 */

interface PendingAction {
  id: string
  timestamp: number
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  payload: any
}

const STORAGE_KEY = 'invoicepro_pending_sync_actions'

export const offlineSync = {
  getPendingActions(): PendingAction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  enqueue(type: PendingAction['type'], table: string, payload: any) {
    try {
      const actions = this.getPendingActions()
      const newAction: PendingAction = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        timestamp: Date.now(),
        type,
        table,
        payload,
      }
      actions.push(newAction)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(actions))
      return newAction.id
    } catch (e) {
      console.warn('Failed to enqueue offline action', e)
      return null
    }
  },

  removeAction(id: string) {
    try {
      const actions = this.getPendingActions().filter(a => a.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(actions))
    } catch (e) {
      console.warn('Failed to remove offline action', e)
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY)
  },

  pendingCount(): number {
    return this.getPendingActions().length
  },
}
