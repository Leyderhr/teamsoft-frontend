// src/stores/finalizeTeam.js
import { defineStore } from 'pinia'

// Estado del flujo "Finalizar equipo": preserva el proyecto seleccionado y las
// evaluaciones asignadas a cada miembro mientras se navega entre las vistas
// (lista → miembros → editor de competencias) sin perder lo ya seleccionado.
export const useFinalizeTeamStore = defineStore('finalizeTeam', {
  state: () => ({
    projectId: null,
    projectName: '',
    // { personId, personName, surName, card, roleId, roleName, roleEvaluationId }
    members: [],
  }),

  getters: {
    allEvaluated: (state) =>
      state.members.length > 0 && state.members.every(m => m.roleEvaluationId != null),

    finalizePayload: (state) =>
      state.members.map(m => ({
        person: m.personId,
        role: m.roleId,
        roleEvaluation: m.roleEvaluationId,
      })),
  },

  actions: {
    setProject(id, name) {
      const numericId = Number(id)
      if (this.projectId !== numericId) {
        this.projectId = numericId
        this.members = []
      }
      this.projectName = name ?? this.projectName
    },

    setMembers(members) {
      this.members = members
    },

    setEvaluation(personId, roleId, roleEvaluationId) {
      const member = this.members.find(m => m.personId === personId && m.roleId === roleId)
      if (member) member.roleEvaluationId = roleEvaluationId
    },

    getMember(personId) {
      return this.members.find(m => m.personId === Number(personId)) ?? null
    },

    reset() {
      this.$reset()
    },
  },
})
