// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const mysql = require('mysql2')
const AWS = require('aws-sdk')
const fs = require('fs')
const path = require('path')
require('dotenv').config();

const DB_CONNECT_RETRY_MAX_ATTEMPTS = Number.parseInt(process.env.DB_CONNECT_RETRY_MAX_ATTEMPTS || '24', 10)
const DB_CONNECT_RETRY_DELAY_MS = Number.parseInt(process.env.DB_CONNECT_RETRY_DELAY_MS || '5000', 10)

// the env AWS_ENDPOINT_URL is automatically injected and available
const endpoint = process.env.AWS_ENDPOINT_URL;
const url = new URL(endpoint);
const hostname = url.hostname;

// configure the secretsmanager to connect to the running LocalStack instance
const secrets = new AWS.SecretsManager({ 
  endpoint: endpoint,
  accessKeyId: 'test',
  secretAccessKey: 'test',
  region: 'us-east-1',
})

exports.handler = async (e) => {
  let connection
  try {
    const { config } = e.params
    connection = await createConnectionWithRetry(config.credsSecretName)

    const sqlScript = fs.readFileSync(path.join(__dirname, 'script.sql')).toString()
    const res = await query(connection, sqlScript)

    return {
      status: 'OK',
      results: res
    }
  } catch (err) {
    return {
      status: 'ERROR',
      err,
      message: err.message
    }
  } finally {
    if (connection) {
      await closeConnection(connection)
    }
  }
}

function query (connection, sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, (error, res) => {
      if (error) return reject(error)

      return resolve(res)
    })
  })
}

async function createConnectionWithRetry (connectionConfig) {
  let lastError
  for (let attempt = 1; attempt <= DB_CONNECT_RETRY_MAX_ATTEMPTS; attempt += 1) {
    const { password, username, dbname, port } = await getSecretValue(connectionConfig)
    const connection = mysql.createConnection({
      host: hostname,
      user: username,
      database: dbname,
      port,
      password,
      multipleStatements: true
    })
    try {
      await connect(connection)
      return connection
    } catch (error) {
      connection.destroy()
      lastError = error
      if (!shouldRetryConnectionError(error) || attempt === DB_CONNECT_RETRY_MAX_ATTEMPTS) {
        break
      }

      const retryInSeconds = DB_CONNECT_RETRY_DELAY_MS / 1000
      console.log(`Database connection attempt ${attempt}/${DB_CONNECT_RETRY_MAX_ATTEMPTS} failed (port=${port}) with '${error.code || error.message}'. Retrying in ${retryInSeconds}s...`)
      await sleep(DB_CONNECT_RETRY_DELAY_MS)
    }
  }

  throw lastError
}

function connect (connection) {
  return new Promise((resolve, reject) => {
    connection.connect((error) => {
      if (error) return reject(error)

      return resolve()
    })
  })
}

function shouldRetryConnectionError (error) {
  return ['ECONNREFUSED', 'ETIMEDOUT', 'EHOSTUNREACH', 'ENOTFOUND', 'PROTOCOL_CONNECTION_LOST'].includes(error?.code)
}

function sleep (delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs))
}

function closeConnection (connection) {
  return new Promise((resolve) => {
    connection.end(() => resolve())
  })
}

function getSecretValue (secretId) {
  return new Promise((resolve, reject) => {
    secrets.getSecretValue({ SecretId: secretId }, (err, data) => {
      if (err) return reject(err)

      return resolve(JSON.parse(data.SecretString))
    })
  })
}
