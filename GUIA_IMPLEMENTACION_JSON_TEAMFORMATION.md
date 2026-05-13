# Guía de Implementación - JSON para Team Formation

## Resumen Ejecutivo

Esta guía documenta cómo construir correctamente los objetos JSON necesarios para los 3 endpoints principales de Team Formation en el backend, recolectando datos progresivamente desde el Paso 1 hasta el Paso 3.

## Endpoints del Backend

### 1. POST `/teamFormation/boss-proposals`
**Propósito**: Generar propuestas de jefes de proyecto

### 2. POST `/teamFormation/member-proposals`  
**Propósito**: Generar propuestas de miembros para roles específicos

### 3. POST `/teamFormation/teams`
**Propósito**: Generar equipos completos (Paso 3)

---

## Estructura de Datos por Endpoint

### 1. Boss Proposals Request

```typescript
interface BossProposalRequest {
  teamFormationParameters: TeamFormationParameters;
  projectIDs: number[];
  groupIDs: number[];
}
```

**Ejemplo JSON**:
```json
{
  "teamFormationParameters": {
    "confRole": true,
    "maximunRoles": 3,
    "onlyOneProject": false,
    "confFormMode": 1,
    "maxCompetences": true,
    "maxCompetencesWeight": 0.4,
    "maxInterests": true,
    "maxInterestsWeight": 0.3,
    "takeWorkLoad": true,
    "workLoadWeight": 0.3,
    "canBeProjectBoss": true,
    "takeCustomPersonWorkLoad": true,
    "preferBelbin": false,
    "preferMyersBrigs": false,
    "bossTeamInterest": true,
    "fixedWorkers": [],
    "searchArea": []
  },
  "projectIDs": [1, 2, 3],
  "groupIDs": [1, 2]
}
```

---

### 2. Member Proposals Request

```typescript
interface MemberProposalRequest {
  teamFormationParameters: TeamFormationParameters;
  projectId: number;
  roleId: number;
  groupIDs: number[];
}
```

**Ejemplo JSON**:
```json
{
  "teamFormationParameters": {
    "confRole": true,
    "maximunRoles": 3,
    "maxCompetences": true,
    "maxCompetencesWeight": 0.4,
    "fixedWorkers": [
      {
        "project": { "id": 1 },
        "role": { "id": 1 },
        "boss": { "id": 10 }
      }
    ]
  },
  "projectId": 1,
  "roleId": 5,
  "groupIDs": [1, 2]
}
```

---

### 3. Team Formation Request (Paso 3)

```typescript
interface TeamFormationRequest {
  teamFormationParameters: TeamFormationParameters;
  projectsIDs: number[];
  groupIDs: number[];
}
```

**Ejemplo JSON**:
```json
{
  "teamFormationParameters": {
    "confRole": true,
    "maximunRoles": 3,
    "onlyOneProject": false,
    "confFormMode": 1,
    "maxCompetences": true,
    "maxCompetencesWeight": 0.3,
    "maxInterests": true,
    "maxInterestsWeight": 0.2,
    "takeWorkLoad": true,
    "workLoadWeight": 0.2,
    "minIncomp": true,
    "minIncompWeight": 0.3,
    "canBeProjectBoss": true,
    "takeCustomPersonWorkLoad": true,
    "preferBelbin": false,
    "solutionMethodOptionTeam": "FactoresPonderados",
    "solutionAlgorithm": 1,
    "anyIncompatibility": false,
    "allBelbinRoles": false,
    "balanceBelbinCategories": false,
    "fixedWorkers": [
      {
        "project": { "id": 1 },
        "role": { "id": 1 },
        "boss": { "id": 10 }
      },
      {
        "project": { "id": 1 },
        "role": { "id": 5 },
        "boss": { "id": 15 }
      }
    ]
  },
  "projectsIDs": [1, 2, 3],
  "groupIDs": [1, 2]
}
```

---

## TeamFormationParameters - Estructura Completa

