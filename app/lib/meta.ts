import type { MetaDescriptor } from "react-router";

import { site } from "./site";

interface PageMetaOptions {
  /** Path of the page, used for the canonical URL. */
  path: string;
  /** Page title; the home page uses the site title as is. */
  title?: string;
  description?: string;
}

/** Builds title, description, canonical and Open Graph tags for a route's `meta` export. */
export function pageMeta({ path, title, description = site.description }: PageMetaOptions): MetaDescriptor[] {
  const fullTitle = title ? `${title} · ${site.name}` : site.title;
  const url = new URL(path, site.url).toString();
  const image = new URL(site.ogImage.path, site.url).toString(); // crawlers need an absolute URL
  return [
    { title: fullTitle },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: site.name },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: String(site.ogImage.width) },
    { property: "og:image:height", content: String(site.ogImage.height) },
    { property: "og:image:alt", content: site.ogImage.alt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: image },
  ];
}
