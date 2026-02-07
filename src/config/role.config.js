import roleService from '@/api/roleService'

export const roleConfig = {
    key: 'role',
    title: 'Roles',
    listTitle: 'Lista de Roles',
    entityName: {
        singular: 'rol',
        plural: 'roles'
    },
    service: roleService,
    columns: [
        { field: 'id', header: 'ID', width: '80px', sortable: true },
        { field: 'roleName', header: 'Nombre', width: '200px', sortable: true, filterable: true },
        { field: 'roleDesc', header: 'Descripción', width: '250px', sortable: true, filterable: true },
        { field: 'impact', header: 'Impacto', width: '100px', sortable: true },
        {
            field: 'isBoss',
            header: 'Jefe de Equipo',
            width: '120px',
            sortable: true,
            type: 'boolean'
        }
    ],
    breadcrumb: [{ name: 'Roles', disable: true }],
    showImportButton: true
}
