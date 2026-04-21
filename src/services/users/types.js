/**
 * @typedef {Object} UserRole
 * @property {number} id
 * @property {string} roleName
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} personName
 * @property {string} surname
 * @property {string} idCard
 * @property {string} mail
 * @property {string} username
 * @property {boolean} enabled
 * @property {UserRole[]} roles
 */

/**
 * @typedef {Object} CreateUserPayload
 * @property {string} personName
 * @property {string} surname
 * @property {string} card
 * @property {string} mail
 * @property {boolean} enabled
 * @property {number[]} roleIds
 */

/**
 * @typedef {Object} UpdateUserPayload
 * @property {string} [personName]
 * @property {string} [surname]
 * @property {string} [card]
 * @property {string} [mail]
 * @property {boolean} [enabled]
 * @property {number[]} [roleIds]
 */

export {}
