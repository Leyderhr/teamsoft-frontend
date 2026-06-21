import projectService from '@/features/projects/services/projectService.js'

export const projectConfig = {
    key: 'project',
    title: 'features.projects.title',
    listTitle: 'features.projects.listTitle',
    entityName: {
        singular: 'proyecto',
        plural: 'proyectos'
    },
    service: projectService,
    columns: [
        { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
        { field: 'projectName', header: 'common.columns.name', width: '250px', sortable: true, filterable: true },
        { field: 'initialDate', header: 'features.projects.columns.initialDate', width: '150px', sortable: true, type: 'date' },
        { field: 'state', header: 'common.columns.status', width: '100px', sortable: true, type: 'badge' }
    ],
    useCustomDialog: true,
    customDialogComponent: 'ProjectFormDialog',
    breadcrumb: [{ name: 'features.projects.title', disable: true }],
    showImportButton: false
}
