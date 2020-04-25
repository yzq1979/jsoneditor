<script>
  import { getType, SEARCH_PROPERTY, SEARCH_VALUE } from './utils'

  export let key = 'root'
  export let value
  export let searchResult
  export let onChange
  export let expanded = true
  export let indentation = 0

  const DEFAULT_LIMIT = 10000

  let limit = DEFAULT_LIMIT

  $: type = getType(value)

  $: props = type === 'object'
    ? Object.keys(value).map(key => {
      return { key, value: value[key] }
    })
    : undefined

  $: limited = type === 'array' && value.length > limit

  $: items = type === 'array'
    ? limited ? value.slice(0, limit) : value
    : undefined

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
  $search-background-color: gold;

  .key {
    color: gray;
  }
  .key.search {
    background-color: $search-background-color;
  }
  .items,
  .props {
    padding-left: 24px;
  }
  .value {
    display: inline-block;
    padding: 3px;
  }
  .key.search,
  .value.search {
    background-color: $search-background-color;
  }
</style>

<div class='json-node'>
    <span class="key {searchResult && searchResult[SEARCH_PROPERTY] ? 'search' : ''}">
        {key} : 
    </span>
  {#if type !== 'value'}
    <button on:click={toggle}>
      {#if expanded}
        collapse
      {:else}
        expand
      {/if}
    </button>
  {/if}
  {#if type === 'array'}
    {#if expanded}
      <div class="items">
        {#each items as item, index (index)}
          <svelte:self
            key={index}
            value={item}
            searchResult={searchResult ? searchResult[index] : undefined}
            indentation={indentation + 1}
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
            indentation={indentation + 1}
            onChange={handleChange}
          />
        {/each}
      </div>
    {/if}
  {:else}
    <div
      class="value {searchResult && searchResult[SEARCH_VALUE] ? 'search' : ''}"
      contenteditable="true"
      on:input={handleInput}
    >
      {value}
    </div>
  {/if}
</div>