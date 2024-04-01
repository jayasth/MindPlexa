module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
        babelConfig: true, // This line should help in transforming JSX
      },
    ],
  },
  setupFiles: ["dotenv/config"],
};
