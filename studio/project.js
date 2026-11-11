// The Sanity project ID lives in ONE place: public/content/sanity.json.
// The website and this Studio both read it.
import config from '../public/content/sanity.json' with {type: 'json'}

export const projectId = config.projectId || 'missing-project-id'
export const dataset = config.dataset || 'production'
