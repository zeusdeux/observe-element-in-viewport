(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.observeElementInViewport = {})));
}(this, (function (exports) { 'use strict';

  var autoCurry = function cu(fn) {

    var args = [].slice.call(arguments);
    var typeOfFn = typeof fn;

    if ('function' !== typeOfFn) throw new Error('auto-curry: Invalid parameter. Expected function, received ' + typeOfFn)
    if (fn.length <= 1) return fn
    if (args.length - 1 >= fn.length) return fn.apply(this, args.slice(1))

    return function() {
      return cu.apply(this, args.concat([].slice.call(arguments)))
    };
  };

  /**
   * Given a set of options, DOM node and in and out of viewport handlers,
   * this function uses an IntersectionObserver to figure out whether
   * the DOM node is in viewport or not and calls the respective handler.
   * It is a curried function and expects the parameters in the not so
   * common order so as to make it easier to observe multiple DOM nodes
   * with the same settings/options and maybe even the same handlers.
   *
   * @param {object} opts - options to configure the viewport
   * and intersection threshold
   * @param {function} inHandler - fn to call when element is in viewport
   * for each given threshhold
   * @param {function} outHandler - fn to call when element leaves viewport
   * @param {Node} el - target element to observe
   *
   * @return {function} unobserve element function
   */
  function _observeElementInViewport(opts, inHandler, outHandler, el) {
      const defaultOptions = {
          // null for window, otherwise give css selector.
          // el to be observed should be a child of element given by this selector
          viewport: null,
          // accepts px and %
          modTop: '0px',
          modRight: '0px',
          modBottom: '0px',
          modLeft: '0px',
          // percentage of el that should intersect with viewport to consinder
          // it "in viewport". 0 means on the 1st pixel intersection or exit,
          // the respective handler will be called
          threshold: [0]
      };
      const { viewport, modTop, modLeft, modBottom, modRight, threshold } = Object.assign({}, defaultOptions, opts);
      // The mod 101 is to prevent threshold from being greater than 1
      const thresholdArray = Array.isArray(threshold)
          ? threshold.map(t => Math.floor(t % 101) / 100)
          : [Math.floor(threshold % 101) / 100];
      const minThreshold = Math.min(...thresholdArray);
      if (!Array.isArray(threshold) && !(typeof threshold === 'number')) {
          throw new Error('threshold should be a number or an array of numbers');
      }
      const intersectionObserverOptions = {
          root: viewport instanceof Node ? viewport : null,
          rootMargin: `${modTop} ${modRight} ${modBottom} ${modLeft}`,
          threshold: thresholdArray
      };
      const isDebugEnabled = localStorage.debug &&
          localStorage.debug.includes('observeElementInViewport');
      if (isDebugEnabled) {
          console.log('IntersectionObserver options', intersectionObserverOptions);
      }
      const cb = (entries, observer) => {
          const entryForEl = entries.filter(entry => entry.target === el)[0];
          const unobserve = () => observer.unobserve(el);
          if (entryForEl) {
              const { isIntersecting, intersectionRatio } = entryForEl;
              entryForEl.isInViewport =
                  isIntersecting && intersectionRatio >= minThreshold;
              if (entryForEl.isInViewport) {
                  inHandler(entryForEl, unobserve, el);
              }
              else {
                  outHandler(entryForEl, unobserve, el);
              }
          }
      };
      const observer = new IntersectionObserver(cb, intersectionObserverOptions);
      observer.observe(el);
      return () => observer.unobserve(el);
  }
  const observeElementInViewport = autoCurry(_observeElementInViewport);
  const isInViewport = autoCurry(async (el, opts) => {
      return new Promise((resolve, reject) => {
          try {
              observeElementInViewport(opts, ((_, unobserve) => {
                  unobserve();
                  resolve(true);
              }), ((_, unobserve) => {
                  unobserve();
                  resolve(false);
              }), el);
          }
          catch (e) {
              reject(e);
          }
      });
  });

  exports.observeElementInViewport = observeElementInViewport;
  exports.isInViewport = isInViewport;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=bundle.js.map
