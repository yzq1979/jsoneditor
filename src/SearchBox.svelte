<script>
  import { debounce } from 'lodash'
  import Icon from 'svelte-awesome'
  import { faSearch, faChevronDown, faChevronUp, faTimes } from '@fortawesome/free-solid-svg-icons'
  import { keyComboFromEvent } from './utils/keyBindings.js'

  const DEBOUNCE_DELAY = 300 // milliseconds TODO: make the debounce delay configurable?

  export let text = ''
  export let onChange = () => {}
  export let onClose = () => {}

  let activeResultIndex = 0
  let resultCount = 0

  $: onChangeDebounced = debounce(onChange, DEBOUNCE_DELAY)

  function handleSubmit (event) {
    event.preventDefault()

    onChangeDebounced.cancel()
    onChange(text)
  }

  function handleInput (event) {
    text = event.target.value

    onChangeDebounced(text)
    // TODO: fire debounced onChange
  }

  function handleClose () {
    onChange('')
    onClose()
  }

  function handleKeyDown (event) {
    const combo = keyComboFromEvent(event)
    if (combo === 'Ctrl+Enter' || combo === 'Command+Enter') {
      event.preventDefault()
      // this.props.onFocusActive() // FIXME
    }

    if (combo === 'Escape') {
      event.preventDefault()

      handleClose()
    }
  }

  function initSearchInput (element) {
    element.select()
  }
</script>

<div class="search-box">
  <form class="search-form" on:submit={handleSubmit} on:keydown={handleKeyDown}>
    <button class="search-icon">
      <Icon data={faSearch} />
    </button>
    <label about="search input">
      <input
        class="search-input"
        type="text"
        value={text}
        on:input={handleInput}
        use:initSearchInput
      />
    </label>
    <div class="search-count" class:visible={text !== ''}>
      {activeResultIndex}/{resultCount}
    </div>
    <button class="search-icon search-next">
      <Icon data={faChevronDown} />
    </button>
    <button class="search-icon search-previous">
      <Icon data={faChevronUp} />
    </button>
    <button class="search-icon search-clear" on:click={handleClose}>
      <Icon data={faTimes} />
    </button>
  </form>
</div>

<style src="SearchBox.scss"></style>
