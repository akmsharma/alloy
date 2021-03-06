import fixtureFactory from "../../helpers/fixtureFactory";
import testServerUrl from "../../helpers/constants/testServerUrl";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/multiConfig.html`;

fixtureFactory({
  title: "C2588: Throws error when configure is executed multiple times.",
  url: urlCollector
});

test.meta({
  ID: "C2588",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2586: Throw error when configure is executed multiple times.", async t => {
  const { error } = await t.getBrowserConsoleMessages();
  await t
    .expect(error)
    .match(
      /The library has already been configured and may only be configured once./
    );
});