```typescript
interface TeamFormationParameters {
  // PASO 1: Configuración Inicial
  confRole: boolean;
  maximunRoles: number;
  confAllGroup: boolean;
  onlyOneProject: boolean;
  confFormMode: number;
  isMinimunRoles: boolean;
  minimumRole: number;
  
  // PASO 2: Funciones Objetivo
  maxCompetences: boolean;
  maxCompetencesWeight: number;
  maxCompetencesByProject: boolean;
  maxCompetencesByProjectWeight: number;
  maxInterests: boolean;
  maxInterestsWeight: number;
  maxProjectInterests: boolean;
  maxProjectInterestsWeight: number;
  takeWorkLoad: boolean;
  workLoadWeight: number;
  minCostDistance: boolean;
  minCostDistanceWeight: number;
  minIncomp: boolean;
  minIncompWeight: number;
  maxMbtiTypes: boolean;
  maxMbtiTypesWeight: number;
  maxBelbinRoles: boolean;
  maxBelbinWeight: number;
  
  // PASO 2: Restricciones
  canBeProjectBoss: boolean;
  takeCustomPersonWorkLoad: boolean;
  preferBelbin: boolean;
  preferMyersBrigs: boolean;
  bossTeamInterest: boolean;
  
  // PASO 2: Personas Fijadas
  fixedWorkers: FixedWorker[];
  
  // PASO 3: Configuración de Equipos
  solutionMethodOptionTeam: string;
  solutionAlgorithm: number;
  anyIncompatibility: boolean;
  anySelectedIncompatibility: boolean;
  sWI: SelectedWorkerIncompatibility[];
  sRI: SelectedRoleIncompatibility[];
  allBelbinRoles: boolean;
  demandNBrains: boolean;
  countBrains: number;
  balanceBelbinCategories: boolean;
  allBelbinCategories: boolean;
  actionMentalOper: string;
  mentalSocialOper: string;
  
  // Funciones de balance (Paso 3)
  balanceCompetences: boolean;
  balanceCompetenceWeight: number;
  balanceInterests: boolean;
  balanceInterestWeight: number;
  balancePersonWorkload: boolean;
  balanceWorkLoadWeight: number;
  balanceSynergy: boolean;
  balanceSynergyWeight: number;
  
  // Campos automáticos (backend los llena)
  searchArea: PersonEntity[];
  projects: ProjectRoleCompetenceTemplate[];
  maxLevel: LevelsEntity;
  minLevel: LevelsEntity;
  maxConflictIndex: ConflictIndexEntity;
  maxCostDistance: CostDistanceEntity;
  maxRoleLoad: RoleLoadEntity;
  cantCerebro: number;
}

interface FixedWorker {
  project: { id: number };
  role: { id: number };
  boss: { id: number };
}
```

---

## Flujo de Recolección de Datos

### Paso 1: Configuración Inicial

**Datos a recolectar**:
```javascript
const step1Data = {
  confRole: true,
  maximunRoles: 3,
  onlyOneProject: false,
  confFormMode: 1,
  selectedProjectIds: [1, 2, 3],
  selectedGroupIds: [1, 2]
}
```

---

### Paso 2: Configuración de Optimización + Fijación

**Datos a recolectar**:

#### 2.1 Funciones Objetivo
```javascript
const step2ObjectiveFunctions = {
  maxCompetences: true,
  maxCompetencesWeight: 0.4,
  maxCompetencesByProject: true,
  maxCompetencesByProjectWeight: 1.0,
  takeWorkLoad: true,
  workLoadWeight: 0.3,
  maxInterests: true,
  maxInterestsWeight: 0.3,
  minCostDistance: false,
  minCostDistanceWeight: 0,
  maxProjectInterests: false,
  maxProjectInterestsWeight: 0,
  maxMbtiTypes: false,
  maxMbtiTypesWeight: 0
}
```

#### 2.2 Restricciones
```javascript
const step2Restrictions = {
  canBeProjectBoss: true,
  takeCustomPersonWorkLoad: true,
  preferBelbin: false,
  preferMyersBrigs: false,
  bossTeamInterest: true
}
```

#### 2.3 Personas Fijadas
```javascript
const fixedWorkers = [
  {
    project: { id: 1 },
    role: { id: 1 },
    boss: { id: 10 }
  },
  {
    project: { id: 1 },
    role: { id: 5 },
    boss: { id: 15 }
  }
]
```

---

### Paso 3: Configuración de Formación de Equipos

**Datos adicionales**:
```javascript
const step3Data = {
  solutionMethodOptionTeam: "FactoresPonderados",
  solutionAlgorithm: 1,
  anyIncompatibility: false,
  anySelectedIncompatibility: false,
  sWI: [],
  sRI: [],
  allBelbinRoles: false,
  demandNBrains: false,
  countBrains: 0,
  balanceBelbinCategories: false,
  balanceCompetences: false,
  balanceInterests: false,
  balancePersonWorkload: false,
  balanceSynergy: false
}
```

---

