import religionService from '@/features/nomenclatives/services/religionService.js'
import raceService from '@/features/nomenclatives/services/raceService.js'
import ageGroupService from '@/features/nomenclatives/services/ageGroupService.js'
import nacionalityService from '@/features/nomenclatives/services/nacionalityService.js'
import countyService from '@/features/nomenclatives/services/countyService.js'
import conflictIndexService from '@/features/nomenclatives/services/conflictIndexService.js'
import roleEvaluationService from '@/features/nomenclatives/services/roleEvaluationService.js'
import personGroupService from '@/features/nomenclatives/services/personGroupService.js'
import costDistanceService from '@/features/nomenclatives/services/costDistanceService.js'
import roleLoadService from '@/features/nomenclatives/services/roleLoadService.js'
import clientService from '@/features/nomenclatives/services/clientService.js'
import competenceImportanceService from '@/features/nomenclatives/services/competenceImportanceService.js'
import levelsService from '@/features/nomenclatives/services/levelsService.js'
import projectStructureService from "@/features/nomenclatives/services/projectStructureService.js";

export const nomenclativeConfigs = {
    religion: {
        key: 'religion',
        title: 'Religiones',
        listTitle: 'Lista de Religiones',
        entityName: {
            singular: 'religión',
            plural: 'religiones'
        },
        service: religionService,
        columns: [
            { field: 'id', header: 'ID', width: '80px', sortable: true },
            { field: 'religionName', header: 'Nombre', width: '250px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'religionName', label: 'Nombre de la Religión', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'Religión', disable: true }],
        showImportButton: false
    },

    race: {
        key: 'race',
        title: 'Razas',
        listTitle: 'Lista de Razas',
        entityName: {
            singular: 'raza',
            plural: 'razas'
        },
        service: raceService,
        columns: [
            { field: 'id', header: 'ID', width: '80px', sortable: true },
            { field: 'raceName', header: 'Nombre', width: '200px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'raceName', label: 'Nombre de la Raza', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'Raza', disable: true }],
        showImportButton: false
    },

    ageGroup: {
        key: 'age-group',
        title: 'Grupos de Edad',
        listTitle: 'Lista de Grupos de Edad',
        entityName: {
            singular: 'grupo de edad',
            plural: 'grupos de edad'
        },
        service: ageGroupService,
        columns: [
            { field: 'id', header: 'ID', width: '80px', sortable: true },
            { field: 'ageGroupName', header: 'Nombre', width: '200px', sortable: true, filterable: true },
            { field: 'minAge', header: 'Edad Mínima', width: '120px', sortable: true },
            { field: 'maxAge', header: 'Edad Máxima', width: '120px', sortable: true }
        ],
        fields: [
            { name: 'ageGroupName', label: 'Nombre del Grupo', type: 'text', required: true },
            { name: 'minAge', label: 'Edad Mínima', type: 'number', required: true, min: 0 },
            { name: 'maxAge', label: 'Edad Máxima', type: 'number', required: true, min: 0 }
        ],
        breadcrumb: [{ name: 'Grupos de Edad', disable: true }],
        showImportButton: false
    },

    nacionality: {
        key: 'nacionality',
        title: 'Nacionalidades',
        listTitle: 'Lista de Nacionalidades',
        entityName: {
            singular: 'nacionalidad',
            plural: 'nacionalidades'
        },
        service: nacionalityService,
        columns: [
            { field: 'id', header: 'ID', width: '80px', sortable: true },
            { field: 'paisNac', header: 'País', width: '200px', sortable: true, filterable: true },
            { field: 'gentilicioNac', header: 'Gentilicio', width: '200px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'paisNac', label: 'País', type: 'text', required: true },
            { name: 'gentilicioNac', label: 'Gentilicio', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'Nacionalidades', disable: true }],
        showImportButton: false
    },

    county: {
        key: 'county',
        title: 'Provincias',
        listTitle: 'Lista de Provincias',
        entityName: {
            singular: 'provincia',
            plural: 'provincias'
        },
        service: countyService,
        columns: [
            { field: 'id', header: 'ID', width: '80px', sortable: true },
            { field: 'countyName', header: 'Nombre', width: '200px', sortable: true, filterable: true },
            { field: 'code', header: 'Código', width: '120px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'countyName', label: 'Nombre de la Provincia', type: 'text', required: true },
            { name: 'code', label: 'Código', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'Provincias', disable: true }],
        showImportButton: false
    },

    conflictIndex: {
        key: 'conflict-index',
        title: 'Índices de Conflicto',
        listTitle: 'Lista de Índices de Conflicto',
        entityName: {
            singular: 'índice de conflicto',
            plural: 'índices de conflicto'
        },
        service: conflictIndexService,
        columns: [
            { field: 'id', header: 'ID', width: '80px', sortable: true },
            { field: 'description', header: 'Descripción', width: '200px', sortable: true, filterable: true },
            { field: 'weight', header: 'Peso', width: '120px', sortable: true }
        ],
        fields: [
            { name: 'description', label: 'Descripción', type: 'text', required: true },
            { name: 'weight', label: 'Peso', type: 'number', required: true, min: 0 }
        ],
        breadcrumb: [{ name: 'Índices de Conflicto', disable: true }],
        showImportButton: false
    },

    roleEvaluation: {
        key: 'role-eval',
        title: 'Evaluación en el Rol',
        listTitle: 'Lista de Evaluaciones de Rol',
        entityName: {
            singular: 'evaluación de rol',
            plural: 'evaluaciones de rol'
        },
        service: roleEvaluationService,
        columns: [
            { field: 'id', header: 'ID', width: '80px', sortable: true },
            { field: 'levels', header: 'Nivel', width: '120px', sortable: true },
            { field: 'significance', header: 'Significado', width: '200px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'levels', label: 'Nivel', type: 'number', required: true, min: 0 },
            { name: 'significance', label: 'Significado', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'Evaluación en el Rol', disable: true }],
        showImportButton: false
    },

    personGroup: {
        key: 'person-group',
        title: 'Grupos de Personas',
        listTitle: 'Lista de Grupos de Personas',
        entityName: {
            singular: 'grupo de persona',
            plural: 'grupos de personas'
        },
        service: personGroupService,
        columns: [
            { field: 'id', header: 'ID', width: '80px', sortable: true },
            { field: 'name', header: 'Nombre', width: '250px', sortable: true, filterable: true },
            { field: 'father.name', header: 'Grupo Padre', width: '200px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'name', label: 'Nombre del Grupo', type: 'text', required: true },
            { name: 'parentGroupId', label: 'Grupo Padre', type: 'select', required: false, optionsService: personGroupService, optionLabel: 'name', optionValue: 'id' }
        ],
        breadcrumb: [{ name: 'Grupos de Personas', disable: true }],
        showImportButton: false
    },

    costDistance: {
        key: 'cost-distance',
        title: 'Costo de Trabajar a Distancia',
        listTitle: 'Lista de Costos de Distancia',
        entityName: {
            singular: 'costo de distancia',
            plural: 'costos de distancia'
        },
        service: costDistanceService,
        columns: [
            { field: 'id', header: 'ID', width: '80px', sortable: true },
            { field: 'countyA.countyName', header: 'Provincia A', width: '180px', sortable: true, filterable: true },
            { field: 'countyB.countyName', header: 'Provincia B', width: '180px', sortable: true, filterable: true },
            { field: 'costDistance', header: 'Costo', width: '120px', sortable: true }
        ],
        fields: [
            { name: 'costDistance', label: 'Costo', type: 'number', required: true, min: 0 },
            { name: 'countyAId', label: 'Provincia A', type: 'select', required: true, optionsService: countyService, optionLabel: 'countyName', optionValue: 'id' },
            { name: 'countyBId', label: 'Provincia B', type: 'select', required: true, optionsService: countyService, optionLabel: 'countyName', optionValue: 'id' }
        ],
        breadcrumb: [{ name: 'Costo de Trabajar a Distancia', disable: true }],
        showImportButton: false
    },

    roleLoad: {
        key: 'role-load',
        title: 'Carga del Rol',
        listTitle: 'Lista de Cargas de Rol',
        entityName: {
            singular: 'carga de rol',
            plural: 'cargas de rol'
        },
        service: roleLoadService,
        columns: [
            { field: 'id', header: 'ID', width: '80px', sortable: true },
            { field: 'value', header: 'Valor', width: '120px', sortable: true },
            { field: 'significance', header: 'Significado', width: '200px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'value', label: 'Valor', type: 'number', required: true, min: 0 },
            { name: 'significance', label: 'Significado', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'Carga del Rol', disable: true }],
        showImportButton: false
    },

    client: {
        key: 'client-entity',
        title: 'Clientes',
        listTitle: 'Lista de Clientes',
        entityName: {
            singular: 'cliente',
            plural: 'clientes'
        },
        service: clientService,
        columns: [
            { field: 'id', header: 'ID', width: '80px', sortable: true },
            { field: 'entityName', header: 'Nombre de la Entidad', width: '200px', sortable: true, filterable: true },
            { field: 'address', header: 'Dirección', width: '200px', sortable: true, filterable: true },
            { field: 'phone', header: 'Teléfono', width: '150px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'entityName', label: 'Nombre de la Entidad', type: 'text', required: true },
            { name: 'address', label: 'Dirección', type: 'text', required: true },
            { name: 'phone', label: 'Teléfono', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'Clientes', disable: true }],
        showImportButton: false
    },

    competenceImportance: {
        key: 'competence-importance',
        title: 'Importancia de Competencias',
        listTitle: 'Lista de Importancias de Competencias',
        entityName: {
            singular: 'importancia de competencia',
            plural: 'importancias de competencias'
        },
        service: competenceImportanceService,
        columns: [
            { field: 'id', header: 'ID', width: '80px', sortable: true },
            { field: 'levels', header: 'Nivel', width: '120px', sortable: true },
            { field: 'significance', header: 'Significado', width: '200px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'levels', label: 'Nivel', type: 'number', required: true, min: 0 },
            { name: 'significance', label: 'Significado', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'Importancia de Competencias', disable: true }],
        showImportButton: false
    },

    levels: {
        key: 'levels',
        title: 'Niveles de Competencias',
        listTitle: 'Lista de Niveles',
        entityName: {
            singular: 'nivel',
            plural: 'niveles'
        },
        service: levelsService,
        columns: [
            { field: 'id', header: 'ID', width: '80px', sortable: true },
            { field: 'levels', header: 'Nivel', width: '120px', sortable: true },
            { field: 'significance', header: 'Significado', width: '200px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'levels', label: 'Nivel', type: 'number', required: true, min: 0 },
            { name: 'significance', label: 'Significado', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'Niveles de Competencias', disable: true }],
        showImportButton: false
    },

    projectStructure: {
        key: 'project-structure',
        title: 'Estructuras de Proyecto',
        listTitle: 'Lista de Estructuras de Proyecto',
        entityName: {
            singular: 'estructura de proyecto',
            plural: 'estructuras de proyecto'
        },
        service: projectStructureService,
        columns: [
            { field: 'id', header: 'ID', width: '80px', sortable: true },
            { field: 'name', header: 'Nombre', width: '250px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'name', label: 'Nombre de la Estructura', type: 'text', required: true }
        ],
        useCustomDialog: true,
        customDialogComponent: 'ProjectStructureFormDialog',
        breadcrumb: [{ name: 'Estructuras de Proyecto', disable: true }],
        showImportButton: false
    }

}
