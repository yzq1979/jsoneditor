<script>
  import { EXPANDED_PROPERTY } from './constants.js'
  import SearchBox from './SearchBox.svelte'
  import Icon from 'svelte-awesome'
  import { faSearch, faUndo, faRedo } from '@fortawesome/free-solid-svg-icons'
  import { createHistory } from './history.js'
  import Node from './JSONNode.svelte'
  import { existsIn, setIn } from './utils/immutabilityHelpers.js'
  import { keyComboFromEvent } from './utils/keyBindings.js'
  import { flattenSearch, search } from './utils/search.js'
  import { immutableJSONPatch } from './utils/immutableJSONPatch'
  import { isEqual } from 'lodash'

  export let json = {}
  export let onChangeJson = () => {
  }

  let state = {
    [EXPANDED_PROPERTY]: true
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

  function applyPatch (operations) {
    const patchResult = immutableJSONPatch(json, operations)
    json = patchResult.json

    state = immutableJSONPatch(state, operations).json

    return patchResult
  }

  export function patch(operations) {
    console.log('patch', operations)

    const patchResult = applyPatch(operations)

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

  // TODO: refactor the search solution, it's too complex. Also, move it in a separate component
  let searchResult
  let activeSearchResult = undefined
  let activeSearchResultIndex
  let flatSearchResult
  let searchResultWithActive
  $: searchResult = searchText ? doSearch(json, searchText) : undefined
  $: flatSearchResult = flattenSearch(searchResult)

  $: {
    if (!activeSearchResult || !existsIn(searchResult, activeSearchResult.path.concat(activeSearchResult.what))) {
      activeSearchResult = flatSearchResult[0]
    }
  }

  $: activeSearchResultIndex = flatSearchResult.findIndex(item => isEqual(item, activeSearchResult))
  $: searchResultWithActive = searchResult
      ? activeSearchResult
        ? setIn(searchResult, activeSearchResult.path.concat(activeSearchResult.what), 'search active')
        : searchResult
      : undefined

  function nextSearchResult () {
    activeSearchResult = flatSearchResult[activeSearchResultIndex + 1] || activeSearchResult
  }

  function previousSearchResult () {
    activeSearchResult = flatSearchResult[activeSearchResultIndex - 1] || activeSearchResult
  }

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
        applyPatch(item.undo)
        emitOnChange()
      }
    }
  }

  function handleRedo() {
    if (history.getState().canRedo) {
      const item = history.redo()
      if (item) {
        applyPatch(item.redo)
        emitOnChange()
      }
    }
  }

  /**
   * Toggle expanded state of a node
   * @param {Path} path
   * @param {boolean} expanded
   */
  function handleExpand (path, expanded) {
    state = setIn(state, path.concat(EXPANDED_PROPERTY), expanded)
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
    {#if showSearch}
      <div class="search-box-container">
        <SearchBox
          text={searchText}
          resultCount={flatSearchResult.length}
          activeIndex={activeSearchResultIndex}
          onChange={(text) => searchText = text}
          onNext={nextSearchResult}
          onPrevious={previousSearchResult}
          onClose={() => {
            showSearch = false
            searchText = ''
          }}
        />
      </div>
    {/if}
  </div>
  <div class="contents">
    <Node
      value={json}
      state={state}
      searchResult={searchResultWithActive}
      onChangeKey={handleChangeKey}
      onPatch={handlePatch}
      onExpand={handleExpand}
      getParentPath={getPath}
    />
    <div class='bottom'></div>
  </div>
</div>

<style src="JSONEditor.scss"></style>
