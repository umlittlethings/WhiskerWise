export function updateStatsDisplay(stats) {
  Object.entries(stats).forEach(([stat, value]) => {
    const fillElement = document.getElementById(`${stat}Fill`);
    const textElement = document.getElementById(`${stat}Text`);
    const cardElement = fillElement?.closest('.stat-card');

    if (fillElement && textElement) {
      fillElement.style.width = `${value}%`;
      textElement.textContent = `${value}%`;

      if (cardElement) {
        cardElement.classList.remove('critical', 'warning');
        if (value <= 20) cardElement.classList.add('critical');
        else if (value <= 40) cardElement.classList.add('warning');
      }
    }
  });
}

export function updateElementText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

export function showNotification(message, type = 'success') {
  const container = document.getElementById('notificationContainer');
  if (!container) return;

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  container.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 100);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}
