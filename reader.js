(() => {
  const id = "lights-out-reader-style";

  const css = `
    :root {
      color-scheme: dark !important;
    }

    html {
      filter: invert(1) hue-rotate(180deg) !important;
      background: #fff !important;
    }

    img,
    picture,
    video,
    canvas,
    iframe,
    embed,
    object,
    svg,
    [style*="background-image"] {
      filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(1.05) !important;
    }
  `;

  function setReaderMode(enabled) {
    const existing = document.getElementById(id);

    if (!enabled) {
      existing?.remove();
      document.documentElement.dataset.lightsOutReader = "off";
      return;
    }

    if (!existing) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = css;
      document.documentElement.append(style);
    }

    document.documentElement.dataset.lightsOutReader = "on";
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "LIGHTS_OUT_READER_SET") {
      setReaderMode(Boolean(message.enabled));
    }
  });
})();
