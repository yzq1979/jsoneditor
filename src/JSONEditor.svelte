<script>
  import Icon from 'svelte-awesome'
  import { faSearch, faUndo, faRedo  } from '@fortawesome/free-solid-svg-icons'
  import { createHistory } from './history.js'
  import Node from './JSONNode.svelte'
  import { search } from './search'
  import { immutableJSONPatch } from './utils/immutableJSONPatch'

  export let json = {}
  export let onChangeJson = () => {}
  export let searchText = ''

  const history = createHistory({
    onChange: (state) => {
      historyState = state
    }
  })
  let historyState = history.getState()

  export function get() {
    return json
  }

  export function set(newJson) {
    json = newJson
    history.clear()
  }

  export function patch (operations) {
    console.log('patch', operations)

    const patchResult = immutableJSONPatch(json, operations)

    history.add({
      undo: patchResult.revert,
      redo: operations
    })

    json = patchResult.json

    return {
      json,
      error: patchResult.error,
      undo: patchResult.revert,
      redo: operations
    }
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

  function handleChangeKey (key, oldKey) {
    // console.log('handleChangeKey', { key, oldKey })
    // TODO: this should not happen?
  }

  function emitOnChange () {
    // TODO: add more logic here to emit onChange, onChangeJson, onChangeText, etc.
    onChangeJson(json)
  }

  /**
   * @param {JSONPatchDocument} operations
   */
  function handlePatch (operations) {
    // console.log('handlePatch', operations)

    patch(operations)

    emitOnChange()
  }

  function handleUndo () {
    if (history.getState().canUndo) {
      const item = history.undo()
      if (item) {
        json = immutableJSONPatch(json, item.undo).json
        emitOnChange()
      }
    }
  }

  function handleRedo () {
    if (history.getState().canRedo) {
      const item = history.redo()
      if (item) {
        json = immutableJSONPatch(json, item.redo).json
        emitOnChange()
      }
    }
  }

</script>

<div class="jsoneditor">
  <div class="menu">
    <button class="button undo" disabled={!historyState.canUndo} on:click={handleUndo}>
      <Icon data={faUndo} />
    </button>
    <button class="button redo" disabled={!historyState.canRedo} on:click={handleRedo}>
      <Icon data={faRedo} />
    </button>
    <div class="space"></div>
    <div class="search-box">
      <span class="search-icon"><Icon data={faSearch} /></span> Search: <input class="search-input" bind:value={searchText} />
    </div>
  </div>
  <div class="contents">
    <Node
      value={json}
      searchResult={searchResult}
      expanded={true}
      onChangeKey={handleChangeKey}
      onPatch={handlePatch}
      getParentPath={getPath}
    />
    <div class='bottom'></div>
  </div>
</div>

<style src="JSONEditor.scss"></style>
