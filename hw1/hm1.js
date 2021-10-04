const sum = (arg1) => (n) => {
  if (n !== undefined) {
    return sum(arg1 + n);
  }
  return arg1;
}