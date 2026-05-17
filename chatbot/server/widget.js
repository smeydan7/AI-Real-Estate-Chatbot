(function () {
  'use strict';

  var currentScript = document.currentScript;
  var scriptSrc = currentScript ? currentScript.src : '';
  var API_BASE = scriptSrc.replace(/\/widget\.js(\?.*)?$/, '');
  var API_URL = API_BASE + '/api/chat';

  var messages = [];

  var styles = `
    #re-chat-widget * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    #re-chat-toggle {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #2563eb;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
      z-index: 999999;
      transition: background 0.2s, transform 0.2s;
    }

    #re-chat-toggle:hover {
      background: #1d4ed8;
      transform: scale(1.06);
    }

    #re-chat-toggle svg {
      width: 28px;
      height: 28px;
      fill: #fff;
    }

    #re-chat-panel {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 360px;
      height: 520px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
      z-index: 999998;
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }

    #re-chat-panel.re-open {
      display: flex;
    }

    #re-chat-header {
      background: #2563eb;
      color: #fff;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    #re-chat-header-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    #re-chat-header-avatar svg {
      width: 20px;
      height: 20px;
      fill: #fff;
    }

    #re-chat-header-info {
      flex: 1;
    }

    #re-chat-title {
      font-size: 15px;
      font-weight: 600;
      line-height: 1.2;
    }

    #re-chat-subtitle {
      font-size: 12px;
      opacity: 0.85;
      margin-top: 1px;
    }

    #re-chat-close {
      background: none;
      border: none;
      cursor: pointer;
      color: #fff;
      opacity: 0.8;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 6px;
      transition: opacity 0.15s;
    }

    #re-chat-close:hover {
      opacity: 1;
    }

    #re-chat-close svg {
      width: 20px;
      height: 20px;
      fill: #fff;
    }

    #re-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f9fafb;
    }

    #re-chat-messages::-webkit-scrollbar {
      width: 4px;
    }

    #re-chat-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    #re-chat-messages::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 2px;
    }

    .re-bubble {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .re-bubble.re-user {
      align-self: flex-end;
      background: #2563eb;
      color: #fff;
      border-bottom-right-radius: 4px;
    }

    .re-bubble.re-assistant {
      align-self: flex-start;
      background: #fff;
      color: #111827;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }

    .re-bubble.re-error {
      align-self: flex-start;
      background: #fef2f2;
      color: #dc2626;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      font-size: 13px;
    }

    .re-typing {
      align-self: flex-start;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 12px 16px;
      background: #fff;
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }

    .re-typing span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #9ca3af;
      display: inline-block;
      animation: re-bounce 1.2s infinite ease-in-out;
    }

    .re-typing span:nth-child(1) { animation-delay: 0s; }
    .re-typing span:nth-child(2) { animation-delay: 0.2s; }
    .re-typing span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes re-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }

    #re-chat-input-area {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      padding: 12px 14px;
      border-top: 1px solid #e5e7eb;
      background: #fff;
      flex-shrink: 0;
    }

    #re-chat-input {
      flex: 1;
      border: 1px solid #d1d5db;
      border-radius: 20px;
      padding: 9px 14px;
      font-size: 14px;
      color: #111827;
      background: #f9fafb;
      outline: none;
      resize: none;
      max-height: 100px;
      overflow-y: auto;
      line-height: 1.4;
      transition: border-color 0.15s;
    }

    #re-chat-input:focus {
      border-color: #2563eb;
      background: #fff;
    }

    #re-chat-input::placeholder {
      color: #9ca3af;
    }

    #re-chat-send {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #2563eb;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.2s, opacity 0.2s;
    }

    #re-chat-send:hover {
      background: #1d4ed8;
    }

    #re-chat-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    #re-chat-send svg {
      width: 18px;
      height: 18px;
      fill: #fff;
    }

    @media (max-width: 480px) {
      #re-chat-panel {
        bottom: 0;
        right: 0;
        width: 100%;
        height: 100%;
        border-radius: 0;
        border: none;
      }

      #re-chat-toggle {
        bottom: 16px;
        right: 16px;
      }
    }
  `;

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent = styles;
    document.head.appendChild(style);
  }

  function createWidget() {
    var container = document.createElement('div');
    container.id = 're-chat-widget';

    var toggle = document.createElement('button');
    toggle.id = 're-chat-toggle';
    toggle.setAttribute('aria-label', 'Open chat');
    toggle.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z"/></svg>';

    var panel = document.createElement('div');
    panel.id = 're-chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Real estate chat');

    var header = document.createElement('div');
    header.id = 're-chat-header';
    header.innerHTML = [
      '<div id="re-chat-header-avatar">',
      '  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
      '</div>',
      '<div id="re-chat-header-info">',
      '  <div id="re-chat-title">Chat with us</div>',
      '  <div id="re-chat-subtitle">Real Estate Assistant &bull; Typically replies instantly</div>',
      '</div>',
      '<button id="re-chat-close" aria-label="Close chat">',
      '  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
      '</button>',
    ].join('');

    var messagesDiv = document.createElement('div');
    messagesDiv.id = 're-chat-messages';

    var inputArea = document.createElement('div');
    inputArea.id = 're-chat-input-area';

    var textarea = document.createElement('textarea');
    textarea.id = 're-chat-input';
    textarea.placeholder = 'Ask about buying, selling, or renting...';
    textarea.rows = 1;

    var sendBtn = document.createElement('button');
    sendBtn.id = 're-chat-send';
    sendBtn.setAttribute('aria-label', 'Send message');
    sendBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';

    inputArea.appendChild(textarea);
    inputArea.appendChild(sendBtn);

    panel.appendChild(header);
    panel.appendChild(messagesDiv);
    panel.appendChild(inputArea);

    container.appendChild(toggle);
    container.appendChild(panel);

    document.body.appendChild(container);

    addWelcomeMessage(messagesDiv);

    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.contains('re-open');
      if (isOpen) {
        panel.classList.remove('re-open');
        toggle.setAttribute('aria-label', 'Open chat');
        toggle.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z"/></svg>';
      } else {
        panel.classList.add('re-open');
        toggle.setAttribute('aria-label', 'Close chat');
        toggle.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
        textarea.focus();
      }
    });

    document.getElementById('re-chat-close').addEventListener('click', function () {
      panel.classList.remove('re-open');
      toggle.setAttribute('aria-label', 'Open chat');
      toggle.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z"/></svg>';
    });

    sendBtn.addEventListener('click', function () {
      handleSend(textarea, messagesDiv, sendBtn);
    });

    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend(textarea, messagesDiv, sendBtn);
      }
    });

    textarea.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
  }

  function addWelcomeMessage(messagesDiv) {
    appendBubble(messagesDiv, 'assistant', 'Hi there! I\'m your real estate assistant. Whether you\'re buying, selling, or renting, I\'m here to help. What can I assist you with today?');
  }

  function appendBubble(messagesDiv, role, text) {
    var bubble = document.createElement('div');
    bubble.className = 're-bubble re-' + role;
    bubble.textContent = text;
    messagesDiv.appendChild(bubble);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return bubble;
  }

  function showTyping(messagesDiv) {
    var typing = document.createElement('div');
    typing.className = 're-typing';
    typing.id = 're-typing-indicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesDiv.appendChild(typing);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return typing;
  }

  function removeTyping() {
    var el = document.getElementById('re-typing-indicator');
    if (el) el.parentNode.removeChild(el);
  }

  function handleSend(textarea, messagesDiv, sendBtn) {
    var text = textarea.value.trim();
    if (!text) return;

    textarea.value = '';
    textarea.style.height = 'auto';
    sendBtn.disabled = true;

    appendBubble(messagesDiv, 'user', text);
    messages.push({ role: 'user', content: text });

    var typing = showTyping(messagesDiv);

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages }),
    })
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (data) {
            throw new Error(data.error || 'Server error');
          });
        }
        return res.json();
      })
      .then(function (data) {
        removeTyping();
        var reply = data.reply || 'Sorry, I didn\'t get a response. Please try again.';
        messages.push({ role: 'assistant', content: reply });
        appendBubble(messagesDiv, 'assistant', reply);
      })
      .catch(function (err) {
        removeTyping();
        appendBubble(messagesDiv, 'error', 'Something went wrong. Please try again in a moment.');
        console.error('[re-chat]', err);
      })
      .finally(function () {
        sendBtn.disabled = false;
        textarea.focus();
      });
  }

  function init() {
    injectStyles();
    createWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
