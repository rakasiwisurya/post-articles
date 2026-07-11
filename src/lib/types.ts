export type ArticleStatus = "publish" | "draft" | "thrash";

/** Article as returned by the API (a row of the posts table). */
export interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  created_date: string;
  updated_date: string;
  status: ArticleStatus;
}

/** Payload for creating or updating an article. */
export interface ArticlePayload {
  title: string;
  content: string;
  category: string;
  status: ArticleStatus;
}
