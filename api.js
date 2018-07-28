const axios = require("axios");

const api = axios.create({
  baseURL: "https://1531b976.ngrok.io/api"
});

const setAuthorization = token => {
  api.interceptors.request.use(config => {
    config.headers["x-access-token"] = token;
    return config;
  });
};

module.exports = { api, setAuthorization };
