export const sendResponse = (res, statusCode, payload) => {
  const body = Buffer.from(JSON.stringify(payload));
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Content-Length": body.length,
  });

  res.end(body);
};

export const sendSuccess = (res, payload) => sendResponse(res, 200, payload);
export const sendCreated = (res, payload) => sendResponse(res, 201, payload);
export const sendBadRequest = (res, payload) => sendResponse(res, 400, payload);
export const sendUnauthorized = (res, payload) =>
  sendResponse(res, 401, payload);
export const sendServerError = (res, payload) =>
  sendResponse(res, 500, payload);
export const sendMethodNotAllowed = (res, payload) =>
  sendResponse(res, 405, payload);
export const sendNotFound = (res, payload) => sendResponse(res, 404, payload);
