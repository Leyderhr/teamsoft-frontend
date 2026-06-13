<script setup>
import { reactive, ref } from 'vue';
import { Card, InputGroup, InputGroupAddon, InputText } from 'primevue';
import FloatLabel from 'primevue/floatlabel';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { useAuth } from '@/composables/useAuth';

const toast = useToast();
const { loginAsync, isLoggingIn } = useAuth();

const form = reactive({
  username: '',
  password: ''
});

const submitted = ref(false);

const handleLogin = async () => {
  submitted.value = true;

  if (!form.username || !form.password) {
    toast.add({
      severity: 'error',
      summary: 'Campos requeridos',
      detail: 'Por favor complete todos los campos requeridos',
      life: 3000,
      icon: 'pi pi-times-circle'
    });
    return;
  }

  try {
    await loginAsync({
      username: form.username,
      password: form.password
    });

    toast.add({
      severity: 'success',
      summary: 'Login Exitoso',
      detail: `Bienvenido ${form.username}!`,
      life: 2000,
      icon: 'pi pi-check-circle'
    });
  } catch (error) {
    const status = error.response?.status;

    if (error.name === 'TypeError' || error.message?.includes('Failed to fetch') || error.message?.includes('Network Error')) {
      toast.add({
        severity: 'error',
        summary: 'Error de Conexión',
        detail: 'No se puede conectar con el servidor. Verifica que la API esté disponible.',
        life: 4000,
        icon: 'pi pi-wifi'
      });
    } else if (status === 401) {
      toast.add({
        severity: 'error',
        summary: 'Credenciales Inválidas',
        detail: 'Usuario o contraseña incorrectos. Por favor, verifica tus datos.',
        life: 4000,
        icon: 'pi pi-lock'
      });
    } else if (status === 400) {
      toast.add({
        severity: 'error',
        summary: 'Solicitud Incorrecta',
        detail: 'Los datos ingresados no son válidos.',
        life: 4000,
        icon: 'pi pi-exclamation-triangle'
      });
    } else if (status === 500) {
      toast.add({
        severity: 'error',
        summary: 'Error del Servidor',
        detail: 'Error interno del servidor. Por favor, intente más tarde.',
        life: 4000,
        icon: 'pi pi-exclamation-triangle'
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error de autenticación',
        detail: 'Ocurrió un error inesperado. Por favor, intente de nuevo.',
        life: 4000,
        icon: 'pi pi-exclamation-triangle'
      });
    }
  }
};
</script>

<template>
  <div id="login-page" class="login-body">
    <div class="container">
      <Card id="card" class="login-card">
        <template #content>
          <img src="../../../assets/img/ic_menu_login.png" class="login-icon" alt="Login Icon"/>

          <form @submit.prevent="handleLogin" class="login-form">
            <Toast/>

            <!-- Campo Username -->
            <div class="field">
              <InputGroup>
                <InputGroupAddon>
                  <i class="pi pi-user input-icon"></i>
                </InputGroupAddon>
                <FloatLabel>
                  <InputText
                      v-tooltip="{ value: 'Tu usuario', showDelay: 1000, hideDelay: 300 }"
                      id="username"
                      v-model="form.username"
                      :invalid="submitted && !form.username"
                      class="p-inputtext-lg"
                      required
                  />
                  <label for="username">Usuario</label>
                </FloatLabel>
              </InputGroup>

            </div>

            <!-- Campo Password -->
            <div class="field">
              <InputGroup>
                <InputGroupAddon>
                  <i class="pi pi-lock input-icon"></i>
                </InputGroupAddon>
                <FloatLabel variant="on">
                  <Password v-model="form.password"
                            :feedback="false"
                            :toggleMask="true"
                            inputId="password"
                            v-tooltip="{ value: 'Tu contraseña', showDelay: 1000, hideDelay: 300 }"
                  />
                  <label for="password">Contraseña</label>
                </FloatLabel>
              </InputGroup>
            </div>

            <!-- Botón Login -->
            <Button
                id="boton-login"
                type="submit"
                label="Login"
                class="login-button"
            />
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>


