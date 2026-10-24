import HttpService from "../../services/http-service.js";

class BloodRequestService extends HttpService {
  listAllRequests = async (params = {}) =>
    this.getRequest("/requests", { params });
  createRequest = async (data) => this.postRequest("/requests", data);
  updateStatus = async (id, status) =>
    this.patchRequest(`/requests/${id}/status`, { status });
  findMatchingDonors = async (id) => this.getRequest(`/requests/${id}/matches`);
  deleteRequestById = async (id) => this.deleteRequest(`/requests/${id}`);
}

const bloodRequestSvc = new BloodRequestService();
export default bloodRequestSvc;
