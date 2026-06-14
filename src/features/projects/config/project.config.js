import projectService from '@/features/projects/services/projectService.js'

export const projectConfig = {
    key: 'project',
    title: 'Proyectos',
    listTitle: 'Lista de Proyectos',
    entityName: {
        singular: 'proyecto',
        plural: 'proyectos'
    },
    service: projectService,
    columns: [
        { field: 'id', header: 'ID', width: '80px', sortable: true },
        { field: 'projectName', header: 'Nombre', width: '250px', sortable: true, filterable: true },
        { field: 'initialDate', header: 'Fecha Inicial', width: '150px', sortable: true, type: 'date' },
        { field: 'state', header: 'Estado', width: '100px', sortable: true, type: 'badge' }
    ],
    useCustomDialog: true,
    customDialogComponent: 'ProjectFormDialog',
    breadcrumb: [{ name: 'Proyectos', disable: true }],
    showImportButton: false
}
