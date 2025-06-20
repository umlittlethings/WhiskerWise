import { WhiskerPet } from './whisker/WhiskerPet.js';

document.addEventListener('DOMContentLoaded', () => {
  window.virtualPet = new WhiskerPet();

  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target.id === 'modalOverlay') {
        window.virtualPet.closeModal();
      }
    });
  }
});