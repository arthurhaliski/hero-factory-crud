'use client';

import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { clsx } from 'clsx';

interface HeroCardSkeletonProps {
  className?: string;
}

export function HeroCardSkeleton({ className }: HeroCardSkeletonProps) {
  return (
    <div 
      className={clsx(
        "group relative flex flex-col items-center gap-3 p-4",
        "bg-white dark:bg-zinc-800 rounded-lg",
        "border border-zinc-950/10 dark:border-white/10",
        className
      )}
    >
      <div className="relative">
        <div className="size-20 shrink-0 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-700">
          <svg 
            className="size-8 text-zinc-300 dark:text-zinc-500" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      </div>
      
      <div className="flex-1 w-full text-center">
        <Skeleton className="h-5 w-4/5 mx-auto rounded-md" />
      </div>
      
      <div className="absolute top-4 right-3">
        <Skeleton className="size-5 rounded-md" />
      </div>
    </div>
  );
} 