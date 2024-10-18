const replace = (item: any, keys: string[], prefix: string) => {
  let temp = item;
  for (let i = 0; i < keys.length - 1; i++) {
    temp = temp[keys[i]];

    // If the key does not exist, return
    if (!temp) return;
  }

  if (temp[keys[keys.length - 1]]) {
    // If the key exists, replace the value with the prefix
    temp[keys[keys.length - 1]] = prefix + temp[keys[keys.length - 1]];
  }
};

const replaceUrl = (
  data: any[] | any,
  key: string | string[],
  prefix: string,
) => {
  if (Array.isArray(key)) {
    key.forEach((k) => {
      data = replaceUrl(data, k, prefix);
    });
    return data;
  }

  const keys = key.split('.');

  if (data instanceof Array) {
    for (const item of data) {
      replace(item, keys, prefix);
    }
  } else if (data instanceof Object) {
    replace(data, keys, prefix);
  } else {
    data = prefix + data;
  }

  return data;
};

export default replaceUrl;
