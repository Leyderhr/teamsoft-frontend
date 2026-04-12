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
    title: 'Ciclos de Proyecto',
    listTitle: 'Lista de Ciclos',
    entityName: {
        singular: 'ciclo',
        plural: 'ciclos'
    },
    service: cycleService,
    columns: [
        { field: 'id', header: 'ID', width: '80px', sortable: true },
        { field: 'beginDate', header: 'Fecha Inicio', width: '140px', sortable: true },
        { field: 'endDate', header: 'Fecha Fin', width: '140px', sortable: true },
        { field: 'projectFk.projectName', header: 'Proyecto', width: '200px', sortable: true, filterable: true }
    ],
    fields: [
        { name: 'beginDate', label: 'Fecha de Inicio', type: 'date', required: true },
        { name: 'endDate', label: 'Fecha de Fin', type: 'date', required: false },
        {
            name: 'projectId',
            label: 'Proyecto',
            type: 'select',
            required: false,
            optionsService: projectService,
            optionLabel: 'projectName',
            optionValue: 'id',
            initialValuePath: 'projectFk.id'
        }
    ],
    breadcrumb: [{ name: 'Ciclos de Proyecto', disable: true }],
    showImportButton: false
}

export const projectRolesConfig = {
    key: 'project-roles',
    routePath: 'manage-projects/project-roles',
    title: 'Roles del Proyecto',
    listTitle: 'Lista de Roles del Proyecto',
    entityName: {
        singular: 'rol del proyecto',
        plural: 'roles del proyecto'
    },
    service: projectRolesService,
    columns: [
        { field: 'id', header: 'ID', width: '80px', sortable: true },
        { field: 'amountWorkersRole', header: 'Cantidad Trabajadores', width: '180px', sortable: true },
        { field: 'projectStructureFk.name', header: 'Estructura', width: '180px', sortable: true, filterable: true },
        { field: 'roleFk.roleName', header: 'Rol', width: '150px', sortable: true, filterable: true },
        { field: 'roleLoadFk.value', header: 'Carga del Rol', width: '130px', sortable: true }
    ],
    fields: [
        { name: 'amountWorkersRole', label: 'Cantidad de Trabajadores', type: 'number', required: true, min: 1 },
        {
            name: 'projectStructureId',
            label: 'Estructura de Proyecto',
            type: 'select',
            required: true,
            optionsService: projectStructureService,
            optionLabel: 'name',
            optionValue: 'id',
            initialValuePath: 'projectStructureFk.id'
        },
        {
            name: 'roleId',
            label: 'Rol',
            type: 'select',
            required: true,
            optionsService: roleService,
            optionLabel: 'roleName',
            optionValue: 'id',
            initialValuePath: 'roleFk.id'
        },
        {
            name: 'roleLoadId',
            label: 'Carga del Rol',
            type: 'select',
            required: true,
            optionsService: roleLoadService,
            optionLabel: 'significance',
            optionValue: 'id',
            initialValuePath: 'roleLoadFk.id'
        }
    ],
    breadcrumb: [{ name: 'Roles del Proyecto', disable: true }],
    showImportButton: false
}

export const projectStructureCycleConfig = {
    key: 'project-structure-cycle',
    routePath: 'manage-projects/project-structure-cycle',
    title: 'Ciclos de Estructura de Proyecto',
    listTitle: 'Lista de Ciclos de Estructura',
    entityName: {
        singular: 'ciclo de estructura',
        plural: 'ciclos de estructura'
    },
    service: projectStructureCycleService,
    columns: [
        { field: 'id', header: 'ID', width: '80px', sortable: true },
        { field: 'cycleFk.beginDate', header: 'Fecha Inicio del Ciclo', width: '180px', sortable: true, filterable: true },
        { field: 'projectStructureFk.name', header: 'Estructura', width: '220px', sortable: true, filterable: true }
    ],
    fields: [
        {
            name: 'cycleId',
            label: 'Ciclo',
            type: 'select',
            required: true,
            optionsService: cycleService,
            optionLabel: 'beginDate',
            optionValue: 'id',
            initialValuePath: 'cycleFk.id'
        },
        {
            name: 'projectStructureId',
            label: 'Estructura de Proyecto',
            type: 'select',
            required: true,
            optionsService: projectStructureService,
            optionLabel: 'name',
            optionValue: 'id',
            initialValuePath: 'projectStructureFk.id'
        }
    ],
    breadcrumb: [{ name: 'Ciclos de Estructura', disable: true }],
    showImportButton: false
}

