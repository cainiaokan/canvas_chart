export function getter (target: Object, propertyName: string) {
  const descriptor = Object.getOwnPropertyDescriptor(target, propertyName) || {
    configurable: true,
  }
  descriptor.get = function () {
    return this[propertyName]
  }
  Object.defineProperty(target, propertyName.substring(1), descriptor)
}

export function setter (target: Object, propertyName: string) {
  const descriptor = Object.getOwnPropertyDescriptor(target, propertyName) || {
    configurable: true,
  }
  descriptor.set = function (val) {
    this[propertyName] = val
  }
  Object.defineProperty(target, propertyName.substring(1), descriptor)
}
