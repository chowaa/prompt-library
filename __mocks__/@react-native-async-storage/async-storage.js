const mockStorage = new Map();

const AsyncStorage = {
  getItem: jest.fn(async (key) => {
    return mockStorage.has(key) ? mockStorage.get(key) : null;
  }),

  setItem: jest.fn(async (key, value) => {
    mockStorage.set(key, value);
  }),

  removeItem: jest.fn(async (key) => {
    mockStorage.delete(key);
  }),

  clear: jest.fn(async () => {
    mockStorage.clear();
  }),

  __reset: () => {
    mockStorage.clear();
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
    AsyncStorage.removeItem.mockClear();
    AsyncStorage.clear.mockClear();
  },
};

module.exports = AsyncStorage;
