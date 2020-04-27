<script>
  import Icon from 'svelte-awesome'
  import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons'
  import { SEARCH_PROPERTY, SEARCH_VALUE } from './search'
  import classnames from 'classnames'
  import { isUrl, valueType } from './utils/typeUtils'
  import { escapeHTML } from './utils/stringUtils.js'
  import { createUpdateProps } from './utils/updateProps.js'

  export let key = 'root'
  export let value
  export let searchResult
  export let onChangeKey
  export let onChangeValue
  export let expanded = true

  const DEFAULT_LIMIT = 10000
  const escapeUnicode = false // TODO: pass via options

  // create lazy, memoized updateProps function
  let updateProps = function lazyUpdateProps (value) {
    updateProps = createUpdateProps()
    return updateProps(value)
  }

  let limit = DEFAULT_LIMIT

  $: type = valueType (value)

  $: props = type === 'object'
    ? updateProps(value)
    : undefined

  $: limited = type === 'array' && value.length > limit

  $: items = type === 'array'
    ? limited ? value.slice(0, limit) : value
    : undefined

  $: escapedKey = escapeHTML(key, escapeUnicode)
  $: escapedValue = escapeHTML(value, escapeUnicode)

  $: valueClass = classnames('value', type, {
    url: isUrl(value),
    empty: escapedValue.length === 0,
    search: searchResult
      ? !!searchResult[SEARCH_VALUE]
      : false
  })

  function toggle () {
    expanded = !expanded
  }

  function handleKeyInput (event) {
    const newKey = event.target.innerText
    onChangeKey(newKey, key)
  }

  function handleValueInput (event) {
    const value = event.target.innerText
    onChangeValue(value, key)
  }

  function handleChangeKey (newChildKey, oldChildKey) {
    if (type === 'object') {
      const updatedValue = {}
      Object.keys(value).forEach(childKey => {
        if (childKey === oldChildKey) {
          updatedValue[newChildKey] = value[childKey]
        } else {
          updatedValue[childKey] = value[childKey]
        }
      })

      const index = props.findIndex(item => item.key === oldChildKey)
      if (index !== -1) {
        // FIXME: make immutable (not possible as long as prevProps is stored in updateProps
        props[index].key = newChildKey
      }

      onChangeValue(updatedValue, key)
    }
  }

  function handleChangeValue (childValue, childKey) {
    // FIXME: use an immutability setIn function here
    if (type === 'array') {
      const updatedValue = [...value]
      updatedValue[childKey] = childValue
      onChangeValue(updatedValue, key)
    } else if (type === 'object') {
      const updatedValue = { ...value }
      updatedValue[childKey] = childValue
      onChangeValue(updatedValue, key)
    }
  }

  function handleShowAll () {
    limit = Infinity
  }
</script>

<style type="text/scss">
  @import './styles.scss';

  .json-node {
    font-family: $font-family;
    font-size: $font-size;
    color: $black;
    line-height: $line-height;
  }

  .expand {
    position: relative;
    width: $line-height;
    height: $line-height;
    padding: 0;
    margin: 0;
    border: none;
    cursor: pointer;
    background: transparent;
    color: $gray-icon;
    font-size: $font-size-icon;
  }

  .key,
  .value {
    min-width: 16px;
    word-break: normal;
    padding: 0 $input-padding;
    outline: none;

    border-radius: 1px;
    // flex: 1 1 auto !important;
    display: inline; // FIXME: use flex?

    &:focus {
      box-shadow: 0 0 3px 1px #008fd5;
      z-index: 1;
    }
  }

  // FIXME: there is whitespace added around the separator in the HTML
  .separator {
    display: inline;
    color: $gray;
  }

  .items,
  .props {
    padding-left: $indentation-width;
  }
  .value {

    &.string {
      color: #008000;
    }

    &.object,
    &.array {
      min-width: 16px;
      color: $gray;
    }

    &.number {
      color: #ee422e;
    }

    &.boolean {
      color: #ff8c00;
    }

    &.null {
      color: #004ED0;
    }

    &.invalid {
      color: #000000;
    }

    &.url {
      color: green;
      text-decoration: underline;
    }
  }

  div.empty {
    border: 1px dotted lightgray;
    border-radius: 2px;
    padding: 0 $input-padding;
    line-height: 17px;
  }

  div.empty::after,
  div.empty::after {
    pointer-events: none;
    color: lightgray;
    font-size: 8pt;
  }

  div.property.empty::after {
    content: 'key';
  }

  div.value.empty::after {
    content: 'value';
  }

  .key.search,
  .value.search {
    background-color: $highlight-color;
  }
</style>

<div class='json-node'>
  {#if type === 'array' || type === 'object'}
    <button class='expand' on:click={toggle}>
      {#if expanded}
        <Icon data={faCaretDown} />
      {:else}
        <Icon data={faCaretRight} />
      {/if}
    </button>
  {/if}
  {#if typeof key === 'string'}
    <div
      class="key {searchResult && searchResult[SEARCH_PROPERTY] ? 'search' : ''}"
      contenteditable="true"
      on:input={handleKeyInput}
    >
      {escapedKey}
    </div>
    <span class="separator">:</span>
  {/if}
  {#if type === 'array'}
    {#if expanded}
      <div class="items">
        {#each items as item, index (index)}
          <svelte:self
            key={index}
            value={item}
            searchResult={searchResult ? searchResult[index] : undefined}
            onChangeKey={handleChangeKey}
            onChangeValue={handleChangeValue}
          />
        {/each}
        {#if limited}
          <div>
            (showing {limit} of {value.length} items <button on:click={handleShowAll}>show all</button>)
          </div>
        {/if}
      </div>
    {/if}
  {:else if type === 'object'}
    {#if expanded}
      <div class="props">
        {#each props as prop (prop.id)}
          <svelte:self
            key={prop.key}
            value={value[prop.key]}
            searchResult={searchResult ? searchResult[prop.key] : undefined}
            onChangeKey={handleChangeKey}
            onChangeValue={handleChangeValue}
          />
        {/each}
      </div>
    {/if}
  {:else}
    <div
      class={valueClass}
      contenteditable="true"
      on:input={handleValueInput}
    >
      {escapedValue}
    </div>
  {/if}
</div>