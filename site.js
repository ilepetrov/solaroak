'use strict';

const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-button');
const navigation = document.querySelector('#navigation');

if (header && menu && navigation) {
  header.dataset.enhanced = '';
  menu.hidden = false;
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    navigation.removeAttribute('data-open');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    navigation.toggleAttribute('data-open', open);
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) closeMenu();
  });
}

const contactForm = document.querySelector('.contact-form');
if (contactForm && !contactForm.querySelector('fieldset').disabled) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const formStatus = document.querySelector('#form-status');
  let sending = false;
  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !contactForm.reportValidity()) return;
    sending = true;
    submitButton.disabled = true;
    contactForm.setAttribute('aria-busy', 'true');
    formStatus.textContent = 'Invio della richiesta in corso…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(contactForm.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || (result.success !== true && result.success !== 'true')) throw new Error('Submission not confirmed');
      formStatus.textContent = 'Grazie. Il servizio ha preso in carico la richiesta. Ti risponderemo all’email indicata per concordare un primo confronto. Non hai effettuato alcun acquisto.';
      contactForm.reset();
    } catch {
      formStatus.textContent = 'Non riusciamo a confermare l’invio. I tuoi dati sono rimasti nel modulo: controlla la connessione e riprova, oppure usa il collegamento email qui sotto. Se hai già ricevuto un riscontro, non occorre inviare di nuovo.';
    } finally {
      clearTimeout(timeout);
      sending = false;
      submitButton.disabled = false;
      contactForm.removeAttribute('aria-busy');
      formStatus.focus();
    }
  });
}
