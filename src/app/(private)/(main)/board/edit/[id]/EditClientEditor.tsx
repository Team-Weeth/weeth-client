'use client';

import { useRef } from 'react';
import Link from 'next/link';

import { PostEditorShell } from '@/components/board';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui';
import { usePostStore } from '@/stores/usePostStore';
import type { PostDetail } from '@/types/board';

interface EditClientEditorProps {
  post: PostDetail;
}

function EditClientEditor({ post }: EditClientEditorProps) {
  const initializedRef = useRef(false);
  if (!initializedRef.current) {
    initializedRef.current = true;
    usePostStore.getState().initFromDetail(post);
  }

  return (
    <PostEditorShell
      initialContent={post.content}
      header={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/board">게시판</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="typo-caption1 text-text-alternative">
              {post.boardName}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/board/${post.id}`} className="typo-caption1 text-text-alternative">
                  {post.title}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="typo-caption1">수정</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      }
    />
  );
}

export { EditClientEditor };
