import axios from "axios";

const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

export const getBaseUrl = () => {
  return localStorage.getItem("eduai_api_url") || DEFAULT_BASE_URL;
};

export const setBaseUrl = (url: string) => {
  localStorage.setItem("eduai_api_url", url);
};

const api = () => axios.create({ baseURL: getBaseUrl(), timeout: 30000 });
const apiLong = () => axios.create({ baseURL: getBaseUrl(), timeout: 300000 }); // 5 min for Whisper/LLaVA

export interface HealthResponse {
  status: string;
  models: Record<string, string>;
}

export interface AnalyzeRequest {
  text: string;
  language?: string;
}

export interface InsightResult {
  identified_issue: string;
  curriculum_topic: string;
  age_group: string;
  suggested_activity: string;
  required_materials: string[];
  activity_duration: string;
  extracted_files?: { file_name: string; content: string }[];
}

export const fetchHealth = async (): Promise<HealthResponse> => {
  const { data } = await api().get("/health");
  return data;
};

export const analyzeObservation = async (payload: AnalyzeRequest): Promise<InsightResult[]> => {
  const { data } = await api().post("/teacher/analyze", payload);
  return data;
};

export const uploadFiles = async (
  files: File[],
  language?: string,
  text?: string
): Promise<InsightResult[]> => {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  if (language) formData.append("language", language);
  if (text) formData.append("text", text);
  const { data } = await apiLong().post("/teacher/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
