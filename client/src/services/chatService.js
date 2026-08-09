import api from "./api";

export const fetchConversation = async (journalId) => {
  const { data } = await api.get(`/journals/${journalId}/messages`);
  return data; // { thread, messages }
};

// journalId === null starts a new conversation ("new" sentinel on the server).
export const sendMessage = async (journalId, text) => {
  const { data } = await api.post(`/journals/${journalId ?? "new"}/messages`, { text });
  return data; // { thread, aiMessage, supportNotice }
};
