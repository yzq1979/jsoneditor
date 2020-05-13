<script>
  import { getPlainText, setPlainText } from './utils/domUtils.js'
  import Icon from 'svelte-awesome'
  import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons'
  import { SEARCH_PROPERTY, SEARCH_VALUE } from './search'
  import classnames from 'classnames'
  import debounce from 'lodash/debounce'
  import { isUrl, stringConvert, valueType } from './utils/typeUtils'
  import { updateProps } from './utils/updateProps.js'
  import { compileJSONPointer } from './utils/jsonPointer'

  export let key = undefined // only applicable for object properties
  export let value
  export let searchResult
  export let onChange
  export let onChangeKey
  export let expanded = false

  export let getParentPath

  function getPath () {
    return key !== undefined
      ? getParentPath().concat(key)
      : []
  }

  const DEBOUNCE_DELAY = 300 // milliseconds TODO: make the debounce delay configurable?
  const DEFAULT_LIMIT = 100
  const escapeUnicode = false // TODO: pass via options

  let limit = DEFAULT_LIMIT

  let domKey 
  let domValue

  $: type = valueType (value)

  let prevValue = undefined
  let props = undefined

  $: if (value !== prevValue) {
    prevValue = value

    props = updateProps(value, props)
  }

  $: limited = type === 'array' && value.length > limit

  $: items = type === 'array'
    ? limited ? value.slice(0, limit) : value
    : undefined

  $: valueIsUrl = isUrl(value)

  let keyClass
  $: keyClass = getKeyClass(key, searchResult)

  let valueClass
  $: valueClass = getValueClass(value, searchResult)

  $: if (domKey) {
    if (document.activeElement !== domKey) {
      // synchronize the innerText of the editable div with the escaped value,
      // but only when the domValue does not have focus else we will ruin 
      // the cursor position.
      setPlainText(domKey, key)
    }
  }

  $: if (domValue) {
    if (document.activeElement !== domValue) {
      // synchronize the innerText of the editable div with the escaped value,
      // but only when the domValue does not have focus else we will ruin 
      // the cursor position.
      setPlainText(domValue, value)
    }
  }

  function getValueClass (value, searchResult) {
    const type = valueType (value)

    return classnames('value', type, {
      url: isUrl(value),
      empty: typeof value === 'string' && value.length === 0,
      search: searchResult
        ? !!searchResult[SEARCH_VALUE]
        : false
    })
  }

  function getKeyClass(key, searchResult) {
    return classnames('key', {
      empty: key === '',
      search: searchResult
        ? !!searchResult[SEARCH_PROPERTY]
        : false
    })
  }

  function toggle () {
    expanded = !expanded
  }

  function updateKey () {
    const newKey = getPlainText(domKey)
  
    // TODO: replace the onChangeKey callback with gobally managed JSONNode id's, 
    //  which are kept in sync with the json itself using JSONPatch
    onChangeKey(newKey, key)

    const parentPath = getParentPath()
    onChange([{
      op: 'move',
      from: compileJSONPointer(parentPath.concat(key)),
      path: compileJSONPointer(parentPath.concat(newKey))
    }])
  }
  const updateKeyDebounced = debounce(updateKey, DEBOUNCE_DELAY)

  function handleKeyInput (event) {
    const newKey = getPlainText(event.target)
    keyClass = getKeyClass(newKey, searchResult)
    if (newKey === '') {
      // immediately update to cleanup any left over <br/>
      setPlainText(domKey, '')
    }

    // fire a change event only after a delay
    updateKeyDebounced()
  }

  function handleKeyBlur (event) {
    // handle any pending changes still waiting in the debounce function
    updateKeyDebounced.flush()

    // make sure differences in escaped text like with new lines is updated
    setPlainText(domKey, key)
  }

  // get the value from the DOM
  function getValue () {
    const valueText = getPlainText(domValue)
    return stringConvert(valueText) // TODO: implement support for type "string"
  }

  function updateValue () {
    const newValue = getValue()

    onChange([{
      op: 'replace',
      path: compileJSONPointer(getPath()),
      value: newValue
    }])
  }
  const debouncedUpdateValue = debounce(updateValue, DEBOUNCE_DELAY)

  function handleValueInput () {
    // do not await the debounced update to apply styles
    const newValue = getValue()
    valueClass = getValueClass(newValue, searchResult)
    if (newValue === '') {
      // immediately update to cleanup any left over <br/>
      setPlainText(domValue, '')
    }

    // fire a change event only after a delay
    debouncedUpdateValue()
  }

  function handleValueBlur (event) {
    // handle any pending changes still waiting in the debounce function
    debouncedUpdateValue.flush()

    // make sure differences in escaped text like with new lines is updated
    setPlainText(domValue, value)
  }

  function handleValueClick (event) {
    if (valueIsUrl && event.ctrlKey) {
      event.preventDefault()
      event.stopPropagation()

      window.open(value, '_blank')
    }
  }

  function handleValueKeyDown (event) {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()

      window.open(value, '_blank')
    }
  }

  function handleChangeKey (newChildKey, oldChildKey) {
    if (type === 'object') {
      const index = props.findIndex(item => item.key === oldChildKey)
      if (index !== -1) {
        // we use splice here to replace the old key with the new new one 
        // already without Svelte noticing it (no assignment), so we prevent
        // a needless render. We keep the same id, so the child HTML will be
        // reused
        // TODO: is there a better way to do this?
        props.splice(index, 1, {
          id: props[index].id,
          key: newChildKey
        })
      }
    }
  }

  function handleShowAll () {
    limit = Infinity
  }
