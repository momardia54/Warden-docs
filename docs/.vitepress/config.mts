import { defineConfig } from "vitepress"
import { version } from "./version.json"

export default defineConfig({
  title: "Warden",
  description: "Self-hosted licence manager on Cloudflare Workers, D1 and R2: licence keys, check URLs, releases and updates.",
  lang: "en-GB",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }],
    ["meta", { name: "theme-color", content: "#2a78d6" }],
  ],
  markdown: { theme: { light: "github-light", dark: "github-dark" } },
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "Guide", link: "/getting-started", activeMatch: "^/(getting-started|introduction|deployment|configuration|upgrading|local-development|guide/)" },
      { text: "API", link: "/reference/api", activeMatch: "^/reference/" },
      {
        text: `v${version}`,
        items: [
          { text: "Changelog", link: "/project/changelog" },
          { text: "Roadmap and versioning", link: "/project/roadmap" },
        ],
      },
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "What is Warden", link: "/introduction" },
          { text: "Getting started", link: "/getting-started" },
        ],
      },
      {
        text: "Running Warden",
        items: [
          { text: "Deployment", link: "/deployment" },
          { text: "Configuration", link: "/configuration" },
          { text: "Upgrading", link: "/upgrading" },
          { text: "Local development", link: "/local-development" },
        ],
      },
      {
        text: "Guides",
        items: [
          { text: "Checking a licence from a site", link: "/guide/checking" },
          { text: "Apps and site limits", link: "/guide/apps" },
          { text: "Statuses", link: "/guide/statuses" },
          { text: "Files and release rules", link: "/guide/files" },
          { text: "Releases and updates", link: "/guide/releases" },
          { text: "Publishing from GitHub", link: "/guide/repositories" },
          { text: "Protection", link: "/guide/protection" },
          { text: "Analytics", link: "/guide/analytics" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "REST API", link: "/reference/api" },
          { text: "Architecture", link: "/reference/architecture" },
        ],
      },
      {
        text: "Project",
        items: [
          { text: "Security", link: "/project/security" },
          { text: "Roadmap and versioning", link: "/project/roadmap" },
          { text: "Changelog", link: "/project/changelog" },
          { text: "Licence", link: "/project/licence" },
        ],
      },
    ],
    search: { provider: "local" },
    outline: { level: [2, 3], label: "On this page" },
    socialLinks: [{ icon: "github", link: "https://github.com/momardia54/Warden" }],
    editLink: {
      pattern: ({ filePath }) => {
        // VitePress sends this function to the browser as source, so the map of synced pages lives inside it:
        // pages copied from the Warden repository by scripts/sync.mjs are edited there.
        const synced: Record<string, string> = {
          "guide/checking.md": "docs/checking.md",
          "guide/apps.md": "docs/apps.md",
          "guide/statuses.md": "docs/statuses.md",
          "guide/files.md": "docs/files.md",
          "guide/releases.md": "docs/releases.md",
          "guide/repositories.md": "docs/repositories.md",
          "guide/protection.md": "docs/protection.md",
          "guide/analytics.md": "docs/analytics.md",
          "reference/api.md": "docs/api.md",
          "project/security.md": "Security.md",
          "project/roadmap.md": "Roadmap.md",
          "project/changelog.md": "CHANGELOG.md",
          "project/licence.md": "Licence.md",
        }
        return synced[filePath]
          ? `https://github.com/momardia54/Warden/edit/develop/${synced[filePath]}`
          : `https://github.com/momardia54/Warden-docs/edit/main/docs/${filePath}`
      },
      text: "Edit this page on GitHub",
    },
    footer: {
      message: "Released under the MIT licence. Warden is pre-1.0: the API can change between 0.x versions.",
      copyright: "Copyright Bohdan Petryshyn and momardia54",
    },
  },
})
