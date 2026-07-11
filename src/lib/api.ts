import type { Article, ArticlePayload, ArticleStatus } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/** Error thrown for non-2xx responses, carrying field errors when present. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let fields: Record<string, string> | undefined;
    try {
      const body = await response.json();
      message = body.message ?? message;
      fields = body.errors;
    } catch {
      // non-JSON error body; keep the generic message
    }
    throw new ApiError(message, response.status, fields);
  }
  return response.json() as Promise<T>;
}

const jsonInit = (method: string, payload: ArticlePayload): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

export function createArticle(payload: ArticlePayload): Promise<Article> {
  return fetch(`${API_BASE_URL}/article/`, jsonInit("POST", payload)).then(
    (response) => handleResponse<Article>(response),
  );
}

export async function listArticles(
  limit: number,
  offset: number,
  status?: ArticleStatus,
): Promise<{ articles: Article[]; total: number }> {
  const query = status ? `?status=${status}` : "";
  const response = await fetch(
    `${API_BASE_URL}/article/${limit}/${offset}${query}`,
    { cache: "no-store" },
  );
  const articles = await handleResponse<Article[]>(response);
  const total = Number(response.headers.get("X-Total-Count") ?? articles.length);
  return { articles, total };
}

export function getArticle(id: number): Promise<Article> {
  return fetch(`${API_BASE_URL}/article/${id}`, { cache: "no-store" }).then(
    (response) => handleResponse<Article>(response),
  );
}

export function updateArticle(
  id: number,
  payload: ArticlePayload,
): Promise<Article> {
  return fetch(`${API_BASE_URL}/article/${id}`, jsonInit("PUT", payload)).then(
    (response) => handleResponse<Article>(response),
  );
}

export async function deleteArticle(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/article/${id}`, {
    method: "DELETE",
  });
  await handleResponse<{ message: string }>(response);
}
