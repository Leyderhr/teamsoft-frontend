/**
 * @typedef {Object} PersonCompetenceValue
 * @property {number} competenceId
 * @property {number} levelId
 */

/**
 * @typedef {Object} PersonalInterest
 * @property {string} interestName
 */

/**
 * @typedef {Object} PersonalProjectInterest
 * @property {number} projectId
 * @property {number} interestLevel
 */

/**
 * @typedef {Object} PersonTest
 * @property {string} mbti
 * @property {string} belbin
 */

/**
 * @typedef {Object} PersonConflict
 * @property {number} conflictPersonId
 * @property {number} conflictIndexId
 */

/**
 * @typedef {Object} CreatePersonPayload
 * @property {string} personName
 * @property {string} card
 * @property {string} surName
 * @property {string} address
 * @property {string} phone
 * @property {string} sex
 * @property {string} email
 * @property {string} inDate
 * @property {number} experience
 * @property {string} birthDate
 * @property {number} county
 * @property {number} race
 * @property {number} group
 * @property {number} nacionality
 * @property {number} religion
 * @property {PersonCompetenceValue[]} competenceValues
 * @property {PersonalInterest[]} personalInterests
 * @property {PersonalProjectInterest[]} personalProjectInterests
 * @property {PersonTest} personTest
 * @property {PersonConflict[]} personConflicts
 */

/**
 * @typedef {Object} Person
 * @property {number} id
 * @property {string} personName
 * @property {string} card
 * @property {string} surName
 * @property {string} address
 * @property {string} phone
 * @property {string} sex
 * @property {string} email
 * @property {string} inDate
 * @property {number} workload
 * @property {number} experience
 * @property {string} status
 * @property {string} birthDate
 * @property {number} age
 * @property {Object} county
 * @property {Object} race
 * @property {Object} group
 * @property {Object} nacionality
 * @property {Object} religion
 * @property {Object} ageGroup
 * @property {Array} competenceValues
 * @property {Array} personalInterests
 * @property {Array} personalProjectInterests
 * @property {Object} personTest
 * @property {Array} personConflicts
 */

export {}
