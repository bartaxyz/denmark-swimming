/**
 * Shared JavaScript injected into WebViews to intercept beach data API responses.
 * Hooks into fetch, XMLHttpRequest, and periodically checks the DOM for data.
 */
export const INJECTED_JAVASCRIPT = `
  (function() {
    function isBeachData(text) {
      try {
        const data = JSON.parse(text);
        return Array.isArray(data) && data.length > 0 &&
               data[0].id !== undefined && data[0].latitude !== undefined;
      } catch (e) {
        return false;
      }
    }

    function sendData(text) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'DATA_RECEIVED',
        data: text
      }));
    }

    function checkForData() {
      const url = window.location.href;
      if (url.includes('badevand.dk/api/next/beaches') || url.includes('api/next/beaches')) {
        const bodyText = document.body.innerText || document.body.textContent;
        if (isBeachData(bodyText)) {
          sendData(bodyText);
        }
      }
    }

    // Intercept fetch
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const url = args[0];
      const response = await originalFetch.apply(this, args);

      if (typeof url === 'string' && (url.includes('badevand.dk/api/next/beaches') || url.includes('api/next/beaches'))) {
        try {
          const clone = response.clone();
          const text = await clone.text();
          if (isBeachData(text)) {
            sendData(text);
          }
        } catch (e) {}
      }
      return response;
    };

    // Intercept XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      this._url = url;
      return originalXHROpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      const xhr = this;
      const originalOnReadyStateChange = xhr.onreadystatechange;

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr._url && xhr._url.includes('api/next/beaches')) {
          try {
            if (xhr.status === 200 && isBeachData(xhr.responseText)) {
              sendData(xhr.responseText);
            }
          } catch (e) {}
        }
        if (originalOnReadyStateChange) {
          originalOnReadyStateChange.apply(this, arguments);
        }
      };

      return originalXHRSend.apply(this, args);
    };

    setInterval(checkForData, 2000);
    window.addEventListener('load', checkForData);

    let lastUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        setTimeout(checkForData, 500);
      }
    }, 500);
  })();
  true;
`;
