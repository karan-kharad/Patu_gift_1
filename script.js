document.addEventListener('DOMContentLoaded', function () {
    const heartBtn = document.getElementById('heartbeatBtn');
    const message = document.getElementById('message');
    const heart = document.getElementById('heart');

    // Create audio context for heartbeat sound
    let audioContext;
    let heartbeatSound;

    // Initialize audio context on first user interaction
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Generate heartbeat sound using Web Audio API
    function createHeartbeatSound() {
        if (!audioContext) return null;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Create a heartbeat pattern
        const now = audioContext.currentTime;

        // First beat
        oscillator.frequency.setValueAtTime(150, now);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);

        // Small pause
        gainNode.gain.setValueAtTime(0, now + 0.3);

        // Second beat
        oscillator.frequency.setValueAtTime(150, now + 0.4);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.5);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.6);

        // Longer pause
        gainNode.gain.setValueAtTime(0, now + 0.7);

        // Third beat
        oscillator.frequency.setValueAtTime(150, now + 1.2);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 1.3);
        gainNode.gain.linearRampToValueAtTime(0, now + 1.4);

        oscillator.start(now);
        oscillator.stop(now + 2);

        return oscillator;
    }

    // Play heartbeat sound loop
    function playHeartbeatLoop() {
        initAudio();

        // Play the heartbeat 3 times (about 6 seconds total)
        let playCount = 0;
        const maxPlays = 3;

        function playNext() {
            if (playCount < maxPlays) {
                const sound = createHeartbeatSound();
                if (sound) {
                    sound.onended = () => {
                        playCount++;
                        setTimeout(playNext, 1000); // 1 second pause between beats
                    };
                } else {
                    playCount++;
                    setTimeout(playNext, 2000);
                }
            }
        }

        playNext();
    }

    // Enhanced heart animation during heartbeat
    function animateHeartDuringBeat() {
        heart.style.animation = 'none';
        heart.offsetHeight; // Trigger reflow
        heart.style.animation = 'heartbeat 0.6s ease-in-out';

        // Add extra glow effect
        const extraGlow = document.createElement('div');
        extraGlow.className = 'glow-effect';
        extraGlow.style.animation = 'glow 0.6s ease-in-out';
        extraGlow.style.opacity = '0.9';
        heart.parentNode.appendChild(extraGlow);

        setTimeout(() => {
            if (extraGlow.parentNode) {
                extraGlow.parentNode.removeChild(extraGlow);
            }
        }, 600);
    }

    // Button click handler
    heartBtn.addEventListener('click', function () {
        // Disable button temporarily
        heartBtn.disabled = true;
        heartBtn.textContent = 'Beating...';

        // Play heartbeat sound
        playHeartbeatLoop();

        // Animate heart
        animateHeartDuringBeat();

        // Show message with delay
        setTimeout(() => {
            message.classList.add('show');
        }, 500);

        // Re-enable button after sound finishes
        setTimeout(() => {
            heartBtn.disabled = false;
            heartBtn.textContent = 'Check Heartbeat Again';
        }, 8000);
    });

    // Add some interactive effects
    heart.addEventListener('click', function () {
        if (!heartBtn.disabled) {
            heartBtn.click();
        }
    });

    // Add floating particles effect
    function createParticle() {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = 'rgba(255, 255, 255, 0.6)';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1';

        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 10;
        const endY = -10;
        const duration = Math.random() * 3000 + 2000;

        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';

        document.body.appendChild(particle);

        particle.animate([
            { transform: `translateY(0px)`, opacity: 0 },
            { transform: `translateY(-${startY - endY}px)`, opacity: 1 },
            { transform: `translateY(-${startY - endY + 50}px)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'linear'
        }).onfinish = () => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        };
    }

    // Create particles periodically
    setInterval(createParticle, 2000);

    // Add some initial particles
    for (let i = 0; i < 5; i++) {
        setTimeout(createParticle, i * 400);
    }

    // Add keyboard support
    document.addEventListener('keydown', function (e) {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            if (!heartBtn.disabled) {
                heartBtn.click();
            }
        }
    });

    // Enhanced touch support for mobile
    let touchStartTime;
    let touchStartY;
    let touchStartX;

    heart.addEventListener('touchstart', function (e) {
        touchStartTime = Date.now();
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        e.preventDefault();
    }, { passive: false });

    heart.addEventListener('touchend', function (e) {
        const touchDuration = Date.now() - touchStartTime;
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndX = e.changedTouches[0].clientX;
        const deltaY = Math.abs(touchEndY - touchStartY);
        const deltaX = Math.abs(touchEndX - touchStartX);

        // Check if it's a quick tap with minimal movement
        if (touchDuration < 500 && deltaY < 10 && deltaX < 10 && !heartBtn.disabled) {
            e.preventDefault();
            heartBtn.click();
        }
    }, { passive: false });

    // Add haptic feedback for supported devices
    heart.addEventListener('touchend', function (e) {
        if (navigator.vibrate) {
            navigator.vibrate(50); // Short vibration
        }
    });

    // Improve button touch interaction
    heartBtn.addEventListener('touchstart', function (e) {
        this.style.transform = 'scale(0.98)';
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    });

    heartBtn.addEventListener('touchend', function (e) {
        this.style.transform = '';
    });
});
