import axios from "axios";

const api = axios.create({
  baseURL: "https://gestor-dv.herokuapp.com/",
});

export default api;
