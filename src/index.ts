interface Options {
  viewport: null | HTMLElement
  modTop: string
  modRight: string
  modBottom: string
  modLeft: string
  threshold: number[]
}

interface CustomEntry extends IntersectionObserverEntry {
  isInViewport?: boolean
}

type UnobserveFn = () => void

type Handler = (entry: CustomEntry, unobserveFn: UnobserveFn, el: HTMLElement) => any

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
export function observeElementInViewport(
  el: HTMLElement,
  inHandler: Handler,
  outHandler: Handler,
  opts: Partial<Options>
): UnobserveFn {
  if (!el) {
    throw new Error('Target element to observe should be a valid DOM Node')
  }

  const defaultOptions: Options = {
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
  }

  const { viewport, modTop, modLeft, modBottom, modRight, threshold }: Options = Object.assign(
    {},
    defaultOptions,
    opts
  )

  // The mod 101 is to prevent threshold from being greater than 1
  const thresholdArray: number[] = Array.isArray(threshold)
    ? threshold.map(t => Math.floor(t % 101) / 100)
    : [Math.floor(threshold ? threshold % 101 : 0) / 100]

  const minThreshold: number = Math.min(...thresholdArray)

  if (!Array.isArray(threshold) && !(typeof threshold === 'number')) {
    throw new Error('threshold should be a number or an array of numbers')
  }

  const intersectionObserverOptions: IntersectionObserverInit = {
    root: viewport instanceof Node ? viewport : null,
    rootMargin: `${modTop} ${modRight} ${modBottom} ${modLeft}`,
    threshold: thresholdArray
  }

  const isDebugEnabled: boolean =
    localStorage.debug && localStorage.debug.includes('observeElementInViewport')

  if (isDebugEnabled) {
    /* tslint:disable:no-console */
    console.log('IntersectionObserver options', intersectionObserverOptions)
    /* tslint:enable:no-console */
  }

  const cb = (entries: CustomEntry[], observer: IntersectionObserver) => {
    const entryForEl = entries.filter(entry => entry.target === el)[0]
    const unobserve: UnobserveFn = () => observer.unobserve(el)

    if (entryForEl) {
      const { isIntersecting, intersectionRatio } = entryForEl

      entryForEl.isInViewport = isIntersecting && intersectionRatio >= minThreshold

      if (entryForEl.isInViewport) {
        inHandler(entryForEl, unobserve, el)
      } else {
        outHandler(entryForEl, unobserve, el)
      }
    }
  }

  const intersectionObserver = new IntersectionObserver(cb, intersectionObserverOptions)

  intersectionObserver.observe(el)

  return () => intersectionObserver.unobserve(el)
}

export const isInViewport = async (el: HTMLElement, opts: Partial<Options>) => {
  return new Promise((resolve, reject) => {
    try {
      observeElementInViewport(
        el,
        (_, unobserve) => {
          unobserve()
          resolve(true)
        },
        (_, unobserve) => {
          unobserve()
          resolve(false)
        },
        opts
      )
    } catch (e) {
      reject(e)
    }
  })
}
