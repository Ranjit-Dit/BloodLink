import HttpService from "../../services/http-service.js";

class DonorService extends HttpService {
  listAllDonors = async (params = {}) => this.getRequest("/donors", { params });
  getDonorById = async (id) => this.getRequest(`/donors/${id}`);
  createDonor = async (data) => this.postRequest("/donors", data);
  editDonorById = async (id, data) => this.patchRequest(`/donors/${id}`, data);
  updateAvailability = async (id, available) =>
    this.patchRequest(`/donors/${id}/availability`, { available });
  deleteDonorById = async (id) => this.deleteRequest(`/donors/${id}`);
}

const donorSvc = new DonorService();
export default donorSvc;
