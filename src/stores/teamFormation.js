// src/stores/teamFormation.js
import { defineStore } from 'pinia'

export const DEFAULT_TF_PARAMS = {
  // Step 1 fields (default all false/0; overwritten only in teamsPayload getter)
  confRole: false, maximunRoles: 0, confAllGroup: false, onlyOneProject: false,
  confFormMode: 0, minimunRoles: false, minimumRole: 1,
  bossNeedToBeAssignedToAnotherRoles: false,
  // Objective functions
  maxCompetences: false, maxCompetencesWeight: 0.0,
  maxInterests: false, maxInterestsWeight: 0.0,
  maxProjectInterests: false, maxProjectInterestsWeight: 0.0,
  maxMbtiTypes: false, maxMbtiTypesWeight: 0.0,
  maxBelbinRoles: false, maxBelbinWeight: 0.0,
  minIncomp: false, minIncompWeight: 0.0,
  minCostDistance: false, minCostDistanceWeight: 0.0,
  takeWorkLoad: false, workLoadWeight: 0.0,
  maxMultiroleTeamMembers: false, maxMultiroleTeamMembersWeight: 0.0,
  maxSex: false, maxSexWeight: 0.0,
  minSex: false, minSexWeight: 0.0,
  heterogeneousTeams: false, heterogeneousTeamsWeight: 0.0,
  homogeneousTeams: false, homogeneousTeamsWeight: 0.0,
  maxReligion: false, maxReligionWeight: 0.0,
  minReligion: false, minReligionWeight: 0.0,
  maxAgeHeterogeneity: false, maxAgeHeterogeneityWeight: 0.0,
  minAgeHomogeneity: false, minAgeHomogeneityWeight: 0.0,
  // Balance functions
  balanceCompetences: false, balanceCompetenceWeight: 0.0,
  balanceInterests: false, balanceInterestWeight: 0.0,
  balanceProjectInterests: false, balanceProjectInterestWeight: 0.0,
  balanceMbtiTypes: false, balanceMbtiTypesWeight: 0.0,
  balanceBelbinRoles: false, balanceBelbinWeight: 0.0,
  balanceSynergy: false, balanceSynergyWeight: 0.0,
  balanceCostDistance: false, balanceCostDistanceWeight: 0.0,
  balancePersonWorkload: false, balanceWorkLoadWeight: 0.0,
  balanceMultiroleTeamMembers: false, balanceMultiroleTeamMembersWeight: 0.0,
  balanceMaximizeSexFactor: false, balanceMaximizeSexFactorWeight: 0.0,
  balanceMinimizeSexFactor: false, balanceMinimizeSexFactorWeight: 0.0,
  balanceHeterogeneousTeams: false, balanceHeterogeneousTeamsNacionalityFactorWeight: 0.0,
  balanceHomogeneousTeams: false, balanceHomogeneousTeamsNacionalityFactorWeight: 0.0,
  balanceMaximizeReligion: false, balanceMaximizeReligionWeight: 0.0,
  balanceMinimizeReligion: false, balanceMinimizeReligionWeight: 0.0,
  balanceMaximizeAgeHeterogeneity: false, balanceMaximizeAgeHeterogeneityWeight: 0.0,
  balanceMinimizeAgeHomogeneity: false, balanceMinimizeAgeHomogeneityWeight: 0.0,
  // Restrictions
  canBeProjectBoss: false, takeCustomPersonWorkLoad: false,
  preferBelbin: false, preferMyersBrigs: false,
  bossTeamInterest: false, notAlreadyBossAssigned: false,
  belbinPreference: false, mbtiExtrovertedPlanner: false,
  // Step 3 config
  solutionMethodOptionTeam: 'FactoresPonderados',
  solutionAlgorithm: 1,
  anyIncompatibility: false, anySelectedIncompatibility: false,
  allBelbinRoles: false, demandNBrains: false, countBrains: 0,
  balanceBelbinCategories: false, allBelbinCategories: false,
  actionMentalOper: '>', mentalSocialOper: '>', socialOper: '>',
  // Selected incompatibilities (wire format sent to backend)
  sWI: [], sRI: [],
  // Backend-filled (always empty from frontend)
  groupList: [], ppg: [], searchArea: [], projects: [],
  maxLevel: null, minLevel: null, maxConflictIndex: null, maxCostDistance: null,
  cantCerebro: 0, maxRoleLoad: null,
  fixedWorkers: [],
}

