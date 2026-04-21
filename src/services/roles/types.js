/**
 * @typedef {Object} RoleCompetition
 * @property {number} competenceId
 * @property {number} competenceImportanceId
 * @property {number} levelsId
 */

/**
 * @typedef {Object} CreateRolePayload
 * @property {string} roleName
 * @property {string} roleDesc
 * @property {number} impact
 * @property {boolean} isBoss
 * @property {RoleCompetition[]} roleCompetitions
 * @property {number[]} incompatibleRoleIds
 */

/**
 * @typedef {Object} Role
 * @property {number} id
 * @property {string} roleName
 * @property {string} roleDesc
 * @property {number} impact
 * @property {boolean} isBoss
 * @property {Array} roleCompetitions
 * @property {Array} incompatibleRoles
 */

export {}
