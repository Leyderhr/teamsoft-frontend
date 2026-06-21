import roleCompetitionService from '@/features/roles/services/roleCompetitionService.js'
import competenceService from '@/features/competences/services/competenceService.js'
import competenceImportanceService from '@/features/nomenclatives/services/competenceImportanceService.js'
import levelsService from '@/features/nomenclatives/services/levelsService.js'
import roleService from '@/features/roles/services/roleService.js'

export const roleCompetitionConfig = {
    key: 'role-competition',
    routePath: 'manage-roles/role-competition',
    title: 'features.roles.roleCompetition.title',
    listTitle: 'features.roles.roleCompetition.listTitle',
    entityName: {
        singular: 'competencia del rol',
        plural: 'competencias del rol'
    },
    service: roleCompetitionService,
    columns: [
        { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
        { field: 'competenceFk.competitionName', header: 'common.columns.competence', width: '200px', sortable: true, filterable: true },
        { field: 'compImportanceFk.significance', header: 'common.columns.importance', width: '160px', sortable: true, filterable: true },
        { field: 'levelsFk.significance', header: 'common.columns.level', width: '150px', sortable: true, filterable: true },
        { field: 'rolesFk.roleName', header: 'common.columns.role', width: '150px', sortable: true, filterable: true }
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
            name: 'levelsId',
            label: 'common.fields.level',
            type: 'select',
            required: true,
            optionsService: levelsService,
            optionLabel: 'significance',
            optionValue: 'id',
            initialValuePath: 'levelsFk.id'
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
        }
    ],
    breadcrumb: [{ name: 'features.roles.roleCompetition.title', disable: true }],
    showImportButton: false
}
