import React from 'react';

const shimmerEffect =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer 2s infinite linear before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

const SkeletonBox = ({ className }) => (
  <div className={`${className} rounded-md bg-gray-200 animate-pulse`}></div>
);

export const CardSkeleton = () => (
  <div
    className={`${shimmerEffect} relative overflow-hidden rounded-lg bg-gray-100 p-4 shadow-md`}
  >
    <SkeletonBox className="h-10 w-3/4" />
    <SkeletonBox className="h-6 w-1/2 mt-2" />
  </div>
);

export const TaskListSkeleton = () => (
  <div className={`${shimmerEffect} space-y-4 p-4`}>
    <SkeletonBox className="h-8 w-full" />
    <SkeletonBox className="h-8 w-full" />
    <SkeletonBox className="h-8 w-full" />
  </div>
);

export const ActivityFeedSkeleton = () => (
  <div className={`${shimmerEffect} rounded-lg bg-gray-100 p-4 shadow-md`}>
    <SkeletonBox className="h-10 w-full" />
    <div className="space-y-2 mt-2">
      <SkeletonBox className="h-4 w-3/4" />
      <SkeletonBox className="h-4 w-2/3" />
      <SkeletonBox className="h-4 w-1/2" />
    </div>
  </div>
);

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <CardSkeleton />
      <TaskListSkeleton />
      <ActivityFeedSkeleton />
    </div>
  );
}
