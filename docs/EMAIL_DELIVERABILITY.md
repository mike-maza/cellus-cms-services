# Guía para Mejorar la Entrega de Correos Electrónicos

## Configuraciones para Evitar que los Correos Lleguen a Spam

### 1. Configuraciones Técnicas

#### Configurar Registros DNS

- **SPF (Sender Policy Framework)**
  - Añade un registro TXT en tu DNS: `v=spf1 include:_spf.google.com include:_spf.domain.com ~all`
  - Esto autoriza a servidores específicos a enviar correos desde tu dominio

- **DKIM (DomainKeys Identified Mail)**
  - Genera claves DKIM y añade el registro TXT correspondiente en tu DNS
  - Ejemplo: `v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...`

- **DMARC (Domain-based Message Authentication, Reporting & Conformance)**
  - Añade un registro TXT en tu DNS: `v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc-reports@domain.com`

#### Configurar Reverse DNS (PTR)

- Asegúrate de que la IP del servidor de correo tenga un registro PTR que apunte a tu dominio

### 2. Prácticas Recomendadas para el Contenido

#### Estructura del Correo

- **Usa HTML y texto plano**: Incluye siempre una versión en texto plano junto con la versión HTML
- **Equilibra texto e imágenes**: Evita correos que sean solo imágenes
- **Evita palabras "spam"**: No uses términos como "gratis", "oferta", "promoción" en exceso
- **Tamaño adecuado**: Mantén el correo por debajo de 100KB

#### Cabeceras y Metadatos

- **From, Reply-To y Return-Path**: Usa direcciones consistentes y válidas
- **Subject**: Evita mayúsculas excesivas, signos de exclamación múltiples y palabras spam
- **List-Unsubscribe**: Incluye siempre esta cabecera para permitir cancelar suscripción

### 3. Buenas Prácticas de Envío

- **Calentamiento de IP**: Si es una IP nueva, aumenta gradualmente el volumen de envíos
- **Consistencia**: Envía correos regularmente, no en ráfagas esporádicas
- **Segmentación**: Envía correos relevantes a audiencias específicas
- **Limpieza de listas**: Elimina rebotes duros y usuarios inactivos
- **Monitoreo**: Revisa tasas de apertura, clics, rebotes y quejas

### 4. Implementación en Nodemailer

En el archivo `emailSender.ts` ya se han implementado algunas mejoras:

```typescript
const mailOptions = {
  from: {
    name: 'CELLUS S.A',
    address: process.env.EMAIL_USER || 'noreply@cellus.com.ec'
  },
  to,
  subject,
  html,
  headers: {
    'X-Priority': '1', // Prioridad alta
    'X-MSMail-Priority': 'High',
    'Importance': 'High',
    'List-Unsubscribe': `<mailto:unsubscribe@cellus.com.ec?subject=Unsubscribe>`,
  }
};
```

### 5. Herramientas de Verificación

- **Mail-Tester**: https://www.mail-tester.com/
- **MXToolbox**: https://mxtoolbox.com/
- **Google Postmaster Tools**: https://postmaster.google.com/

### 6. Servicios de Envío Recomendados

Si los problemas persisten, considera usar servicios especializados:

- SendGrid
- Mailchimp
- Amazon SES
- Postmark

Estos servicios tienen alta reputación y ofrecen herramientas para monitorear y mejorar la entrega de correos.