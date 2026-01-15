// Simple wave animation
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.getElementById('hero');
    hero.style.animation = 'wave 2s infinite';
});

@keyframes wave {
    0% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0); }
}