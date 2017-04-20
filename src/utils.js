export function debounce(timeout) {
  let timeoutHandle;
  return () => {
    return new Promise((resolve, reject) => {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
      timeoutHandle = setTimeout(() => {
        timeoutHandle = undefined;
        resolve();
      }, timeout);
    });
  }
}
