import { defineCliConfig } from 'sanity/cli'

// Lets the Sanity CLI (e.g. `sanity dataset export`) know which project/dataset
// to target. Project id is public, so a hardcoded fallback is fine.
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'REPLACE_WITH_PROJECT_ID',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  },
})
