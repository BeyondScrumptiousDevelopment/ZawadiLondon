import {defineCliConfig} from 'sanity/cli'
import {projectId, dataset} from './project.js'

export default defineCliConfig({
  api: {projectId, dataset},
  // The Studio is hosted free by Sanity at https://zawadilondon.sanity.studio
  studioHost: 'zawadilondon',
  autoUpdates: true,
})
