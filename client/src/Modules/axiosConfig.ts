import axios from "axios";
import { Settings } from "./Settings";

const api = axios.create({
	baseURL: Settings.server,
	withCredentials: true, // important for sending cookies!
});

export default api;