</script>

<div class='json-node'>
  {#if type === 'array'}
    <div class='header'>
      <button class='expand' on:click={toggle}>
        {#if expanded}
          <Icon data={faCaretDown} />
        {:else}
          <Icon data={faCaretRight} />
        {/if}
      </button>
      {#if typeof key === 'string'}
        <div
          class={keyClass}
          contenteditable="true"
          spellcheck="false"
          on:input={handleKeyInput}
          on:blur={handleKeyBlur}
          bind:this={domKey}
        ></div>
        <div class="separator">:</div>
      {/if}
      {#if expanded}
        <div class="delimiter">[</div>
      {:else}
        <div class="delimiter">[</div>
        <button class="tag" on:click={() => expanded = true}>{value.length} items</button>
        <div class="delimiter">]</div>
      {/if}
    </div>
    {#if expanded}
      <div class="items">
        {#each items as item, index (index)}
          <svelte:self
            key={index}
            value={item}
            searchResult={searchResult ? searchResult[index] : undefined}
            onChangeKey={handleChangeKey}
            onChange={onChange}
            getParentPath={getPath}
          />
        {/each}
        {#if limited}
          <div>
            (showing {limit} of {value.length} items <button on:click={handleShowAll}>show all</button>)
          </div>
        {/if}
      </div>
      <div class="footer">
        <span class="delimiter">]</span>
      </div>
    {/if}
  {:else if type === 'object'}
    <div class='header'>
      <button class='expand' on:click={toggle}>
        {#if expanded}
          <Icon data={faCaretDown} />
        {:else}
          <Icon data={faCaretRight} />
        {/if}
      </button>
      {#if typeof key === 'string'}
        <div
          class={keyClass}
          contenteditable="true"
          spellcheck="false"
          on:input={handleKeyInput}
          on:blur={handleKeyBlur}
          bind:this={domKey}
        ></div>
        <span class="separator">:</span>
      {/if}
      {#if expanded}
        <span class="delimiter">&#123;</span>
      {:else}
        <span class="delimiter"> &#123;</span>
        <button class="tag" on:click={() => expanded = true}>{props.length} props</button>
        <span class="delimiter">}</span>
      {/if}
    </div>
    {#if expanded}
      <div class="props">
        {#each props as prop (prop.id)}
          <svelte:self
            key={prop.key}
            value={value[prop.key]}
            searchResult={searchResult ? searchResult[prop.key] : undefined}
            onChangeKey={handleChangeKey}
            onChange={onChange}
            getParentPath={getPath}
          />
        {/each}
      </div>
      <div class="footer">
        <span class="delimiter">}</span>
      </div>
    {/if}
  {:else}
    <div class="contents">
      {#if typeof key === 'string'}
        <div
          class={keyClass}
          contenteditable="true"
          spellcheck="false"
          on:input={handleKeyInput}
          on:blur={handleKeyBlur}
          bind:this={domKey}
        ></div>
        <span class="separator">:</span>
      {/if}
      <div
        class={valueClass}
        contenteditable="true"
        spellcheck="false"
        on:input={handleValueInput}
        on:blur={handleValueBlur}
        on:click={handleValueClick}
        on:keydown={handleValueKeyDown}
        bind:this={domValue}
        title={valueIsUrl ? 'Ctrl+Click or Ctrl+Enter to open url in new window' : null}
      ></div>
    </div>
  {/if}
</div>

<style src="JSONNode.scss"></style>
