import roleCompetitionService from '@/features/roles/services/roleCompetitionService.js'
import competenceService from '@/features/competences/services/competenceService.js'
import competenceImportanceService from '@/features/nomenclatives/services/competenceImportanceService.js'
import levelsService from '@/features/nomenclatives/services/levelsService.js'
import roleService from '@/features/roles/services/roleService.js'

export const roleCompetitionConfig = {
    key: 'role-competition',
    routePath: 'manage-roles/role-competition',
    title: 'Competencias del Rol',
    listTitle: 'Lista de Competencias del Rol',
    entityName: {
        singular: 'competencia del rol',
        plural: 'competencias del rol'
    },
    service: roleCompetitionService,
    columns: [
        { field: 'id', header: 'ID', width: '80px', sortable: true },
        { field: 'competenceFk.competitionName', header: 'Competencia', width: '200px', sortable: true, filterable: true },
        { field: 'compImportanceFk.significance', header: 'Importancia', width: '160px', sortable: true, filterable: true },
        { field: 'levelsFk.significance', header: 'Nivel', width: '150px', sortable: true, filterable: true },
        { field: 'rolesFk.roleName', header: 'Rol', width: '150px', sortable: true, filterable: true }
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
            name: 'levelsId',
            label: 'Nivel',
            type: 'select',
            required: true,
            optionsService: levelsService,
            optionLabel: 'significance',
            optionValue: 'id',
            initialValuePath: 'levelsFk.id'
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
        }
    ],
    breadcrumb: [{ name: 'Competencias del Rol', disable: true }],
    showImportButton: false
}
