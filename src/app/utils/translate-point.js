export const translatePoint = (originalLongitude, offset = 171) => {
  let newLongitude = originalLongitude - offset;

  if (newLongitude < -180) {
    newLongitude += 360;
  }

  return newLongitude;
};
