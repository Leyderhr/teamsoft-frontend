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
        endpoint: 'religion',
        title: 'features.nomenclatives.religion.title',
        listTitle: 'features.nomenclatives.religion.listTitle',
        entityName: {
            singular: 'religión',
            plural: 'religiones'
        },
        service: religionService,
        columns: [
            { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
            { field: 'religionName', header: 'common.columns.name', width: '250px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'religionName', label: 'features.nomenclatives.religion.fields.name', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'features.nomenclatives.religion.title', disable: true }],
        showImportButton: false
    },

    race: {
        key: 'race',
        endpoint: 'race',
        title: 'features.nomenclatives.race.title',
        listTitle: 'features.nomenclatives.race.listTitle',
        entityName: {
            singular: 'raza',
            plural: 'razas'
        },
        service: raceService,
        columns: [
            { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
            { field: 'raceName', header: 'common.columns.name', width: '200px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'raceName', label: 'features.nomenclatives.race.fields.name', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'features.nomenclatives.race.title', disable: true }],
        showImportButton: false
    },

    ageGroup: {
        key: 'age-group',
        endpoint: 'ageGroups',
        title: 'features.nomenclatives.ageGroup.title',
        listTitle: 'features.nomenclatives.ageGroup.listTitle',
        entityName: {
            singular: 'grupo de edad',
            plural: 'grupos de edad'
        },
        service: ageGroupService,
        columns: [
            { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
            { field: 'ageGroupName', header: 'common.columns.name', width: '200px', sortable: true, filterable: true },
            { field: 'minAge', header: 'features.nomenclatives.ageGroup.columns.minAge', width: '120px', sortable: true },
            { field: 'maxAge', header: 'features.nomenclatives.ageGroup.columns.maxAge', width: '120px', sortable: true }
        ],
        fields: [
            { name: 'ageGroupName', label: 'features.nomenclatives.ageGroup.fields.name', type: 'text', required: true },
            { name: 'minAge', label: 'features.nomenclatives.ageGroup.fields.minAge', type: 'number', required: true, min: 0 },
            { name: 'maxAge', label: 'features.nomenclatives.ageGroup.fields.maxAge', type: 'number', required: true, min: 0 }
        ],
        breadcrumb: [{ name: 'features.nomenclatives.ageGroup.title', disable: true }],
        showImportButton: false
    },

    nacionality: {
        key: 'nacionality',
        endpoint: 'nacionality',
        title: 'features.nomenclatives.nacionality.title',
        listTitle: 'features.nomenclatives.nacionality.listTitle',
        entityName: {
            singular: 'nacionalidad',
            plural: 'nacionalidades'
        },
        service: nacionalityService,
        columns: [
            { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
            { field: 'paisNac', header: 'features.nomenclatives.nacionality.columns.country', width: '200px', sortable: true, filterable: true },
            { field: 'gentilicioNac', header: 'features.nomenclatives.nacionality.columns.demonym', width: '200px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'paisNac', label: 'features.nomenclatives.nacionality.fields.country', type: 'text', required: true },
            { name: 'gentilicioNac', label: 'features.nomenclatives.nacionality.fields.demonym', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'features.nomenclatives.nacionality.title', disable: true }],
        showImportButton: false
    },

    county: {
        key: 'county',
        endpoint: 'county',
        title: 'features.nomenclatives.county.title',
        listTitle: 'features.nomenclatives.county.listTitle',
        entityName: {
            singular: 'provincia',
            plural: 'provincias'
        },
        service: countyService,
        columns: [
            { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
            { field: 'countyName', header: 'common.columns.name', width: '200px', sortable: true, filterable: true },
            { field: 'code', header: 'common.columns.code', width: '120px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'countyName', label: 'features.nomenclatives.county.fields.name', type: 'text', required: true },
            { name: 'code', label: 'common.fields.code', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'features.nomenclatives.county.title', disable: true }],
        showImportButton: false
    },

    conflictIndex: {
        key: 'conflict-index',
        endpoint: 'conflictIndex',
        title: 'features.nomenclatives.conflictIndex.title',
        listTitle: 'features.nomenclatives.conflictIndex.listTitle',
        entityName: {
            singular: 'índice de conflicto',
            plural: 'índices de conflicto'
        },
        service: conflictIndexService,
        columns: [
            { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
            { field: 'description', header: 'common.columns.description', width: '200px', sortable: true, filterable: true },
            { field: 'weight', header: 'features.nomenclatives.conflictIndex.columns.weight', width: '120px', sortable: true }
        ],
        fields: [
            { name: 'description', label: 'common.fields.description', type: 'text', required: true },
            { name: 'weight', label: 'features.nomenclatives.conflictIndex.fields.weight', type: 'number', required: true, min: 0 }
        ],
        breadcrumb: [{ name: 'features.nomenclatives.conflictIndex.title', disable: true }],
        showImportButton: false
    },

    roleEvaluation: {
        key: 'role-eval',
        endpoint: 'roleEvaluation',
        title: 'features.nomenclatives.roleEvaluation.title',
        listTitle: 'features.nomenclatives.roleEvaluation.listTitle',
        entityName: {
            singular: 'evaluación de rol',
            plural: 'evaluaciones de rol'
        },
        service: roleEvaluationService,
        columns: [
            { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
            { field: 'levels', header: 'common.columns.level', width: '120px', sortable: true },
            { field: 'significance', header: 'common.columns.significance', width: '200px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'levels', label: 'common.fields.level', type: 'number', required: true, min: 0 },
            { name: 'significance', label: 'common.fields.significance', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'features.nomenclatives.roleEvaluation.title', disable: true }],
        showImportButton: false
    },

    personGroup: {
        key: 'person-group',
        endpoint: 'personGroups',
        title: 'features.nomenclatives.personGroup.title',
        listTitle: 'features.nomenclatives.personGroup.listTitle',
        entityName: {
            singular: 'grupo de persona',
            plural: 'grupos de personas'
        },
        service: personGroupService,
        columns: [
            { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
            { field: 'name', header: 'common.columns.name', width: '250px', sortable: true, filterable: true },
            { field: 'father.name', header: 'features.nomenclatives.personGroup.columns.parentGroup', width: '200px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'name', label: 'features.nomenclatives.personGroup.fields.name', type: 'text', required: true },
            { name: 'parentGroupId', label: 'features.nomenclatives.personGroup.fields.parentGroup', type: 'select', required: false, optionsService: personGroupService, optionLabel: 'name', optionValue: 'id', editKey: 'father.id' }
        ],
        breadcrumb: [{ name: 'features.nomenclatives.personGroup.title', disable: true }],
        showImportButton: false
    },

    costDistance: {
        key: 'cost-distance',
        endpoint: 'costDistance',
        title: 'features.nomenclatives.costDistance.title',
        listTitle: 'features.nomenclatives.costDistance.listTitle',
        entityName: {
            singular: 'costo de distancia',
            plural: 'costos de distancia'
        },
        service: costDistanceService,
        columns: [
            { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
            { field: 'countyA.countyName', header: 'features.nomenclatives.costDistance.columns.countyA', width: '180px', sortable: true, filterable: true },
            { field: 'countyB.countyName', header: 'features.nomenclatives.costDistance.columns.countyB', width: '180px', sortable: true, filterable: true },
            { field: 'costDistance', header: 'features.nomenclatives.costDistance.columns.cost', width: '120px', sortable: true }
        ],
        fields: [
            { name: 'costDistance', label: 'features.nomenclatives.costDistance.fields.cost', type: 'number', required: true, min: 0 },
            { name: 'countyAId', label: 'features.nomenclatives.costDistance.fields.countyA', type: 'select', required: true, optionsService: countyService, optionLabel: 'countyName', optionValue: 'id', editKey: 'countyA.id' },
            { name: 'countyBId', label: 'features.nomenclatives.costDistance.fields.countyB', type: 'select', required: true, optionsService: countyService, optionLabel: 'countyName', optionValue: 'id', editKey: 'countyB.id' }
        ],
        breadcrumb: [{ name: 'features.nomenclatives.costDistance.title', disable: true }],
        showImportButton: false
    },

    roleLoad: {
        key: 'role-load',
        endpoint: 'roleLoad',
        title: 'features.nomenclatives.roleLoad.title',
        listTitle: 'features.nomenclatives.roleLoad.listTitle',
        entityName: {
            singular: 'carga de rol',
            plural: 'cargas de rol'
        },
        service: roleLoadService,
        columns: [
            { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
            { field: 'value', header: 'common.columns.value', width: '120px', sortable: true },
            { field: 'significance', header: 'common.columns.significance', width: '200px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'value', label: 'common.fields.value', type: 'number', required: true, min: 0 },
            { name: 'significance', label: 'common.fields.significance', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'features.nomenclatives.roleLoad.title', disable: true }],
        showImportButton: false
    },

    client: {
        key: 'client-entity',
        endpoint: 'clients',
        title: 'features.nomenclatives.client.title',
        listTitle: 'features.nomenclatives.client.listTitle',
        entityName: {
            singular: 'cliente',
            plural: 'clientes'
        },
        service: clientService,
        columns: [
            { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
            { field: 'entityName', header: 'features.nomenclatives.client.columns.entityName', width: '200px', sortable: true, filterable: true },
            { field: 'address', header: 'common.columns.address', width: '200px', sortable: true, filterable: true },
            { field: 'phone', header: 'common.columns.phone', width: '150px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'entityName', label: 'features.nomenclatives.client.fields.entityName', type: 'text', required: true },
            { name: 'address', label: 'common.fields.address', type: 'text', required: true },
            { name: 'phone', label: 'common.fields.phone', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'features.nomenclatives.client.title', disable: true }],
        showImportButton: false
    },

    competenceImportance: {
        key: 'competence-importance',
        endpoint: 'competenceImportance',
        title: 'features.nomenclatives.competenceImportance.title',
        listTitle: 'features.nomenclatives.competenceImportance.listTitle',
        entityName: {
            singular: 'importancia de competencia',
            plural: 'importancias de competencias'
        },
        service: competenceImportanceService,
        columns: [
            { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
            { field: 'levels', header: 'common.columns.level', width: '120px', sortable: true },
            { field: 'significance', header: 'common.columns.significance', width: '200px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'levels', label: 'common.fields.level', type: 'number', required: true, min: 0 },
            { name: 'significance', label: 'common.fields.significance', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'features.nomenclatives.competenceImportance.title', disable: true }],
        showImportButton: false
    },

    levels: {
        key: 'levels',
        endpoint: 'levels',
        title: 'features.nomenclatives.levels.title',
        listTitle: 'features.nomenclatives.levels.listTitle',
        entityName: {
            singular: 'nivel',
            plural: 'niveles'
        },
        service: levelsService,
        columns: [
            { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
            { field: 'levels', header: 'common.columns.level', width: '120px', sortable: true },
            { field: 'significance', header: 'common.columns.significance', width: '200px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'levels', label: 'common.fields.level', type: 'number', required: true, min: 0 },
            { name: 'significance', label: 'common.fields.significance', type: 'text', required: true }
        ],
        breadcrumb: [{ name: 'features.nomenclatives.levels.title', disable: true }],
        showImportButton: false
    },

    projectStructure: {
        key: 'project-structure',
        endpoint: 'project-structure',
        title: 'features.nomenclatives.projectStructure.title',
        listTitle: 'features.nomenclatives.projectStructure.listTitle',
        entityName: {
            singular: 'estructura de proyecto',
            plural: 'estructuras de proyecto'
        },
        service: projectStructureService,
        columns: [
            { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
            { field: 'name', header: 'common.columns.name', width: '250px', sortable: true, filterable: true }
        ],
        fields: [
            { name: 'name', label: 'features.nomenclatives.projectStructure.fields.name', type: 'text', required: true }
        ],
        useCustomDialog: true,
        customDialogComponent: 'ProjectStructureFormDialog',
        breadcrumb: [{ name: 'features.nomenclatives.projectStructure.title', disable: true }],
        showImportButton: false
    }

}
