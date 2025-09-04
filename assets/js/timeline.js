// Timeline control functionality
let isLiveMode = true;
let currentTimeOffset = 0; // minutes from current time
let timelineAnimationId = null;

// Time formatting functions
function formatTime(date) {
  // 24-hour format HH:MM:SS
  return date.toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatDateTime(date) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

// Update current time display
function updateCurrentTime() {
  const now = new Date();
  const displayTime = new Date(now.getTime() + currentTimeOffset * 60000);

  const timeElement = document.getElementById("current-time");
  const statusElement = document.getElementById("timeline-status");

  if (timeElement) {
    timeElement.textContent = formatTime(displayTime);
  }

  if (statusElement) {
    statusElement.textContent = "Current Time";
  }
}

// Update timeline handle position
function updateTimelineHandle() {
  // Convert offset (-30 to +30 minutes) to percentage (0 to 100%)
  const percentage = ((currentTimeOffset + 30) / 60) * 100;
  const handle = document.getElementById("timeline-handle");
  if (handle) {
    handle.style.left = `${Math.max(0, Math.min(100, percentage))}%`;
  }
}

// Timeline control functions
function replayRadar() {}

function goLive() {}

function showForecast() {}

// Animate replay from -30 minutes to current time
function animateReplay() {
  const startTime = Date.now();
  const duration = 5000; // 5 seconds total animation
  const startOffset = -30;
  const endOffset = 0;

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Eased animation
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    currentTimeOffset = startOffset + (endOffset - startOffset) * easedProgress;

    updateCurrentTime();
    updateTimelineHandle();

    // Continue animation or go live when done
    if (progress < 1) {
      timelineAnimationId = requestAnimationFrame(animate);
    } else {
      // Animation complete - go to live mode
      setTimeout(() => {
        goLive();
      }, 500);
    }
  }

  timelineAnimationId = requestAnimationFrame(animate);
}

// Update button states
function updateTimelineButtons() {}

// Handle timeline slider clicks
function handleTimelineClick(event) {}

// Dragging functionality for timeline handle
let isDragging = false;

function initTimelineDragging() {
  const handle = document.getElementById("timeline-handle");
  const slider = document.getElementById("timeline-slider");

  if (!handle || !slider) return;

  handle.addEventListener("mousedown", startDrag);
  handle.addEventListener("touchstart", startDrag, { passive: false });

  function startDrag(event) {
    isDragging = true;
    event.preventDefault();

    document.addEventListener("mousemove", drag);
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchend", stopDrag);
  }

  function drag(event) {
    if (!isDragging) return;

    event.preventDefault();
    const rect = slider.getBoundingClientRect();
    const clientX =
      event.clientX || (event.touches && event.touches[0].clientX);
    const dragX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (dragX / rect.width) * 100));

    // Convert percentage to time offset
    currentTimeOffset = Math.round((percentage / 100) * 60 - 30);
    currentTimeOffset = Math.max(-30, Math.min(30, currentTimeOffset));

    // Update mode
    isLiveMode = currentTimeOffset === 0;

    // Update UI
    updateTimelineButtons();
    updateCurrentTime();
    updateTimelineHandle();
  }

  function stopDrag() {
    isDragging = false;
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("touchmove", drag);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchend", stopDrag);

    console.log(`Timeline dragged to: ${currentTimeOffset} minutes offset`);
  }
}

// Initialize timeline when DOM is ready
function initializeTimeline() {
  updateCurrentTime();
  updateTimelineHandle();
  updateTimelineButtons();
  initTimelineDragging();

  // Update time display every second
  setInterval(() => {
    updateCurrentTime();
  }, 1000);
}

// Last updated timestamp functionality
let lastUpdateTime = null;

function updateLastUpdatedTime() {
  lastUpdateTime = new Date();
  const element = document.getElementById("last-updated");
  if (element) {
    element.textContent = `Last updated: ${formatDateTime(lastUpdateTime)}`;
  }
}

// Call when weather data is updated
function markDataAsUpdated() {
  updateLastUpdatedTime();
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeTimeline();
  updateLastUpdatedTime();
});

// Export functions for use by main.js and global scope
window.replayRadar = replayRadar;
window.goLive = goLive;
window.showForecast = showForecast;
window.handleTimelineClick = handleTimelineClick;

window.timelineControls = {
  markDataAsUpdated,
  updateLastUpdatedTime,
  isLiveMode: () => isLiveMode,
  getCurrentTimeOffset: () => currentTimeOffset,
  updateCurrentTime,
  updateTimelineHandle,
  updateTimelineButtons,
};
