// One-time setup: run `npm run setup` inside the studio folder.
// It logs you in, allows the website to read from Sanity, imports the
// starter products and photos, and publishes the Studio online.
import {spawnSync} from 'node:child_process'
import {projectId} from './project.js'

const SITE_ORIGINS = ['https://zawadildn.pages.dev', 'http://localhost:8000']

function run(label, args, {optional = false} = {}) {
  console.log(`\n→ ${label}`)
  const r = spawnSync('npx', ['sanity', ...args], {stdio: 'inherit', shell: process.platform === 'win32'})
  if (r.status !== 0 && !optional) {
    console.error(`\n✗ "${label}" didn't finish. Fix the message above and run npm run setup again.`)
    process.exit(1)
  }
}

if (projectId === 'missing-project-id') {
  console.error(
    '\nFirst add your Sanity project ID to public/content/sanity.json, e.g.\n' +
      '  { "projectId": "abc123xy", "dataset": "production" }\n' +
      'Find it at https://www.sanity.io/manage after creating a free project.\n',
  )
  process.exit(1)
}

console.log(`Setting up Zawadi London on Sanity project ${projectId}`)
run('Logging in to Sanity (a browser window opens)', ['login'])
for (const origin of SITE_ORIGINS) {
  // "optional" so re-running is fine when the origin already exists
  run(`Allowing ${origin} to read products`, ['cors', 'add', origin, '--no-credentials'], {optional: true})
}
spawnSync('node', ['seed/make-seed.mjs'], {stdio: 'inherit'})
run('Importing the starter products and photos', ['dataset', 'import', 'seed/products.ndjson', '--dataset', 'production', '--missing'])
run('Publishing the Studio to https://zawadilondon.sanity.studio', ['deploy', '-y'])

console.log(
  '\n✓ All done.\n' +
    '  Edit products: https://zawadilondon.sanity.studio\n' +
    '  The website picks up changes within a minute of you clicking Publish.\n',
)
