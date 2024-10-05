'use client';

import { Suspense } from 'react';

function NotFoundContent() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested page.</p>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
