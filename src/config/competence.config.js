import competenceService from '@/api/competenceService'

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
    breadcrumb: [{ name: 'Competencias', disable: true }],
    showImportButton: true,
    onImport: () => {
        console.log('Importar competencias')
        // TODO: Implementar lógica de importación
    }
}
