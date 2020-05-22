<script>
  import SearchBox from './SearchBox.svelte'
  import Icon from 'svelte-awesome'
  import { faSearch, faUndo, faRedo } from '@fortawesome/free-solid-svg-icons'
  import { createHistory } from './history.js'
  import Node from './JSONNode.svelte'
  import { keyComboFromEvent } from './utils/keyBindings.js'
  import { search } from './utils/search.js'
  import { immutableJSONPatch } from './utils/immutableJSONPatch'

  export let json = {}
  export let onChangeJson = () => {
  }

  let showSearch = true // FIXME: change to false
  let searchText = ''

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

  export function patch(operations) {
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

  function getPath() {
    return []
  }

  function doSearch(json, searchText) {
    console.time('search')
    const result = search(null, json, searchText)
    console.timeEnd('search')
    return result
  }

  $: searchResult = searchText ? doSearch(json, searchText) : undefined

  function handleChangeKey(key, oldKey) {
    // console.log('handleChangeKey', { key, oldKey })
    // TODO: this should not happen?
  }

  function emitOnChange() {
    // TODO: add more logic here to emit onChange, onChangeJson, onChangeText, etc.
    onChangeJson(json)
  }

  /**
   * @param {JSONPatchDocument} operations
   */
  function handlePatch(operations) {
    // console.log('handlePatch', operations)

    patch(operations)

    emitOnChange()
  }

  function handleToggleSearch() {
    showSearch = !showSearch
  }

  function handleUndo() {
    if (history.getState().canUndo) {
      const item = history.undo()
      if (item) {
        json = immutableJSONPatch(json, item.undo).json
        emitOnChange()
      }
    }
  }

  function handleRedo() {
    if (history.getState().canRedo) {
      const item = history.redo()
      if (item) {
        json = immutableJSONPatch(json, item.redo).json
        emitOnChange()
      }
    }
  }

  function handleKeyDown (event) {
    const combo = keyComboFromEvent(event)

    if (combo === 'Ctrl+F' || combo === 'Command+F') {
      event.preventDefault()
      showSearch = true
    }

    if (combo === 'Ctrl+Z' || combo === 'Command+Z') {
      event.preventDefault()

      // TODO: find a better way to restore focus
      const activeElement = document.activeElement
      if (activeElement && activeElement.blur && activeElement.focus) {
        activeElement.blur()
        setTimeout(() => {
          handleUndo()
          setTimeout(() => activeElement.focus())
        })
      } else {
        handleUndo()
      }
    }

    if (combo === 'Ctrl+Shift+Z' || combo === 'Command+Shift+Z') {
      event.preventDefault()

      // TODO: find a better way to restore focus
      const activeElement = document.activeElement
      if (activeElement && activeElement.blur && activeElement.focus) {
        activeElement.blur()
        setTimeout(() => {
          handleRedo()
          setTimeout(() => activeElement.focus())
        })
      } else {
        handleRedo()
      }
    }
  }
</script>

<div class="jsoneditor" on:keydown={handleKeyDown}>
  <div class="menu">
    <button
      class="button search"
      on:click={handleToggleSearch}
      title="Search (Ctrl+F)"
    >
      <Icon data={faSearch} />
    </button>
    <div class="separator"></div>
    <button
      class="button undo"
      disabled={!historyState.canUndo}
      on:click={handleUndo}
      title="Undo (Ctrl+Z)"
    >
      <Icon data={faUndo} />
    </button>
    <button
      class="button redo"
      disabled={!historyState.canRedo}
      on:click={handleRedo}
      title="Redo (Ctrl+Shift+Z)"
    >
      <Icon data={faRedo} />
    </button>
    <div class="space"></div>
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
    {#if showSearch}
      <div class="search">
        <SearchBox
          text={searchText}
          onChange={text => searchText = text}
          onClose={() => showSearch = false}
        />
      </div>
    {/if}
  </div>
</div>

<style src="JSONEditor.scss"></style>
