"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { App, Button, Popconfirm, Table, Tabs, Typography } from "antd";
import type { TableProps } from "antd";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { deleteArticle, listArticles, updateArticle } from "@/lib/api";
import type { Article, ArticleStatus } from "@/lib/types";

// The dashboard works on the full list and lets each tab filter client-side.
const FETCH_LIMIT = 1000;

const TABS: { key: ArticleStatus; label: string }[] = [
  { key: "publish", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "thrash", label: "Trashed" },
];

export default function AllPostsPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ArticleStatus>("publish");

  const loadArticles = useCallback(
    () =>
      listArticles(FETCH_LIMIT, 0)
        .then(({ articles }) => setArticles(articles))
        .catch((error: unknown) => {
          message.error(error instanceof Error ? error.message : "Failed to load articles");
        })
        .finally(() => setLoading(false)),
    [message],
  );

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  const moveToTrash = async (article: Article) => {
    try {
      await updateArticle(article.id, {
        title: article.title,
        content: article.content,
        category: article.category,
        status: "thrash",
      });
      message.success(`"${article.title}" moved to trash`);
      await loadArticles();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Failed to move article to trash");
    }
  };

  const deletePermanently = async (article: Article) => {
    try {
      await deleteArticle(article.id);
      message.success(`"${article.title}" deleted permanently`);
      await loadArticles();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Failed to delete article");
    }
  };

  const columnsFor = (status: ArticleStatus): TableProps<Article>["columns"] => [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 200,
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      align: "center",
      render: (_, article) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            type="text"
            aria-label={`Edit ${article.title}`}
            icon={<FiEdit2 />}
            onClick={() => router.push(`/articles/${article.id}/edit`)}
          />
          <Popconfirm
            title={status === "thrash" ? "Delete permanently?" : "Move to trash?"}
            description={
              status === "thrash"
                ? "This will remove the article from the database."
                : "The article will show up in the Trashed tab."
            }
            okText="Yes"
            cancelText="No"
            onConfirm={() =>
              status === "thrash" ? deletePermanently(article) : moveToTrash(article)
            }
          >
            <Button
              type="text"
              danger
              aria-label={`Trash ${article.title}`}
              icon={<FiTrash2 />}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const tabItems = useMemo(
    () =>
      TABS.map(({ key, label }) => {
        const rows = articles.filter((article) => article.status === key);
        return {
          key,
          label: `${label} (${rows.length})`,
          children: (
            <Table<Article>
              rowKey="id"
              columns={columnsFor(key)}
              dataSource={rows}
              loading={loading}
              pagination={{ pageSize: 10, hideOnSinglePage: true }}
            />
          ),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [articles, loading],
  );

  return (
    <div className="flex flex-col gap-4">
      <Typography.Title level={3} className="mb-0!">
        All Posts
      </Typography.Title>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as ArticleStatus)}
        items={tabItems}
      />
    </div>
  );
}