## Implementación en el Frontend

### 1. Store de Pinia (Recomendado)

```javascript
// stores/teamFormation.js
import { defineStore } from 'pinia'

export const useTeamFormationStore = defineStore('teamFormation', {
  state: () => ({
    step1: {
      confRole: false,
      maximunRoles: 0,
      onlyOneProject: false,
      confFormMode: 0,
      selectedProjectIds: [],
      selectedGroupIds: []
    },
    
    step2: {
      maxCompetences: false,
      maxCompetencesWeight: 0,
      maxInterests: false,
      maxInterestsWeight: 0,
      takeWorkLoad: false,
      workLoadWeight: 0,
      minCostDistance: false,
      minCostDistanceWeight: 0,
      maxProjectInterests: false,
      maxProjectInterestsWeight: 0,
      maxMbtiTypes: false,
      maxMbtiTypesWeight: 0,
      canBeProjectBoss: false,
      takeCustomPersonWorkLoad: false,
      preferBelbin: false,
      preferMyersBrigs: false,
      bossTeamInterest: false,
      fixedWorkers: []
    },
    
    step3: {
      solutionMethodOptionTeam: 'FactoresPonderados',
      solutionAlgorithm: 1,
      anyIncompatibility: false,
      allBelbinRoles: false,
      balanceCompetences: false,
      balanceInterests: false
    }
  }),
  
  getters: {
    teamFormationParameters: (state) => ({
      confRole: state.step1.confRole,
      maximunRoles: state.step1.maximunRoles,
      onlyOneProject: state.step1.onlyOneProject,
      confFormMode: state.step1.confFormMode,
      maxCompetences: state.step2.maxCompetences,
      maxCompetencesWeight: state.step2.maxCompetencesWeight,
      maxInterests: state.step2.maxInterests,
      maxInterestsWeight: state.step2.maxInterestsWeight,
      takeWorkLoad: state.step2.takeWorkLoad,
      workLoadWeight: state.step2.workLoadWeight,
      minCostDistance: state.step2.minCostDistance,
      minCostDistanceWeight: state.step2.minCostDistanceWeight,
      maxProjectInterests: state.step2.maxProjectInterests,
      maxProjectInterestsWeight: state.step2.maxProjectInterestsWeight,
      maxMbtiTypes: state.step2.maxMbtiTypes,
      maxMbtiTypesWeight: state.step2.maxMbtiTypesWeight,
      canBeProjectBoss: state.step2.canBeProjectBoss,
      takeCustomPersonWorkLoad: state.step2.takeCustomPersonWorkLoad,
      preferBelbin: state.step2.preferBelbin,
      preferMyersBrigs: state.step2.preferMyersBrigs,
      bossTeamInterest: state.step2.bossTeamInterest,
      fixedWorkers: state.step2.fixedWorkers,
      solutionMethodOptionTeam: state.step3.solutionMethodOptionTeam,
      solutionAlgorithm: state.step3.solutionAlgorithm,
      anyIncompatibility: state.step3.anyIncompatibility,
      allBelbinRoles: state.step3.allBelbinRoles,
      balanceCompetences: state.step3.balanceCompetences,
      balanceInterests: state.step3.balanceInterests,
      confAllGroup: false,
      isMinimunRoles: false,
      minimumRole: 1,
      bossNeedToBeAssignedToAnotherRoles: false,
      maxBelbinRoles: false,
      maxBelbinWeight: 0,
      minIncomp: false,
      minIncompWeight: 0,
      searchArea: [],
      projects: [],
      maxLevel: {},
      minLevel: {},
      maxConflictIndex: {},
      maxCostDistance: {},
      maxRoleLoad: {},
      cantCerebro: 0,
      sWI: [],
      sRI: [],
      demandNBrains: false,
      countBrains: 0,
      balanceBelbinCategories: false,
      allBelbinCategories: false,
      actionMentalOper: "&gt;",
      mentalSocialOper: "&gt;"
    }),
    
    bossProposalsPayload: (state) => ({
      teamFormationParameters: state.teamFormationParameters,
      projectIDs: state.step1.selectedProjectIds,
      groupIDs: state.step1.selectedGroupIds
    }),
    
    memberProposalsPayload: (state) => (projectId, roleId) => ({
      teamFormationParameters: state.teamFormationParameters,
      projectId,
      roleId,
      groupIDs: state.step1.selectedGroupIds
    }),
    
    teamFormationPayload: (state) => ({
      teamFormationParameters: state.teamFormationParameters,
      projectsIDs: state.step1.selectedProjectIds,
      groupIDs: state.step1.selectedGroupIds
    })
  },
  
  actions: {
    updateStep1(data) {
      this.step1 = { ...this.step1, ...data }
    },
    
    updateStep2(data) {
      this.step2 = { ...this.step2, ...data }
    },
    
    addFixedWorker(fixedWorker) {
      this.step2.fixedWorkers.push(fixedWorker)
    },
    
    removeFixedWorker(index) {
      this.step2.fixedWorkers.splice(index, 1)
    },
    
    updateStep3(data) {
      this.step3 = { ...this.step3, ...data }
    },
    
    reset() {
      this.$reset()
    }
  }
})
```