<style scoped>
.login-body {
  background: url('@/assets/img/login/login.jpg') fixed center;
  background-size: cover;
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin: 0;
}

.container {
  width: 90%;
  max-width: 500px;
  margin-top: 5%;
  display: flex;
  justify-content: center;
}

/* Card personalizada */
.login-card {
  width: 100%;
  background-color: #0000005c;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
  border-radius: 2px;
}

:deep(.p-card-content) {
  padding: 40px 30px;
  text-align: center;
}

.login-icon {
  max-width: 64px;
  margin-bottom: 30px;
  justify-self: center;
}

/* Formulario */
.login-form {
  text-align: left;
}

.field {
  margin-bottom: 25px;
}

/* InputGroup personalizado */
:deep(.p-inputgroup) {
  display: flex;
  align-items: stretch;
}

:deep(.p-inputgroupaddon) {
  background-color: transparent;
  border: none;
  border-bottom: 1px solid var(--ts-text-muted);
  border-right: none;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
}

.input-icon {
  display: flex;
  font-size: 25px;
  color: white;
}

/* FloatLabel personalizado */
:deep(.p-floatlabel) {
  flex: 1;
}

:deep(.p-floatlabel input) {
  background-color: transparent !important;
  border: none !important;
  border-bottom: 1px solid var(--ts-text-muted) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  color: white !important;
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 0.75rem;
  font-size: 16px;
}

:deep(.p-floatlabel input:focus) {
  outline: none;
}

:deep(.p-floatlabel label) {
  color: white !important;
  left: 10px !important;
  font-size: 16px;
  transition: all 0.2s ease;
}

:deep(.p-floatlabel input.p-filled) {
  padding-left: 10px;
}

:deep(.p-floatlabel input:focus ~ label),
:deep(.p-floatlabel input.p-filled ~ label),
:deep(.p-floatlabel:has(.p-password-input:focus) label),
:deep(.p-floatlabel:has(.p-password-input.p-filled) label) {
  color: #00BCD4 !important;
  font-size: 12px !important;
  top: -14px !important;
  background-color: transparent;
}

/* Password component */
:deep(.p-password) {
  width: 100%;
}

:deep(.p-password input) {
  background-color: transparent !important;
  color: white !important;
  border: none !important;
  border-bottom: 1px solid var(--ts-text-muted) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 0.75rem;
  font-size: 16px;
}


/* Toggle mask icon positioning */
:deep(.p-password .p-password-toggle-mask-icon) {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  cursor: pointer;
  z-index: 10;
}

:deep(.p-password .p-input-icon-right) {
  position: relative;
}

:deep(.p-password .p-input-icon-right input) {
  padding-right: 40px;
}

/* Botón Login */
.login-button {
  width: 100%;
  margin-top: 40px !important;
  padding: 7px !important;
  height: auto !important;
  transition: 0.5s !important;
  background-color: var(--ts-primary) !important;
  border: 6px solid var(--ts-primary) !important;
  font-weight: bold;
  letter-spacing: 2px;
  color: white !important;
}

.login-button:hover {
  background-color: transparent !important;
  border: 6px solid white !important;
  letter-spacing: 5px;
}

#enter {
  color: #1094b9;
  text-decoration: none;
  padding: 5px 7px;
  border: 3px solid transparent;
  transition: 0.5s;
}

#enter:hover {
  border: 3px solid white;
  color: white !important;
}

.test-credentials {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 20px;
  color: white;
  font-size: 12px;
}

.test-credentials p {
  margin: 5px 0;
  line-height: 1.4;
}

.test-credentials strong {
  color: var(--ts-cyan);
}


/* Responsive */
@media only screen and (max-width: 768px) {
  .login-card {
    width: 90% !important;
  }
}

@media only screen and (max-width: 480px) {
  .container {
    width: 95%;
  }

  :deep(.p-card-content) {
    padding: 30px 20px;
  }

  .test-credentials {
    font-size: 11px;
    padding: 8px;
  }
}
</style>