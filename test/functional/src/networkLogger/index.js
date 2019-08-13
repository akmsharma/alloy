import { RequestLogger } from "testcafe";

const createRequestLogger = endpoint => {
  return RequestLogger(endpoint, {
    logRequestHeaders: true,
    logRequestBody: true,
    stringifyRequestBody: true,
    logResponseBody: true,
    stringifyResponseBody: true,
    logResponseHeaders: true
  });
};

const createNetworkLogger = () => {
  const gatewayEndpoint = /edgegateway\.azurewebsites/;
  const sandboxEndpoint = /alloyqe\.azurewebsites/;

  const gatewayEndpointLogs = createRequestLogger(gatewayEndpoint);
  const sandboxEndpointLogs = createRequestLogger(sandboxEndpoint);

  const clearLogs = async () => {
    await gatewayEndpointLogs.clear();
    await sandboxEndpointLogs.clear();
  };

  return {
    gatewayEndpointLogs,
    sandboxEndpointLogs,
    clearLogs
  };
};

export default createNetworkLogger;