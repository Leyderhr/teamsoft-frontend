import cycleService from '@/features/projects/services/cycleService.js'
import projectRolesService from '@/features/projects/services/projectRolesService.js'
import projectStructureCycleService from '@/features/projects/services/projectStructureCycleService.js'
import projectTechCompetenceService from '@/features/projects/services/projectTechCompetenceService.js'
import assignedRoleService from '@/features/projects/services/assignedRoleService.js'
import projectService from '@/features/projects/services/projectService.js'
import projectStructureService from '@/features/nomenclatives/services/projectStructureService.js'
import roleService from '@/features/roles/services/roleService.js'
import roleLoadService from '@/features/nomenclatives/services/roleLoadService.js'
import competenceService from '@/features/competences/services/competenceService.js'
import competenceImportanceService from '@/features/nomenclatives/services/competenceImportanceService.js'
import levelsService from '@/features/nomenclatives/services/levelsService.js'
import personService from '@/features/persons/services/personService.js'

export const cycleConfig = {
    key: 'cycle',
    routePath: 'manage-projects/cycle',
    title: 'features.projects.cycle.title',
    listTitle: 'features.projects.cycle.listTitle',
    entityName: {
        singular: 'ciclo',
        plural: 'ciclos'
    },
    service: cycleService,
    columns: [
        { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
        { field: 'beginDate', header: 'common.columns.startDate', width: '140px', sortable: true },
        { field: 'endDate', header: 'common.columns.endDate', width: '140px', sortable: true },
        { field: 'projectFk.projectName', header: 'common.columns.project', width: '200px', sortable: true, filterable: true }
    ],
    fields: [
        { name: 'beginDate', label: 'common.fields.startDate', type: 'date', required: true },
        { name: 'endDate', label: 'common.fields.endDate', type: 'date', required: false },
        {
            name: 'projectId',
            label: 'common.fields.project',
            type: 'select',
            required: false,
            optionsService: projectService,
            optionLabel: 'projectName',
            optionValue: 'id',
            initialValuePath: 'projectFk.id'
        }
    ],
    breadcrumb: [{ name: 'features.projects.cycle.title', disable: true }],
    showImportButton: false
}

export const projectRolesConfig = {
    key: 'project-roles',
    routePath: 'manage-projects/project-roles',
    title: 'features.projects.projectRoles.title',
    listTitle: 'features.projects.projectRoles.listTitle',
    entityName: {
        singular: 'rol del proyecto',
        plural: 'roles del proyecto'
    },
    service: projectRolesService,
    columns: [
        { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
        { field: 'amountWorkersRole', header: 'features.projects.projectRoles.columns.workerCount', width: '180px', sortable: true },
        { field: 'projectStructureFk.name', header: 'common.columns.structure', width: '180px', sortable: true, filterable: true },
        { field: 'roleFk.roleName', header: 'common.columns.role', width: '150px', sortable: true, filterable: true },
        { field: 'roleLoadFk.value', header: 'common.columns.roleLoad', width: '130px', sortable: true }
    ],
    fields: [
        { name: 'amountWorkersRole', label: 'features.projects.projectRoles.fields.workerCount', type: 'number', required: true, min: 1 },
        {
            name: 'projectStructureId',
            label: 'common.fields.projectStructure',
            type: 'select',
            required: true,
            optionsService: projectStructureService,
            optionLabel: 'name',
            optionValue: 'id',
            initialValuePath: 'projectStructureFk.id'
        },
        {
            name: 'roleId',
            label: 'common.fields.role',
            type: 'select',
            required: true,
            optionsService: roleService,
            optionLabel: 'roleName',
            optionValue: 'id',
            initialValuePath: 'roleFk.id'
        },
        {
            name: 'roleLoadId',
            label: 'common.fields.roleLoad',
            type: 'select',
            required: true,
            optionsService: roleLoadService,
            optionLabel: 'significance',
            optionValue: 'id',
            initialValuePath: 'roleLoadFk.id'
        }
    ],
    breadcrumb: [{ name: 'features.projects.projectRoles.title', disable: true }],
    showImportButton: false
}

export const projectStructureCycleConfig = {
    key: 'project-structure-cycle',
    routePath: 'manage-projects/project-structure-cycle',
    title: 'features.projects.projectStructureCycle.title',
    listTitle: 'features.projects.projectStructureCycle.listTitle',
    entityName: {
        singular: 'ciclo de estructura',
        plural: 'ciclos de estructura'
    },
    service: projectStructureCycleService,
    columns: [
        { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
        { field: 'cycleFk.beginDate', header: 'features.projects.projectStructureCycle.columns.cycleStartDate', width: '180px', sortable: true, filterable: true },
        { field: 'projectStructureFk.name', header: 'common.columns.structure', width: '220px', sortable: true, filterable: true }
    ],
    fields: [
        {
            name: 'cycleId',
            label: 'common.fields.cycle',
            type: 'select',
            required: true,
            optionsService: cycleService,
            optionLabel: 'beginDate',
            optionValue: 'id',
            initialValuePath: 'cycleFk.id'
        },
        {
            name: 'projectStructureId',
            label: 'common.fields.projectStructure',
            type: 'select',
            required: true,
            optionsService: projectStructureService,
            optionLabel: 'name',
            optionValue: 'id',
            initialValuePath: 'projectStructureFk.id'
        }
    ],
    breadcrumb: [{ name: 'features.projects.projectStructureCycle.breadcrumb', disable: true }],
    showImportButton: false
}

export const projectTechCompetenceConfig = {
    key: 'project-tech-competence',
    routePath: 'manage-projects/project-tech-competence',
    title: 'features.projects.projectTechCompetence.title',
    listTitle: 'features.projects.projectTechCompetence.listTitle',
    entityName: {
        singular: 'competencia técnica',
        plural: 'competencias técnicas'
    },
    service: projectTechCompetenceService,
    columns: [
        { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
        { field: 'competenceFk.competitionName', header: 'common.columns.competence', width: '180px', sortable: true, filterable: true },
        { field: 'compImportanceFk.significance', header: 'common.columns.importance', width: '150px', sortable: true },
        { field: 'levelFk.significance', header: 'common.columns.level', width: '140px', sortable: true },
        { field: 'projectStructureFk.name', header: 'common.columns.structure', width: '160px', sortable: true, filterable: true },
        { field: 'roleFk.roleName', header: 'common.columns.role', width: '130px', sortable: true, filterable: true }
    ],
    fields: [
        {
            name: 'competenceId',
            label: 'common.fields.competence',
            type: 'select',
            required: true,
            optionsService: competenceService,
            optionLabel: 'competitionName',
            optionValue: 'id',
            initialValuePath: 'competenceFk.id'
        },
        {
            name: 'compImportanceId',
            label: 'common.fields.importance',
            type: 'select',
            required: true,
            optionsService: competenceImportanceService,
            optionLabel: 'significance',
            optionValue: 'id',
            initialValuePath: 'compImportanceFk.id'
        },
        {
            name: 'levelId',
            label: 'common.fields.level',
            type: 'select',
            required: true,
            optionsService: levelsService,
            optionLabel: 'significance',
            optionValue: 'id',
            initialValuePath: 'levelFk.id'
        },
        {
            name: 'projectStructureId',
            label: 'common.fields.projectStructure',
            type: 'select',
            required: true,
            optionsService: projectStructureService,
            optionLabel: 'name',
            optionValue: 'id',
            initialValuePath: 'projectStructureFk.id'
        },
        {
            name: 'roleId',
            label: 'common.fields.role',
            type: 'select',
            required: true,
            optionsService: roleService,
            optionLabel: 'roleName',
            optionValue: 'id',
            initialValuePath: 'roleFk.id'
        }
    ],
    breadcrumb: [{ name: 'features.projects.projectTechCompetence.title', disable: true }],
    showImportButton: false
}

export const assignedRoleConfig = {
    key: 'assigned-role',
    routePath: 'manage-projects/assigned-role',
    title: 'features.projects.assignedRole.title',
    listTitle: 'features.projects.assignedRole.listTitle',
    entityName: {
        singular: 'rol asignado',
        plural: 'roles asignados'
    },
    service: assignedRoleService,
    columns: [
        { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
        { field: 'workersFk.personName', header: 'common.columns.worker', width: '160px', sortable: true, filterable: true },
        { field: 'rolesFk.roleName', header: 'common.columns.role', width: '140px', sortable: true, filterable: true },
        { field: 'status', header: 'common.columns.status', width: '110px', sortable: true },
        { field: 'beginDate', header: 'common.columns.startDate', width: '130px', sortable: true },
        { field: 'endDate', header: 'common.columns.endDate', width: '130px', sortable: true }
    ],
    fields: [
        {
            name: 'workerId',
            label: 'common.fields.worker',
            type: 'select',
            required: true,
            optionsService: personService,
            optionLabel: 'personName',
            optionValue: 'id',
            initialValuePath: 'workersFk.id'
        },
        {
            name: 'roleId',
            label: 'common.fields.role',
            type: 'select',
            required: true,
            optionsService: roleService,
            optionLabel: 'roleName',
            optionValue: 'id',
            initialValuePath: 'rolesFk.id'
        },
        {
            name: 'cycleId',
            label: 'common.fields.cycle',
            type: 'select',
            required: false,
            optionsService: cycleService,
            optionLabel: 'beginDate',
            optionValue: 'id',
            initialValuePath: 'cyclesFk.id'
        },
        { name: 'status', label: 'common.fields.status', type: 'text', required: false },
        { name: 'observation', label: 'common.fields.observation', type: 'textarea', required: false },
        { name: 'beginDate', label: 'common.fields.startDate', type: 'date', required: false },
        { name: 'endDate', label: 'common.fields.endDate', type: 'date', required: false }
    ],
    breadcrumb: [{ name: 'features.projects.assignedRole.title', disable: true }],
    showImportButton: false
}
