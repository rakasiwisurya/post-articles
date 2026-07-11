"use client";

import { useEffect, useState } from "react";
import { App, Card, Empty, Pagination, Skeleton, Tag, Typography } from "antd";
import { FiCalendar } from "react-icons/fi";
import { listArticles } from "@/lib/api";
import type { Article } from "@/lib/types";

const PAGE_SIZE = 5;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function PreviewPage() {
  const { message } = App.useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listArticles(PAGE_SIZE, (page - 1) * PAGE_SIZE, "publish")
      .then(({ articles, total }) => {
        if (!active) return;
        setArticles(articles);
        setTotal(total);
      })
      .catch((error) => {
        if (!active) return;
        message.error(
          error instanceof Error ? error.message : "Failed to load articles",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, message]);

  return (
    <div className="flex flex-col gap-4">
      <Typography.Title level={3} className="mb-0!">
        Preview
      </Typography.Title>

      {loading ? (
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      ) : articles.length === 0 ? (
        <Card>
          <Empty description="No published articles yet" />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <Card key={article.id}>
              <article className="flex flex-col gap-3">
                <div>
                  <Typography.Title level={4} className="mb-1!">
                    {article.title}
                  </Typography.Title>
                  <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <Tag color="blue">{article.category}</Tag>
                    <span className="inline-flex items-center gap-1">
                      <FiCalendar />
                      {formatDate(article.created_date)}
                    </span>
                  </div>
                </div>
                <Typography.Paragraph className="mb-0! whitespace-pre-line">
                  {article.content}
                </Typography.Paragraph>
              </article>
            </Card>
          ))}
        </div>
      )}

      {total > 0 && (
        <div className="flex justify-center pt-2">
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}