// Weight pairs for validation
const STEP2_WEIGHT_PAIRS = [
  ['maxCompetences', 'maxCompetencesWeight'],
  ['takeWorkLoad', 'workLoadWeight'],
  ['maxInterests', 'maxInterestsWeight'],
  ['minCostDistance', 'minCostDistanceWeight'],
  ['maxProjectInterests', 'maxProjectInterestsWeight'],
  ['minIncomp', 'minIncompWeight'],
]

const STEP3_WEIGHT_PAIRS = [
  ['maxCompetences', 'maxCompetencesWeight'],
  ['balanceCompetences', 'balanceCompetenceWeight'],
  ['takeWorkLoad', 'workLoadWeight'],
  ['balancePersonWorkload', 'balanceWorkLoadWeight'],
  ['minIncomp', 'minIncompWeight'],
  ['balanceSynergy', 'balanceSynergyWeight'],
  ['minCostDistance', 'minCostDistanceWeight'],
  ['balanceCostDistance', 'balanceCostDistanceWeight'],
  ['maxInterests', 'maxInterestsWeight'],
  ['balanceInterests', 'balanceInterestWeight'],
  ['maxBelbinRoles', 'maxBelbinWeight'],
  ['balanceBelbinRoles', 'balanceBelbinWeight'],
  ['maxProjectInterests', 'maxProjectInterestsWeight'],
  ['maxMbtiTypes', 'maxMbtiTypesWeight'],
  ['maxMultiroleTeamMembers', 'maxMultiroleTeamMembersWeight'],
  ['balanceMultiroleTeamMembers', 'balanceMultiroleTeamMembersWeight'],
  ['maxSex', 'maxSexWeight'],
  ['balanceMaximizeSexFactor', 'balanceMaximizeSexFactorWeight'],
  ['heterogeneousTeams', 'heterogeneousTeamsWeight'],
  ['balanceHeterogeneousTeams', 'balanceHeterogeneousTeamsNacionalityFactorWeight'],
  ['maxReligion', 'maxReligionWeight'],
  ['balanceMaximizeReligion', 'balanceMaximizeReligionWeight'],
  ['maxAgeHeterogeneity', 'maxAgeHeterogeneityWeight'],
  ['balanceMaximizeAgeHeterogeneity', 'balanceMaximizeAgeHeterogeneityWeight'],
]

function checkWeights(factors, pairs) {
  const total = pairs
    .filter(([flag]) => factors[flag])
    .reduce((sum, [, wKey]) => sum + (factors[wKey] ?? 0), 0)
  if (Math.abs(total - 1.0) > 0.001) {
    return { valid: false, error: `Los pesos deben sumar 1.0 (actual: ${total.toFixed(3)})` }
  }
  return { valid: true, error: null }
}

function toWireFixedWorkers(fixedWorkers) {
  return fixedWorkers.map(fw => ({
    project: { id: fw.projectId },
    role: { id: fw.roleId },
    boss: { id: fw.personId },
  }))
}

function toWireSWI(items) {
  return items.map(w => ({ workerAFk: { id: w.personAId }, workerBFk: { id: w.personBId } }))
}

function toWireSRI(items) {
  return items.map(r => ({ roleAFk: { id: r.roleAId }, roleBFk: { id: r.roleBId } }))
}

function confFormMode(step1) {
  return step1.assignBossFirst
    ? (step1.formSimultaneous ? 2 : 1)
    : (step1.formSimultaneous ? 4 : 3)
}

