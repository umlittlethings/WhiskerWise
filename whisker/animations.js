export function setAnimation(instance, type, duration = 0, felixSays = '') {
  const spriteImage = document.getElementById('spriteImage');
  const felixSprite = document.getElementById('felixSprite');
  const speechBubble = document.getElementById('speechBubble');
  const bubbleText = document.getElementById('bubbleText');

  if (!spriteImage || !felixSprite) return;

  // Ganti src gambar
  const spriteSrc = instance.spriteMap[type];
  spriteImage.src = spriteSrc || '';

  // Ganti class animasi pada felix-sprite
  felixSprite.className = 'felix-sprite ' + type;

  instance.currentState = type;
  instance.isAnimating = true;

  // Tampilkan dialog jika ada
  if (felixSays && speechBubble && bubbleText) {
    bubbleText.textContent = felixSays;
    speechBubble.classList.add('show');
  }

  // Reset ke idle setelah durasi selesai
  if (duration > 0) {
    clearTimeout(instance.animationTimeout);
    instance.animationTimeout = setTimeout(() => {
      instance.isAnimating = false;
      if (speechBubble) speechBubble.classList.remove('show');
      setAnimation(instance, 'idle');
    }, duration);
  } else {
    if (speechBubble) speechBubble.classList.remove('show');
  }
}