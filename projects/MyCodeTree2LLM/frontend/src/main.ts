import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')



# frontend/src/App.vue
<template>
  <div class="container">
    <h1>File Concatenation Tool</h1>
    <div>
      <label for="projectPath">Project Path:</label>
      <input id="projectPath" v-model="projectPath" placeholder="Enter project path" />
      <button @click="loadFiles">Load Files</button>
    </div>
    <div v-if="files.length">
      <h2>Available Files</h2>
      <div>
        <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /> Select All
      </div>
      <ul>
        <li v-for="(file, index) in files" :key="index">
          <input type="checkbox" :value="file" v-model="selectedFiles" /> {{ file }}
        </li>
      </ul>
      <div>
        <label>
          <input type="checkbox" v-model="includeTree" />
          Include Folder Tree
        </label>
      </div>
      <button @click="concatenate">Concatenate Files</button>
    </div>
    <div v-if="output">
      <h2>Concatenated Output</h2>
      <pre>{{ output }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import axios from 'axios'

export default defineComponent({
  name: 'App',
  setup() {
    const projectPath = ref('')
    const files = ref<string[]>([])
    const selectedFiles = ref<string[]>([])
    const includeTree = ref(false)
    const output = ref('')
    const selectAll = ref(false)

    const loadFiles = async () => {
      if (!projectPath.value) {
        alert('Please enter a project path.')
        return
      }
      try {
        const response = await axios.get('/api/files', {
          params: { folder: projectPath.value }
        })
        files.value = response.data.files
      } catch (error) {
        console.error(error)
        alert('Failed to load files.')
      }
    }

    const toggleSelectAll = () => {
      if (selectAll.value) {
        selectedFiles.value = [...files.value]
      } else {
        selectedFiles.value = []
      }
    }

    watch(selectedFiles, (newVal) => {
      selectAll.value = newVal.length === files.value.length
    })

    const concatenate = async () => {
      if (!projectPath.value) {
        alert('Project path is required.')
        return
      }
      if (selectedFiles.value.length === 0) {
        alert('Please select at least one file.')
        return
      }
      try {
        const response = await axios.post('/api/concatenate', {
          project_path: projectPath.value,
          selected_files: selectedFiles.value,
          include_tree: includeTree.value
        })
        output.value = response.data.concatenated_content
      } catch (error) {
        console.error(error)
        alert('Failed to concatenate files.')
      }
    }

    return { projectPath, files, selectedFiles, includeTree, output, loadFiles, toggleSelectAll, concatenate, selectAll }
  }
})
</script>

<style scoped>
.container {
  padding: 20px;
  font-family: Arial, sans-serif;
}
h1, h2 {
  margin-bottom: 20px;
}
ul {
  list-style: none;
  padding-left: 0;
}
li {
  margin-bottom: 5px;
}
input[type="text"] {
  margin-right: 10px;
  padding: 5px;
  width: 300px;
}
button {
  padding: 5px 10px;
  margin-top: 10px;
}
pre {
  background-color: #f8f8f8;
  padding: 15px;
  border: 1px solid #ddd;
  white-space: pre-wrap;
}
</style>