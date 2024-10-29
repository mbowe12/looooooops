document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  
  // Show the modal when the page loads
  modal.style.display = 'block';

  // Close the modal when the user clicks the close button
  closeModal.onclick = function() {
    modal.style.display = 'none';
  }

  const buttonMap = {
    'F': 'left-top',
    'V': 'left-bottom',
    'J': 'right-top',
    'N': 'right-bottom',
    'G': 'top-left',
    'H': 'top-right'
  };

  // Create a reverse map for button-to-key mapping
  const reverseButtonMap = Object.fromEntries(
    Object.entries(buttonMap).map(([key, value]) => [value, key])
  );

  function handleKeyEvent(event, isKeyDown) {
    const key = event.key.toUpperCase();
    if (buttonMap.hasOwnProperty(key)) {
      const button = document.querySelector(`.${buttonMap[key]}`);
      if (isKeyDown) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    }
  }

  function simulateKeyEvent(key, isKeyDown) {
    const event = new KeyboardEvent(isKeyDown ? 'keydown' : 'keyup', { key: key });
    document.dispatchEvent(event);
  }

  function handleButtonEvent(event, isPressed) {
    const button = event.target;
    const buttonClass = Array.from(button.classList).find(cls => reverseButtonMap.hasOwnProperty(cls));
    
    if (buttonClass) {
      const key = reverseButtonMap[buttonClass];
      simulateKeyEvent(key, isPressed);
    }
  }

  document.addEventListener('keydown', function(event) {
    handleKeyEvent(event, true);
  });

  document.addEventListener('keyup', function(event) {
    handleKeyEvent(event, false);
  });

  // Add touch event listeners for mobile devices
  document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('touchstart', function(event) {
      event.preventDefault();
      handleButtonEvent(event, true);
    });

    button.addEventListener('touchend', function(event) {
      event.preventDefault();
      handleButtonEvent(event, false);
    });
  });
});
