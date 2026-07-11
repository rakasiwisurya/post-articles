"use client";

import { useRouter } from "next/navigation";
import { App, Typography } from "antd";
import ArticleForm from "@/components/article-form";
import { createArticle } from "@/lib/api";
import type { ArticlePayload } from "@/lib/types";

export default function AddNewPage() {
  const router = useRouter();
  const { message } = App.useApp();

  const handleSubmit = async (payload: ArticlePayload) => {
    await createArticle(payload);
    message.success(
      payload.status === "publish"
        ? "Article published"
        : "Article saved as draft",
    );
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-4">
      <Typography.Title level={3} className="mb-0!">
        Add New
      </Typography.Title>
      <ArticleForm onSubmit={handleSubmit} />
    </div>
  );
}
