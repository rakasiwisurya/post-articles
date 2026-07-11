"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { App, ConfigProvider, Layout } from "antd";
import { Menu } from "antd";
import { FiEye, FiFileText, FiPlusCircle } from "react-icons/fi";

const NAV_ITEMS = [
  { key: "/", icon: <FiFileText />, label: <Link href="/">All Posts</Link> },
  {
    key: "/add-new",
    icon: <FiPlusCircle />,
    label: <Link href="/add-new">Add New</Link>,
  },
  {
    key: "/preview",
    icon: <FiEye />,
    label: <Link href="/preview">Preview</Link>,
  },
];

function activeNavKey(pathname: string): string {
  if (pathname.startsWith("/add-new")) return "/add-new";
  if (pathname.startsWith("/preview")) return "/preview";
  return "/"; // All Posts is also the parent of the edit pages
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ConfigProvider>
      <App>
        <Layout className="min-h-screen">
          <Layout.Header className="flex items-center gap-8">
            <Link href="/" className="text-white! font-semibold text-lg whitespace-nowrap">
              Post Articles
            </Link>
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[activeNavKey(pathname)]}
              items={NAV_ITEMS}
              className="flex-1 min-w-0"
            />
          </Layout.Header>
          <Layout.Content className="px-6 py-8">
            <div className="mx-auto w-full max-w-5xl">{children}</div>
          </Layout.Content>
        </Layout>
      </App>
    </ConfigProvider>
  );
}
