import userService from '@/features/users/services/userService.js'

export const userConfig = {
    key: 'user',
    title: 'features.users.title',
    listTitle: 'features.users.listTitle',
    entityName: {
        singular: 'usuario',
        plural: 'usuarios'
    },
    service: userService,
    columns: [
        { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
        { field: 'personName', header: 'common.columns.name', width: '140px', sortable: true, filterable: true },
        { field: 'surname', header: 'common.columns.surname', width: '140px', sortable: true, filterable: true },
        { field: 'idCard', header: 'common.columns.idCard', width: '120px', sortable: true, filterable: true },
        { field: 'mail', header: 'common.columns.email', width: '200px', sortable: true, filterable: true },
        { field: 'username', header: 'common.columns.username', width: '200px', sortable: true, filterable: true },
        { field: 'roles', header: 'common.columns.roles', width: '200px', sortable: false, type: 'badge' },
        { field: 'enabled', header: 'common.columns.enabled', width: '100px', sortable: true, type: 'boolean' }
    ],
    fields: [],
    useCustomDialog: true,
    customDialogComponent: 'UserFormDialog',
    breadcrumb: [{ name: 'features.users.title', disable: true }],
    showImportButton: false
}
