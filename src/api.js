export default class Api {
  static fetchJKF() {
    return fetch('/jkf')
      .then(response => response.json());
  }
}
