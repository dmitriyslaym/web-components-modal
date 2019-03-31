const template = document.createElement('template');
template.innerHTML = `
<style>
  .hidden {
    display: none !important;
  }
  #modal {
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
  }

  #modal-bgr {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, .5);
  }

  #modal-main {
    background-color: white;
    z-index: 2;
    padding: 20px;
    border-radius: 8px;
    border: 2px solid darkblue;
    height: 200px;
    width: 50%;
    text-align: center;
  }
  button {
    padding: 10px;
    border-radius: 8px;
    box-shadow: none;
    text-shadow: none;
    border-image: none;
    border: 1px solid black;
    font-weight: bold;
    cursor: pointer;
  }
  #confirm {
    background: orange;
    color: white;
  }
</style>

<div id="modal" class="hidden">
  <div id="modal-bgr"></div>
  <div id="modal-main">
    <slot name="title">
      <h1>Default title</h1>
    </slot>
    <slot name="main-content">
      <p>Default content</p>
    </slot>
    <div id="modal-buttons">
      <button id="confirm">Confirm</button>
      <button id="cancel">Cancel</button>
    </div>
  </div>
</div>
`;

const openedAttrName = 'opened';

class UCModal extends HTMLElement {
  static get observedAttributes() {
    return [openedAttrName];
  }

  constructor () {
    super();
    this.attachShadow({ mode: 'open' });
    this.root = this.shadowRoot;
    this.root.appendChild(template.content.cloneNode(true));

    this.isOpened = false;

    this.background$ = this.root.getElementById('modal-bgr');
    this.cancelButton$ = this.root.getElementById('cancel');
    this.confirmButton$ = this.root.getElementById('confirm');

    this.background$.addEventListener('click', this.close);
    this.cancelButton$.addEventListener('click', this._cancel);
    this.confirmButton$.addEventListener('click', this._confirm);
  }

  connectedCallback() {
    if (this.hasAttribute('opened')) {
      this.open();
    }
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    switch(attrName) {
      case openedAttrName: {
        const modalClassList = this.root.getElementById('modal').classList;
        if (this.hasAttribute(openedAttrName)) {
          this.isOpened = true;
          modalClassList.remove('hidden');
        } else {
          this.isOpened = false;
          modalClassList.add('hidden');
        }
      }
    }
  }

  disconnectedCallback() {
    console.info('Removing custom modal');
    this.background$.removeEventListener('click', this.close);
    this.cancelButton$.removeEventListener('click', this._cancel);
    this.confirmButton$.removeEventListener('click', this._confirm);
  }

  open = () => {
    if (!this.isOpened) {
      this.setAttribute('opened', '');
    }
  }

  close = () => {
    if (this.isOpened) {
      this.removeAttribute('opened');
    }
  }

  _cancel = () => {
    this.dispatchEvent(
      new CustomEvent('paymentCanceled', { detail: { timestamp: Date.now() } })
    );
    this.close();
  }

  _confirm = () => {
    this.dispatchEvent(
      new CustomEvent('paymentConfirmed', { detail: { timestamp: Date.now() } })
    );
    this.close();
  }

}

customElements.define('uc-modal', UCModal);
