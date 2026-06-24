import { ref, computed } from 'vue'
import importService from '@/features/import/services/importService.js'

/**
 * Estado y lógica del Asistente de Importación de Personas desde CSV.
 * Separa la orquestación (parse/execute, mapeos, navegación) de la presentación,
 * para que ImportWizard.vue sea solo la superficie de UI.
 */
export function useImportWizard() {
  const totalSteps = 6
  const currentStep = ref(1)

  // Paso 1 — archivo + grupo
  const uploadedFile = ref(null)
  const fileId = ref(null)
  const headers = ref([])
  const preview = ref([])
  const groupName = ref('')
  const uploadingFile = ref(false)

  // Paso 2 — persona (solo nombre + experiencia; el resto se genera en el backend)
  const nombreColumn = ref(null)
  const experienceColumn = ref(null)

  // Paso 3 — competencias: [{ competenceName, attributes: [{ csvColumn, weight, isNumeric, textValues: [{value, weight}] }] }]
  const competenceMappings = ref([])

  // Paso 4 — configuración
  const puntoCorte = ref(0.5)
  const maxExpValue = ref(10)
  const updateIfExist = ref(true)
  const deleteOldValues = ref(false)

  // Paso 5 — roles: [{ roleId, csvColumn }]
  const roleMappings = ref([])

  // Paso 6 — resultado
  const importing = ref(false)
  const importResult = ref(null)

  async function parseFile(file) {
    uploadingFile.value = true
    try {
      const res = await importService.parse(file)
      uploadedFile.value = file
      fileId.value = res.fileId
      headers.value = res.headers || []
      preview.value = res.preview || []
      return res
    } finally {
      uploadingFile.value = false
    }
  }

  /** Valores distintos vistos en el preview para una columna (ayuda a mapear pesos de texto). */
  function distinctValues(column) {
    const set = new Set()
    preview.value.forEach((row) => {
      const v = (row[column] ?? '').trim()
      if (v) set.add(v)
    })
    return [...set]
  }

  // ── mutadores de competencias / atributos / roles ──
  function addCompetence() {
    competenceMappings.value.push({ competenceName: null, attributes: [] })
  }
  function removeCompetence(ci) {
    competenceMappings.value.splice(ci, 1)
  }
  function addAttribute(ci) {
    competenceMappings.value[ci].attributes.push({ csvColumn: null, weight: 1, isNumeric: true, textValues: [] })
  }
  function removeAttribute(ci, ai) {
    competenceMappings.value[ci].attributes.splice(ai, 1)
  }
  /** Al pasar a texto, precarga los valores distintos del preview con peso 0 para que el usuario los pondere. */
  function syncTextValues(attr) {
    if (attr.isNumeric || !attr.csvColumn) return
    if (attr.textValues && attr.textValues.length) return
    attr.textValues = distinctValues(attr.csvColumn).map((value) => ({ value, weight: 0 }))
  }
  function addTextValue(attr) {
    if (!attr.textValues) attr.textValues = []
    attr.textValues.push({ value: '', weight: 0 })
  }
  function removeTextValue(attr, ti) {
    attr.textValues.splice(ti, 1)
  }
  function addRole() {
    roleMappings.value.push({ roleId: null, csvColumn: null })
  }
  function removeRole(i) {
    roleMappings.value.splice(i, 1)
  }

  /** Arma el payload exacto que espera POST /import/execute. */
  function buildPayload() {
    const competenceMapping = competenceMappings.value
      .filter((c) => c.competenceName && c.attributes.length)
      .map((c) => ({
        competenceName: c.competenceName,
        attributes: c.attributes
          .filter((a) => a.csvColumn)
          .map((a) => ({
            csvColumn: a.csvColumn,
            weight: Number(a.weight) || 0,
            isNumeric: a.isNumeric,
            textValueWeights: a.isNumeric
              ? {}
              : Object.fromEntries(
                  (a.textValues || [])
                    .filter((t) => t.value !== '' && t.value != null)
                    .map((t) => [t.value, Number(t.weight) || 0])
                ),
          })),
      }))

    const roleMapping = roleMappings.value
      .filter((r) => r.roleId && r.csvColumn)
      .map((r) => ({ roleId: r.roleId, csvColumn: r.csvColumn }))

    return {
      fileId: fileId.value,
      groupName: groupName.value?.trim(),
      updateIfExist: updateIfExist.value,
      deleteOldValues: deleteOldValues.value,
      puntoCorte: Number(puntoCorte.value),
      maxExpValue: Number(maxExpValue.value),
      personMapping: { nombreColumn: nombreColumn.value, experienceColumn: experienceColumn.value },
      competenceMapping,
      roleMapping,
    }
  }

  async function execute() {
    importing.value = true
    try {
      importResult.value = await importService.execute(buildPayload())
      return importResult.value
    } finally {
      importing.value = false
    }
  }

  function reset() {
    currentStep.value = 1
    uploadedFile.value = null
    fileId.value = null
    headers.value = []
    preview.value = []
    groupName.value = ''
    nombreColumn.value = null
    experienceColumn.value = null
    competenceMappings.value = []
    puntoCorte.value = 0.5
    maxExpValue.value = 10
    updateIfExist.value = true
    deleteOldValues.value = false
    roleMappings.value = []
    importResult.value = null
  }

  const canNext = computed(() => {
    if (currentStep.value === 1) return !!fileId.value && !!groupName.value?.trim()
    if (currentStep.value === 2) return !!nombreColumn.value && !!experienceColumn.value
    return true
  })

  function goNext() {
    if (currentStep.value < totalSteps) currentStep.value++
  }
  function goPrev() {
    if (currentStep.value > 1) currentStep.value--
  }

  return {
    totalSteps, currentStep,
    uploadedFile, fileId, headers, preview, groupName, uploadingFile,
    nombreColumn, experienceColumn,
    competenceMappings,
    puntoCorte, maxExpValue, updateIfExist, deleteOldValues,
    roleMappings,
    importing, importResult,
    parseFile, distinctValues, buildPayload, execute, reset,
    addCompetence, removeCompetence, addAttribute, removeAttribute,
    syncTextValues, addTextValue, removeTextValue,
    addRole, removeRole,
    canNext, goNext, goPrev,
  }
}
