// Mobile Drawer Toggle
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

// Form Submission Integration
const contactForm = document.querySelector('.contact-form');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerText;
  
  // Extract inputs
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const details = document.getElementById('details').value.trim();

  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerText = 'Sending...';

  try {
    const response = await fetch('https://city-money-backened.onrender.com/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, details })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      alert(result.message);
      contactForm.reset();
    } else {
      alert(result.message || 'Something went wrong.');
    }
  } catch (err) {
    console.error('Network Error:', err);
    alert('Unable to reach backend server. Check if server.js is running.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = originalBtnText;
  }
});