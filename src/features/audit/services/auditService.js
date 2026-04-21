import { api } from '@/lib/api'

const auditService = {
  async getAll() {
    return api.get('traza').json()
  },
  async getGeneralActions() {
    return api.get('traza/general').json()
  },
  async getCloseActions() {
    return api.get('traza/close').json()
  },
  async getCancelActions() {
    return api.get('traza/cancel').json()
  },
  async getIOActions() {
    return api.get('traza/io').json()
  }
}

export default auditService
