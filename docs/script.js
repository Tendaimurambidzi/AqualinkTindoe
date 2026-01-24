// SplashLine Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Download button handlers
    const androidDownloadBtn = document.getElementById('android-download');
    const webVersionBtn = document.getElementById('web-version');

    // Android download handler
    androidDownloadBtn.addEventListener('click', function(e) {
        // Check if APK exists
        fetch('https://www.dropbox.com/scl/fi/4cxcu4m3brtelumhvb811/splashline.apk?rlkey=nlukc3fd96ppkzseuoswrio0i&st=ygnms06w&dl=1', { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    // APK exists, proceed with download
                    showNotification('Downloading SplashLine APK...', 'info');
                } else {
                    // APK doesn't exist
                    e.preventDefault();
                    showNotification('APK file not found. Please check back later or contact support.', 'error');
                }
            })
            .catch(error => {
                console.error('Error checking APK:', error);
                e.preventDefault();
                showNotification('Unable to download APK. Please try again later.', 'error');
            });
    });

    // Web version handler (coming soon)
    webVersionBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('Web version coming soon! Stay tuned for updates.', 'info');
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe feature cards and installation steps
    document.querySelectorAll('.feature-card, .step').forEach(card => {
        observer.observe(card);
    });

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .feature-card, .step {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .feature-card.animate-in, .step.animate-in {
            opacity: 1;
            transform: translateY(0);
        }

        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
        }

        .notification.show {
            transform: translateX(0);
        }

        .notification.success {
            background: #10b981;
        }

        .notification.error {
            background: #ef4444;
        }

        .notification.info {
            background: #3b82f6;
        }
    `;
    document.head.appendChild(style);
});

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add loading animation to download button
function addLoadingState(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="icon">⏳</span> Downloading...';
    button.disabled = true;

    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    }, 3000);
}

// Performance optimization: Lazy load images if any
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
lazyLoadImages();

// Add some interactive effects
document.addEventListener('mousemove', function(e) {
    const cursor = document.querySelector('.hero-image');
    if (cursor) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        cursor.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
    }
});

// Handle PWA install prompt (if applicable)
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Show install button if desired
    const installBtn = document.createElement('button');
    installBtn.textContent = 'Install as App';
    installBtn.className = 'download-btn secondary';
    installBtn.style.position = 'fixed';
    installBtn.style.bottom = '20px';
    installBtn.style.left = '20px';
    installBtn.style.zIndex = '1000';

    installBtn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showNotification('App installed successfully!', 'success');
            }
            deferredPrompt = null;
        });
    });

    document.body.appendChild(installBtn);
});