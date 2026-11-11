import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {projectId, dataset} from './project.js'
import {schemaTypes} from './schemas/index.js'
import {structure} from './structure.js'

export default defineConfig({
  name: 'zawadi-london',
  title: 'Zawadi London',
  projectId,
  dataset,
  plugins: [structureTool({structure}), visionTool()],
  schema: {types: schemaTypes},
})
