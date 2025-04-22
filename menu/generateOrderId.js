export const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  return `ORD${timestamp}`;
};
