import AsyncStorage from "@react-native-async-storage/async-storage"

const API_BASE_URL = "http://localhost:5001/api" // Remplacer par votre URL de production

class ApiService {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem("dynprot_token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const authHeaders = await this.getAuthHeaders();

    const headers: Record<string, string> = {
      ...authHeaders,
      ...(options.headers as Record<string, string>),
    };

    // Let fetch set the Content-Type for FormData automatically.
    // For other requests, default to application/json if not specified.
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    } else if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return; // Return nothing for non-json responses
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async get(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(url, {
      method: 'GET',
    });
  }

  async post(endpoint: string, data: any, options: RequestInit = {}): Promise<any> {
    const isFormData = data instanceof FormData;

    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint: string, data: any): Promise<any> {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint: string): Promise<any> {
    return this.request(endpoint, {
      method: "DELETE",
    })
  }
}

export const api = new ApiService()
