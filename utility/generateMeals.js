let counter = 0;

export const generateId = (userId = "") => {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  const count = (counter++ % 10000).toString(36);
  const userPart = userId
    ? userId.trim().slice(-4).toLocaleUpperCase()
    : "xxxx";

  return `${time}-${random}-${userPart}-${count}`;
};
