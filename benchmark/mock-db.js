const latency = Number(process.env.DB_LATENCY || 1)

const data = {
  name: 'doggy'
}

exports.find = function (id, callback) {
  setTimeout(() => {
    callback(null, data)
  }, latency)
}
