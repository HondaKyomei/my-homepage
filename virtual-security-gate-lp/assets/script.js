// Intersection-based reveal animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

// Button ripple (subtle)
document.querySelectorAll('.btn, .cta').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const circle = document.createElement('span');
    circle.style.position = 'absolute';
    circle.style.inset = '0';
    circle.style.borderRadius = 'inherit';
    circle.style.boxShadow = '0 0 0 0 rgba(42,95,255,.25)';
    circle.style.animation = 'pulse .6s ease-out';
    circle.style.pointerEvents = 'none';
    btn.style.position = 'relative';
    btn.appendChild(circle);
    setTimeout(()=>circle.remove(), 600);
  });
});

// Smooth scroll for same-page anchors
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Metrics cards & chart sync tooltip
const metricsSection = document.getElementById('metrics');
if (metricsSection) {
  const panel = metricsSection.querySelector('.metrics-panel');
  const tooltip = metricsSection.querySelector('[data-metric-tooltip]');
  if (panel && tooltip) {
    const tooltipImage = tooltip.querySelector('[data-metric-tooltip-image]');
    const tooltipText = tooltip.querySelector('[data-metric-tooltip-text]');
    const triggers = Array.from(panel.querySelectorAll('[data-metric-id]'));
    const metricGroups = new Map();

    triggers.forEach((trigger) => {
      const id = trigger.dataset.metricId;
      if (!id) return;
      if (!metricGroups.has(id)) {
        metricGroups.set(id, []);
      }
      metricGroups.get(id).push(trigger);
    });

    const getSourceForMetric = (id) => {
      const group = metricGroups.get(id) || [];
      return group.find((el) => el.dataset.tooltipText || el.dataset.tooltipImage) || null;
    };

    let hideTimer;

    const positionTooltip = (target) => {
      const panelRect = panel.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      let left = targetRect.left - panelRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
      const maxLeft = panelRect.width - tooltipRect.width - 16;
      left = Math.max(16, Math.min(left, maxLeft));

      let top = targetRect.top - panelRect.top - tooltipRect.height - 20;
      let flipped = false;
      if (top < 0) {
        top = targetRect.top - panelRect.top + targetRect.height + 20;
        flipped = true;
      }

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.classList.toggle('is-flipped', flipped);
    };

    const activateMetric = (id) => {
      metricGroups.forEach((group, groupId) => {
        group.forEach((el) => {
          el.classList.toggle('is-active', groupId === id);
        });
      });
    };

    const showTooltip = (trigger) => {
      const id = trigger.dataset.metricId;
      if (!id) return;
      clearTimeout(hideTimer);
      activateMetric(id);
      const source = (trigger.dataset.tooltipText || trigger.dataset.tooltipImage) ? trigger : getSourceForMetric(id);
      const imageUrl = source?.dataset.tooltipImage || '';
      const description = source?.dataset.tooltipTitle || source?.dataset.tooltipText || '';

      if (tooltipImage) {
        if (imageUrl) {
          tooltipImage.style.backgroundImage = `url('${imageUrl}')`;
          tooltipImage.classList.remove('is-hidden');
        } else {
          tooltipImage.style.backgroundImage = '';
          tooltipImage.classList.add('is-hidden');
        }
      }
      if (tooltipText) {
        tooltipText.textContent = description;
      }
      tooltip.setAttribute('aria-hidden', 'false');
      tooltip.classList.add('is-visible');
      positionTooltip(trigger);
    };

    const hideTooltip = () => {
      tooltip.classList.remove('is-visible');
      tooltip.setAttribute('aria-hidden', 'true');
      metricGroups.forEach((group) => {
        group.forEach((el) => el.classList.remove('is-active'));
      });
    };

    const scheduleHide = () => {
      clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        hideTooltip();
      }, 140);
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('mouseenter', () => showTooltip(trigger));
      trigger.addEventListener('focusin', () => showTooltip(trigger));
      trigger.addEventListener('mouseleave', scheduleHide);
      trigger.addEventListener('focusout', scheduleHide);
    });

    panel.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    panel.addEventListener('mouseleave', scheduleHide);
    panel.addEventListener('focusout', () => {
      if (!panel.contains(document.activeElement)) {
        scheduleHide();
      }
    });
  }
}

