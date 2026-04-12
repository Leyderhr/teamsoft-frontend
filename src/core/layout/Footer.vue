<script setup>
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <span class="footer-copy">TeamSoft+ &copy; {{ new Date().getFullYear() }} &mdash; CUJAE</span>
      <span class="footer-version">v2.0.0</span>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  padding: 0.75rem 1.5rem;
  border-top: 1px solid var(--ts-border);
  background: var(--ts-bg-surface);
  color: var(--ts-text-secondary);
  font-size: 0.8rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-version {
  color: var(--ts-text-muted);
  font-size: 0.75rem;
}
</style>
