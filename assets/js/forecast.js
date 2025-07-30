// Forecast toggle functionality
function toggleForecast() {
  const content = document.getElementById("forecast-content");
  const toggle = document.querySelector(".forecast-toggle");

  if (content.classList.contains("collapsed")) {
    // Expand
    content.classList.remove("collapsed");
    content.style.maxHeight = content.scrollHeight + "px";
    toggle.classList.remove("collapsed");
  } else {
    // Collapse
    content.classList.add("collapsed");
    content.style.maxHeight = "0px";
    toggle.classList.add("collapsed");
  }
}

// Initialize forecast state based on screen size
function initializeForecastState() {
  const content = document.getElementById("forecast-content");
  const toggle = document.querySelector(".forecast-toggle");

  if (!content || !toggle) return;

  // Check if mobile (480px breakpoint to match CSS)
  const isMobile = window.innerWidth <= 480;

  if (isMobile) {
    // Mobile: start collapsed
    content.classList.add("collapsed");
    content.style.maxHeight = "0px";
    toggle.classList.add("collapsed");
  } else {
    // Desktop: start expanded
    content.classList.remove("collapsed");
    content.style.maxHeight = content.scrollHeight + "px";
    toggle.classList.remove("collapsed");
  }
}

// Handle window resize - recalculate max-height if expanded
function handleForecastResize() {
  const content = document.getElementById("forecast-content");
  if (content && !content.classList.contains("collapsed")) {
    content.style.maxHeight = content.scrollHeight + "px";
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  initializeForecastState();
});

// Handle window resize
window.addEventListener("resize", function () {
  handleForecastResize();
});