// Setup flow tooltip sync
document.querySelectorAll('[data-setup-section]').forEach((wrapper) => {
  const flow = wrapper.querySelector('.setup-flow');
  const tooltip = wrapper.querySelector('[data-setup-tooltip]');
  if (!flow || !tooltip) return;
  const steps = Array.from(flow.querySelectorAll('[data-setup-id]'));
  if (!steps.length) return;

  const tooltipImage = tooltip.querySelector('[data-setup-tooltip-image]');
  const tooltipTitle = tooltip.querySelector('[data-setup-tooltip-title]');
  const tooltipText = tooltip.querySelector('[data-setup-tooltip-text]');
  const defaultImage = wrapper.dataset.setupDefaultImage || '';
  let hideTimer;

  const positionTooltip = (target) => {
    const wrapperRect = wrapper.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let left = targetRect.left - wrapperRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    const maxLeft = wrapperRect.width - tooltipRect.width - 16;
    left = Math.max(16, Math.min(left, maxLeft));

    let top = targetRect.top - wrapperRect.top - tooltipRect.height - 20;
    let flipped = false;
    if (top < 0) {
      top = targetRect.top - wrapperRect.top + targetRect.height + 20;
      flipped = true;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.classList.toggle('is-flipped', flipped);
  };

  const setActive = (current) => {
    steps.forEach((step) => {
      step.classList.toggle('is-active', step === current);
    });
  };

  const showTooltip = (step) => {
    clearTimeout(hideTimer);
    setActive(step);
    const imageUrl = step.dataset.tooltipImage || defaultImage;
    const titleText = step.dataset.tooltipTitle || step.querySelector('h3')?.textContent?.trim() || '';
    const captionText = step.dataset.tooltipText || step.querySelector('p')?.textContent?.trim() || '';

    if (tooltipImage) {
      if (imageUrl) {
        tooltipImage.style.backgroundImage = `url('${imageUrl}')`;
        tooltipImage.classList.remove('is-hidden');
      } else {
        tooltipImage.style.backgroundImage = '';
        tooltipImage.classList.add('is-hidden');
      }
    }

    if (tooltipTitle) {
      tooltipTitle.textContent = titleText;
      tooltipTitle.classList.toggle('is-hidden', !titleText);
    }
    if (tooltipText) {
      tooltipText.textContent = captionText;
      tooltipText.classList.toggle('is-hidden', !captionText);
    }

    tooltip.setAttribute('aria-hidden', 'false');
    tooltip.classList.add('is-visible');
    positionTooltip(step);
  };

  const hideTooltip = () => {
    tooltip.classList.remove('is-visible');
    tooltip.classList.remove('is-flipped');
    tooltip.setAttribute('aria-hidden', 'true');
    setActive(null);
  };

  const scheduleHide = () => {
    clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      hideTooltip();
    }, 160);
  };

  steps.forEach((step) => {
    step.addEventListener('mouseenter', () => showTooltip(step));
    step.addEventListener('focusin', () => showTooltip(step));
    step.addEventListener('mouseleave', scheduleHide);
    step.addEventListener('focusout', () => {
      if (!wrapper.contains(document.activeElement)) {
        scheduleHide();
      }
    });
  });

  wrapper.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  wrapper.addEventListener('mouseleave', scheduleHide);
  wrapper.addEventListener('focusout', () => {
    if (!wrapper.contains(document.activeElement)) {
      scheduleHide();
    }
  });
});

// Pricing table column highlight
document.querySelectorAll('.pricing-table').forEach((table) => {
  const planHeaders = Array.from(table.querySelectorAll('thead th')).slice(1);
  const bodyRows = Array.from(table.querySelectorAll('tbody tr'));

  const clearActive = () => {
    table.querySelectorAll('.is-plan-active').forEach((el) => el.classList.remove('is-plan-active'));
  };

  const activateColumn = (index) => {
    clearActive();
    const header = planHeaders[index];
    if (!header) return;
    header.classList.add('is-plan-active');
    bodyRows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      const cell = cells[index];
      if (cell) {
        cell.classList.add('is-plan-active');
      }
    });
  };

  planHeaders.forEach((header, index) => {
    header.addEventListener('mouseenter', () => activateColumn(index));
    header.addEventListener('focusin', () => activateColumn(index));
    header.addEventListener('mouseleave', () => clearActive());
    header.addEventListener('focusout', () => {
      if (!table.contains(document.activeElement)) {
        clearActive();
      }
    });
  });

  bodyRows.forEach((row) => {
    row.querySelectorAll('td').forEach((cell, cellIndex) => {
      cell.addEventListener('mouseenter', () => activateColumn(cellIndex));
      cell.addEventListener('focusin', () => activateColumn(cellIndex));
    });
  });

  table.addEventListener('mouseleave', () => clearActive());
  table.addEventListener('focusout', () => {
    if (!table.contains(document.activeElement)) {
      clearActive();
    }
  });
});

// Pause hero video when reduced motion is preferred
const heroVideo = document.querySelector('.cleanroom-video');
if (heroVideo) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const syncMotionPreference = () => {
    if (mq.matches) {
      heroVideo.pause();
      heroVideo.removeAttribute('autoplay');
    } else {
      const playPromise = heroVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          /* Autoplay might be blocked; keep muted video paused gracefully. */
        });
      }
    }
  };
  syncMotionPreference();
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', syncMotionPreference);
  } else if (typeof mq.addListener === 'function') {
    mq.addListener(syncMotionPreference);
  }
}

// Keyframes via JS (for browsers without the CSS @keyframes we used in CSS for ripple)
const style = document.createElement('style');
style.innerHTML = `@keyframes pulse{to{box-shadow:0 0 0 20px rgba(42,95,255,0)}}`;
document.head.appendChild(style);