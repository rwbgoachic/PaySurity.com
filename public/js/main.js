// Main JavaScript for PaySurity dark theme

document.addEventListener('DOMContentLoaded', function() {
  // Mobile navigation toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  if (mobileMenuToggle) {
    const mobileNav = document.getElementById('mobile-nav');
    mobileMenuToggle.addEventListener('click', function() {
      mobileNav.classList.toggle('mobile-nav-open');
      mobileMenuToggle.setAttribute(
        'aria-expanded', 
        mobileMenuToggle.getAttribute('aria-expanded') === 'false' ? 'true' : 'false'
      );
    });
  }

  // FAQ accordion functionality
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      // Toggle active class on the current item
      item.classList.toggle('active');
      
      // Set aria-expanded attribute for accessibility
      const expanded = item.classList.contains('active');
      question.setAttribute('aria-expanded', expanded);
    });
  });

  // Simple form validation
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const requiredInputs = form.querySelectorAll('[required]');
      let isValid = true;
      
      requiredInputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          // Add error class
          input.classList.add('error');
          
          // Create or update error message
          let errorMsg = input.nextElementSibling;
          if (!errorMsg || !errorMsg.classList.contains('error-message')) {
            errorMsg = document.createElement('span');
            errorMsg.classList.add('error-message');
            input.parentNode.insertBefore(errorMsg, input.nextSibling);
          }
          errorMsg.textContent = `${input.getAttribute('data-name') || 'This field'} is required`;
        } else {
          input.classList.remove('error');
          const errorMsg = input.nextElementSibling;
          if (errorMsg && errorMsg.classList.contains('error-message')) {
            errorMsg.textContent = '';
          }
        }
      });
      
      if (!isValid) {
        e.preventDefault();
      }
    });
  });

  // Make external links open in a new tab with proper security attributes
  const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
  externalLinks.forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
});

// Intersection Observer for animation on scroll
document.addEventListener('DOMContentLoaded', function() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  if (animatedElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          // Optionally stop observing the element after it's animated
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    
    animatedElements.forEach(element => {
      observer.observe(element);
    });
  }
});