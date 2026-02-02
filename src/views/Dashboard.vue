<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Card, Button } from 'primevue';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();
const user = ref({});

const loadUser = () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
  } else {
    router.push('/login');
  }
};

const logout = () => {
  localStorage.removeItem('user');
  toast.add({
    severity: 'info',
    summary: 'Sesión cerrada',
    detail: 'Has cerrado sesión correctamente',
    life: 2000
  });
  router.push('/login');
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

onMounted(() => {
  loadUser();
});
</script>

<template>
  <div class="dashboard-container">
    <div class="header">
      <h1>Dashboard</h1>
      <div class="user-info">
        <i class="pi pi-user"></i>
        <span>{{ user.username }}</span>
        <span class="user-role">({{ user.role }})</span>
        <Button
            label="Cerrar Sesión"
            icon="pi pi-sign-out"
            severity="danger"
            @click="logout"
            size="small"
        />
      </div>
    </div>

    <div class="dashboard-content">
      <Card class="dashboard-card">
        <template #title>
          <i class="pi pi-home"></i> Bienvenido al Sistema
        </template>
        <template #content>
          <p>Has iniciado sesión correctamente como <strong>{{ user.username }}</strong>.</p>
          <p>Tu rol en el sistema es: <strong>{{ user.role }}</strong></p>
          <p>Último acceso: <strong>{{ formatDate(user.lastLogin) }}</strong></p>

          <div class="quick-actions">
            <h3>Acciones rápidas:</h3>
            <div class="action-buttons">
              <Button label="Ver Perfil" icon="pi pi-user" />
              <Button label="Configuración" icon="pi pi-cog" severity="secondary" />
              <Button
                  v-if="user.role === 'admin'"
                  label="Panel Admin"
                  icon="pi pi-shield"
                  severity="warning"
              />
            </div>
          </div>
        </template>
      </Card>

      <Card class="dashboard-card">
        <template #title>
          <i class="pi pi-info-circle"></i> Información del Usuario
        </template>
        <template #content>
          <pre>{{ JSON.stringify(user, null, 2) }}</pre>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.header h1 {
  color: #333;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f5f5f5;
  padding: 10px 20px;
  border-radius: 20px;
}

.user-info i {
  color: #1094b9;
}

.user-role {
  color: #666;
  font-style: italic;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.dashboard-card {
  height: 100%;
}

.dashboard-card :deep(.p-card-title) {
  color: #1094b9;
  font-size: 1.2rem;
}

.dashboard-card :deep(.p-card-title i) {
  margin-right: 10px;
}

.quick-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

pre {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
  font-size: 14px;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style>