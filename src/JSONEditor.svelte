<script>
  import Icon from 'svelte-awesome'
  import { faSearch  } from '@fortawesome/free-solid-svg-icons'
  import Node from './JSONNode.svelte'
  import { search } from './search'
  import { immutableJSONPatch } from './utils/immutableJSONPatch'

  export let json = {}
  export let onChangeJson = () => {}
  export let searchText = ''

  export function get() {
    return json
  }

  export function set(newJson) {
    json = newJson
  }

  function getPath () {
    return []
  }

  function doSearch (json, searchText) {
    console.time('search')
    const result = search(null, json, searchText)
    console.timeEnd('search')
    return result
  }

  $: searchResult = searchText ? doSearch(json, searchText) : undefined

  $: onChangeJson(json)

  function handleChangeKey (key, oldKey) {
    // console.log('handleChangeKey', { key, oldKey })
    // TODO: this should not happen?
  }

  function handleChangeValue (value, key) {
    // console.log('handleChangeValue', value, key)
    // json = value
  }

  /**
   * @param {JSONPatchDocument} operations
   */
  function handleChange (operations) {
    // console.log('handleChange', operations)

    // TODO: store changes in history
    json = immutableJSONPatch(json, operations).json
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
      onChange={handleChange}
      getParentPath={getPath}
    />
    <div class='bottom'></div>
  </div>
</div>

<style src="JSONEditor.scss"></style>
