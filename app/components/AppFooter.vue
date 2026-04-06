<template>
  <footer class="app-footer">
    <p class="app-footer__label">Kontakt</p>
    <a class="app-footer__email" href="mailto:Platzhaltermail">Platzhaltermail</a>
  </footer>
</template>

<style scoped>
.app-footer {
  display: grid;
  gap: 0.25rem;
  justify-items: center;
  padding: 1.25rem 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
}

.app-footer__label {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.app-footer__email {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  text-decoration: none;
}

.app-footer__email:hover,
.app-footer__email:focus-visible {
  text-decoration: underline;
}
</style>