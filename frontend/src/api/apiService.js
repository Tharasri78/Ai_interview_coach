import API from "./api";

/* ================= AUTH ================= */

// SIGNUP
export const signupUser = (name, email, password) => {
  return API.post("/auth/signup/", {
    name,
    email,
    password
  });
};

// LOGIN

export const loginUser = (email, password) => {
  return API.post("/auth/login/", {
    email,
    password
  });
};

/* ================= UPLOAD ================= */

export const uploadPDF = (userId, formData) => {
  return API.post(`/upload/upload-pdf/?user_id=${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/* ================= QUESTION ================= */

// ⚠️ keep GET if your backend uses query params
export const generateQuestion = (userId, topic) => {
  return API.get(
    `/generate-question/?user_id=${userId}&topic=${encodeURIComponent(topic)}`
  );
};


/* ================= ANSWER ================= */

export const submitAnswer = (userId, question, answer) => {
  return API.post("/submit-answer/", {
    user_id: userId,
    question,
    answer,
  });
};


/* ================= HISTORY ================= */

export const getHistory = (userId) => {
  return API.get(`/history/${userId}`);
};


/* ================= SUMMARY ================= */

export const getSummary = (userId) => {
  return API.get(`/summary/${userId}`);
};


/* ================= INTERVIEW ================= */

export const startInterview = (userId) => {
  return API.post(`/interview/start-interview/`, {
    user_id: userId,
  });
};

export const nextStep = (userId, answer) => {
  return API.post(`/interview/next-step/`, {
    user_id: userId,
    answer,
  });
};