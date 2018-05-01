export function stringCheck(_str) {

  if (typeof _str === "string")
    return true;

  if (_str instanceof String)
    return true;

  return false;

};

export function errorBuild(_from, func, msg) {
  return (!func)
    ? `\n ** (${_from}) -> ${msg}`
    : `\n ** (${_from}) -> ${func}\n ** ${msg}`;
}
