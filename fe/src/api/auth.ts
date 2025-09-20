import {
  AdminLoginRequestBody,
  LoginRequestBody,
  SupplierLoginRequestBody,
} from "./interfaces/auth/login";
import {
  CustomerSignupRequestBody,
  MoverSignupRequestBody,
  SignupResponse,
} from "./interfaces/auth/signup";
import axios from "axios";
import api, { baseUrl } from "./index";

export const login = async (body: LoginRequestBody) => {
  const response = await axios.post(`${baseUrl}api/login`, body, {});
  // console.log("login response", response);

  return response.data;
};

export const adminLogin = async (body: AdminLoginRequestBody) => {
  const response = await axios.post(`${baseUrl}api/admin-login`, body);
  return response.data;
};

export const adminLogOut = async () => {
  const response = await api.post(`api/admins/logout`);
  return response.data;
};

export const customerSignup = async (
  body: CustomerSignupRequestBody
): Promise<SignupResponse> => {
  // console.log("body", body);
  const response = await axios.post(`${baseUrl}api/customers/register`, body);
  return response.data;
};

export const moverSignup = async (
  body: MoverSignupRequestBody
): Promise<SignupResponse> => {
  const formData = new FormData();

  // Add all text fields from the body
  Object.entries(body).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(
        key,
        typeof value === "number" ? value.toString() : value
      );
    }
  });

  // Add the documents if it exists
  if (body.documents) {
    body.documents.forEach((document) => {
      formData.append("documents", document);
    });
  }

  // Use the formData in the request, not the original body
  const response = await axios.post(
    `${baseUrl}api/suppliers/register`,
    formData
  );
  return response.data;
};

export const supplierLogin = async (body: SupplierLoginRequestBody) => {
  const response = await axios.post(`${baseUrl}api/login`, body);
  return response.data;
};

export const supplierLogOut = async () => {
  const response = await api.post(`api/suppliers/logout`);
  return response.data;
};

// Forgot Password API functions
export const sendForgotPasswordCode = async (email: string) => {
  const response = await api.post("api/forgot-password/send-code", {
    email,
  });
  return response.data;
};

export const resetPassword = async (data: {
  email: string;
  code: string;
  newPassword: string;
}) => {
  const response = await api.post("api/forgot-password/reset", data);
  return response.data;
};
