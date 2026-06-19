"use client";

import { useEffect, useState } from "react";

import type { ProfileUser } from "@/lib/profile";
import { profileInitials } from "@/lib/profile";

type ProfileAvatarProps = {
  user: ProfileUser;
  size?: "lg" | "md";
  imageCacheKey?: number;
};

const sizeClasses = {
  lg: "h-20 w-20 text-2xl",
  md: "h-12 w-12 text-base",
};

function profileImageSrc(
  imageUrl: string | null,
  imageCacheKey?: number,
): string | null {
  if (!imageUrl) {
    return null;
  }
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }
  if (imageCacheKey === undefined) {
    return imageUrl;
  }
  return `${imageUrl}?v=${imageCacheKey}`;
}

export function ProfileAvatar({
  user,
  size = "lg",
  imageCacheKey,
}: ProfileAvatarProps) {
  const [failed, setFailed] = useState(false);
  const src = profileImageSrc(user.imageUrl, imageCacheKey);
  const showImage = src && !failed;

  useEffect(() => {
    setFailed(false);
  }, [user.imageUrl, imageCacheKey]);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 font-semibold text-zinc-700 ${sizeClasses[size]}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        profileInitials(user)
      )}
    </div>
  );
}
