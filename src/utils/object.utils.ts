import { CustomObjectType } from "@/types/types";

export const convertObjectListToDict = <T = any>(key: string, objectList: T[]): CustomObjectType<T> => {
  if(!objectList || !key || !Array.isArray(objectList)) {
    return {};
  }

  return objectList.reduce((dict: CustomObjectType<T>, obj: T) => {
    const dictKey = (obj as any)[key];
    if (dictKey !== undefined && dictKey !== null) {
      dict[dictKey] = obj;
    }
    
    return dict;
  }, {});
}