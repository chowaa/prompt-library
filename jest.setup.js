if (typeof expect !== "undefined") {
  require("@testing-library/jest-native/extend-expect");
}


jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
  default: jest.fn(() => "light"),
}));

const originalError = console.error;
console.error = (...args) => {
  if (
    /Warning: ReactDOM.render is no longer supported/.test(args[0]) ||
    /inside a test was not wrapped in act/.test(args[0])
  ) {
    return;
  }
  originalError.call(console, ...args);
};
