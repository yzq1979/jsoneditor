<script>
  import JSONEditor from './JSONEditor.svelte'
  import { beforeUpdate, afterUpdate } from 'svelte'

  let json = {
    'array': [1, 2, 3, {
      name: 'Item ' + 2,
      id: String(2),
      index: 2,
      time: new Date().toISOString(),
      location: {
        latitude: 1.23,
        longitude: 23.44,
        coordinates: [23.44, 1.23]
      }
    }],
    'boolean': true,
    'color': '#82b92c',
    'null': null,
    'number': 123,
    'object': {
      'a': 'b', 'c': 'd', nested: {
        name: 'Item ' + 2,
        id: String(2),
        index: 2,
        time: new Date().toISOString(),
        location: {
          latitude: 1.23,
          longitude: 23.44,
          coordinates: [23.44, 1.23]
        }
      }
    },
    '': '',
    'string': 'Hello World',
    'url': 'https://jsoneditoronline.org',
    'Lorem Ipsum': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  }

  export function get() {
    return json
  }

  export function set(newJson) {
    json = newJson
  }

  console.time('load editor')

  beforeUpdate(() => console.time('render app'))
  afterUpdate(() => console.timeEnd('render app'))

  function handleChangeFiles (event) {
    console.log('handleChangeFiles', event.target.files)

    const reader = new FileReader()
    const file = event.target.files[0]
    reader.onload = function (event) {
      const text = event.target.result
      json = JSON.parse(text)
    }
    reader.readAsText(file)
  }

  function loadLargeJson() {
    const count = 500

    console.log('create large json', {count})
    console.time('create large json')
    const largeJson = {}
    largeJson.numbers = []
    largeJson.array = []
    for (let i = 0; i < count; i++) {
      const longitude = 4 + i / count
      const latitude = 51 + i / count

      largeJson.numbers.push(i)
      largeJson.array.push({
        name: 'Item ' + i,
        id: String(i),
        index: i,
        time: new Date().toISOString(),
        location: {
          latitude,
          longitude,
          coordinates: [longitude, latitude]
        },
        random: Math.random()
      })
    }
    console.timeEnd('create large json')

    // const stringifiedSize = JSON.stringify(largeJson).length
    // console.log(`large json stringified size: ${filesize(stringifiedSize)}`)

    return largeJson
  }

  // json = loadLargeJson()

  function handleLoadLargeJson() {
    json = loadLargeJson()
  }

  function handleClearJson() {
    json = {}
  }

  function handleChange (json) {
    // console.log('App handleChange', json)
  }

  setTimeout(() => {
    console.timeEnd('load editor')
    console.log('loaded')
  })
</script>

<div class="editor">
	<JSONEditor
    bind:json={json}
    onChange={handleChange}
  />
</div>

<p>
	<button on:click={handleLoadLargeJson}>load large json</button>
	<button on:click={handleClearJson}>clear json</button>
  <input type="file" on:change={handleChangeFiles}>
</p>

<style>
	html, body {
		position: relative;
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 0;
	}

	body {
		color: #333;
		margin: 0;
		padding: 8px;
		box-sizing: border-box;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
	}

	h1 {
		color: purple;
	}

	.editor {
		width: 800px;
		height: 500px;
	}
</style>
