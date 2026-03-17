import api from "./api";

export const marketboostService = {
  async browse(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`/marketboost/browse?${params}`);
    return res.data;
  },

  async getMyListings() {
    const res = await api.get("/marketboost/storefront/mine");
    return res.data;
  },

  async createListing(data) {
    const res = await api.post("/marketboost/listings", data);
    return res.data;
  },

  async updateListing(listingId, data) {
    const res = await api.patch(`/marketboost/listings/${listingId}`, data);
    return res.data;
  },

  async deleteListing(listingId) {
    const res = await api.delete(`/marketboost/listings/${listingId}`);
    return res.data;
  },

  async inquire(listingId) {
    const res = await api.post(`/marketboost/listings/${listingId}/inquire`);
    return res.data;
  },
};

export default marketboostService;