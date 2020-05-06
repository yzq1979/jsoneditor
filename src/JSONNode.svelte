<script>
  import Icon from 'svelte-awesome'
  import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons'
  import { SEARCH_PROPERTY, SEARCH_VALUE } from './search'
  import classnames from 'classnames'
  import { isUrl, stringConvert, valueType } from './utils/typeUtils'
  import { escapeHTML } from './utils/stringUtils.js'
  import { updateProps } from './utils/updateProps.js'
  import { unescapeHTML } from './utils/stringUtils'
  import { getInnerText } from './utils/domUtils'

  export let key = undefined
  export let value
  export let searchResult
  export let onChangeKey
  export let onChangeValue
  export let expanded = false

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

  $: escapedKey = escapeHTML(key, escapeUnicode)
  $: escapedValue = escapeHTML(value, escapeUnicode)
  $: valueIsUrl = isUrl(value)

  $: keyClass = classnames('key', {
    empty: escapedKey.length === 0,
    search: searchResult 
      ? !!searchResult[SEARCH_PROPERTY]
      : false
  })

  $: valueClass = getValueClass(value)

  $: if (domKey) {
    if (document.activeElement !== domKey || escapedKey === '') {
      // synchronize the innerText of the editable div with the escaped value,
      // but only when the domValue does not have focus else we will ruin 
      // the cursor position.
      domKey.innerText = escapedKey
    }
  }

  $: if (domValue) {
    if (document.activeElement !== domValue || escapedValue === '') {
      // synchronize the innerText of the editable div with the escaped value,
      // but only when the domValue does not have focus else we will ruin 
      // the cursor position.
      domValue.innerText = escapedValue
    }
  }

  function getValueClass (value) {
    const type = valueType (value)

    return classnames('value', type, {
      url: isUrl(value),
      empty: escapedValue.length === 0,
      search: searchResult
        ? !!searchResult[SEARCH_VALUE]
        : false
    })
  }

  function toggle () {
    expanded = !expanded
  }

  function handleKeyInput (event) {
    const newKey = unescapeHTML(getInnerText(event.target))
    onChangeKey(newKey, key)
  }

  function handleKeyBlur () {
    // make sure differences in escaped text like with new lines is updated
    domKey.innerText = escapedValue
  }

  function handleValueInput (event) {
    const valueText = unescapeHTML(getInnerText(event.target))
    const newValue = stringConvert(valueText) // TODO: implement support for type "string"
    onChangeValue(newValue, key)
  }

  function handleValueBlur () {
    // make sure differences in escaped text like with new lines is updated
    domValue.innerText = escapedValue
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
        />
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
          class={keyClass}
          contenteditable="true"
          spellcheck="false"
          on:input={handleKeyInput}
          on:blur={handleKeyBlur}
          bind:this={domKey}
        />
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
          class={keyClass}
          contenteditable="true"
          spellcheck="false"
          on:input={handleKeyInput}
          on:blur={handleKeyBlur}
          bind:this={domKey}
        />
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
      />
    </div>
  {/if}
</div>

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
      display: table;
      flex-direction: row;

      line-height: $line-height;

      > * {
        display: table-cell;
      }
    }

    .contents {
      padding-left: $line-height ; // must be the same as the width of the expand button
      padding-right: 5px;
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
    line-height: $line-height;
    min-width: 16px;
    word-break: normal;
    padding: 0 $input-padding;
    outline: none;
    border-radius: 1px;
    vertical-align: top;

    &:focus {
      box-shadow: 0 0 3px 1px #008fd5;
      z-index: 1;
    }
  }

  .separator,
  .delimiter {
    vertical-align: top;
    color: $gray;
  }

  .tag {
    vertical-align: top;
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
    &:not(:focus) {
      outline: 1px dotted lightgray;
      -moz-outline-radius: 2px;
    }
    
    &::after {
      pointer-events: none;
      color: lightgray;
    }

    &.key::after {
      content: 'key';
    }

    &.value::after {
      content: 'value';
    }
  }

  .key.search,
  .value.search {
    background-color: $highlight-color;
  }
</style>
