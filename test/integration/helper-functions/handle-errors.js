'use strict'

function concatChildProps(parent, property) {
  let children = parent.children || []
  let childProps = children.map(c => concatChildProps(c, property))
  return Array.prototype.concat.apply(parent[property] || [], childProps)
}

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
  const allErrors = concatChildProps(info, 'errors')
  const allWarnings = concatChildProps(info, 'warnings')

  if (allErrors.length) {
    console.error(allErrors)
    done(new Error(allErrors[0]))
    return
  }

  if (allWarnings.length) {
    console.warn(allWarnings)
    // Don't fail the test suite because of warnings, at least until we can get a consistent lack of warnings from other packages
    // (at time of writing, webpack-chunk-hash still emits warnings in webpack 4)
    return
  }
}
