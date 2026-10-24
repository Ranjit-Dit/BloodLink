import axiosInstance from "../config/axios.config.jsx";

class HttpService {
  getRequest = async (url, config = {}) => axiosInstance.get(url, config);
  postRequest = async (url, data = {}, config = {}) =>
    axiosInstance.post(url, data, config);
  patchRequest = async (url, data = {}, config = {}) =>
    axiosInstance.patch(url, data, config);
  deleteRequest = async (url, config = {}) => axiosInstance.delete(url, config);
}

export default HttpService;
