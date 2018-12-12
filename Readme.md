# observe-element-in-viewport

In browsers that support the Intersection Observer, this library lets you find out when an element of yours is in viewport.
The viewport itself is configurable. It can be the window or any other element in the DOM.
Only requirement is that the element who visibility you want to check _must_ be a child of the element you choose as your
viewport.

## Installation

```js
npm install observe-element-in-viewport
```

## Usage

### Observing a `target` element

```js
import { observeElementInViewport } from 'observe-element-in-viewport'

// to use window as viewport, pass this option as null
const viewport = document.querySelector('.viewport')

// element whose visibility we want to track
const target = document.querySelector('.target')

// handler for when target is in viewport
const inHandler = (entry, unobserve, targetEl) => console.log('In viewport')

// handler for when target is NOT in viewport
const outHandler = (entry, unobserve, targetEl) => console.log('Not in viewport')

// the returned function, when called, stops tracking the target element in the
// given viewport
const unobserve = observeElementInViewport(target, inHandler, outHandler, {
  // set viewport
  viewport,

  // decrease viewport top by 100px
  // similar to this, modRight, modBottom and modLeft exist
  modTop: '-100px'

  // threshold tells us when to trigger the handlers.
  // a threshold of 90 means, trigger the inHandler when atleast 90%
  // of target is visible. It triggers the outHandler when the amount of
  // visible portion of the target falls below 90%.
  // If this array has more than one value, the lowest threshold is what
  // marks the target as having left the viewport
  threshold: [90]
})
```

### One time query to check if `target` element is in viewport

```js
import { isInViewport } from 'observe-element-in-viewport'

// element whose visibility we want to track
const target = document.querySelector('.target')

// Using window as viewport, it will check the target element's
// visibility and log true or false.
// This function accepts a second parameter which is the same
// as the first parameter to observeElementInViewport fn i.e.,
// the options object.
console.log(await isInViewport(target))
```

## Demo

[Try it here](https://obs.zdx.cat/)
