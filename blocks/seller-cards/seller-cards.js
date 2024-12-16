import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const carts = document.createElement('carts');
  carts.className = 'carousel-carts';

  Array.from(block.children).map((row) => {
    const item = document.createElement('item');
    item.className = 'carousel-item';
    while (row.firstElementChild) item.append(row.firstElementChild);

    Array.from(item.children).forEach((div) => {
      div.className = div.querySelector('picture') ? 'carousel-image' : 'carousel-body';
    });

    carts.append(item);
    return item;
  });

  carts.querySelectorAll('picture > img').forEach((img) => img
    .closest('picture')
    .replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    ));

  block.textContent = '';

  const carouselCarts = document.createElement('div');
  carouselCarts.className = 'carousel-cards';

  const carouselDots = document.createElement('div');
  carouselDots.className = 'carousel-dots';

  const prevButton = document.createElement('button');
  prevButton.className = 'carousel-prev';
  prevButton.textContent = '';

  const nextButton = document.createElement('button');
  nextButton.className = 'carousel-next';
  nextButton.textContent = '';

  carouselCarts.append(carts);
  block.append(carouselCarts, carouselDots, prevButton, nextButton);

  let currentIndex = 0;
  const items = carts.querySelectorAll('.carousel-item');
  let itemsPerPage = window.innerWidth >= 900 ? 5 : 2;
  const slideInterval = 5000;
  let autoSlideInterval;

  const updateCarousel = () => {
    items.forEach((item, index) => {
      if (index >= currentIndex && index < currentIndex + itemsPerPage) {
        item.style.display = 'block';
        item.style.opacity = '1';
      } else {
        item.style.opacity = '0';
        setTimeout(() => {
          item.style.display = 'none';
        }, 300);
      }
    });

    prevButton.classList.toggle('disabled', currentIndex === 0);
    nextButton.classList.toggle(
      'disabled',
      currentIndex + itemsPerPage >= items.length,
    );

    // updateDots();
  };

  const slideNext = () => {
    if (currentIndex + itemsPerPage < items.length) {
      currentIndex += itemsPerPage;
    } else {
      currentIndex = 0;
    }
    updateCarousel();
  };

  const stopAutoSlide = () => {
    clearInterval(autoSlideInterval);
  };
  const startAutoSlide = () => {
    stopAutoSlide();
    autoSlideInterval = setInterval(slideNext, slideInterval);
  };

  const updateDots = () => {
    carouselDots.innerHTML = '';
    const pages = Math.ceil(items.length / itemsPerPage);
    for (let i = 0; i < pages; i += 1) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      if (i === Math.floor(currentIndex / itemsPerPage)) {
        dot.classList.add('active');
      }

      // dot.addEventListener('click', () => {
      //   currentIndex = i * itemsPerPage;
      //   updateCarousel();
      //   startAutoSlide();
      // });

      carouselDots.append(dot);
    }
  };

  const updateItemsPerPage = () => {
    itemsPerPage = window.innerWidth >= 900 ? 5 : 2;
    updateDots();
    updateCarousel();
  };

  const slidePrev = () => {
    if (currentIndex > 0) {
      currentIndex -= itemsPerPage;
    } else {
      currentIndex = Math.max(0, items.length - itemsPerPage);
    }
    updateCarousel();
  };

  prevButton.addEventListener('click', () => {
    slidePrev();
    startAutoSlide();
  });

  nextButton.addEventListener('click', () => {
    slideNext();
    startAutoSlide();
  });

  block.addEventListener('mouseover', stopAutoSlide);
  block.addEventListener('mouseout', startAutoSlide);

  window.addEventListener('resize', () => {
    updateItemsPerPage();
  });

  updateItemsPerPage();
  startAutoSlide();
}
