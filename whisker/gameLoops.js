const { fromEvent, interval, merge } = rxjs;
const { takeUntil, filter, throttleTime } = rxjs.operators;

export function startGameLoops(instance) {
  interval(1000)
    .pipe(takeUntil(instance.destroy$))
    .subscribe(() => {
      if (instance.isGameActive) {
        instance.updateGameClock();
        instance.updateUI();
      }
    });

  interval(8000)
    .pipe(takeUntil(instance.destroy$))
    .subscribe(() => instance.updateStat('hunger', -2));

  interval(12000)
    .pipe(takeUntil(instance.destroy$))
    .subscribe(() => {
      let decay = -1;
      if (instance.stats.hunger < 30) decay = -2;
      instance.updateStat('happiness', decay);
    });

  interval(15000)
    .pipe(takeUntil(instance.destroy$))
    .subscribe(() => instance.updateStat('energy', -1));

  interval(30000)
    .pipe(takeUntil(instance.destroy$))
    .subscribe(() => {
      if (instance.autoSaveEnabled) instance.saveGameData();
    });
}
