import roleService from '@/features/roles/services/roleService.js'

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
    // Agregar después de columns:
    fields: [
        { name: 'roleName',  label: 'Nombre del Rol',  type: 'text',    required: true  },
        { name: 'roleDesc',  label: 'Descripción',      type: 'text',    required: false },
        { name: 'impact',    label: 'Impacto',           type: 'number',  required: false, min: 0, max: 1 },
        { name: 'isBoss',    label: 'Jefe de Equipo',    type: 'boolean', required: false }
    ],

    breadcrumb: [{ name: 'Roles', disable: true }],
    showImportButton: true
}
