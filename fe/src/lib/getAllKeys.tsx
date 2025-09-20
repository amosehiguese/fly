export const getAllKeys = <T extends object>(arr: T[]): (keyof T)[] => {
  return [...new Set(arr.flatMap((obj) => Object.keys(obj)))] as (keyof T)[];
};
