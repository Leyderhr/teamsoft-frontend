import competenceService from '@/features/competences/services/competenceService.js'

export const competenceConfig = {
    key: 'competence',
    title: 'Competencias',
    listTitle: 'Lista de Competencias',
    entityName: {
        singular: 'competencia',
        plural: 'competencias'
    },
    service: competenceService,
    columns: [
        { field: 'id', header: 'ID', width: '80px', sortable: true },
        { field: 'competitionName', header: 'Nombre', width: '250px', sortable: true, filterable: true },
        { field: 'description', header: 'Descripción', width: '300px', sortable: true, filterable: true },
        {
            field: 'technical',
            header: 'Técnica',
            width: '100px',
            sortable: true,
            type: 'boolean'
        }
    ],
    // Agregar después de columns:
    fields: [
        { name: 'competitionName', label: 'Nombre de la Competencia', type: 'text',    required: true  },
        { name: 'description',     label: 'Descripción',               type: 'text',    required: false },
        { name: 'technical',       label: 'Técnica',                   type: 'boolean', required: false }
    ],

    breadcrumb: [{ name: 'Competencias', disable: true }],
    showImportButton: true
}
