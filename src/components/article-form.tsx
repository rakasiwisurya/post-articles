"use client";

import { useState } from "react";
import { App, Button, Card, Form, Input } from "antd";
import { FiSave, FiSend } from "react-icons/fi";
import { ApiError } from "@/lib/api";
import type { Article, ArticlePayload, ArticleStatus } from "@/lib/types";

const FIELD_NAMES = ["title", "content", "category"] as const;
type FieldName = (typeof FIELD_NAMES)[number];

type FormValues = Record<FieldName, string>;

interface ArticleFormProps {
  initialValues?: Pick<Article, "title" | "content" | "category">;
  /** Called with the full payload; throw to keep the form open on failure. */
  onSubmit: (payload: ArticlePayload) => Promise<void>;
}

/**
 * Shared form for Add New and Edit. The Publish / Draft buttons submit the
 * same fields with the corresponding status, mirroring the API validation
 * rules client-side.
 */
export default function ArticleForm({ initialValues, onSubmit }: ArticleFormProps) {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState<ArticleStatus | null>(null);

  const submitWithStatus = async (status: Exclude<ArticleStatus, "thrash">) => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch {
      return; // antd already renders the field errors
    }

    setSubmitting(status);
    try {
      await onSubmit({ ...values, status });
    } catch (error) {
      if (error instanceof ApiError && error.fields) {
        const fieldErrors = Object.entries(error.fields)
          .filter((entry): entry is [FieldName, string] =>
            (FIELD_NAMES as readonly string[]).includes(entry[0]),
          )
          .map(([name, fieldError]) => ({ name, errors: [fieldError] }));
        if (fieldErrors.length > 0) {
          form.setFields(fieldErrors);
        } else {
          message.error(error.message);
        }
      } else {
        message.error(error instanceof Error ? error.message : "Failed to save article");
      }
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Card>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          label="Title"
          name="title"
          rules={[
            { required: true, message: "Title is required" },
            { min: 20, message: "Title must be at least 20 characters" },
          ]}
        >
          <Input placeholder="Article title (min. 20 characters)" showCount maxLength={200} />
        </Form.Item>

        <Form.Item
          label="Content"
          name="content"
          rules={[
            { required: true, message: "Content is required" },
            { min: 200, message: "Content must be at least 200 characters" },
          ]}
        >
          <Input.TextArea
            rows={10}
            placeholder="Write the article content (min. 200 characters)"
            showCount
          />
        </Form.Item>

        <Form.Item
          label="Category"
          name="category"
          rules={[
            { required: true, message: "Category is required" },
            { min: 3, message: "Category must be at least 3 characters" },
          ]}
        >
          <Input placeholder="e.g. technology" maxLength={100} />
        </Form.Item>

        <div className="flex gap-3 pt-2">
          <Button
            type="primary"
            icon={<FiSend />}
            loading={submitting === "publish"}
            disabled={submitting === "draft"}
            onClick={() => submitWithStatus("publish")}
          >
            Publish
          </Button>
          <Button
            icon={<FiSave />}
            loading={submitting === "draft"}
            disabled={submitting === "publish"}
            onClick={() => submitWithStatus("draft")}
          >
            Draft
          </Button>
        </div>
      </Form>
    </Card>
  );
}
