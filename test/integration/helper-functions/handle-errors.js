'use strict'

module.exports = function handleErrors(err, stats, done) {
  if (err) {
    console.error(err.stack || err)
    if (err.details) {
      console.error(err.details)
    }
    done(err)
    return
  }

  const info = stats.toJson()

  if (stats.hasErrors()) {
    console.error(info.errors)
    done(info.errors)
  }

  if (stats.hasWarnings()) {
    console.warn(info.warnings)
    done(info.warnings)
  }
}
