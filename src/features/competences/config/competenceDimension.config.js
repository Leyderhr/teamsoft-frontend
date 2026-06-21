import competenceDimensionService from '@/features/competences/services/competenceDimensionService.js'
import levelsService from '@/features/nomenclatives/services/levelsService.js'

export const competenceDimensionConfig = {
    key: 'competence-dimension',
    routePath: 'manage-competences/competence-dimension',
    title: 'features.competenceDimension.title',
    listTitle: 'features.competenceDimension.listTitle',
    entityName: {
        singular: 'dimensión de competencia',
        plural: 'dimensiones de competencia'
    },
    service: competenceDimensionService,
    columns: [
        { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
        { field: 'name', header: 'common.columns.name', width: '250px', sortable: true, filterable: true },
        { field: 'compLevel.levels', header: 'common.columns.level', width: '100px', sortable: true },
        { field: 'compLevel.significance', header: 'features.competenceDimension.columns.levelSignificance', width: '200px', sortable: true, filterable: true }
    ],
    fields: [
        { name: 'name', label: 'features.competenceDimension.fields.name', type: 'text', required: true },
        {
            name: 'compLevelId',
            label: 'features.competenceDimension.fields.compLevel',
            type: 'select',
            required: true,
            optionsService: levelsService,
            optionLabel: 'significance',
            optionValue: 'id',
            initialValuePath: 'compLevel.id'
        }
    ],
    breadcrumb: [{ name: 'features.competenceDimension.title', disable: true }],
    showImportButton: false
}