---

### 2. Uso en Componentes

#### Paso 1: Configuración Inicial
```vue
<script setup>
import { useTeamFormationStore } from '@/stores/teamFormation'

const store = useTeamFormationStore()

function handleStep1Submit() {
  store.updateStep1({
    confRole: true,
    maximunRoles: 3,
    onlyOneProject: false,
    confFormMode: 1,
    selectedProjectIds: [1, 2, 3],
    selectedGroupIds: [1, 2]
  })
  
  router.push('/team-formation/step2')
}
</script>
```

#### Paso 2: Generar Propuestas de Jefes
```vue
<script setup>
import { useTeamFormationStore } from '@/stores/teamFormation'
import { useBossProposals } from '@/services/team-formation/mutations'

const store = useTeamFormationStore()
const bossProposalsMutation = useBossProposals()

function updateObjectiveFunctions() {
  store.updateStep2({
    maxCompetences: true,
    maxCompetencesWeight: 0.4,
    maxInterests: true,
    maxInterestsWeight: 0.3,
    takeWorkLoad: true,
    workLoadWeight: 0.3
  })
}

async function generateBossProposals() {
  try {
    const response = await bossProposalsMutation.mutateAsync(
      store.bossProposalsPayload
    )
    console.log('Propuestas de jefes:', response)
  } catch (error) {
    console.error('Error generando propuestas:', error)
  }
}

function fixBoss(projectId, roleId, personId) {
  store.addFixedWorker({
    project: { id: projectId },
    role: { id: roleId },
    boss: { id: personId }
  })
}
</script>
```

#### Paso 2: Generar Propuestas de Miembros
```vue
<script setup>
import { useTeamFormationStore } from '@/stores/teamFormation'
import { useMemberProposals } from '@/services/team-formation/mutations'

const store = useTeamFormationStore()
const memberProposalsMutation = useMemberProposals()

const selectedProjectId = ref(null)
const selectedRoleId = ref(null)

async function generateMemberProposals() {
  if (!selectedProjectId.value || !selectedRoleId.value) {
    alert('Selecciona un proyecto y un rol')
    return
  }
  
  try {
    const payload = store.memberProposalsPayload(
      selectedProjectId.value,
      selectedRoleId.value
    )
    
    const response = await memberProposalsMutation.mutateAsync(payload)
    console.log('Propuestas de miembros:', response)
  } catch (error) {
    console.error('Error generando propuestas:', error)
  }
}

function fixMember(projectId, roleId, personId) {
  store.addFixedWorker({
    project: { id: projectId },
    role: { id: roleId },
    boss: { id: personId }
  })
}
</script>
```

#### Paso 3: Generar Equipos
```vue
<script setup>
import { useTeamFormationStore } from '@/stores/teamFormation'
import { useTeamFormation } from '@/services/team-formation/queries'

const store = useTeamFormationStore()

function updateStep3Config() {
  store.updateStep3({
    solutionMethodOptionTeam: 'FactoresPonderados',
    solutionAlgorithm: 1,
    anyIncompatibility: false,
    allBelbinRoles: false
  })
}

const { data: teams, refetch: generateTeams, isFetching } = useTeamFormation(
  computed(() => store.teamFormationPayload),
  { enabled: false }
)

async function handleGenerateTeams() {
  updateStep3Config()
  await generateTeams()
}
</script>
```

---

## Validaciones Importantes

### 1. Validar Suma de Pesos = 1.0

