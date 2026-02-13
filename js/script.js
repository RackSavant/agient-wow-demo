// script.js
document.addEventListener('DOMContentLoaded', (event) => {
    // Display a greeting
    const DEMO_STORAGE_KEY = 'agientWowDemoState';
    const DEMO_STEPS = [
        { id: 'intro', title: 'Intro', path: 'demo.html' },
        { id: 'intake', title: 'Intake', path: 'demo-step-1.html' },
        { id: 'approve', title: 'Approval', path: 'demo-step-2.html' },
        { id: 'execute', title: 'Execute', path: 'demo-step-3.html' },
        { id: 'outcome', title: 'Outcome', path: 'demo-success.html' }
    ];

    const getBasePrefix = () => (window.location.pathname.includes('/pages/') ? '' : 'pages/');
    const pathLeaf = () => window.location.pathname.split('/').pop() || 'index.html';
    const isDemoPage = () => {
        const leaf = pathLeaf();
        return DEMO_STEPS.some((s) => s.path === leaf);
    };

    const applyGuidanceMode = () => {
        const { unlocked } = getState();
        const presenter = document.querySelector('[data-presenter-stage]');
        const selfGuided = document.querySelector('[data-self-guided]');
        if (presenter) presenter.style.display = unlocked ? 'none' : '';
        if (selfGuided) selfGuided.style.display = unlocked ? '' : 'none';
    };

    const bindGuidanceModeControls = () => {
        const unlockBtn = document.querySelector('[data-demo-unlock]');
        const lockBtn = document.querySelector('[data-demo-lock]');
        if (!unlockBtn && !lockBtn) return;

        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => {
                setState({ unlocked: true });
                applyGuidanceMode();
            });
        }

        if (lockBtn) {
            lockBtn.addEventListener('click', () => {
                setState({ unlocked: false });
                applyGuidanceMode();
            });
        }
    };
    const getStepIndexForLeaf = (leaf) => DEMO_STEPS.findIndex((s) => s.path === leaf);
    const getState = () => {
        try {
            const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
            if (!raw) return { track: 'ops', approved: true, lastStepId: 'intro', unlocked: false };
            const parsed = JSON.parse(raw);
            return {
                track: parsed.track || 'ops',
                approved: parsed.approved !== false,
                lastStepId: parsed.lastStepId || 'intro',
                unlocked: parsed.unlocked === true
            };
        } catch (e) {
            return { track: 'ops', approved: true, lastStepId: 'intro', unlocked: false };
        }
    };
    const setState = (partial) => {
        const next = { ...getState(), ...partial };
        window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
        return next;
    };
    const resetState = () => {
        window.localStorage.removeItem(DEMO_STORAGE_KEY);
    };

    const navigateTo = (leaf) => {
        const prefix = getBasePrefix();
        window.location.href = `${prefix}${leaf}`;
    };

    const renderDemoSteps = () => {
        const el = document.querySelector('[data-demo-steps]');
        if (!el) return;
        const leaf = pathLeaf();
        const activeIdx = getStepIndexForLeaf(leaf);
        el.innerHTML = '';
        DEMO_STEPS.forEach((step, idx) => {
            const chip = document.createElement('span');
            chip.className = `step${idx === activeIdx ? ' active' : ''}`;
            chip.textContent = `${idx + 1}. ${step.title}`;
            el.appendChild(chip);
        });
    };

    const bindDemoNav = () => {
        const nextBtn = document.querySelector('[data-demo-next]');
        const backBtn = document.querySelector('[data-demo-back]');
        const resetBtn = document.querySelector('[data-demo-reset]');
        const leaf = pathLeaf();
        const activeIdx = getStepIndexForLeaf(leaf);

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                resetState();
                navigateTo('demo.html');
            });
        }

        if (backBtn) {
            backBtn.disabled = activeIdx <= 0;
            backBtn.addEventListener('click', () => {
                const prev = Math.max(0, activeIdx - 1);
                setState({ lastStepId: DEMO_STEPS[prev]?.id || 'intro' });
                navigateTo(DEMO_STEPS[prev].path);
            });
        }

        if (nextBtn) {
            nextBtn.disabled = activeIdx < 0 || activeIdx >= DEMO_STEPS.length - 1;
            nextBtn.addEventListener('click', () => {
                const next = Math.min(DEMO_STEPS.length - 1, activeIdx + 1);
                setState({ lastStepId: DEMO_STEPS[next]?.id || 'intro' });
                navigateTo(DEMO_STEPS[next].path);
            });
        }
    };

    const bindTrackStart = () => {
        const startLinks = Array.from(document.querySelectorAll('[data-demo-start]'));
        if (startLinks.length === 0) return;

        startLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
                const track = link.getAttribute('data-demo-start') || 'ops';
                setState({ track, approved: true, lastStepId: 'intake' });
            });
        });
    };

    const bindApprovalGate = () => {
        const approveBtn = document.querySelector('[data-demo-approve]');
        const denyBtn = document.querySelector('[data-demo-deny]');
        if (!approveBtn && !denyBtn) return;

        if (approveBtn) {
            approveBtn.addEventListener('click', () => {
                setState({ approved: true, lastStepId: 'execute' });
                navigateTo('demo-step-3.html');
            });
        }

        if (denyBtn) {
            denyBtn.addEventListener('click', () => {
                setState({ approved: false, lastStepId: 'approve' });
                alert('Demo Mode: Denied. Reset to continue the guided run.');
            });
        }
    };

    const bindContactForm = () => {
        const form = document.querySelector('form');
        if (!form) return;
        const leaf = pathLeaf();
        if (leaf !== 'contact.html') return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = (document.getElementById('name')?.value || '').trim();
            const email = (document.getElementById('email')?.value || '').trim();
            const message = (document.getElementById('message')?.value || '').trim();

            setState({ contact: { name, email, message } });
            navigateTo('contact-success.html');
        });
    };

    // Log current date and time
    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    console.log(`Current Date and Time (UTC): ${currentDateTime}`);

    if (isDemoPage()) {
        setState({ lastStepId: DEMO_STEPS[Math.max(0, getStepIndexForLeaf(pathLeaf()))]?.id || 'intro' });
        renderDemoSteps();
        bindDemoNav();
    }

    applyGuidanceMode();
    bindGuidanceModeControls();
    bindTrackStart();
    bindApprovalGate();
    bindContactForm();
});
