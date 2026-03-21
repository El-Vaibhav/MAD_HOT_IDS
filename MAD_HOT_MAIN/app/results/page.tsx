"use client"

import { Suspense } from "react"
import ResultsContent from "./results-content"

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading results...</div>}>
      <ResultsContent />
    </Suspense>
  )
}