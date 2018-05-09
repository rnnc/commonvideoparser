export function stringCheck(_str) {
  return ((typeof _str === "string") || (_str instanceof String))
};

export function arrayCheck(arr) {
  return (Array.isArray(arr) || (arr instanceof Array))
}

export function errorBuild(_from, func, msg) {
  const errStr = `\n ** (${_from}) ~> `
  return (!func)
    ? `${errStr}${msg}`
    : (msg instanceof Error)
      ? `${errStr}${func}\n\n${msg}`
      : `${errStr}${func}\n ** ${msg}`;
}
