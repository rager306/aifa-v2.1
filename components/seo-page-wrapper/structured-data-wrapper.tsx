//components/seo-page-wrapper/structured-data-wrapper.tsx

"use client"

type Props = {
  data: Record<string, unknown>
}

export function StructuredDataWrapper({ data }: Props) {
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for JSON-LD structured data injection
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  )
}
