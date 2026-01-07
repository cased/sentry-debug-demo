"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Sentry Test Page</h1>
        <p className="text-gray-600 mb-6">
          Click the button below to throw a test error and verify Sentry is working.
        </p>

        <button
          type="button"
          onClick={() => {
            throw new Error("Sentry Test Error - This is a test!");
          }}
          className="w-full px-4 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors mb-4"
        >
          Throw Test Error
        </button>

        <button
          type="button"
          onClick={() => {
            Sentry.captureMessage("Test message from Sentry Example Page");
            alert("Message sent to Sentry!");
          }}
          className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Send Test Message
        </button>

        <p className="text-sm text-gray-500 mt-6">
          Check your Sentry dashboard to see the error/message appear.
        </p>
      </div>
    </div>
  );
}
