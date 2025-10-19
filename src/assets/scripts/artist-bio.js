document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.artist-description details').forEach(details => {
    const btn = document.createElement('button');
    btn.className = 'bio-close-btn';
    btn.textContent = '… close';
    btn.onclick = () => details.removeAttribute('open');
    details.appendChild(btn);
    details.addEventListener('toggle', () => {
      btn.style.display = details.open ? 'block' : 'none';
    });
  });
});

