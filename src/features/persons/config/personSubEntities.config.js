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
    title: 'Conflictos entre Trabajadores',
    listTitle: 'Lista de Conflictos',
    entityName: {
        singular: 'conflicto',
        plural: 'conflictos'
    },
    service: workerConflictService,
    columns: [
        { field: 'id', header: 'ID', width: '80px', sortable: true },
        { field: 'indexFk.description', header: 'Índice de Conflicto', width: '200px', sortable: true, filterable: true },
        { field: 'workerFk.personName', header: 'Trabajador', width: '160px', sortable: true, filterable: true },
        { field: 'workerConflictFk.personName', header: 'Trabajador en Conflicto', width: '200px', sortable: true, filterable: true }
    ],
    fields: [
        {
            name: 'indexId',
            label: 'Índice de Conflicto',
            type: 'select',
            required: true,
            optionsService: conflictIndexService,
            optionLabel: 'description',
            optionValue: 'id',
            initialValuePath: 'indexFk.id'
        },
        {
            name: 'workerId',
            label: 'Trabajador',
            type: 'select',
            required: true,
            optionsService: personService,
            optionLabel: 'personName',
            optionValue: 'id',
            initialValuePath: 'workerFk.id'
        },
        {
            name: 'workerConflictId',
            label: 'Trabajador en Conflicto',
            type: 'select',
            required: true,
            optionsService: personService,
            optionLabel: 'personName',
            optionValue: 'id',
            initialValuePath: 'workerConflictFk.id'
        }
    ],
    breadcrumb: [{ name: 'Conflictos entre Trabajadores', disable: true }],
    showImportButton: false
}

export const competenceValueConfig = {
    key: 'competence-value',
    routePath: 'person-management/competence-value',
    title: 'Valores de Competencia',
    listTitle: 'Lista de Valores de Competencia',
    entityName: {
        singular: 'valor de competencia',
        plural: 'valores de competencia'
    },
    service: competenceValueService,
    columns: [
        { field: 'id', header: 'ID', width: '80px', sortable: true },
        { field: 'workerFk.personName', header: 'Trabajador', width: '160px', sortable: true, filterable: true },
        { field: 'competenceFk.competitionName', header: 'Competencia', width: '200px', sortable: true, filterable: true },
        { field: 'levelFk.significance', header: 'Nivel', width: '150px', sortable: true, filterable: true }
    ],
    fields: [
        {
            name: 'workerId',
            label: 'Trabajador',
            type: 'select',
            required: true,
            optionsService: personService,
            optionLabel: 'personName',
            optionValue: 'id',
            initialValuePath: 'workerFk.id'
        },
        {
            name: 'competenceId',
            label: 'Competencia',
            type: 'select',
            required: true,
            optionsService: competenceService,
            optionLabel: 'competitionName',
            optionValue: 'id',
            initialValuePath: 'competenceFk.id'
        },
        {
            name: 'levelId',
            label: 'Nivel',
            type: 'select',
            required: true,
            optionsService: levelsService,
            optionLabel: 'significance',
            optionValue: 'id',
            initialValuePath: 'levelFk.id'
        }
    ],
    breadcrumb: [{ name: 'Valores de Competencia', disable: true }],
    showImportButton: false
}

export const workerTestConfig = {
    key: 'worker-test',
    routePath: 'person-management/worker-test',
    title: 'Tests Psicológicos',
    listTitle: 'Lista de Tests Psicológicos',
    entityName: {
        singular: 'test psicológico',
        plural: 'tests psicológicos'
    },
    service: workerTestService,
    columns: [
        { field: 'id', header: 'ID', width: '80px', sortable: true },
        { field: 'workerFk.personName', header: 'Trabajador', width: '160px', sortable: true, filterable: true },
        { field: 'tipoMB', header: 'Tipo MBTI', width: '110px', sortable: true },
        { field: 'ES', header: 'ES', width: '60px', sortable: true },
        { field: 'ID', header: 'ID', width: '60px', sortable: true },
        { field: 'CO', header: 'CO', width: '60px', sortable: true },
        { field: 'IS', header: 'IS', width: '60px', sortable: true },
        { field: 'CE', header: 'CE', width: '60px', sortable: true }
    ],
    fields: [
        {
            name: 'workerId',
            label: 'Trabajador',
            type: 'select',
            required: true,
            optionsService: personService,
            optionLabel: 'personName',
            optionValue: 'id',
            initialValuePath: 'workerFk.id'
        },
        { name: 'tipoMB', label: 'Tipo MBTI', type: 'text', required: false },
        { name: 'ES', label: 'ES (Belbin)', type: 'number', required: false, min: 0 },
        { name: 'ID', label: 'ID (Belbin)', type: 'number', required: false, min: 0 },
        { name: 'CO', label: 'CO (Belbin)', type: 'number', required: false, min: 0 },
        { name: 'IS', label: 'IS (Belbin)', type: 'number', required: false, min: 0 },
        { name: 'CE', label: 'CE (Belbin)', type: 'number', required: false, min: 0 },
        { name: 'IR', label: 'IR (Belbin)', type: 'number', required: false, min: 0 },
        { name: 'ME', label: 'ME (Belbin)', type: 'number', required: false, min: 0 },
        { name: 'CH', label: 'CH (Belbin)', type: 'number', required: false, min: 0 },
        { name: 'IF', label: 'IF (Belbin)', type: 'number', required: false, min: 0 }
    ],
    breadcrumb: [{ name: 'Tests Psicológicos', disable: true }],
    showImportButton: false
}
