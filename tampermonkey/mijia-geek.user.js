// ==UserScript==
// @name         MIJIA GEEK CODE
// @namespace    https://github.com/ChishFoxcat
// @version      1.0.0
// @description  提供类似米家自动化极客版的悬浮窗，执行保存的 POST 请求并展示 URL 与登录码。
// @author       Chish
// @match        */*  // 这边自己改中枢的IP，格式 http://x.x.x.x/*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// 严禁未注明的转载，此脚本为学习使用，请在24小时内删除，使用出现各种异常均不负任何责任
// ==/UserScript==

(function () {
  'use strict';

  const panelId = 'mijia-passcode-panel';
  const responsePlaceholder = '原始响应会显示在这里。';
  const passcodePlaceholder = '------';
  const remoteUrlPlaceholder = 'IP:default';
  const storageKeys = {
    requestConfig: 'curl_command'
  };
  const fixedHeaders = {
    miotRequestModel: 'xiaomi.gateway.hub1'
  };
  const defaultSettings = {
    requestUrl: '',
    cookie: '',
    ipRequestBody: '',
    passcodeRequestBody: '',
    accept: '*/*',
    contentType: 'application/x-www-form-urlencoded',
    userAgent: '',
    connection: 'keep-alive',
    acceptEncoding: 'gzip, deflate, br',
    acceptLanguage: 'zh-Hans;q=1',
    operateCommon: '',
    originFrom: '',
    xiaomiProtocolFlagCli: ''
  };
  const passcodeKeys = ['passcode', 'passwd', 'password', 'pwd'];
  const icons = {
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.75a1.5 1.5 0 0 1 1.5 1.5v.46a6.83 6.83 0 0 1 1.78.74l.33-.33a1.5 1.5 0 1 1 2.12 2.12l-.33.33c.32.56.57 1.15.74 1.78h.46a1.5 1.5 0 0 1 0 3h-.46a6.83 6.83 0 0 1-.74 1.78l.33.33a1.5 1.5 0 0 1-2.12 2.12l-.33-.33a6.83 6.83 0 0 1-1.78.74v.46a1.5 1.5 0 0 1-3 0v-.46a6.83 6.83 0 0 1-1.78-.74l-.33.33a1.5 1.5 0 0 1-2.12-2.12l.33-.33a6.83 6.83 0 0 1-.74-1.78h-.46a1.5 1.5 0 0 1 0-3h.46c.17-.63.42-1.22.74-1.78l-.33-.33a1.5 1.5 0 0 1 2.12-2.12l.33.33c.56-.32 1.15-.57 1.78-.74v-.46A1.5 1.5 0 0 1 12 3.75Z"></path><circle cx="12" cy="12" r="2.75"></circle></svg>',
    badge: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10.25V8.5a5 5 0 0 1 10 0v1.75"></path><rect x="4.75" y="10.25" width="14.5" height="10" rx="2.25"></rect><path d="M12 13.5v3"></path></svg>',
    passcode: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8.25" cy="14.25" r="3.25"></circle><path d="M11.25 14.25h8m-2 0v2m-3-2v2"></path><path d="M10.25 12.25l5.5-5.5a2.25 2.25 0 1 1 3.18 3.18l-5.5 5.5"></path></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="7" width="10" height="12" rx="2"></rect><path d="M7 15H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"></path></svg>',
    fill: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.75" y="4.75" width="14.5" height="14.5" rx="2.25"></rect><path d="M8.5 9.5h7"></path><path d="M8.5 12h7"></path><path d="M8.5 14.5h4.5"></path><path d="m16.5 18.5 3-3"></path><path d="m17 12.5 2.5 2.5-3 3L14 15.5"></path></svg>',
    refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36"></path><path d="M21 3v6h-6"></path></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12"></path><path d="M18 6 6 18"></path></svg>',
    mijia: '<img src="data:image/png;base64,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" alt="米家 logo">'
  };
  let lastPasscode = '';
  let lastRemoteUrl = '';
  let statusToastTimer = 0;
  let activePanelDragPointerId = null;
  let panelDragOffsetX = 0;
  let panelDragOffsetY = 0;
  let activeMiniTogglePointerId = null;
  let miniToggleDragOffsetX = 0;
  let miniToggleDragOffsetY = 0;
  let isMiniToggleDragging = false;
  let suppressMiniToggleClick = false;
  const outputState = {
    url: responsePlaceholder,
    passcode: responsePlaceholder
  };

  GM_addStyle(`
    #${panelId} {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 2147483647;
      width: min(420px, calc(100vw - 24px));
      color: #ffffff;
      font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
    }

    #${panelId}.is-collapsed {
      width: auto;
    }

    #${panelId} * {
      box-sizing: border-box;
    }

    #${panelId} button,
    #${panelId} input,
    #${panelId} textarea {
      font: inherit;
    }

    #${panelId} .mini-toggle {
      display: none;
      justify-content: flex-end;
    }

    #${panelId}.is-collapsed .mini-toggle {
      display: flex;
    }

    #${panelId} .mini-toggle button {
      border: 0;
      border-radius: 18px;
      width: 56px;
      height: 56px;
      padding: 0;
      color: #ffffff;
      background: transparent;
      box-shadow: 0 16px 34px rgba(0, 0, 0, 0.24);
      cursor: pointer;
      touch-action: none;
      user-select: none;
      overflow: hidden;
    }

    #${panelId} .mini-toggle button img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      pointer-events: none;
      user-select: none;
      -webkit-user-drag: none;
    }

    #${panelId} .card {
      display: block;
      border-radius: 24px;
      overflow: hidden;
      background: #171717;
      box-shadow: 0 20px 56px rgba(0, 0, 0, 0.32);
    }

    #${panelId}.is-collapsed .card {
      display: none;
    }

    #${panelId} .card-inner {
      padding: 28px 20px 22px;
      display: grid;
      gap: 18px;
    }

    #${panelId} .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    #${panelId} .header-main {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    #${panelId} .title {
      font-size: 18px;
      font-weight: 700;
      line-height: 1.2;
      cursor: grab;
      user-select: none;
      touch-action: none;
    }

    #${panelId} .title-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 999px;
      color: #c9e3ff;
      background: rgba(47, 124, 255, 0.16);
      font-size: 12px;
      white-space: nowrap;
    }

    #${panelId} .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    #${panelId} .header-button,
    #${panelId} .icon-button,
    #${panelId} .action-button,
    #${panelId} .small-button,
    #${panelId} .secondary-button,
    #${panelId} .primary-button {
      border: 0;
      cursor: pointer;
      transition: transform 0.18s ease, opacity 0.18s ease, background 0.18s ease;
    }

    #${panelId} .header-button:hover,
    #${panelId} .icon-button:hover,
    #${panelId} .action-button:hover,
    #${panelId} .small-button:hover,
    #${panelId} .secondary-button:hover,
    #${panelId} .primary-button:hover {
      transform: translateY(-1px);
    }

    #${panelId} .header-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 999px;
      color: rgba(255, 255, 255, 0.76);
      background: rgba(255, 255, 255, 0.06);
      font-size: 14px;
    }

    #${panelId} .icon-button {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      color: #ffffff;
      background: rgba(255, 255, 255, 0.08);
    }

    #${panelId} .field {
      display: grid;
      gap: 8px;
    }

    #${panelId} .settings-section {
      display: grid;
      gap: 12px;
      padding: 14px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.05);
    }

    #${panelId} .section-title {
      font-size: 13px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.92);
      letter-spacing: 0.02em;
    }

    #${panelId} .field-note {
      font-size: 12px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.6);
    }

    #${panelId} .field-grid {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    #${panelId} .field-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.76);
    }

    #${panelId} .text-input,
    #${panelId} .textarea-input,
    #${panelId} .link-box,
    #${panelId} .passcode-box {
      width: 100%;
      border: 0;
      border-radius: 20px;
      background: #444444;
      color: #ffffff;
    }

    #${panelId} .text-input,
    #${panelId} .textarea-input {
      padding: 12px 14px;
      line-height: 1.6;
    }

    #${panelId} .textarea-input {
      min-height: 140px;
      resize: vertical;
    }

    #${panelId} .textarea-shell .textarea-input {
      display: block;
      width: 100%;
      min-height: 140px;
      padding: 12px 14px;
      border-radius: 20px;
      background: #444444;
      color: #ffffff;
      caret-color: #ffffff;
      -webkit-text-fill-color: #ffffff;
      tab-size: 2;
      resize: vertical;
      overflow-x: hidden;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.26) transparent;
    }

    #${panelId} .textarea-shell .textarea-input::-webkit-scrollbar {
      width: 10px;
    }

    #${panelId} .textarea-shell .textarea-input::-webkit-scrollbar-track {
      background: transparent;
    }

    #${panelId} .textarea-shell .textarea-input::-webkit-scrollbar-thumb {
      border: 2px solid transparent;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.26);
      background-clip: padding-box;
    }

    #${panelId} .textarea-shell .textarea-input::-webkit-scrollbar-corner {
      background: transparent;
    }

    #${panelId} .textarea-shell .textarea-input::-webkit-resizer {
      background: transparent;
    }

    #${panelId} .link-box {
      min-height: 60px;
      padding: 10px 10px 10px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #${panelId} .url-link {
      flex: 1;
      min-width: 0;
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #2f7cff;
      text-decoration: underline;
      text-underline-offset: 3px;
      text-align: center;
      line-height: 1.35;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    #${panelId} .url-link:not([href]) {
      color: rgba(255, 255, 255, 0.72);
      text-decoration: none;
      cursor: default;
    }

    #${panelId} .url-refresh-button {
      width: 34px;
      height: 34px;
      border-radius: 11px;
      flex: 0 0 34px;
      align-self: center;
      margin: 0;
    }

    #${panelId} .passcode-box {
      min-height: 76px;
      padding: 0 12px 0 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    #${panelId} .passcode-value {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18px;
      font-size: 24px;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    #${panelId} .passcode-slot {
      width: 1ch;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 1ch;
    }

    #${panelId} .passcode-value.is-muted {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.72);
    }

    #${panelId} .passcode-actions {
      display: flex;
      flex-direction: row;
      gap: 8px;
    }

    #${panelId} .action-button,
    #${panelId} .secondary-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }

    #${panelId} .inline-icon-button {
      position: relative;
      width: 34px;
      height: 34px;
      border: 0;
      border-radius: 11px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.88);
      background: rgba(255, 255, 255, 0.08);
      cursor: pointer;
      transition: transform 0.18s ease, opacity 0.18s ease, background 0.18s ease;
    }

    #${panelId} .inline-icon-button:hover {
      transform: translateY(-1px);
      background: rgba(255, 255, 255, 0.12);
    }

    #${panelId} .inline-icon-button::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      padding: 6px 10px;
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.92);
      background: rgba(14, 14, 14, 0.96);
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.26);
      font-size: 12px;
      line-height: 1.4;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transform: translate(-50%, 4px);
      transition: opacity 0.18s ease, transform 0.18s ease;
    }

    #${panelId} .inline-icon-button:hover::after,
    #${panelId} .inline-icon-button:focus-visible::after {
      opacity: 1;
      transform: translate(-50%, 0);
    }

    #${panelId} .action-button {
      padding: 10px 12px;
      font-size: 13px;
    }

    #${panelId} .secondary-button {
      padding: 11px 14px;
      font-size: 14px;
    }

    #${panelId} .primary-button {
      width: auto;
      min-width: 220px;
      max-width: 100%;
      align-self: center;
      padding: 12px 18px;
      border-radius: 999px;
      color: #ffffff;
      font-size: 15px;
      background: linear-gradient(180deg, #2e95ff 0%, #1b7ff0 100%);
    }

    #${panelId} .secondary-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    #${panelId} .status {
      font-size: 12px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.68);
      display: none;
    }

    #${panelId} .status-toast {
      position: fixed;
      top: 20px;
      left: 50%;
      z-index: 2147483647;
      max-width: min(560px, calc(100vw - 32px));
      padding: 12px 18px;
      border-radius: 999px;
      color: #ffffff;
      background: rgba(14, 14, 14, 0.92);
      box-shadow: 0 18px 46px rgba(0, 0, 0, 0.28);
      transform: translate(-50%, -14px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.18s ease, transform 0.18s ease;
      text-align: center;
      font-size: 13px;
      line-height: 1.5;
    }

    #${panelId} .status-toast.is-visible {
      opacity: 1;
      transform: translate(-50%, 0);
    }

    #${panelId} details {
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.05);
      overflow: hidden;
    }

    #${panelId} summary {
      padding: 12px 14px;
      cursor: pointer;
      list-style: none;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.82);
    }

    #${panelId} summary::-webkit-details-marker {
      display: none;
    }

    #${panelId} pre {
      margin: 0;
      padding: 0 14px 14px;
      white-space: pre-wrap;
      word-break: break-word;
      color: rgba(255, 255, 255, 0.78);
      font-size: 12px;
      line-height: 1.6;
    }

    #${panelId} .icon-inline,
    #${panelId} .title-badge svg,
    #${panelId} .field-label svg,
    #${panelId} .modal-title svg,
    #${panelId} .icon-button svg,
    #${panelId} .header-button svg,
    #${panelId} .inline-icon-button svg,
    #${panelId} .action-button svg,
    #${panelId} .secondary-button svg,
    #${panelId} .modal-close svg {
      width: 15px;
      height: 15px;
      flex: 0 0 15px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    #${panelId} .title-badge svg,
    #${panelId} .field-label svg {
      width: 14px;
      height: 14px;
      flex-basis: 14px;
    }

    #${panelId} .inline-icon-button svg {
      width: 14px;
      height: 14px;
      flex-basis: 14px;
    }

    #${panelId} .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
    }

    #${panelId} .modal-overlay.is-open {
      display: flex;
    }

    #${panelId} .modal-dialog {
      width: min(560px, calc(100vw - 24px));
      max-height: calc(100vh - 40px);
      overflow: auto;
      border-radius: 24px;
      background: #171717;
      box-shadow: 0 28px 72px rgba(0, 0, 0, 0.42);
    }

    #${panelId} .modal-inner {
      display: grid;
      gap: 16px;
      padding: 22px 20px 20px;
    }

    #${panelId} .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    #${panelId} .modal-title {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 17px;
      font-weight: 700;
    }

    #${panelId} .modal-close {
      width: 36px;
      height: 36px;
      border: 0;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      background: rgba(255, 255, 255, 0.08);
      cursor: pointer;
    }

    #${panelId} .modal-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    @media (max-width: 480px) {
      #${panelId} {
        top: 12px;
        right: 12px;
        width: calc(100vw - 24px);
      }

      #${panelId} .card-inner {
        padding: 22px 16px 18px;
      }

      #${panelId} .header {
        align-items: flex-start;
      }

      #${panelId} .header-main {
        flex-direction: column;
        align-items: flex-start;
      }

      #${panelId} .header-actions {
        gap: 8px;
      }

      #${panelId} .passcode-actions {
        gap: 6px;
      }

      #${panelId} .modal-overlay {
        padding: 12px;
      }

      #${panelId} .modal-inner {
        padding: 18px 16px 16px;
      }

      #${panelId} .field-grid {
        grid-template-columns: 1fr;
      }

    }
  `);

  const panel = document.createElement('section');
  panel.id = panelId;
  panel.className = 'is-collapsed';
  panel.innerHTML = `
    <div class="mini-toggle">
      <button type="button" data-action="toggle" data-role="mini-toggle-button" aria-label="打开面板">${icons.mijia}</button>
    </div>
    <div class="card">
      <div class="card-inner">
        <div class="header">
          <div class="header-main">
            <div class="title" data-role="panel-title">MIJIA GEEK</div>
            <div class="title-badge">${icons.badge}<span>登录码</span></div>
          </div>
          <div class="header-actions">
            <button class="header-button" type="button" data-action="open-settings">${icons.settings}<span>设置</span></button>
            <button class="icon-button" type="button" data-action="toggle" title="收起">-</button>
          </div>
        </div>
        <label class="field">
          <span class="field-label">URL</span>
          <div class="link-box">
            <a class="url-link" data-role="remote-url" target="_blank" rel="noopener noreferrer">IP:default</a>
            <button class="inline-icon-button url-refresh-button" type="button" data-action="fetch-url" data-tooltip="刷新 URL" aria-label="刷新 URL">${icons.refresh}</button>
          </div>
        </label>
        <div class="field">
          <span class="field-label">
            ${icons.passcode}
            <span>登录码</span>
          </span>
          <div class="passcode-box">
            <div class="passcode-value is-muted" data-role="passcode">${renderPasscodeSlots(passcodePlaceholder)}</div>
            <div class="passcode-actions">
              <button class="inline-icon-button" type="button" data-action="copy" data-tooltip="复制登录码" aria-label="复制登录码">${icons.copy}</button>
              <button class="inline-icon-button" type="button" data-action="fill-page" data-tooltip="填入输入框" aria-label="填入输入框">${icons.fill}</button>
            </div>
          </div>
        </div>
        <div class="status" data-role="status">请先打开设置填写 URL 和独立 POST 参数</div>
        <button class="primary-button" type="button" data-action="fetch-passcode">重新获取登录码</button>
        <details>
          <summary>查看原始响应</summary>
          <pre data-role="output">${responsePlaceholder}</pre>
        </details>
      </div>
    </div>
    <div class="modal-overlay" data-role="settings-modal">
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-label="设置">
        <div class="modal-inner">
          <div class="modal-header">
            <div class="modal-title">${icons.settings}<span>设置</span></div>
            <button class="modal-close" type="button" data-action="close-settings" title="关闭">${icons.close}</button>
          </div>
          <div class="settings-section">
            <div class="section-title">1. 要抓取数据的 URL</div>
            <label class="field">
              <span class="field-label">URL</span>
              <input class="text-input" data-setting="requestUrl" placeholder="例如：https://core.api.mijia.tech/app/home/rpc/1234567890" />
            </label>
            <div class="field-note">Host 和 domain-refer 会从上面的 URL 自动提取，MIOT-REQUEST-MODEL 固定写入 xiaomi.gateway.hub1。</div>
          </div>
          <div class="settings-section">
            <div class="section-title">2. POST 参数</div>
            <label class="field">
              <span class="field-label">URL 接口 POST 数据</span>
              <div class="textarea-shell">
                <textarea class="textarea-input" data-setting="ipRequestBody" placeholder="填写获取 URL 的 POST 数据，例如：_nonce=...&data=...&signature=..."></textarea>
              </div>
            </label>
            <label class="field">
              <span class="field-label">登录码 POST 数据</span>
              <div class="textarea-shell">
                <textarea class="textarea-input" data-setting="passcodeRequestBody" placeholder="填写获取登录码的 POST 数据，例如：_nonce=...&data=...&signature=..."></textarea>
              </div>
            </label>
            <label class="field">
              <span class="field-label">Cookie</span>
              <div class="textarea-shell">
                <textarea class="textarea-input" data-setting="cookie" placeholder="填写请求所需 Cookie"></textarea>
              </div>
            </label>
          </div>
          <div class="settings-section">
            <div class="section-title">客户端伪装</div>
            <div class="field-grid">
              <label class="field">
                <span class="field-label">Accept</span>
                <input class="text-input" data-setting="accept" placeholder="*/*" />
              </label>
              <label class="field">
                <span class="field-label">Content-Type</span>
                <input class="text-input" data-setting="contentType" placeholder="application/x-www-form-urlencoded" />
              </label>
              <label class="field">
                <span class="field-label">User-Agent</span>
                <input class="text-input" data-setting="userAgent" placeholder="填写客户端 User-Agent" />
              </label>
              <label class="field">
                <span class="field-label">Connection</span>
                <input class="text-input" data-setting="connection" placeholder="keep-alive" />
              </label>
              <label class="field">
                <span class="field-label">Accept-Encoding</span>
                <input class="text-input" data-setting="acceptEncoding" placeholder="gzip, deflate, br" />
              </label>
              <label class="field">
                <span class="field-label">Accept-Language</span>
                <input class="text-input" data-setting="acceptLanguage" placeholder="zh-Hans;q=1" />
              </label>
            </div>
          </div>
          <div class="settings-section">
            <div class="section-title">设备单独设置</div>
            <div class="field-grid">
              <label class="field">
                <span class="field-label">operate-common</span>
                <input class="text-input" data-setting="operateCommon" placeholder="填写设备 operate-common" />
              </label>
              <label class="field">
                <span class="field-label">Origin-From</span>
                <input class="text-input" data-setting="originFrom" placeholder="例如：MiHome" />
              </label>
              <label class="field">
                <span class="field-label">X-XIAOMI-PROTOCAL-FLAG-CLI</span>
                <input class="text-input" data-setting="xiaomiProtocolFlagCli" placeholder="例如：PROTOCAL-HTTP2" />
              </label>
            </div>
          </div>
          <div class="secondary-actions">
            <button class="action-button" type="button" data-action="clear-saved">删除已保存设置</button>
            <button class="action-button" type="button" data-action="clear">清空结果</button>
          </div>
          <div class="modal-actions">
            <button class="secondary-button" type="button" data-action="save">保存并关闭</button>
          </div>
        </div>
      </div>
    </div>
    <div class="status-toast" data-role="status-toast" aria-live="polite"></div>
  `;
  document.body.appendChild(panel);

  const fields = {
    requestUrl: panel.querySelector('[data-setting="requestUrl"]'),
    cookie: panel.querySelector('[data-setting="cookie"]'),
    ipRequestBody: panel.querySelector('[data-setting="ipRequestBody"]'),
    passcodeRequestBody: panel.querySelector('[data-setting="passcodeRequestBody"]'),
    accept: panel.querySelector('[data-setting="accept"]'),
    contentType: panel.querySelector('[data-setting="contentType"]'),
    userAgent: panel.querySelector('[data-setting="userAgent"]'),
    connection: panel.querySelector('[data-setting="connection"]'),
    acceptEncoding: panel.querySelector('[data-setting="acceptEncoding"]'),
    acceptLanguage: panel.querySelector('[data-setting="acceptLanguage"]'),
    operateCommon: panel.querySelector('[data-setting="operateCommon"]'),
    originFrom: panel.querySelector('[data-setting="originFrom"]'),
    xiaomiProtocolFlagCli: panel.querySelector('[data-setting="xiaomiProtocolFlagCli"]')
  };
  const passcodeNode = panel.querySelector('[data-role="passcode"]');
  const statusNode = panel.querySelector('[data-role="status"]');
  const outputNode = panel.querySelector('[data-role="output"]');
  const remoteUrlNode = panel.querySelector('[data-role="remote-url"]');
  const settingsModalNode = panel.querySelector('[data-role="settings-modal"]');
  const miniToggleButtonNode = panel.querySelector('[data-role="mini-toggle-button"]');
  const panelTitleNode = panel.querySelector('[data-role="panel-title"]');
  const statusToastNode = panel.querySelector('[data-role="status-toast"]');

  function readCookieValue(name) {
    const cookiePrefix = `${encodeURIComponent(name)}=`;
    const cookiePart = document.cookie
      .split('; ')
      .find((item) => item.startsWith(cookiePrefix));

    if (!cookiePart) {
      return '';
    }

    return decodeURIComponent(cookiePart.slice(cookiePrefix.length));
  }

  function normalizeSettings(settings) {
    const normalizedSettings = { ...defaultSettings };

    if (!settings || typeof settings !== 'object') {
      return normalizedSettings;
    }

    for (const key of Object.keys(defaultSettings)) {
      if (typeof settings[key] === 'string') {
        normalizedSettings[key] = settings[key];
      }
    }

    return normalizedSettings;
  }

  function encodeStoredSettings(settings) {
    return JSON.stringify({
      settings: normalizeSettings(settings)
    });
  }

  function readHeaderValue(headers, targetName) {
    const targetNameLower = targetName.toLowerCase();
    for (const [headerName, headerValue] of Object.entries(headers)) {
      if (headerName.toLowerCase() === targetNameLower) {
        return headerValue;
      }
    }
    return '';
  }

  function safeDecodeURIComponent(value) {
    try {
      return decodeURIComponent(value);
    } catch (error) {
      return value;
    }
  }

  function detectLegacyRequestKind(data) {
    const decodedData = safeDecodeURIComponent(data || '');

    if (decodedData.includes('miIO.get_autowebconfig_url')) {
      return 'url';
    }

    if (decodedData.includes('miIO.get_central_link_passcode')) {
      return 'passcode';
    }

    return '';
  }

  function migrateCurlCommandToSettings(command) {
    if (!command) {
      return { ...defaultSettings };
    }

    try {
      const request = parseCurlCommand(command);
      const migratedSettings = {
        ...defaultSettings,
        requestUrl: request.url,
        cookie: readHeaderValue(request.headers, 'Cookie'),
        accept: readHeaderValue(request.headers, 'Accept') || defaultSettings.accept,
        contentType: readHeaderValue(request.headers, 'Content-Type') || defaultSettings.contentType,
        userAgent: readHeaderValue(request.headers, 'User-Agent'),
        connection: readHeaderValue(request.headers, 'Connection') || defaultSettings.connection,
        acceptEncoding: readHeaderValue(request.headers, 'Accept-Encoding') || defaultSettings.acceptEncoding,
        acceptLanguage: readHeaderValue(request.headers, 'Accept-Language') || defaultSettings.acceptLanguage,
        operateCommon: readHeaderValue(request.headers, 'operate-common'),
        originFrom: readHeaderValue(request.headers, 'Origin-From'),
        xiaomiProtocolFlagCli: readHeaderValue(request.headers, 'X-XIAOMI-PROTOCAL-FLAG-CLI')
      };
      const requestKind = detectLegacyRequestKind(request.data);

      if (requestKind === 'url') {
        migratedSettings.ipRequestBody = request.data || '';
      }

      if (requestKind === 'passcode') {
        migratedSettings.passcodeRequestBody = request.data || '';
      }

      return migratedSettings;
    } catch (error) {
      return { ...defaultSettings };
    }
  }

  function decodeStoredSettings(rawValue) {
    if (!rawValue) {
      return { ...defaultSettings };
    }

    try {
      const parsedValue = JSON.parse(rawValue);

      if (parsedValue && typeof parsedValue === 'object') {
        if (parsedValue.settings && typeof parsedValue.settings === 'object') {
          return normalizeSettings(parsedValue.settings);
        }

        if (typeof parsedValue.curlCommand === 'string') {
          return migrateCurlCommandToSettings(parsedValue.curlCommand);
        }
      }
    } catch (error) {
      return migrateCurlCommandToSettings(rawValue);
    }

    return { ...defaultSettings };
  }

  function writeCookieValue(name, value) {
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=2592000; samesite=lax`;
  }

  function deleteCookieValue(name) {
    document.cookie = `${encodeURIComponent(name)}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
  }

  function setStatus(message, showToast = true) {
    statusNode.textContent = message;

    if (!showToast) {
      statusToastNode.classList.remove('is-visible');
      return;
    }

    statusToastNode.textContent = message;
    statusToastNode.classList.add('is-visible');
    window.clearTimeout(statusToastTimer);
    statusToastTimer = window.setTimeout(() => {
      statusToastNode.classList.remove('is-visible');
    }, 2400);
  }

  function setPasscodeResult(value, isCode) {
    passcodeNode.className = `passcode-value${isCode ? '' : ' is-muted'}`;

    if (value === passcodePlaceholder || (isCode && /^\d{6}$/.test(String(value)))) {
      passcodeNode.innerHTML = renderPasscodeSlots(value);
      return;
    }

    passcodeNode.textContent = value;
  }

  function setRemoteUrl(value) {
    const nextValue = value || remoteUrlPlaceholder;
    const isHttpUrl = /^https?:\/\//i.test(nextValue);
    remoteUrlNode.textContent = nextValue;

    if (isHttpUrl) {
      remoteUrlNode.href = nextValue;
      return;
    }

    remoteUrlNode.removeAttribute('href');
  }

  function renderOutput() {
    const hasResponse =
      outputState.url !== responsePlaceholder ||
      outputState.passcode !== responsePlaceholder;

    if (!hasResponse) {
      outputNode.textContent = responsePlaceholder;
      return;
    }

    outputNode.textContent = [
      '[URL 接口响应]',
      outputState.url,
      '',
      '[登录码接口响应]',
      outputState.passcode
    ].join('\n');
  }

  function setOutputSection(section, value) {
    outputState[section] = value || responsePlaceholder;
    renderOutput();
  }

  function collectSettings() {
    return {
      requestUrl: fields.requestUrl.value.trim(),
      cookie: fields.cookie.value.trim(),
      ipRequestBody: fields.ipRequestBody.value.trim(),
      passcodeRequestBody: fields.passcodeRequestBody.value.trim(),
      accept: fields.accept.value.trim(),
      contentType: fields.contentType.value.trim(),
      userAgent: fields.userAgent.value.trim(),
      connection: fields.connection.value.trim(),
      acceptEncoding: fields.acceptEncoding.value.trim(),
      acceptLanguage: fields.acceptLanguage.value.trim(),
      operateCommon: fields.operateCommon.value.trim(),
      originFrom: fields.originFrom.value.trim(),
      xiaomiProtocolFlagCli: fields.xiaomiProtocolFlagCli.value.trim()
    };
  }

  function applySettings(settings) {
    const nextSettings = normalizeSettings(settings);

    fields.requestUrl.value = nextSettings.requestUrl;
    fields.cookie.value = nextSettings.cookie;
    fields.ipRequestBody.value = nextSettings.ipRequestBody;
    fields.passcodeRequestBody.value = nextSettings.passcodeRequestBody;
    fields.accept.value = nextSettings.accept;
    fields.contentType.value = nextSettings.contentType;
    fields.userAgent.value = nextSettings.userAgent;
    fields.connection.value = nextSettings.connection;
    fields.acceptEncoding.value = nextSettings.acceptEncoding;
    fields.acceptLanguage.value = nextSettings.acceptLanguage;
    fields.operateCommon.value = nextSettings.operateCommon;
    fields.originFrom.value = nextSettings.originFrom;
    fields.xiaomiProtocolFlagCli.value = nextSettings.xiaomiProtocolFlagCli;
  }

  function loadSettings() {
    return decodeStoredSettings(readCookieValue(storageKeys.requestConfig));
  }

  function saveSettings(settings) {
    writeCookieValue(storageKeys.requestConfig, encodeStoredSettings(settings));
  }

  function deleteSavedSettings() {
    deleteCookieValue(storageKeys.requestConfig);
  }

  function saveCurrentSettings(showMessage) {
    const settings = collectSettings();
    saveSettings(settings);
    if (showMessage) {
      setStatus('已保存');
    }
    return settings;
  }

  function clearResultState(showToast = true) {
    lastPasscode = '';
    lastRemoteUrl = '';
    setPasscodeResult(passcodePlaceholder, false);
    setRemoteUrl(remoteUrlPlaceholder);
    outputState.url = responsePlaceholder;
    outputState.passcode = responsePlaceholder;
    renderOutput();
    setStatus('URL 和登录码已清空', showToast);
  }

  function clearSavedSettings() {
    deleteSavedSettings();
    applySettings(defaultSettings);
    clearResultState(false);
    setStatus('已删除保存的设置');
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeCurlCommand(command) {
    return command
      .replace(/\\\r?\n/g, ' ')
      .replace(/\r?\n/g, ' ')
      .trim();
  }

  function tokenizeShellCommand(command) {
    const tokens = [];
    let current = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let escaping = false;

    for (let index = 0; index < command.length; index += 1) {
      const char = command[index];

      if (escaping) {
        current += char;
        escaping = false;
        continue;
      }

      if (inSingleQuote) {
        if (char === '\'') {
          inSingleQuote = false;
        } else {
          current += char;
        }
        continue;
      }

      if (inDoubleQuote) {
        if (char === '"') {
          inDoubleQuote = false;
          continue;
        }

        if (char === '\\') {
          const nextChar = command[index + 1];
          if (nextChar === '"' || nextChar === '\\' || nextChar === '$' || nextChar === '`') {
            current += nextChar;
            index += 1;
            continue;
          }
        }

        current += char;
        continue;
      }

      if (/\s/.test(char)) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        continue;
      }

      if (char === '\'') {
        inSingleQuote = true;
        continue;
      }

      if (char === '"') {
        inDoubleQuote = true;
        continue;
      }

      if (char === '\\') {
        escaping = true;
        continue;
      }

      current += char;
    }

    if (escaping) {
      current += '\\';
    }

    if (current) {
      tokens.push(current);
    }

    return tokens;
  }

  function parseHeaderLine(headerLine, requestHeaders) {
    const separatorIndex = headerLine.indexOf(':');
    if (separatorIndex === -1) {
      return;
    }

    const headerName = headerLine.slice(0, separatorIndex).trim();
    const headerValue = headerLine.slice(separatorIndex + 1).trim();

    if (!headerName) {
      return;
    }

    requestHeaders[headerName] = headerValue;
  }

  function readOptionValue(tokens, index, optionName) {
    const value = tokens[index + 1];
    if (typeof value === 'undefined') {
      throw new Error(`${optionName} 缺少值。`);
    }
    return value;
  }

  function parseCurlCommand(command) {
    const normalizedCommand = normalizeCurlCommand(command);
    const tokens = tokenizeShellCommand(normalizedCommand);

    if (!tokens.length) {
      throw new Error('请先粘贴 CURL 命令');
    }

    const curlToken = tokens[0];
    if (!/(^|\/)curl(\.exe)?$/i.test(curlToken)) {
      throw new Error('当前内容不是可识别的 CURL 命令');
    }

    const request = {
      method: 'GET',
      url: '',
      headers: {},
      data: undefined
    };
    let hasBody = false;

    for (let index = 1; index < tokens.length; index += 1) {
      const token = tokens[index];

      if (/^https?:\/\//i.test(token)) {
        request.url = token;
        continue;
      }

      if (token === '-X' || token === '--request') {
        request.method = readOptionValue(tokens, index, token).toUpperCase();
        index += 1;
        continue;
      }

      if (token.startsWith('--request=')) {
        request.method = token.slice('--request='.length).toUpperCase();
        continue;
      }

      if (token === '-H' || token === '--header') {
        parseHeaderLine(readOptionValue(tokens, index, token), request.headers);
        index += 1;
        continue;
      }

      if (token.startsWith('--header=')) {
        parseHeaderLine(token.slice('--header='.length), request.headers);
        continue;
      }

      if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary' || token === '--data-ascii') {
        request.data = readOptionValue(tokens, index, token);
        hasBody = true;
        index += 1;
        continue;
      }

      if (
        token.startsWith('--data=') ||
        token.startsWith('--data-raw=') ||
        token.startsWith('--data-binary=') ||
        token.startsWith('--data-ascii=')
      ) {
        request.data = token.slice(token.indexOf('=') + 1);
        hasBody = true;
        continue;
      }

      if (token === '--url') {
        request.url = readOptionValue(tokens, index, token);
        index += 1;
        continue;
      }

      if (token.startsWith('--url=')) {
        request.url = token.slice('--url='.length);
        continue;
      }

      if (token === '-A' || token === '--user-agent') {
        request.headers['User-Agent'] = readOptionValue(tokens, index, token);
        index += 1;
        continue;
      }

      if (token.startsWith('--user-agent=')) {
        request.headers['User-Agent'] = token.slice('--user-agent='.length);
        continue;
      }

      if (token === '-b' || token === '--cookie') {
        request.headers.Cookie = readOptionValue(tokens, index, token);
        index += 1;
        continue;
      }

      if (token.startsWith('--cookie=')) {
        request.headers.Cookie = token.slice('--cookie='.length);
        continue;
      }
    }

    if (!request.url) {
      throw new Error('未能从 CURL 命令中解析出请求地址');
    }

    if (hasBody && request.method === 'GET') {
      request.method = 'POST';
    }

    return request;
  }

  function appendHeaderIfPresent(headers, name, value) {
    if (value) {
      headers[name] = value;
    }
  }

  function getRequestUrlObject(requestUrl) {
    try {
      return new URL(requestUrl);
    } catch (error) {
      throw new Error('URL 格式不正确，请填写完整的 http 或 https 地址');
    }
  }

  function buildCommonRequestConfig(settings, requestBody) {
    const requestUrlObject = getRequestUrlObject(settings.requestUrl);
    const host = requestUrlObject.host;
    const headers = {
      Host: host,
      'domain-refer': host,
      'MIOT-REQUEST-MODEL': fixedHeaders.miotRequestModel
    };

    appendHeaderIfPresent(headers, 'Accept', settings.accept);
    appendHeaderIfPresent(headers, 'Content-Type', settings.contentType);
    appendHeaderIfPresent(headers, 'User-Agent', settings.userAgent);
    appendHeaderIfPresent(headers, 'Connection', settings.connection);
    appendHeaderIfPresent(headers, 'Accept-Encoding', settings.acceptEncoding);
    appendHeaderIfPresent(headers, 'Accept-Language', settings.acceptLanguage);
    appendHeaderIfPresent(headers, 'Cookie', settings.cookie);
    appendHeaderIfPresent(headers, 'operate-common', settings.operateCommon);
    appendHeaderIfPresent(headers, 'Origin-From', settings.originFrom);
    appendHeaderIfPresent(headers, 'X-XIAOMI-PROTOCAL-FLAG-CLI', settings.xiaomiProtocolFlagCli);

    return {
      method: 'POST',
      url: requestUrlObject.toString(),
      headers,
      data: requestBody
    };
  }

  function requestWithTampermonkey(requestConfig) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: requestConfig.method,
        url: requestConfig.url,
        headers: requestConfig.headers,
        data: requestConfig.data,
        timeout: 30000,
        onload(response) {
          resolve(response);
        },
        onerror(error) {
          reject({
            type: 'error',
            detail: error
          });
        },
        ontimeout() {
          reject({
            type: 'timeout'
          });
        }
      });
    });
  }

  function parseResponseAsJson(responseText, responseHeaders) {
    const contentTypeLine = responseHeaders
      .split(/\r?\n/)
      .find((line) => line.toLowerCase().startsWith('content-type:'));
    const trimmedText = responseText.trim();
    const looksLikeJson = /^[\[{]/.test(trimmedText);
    const isJsonType = Boolean(contentTypeLine && contentTypeLine.toLowerCase().includes('json'));

    if (!trimmedText || (!looksLikeJson && !isJsonType)) {
      return null;
    }

    try {
      return JSON.parse(trimmedText);
    } catch (error) {
      return null;
    }
  }

  function findPasscodeValue(value) {
    if (value === null || typeof value === 'undefined') {
      return '';
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const nestedValue = findPasscodeValue(item);
        if (nestedValue) {
          return nestedValue;
        }
      }
      return '';
    }

    if (typeof value === 'object') {
      for (const key of passcodeKeys) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          const directValue = findPasscodeValue(value[key]);
          if (directValue) {
            return directValue;
          }
        }
      }

      for (const child of Object.values(value)) {
        const nestedValue = findPasscodeValue(child);
        if (nestedValue) {
          return nestedValue;
        }
      }
    }

    return '';
  }

  function findUrlValue(value) {
    if (value === null || typeof value === 'undefined') {
      return '';
    }

    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      const urlMatch = trimmedValue.match(/https?:\/\/[^\s"'<>]+/i);
      return urlMatch ? urlMatch[0] : '';
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const nestedValue = findUrlValue(item);
        if (nestedValue) {
          return nestedValue;
        }
      }
      return '';
    }

    if (typeof value === 'object') {
      const directKeys = ['url', 'ipUrl', 'ip_url', 'link', 'autowebconfig_url', 'webConfigUrl'];

      for (const key of directKeys) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          const directValue = findUrlValue(value[key]);
          if (directValue) {
            return directValue;
          }
        }
      }

      for (const child of Object.values(value)) {
        const nestedValue = findUrlValue(child);
        if (nestedValue) {
          return nestedValue;
        }
      }
    }

    return '';
  }

  function formatResponseText(responseText, parsedJson) {
    if (!parsedJson) {
      return responseText || responsePlaceholder;
    }

    return JSON.stringify(parsedJson, null, 2);
  }

  function renderPasscodeSlots(passcode) {
    return String(passcode)
      .slice(0, 6)
      .split('')
      .map((char) => `<span class="passcode-slot">${escapeHtml(char)}</span>`)
      .join('');
  }

  function collapsePanel() {
    panel.classList.add('is-collapsed');
    closeSettingsModal();
  }

  function clampValue(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function movePanelTo(clientX, clientY, offsetX, offsetY) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const panelWidth = panel.offsetWidth;
    const panelHeight = panel.offsetHeight;
    const nextLeft = clampValue(clientX - offsetX, 0, Math.max(0, viewportWidth - panelWidth));
    const nextTop = clampValue(clientY - offsetY, 0, Math.max(0, viewportHeight - panelHeight));

    panel.style.left = `${nextLeft}px`;
    panel.style.top = `${nextTop}px`;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  }

  function moveCollapsedPanelTo(clientX, clientY) {
    movePanelTo(clientX, clientY, miniToggleDragOffsetX, miniToggleDragOffsetY);
  }

  function stopPanelDrag() {
    const pointerId = activePanelDragPointerId;
    activePanelDragPointerId = null;
    window.removeEventListener('pointermove', handlePanelPointerMove);
    window.removeEventListener('pointerup', handlePanelPointerUp);
    window.removeEventListener('pointercancel', handlePanelPointerUp);

    if (typeof panelTitleNode.releasePointerCapture === 'function' && pointerId !== null) {
      try {
        panelTitleNode.releasePointerCapture(pointerId);
      } catch (error) {
      }
    }
  }

  function handlePanelPointerMove(event) {
    if (event.pointerId !== activePanelDragPointerId || panel.classList.contains('is-collapsed')) {
      return;
    }

    event.preventDefault();
    movePanelTo(event.clientX, event.clientY, panelDragOffsetX, panelDragOffsetY);
  }

  function handlePanelPointerUp(event) {
    if (event.pointerId !== activePanelDragPointerId) {
      return;
    }

    stopPanelDrag();
  }

  function startPanelDrag(event) {
    if (panel.classList.contains('is-collapsed')) {
      return;
    }

    if (typeof event.button === 'number' && event.button !== 0) {
      return;
    }

    const rect = panel.getBoundingClientRect();
    activePanelDragPointerId = event.pointerId;
    panelDragOffsetX = event.clientX - rect.left;
    panelDragOffsetY = event.clientY - rect.top;
    event.preventDefault();

    if (typeof panelTitleNode.setPointerCapture === 'function') {
      panelTitleNode.setPointerCapture(event.pointerId);
    }

    window.addEventListener('pointermove', handlePanelPointerMove);
    window.addEventListener('pointerup', handlePanelPointerUp);
    window.addEventListener('pointercancel', handlePanelPointerUp);
  }

  function clampPanelToViewport() {
    if (!panel.style.left) {
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const rect = panel.getBoundingClientRect();
    const nextLeft = clampValue(rect.left, 0, Math.max(0, viewportWidth - rect.width));
    const nextTop = clampValue(rect.top, 0, Math.max(0, viewportHeight - rect.height));

    panel.style.left = `${nextLeft}px`;
    panel.style.top = `${nextTop}px`;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  }

  function stopMiniToggleDrag() {
    const pointerId = activeMiniTogglePointerId;
    activeMiniTogglePointerId = null;
    window.removeEventListener('pointermove', handleMiniTogglePointerMove);
    window.removeEventListener('pointerup', handleMiniTogglePointerUp);
    window.removeEventListener('pointercancel', handleMiniTogglePointerUp);

    if (typeof miniToggleButtonNode.releasePointerCapture === 'function' && pointerId !== null) {
      try {
        miniToggleButtonNode.releasePointerCapture(pointerId);
      } catch (error) {
      }
    }

    window.setTimeout(() => {
      isMiniToggleDragging = false;
    }, 0);
  }

  function handleMiniTogglePointerMove(event) {
    if (event.pointerId !== activeMiniTogglePointerId || !panel.classList.contains('is-collapsed')) {
      return;
    }

    isMiniToggleDragging = true;
    suppressMiniToggleClick = true;
    moveCollapsedPanelTo(event.clientX, event.clientY);
  }

  function handleMiniTogglePointerUp(event) {
    if (event.pointerId !== activeMiniTogglePointerId) {
      return;
    }

    stopMiniToggleDrag();
  }

  function startMiniToggleDrag(event) {
    if (!panel.classList.contains('is-collapsed')) {
      return;
    }

    if (typeof event.button === 'number' && event.button !== 0) {
      return;
    }

    const rect = panel.getBoundingClientRect();
    activeMiniTogglePointerId = event.pointerId;
    miniToggleDragOffsetX = event.clientX - rect.left;
    miniToggleDragOffsetY = event.clientY - rect.top;
    isMiniToggleDragging = false;
    suppressMiniToggleClick = false;

    if (typeof miniToggleButtonNode.setPointerCapture === 'function') {
      miniToggleButtonNode.setPointerCapture(event.pointerId);
    }

    window.addEventListener('pointermove', handleMiniTogglePointerMove);
    window.addEventListener('pointerup', handleMiniTogglePointerUp);
    window.addEventListener('pointercancel', handleMiniTogglePointerUp);
  }

  function getPasteShortcutLabel() {
    return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent) ? 'Cmd+V' : 'Ctrl+V';
  }

  function formatRequestFailure(error) {
    if (error?.type === 'timeout') {
      return '远程服务在 30 秒内没有返回结果';
    }

    if (error?.detail) {
      return JSON.stringify(error.detail, null, 2);
    }

    return '请求失败';
  }

  function getRequestPreset(kind) {
    if (kind === 'url') {
      return {
        bodyKey: 'ipRequestBody',
        outputKey: 'url',
        loadingText: 'URL 获取中...',
        missingText: '请先填写 URL 接口 POST 数据',
        triggerLabel: 'URL',
        successText: 'URL 已刷新',
        emptyText: 'URL 未获取到，请检查 URL 接口 POST 数据'
      };
    }

    return {
      bodyKey: 'passcodeRequestBody',
      outputKey: 'passcode',
      loadingText: '登录码获取中...',
      missingText: '请先填写登录码 POST 数据',
      triggerLabel: '登录码',
      successText: '登录码已刷新',
      emptyText: '登录码未获取到，请检查登录码 POST 数据'
    };
  }

  function resetRequestDisplay(kind) {
    if (kind === 'url') {
      lastRemoteUrl = '';
      setRemoteUrl(remoteUrlPlaceholder);
      setOutputSection('url', responsePlaceholder);
      return;
    }

    lastPasscode = '';
    setPasscodeResult(passcodePlaceholder, false);
    setOutputSection('passcode', responsePlaceholder);
  }

  async function executeSavedPost(kind, triggerSource) {
    const settings = saveCurrentSettings(false);
    const requestPreset = getRequestPreset(kind);
    const requestBody = settings[requestPreset.bodyKey];

    if (!settings.requestUrl) {
      resetRequestDisplay(kind);
      setStatus('没有 URL，请先填写');
      return;
    }

    if (!requestBody) {
      resetRequestDisplay(kind);
      setStatus(requestPreset.missingText);
      return;
    }

    let commonRequestConfig;
    try {
      commonRequestConfig = buildCommonRequestConfig(settings, '');
    } catch (error) {
      resetRequestDisplay(kind);
      setStatus(error.message);
      return;
    }

    if (kind === 'url') {
      lastRemoteUrl = '';
      setRemoteUrl(requestPreset.loadingText);
    } else {
      lastPasscode = '';
      setPasscodeResult(requestPreset.loadingText, false);
    }

    setOutputSection(requestPreset.outputKey, '请求中...');
    setStatus(`${triggerSource}，正在请求${requestPreset.triggerLabel}...`);

    try {
      const response = await requestWithTampermonkey({
        ...commonRequestConfig,
        data: requestBody
      });
      const parsedJson = parseResponseAsJson(response.responseText, response.responseHeaders || '');
      const formattedText = formatResponseText(response.responseText, parsedJson);

      setOutputSection(requestPreset.outputKey, formattedText);

      if (kind === 'url') {
        const remoteUrl = findUrlValue(parsedJson?.result ?? parsedJson ?? response.responseText);

        if (remoteUrl) {
          lastRemoteUrl = remoteUrl;
          setRemoteUrl(remoteUrl);
          setStatus(requestPreset.successText);
          return;
        }

        lastRemoteUrl = '';
        setRemoteUrl(remoteUrlPlaceholder);
        setStatus(requestPreset.emptyText);
        return;
      }

      const passcode = parsedJson ? findPasscodeValue(parsedJson.result?.passcode ?? parsedJson.passcode ?? parsedJson) : '';

      if (passcode) {
        lastPasscode = passcode;
        setPasscodeResult(passcode, true);
        setStatus(requestPreset.successText);
        return;
      }

      lastPasscode = '';
      setPasscodeResult('未提取到 passcode', false);
      setStatus(requestPreset.emptyText);
    } catch (error) {
      if (kind === 'url') {
        lastRemoteUrl = '';
        setRemoteUrl(remoteUrlPlaceholder);
      } else {
        lastPasscode = '';
        setPasscodeResult(error?.type === 'timeout' ? '请求超时' : '请求失败', false);
      }

      setOutputSection(requestPreset.outputKey, formatRequestFailure(error));
      setStatus(`${requestPreset.triggerLabel}请求失败，请检查对应 POST 参数`);
    }
  }

  function executeAutoFetchOnOpen() {
    const settings = loadSettings();

    if (settings.ipRequestBody) {
      executeSavedPost('url', '打开面板后自动获取 URL');
    }

    if (settings.passcodeRequestBody) {
      executeSavedPost('passcode', '打开面板后自动获取登录码');
    }
  }

  function copyPasscodeToClipboard(showStatus) {
    if (!lastPasscode) {
      if (showStatus) {
        setStatus('当前没有可复制的登录码');
      }
      return Promise.resolve(false);
    }

    if (typeof GM_setClipboard === 'function') {
      GM_setClipboard(lastPasscode, 'text');
      if (showStatus) {
        setStatus('登录码已复制到剪贴板');
      }
      return Promise.resolve(true);
    }

    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(lastPasscode)
        .then(() => {
          if (showStatus) {
            setStatus('登录码已复制到剪贴板');
          }
          return true;
        })
        .catch(() => {
          if (showStatus) {
            setStatus('复制失败，请手动复制');
          }
          return false;
        });
    }

    if (showStatus) {
      setStatus('当前环境不支持自动复制');
    }
    return Promise.resolve(false);
  }

  function copyPasscode() {
    copyPasscodeToClipboard(true).then((copied) => {
      if (copied) {
        collapsePanel();
      }
    });
  }

  function delay(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function normalizeElementText(element) {
    return (element.textContent || '').replace(/\s+/g, '').trim();
  }

  function dispatchClickSequence(element) {
    const eventView = element.ownerDocument?.defaultView || null;
    const mouseOptions = {
      bubbles: true,
      cancelable: true,
      view: eventView
    };

    try {
      element.dispatchEvent(new MouseEvent('mouseover', mouseOptions));
      element.dispatchEvent(new MouseEvent('mousemove', mouseOptions));
      element.dispatchEvent(new MouseEvent('mousedown', mouseOptions));
      element.dispatchEvent(new MouseEvent('mouseup', mouseOptions));
    } catch (error) {
      element.dispatchEvent(new Event('mouseover', { bubbles: true, cancelable: true }));
      element.dispatchEvent(new Event('mousemove', { bubbles: true, cancelable: true }));
      element.dispatchEvent(new Event('mousedown', { bubbles: true, cancelable: true }));
      element.dispatchEvent(new Event('mouseup', { bubbles: true, cancelable: true }));
    }

    element.click();
  }

  function buildPinButtonMap(container) {
    const buttonMap = {};
    const candidates = Array.from(container.querySelectorAll('.pin-number, .pin-delete, button, [role="button"], div'))
      .filter((element) => !panel.contains(element));

    for (const element of candidates) {
      const text = normalizeElementText(element);
      if (/^\d$/.test(text) && !buttonMap[text]) {
        buttonMap[text] = element;
      }
    }

    return buttonMap;
  }

  function findPinButtonMap(passcode) {
    const containers = Array.from(document.querySelectorAll('.pin-keyboard'))
      .filter((element) => !panel.contains(element));

    for (const container of containers) {
      const buttonMap = buildPinButtonMap(container);
      const hasAllDigits = passcode.split('').every((digit) => buttonMap[digit]);
      if (hasAllDigits) {
        return buttonMap;
      }
    }

    return null;
  }

  async function tryFillPasscodeWithPinKeyboard(passcode) {
    if (!/^\d+$/.test(passcode)) {
      return false;
    }

    const buttonMap = findPinButtonMap(passcode);
    if (!buttonMap) {
      return false;
    }

    for (const digit of passcode.split('')) {
      dispatchClickSequence(buttonMap[digit]);
      await delay(60);
    }

    return true;
  }

  async function fillPasscodeIntoPage() {
    if (!lastPasscode) {
      setStatus('当前没有可填入页面的登录码');
      return;
    }

    const copied = await copyPasscodeToClipboard(false);
    if (!copied) {
      setStatus('复制失败，请先允许剪贴板权限后重试');
      return;
    }

    let filledByPinKeyboard = false;
    try {
      filledByPinKeyboard = await tryFillPasscodeWithPinKeyboard(lastPasscode);
    } catch (error) {
      console.error('数字键盘点击失败：', error);
    }

    if (filledByPinKeyboard) {
      setStatus('登录码已填入');
      collapsePanel();
      return;
    }

    setStatus(`登录码已复制，请在网页中手动按 ${getPasteShortcutLabel()}`);
    collapsePanel();
  }

  function openSettingsModal() {
    settingsModalNode.classList.add('is-open');
  }

  function closeSettingsModal() {
    settingsModalNode.classList.remove('is-open');
  }

  function togglePanel() {
    const shouldOpen = panel.classList.contains('is-collapsed');
    panel.classList.toggle('is-collapsed');

    if (!shouldOpen) {
      closeSettingsModal();
    }

    if (shouldOpen) {
      window.requestAnimationFrame(clampPanelToViewport);
      executeAutoFetchOnOpen();
    }
  }

  settingsModalNode.addEventListener('click', (event) => {
    if (event.target === settingsModalNode) {
      closeSettingsModal();
    }
  });

  panelTitleNode.addEventListener('pointerdown', startPanelDrag);
  miniToggleButtonNode.addEventListener('pointerdown', startMiniToggleDrag);
  window.addEventListener('resize', clampPanelToViewport);

  panel.addEventListener('click', (event) => {
    const actionNode = event.target instanceof Element ? event.target.closest('[data-action]') : null;
    const action = actionNode?.getAttribute('data-action');

    if (action === 'toggle') {
      if (suppressMiniToggleClick) {
        suppressMiniToggleClick = false;
        return;
      }
      togglePanel();
      return;
    }

    if (action === 'open-settings') {
      openSettingsModal();
      return;
    }

    if (action === 'save') {
      saveCurrentSettings(true);
      closeSettingsModal();
      setStatus('已保存并关闭设置');
      return;
    }

    if (action === 'clear-saved') {
      clearSavedSettings();
      return;
    }

    if (action === 'clear') {
      clearResultState();
      return;
    }

    if (action === 'close-settings') {
      closeSettingsModal();
      return;
    }

    if (action === 'fetch-url') {
      executeSavedPost('url', '手动获取 URL');
      return;
    }

    if (action === 'fetch-passcode') {
      executeSavedPost('passcode', '手动获取登录码');
      return;
    }

    if (action === 'copy') {
      copyPasscode();
      return;
    }

    if (action === 'fill-page') {
      fillPasscodeIntoPage();
    }
  });

  applySettings(loadSettings());
  setRemoteUrl(remoteUrlPlaceholder);
  clearResultState(false);
})();
