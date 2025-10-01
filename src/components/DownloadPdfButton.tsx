"use client";

import { useState } from "react";

type Props = {
  result: unknown;
  disabled?: boolean;
};

export default function DownloadPdfButton({ result, disabled }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!result || disabled) return;

    setIsGenerating(true);
    try {
      // Dynamic import to reduce bundle size
      const { generateStrategyPdf } = await import("@/lib/pdfGenerator");
      await generateStrategyPdf(result);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled || isGenerating}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-sm font-semibold text-white transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:shadow-none"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {isGenerating ? "Generating PDF..." : "Download PDF"}
    </button>
  );
}
