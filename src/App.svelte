<script>
	import Icon from 'svelte-awesome'
	import { faSearch  } from '@fortawesome/free-solid-svg-icons'
	import Node from './JSONNode.svelte'
	import { search } from './search'
	import { beforeUpdate, afterUpdate } from 'svelte'

	export let searchText = ''

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
			},
		}],
		'boolean': true,
		'color': '#82b92c',
		'null': null,
		'number': 123,
		'object': {'a': 'b', 'c': 'd', nested: {
			name: 'Item ' + 2,
			id: String(2),
			index: 2,
			time: new Date().toISOString(),
			location: {
				latitude: 1.23,
				longitude: 23.44,
				coordinates: [23.44, 1.23]
			},
		}},
		'string': 'Hello World'
	}

	let uniDirectionalValue = 'test uni directional flow in Svelte';
	
	console.time('load editor')

	beforeUpdate(() => console.time('render app'))
	afterUpdate(() => console.timeEnd('render app'))

	// console.log('search results "d"', search(null, json, 'd'))
	// console.log('search results "e"', search(null, json, 'e'))
	// console.log('search results "2"', search(null, json, '2'))

	function doSearch (json, searchText) {
		console.time('search')
		const result = search(null, json, searchText)
		console.timeEnd('search')
		return result
	}

	$: searchResult = searchText ? doSearch(json, searchText) : undefined

	$: formattedName = `"${name}"`

	$: console.log('json.number', json.number)

	function loadLargeJson () {
		const count = 500

		console.log('create large json', { count })
		console.time('create large json')
		const largeJson = {
		}
		largeJson.numbers = []
		largeJson.array = []
		for (let i = 0; i < count; i++) {
			const longitude = 4 + i / count;
			const latitude = 51 + i / count;

			largeJson.numbers.push(i);
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

	function handleChangeKey (key, oldKey) {
		console.log('App handleChangeKey', { key, oldKey })
		// TODO: this should not happen?
	}

	function handleChangeValue (value, key) {
		console.log('App handleChangeValue')
		json = value
	}

	function handleInputTextArea (event) {
		console.log('on:input')
		try {
			json = JSON.parse(event.target.value)
		} catch (err) {
			console.error(err)
		}
	}

	function handleLoadLargeJson () {
		json = loadLargeJson()
	}

	function handleClearJson () {
		json = {}
	}

	setTimeout(() => {
		console.timeEnd('load editor') 
		console.log('loaded' )
	})

	function handleInputUniDirectional (event) {
		console.log('change', event.target.value)
		uniDirectionalValue = event.target.value
	}

	let inputTestValue = 'input test'
	function onChangeInputTest (value) {
		inputTestValue = value
	}
</script>

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
		width: 500px;
		height: 500px;
		overflow: auto;
		border: 1px solid lightgray;
	}
</style>

<p>
	<Icon data={faSearch} /> Search: <input bind:value={searchText} />
</p>

<div class="editor">
	<Node
			value={json}
			searchResult={searchResult}
			expanded={true}
			onChangeValue={handleChangeValue}
	/>
</div>

<!-- <textarea 
	class='code' 
	value={JSON.stringify(json, null, 2)}
	on:input={handleInputTextArea}
/> -->

<p>
	<button on:click={handleLoadLargeJson}>load large json</button>
	<button on:click={handleClearJson}>clear json</button>
</p>

<!-- <pre>
	<code>
		{JSON.stringify(json, null, 2)}
	</code>
</pre> -->
