import * as stringify from "json-stringify-pretty-compact";
import { JSONKifuFormat } from "./shogiUtils";

export default class Api {
  static fetchJKF() {
    const begin = new Date();
    return fetch('/jkf')
      .then(response => response.json())
      .then(json => {
        const end = new Date();
        console.log(`fetchJKF ${end.getTime() - begin.getTime()}ms`);
        return json;
      });
  }
  static storeJKF(jkf: JSONKifuFormat) {
    const body = stringify(jkf) + '\n'; // Add newline at end of file

    function preserveFailedData(e: Error | Response) {
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