export const projectTechCompetenceConfig = {
    key: 'project-tech-competence',
    routePath: 'manage-projects/project-tech-competence',
    title: 'Competencias Técnicas del Proyecto',
    listTitle: 'Lista de Competencias Técnicas',
    entityName: {
        singular: 'competencia técnica',
        plural: 'competencias técnicas'
    },
    service: projectTechCompetenceService,
    columns: [
        { field: 'id', header: 'ID', width: '80px', sortable: true },
        { field: 'competenceFk.competitionName', header: 'Competencia', width: '180px', sortable: true, filterable: true },
        { field: 'compImportanceFk.significance', header: 'Importancia', width: '150px', sortable: true },
        { field: 'levelFk.significance', header: 'Nivel', width: '140px', sortable: true },
        { field: 'projectStructureFk.name', header: 'Estructura', width: '160px', sortable: true, filterable: true },
        { field: 'roleFk.roleName', header: 'Rol', width: '130px', sortable: true, filterable: true }
    ],
    fields: [
        {
            name: 'competenceId',
            label: 'Competencia',
            type: 'select',
            required: true,
            optionsService: competenceService,
            optionLabel: 'competitionName',
            optionValue: 'id',
            initialValuePath: 'competenceFk.id'
        },
        {
            name: 'compImportanceId',
            label: 'Importancia',
            type: 'select',
            required: true,
            optionsService: competenceImportanceService,
            optionLabel: 'significance',
            optionValue: 'id',
            initialValuePath: 'compImportanceFk.id'
        },
        {
            name: 'levelId',
            label: 'Nivel',
            type: 'select',
            required: true,
            optionsService: levelsService,
            optionLabel: 'significance',
            optionValue: 'id',
            initialValuePath: 'levelFk.id'
        },
        {
            name: 'projectStructureId',
            label: 'Estructura de Proyecto',
            type: 'select',
            required: true,
            optionsService: projectStructureService,
            optionLabel: 'name',
            optionValue: 'id',
            initialValuePath: 'projectStructureFk.id'
        },
        {
            name: 'roleId',
            label: 'Rol',
            type: 'select',
            required: true,
            optionsService: roleService,
            optionLabel: 'roleName',
            optionValue: 'id',
            initialValuePath: 'roleFk.id'
        }
    ],
    breadcrumb: [{ name: 'Competencias Técnicas del Proyecto', disable: true }],
    showImportButton: false
}

export const assignedRoleConfig = {
    key: 'assigned-role',
    routePath: 'manage-projects/assigned-role',
    title: 'Roles Asignados',
    listTitle: 'Lista de Roles Asignados',
    entityName: {
        singular: 'rol asignado',
        plural: 'roles asignados'
    },
    service: assignedRoleService,
    columns: [
        { field: 'id', header: 'ID', width: '80px', sortable: true },
        { field: 'workersFk.personName', header: 'Trabajador', width: '160px', sortable: true, filterable: true },
        { field: 'rolesFk.roleName', header: 'Rol', width: '140px', sortable: true, filterable: true },
        { field: 'status', header: 'Estado', width: '110px', sortable: true },
        { field: 'beginDate', header: 'Fecha Inicio', width: '130px', sortable: true },
        { field: 'endDate', header: 'Fecha Fin', width: '130px', sortable: true }
    ],
    fields: [
        {
            name: 'workerId',
            label: 'Trabajador',
            type: 'select',
            required: true,
            optionsService: personService,
            optionLabel: 'personName',
            optionValue: 'id',
            initialValuePath: 'workersFk.id'
        },
        {
            name: 'roleId',
            label: 'Rol',
            type: 'select',
            required: true,
            optionsService: roleService,
            optionLabel: 'roleName',
            optionValue: 'id',
            initialValuePath: 'rolesFk.id'
        },
        {
            name: 'cycleId',
            label: 'Ciclo',
            type: 'select',
            required: false,
            optionsService: cycleService,
            optionLabel: 'beginDate',
            optionValue: 'id',
            initialValuePath: 'cyclesFk.id'
        },
        { name: 'status', label: 'Estado', type: 'text', required: false },
        { name: 'observation', label: 'Observación', type: 'textarea', required: false },
        { name: 'beginDate', label: 'Fecha de Inicio', type: 'date', required: false },
        { name: 'endDate', label: 'Fecha de Fin', type: 'date', required: false }
    ],
    breadcrumb: [{ name: 'Roles Asignados', disable: true }],
    showImportButton: false
}
