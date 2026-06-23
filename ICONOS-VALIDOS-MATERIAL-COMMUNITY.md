# Iconos Válidos de Material Community Icons

## 📋 Iconos Corregidos en el Sistema

### 🔑 Iconos de Seguridad/Contraseña VÁLIDOS
- `"key"` - Una llave (reemplazo de "key-reset")
- `"lock"` - Candado (reemplazo de "lock-reset" y "lock-check")
- `"lock-outline"` - Contorno de candado
- `"lock-open"` - Candado abierto
- `"shield"` - Escudo
- `"shield-check"` - Escudo con check ✓
- `"shield-outline"` - Contorno de escudo

### 📧 Iconos de Email VÁLIDOS
- `"email"` - Email
- `"email-outline"` - Contorno de email ✓
- `"email-open"` - Email abierto
- `"email-send"` - Enviar email

### 👁️ Iconos de Visibilidad VÁLIDOS
- `"eye"` - Ojo (ver contraseña)
- `"eye-off"` - Ojo tachado (ocultar contraseña)

### 🕐 Iconos de Tiempo VÁLIDOS
- `"timer-outline"` - Contorno de temporizador ✓
- `"timer"` - Temporizador
- `"clock-outline"` - Reloj

### 🔄 Iconos de Acción VÁLIDOS
- `"reload"` - Recargar ✓
- `"refresh"` - Refrescar
- `"check-circle"` - Círculo con check ✓
- `"alert-circle"` - Círculo de alerta ✓
- `"arrow-left"` - Flecha izquierda ✓
- `"help-circle"` - Círculo de ayuda ✓

### 📝 Iconos de Validación VÁLIDOS
- `"check-circle"` - Círculo con check (para requisitos cumplidos) ✓
- `"circle-outline"` - Círculo vacío (para requisitos pendientes) ✓

## 🚫 Iconos que NO EXISTEN (evitar usar)
- `"key-reset"` ❌ (usar `"key"`)
- `"lock-reset"` ❌ (usar `"lock"`)
- `"lock-check"` ❌ (usar `"lock"` o `"lock-outline"`)
- `"shield-lock"` ❌ (usar `"shield-check"`)
- `"email-edit"` ❌ (usar `"email-outline"`)

## 📁 Archivos Corregidos

### ✅ RecuperarPasswordScreen.jsx
- ❌ `"key-reset"` → ✅ `"key"`

### ✅ RestablecerPasswordScreen.jsx
- ❌ `"lock-reset"` → ✅ `"lock"`
- ❌ `"lock-check"` (línea 190) → ✅ `"lock-outline"`
- ❌ `"lock-check"` (línea 294) → ✅ `"lock"`

### ✅ ValidarCodigoScreen.jsx
- ❌ `"shield-lock"` → ✅ `"shield-check"`
- ❌ `"email-edit"` → ✅ `"email-outline"`

## 🔍 Cómo Verificar Iconos Válidos

1. **Documentación oficial**: https://icons.expo.fyi/
2. **Buscar por categoría**: Seguridad, Email, Acción
3. **Probar en Expo**: Si ves warnings, el icono no existe
4. **Usar iconos simples**: Preferir nombres cortos y comunes

## 💡 Recomendaciones

1. **Usar iconos outline** para campos de formulario
2. **Mantener consistencia** en toda la app
3. **Probar en desarrollo** para detectar warnings temprano
4. **Documentar iconos** usados en el proyecto

## ✅ Iconos Confirmados Válidos (usados en la app)

```javascript
// Seguridad/Contraseña
"key", "lock", "lock-outline", "shield-check"

// Email
"email-outline"

// Visibilidad
"eye", "eye-off"

// Tiempo
"timer-outline"

// Acción/Navegación
"arrow-left", "reload", "check-circle", "alert-circle", 
"help-circle", "refresh", "information"

// Validación
"check-circle", "circle-outline"
```

---

**Consejo**: Si no estás seguro si un icono existe, busca en https://icons.expo.fyi/ o usa `"alert-circle"` como fallback genérico.


## 🚫 Iconos que NO EXISTEN (evitar usar) - ACTUALIZADO
- `"key-reset"` ❌ (usar `"key"`)
- `"lock-reset"` ❌ (usar `"lock"`)
- `"lock-check"` ❌ (usar `"lock"` o `"lock-outline"`)
- `"shield-lock"` ❌ (usar `"shield-check"`)
- `"email-edit"` ❌ (usar `"email-outline"`)
- `"email-send"` ❌ (usar `"send"`)
- `"book-open-variant"` ❌ (usar `"book-open"`)
- `"frequently-asked-questions"` ❌ (usar `"help-circle"`)

## ✅ Iconos Confirmados Válidos (usados en la app) - ACTUALIZADO

```javascript
// Navegación/Acción
"arrow-left", "chevron-right", "send", "download", "play-circle"

// Cuenta/Perfil
"account", "account-edit", "account-circle", "logout"

// Seguridad/Contraseña
"key", "lock", "lock-outline", "lock-plus", "lock-check", "shield-check"

// Email/Comunicación
"email", "email-outline", "whatsapp"

// Visibilidad
"eye", "eye-off"

// Tiempo
"timer-outline", "clock"

// Validación/Estado
"check-circle", "alert-circle", "help-circle", "help-circle-outline", 
"circle-outline", "close-circle", "information"

// Recursos/Educación
"book-open", "file-document", "video", "update"

// Soporte/Contacto
"headset", "phone"

// Otros
"bell", "view-dashboard", "account-group", "robot", "shield"
```

## 📁 Archivos Corregidos - ACTUALIZADO

### ✅ AyudaScreen.jsx
- ❌ `"email-send"` → ✅ `"send"`
- ❌ `"book-open-variant"` → ✅ `"book-open"`
- ❌ `"frequently-asked-questions"` → ✅ `"help-circle"`

### ✅ RestablecerPasswordScreen.jsx
- ❌ `"lock-check"` → ✅ `"lock-outline"` / `"lock"`

## 💡 Recomendación Final
**Siempre verifica los iconos en:** https://icons.expo.fyi/
**Regla simple:** Si el nombre tiene guiones o parece muy específico, probablemente no existe. Usa nombres simples como `"send"`, `"lock"`, `"help-circle"`.