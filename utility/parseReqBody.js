export const parseReqBody = (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const body = Buffer.concat(chunks).toString();
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("invalid JSON format"));
      }
    });
    req.on("error", reject);
  });
};
