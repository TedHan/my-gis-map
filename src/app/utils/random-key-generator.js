export const randomKeyGenerator = (length = 8) => {
  const CHAR_SET =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let res = "";
  for (let i = 0; i < length; i++) {
    res += CHAR_SET.charAt(Math.floor(Math.random() * CHAR_SET.length));
  }
  return res;
};
