import React from 'react'

export const SkeletonCard = () => (
  <div className="glass rounded-2xl p-6 space-y-4">
    <div className="skeleton h-40 w-full rounded-xl" />
    <div className="skeleton h-5 w-3/4" />
    <div className="skeleton h-4 w-1/2" />
    <div className="skeleton h-4 w-5/6" />
    <div className="skeleton h-10 w-1/3 rounded-lg" />
  </div>
)

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 glass rounded-xl">
    <div className="skeleton w-12 h-12 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-3 w-1/3" />
    </div>
    <div className="skeleton h-8 w-20 rounded-lg" />
  </div>
)
