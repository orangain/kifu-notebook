export default class Api {
  static fetchJKF() {
    return fetch('/jkf')
      .then(response => response.json());
  }
  static storeJKF(jkf) {
    const body = JSON.stringify(jkf, null, '  ');

    return new Promise((resolve, reject) => {
      fetch('/jkf', { method: 'PUT', body: body })
        .then((response) => {
          if (response.ok) {
            resolve();
          } else {
            console.error(response);
            console.log(body);  // to preserve data
            reject(response);
          }
        })
        .catch((e) => {
          console.error(e);
          console.log(body);  // to preserve data
          reject(e);
        });
    });
  }
}
