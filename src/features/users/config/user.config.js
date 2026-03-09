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
        { field: 'username', header: 'Usuario', width: '180px', sortable: true, filterable: true },
        { field: 'person.personName', header: 'Nombre', width: '160px', sortable: true, filterable: true },
        { field: 'person.surName', header: 'Apellidos', width: '160px', sortable: true, filterable: true },
        { field: 'person.email', header: 'Correo', width: '200px', sortable: true, filterable: true },
        { field: 'role', header: 'Rol', width: '180px', sortable: true, filterable: true }
    ],
    fields: [],
    useCustomDialog: true,
    customDialogComponent: 'UserFormDialog',
    breadcrumb: [{ name: 'Usuarios', disable: true }],
    showImportButton: false
}
