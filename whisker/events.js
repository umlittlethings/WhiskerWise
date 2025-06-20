const { fromEvent, interval, merge } = rxjs;
const { takeUntil, filter, throttleTime } = rxjs.operators;

export function setupEventListenersRx(instance) {
  const buttonMap = [
    { id: 'feedBtn', action: 'feed' },
    { id: 'playBtn', action: 'play' },
    { id: 'sleepBtn', action: 'sleep' },
    { id: 'healBtn', action: 'heal' },
    { id: 'petBtn', action: 'pet' },
    { id: 'groomBtn', action: 'groom' }
  ];

  buttonMap.forEach(({ id, action }) => {
    const btn = document.getElementById(id);
    if (btn) {
      fromEvent(btn, 'click')
        .pipe(takeUntil(instance.destroy$))
        .subscribe(() => instance.performAction(action));
    }
  });

  const sprite = document.getElementById('felixSprite');
  if (sprite) {
    fromEvent(sprite, 'click')
      .pipe(takeUntil(instance.destroy$))
      .subscribe(() => instance.onFelixClick());
  }

  const foodBowl = document.getElementById('foodBowl');
  if (foodBowl) {
    fromEvent(foodBowl, 'click')
      .pipe(takeUntil(instance.destroy$))
      .subscribe(() => instance.performAction('feed'));
  }

  const toyBall = document.getElementById('toyBall');
  if (toyBall) {
    fromEvent(toyBall, 'click')
      .pipe(takeUntil(instance.destroy$))
      .subscribe(() => instance.performAction('play'));
  }

  const petBed = document.getElementById('petBed');
  if (petBed) {
    fromEvent(petBed, 'click')
      .pipe(takeUntil(instance.destroy$))
      .subscribe(() => instance.performAction('sleep'));
  }

  fromEvent(document, 'keydown')
    .pipe(
      filter(e => !['INPUT', 'TEXTAREA'].includes(e.target.tagName)),
      takeUntil(instance.destroy$)
    )
    .subscribe(e => instance.handleKeyboard(e));
}
