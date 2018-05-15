export interface Options {
  viewport: null | HTMLElement,
  modTop: string,
  modRight: string,
  modBottom: string,
  modLeft: string,
  threshold: number[]
}

export interface CustomEntry extends IntersectionObserverEntry {
  isInViewport?: boolean
}

export type UnobserveFn = () => void

export type Handler = (entry: CustomEntry, unobserveFn: UnobserveFn, el?: HTMLElement) => undefined
