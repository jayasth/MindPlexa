'use client';

import Button from '@/components/ui/Button';
import router from 'next/router';

export default function LandingPage() {
  return (
    <div className="bg-background text-text">
      <section className="hero">
        <div className="max-w-6xl px-4 py-12 mx-auto sm:py-16 sm:px-6 lg:px-8">
          <div className="sm:text-center">
            <h1 className="text-4xl font-extrabold sm:text-6xl">
              MindPlexa: Navigating Ideas from Conception to Completion
            </h1>
            <p className="max-w-2xl mx-auto mt-4 text-xl text-zinc-300">
              MindPlexa is an AI-powered platform that simplifies the journey
              from idea generation to project execution. It provides a
              customizable workspace where users can develop, organize, and
              collaborate on ideas using intuitive tools and visual aids.
            </p>
            <div className="mt-8 sm:justify-center sm:flex">
              <Button
                variant="slim"
                type="button"
                onClick={() => router.push('/signup')}
                className="block py-3 text-base font-medium text-center text-white rounded-md bg-lavender-600 hover:bg-lavender-700 sm:px-10"
              >
                Get started
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="max-w-6xl px-4 py-12 mx-auto sm:py-16 sm:px-6 lg:px-8">
          <div className="sm:text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Key Features
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-xl text-zinc-300">
              MindPlexa combines a customizable workspace, a canvas for
              organizing and connecting nodes, and integrated AI assistance to
              help users streamline their creative process and boost
              productivity.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 mt-12 sm:grid-cols-2 lg:grid-cols-3">
            {/* Add your feature cards here */}
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="max-w-6xl px-4 py-12 mx-auto sm:py-16 sm:px-6 lg:px-8">
          <div className="sm:text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              What Our Users Say
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 mt-12 sm:grid-cols-2 lg:grid-cols-3">
            {/* Add your testimonial cards here */}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="max-w-6xl px-4 py-12 mx-auto sm:py-16 sm:px-6 lg:px-8">
          <div className="sm:text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Ready to Navigate Your Ideas?
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-xl text-zinc-300">
              Start your journey with MindPlexa today and unlock the full
              potential of your ideas.
            </p>
            <div className="mt-8 sm:justify-center sm:flex">
              <Button
                variant="slim"
                type="button"
                onClick={() => router.push('/signup')}
                className="block py-3 text-base font-medium text-center text-white rounded-md bg-lavender-600 hover:bg-lavender-700 sm:px-10"
              >
                Get started
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
