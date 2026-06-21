import roleService from '@/features/roles/services/roleService.js'

export const roleConfig = {
    key: 'role',
    title: 'features.roles.title',
    listTitle: 'features.roles.listTitle',
    entityName: {
        singular: 'rol',
        plural: 'roles'
    },
    service: roleService,
    columns: [
        { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
        { field: 'roleName', header: 'common.columns.name', width: '200px', sortable: true, filterable: true },
        { field: 'roleDesc', header: 'common.columns.description', width: '250px', sortable: true, filterable: true },
        { field: 'impact', header: 'features.roles.columns.impact', width: '100px', sortable: true },
        {
            field: 'isBoss',
            header: 'features.roles.columns.isBoss',
            width: '120px',
            sortable: true,
            type: 'boolean'
        }
    ],
    // Agregar después de columns:
    fields: [
        { name: 'roleName',  label: 'features.roles.fields.roleName',  type: 'text',    required: true  },
        { name: 'roleDesc',  label: 'common.fields.description',      type: 'text',    required: false },
        { name: 'impact',    label: 'features.roles.fields.impact',           type: 'number',  required: false, min: 0, max: 1 },
        { name: 'isBoss',    label: 'features.roles.fields.isBoss',    type: 'boolean', required: false }
    ],

    breadcrumb: [{ name: 'features.roles.title', disable: true }],
    showImportButton: true
}
