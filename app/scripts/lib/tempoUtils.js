const fetchPeriodDataFromTempo = (tempoUrl) => {
  return makeRequest('GET', tempoUrl)
    .catch(err => {
      return Promise.reject('Failed to fetch previous periods from Tempo')
    });
}

const fetchWorklogDataFromTempo = (tempoUrl, username) => {
  const today = getTodayString()
  return makeRequest('POST', tempoUrl, `{"worker":["${username}"], "from": "${today}", "to": "${today}"}`)
    .catch(err => {
      return Promise.reject('Failed to fetch previous worklogs from Tempo')
    });
}

const fetchWorklogTotalFromTempo = (tempoUrl, username) => {
  return fetchWorklogDataFromTempo(tempoUrl, username)
  .then((worklogs) => {
    return Promise.resolve(sumWorklogs(worklogs))
  })
}

const fetchFutureWorklogDataFromTempo = (tempoUrl, username) => {
  const tomorrow = getTomorrowString()
  const lastDayOfThisPeriod = getLastDayOfPeriodString()
  return makeRequest('POST', tempoUrl, `{"worker":["${username}"], "from": "${tomorrow}", "to": "${lastDayOfThisPeriod}"}`)
    .catch(err => {
      return Promise.reject('Failed to fetch future worklogs from Tempo')
    });
}

const fetchFutureWorklogTotalFromTempo = (tempoUrl, username) => {
  return fetchFutureWorklogDataFromTempo(tempoUrl, username)
  .then((worklogs) => {
    return Promise.resolve(sumWorklogs(worklogs))
  })
}

const sumWorklogs = (worklogs) => {
  const workAccumulator = (accumulator, currentValue) => {
    return accumulator + currentValue.timeSpentSeconds
  }

  return worklogs.reduce(workAccumulator, 0)
}

const getTodayString = () => {
  return formatDateStringForTempo(new Date())
}

const getTomorrowString = () => {
  let tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatDateStringForTempo(tomorrow)
}

const getLastDayOfPeriodString = () => {
  const today = new Date()
  const lastDayOfThisPeriod = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return formatDateStringForTempo(lastDayOfThisPeriod)
}

const formatDateStringForTempo = (dateToFormat) => {
  return dateToFormat.toISOString().substring(0,10)
}

function makeRequest(method, url, body) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest()
    xhr.open(method, url)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        })
      }
    }
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      })
    }
    if (body) {
      xhr.send(body)
    } else {
      xhr.send()
    }
  })
}

module.exports = {
  fetchPeriodDataFromTempo,
  fetchWorklogDataFromTempo,
  fetchWorklogTotalFromTempo,
  fetchFutureWorklogDataFromTempo,
  fetchFutureWorklogTotalFromTempo,
  sumWorklogs,
  //Ones below are only exported for testing 🤮
  getTodayString, 
  getTomorrowString,
  getLastDayOfPeriodString
}