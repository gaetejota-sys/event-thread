import { useEffect } from 'react'

type JsonLd = Record<string, any> | Record<string, any>[]

interface SeoProps {
  title?: string
  description?: string
  image?: string
  url?: string
  noindex?: boolean
  jsonLd?: JsonLd
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v))
}

export const Seo = ({ title, description, image, url, noindex, jsonLd }: SeoProps) => {
  useEffect(() => {
    if (title) document.title = title
    if (description) upsertMeta('meta[name="description"]', { name: 'description', content: description })
    if (noindex) upsertMeta('meta[name="robots"]', { name: 'robots', content: 'noindex,nofollow' })

    // Open Graph
    if (title) upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    if (description) upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    if (image) upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image })
    if (url) upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })

    // Twitter
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' })
    if (title) upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    if (description) upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    if (image) upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })

    // Canonical
    if (url) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        document.head.appendChild(link)
      }
      link.setAttribute('href', url)
    }

    // JSON-LD
    let scriptEl: HTMLScriptElement | null = null
    if (jsonLd) {
      scriptEl = document.createElement('script')
      scriptEl.type = 'application/ld+json'
      scriptEl.text = JSON.stringify(jsonLd)
      document.head.appendChild(scriptEl)
    }

    return () => {
      if (noindex) {
        const robots = document.head.querySelector('meta[name="robots"]')
        robots?.parentElement?.removeChild(robots)
      }
      if (scriptEl) {
        scriptEl.parentElement?.removeChild(scriptEl)
      }
    }
  }, [title, description, image, url, noindex, jsonLd])

  return null
}

export default Seo


