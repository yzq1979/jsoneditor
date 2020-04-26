<script>
  import { SEARCH_PROPERTY, SEARCH_VALUE } from './search'
  import { getJSONNodeType } from './utils/typeUtils.js'
  import classnames from 'classnames'
  import { isUrl, valueType } from './utils/typeUtils'
  import isEmpty from 'lodash/isEmpty'
  import { escapeHTML } from './utils/stringUtils'

  export let key = 'root'
  export let value
  export let searchResult
  export let onChange
  export let expanded = true

  const DEFAULT_LIMIT = 10000

  let limit = DEFAULT_LIMIT

  $: type = valueType (value)

  $: props = type === 'object'
    ? Object.keys(value).map(key => {
      return { key, value: value[key] }
    })
    : undefined

  $: limited = type === 'array' && value.length > limit

  $: items = type === 'array'
    ? limited ? value.slice(0, limit) : value
    : undefined

  const escapeUnicode = false // TODO: pass via options
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

  function handleInput (event) {
    const value = event.target.innerText
    onChange(value, key)
  }

  function handleChange (childValue, childKey) {
    // FIXME: use an immutability setIn function here
    if (type === 'array') {
      const updatedValue = value.slice(0) // copy the array
      updatedValue[childKey] = childValue
      onChange(updatedValue, key)
    } else if (type === 'object') {
      const updatedValue = {
        ...value,
        [childKey]: childValue
      }
      onChange(updatedValue, key)
    }
  }

  function handleShowAll () {
    limit = Infinity
  }
</script>

<style type="text/scss">
  @import './styles.scss';

  .json-node {
    font-family: $fontFamily;
    font-size: $fontSize;
    color: $black;
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
    <button on:click={toggle}>
      {#if expanded}
        collapse
      {:else}
        expand
      {/if}
    </button>
  {/if}
  {#if typeof key === 'string'}
    <span class="key {searchResult && searchResult[SEARCH_PROPERTY] ? 'search' : ''}">
      {key}
    </span>
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
            onChange={handleChange}
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
        {#each props as prop (prop.key)}
          <svelte:self
            key={prop.key}
            value={prop.value}
            searchResult={searchResult ? searchResult[prop.key] : undefined}
            onChange={handleChange}
          />
        {/each}
      </div>
    {/if}
  {:else}
    <div
      class={valueClass}
      contenteditable="true"
      on:input={handleInput}
    >
      {escapedValue}
    </div>
  {/if}
</div>