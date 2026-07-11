"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { App, Button, Result, Skeleton, Tag, Typography } from "antd";
import ArticleForm from "@/components/article-form";
import { ApiError, getArticle, updateArticle } from "@/lib/api";
import type { Article, ArticlePayload, ArticleStatus } from "@/lib/types";

const STATUS_TAG: Record<ArticleStatus, { color: string; label: string }> = {
  publish: { color: "green", label: "Published" },
  draft: { color: "gold", label: "Draft" },
  thrash: { color: "red", label: "Trashed" },
};

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const articleId = Number(id);
  const invalidId = !Number.isInteger(articleId) || articleId < 1;
  const router = useRouter();
  const { message } = App.useApp();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(!invalidId);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (invalidId) return;

    let active = true;
    getArticle(articleId)
      .then((data) => {
        if (active) setArticle(data);
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
        } else {
          message.error(error instanceof Error ? error.message : "Failed to load article");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [articleId, invalidId, message]);

  const handleSubmit = async (payload: ArticlePayload) => {
    await updateArticle(articleId, payload);
    message.success(
      payload.status === "publish"
        ? "Article published"
        : "Article saved as draft",
    );
    router.push("/");
  };

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (invalidId || notFound || !article) {
    return (
      <Result
        status="404"
        title="Article not found"
        subTitle="The article you are trying to edit does not exist."
        extra={
          <Button type="primary" onClick={() => router.push("/")}>
            Back to All Posts
          </Button>
        }
      />
    );
  }

  const statusTag = STATUS_TAG[article.status];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Typography.Title level={3} className="mb-0!">
          Edit Article
        </Typography.Title>
        <Tag color={statusTag.color}>{statusTag.label}</Tag>
      </div>
      <ArticleForm
        initialValues={{
          title: article.title,
          content: article.content,
          category: article.category,
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
