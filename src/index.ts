export interface Options {
  viewport: null | Element
  modTop: string
  modRight: string
  modBottom: string
  modLeft: string
  threshold: number[]
}

export interface CustomEntry extends IntersectionObserverEntry {
  isInViewport?: boolean
}

export type UnobserveFn = () => void

export type Handler = (entry: CustomEntry, unobserveFn: UnobserveFn, el: Element) => any

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

/**
 * Given a set of options, DOM node and in and out of viewport handlers,
 * this function uses an IntersectionObserver to figure out whether
 * the DOM node is in viewport or not and calls the respective handler.
 * It is a curried function and expects the parameters in the not so
 * common order so as to make it easier to observe multiple DOM nodes
 * with the same settings/options and maybe even the same handlers.
 *
 * @param {Node} target - target element to observe
 * and intersection threshold
 * @param {function} inHandler - fn to call when element is in viewport
 * for each given threshhold
 * @param {function} outHandler - fn to call when element leaves viewport
 * @param {object} opts - options to configure the viewport
 *
 * @return {function} unobserve element function
 */
export function observeElementInViewport(
  target: Element | null,
  inHandler: Handler,
  outHandler: Handler = () => undefined,
  opts: Partial<Options> = {}
): UnobserveFn {
  if (!target) {
    throw new Error('Target element to observe should be a valid DOM Node')
  }

  const { viewport, modTop, modLeft, modBottom, modRight, threshold }: Options = Object.assign(
    {},
    defaultOptions,
    opts
  )

  if (!Array.isArray(threshold) && !(typeof threshold === 'number')) {
    throw new Error('threshold should be a number or an array of numbers')
  }

  // The mod 101 is to prevent threshold from being greater than 1
  const thresholdArray: number[] = Array.isArray(threshold)
    ? threshold.map(t => Math.floor(t % 101) / 100)
    : [Math.floor(threshold ? threshold % 101 : 0) / 100]

  const minThreshold: number = Math.min(...thresholdArray)

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

  const cb = (entries: IntersectionObserverEntry[], observer: IntersectionObserver): void => {
    const entryForEl: CustomEntry = entries.filter(entry => entry.target === target)[0]
    const unobserve: UnobserveFn = () => observer.unobserve(target)

    if (entryForEl) {
      const { isIntersecting, intersectionRatio } = entryForEl

      entryForEl.isInViewport = isIntersecting && intersectionRatio >= minThreshold

      if (entryForEl.isInViewport) {
        inHandler(entryForEl, unobserve, target)
      } else {
        outHandler(entryForEl, unobserve, target)
      }
    }
  }

  const intersectionObserver = new IntersectionObserver(cb, intersectionObserverOptions)

  intersectionObserver.observe(target)

  return () => intersectionObserver.unobserve(target)
}

// The function can return Promise that resolves to boolean or an object since in JS
// anything can be thrown thus we cannot not know what we reject with in the catch block
export const isInViewport = async (
  el: Element | null,
  opts: Partial<Options> = {}
): Promise<boolean | {}> => {
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
