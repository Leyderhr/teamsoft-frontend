/**
 * @typedef {Object} CompetenceDimension
 * @property {string} dimensionName
 */

/**
 * @typedef {Object} CreateCompetencePayload
 * @property {string} competitionName
 * @property {string} description
 * @property {boolean} technical
 * @property {CompetenceDimension[]} dimensionList
 */

/**
 * @typedef {Object} Competence
 * @property {number} id
 * @property {string} competitionName
 * @property {string} description
 * @property {boolean} technical
 * @property {Array} dimensionList
 */

export {}
