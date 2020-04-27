<script>
  import Icon from 'svelte-awesome'
  import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons'
  import { SEARCH_PROPERTY, SEARCH_VALUE } from './search'
  import classnames from 'classnames'
  import { isUrl, stringConvert, valueType } from './utils/typeUtils'
  import { escapeHTML } from './utils/stringUtils.js'
  import { createUpdateProps } from './utils/updateProps.js'
  import { unescapeHTML } from './utils/stringUtils'

  export let key = undefined
  export let value
  export let searchResult
  export let onChangeKey
  export let onChangeValue
  export let expanded = false

  const DEFAULT_LIMIT = 100
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
  $: valueIsUrl = isUrl(value)

  $: valueClass = classnames('value', type, {
    url: valueIsUrl,
    empty: escapedValue.length === 0,
    search: searchResult
      ? !!searchResult[SEARCH_VALUE]
      : false
  })

  function toggle () {
    expanded = !expanded
  }

  function handleKeyInput (event) {
    const newKey = unescapeHTML(event.target.innerText)
    onChangeKey(newKey, key)
  }

  function handleValueInput (event) {
    const valueText = unescapeHTML(event.target.innerText)
    const newValue = stringConvert(valueText) // TODO: implement support for type "string"
    onChangeValue(newValue, key)
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

    .header {
      position: relative;
    }

    .header,
    .contents {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      line-height: $line-height;
    }

    .contents {
      padding-left: $line-height ; // must be the same as the width of the expand button
    }

    .footer {
      padding-left: $line-height + $input-padding; // must be the same as the width of the expand button
    }
  }

  .expand {
    position: relative;
    top: 2px;
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
    display: flex;

    line-height: $line-height;
    min-width: 16px;
    word-break: normal;
    padding: 0 $input-padding;
    outline: none;
    border-radius: 1px;
    vertical-align: middle;

    &:focus {
      box-shadow: 0 0 3px 1px #008fd5;
      z-index: 1;
    }
  }

  // FIXME: there is whitespace added around the separator in the HTML
  .separator,
  .delimiter {
    display: flex;
    vertical-align: middle;
    color: $gray;
  }

  .tag {
    border: none;
    font-size: $font-size-small;
    font-family: $font-family-menu;
    color: white;
    background: $light-gray;
    border-radius: 2px;
    padding: 1px 4px;
    margin: 0 5px;
    cursor: pointer;
    position: relative;
    top: 1px;

    &:hover {
      background: lighten($light-gray, 5%);
    }
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
          class="key {searchResult && searchResult[SEARCH_PROPERTY] ? 'search' : ''}"
          contenteditable="true"
          on:input={handleKeyInput}
        >
          {escapedKey}
        </div>
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
            onChangeValue={handleChangeValue}
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
          class="key {searchResult && searchResult[SEARCH_PROPERTY] ? 'search' : ''}"
          contenteditable="true"
          on:input={handleKeyInput}
        >
          {escapedKey}
        </div>
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
            onChangeValue={handleChangeValue}
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
          class="key {searchResult && searchResult[SEARCH_PROPERTY] ? 'search' : ''}"
          contenteditable="true"
          on:input={handleKeyInput}
        >
          {escapedKey}
        </div>
        <span class="separator">:</span>
      {/if}
      <div
        class={valueClass}
        contenteditable="true"
        on:input={handleValueInput}
        on:click={handleValueClick}
        on:keydown={handleValueKeyDown}
        title={valueIsUrl ? 'Ctrl+Click or Ctrl+Enter to open url in new window' : null}
      >
        {escapedValue}
      </div>
    </div>
  {/if}
</div>