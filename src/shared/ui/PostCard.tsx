"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "../atoms/Badge";

export interface PostSummary {
  id: string;
  title: string;
  contentPreview: string;
  boardSlug: string;
  boardName: string;
  author: {
    nickname: string;
    profileImage?: string;
  };
  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

interface PostCardProps {
  post: PostSummary;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "천";
  }
  return num.toString();
}

export function PostCard({ post }: PostCardProps) {
  const {
    id,
    title,
    contentPreview,
    boardSlug,
    boardName,
    author,
    createdAt,
    viewCount,
    likeCount,
    commentCount,
  } = post;

  const href = `/community/${boardSlug}/${id}`;

  return (
    <article className="border-b border-border py-4 last:border-b-0">
      <Link href={href} className="block group">
        <div className="flex items-start gap-3">
          {author.profileImage ? (
            <Image
              src={author.profileImage}
              alt={author.nickname}
              width={36}
              height={36}
              className="rounded-full object-cover bg-bg-tertiary flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-bg-tertiary flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-text-tertiary">
                {author.nickname.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary">{boardName}</Badge>
              <h3 className="text-sm font-medium text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                {title}
              </h3>
            </div>
            <p className="text-sm text-text-secondary line-clamp-2 mb-2">
              {contentPreview}
            </p>
            <div className="flex items-center gap-3 text-xs text-text-tertiary">
              <span className="font-medium text-text-secondary">
                {author.nickname}
              </span>
              <span>·</span>
              <span>{formatRelativeTime(createdAt)}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                {formatNumber(viewCount)}
              </span>
              <span className="flex items-center gap-0.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                {formatNumber(likeCount)}
              </span>
              <span className="flex items-center gap-0.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                {formatNumber(commentCount)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default PostCard;