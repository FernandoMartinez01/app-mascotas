# 🐾 Peluditos App

**Peluditos** es una aplicación web pensada para facilitar el seguimiento y cuidado de tus mascotas. Desde un mismo lugar vas a poder llevar un control de su alimentación, salud, turnos médicos y stock de productos como alimento o piedras sanitarias. También podés vincular a otros usuarios para que compartan el cuidado.

## ✨ Funcionalidades principales

- 🔐 **Inicio de sesión**: Registro e inicio de sesión con autenticación segura (Firebase Auth).
- 🐶 **Gestión de mascotas**: 
  - Crear nuevas mascotas con nombre, tipo (perro/gato), fecha de nacimiento, peso y foto.
  - Ver información de cada mascota de manera individual o general.
  - Vincular mascotas a múltiples cuentas de usuario.
- 📅 **Calendario inteligente**:
  - Marcar cuándo se alimentó a cada mascota y a qué hora.
  - Visualizar turnos médicos programados por mascota.
  - Ver el historial de eventos alimenticios o médicos por mascota.
- 🏥 **Seguimiento de salud**:
  - Registrar vacunas, problemas de salud, peso, medicamentos, etc.
  - Vincular tratamientos y recordatorios al calendario.
- 📦 **Gestión de stock**:
  - Controlar el stock de alimentos y piedras sanitarias.
  - Registrar el tipo de alimento o producto y su cantidad.
  - Esta sección es general, no depende de una mascota específica.

## 🧩 Estructura de la app (a grandes rasgos)

- `Login/Register`: Pantalla inicial para autenticarse.
- `Dashboard`: Vista principal luego del login. Desde acá podés:
  - Elegir ver datos de una mascota específica o de todas.
  - Acceder al calendario, salud o stock.
- `Calendario`: Visualización de eventos por mascota o general.
- `Salud`: Detalles médicos por mascota.
- `Stock`: Control de productos usados para el cuidado.

## 🔧 Tecnologías utilizadas

- ⚛️ **React**
- 🔥 **Firebase (Auth & Firestore)**
- 💅 **CSS Modules / Tailwind (opcional)**
- 🧪 **(Próximamente) Testing y deploy**

## 🚀 Próximas mejoras

- Subida de fotos de mascota.
- Notificaciones automáticas (turnos, falta de comida, etc).
- Exportar historial de salud o alimentación.
- PWA (instalable en celular).

## 🛡️ Consideraciones

- Esta app puede usarse en un repo público, ya que no contiene claves sensibles.
- Firebase solo tiene la config pública, sin exponer datos privados.
- Para mantener la seguridad, nunca subas tus claves privadas o tokens.

---

### 🐾 ¡Gracias por usar Peluditos!

Con esta app, el cuidado de tus mascotas es más simple, colaborativo y organizado. ❤️
