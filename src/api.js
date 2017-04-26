import stringify from "json-stringify-pretty-compact";

export default class Api {
  static fetchJKF() {
    return fetch('/jkf')
      .then(response => response.json());
  }
  static storeJKF(jkf) {
    const body = stringify(jkf);

    function preserveFailedData(e) {
      console.error(e);
      window.sessionStorage.setItem('lastFailedJKF', body);
      console.log('Failed to save. You can get the last JKF by: console.log(sessionStorage.getItem("lastFailedJKF"))');
    }

    return new Promise((resolve, reject) => {
      fetch('/jkf', { method: 'PUT', body: body })
        .then((response) => {
          if (response.ok) {
            resolve();
          } else {
            preserveFailedData(response);
            reject(response);
          }
        })
        .catch((e) => {
          preserveFailedData(e);
          reject(e);
        });
    });
  }
}
