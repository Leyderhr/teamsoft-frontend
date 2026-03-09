import GenericNomenclative from '@/features/nomenclatives/views/GenericNomenclative.vue'
import { competenceDimensionConfig } from '@/features/competences/config/competenceDimension.config.js'
import { roleCompetitionConfig } from '@/features/roles/config/roleCompetition.config.js'
import {
    cycleConfig,
    projectRolesConfig,
    projectStructureCycleConfig,
    projectTechCompetenceConfig,
    assignedRoleConfig
} from '@/features/projects/config/projectSubEntities.config.js'
import {
    workerConflictConfig,
    competenceValueConfig,
    workerTestConfig
} from '@/features/persons/config/personSubEntities.config.js'

const subEntityConfigs = [
    competenceDimensionConfig,
    roleCompetitionConfig,
    cycleConfig,
    projectRolesConfig,
    projectStructureCycleConfig,
    projectTechCompetenceConfig,
    assignedRoleConfig,
    workerConflictConfig,
    competenceValueConfig,
    workerTestConfig
]

export default subEntityConfigs.map(config => ({
    path: config.routePath,
    name: config.key
        .split('-')
        .map((word, i) => i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word.charAt(0).toUpperCase() + word.slice(1))
        .join(''),
    component: GenericNomenclative,
    props: { config },
    meta: {
        requiresAuth: true,
        breadcrumb: config.breadcrumb
    }
}))
