import React from 'react';
import { skeleton as BoneyardSkeleton } from 'boneyard-js';

interface SkeletonProps {
  name: string;        // The unique registry name for this skeleton
  loading: boolean;    // When true, displays skeleton instead of children
  children?: React.ReactNode;
  fallback?: React.ReactNode; // Optional manual fallback if boneyard isn't populated
}

/**
 * Wrapper for boneyard-js Skeleton.
 * In development, run `npx boneyard-js build` to automatically capture
 * the exact pixel dimensions of the children when loading is false.
 */
export function AppSkeleton({ name, loading, children }: SkeletonProps) {
  // Safe rendering to prevent boneyard-js from crashing the app
  try {
    if (loading) {
      return (
        <div className="skeleton-base w-full h-full min-h-[100px] animate-pulse rounded-2xl bg-zinc-800/50" />
      );
    }
    return <>{children}</>;
  } catch (error) {
    console.error(`Skeleton error [${name}]:`, error);
    return <>{children}</>;
  }
}
