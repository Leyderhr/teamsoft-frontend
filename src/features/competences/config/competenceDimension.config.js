import competenceDimensionService from '@/features/competences/services/competenceDimensionService.js'
import levelsService from '@/features/nomenclatives/services/levelsService.js'

export const competenceDimensionConfig = {
    key: 'competence-dimension',
    routePath: 'manage-competences/competence-dimension',
    title: 'Dimensiones de Competencia',
    listTitle: 'Lista de Dimensiones de Competencia',
    entityName: {
        singular: 'dimensión de competencia',
        plural: 'dimensiones de competencia'
    },
    service: competenceDimensionService,
    columns: [
        { field: 'id', header: 'ID', width: '80px', sortable: true },
        { field: 'name', header: 'Nombre', width: '250px', sortable: true, filterable: true },
        { field: 'compLevel.levels', header: 'Nivel', width: '100px', sortable: true },
        { field: 'compLevel.significance', header: 'Significado del Nivel', width: '200px', sortable: true, filterable: true }
    ],
    fields: [
        { name: 'name', label: 'Nombre de la Dimensión', type: 'text', required: true },
        {
            name: 'compLevelId',
            label: 'Nivel de Competencia',
            type: 'select',
            required: true,
            optionsService: levelsService,
            optionLabel: 'significance',
            optionValue: 'id',
            initialValuePath: 'compLevel.id'
        }
    ],
    breadcrumb: [{ name: 'Dimensiones de Competencia', disable: true }],
    showImportButton: false
}
