let https = require('https')

/**
 * @typedef {{state: string, tot_cases: string, tot_death: string}} CovidDataRow
 */


/**
 * @param {Date} date 
 * @returns {Promise<CovidDataRow[]}>}
 */
function getData(date) {
  console.error(`Querying CDC data for: ${date.toLocaleDateString()}`)
  let submissionDate = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`
  let url = `https://data.cdc.gov/resource/9mfq-cb36.json?submission_date=${submissionDate}`

  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('error', reject)
      res.on('end', () => {
        try {
          /** @type {CovidDataRow} */
          let data = JSON.parse(body)
          resolve(data)
        } catch (e) {
          reject(e)
        }
      })
    }).on('error', reject)
  })
}

exports.getDailyData = getData