```javascript
function validateWeights(params) {
  let totalWeight = 0
  
  if (params.maxCompetences) totalWeight += params.maxCompetencesWeight
  if (params.maxInterests) totalWeight += params.maxInterestsWeight
  if (params.takeWorkLoad) totalWeight += params.workLoadWeight
  if (params.minCostDistance) totalWeight += params.minCostDistanceWeight
  if (params.maxProjectInterests) totalWeight += params.maxProjectInterestsWeight
  if (params.maxMbtiTypes) totalWeight += params.maxMbtiTypesWeight
  
  if (Math.abs(totalWeight - 1.0) > 0.001) {
    throw new Error(`La suma de los pesos debe ser 1.0 (actual: ${totalWeight})`)
  }
  
  return true
}
```

### 2. Validar Datos Requeridos

```javascript
function validateBossProposalsPayload(payload) {
  if (!payload.projectIDs || payload.projectIDs.length === 0) {
    throw new Error('Debe seleccionar al menos un proyecto')
  }
  
  if (!payload.groupIDs || payload.groupIDs.length === 0) {
    throw new Error('Debe seleccionar al menos un grupo')
  }
  
  validateWeights(payload.teamFormationParameters)
  
  return true
}

function validateMemberProposalsPayload(payload) {
  if (!payload.projectId) {
    throw new Error('Debe seleccionar un proyecto')
  }
  
  if (!payload.roleId) {
    throw new Error('Debe seleccionar un rol')
  }
  
  if (!payload.groupIDs || payload.groupIDs.length === 0) {
    throw new Error('Debe seleccionar al menos un grupo')
  }
  
  validateWeights(payload.teamFormationParameters)
  
  return true
}
```

---

## Ejemplo Completo de Flujo

```javascript
// 1. Usuario completa Paso 1
store.updateStep1({
  confRole: true,
  maximunRoles: 3,
  onlyOneProject: false,
  confFormMode: 1,
  selectedProjectIds: [1, 2, 3],
  selectedGroupIds: [1, 2]
})

// 2. Usuario configura funciones objetivo en Paso 2
store.updateStep2({
  maxCompetences: true,
  maxCompetencesWeight: 0.4,
  maxInterests: true,
  maxInterestsWeight: 0.3,
  takeWorkLoad: true,
  workLoadWeight: 0.3,
  canBeProjectBoss: true,
  bossTeamInterest: true
})

// 3. Usuario genera propuestas de jefes
const bossResponse = await bossProposalsMutation.mutateAsync(
  store.bossProposalsPayload
)

// 4. Usuario fija jefes
store.addFixedWorker({
  project: { id: 1 },
  role: { id: 1 },
  boss: { id: 10 }
})

// 5. Usuario genera propuestas de miembros
const memberResponse = await memberProposalsMutation.mutateAsync(
  store.memberProposalsPayload(1, 5)
)

// 6. Usuario fija miembros
store.addFixedWorker({
  project: { id: 1 },
  role: { id: 5 },
  boss: { id: 15 }
})

// 7. Usuario configura Paso 3
store.updateStep3({
  solutionMethodOptionTeam: 'FactoresPonderados',
  solutionAlgorithm: 1,
  anyIncompatibility: false
})

// 8. Usuario genera equipos completos
const teams = await generateTeams()
```

---

## Notas Importantes

1. **fixedWorkers se acumula**: Cada vez que fijas un jefe o miembro, se agrega al array
2. **Reutilización de parámetros**: Los parámetros del Paso 2 se reutilizan en el Paso 3
3. **Validación de pesos**: SIEMPRE validar que los pesos sumen 1.0 antes de enviar
4. **searchArea vacío**: El backend llena automáticamente `searchArea` basándose en `groupIDs`
5. **Nombre confuso "boss"**: En `FixedWorker`, el campo `boss` representa cualquier persona
6. **IDs vs Objetos**: El backend espera objetos con `{ id: number }`, no solo el ID

---

## Checklist de Implementación

- [ ] Crear store de Pinia con estructura completa
- [ ] Implementar getters para construir payloads
- [ ] Agregar validación de pesos
- [ ] Implementar funciones para agregar/remover fixedWorkers
- [ ] Conectar componentes del Paso 1 con store
- [ ] Conectar componentes del Paso 2 con store
- [ ] Implementar generación de propuestas de jefes
- [ ] Implementar fijación de jefes
- [ ] Implementar generación de propuestas de miembros
- [ ] Implementar fijación de miembros
- [ ] Conectar componentes del Paso 3 con store
- [ ] Implementar generación de equipos
- [ ] Agregar manejo de errores
- [ ] Agregar feedback visual (loading, success, error)

---

**Fecha**: 2025
**Proyecto**: TeamSoft Frontend
**Autor**: Kiro AI Assistant
