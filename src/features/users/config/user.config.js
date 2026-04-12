import userService from '@/features/users/services/userService.js'

export const userConfig = {
    key: 'user',
    title: 'Usuarios',
    listTitle: 'Lista de Usuarios',
    entityName: {
        singular: 'usuario',
        plural: 'usuarios'
    },
    service: userService,
    columns: [
        { field: 'id', header: 'ID', width: '80px', sortable: true },
        { field: 'personName', header: 'Nombre', width: '140px', sortable: true, filterable: true },
        { field: 'surname', header: 'Apellido', width: '140px', sortable: true, filterable: true },
        { field: 'idCard', header: 'Cédula', width: '120px', sortable: true, filterable: true },
        { field: 'mail', header: 'Correo', width: '200px', sortable: true, filterable: true },
        { field: 'username', header: 'Usuario', width: '200px', sortable: true, filterable: true },
        { field: 'roles', header: 'Roles', width: '200px', sortable: false, type: 'roles' },
        { field: 'enabled', header: 'Habilitado', width: '100px', sortable: true, type: 'boolean' }
    ],
    fields: [],
    useCustomDialog: true,
    customDialogComponent: 'UserFormDialog',
    breadcrumb: [{ name: 'Usuarios', disable: true }],
    showImportButton: false
}
