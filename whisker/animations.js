export function setAnimation(instance, type, duration = 0, felixSays = '') {
  const spriteImage = document.getElementById('spriteImage');
  const felixSprite = document.getElementById('felixSprite');
  const speechBubble = document.getElementById('speechBubble');
  const bubbleText = document.getElementById('bubbleText');

  if (!spriteImage || !felixSprite) return;


  const spriteSrc = instance.spriteMap[type];
  spriteImage.src = spriteSrc || '';


  felixSprite.className = 'felix-sprite ' + type;

  instance.currentState = type;
  instance.isAnimating = true;

 
  if (felixSays && speechBubble && bubbleText) {
    bubbleText.textContent = felixSays;
    speechBubble.classList.add('show');
  }

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