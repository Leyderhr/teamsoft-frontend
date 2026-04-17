/**
 * @typedef {Object} CreateProjectPayload
 * @property {string} projectName
 * @property {string} initialDate
 * @property {number} client
 * @property {number} province
 * @property {number} projectStructure
 */

/**
 * @typedef {Object} Project
 * @property {number} id
 * @property {string} projectName
 * @property {string} initialDate
 * @property {string|null} endDate
 * @property {boolean} close
 * @property {boolean} finalize
 * @property {Object} client
 * @property {Object} county
 * @property {Object} projectStructure
 */

/**
 * @typedef {Object} SimpleProject
 * @property {number} id
 * @property {string} projectName
 * @property {string} initialDate
 * @property {boolean} close
 */

export {}
