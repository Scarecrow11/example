// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: __dirname + '/../.env' })
require('ts-node/register')

module.exports = require('../config/knexConfig').config
