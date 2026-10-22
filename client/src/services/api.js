const base = import.meta.env.VITE_API_URL || "http://localhost:4200";
export async function api(path, options) {
  const response = await fetch(`${base}/api/v1${path}`, options);
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.error?.message || "Request failed");
  return body;
}
export const loadWorkspace = () =>
  Promise.all([api("/documents"), api("/conversations")]);
export const sendQuestion = (question, conversationId) =>
  api("/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question, conversationId }),
  });
