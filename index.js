let statePopulations = require('./data/state-populations.json')
let regression = require('regression')
let cdc = require('./cdc')


let [dayOffset, statistic = 'deaths'] = process.argv.slice(2)
let daysAgo = dayOffset === undefined
  ? 2 // Newest cdc data
  : parseInt(dayOffset, 10)

if (isNaN(daysAgo)) {
  console.error(`Invalid day offset: ${dayOffset}`)
  process.exit(1)
}

if (['cases', 'deaths'].includes(statistic)) {
  console.error(`Using ${statistic} data`)
} else {
  console.error(`Invalid statistic: ${statistic}`)
  process.exit(1)
}

cdc.getDailyData(new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000)))
  // Limit to states with population data
  .then(stateResults => stateResults.filter(r => !!statePopulations[r.state]))
  // Parse relevent numbers
  .then(stateResults => stateResults.map(r => ({
    state: r.state,
    cases: parseInt(r.tot_cases, 10),
    deaths: parseInt(r.tot_death, 10),
    population: statePopulations[r.state],
  })))
  // Map to regression points
  .then(results => results.map(r => {
    let y
    switch (statistic) {
      case 'cases':
        y = r.cases
        break
      case 'deaths':
        y = r.deaths
        break
    }

    return [r.population, y]
  }))
  // Calculate regression
  .then(pairs => regression.linear(pairs, {precision: 10}))
  .then(result => result.r2)
  .then(console.log)
