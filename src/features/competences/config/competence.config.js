import competenceService from '@/features/competences/services/competenceService.js'

export const competenceConfig = {
    key: 'competence',
    title: 'features.competences.title',
    listTitle: 'features.competences.listTitle',
    entityName: {
        singular: 'competencia',
        plural: 'competencias'
    },
    service: competenceService,
    columns: [
        { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
        { field: 'competitionName', header: 'common.columns.name', width: '250px', sortable: true, filterable: true },
        { field: 'description', header: 'common.columns.description', width: '300px', sortable: true, filterable: true },
        {
            field: 'technical',
            header: 'features.competences.columns.technical',
            width: '100px',
            sortable: true,
            type: 'boolean'
        }
    ],
    // Agregar después de columns:
    fields: [
        { name: 'competitionName', label: 'features.competences.fields.name', type: 'text',    required: true  },
        { name: 'description',     label: 'common.fields.description',               type: 'text',    required: false },
        { name: 'technical',       label: 'features.competences.fields.technical',                   type: 'boolean', required: false }
    ],

    breadcrumb: [{ name: 'features.competences.title', disable: true }],
    showImportButton: true
}
