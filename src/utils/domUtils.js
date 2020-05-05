/**
 * Get the inner text of an HTML element (for example a div element)
 * @param {Element} element
 * @param {Object} [buffer]
 * @return {String} innerText
 */
export function getInnerText (element, buffer) {
    const first = (buffer === undefined)
    if (first) {
      buffer = {
        'text': '',
        'flush': function () {
          const text = this.text
          this.text = ''
          return text
        },
        'set': function (text) {
          this.text = text
        }
      }
    }
  
    // text node
    if (element.nodeValue) {
      return buffer.flush() + element.nodeValue
    }
  
    // divs or other HTML elements
    if (element.hasChildNodes()) {
      const childNodes = element.childNodes
      let innerText = ''
  
      for (let i = 0, iMax = childNodes.length; i < iMax; i++) {
        const child = childNodes[i]
  
        if (child.nodeName === 'DIV' || child.nodeName === 'P') {
          const prevChild = childNodes[i - 1]
          const prevName = prevChild ? prevChild.nodeName : undefined
          if (prevName && prevName !== 'DIV' && prevName !== 'P' && prevName !== 'BR') {
            innerText += '\n'
            buffer.flush()
          }
          innerText += getInnerText(child, buffer)
          buffer.set('\n')
        }
        else if (child.nodeName === 'BR') {
          innerText += buffer.flush()
          buffer.set('\n')
        }
        else {
          innerText += getInnerText(child, buffer)
        }
      }
  
      return innerText
    }
    else {
      if (element.nodeName === 'P' && getInternetExplorerVersion() !== -1) {
        // On Internet Explorer, a <p> with hasChildNodes()==false is
        // rendered with a new line. Note that a <p> with
        // hasChildNodes()==true is rendered without a new line
        // Other browsers always ensure there is a <br> inside the <p>,
        // and if not, the <p> does not render a new line
        return buffer.flush()
      }
    }
  
    // br or unknown
    return ''
  }
  