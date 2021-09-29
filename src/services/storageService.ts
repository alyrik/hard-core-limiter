import { ILimitedList } from '../models';

export interface IStorageStructure {
  lists: string[];
  limitedList: ILimitedList;
}

class StorageService {
  async setItem<TValue>(item: keyof IStorageStructure, value: TValue) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [item]: value }, () => {
        resolve(true);
      });
    });
  }

  async setItems(data: Partial<IStorageStructure>) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve(true);
      });
    });
  }

  async getItem<TValue>(item: keyof IStorageStructure) {
    return new Promise<TValue>((resolve) => {
      chrome.storage.local.get([item], (result) => {
        resolve(result[item]);
      });
    });
  }

  async getAll() {
    return new Promise<IStorageStructure>((resolve) => {
      chrome.storage.local.get(null, (storage) => {
        resolve(storage as IStorageStructure);
      });
    });
  }
}

export default new StorageService();
