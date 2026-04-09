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
  // If boneyard doesn't find the bone, we can provide a fallback UI,
  // or boneyard natively renders an empty block of equivalent flex layout.
  return (
    // @ts-expect-error boneyard-js types incorrectly expect HTMLCollection for children
    <BoneyardSkeleton name={name} loading={loading}>
      <div className="contents">{children}</div>
    </BoneyardSkeleton>
  );
}
