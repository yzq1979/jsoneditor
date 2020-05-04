<script>
	import Icon from 'svelte-awesome'
	import { faSearch  } from '@fortawesome/free-solid-svg-icons'
	import Node from './JSONNode.svelte'
	import { search } from './search'
	import { beforeUpdate, afterUpdate } from 'svelte'

	export let json = {}
	export let onChange = () => {}
	export let searchText = ''

	export function get() {
		return json
	}

	export function set(newJson) {
		json = newJson
	}

	beforeUpdate(() => console.time('render JSONEditor'))
	afterUpdate(() => console.timeEnd('render JSONEditor'))

	function doSearch (json, searchText) {
		console.time('search')
		const result = search(null, json, searchText)
		console.timeEnd('search')
		return result
	}

	$: searchResult = searchText ? doSearch(json, searchText) : undefined

	$: onChange(json)

	function handleChangeKey (key, oldKey) {
		// console.log('handleChangeKey', { key, oldKey })
		// TODO: this should not happen?
	}

	function handleChangeValue (value, key) {
		// console.log('handleChangeValue', value, key)
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
</script>

<div class="jsoneditor">
	<div class="menu">
		<Icon data={faSearch} /> Search: <input class="search-input" bind:value={searchText} />
	</div>
  <div class="contents">
    <Node
      value={json}
      searchResult={searchResult}
      expanded={true}
      onChangeKey={handleChangeKey}
      onChangeValue={handleChangeValue}
    />
  </div>
</div>

<style type="text/scss">
	@import './styles.scss';

	.jsoneditor {
		border: 1px solid gray;
		width: 100%;
		height: 100%;
    min-height: 150px;
    display: flex;
    flex-direction: column;

		.menu {
      font-family: $font-family-menu;
      font-size: $font-size;
			padding: $menu-padding;
			background: $theme-color;
      color: $white;
      text-align: right;
      
      .search-input {
        border: none;
        font-family: $font-family-menu;
        font-size: $font-size;
        padding: $input-padding;
      }
    }
    
    .contents {
      flex: 1;
      overflow: auto;
    }
	}
</style>
