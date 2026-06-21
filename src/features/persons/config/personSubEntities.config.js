import workerConflictService from '@/features/persons/services/workerConflictService.js'
import competenceValueService from '@/features/persons/services/competenceValueService.js'
import workerTestService from '@/features/persons/services/workerTestService.js'
import personService from '@/features/persons/services/personService.js'
import conflictIndexService from '@/features/nomenclatives/services/conflictIndexService.js'
import competenceService from '@/features/competences/services/competenceService.js'
import levelsService from '@/features/nomenclatives/services/levelsService.js'

export const workerConflictConfig = {
    key: 'worker-conflict',
    routePath: 'person-management/worker-conflict',
    title: 'features.persons.workerConflict.title',
    listTitle: 'features.persons.workerConflict.listTitle',
    entityName: {
        singular: 'conflicto',
        plural: 'conflictos'
    },
    service: workerConflictService,
    columns: [
        { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
        { field: 'indexFk.description', header: 'features.persons.workerConflict.columns.index', width: '200px', sortable: true, filterable: true },
        { field: 'workerFk.personName', header: 'common.columns.worker', width: '160px', sortable: true, filterable: true },
        { field: 'workerConflictFk.personName', header: 'features.persons.workerConflict.columns.workerInConflict', width: '200px', sortable: true, filterable: true }
    ],
    fields: [
        {
            name: 'indexId',
            label: 'features.persons.workerConflict.fields.index',
            type: 'select',
            required: true,
            optionsService: conflictIndexService,
            optionLabel: 'description',
            optionValue: 'id',
            initialValuePath: 'indexFk.id'
        },
        {
            name: 'workerId',
            label: 'common.fields.worker',
            type: 'select',
            required: true,
            optionsService: personService,
            optionLabel: 'personName',
            optionValue: 'id',
            initialValuePath: 'workerFk.id'
        },
        {
            name: 'workerConflictId',
            label: 'features.persons.workerConflict.fields.workerInConflict',
            type: 'select',
            required: true,
            optionsService: personService,
            optionLabel: 'personName',
            optionValue: 'id',
            initialValuePath: 'workerConflictFk.id'
        }
    ],
    breadcrumb: [{ name: 'features.persons.workerConflict.title', disable: true }],
    showImportButton: false
}

export const competenceValueConfig = {
    key: 'competence-value',
    routePath: 'person-management/competence-value',
    title: 'features.persons.competenceValue.title',
    listTitle: 'features.persons.competenceValue.listTitle',
    entityName: {
        singular: 'valor de competencia',
        plural: 'valores de competencia'
    },
    service: competenceValueService,
    columns: [
        { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
        { field: 'workerFk.personName', header: 'common.columns.worker', width: '160px', sortable: true, filterable: true },
        { field: 'competenceFk.competitionName', header: 'common.columns.competence', width: '200px', sortable: true, filterable: true },
        { field: 'levelFk.significance', header: 'common.columns.level', width: '150px', sortable: true, filterable: true }
    ],
    fields: [
        {
            name: 'workerId',
            label: 'common.fields.worker',
            type: 'select',
            required: true,
            optionsService: personService,
            optionLabel: 'personName',
            optionValue: 'id',
            initialValuePath: 'workerFk.id'
        },
        {
            name: 'competenceId',
            label: 'common.fields.competence',
            type: 'select',
            required: true,
            optionsService: competenceService,
            optionLabel: 'competitionName',
            optionValue: 'id',
            initialValuePath: 'competenceFk.id'
        },
        {
            name: 'levelId',
            label: 'common.fields.level',
            type: 'select',
            required: true,
            optionsService: levelsService,
            optionLabel: 'significance',
            optionValue: 'id',
            initialValuePath: 'levelFk.id'
        }
    ],
    breadcrumb: [{ name: 'features.persons.competenceValue.title', disable: true }],
    showImportButton: false
}

export const workerTestConfig = {
    key: 'worker-test',
    routePath: 'person-management/worker-test',
    title: 'features.persons.workerTest.title',
    listTitle: 'features.persons.workerTest.listTitle',
    entityName: {
        singular: 'test psicológico',
        plural: 'tests psicológicos'
    },
    service: workerTestService,
    columns: [
        { field: 'id', header: 'common.columns.id', width: '80px', sortable: true },
        { field: 'workerFk.personName', header: 'common.columns.worker', width: '160px', sortable: true, filterable: true },
        { field: 'tipoMB', header: 'features.persons.workerTest.columns.mbtiType', width: '110px', sortable: true },
        { field: 'ES', header: 'ES', width: '60px', sortable: true },
        { field: 'ID', header: 'ID', width: '60px', sortable: true },
        { field: 'CO', header: 'CO', width: '60px', sortable: true },
        { field: 'IS', header: 'IS', width: '60px', sortable: true },
        { field: 'CE', header: 'CE', width: '60px', sortable: true }
    ],
    fields: [
        {
            name: 'workerId',
            label: 'common.fields.worker',
            type: 'select',
            required: true,
            optionsService: personService,
            optionLabel: 'personName',
            optionValue: 'id',
            initialValuePath: 'workerFk.id'
        },
        { name: 'tipoMB', label: 'features.persons.workerTest.fields.mbtiType', type: 'text', required: false },
        { name: 'ES', label: 'features.persons.workerTest.fields.es', type: 'number', required: false, min: 0 },
        { name: 'ID', label: 'features.persons.workerTest.fields.belbinId', type: 'number', required: false, min: 0 },
        { name: 'CO', label: 'features.persons.workerTest.fields.co', type: 'number', required: false, min: 0 },
        { name: 'IS', label: 'features.persons.workerTest.fields.is', type: 'number', required: false, min: 0 },
        { name: 'CE', label: 'features.persons.workerTest.fields.ce', type: 'number', required: false, min: 0 },
        { name: 'IR', label: 'features.persons.workerTest.fields.ir', type: 'number', required: false, min: 0 },
        { name: 'ME', label: 'features.persons.workerTest.fields.me', type: 'number', required: false, min: 0 },
        { name: 'CH', label: 'features.persons.workerTest.fields.ch', type: 'number', required: false, min: 0 },
        { name: 'IF', label: 'features.persons.workerTest.fields.if', type: 'number', required: false, min: 0 }
    ],
    breadcrumb: [{ name: 'features.persons.workerTest.title', disable: true }],
    showImportButton: false
}
