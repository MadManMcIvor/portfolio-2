/*
 * Light / dark / system, persisted, with no flash of the wrong theme.
 *
 * Load this in <head> WITHOUT defer, so the theme is applied before first
 * paint. Deferring it means a visible flash on every page load.
 *
 *   <script src="theme-toggle.js"></script>
 *
 * Then wire any control to window.setTheme('light' | 'dark' | 'system').
 */
;(function () {
  var KEY = 'theme'

  // Light is the default, not the OS preference. The light look is the point,
  // and auto-dark means most visitors never see it. Change to 'system' if you
  // disagree — it's a genuine preference, not a rule.
  var DEFAULT = 'light'

  function apply(choice) {
    document.documentElement.setAttribute('data-theme', choice)
  }

  function stored() {
    try {
      var v = localStorage.getItem(KEY)
      return v === 'light' || v === 'dark' || v === 'system' ? v : null
    } catch (e) {
      return null // private mode, storage disabled
    }
  }

  apply(stored() || DEFAULT)

  window.setTheme = function (choice) {
    apply(choice)
    try {
      localStorage.setItem(KEY, choice)
    } catch (e) {
      // Failing to remember the choice is survivable; throwing isn't.
    }
    document.dispatchEvent(new CustomEvent('themechange', { detail: choice }))
  }

  window.getTheme = function () {
    return document.documentElement.getAttribute('data-theme') || DEFAULT
  }

  /** What's actually on screen, once 'system' is resolved. */
  window.resolvedTheme = function () {
    var c = window.getTheme()
    if (c !== 'system') return c
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
})()
