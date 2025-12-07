//components/seo-page-wrapper/seo-page-wrapper.tsx

import type React from "react"
import { AnimatedAIButton } from "@/components/animated-ai-button"
import { type BlockquoteConfig, BlockquoteSection } from "./(_components)/blockquote-section"
import {
  type BreadcrumbItemType,
  BreadcrumbsNavigation,
} from "./(_components)/breadcrumbs-navigation"
import { type FAQItem, FAQSection } from "./(_components)/faq-section"
import { type HeroConfig, HeroSection } from "./(_components)/hero-section"
import { type BadgeItemType, TechBadges } from "./(_components)/tech-badges"
import { type TopFeatureItem, TopFeaturesSection } from "./(_components)/top-features-section"

// Configuration type for SEO Page Wrapper
export type PageWrapperConfig = {
  // Spacing configuration
  topSpacing?: number

  variant: "landing" | "blog" | "feature"

  // Navigation
  breadcrumbs: BreadcrumbItemType[]

  // Badges/Pills
  badges?: BadgeItemType[]
  showBadges?: boolean

  // Hero section
  hero?: HeroConfig
  showHero?: boolean

  // Blockquote section
  blockquote?: BlockquoteConfig
  showBlockquote?: boolean

  // Top Features: ТОЛЬКО массив карточек
  topFeatures?: TopFeatureItem[]
  showTopFeatures?: boolean

  // FAQ
  faqs?: FAQItem[]
  showFaq?: boolean
  faqTitle?: string
}

interface SeoPageWrapperProps {
  config: PageWrapperConfig
  children: React.ReactNode
}

export function SeoPageWrapper({ config, children }: SeoPageWrapperProps) {
  const {
    topSpacing = 80,
    breadcrumbs,
    badges = [],
    showBadges = true,
    hero,
    showHero = true,
    blockquote,
    showBlockquote = true,
    variant,
    // Top Features
    topFeatures,
    showTopFeatures = Boolean(topFeatures),

    // FAQ
    faqs = [],
    showFaq = true,
    faqTitle,
  } = config

  return (
    <div className="min-h-screen">
      {/* Top Spacing */}
      <div style={{ height: `${topSpacing}px` }} />

      {/* Breadcrumb Navigation */}
      <BreadcrumbsNavigation items={breadcrumbs} />

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        {/* Technology Badges/Pills */}
        <TechBadges badges={badges} show={showBadges} />

        {/* Hero Section */}
        {hero && <HeroSection config={hero} show={showHero} variant={variant} />}

        {/* Top Features Section */}
        {topFeatures && <TopFeaturesSection config={topFeatures} show={showTopFeatures} />}

        {/* Blockquote Section */}
        {blockquote && <BlockquoteSection config={blockquote} show={showBlockquote} />}

        <AnimatedAIButton />

        {/* Page Content (children) */}
        <section className="mb-12">{children}</section>

        {/* FAQ Section */}
        <FAQSection faqs={faqs} show={showFaq} title={faqTitle} />
      </main>
    </div>
  )
}

// Re-export types for convenience
export type { BreadcrumbItemType, BadgeItemType, HeroConfig, FAQItem }
