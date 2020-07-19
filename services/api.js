import axios from "axios";
import { URI_BACKEND } from "react-native-dotenv";

const api = axios.create({
  baseURL: URI_BACKEND,
});

export default api;