export const useTeamFormationStore = defineStore('teamFormation', {
  state: () => ({
    // Paso actual del asistente (1..3); al hacer reset() vuelve a 1
    currentStep: 1,
    step1: {
      selectedProjectIds: [],
      selectedGroupIds: [],
      confRole: false,
      maximunRoles: 3,
      confAllGroup: false,
      onlyOneProject: true,
      minimunRoles: false,
      minimumRole: 1,
      bossNeedToBeAssignedToAnotherRoles: false,
      assignBossFirst: true,
      formSimultaneous: true,
    },

    step2Factors: {
      maxCompetences: false,       maxCompetencesWeight: null,
      takeWorkLoad: false,         workLoadWeight: null,
      maxInterests: false,         maxInterestsWeight: null,
      minCostDistance: false,      minCostDistanceWeight: null,
      maxProjectInterests: false,  maxProjectInterestsWeight: null,
      minIncomp: false,            minIncompWeight: null,
      belbinPreference: false,
      mbtiExtrovertedPlanner: false,
      notAlreadyBossAssigned: false,
      takeCustomPersonWorkLoad: false,
      bossTeamInterest: false,
      maxRoleLoad: null,
    },

    // UI shape: { personId, personName, roleId, roleName, projectId, projectName, isBoss }
    fixedWorkers: [],

    step3Factors: {
      solutionMethodOptionTeam: 'FactoresPonderados',
      solutionAlgorithm: 1,
      maxCompetences: false,            maxCompetencesWeight: null,
      balanceCompetences: false,        balanceCompetenceWeight: null,
      takeWorkLoad: false,              workLoadWeight: null,
      balancePersonWorkload: false,     balanceWorkLoadWeight: null,
      notAlreadyBossAssigned: false,
      maxRoleLoad: null,
      minIncomp: false,                 minIncompWeight: null,
      balanceSynergy: false,            balanceSynergyWeight: null,
      anyIncompatibility: false,        anySelectedIncompatibility: false,
      // UI-format lists (transformed to wire format in teamsPayload getter)
      workerIncompatibilities: [],      // [{ personAId, personAName, personBId, personBName }]
      roleIncompatibilities: [],        // [{ roleAId, roleAName, roleBId, roleBName }]
      minCostDistance: false,           minCostDistanceWeight: null,
      balanceCostDistance: false,       balanceCostDistanceWeight: null,
      maxInterests: false,              maxInterestsWeight: null,
      balanceInterests: false,          balanceInterestWeight: null,
      belbinPreference: false,
      mbtiExtrovertedPlanner: false,
      maxBelbinRoles: false,            maxBelbinWeight: null,
      balanceBelbinRoles: false,        balanceBelbinWeight: null,
      maxProjectInterests: false,       maxProjectInterestsWeight: null,
      balanceProjectInterests: false,   balanceProjectInterestWeight: null,
      bossTeamInterest: false,
      maxMbtiTypes: false,              maxMbtiTypesWeight: null,
      balanceMbtiTypes: false,          balanceMbtiTypesWeight: null,
      maxMultiroleTeamMembers: false,   maxMultiroleTeamMembersWeight: null,
      balanceMultiroleTeamMembers: false, balanceMultiroleTeamMembersWeight: null,
      maxSex: false,                    maxSexWeight: null,
      balanceMaximizeSexFactor: false,  balanceMaximizeSexFactorWeight: null,
      minSex: false,                    minSexWeight: null,
      balanceMinimizeSexFactor: false,  balanceMinimizeSexFactorWeight: null,
      heterogeneousTeams: false,        heterogeneousTeamsWeight: null,
      balanceHeterogeneousTeams: false, balanceHeterogeneousTeamsNacionalityFactorWeight: null,
      homogeneousTeams: false,          homogeneousTeamsWeight: null,
      balanceHomogeneousTeams: false,   balanceHomogeneousTeamsNacionalityFactorWeight: null,
      maxReligion: false,               maxReligionWeight: null,
      balanceMaximizeReligion: false,   balanceMaximizeReligionWeight: null,
      minReligion: false,               minReligionWeight: null,
      balanceMinimizeReligion: false,   balanceMinimizeReligionWeight: null,
      maxAgeHeterogeneity: false,       maxAgeHeterogeneityWeight: null,
      balanceMaximizeAgeHeterogeneity: false, balanceMaximizeAgeHeterogeneityWeight: null,
      minAgeHomogeneity: false,         minAgeHomogeneityWeight: null,
      balanceMinimizeAgeHomogeneity: false, balanceMinimizeAgeHomogeneityWeight: null,
      allBelbinRoles: false,
      demandNBrains: false,    countBrains: 0,
      balanceBelbinCategories: false,
      allBelbinCategories: false,
      actionMentalOper: '>',
      mentalSocialOper: '>',
      socialOper: '>',
    },
  }),

  getters: {
    bossProposalsPayload: (state) => ({
      teamFormationParameters: {
        ...DEFAULT_TF_PARAMS,
        ...state.step2Factors,
        maxRoleLoad: state.step2Factors.maxRoleLoad,
        fixedWorkers: toWireFixedWorkers(state.fixedWorkers),
      },
      projectIDs: state.step1.selectedProjectIds,
      groupIDs:   state.step1.selectedGroupIds,
    }),

    memberProposalsPayload: (state) => (projectId, roleId) => ({
      teamFormationParameters: {
        ...DEFAULT_TF_PARAMS,
        ...state.step2Factors,
        maxRoleLoad: state.step2Factors.maxRoleLoad,
        fixedWorkers: toWireFixedWorkers(state.fixedWorkers),
      },
      projectId,
      roleId,
      groupIDs: state.step1.selectedGroupIds,
    }),

    teamsPayload: (state) => {
      const s3 = state.step3Factors
      const { workerIncompatibilities, roleIncompatibilities, ...s3Rest } = s3
      return {
        teamFormationParameters: {
          ...DEFAULT_TF_PARAMS,
          // Step 1 config
          confRole: state.step1.confRole,
          maximunRoles: state.step1.maximunRoles,
          confAllGroup: state.step1.confAllGroup,
          onlyOneProject: state.step1.onlyOneProject,
          minimunRoles: state.step1.minimunRoles,
          minimumRole: state.step1.minimumRole,
          bossNeedToBeAssignedToAnotherRoles: state.step1.bossNeedToBeAssignedToAnotherRoles,
          confFormMode: confFormMode(state.step1),
          // Step 3 factors (spread UI state, then override wire-format fields)
          ...s3Rest,
          sWI: toWireSWI(workerIncompatibilities),
          sRI: toWireSRI(roleIncompatibilities),
          balanceHeterogeneousTeamsNacionalityFactorWeight: s3.balanceHeterogeneousTeamsNacionalityFactorWeight,
          maxRoleLoad: s3.maxRoleLoad,
          fixedWorkers: toWireFixedWorkers(state.fixedWorkers),
        },
        projectsIDs: state.step1.selectedProjectIds,
        groupIDs:    state.step1.selectedGroupIds,
      }
    },
  },

  actions: {
    updateStep1(data) {
      Object.assign(this.step1, data)
    },
    updateStep2Factors(data) {
      Object.assign(this.step2Factors, data)
    },
    updateStep3Factors(data) {
      Object.assign(this.step3Factors, data)
    },
    addFixedWorker(fw) {
      const duplicate = this.fixedWorkers.some(
        m => m.personId === fw.personId &&
             m.projectId === fw.projectId &&
             m.roleId === fw.roleId   // null for bosses
      )
      if (!duplicate) this.fixedWorkers.push(fw)
    },
    removeFixedWorker(index) {
      this.fixedWorkers.splice(index, 1)
    },
    addWorkerIncompatibility(item) {
      const dup = this.step3Factors.workerIncompatibilities.some(
        w => (w.personAId === item.personAId && w.personBId === item.personBId) ||
             (w.personAId === item.personBId && w.personBId === item.personAId)
      )
      if (!dup) this.step3Factors.workerIncompatibilities.push(item)
    },
    removeWorkerIncompatibilities(indices) {
      this.step3Factors.workerIncompatibilities =
        this.step3Factors.workerIncompatibilities.filter((_, i) => !indices.includes(i))
    },
    addRoleIncompatibility(item) {
      const dup = this.step3Factors.roleIncompatibilities.some(
        r => (r.roleAId === item.roleAId && r.roleBId === item.roleBId) ||
             (r.roleAId === item.roleBId && r.roleBId === item.roleAId)
      )
      if (!dup) this.step3Factors.roleIncompatibilities.push(item)
    },
    removeRoleIncompatibilities(indices) {
      this.step3Factors.roleIncompatibilities =
        this.step3Factors.roleIncompatibilities.filter((_, i) => !indices.includes(i))
    },
    setRoleIncompatibilities(items) {
      this.step3Factors.roleIncompatibilities = items
    },
    validateProposalWeights() {
      return checkWeights(this.step2Factors, STEP2_WEIGHT_PAIRS)
    },
    validateTeamsWeights() {
      return checkWeights(this.step3Factors, STEP3_WEIGHT_PAIRS)
    },
    reset() {
      this.$reset()
    },
  },
})
