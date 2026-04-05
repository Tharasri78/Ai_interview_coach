import API from "./api";


export const signupUser = (name, email, password) => {
  return API.post(
    `/signup/?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  );
};

export const loginUser = (email, password) => {
  return API.post(
    `/login/?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  );
};

/* Upload PDF */
export const uploadPDF = (userId, formData) => {
  return API.post(`/upload-pdf/?user_id=${userId}`, formData, {
    
  });
};

/* Generate Question */
export const generateQuestion = (userId, topic) => {
  return API.get(`/generate-question/?user_id=${userId}&topic=${encodeURIComponent(topic)}`);
};

/* Submit Answer */
export const submitAnswer = (userId, question, answer) => {
  return API.post("/submit-answer/", {
    user_id: userId,
    question,
    answer,
  });
};

/* Get History */
export const getHistory = (userId) => {
  return API.get(`/history/${userId}`);
};