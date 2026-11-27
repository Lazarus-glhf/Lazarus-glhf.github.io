(() => {
    const list = document.querySelector('.article-list--home');
    const first = list?.querySelector('.home-card');
    if (!first) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const mouseAvailable = matchMedia('(any-hover: hover) and (any-pointer: fine)');
    const moving = new Map();
    const ease = 'cubic-bezier(.32,0,.16,1)';
    let expanded = first, point, usingKeyboard = false;
    const cardOf = element => element?.closest('.home-card');

    function captureArt(item) {
        const cover = item.querySelector('.home-card__image');
        const image = cover?.querySelector('img');
        if (!image?.naturalWidth) return null;
        const layer = new Image();
        layer.src = image.currentSrc;
        layer.alt = '';
        layer.className = 'home-card__outgoing-art';
        layer.setAttribute('aria-hidden', 'true');
        const rect = cover.getBoundingClientRect();
        const style = getComputedStyle(cover);
        Object.assign(layer.style, {
            width: `${rect.width}px`, height: `${rect.height}px`,
            objectFit: getComputedStyle(image).objectFit, backgroundColor: style.backgroundColor,
            clipPath: style.clipPath, opacity: style.opacity
        });
        return layer;
    }

    function feature(card) {
        if (expanded === card) return;
        const animate = !motion.matches && typeof card.animate === 'function';
        const items = [expanded, card];
        const starts = items.map(item => ({
            height: item.getBoundingClientRect().height, art: animate ? captureArt(item) : null
        }));
        for (const item of items) {
            moving.get(item)?.();
            item.classList.toggle('home-card--featured', item === card);
            item.classList.toggle('home-card--compact', item !== card);
            const image = item.querySelector('img[srcset]');
            if (image) image.sizes = `${Math.ceil(image.getBoundingClientRect().width)}px`;
        }
        expanded = card;
        if (!animate) return;
        items.forEach((item, index) => {
            const opening = item === card;
            const { height, art } = starts[index];
            const endHeight = item.getBoundingClientRect().height;
            const resize = item.animate([{ height: `${height}px` }, { height: `${endHeight}px` }],
                { duration: 340, easing: ease });
            const animations = [resize];
            if (art) {
                item.append(art);
                animations.push(art.animate([{ opacity: art.style.opacity }, { opacity: 0 }],
                    { duration: 160, easing: 'ease-out', fill: 'forwards' }));
            }
            const cover = item.querySelector('.home-card__image');
            if (cover) animations.push(cover.animate([
                { clipPath: opening ? 'inset(0 36%)' : 'inset(0 10%)', opacity: .2 },
                { clipPath: 'inset(0 0%)', opacity: 1 }
            ], { duration: 300, easing: ease }));
            // Text always uses the destination layout, including during its fade.
            animations.push(item.querySelector('.home-card__body').animate([
                { opacity: 0 }, { opacity: 0, offset: .2 }, { opacity: 1 }
            ], { duration: 290, easing: 'ease-out' }));
            const clean = () => {
                animations.forEach(animation => animation.cancel());
                art?.remove();
                moving.delete(item);
            };
            moving.set(item, clean);
            resize.onfinish = () => { if (moving.get(item) === clean) clean(); };
        });
    }

    function keepUnderPointer(card, entry) {
        let scroll = window.scrollY;
        function follow() {
            if (point !== entry || expanded !== card || usingKeyboard || window.scrollY !== scroll) return;
            const rect = card.getBoundingClientRect();
            const delta = entry.y >= rect.bottom ? rect.bottom - entry.y - 2 : Math.max(0, rect.top - entry.y);
            if (delta) window.scrollBy({ top: delta, behavior: 'instant' });
            scroll = window.scrollY;
            if (moving.has(card)) requestAnimationFrame(follow);
        }
        follow();
    }

    list.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse' || !mouseAvailable.matches || event.buttons) return;
        if (point?.x === event.clientX && point?.y === event.clientY) return;
        usingKeyboard = false;
        point = { x: event.clientX, y: event.clientY };
        const card = cardOf(event.target);
        if (!card || card === expanded) return;
        feature(card);
        keepUnderPointer(card, point);
    });
    list.addEventListener('pointerleave', event => {
        if (event.pointerType !== 'mouse') return;
        point = null;
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Tab') usingKeyboard = true;
    });
    document.addEventListener('pointerdown', () => { usingKeyboard = false; });
    list.addEventListener('focusin', event => {
        if (usingKeyboard) feature(cardOf(event.target) || first);
    });
})();