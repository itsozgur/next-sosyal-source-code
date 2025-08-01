import './public-path';
import ready from '../mastodon/ready';

ready(() => {
  const image = document.querySelector<HTMLImageElement>('.error-image');
  const errorMessage = document.querySelector<HTMLElement>('.error-message');
  const returnButton = document.querySelector<HTMLElement>('.return-button');
  const errorPage = document.querySelector<HTMLElement>('.error-page');
  const errorContent = document.querySelector<HTMLElement>('.error-content');

  if (!image || !errorMessage || !returnButton || !errorPage || !errorContent) return;


  const backgroundTransition = document.createElement('div');
  backgroundTransition.style.position = 'absolute';
  backgroundTransition.style.inset = '0';
  backgroundTransition.style.zIndex = '20';
  errorPage.appendChild(backgroundTransition);
  const grain = document.createElement('div');
  grain.style.position = 'absolute';
  grain.style.inset = '0';
  grain.style.backgroundImage = 'url("/grain.png")';
  grain.style.backgroundSize = 'cover';
  grain.style.backgroundPosition = 'center';
  grain.style.opacity = '0';
  backgroundTransition.appendChild(grain);

  // Create bg1
  const bg1 = document.createElement('div');
  bg1.style.position = 'absolute';
  bg1.style.inset = '0';
  bg1.style.backgroundImage = 'url("/bg1.png")';
  bg1.style.backgroundSize = 'cover';
  bg1.style.backgroundPosition = 'center';
  bg1.style.opacity = '0';
  backgroundTransition.appendChild(bg1);

  // Create bg2
  const bg2 = document.createElement('div');
  bg2.style.position = 'absolute';
  bg2.style.inset = '0';
  bg2.style.backgroundImage = 'url("/bg2.png")';
  bg2.style.backgroundSize = 'cover';
  bg2.style.backgroundPosition = 'center';
  bg2.style.opacity = '0';
  backgroundTransition.appendChild(bg2);

  // Set page styles
  errorPage.style.position = 'relative';
  errorPage.style.height = '100vh';
  errorPage.style.width = '100%';
  errorPage.style.background = 'black';
  errorPage.style.overflow = 'hidden';

  // Set content styles
  errorContent.style.position = 'absolute';
  errorContent.style.inset = '0';
  errorContent.style.display = 'flex';
  errorContent.style.flexDirection = 'column';
  errorContent.style.alignItems = 'center';
  errorContent.style.justifyContent = 'center';
  errorContent.style.textAlign = 'center';
  errorContent.style.color = 'white';
  errorContent.style.padding = '1rem';
  errorContent.style.zIndex = '30';

  // Responsive image styles
  const setImageSize = () => {
    const width = window.innerWidth;
    if (width <= 480) { 
      image.style.width = '280px';
    } else if (width <= 768) { 
      image.style.width = '480px';
    } else { 
      image.style.width = '920px';
    }
  };


  setImageSize();
  image.style.height = 'auto';
  image.style.objectFit = 'contain';
  image.style.transition = 'all 0.3s ease';

  // Responsive error message styles
  const setMessageSize = () => {
    const width = window.innerWidth;
    if (width <= 480) { // Mobile
      errorMessage.style.fontSize = '1rem';
      errorMessage.style.marginBottom = '1rem';
    } else if (width <= 768) { // Tablet
      errorMessage.style.fontSize = '2rem';
      errorMessage.style.marginBottom = '1.5rem';
    } else { // Desktop
      errorMessage.style.fontSize = '2.5rem';
      errorMessage.style.marginBottom = '2rem';
    }
  };

  // Set initial message size
  setMessageSize();
  errorMessage.style.fontWeight = '700';
  errorMessage.style.fontFamily = "'Inter', sans-serif";
  errorMessage.style.color = 'white';
  errorMessage.style.opacity = '0';
  errorMessage.style.transform = 'translateY(20px)';

  // Responsive button styles
  const setButtonSize = () => {
    const width = window.innerWidth;
    if (width <= 480) { // Mobile
      returnButton.style.padding = '0.75rem 1.5rem';
      returnButton.style.fontSize = '0.9rem';
    } else { // Tablet and Desktop
      returnButton.style.padding = '1rem 2rem';
      returnButton.style.fontSize = '1rem';
    }
  };

  // Set initial button size
  setButtonSize();
  returnButton.style.background = '#0066cc';
  returnButton.style.color = 'white';
  returnButton.style.borderRadius = '9999px';
  returnButton.style.fontWeight = '600';
  returnButton.style.transition = 'all 0.2s';
  returnButton.style.fontFamily = "'Inter', sans-serif";
  returnButton.style.border = 'none';
  returnButton.style.cursor = 'pointer';
  returnButton.style.opacity = '0';
  returnButton.style.transform = 'translateY(20px)';

  // Add window resize listener
  window.addEventListener('resize', () => {
    setImageSize();
    setMessageSize();
    setButtonSize();
  });

  // Add animations
  const animateElements = () => {
    // Animate error message
    errorMessage.style.transition = 'all 0.5s ease';
    errorMessage.style.opacity = '1';
    errorMessage.style.transform = 'translateY(0)';

    // Animate button
    returnButton.style.transition = 'all 0.5s ease';
    returnButton.style.opacity = '1';
    returnButton.style.transform = 'translateY(0)';

    // Animate backgrounds
    grain.style.transition = 'opacity 2s ease';
    bg1.style.transition = 'opacity 2s ease';
    bg2.style.transition = 'opacity 2s ease';

    setTimeout(() => {
      grain.style.opacity = '0.05';
    }, 500);

    setTimeout(() => {
      bg1.style.opacity = '1';
    }, 800);

    setTimeout(() => {
      bg2.style.opacity = '1';
    }, 1000);
  };

  // Start animations after a short delay
  setTimeout(animateElements, 100);

  // Add hover effect
  returnButton.addEventListener('mouseenter', () => {
    returnButton.style.background = '#0052a3';
    returnButton.style.transform = 'scale(1.05)';
  });

  returnButton.addEventListener('mouseleave', () => {
    returnButton.style.background = '#0066cc';
    returnButton.style.transform = 'scale(1)';
  });

  // Add click animation
  returnButton.addEventListener('click', () => {
    errorContent.style.transition = 'all 1s ease';
    errorContent.style.opacity = '0';
    errorContent.style.transform = 'translateY(-20px)';

    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  });
}).catch((e: unknown) => {
  console.error(e);
});
