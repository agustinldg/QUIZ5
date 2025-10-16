# QUIZ5

Una aplicación de quiz interactiva con imágenes que permite a los usuarios responder preguntas visuales de manera dinámica y accesible.

## 🎯 Características

- **10 preguntas** con imágenes descriptivas
- **Interfaz accesible** con navegación por teclado
- **Síntesis de voz** para leer las descripciones de las imágenes
- **Progreso visual** con barra de progreso
- **Resultados detallados** con descarga en PDF
- **Diseño responsive** para dispositivos móviles y desktop

## 🚀 Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Estilos**: CSS Grid y Flexbox para layout responsive
- **Funcionalidades**: Web Speech API, jsPDF para generación de PDFs
- **Integración**: Google Apps Script para Google Sheets

## 📁 Estructura del Proyecto

```
QUIZ5/
├── index.html              # Página principal
├── script.js               # Lógica de la aplicación
├── styles.css              # Estilos CSS
├── quiz-data.json          # Datos del quiz (URLs de imágenes)
├── quiz-data-base64.json   # Datos del quiz (imágenes en base64)
├── convert_to_base64.py    # Script para convertir URLs a base64
├── requirements.txt        # Dependencias de Python
├── google-apps-script-*.gs # Scripts para Google Sheets
└── README-converter.md     # Documentación del convertidor
```

## 🛠️ Instalación y Uso

### Opción 1: Usar imágenes en base64 (recomendado)

1. **Ejecutar el convertidor:**
   ```bash
   python convert_to_base64.py
   ```

2. **Abrir la aplicación:**
   ```bash
   open index.html
   ```

### Opción 2: Usar URLs de imágenes

1. **Asegurarse de tener conexión a internet**
2. **Abrir directamente:**
   ```bash
   open index.html
   ```

## 🎮 Cómo Jugar

1. **Navegación**: Usa las flechas o botones "Anterior"/"Siguiente"
2. **Selección**: Haz clic en la imagen que mejor coincida con la pregunta
3. **Accesibilidad**: Usa las teclas 1, 2, 3 para seleccionar opciones
4. **Audio**: Haz clic en las imágenes para escuchar sus descripciones
5. **Resultados**: Al finalizar, puedes descargar tus resultados en PDF

## 🔧 Personalización

### Modificar las Preguntas

Edita el archivo `quiz-data.json` para:
- Cambiar las imágenes de las preguntas
- Modificar las opciones de respuesta
- Ajustar las descripciones de audio

### Integración con Google Sheets

Consulta los archivos:
- `google-sheets-setup-guide.md`
- `google-service-deployment-guide.md`
- `troubleshooting-guide.md`

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Dispositivos móviles (iOS/Android)
- ✅ Lectores de pantalla
- ✅ Navegación por teclado

## 🤝 Contribuciones

Este proyecto está abierto a contribuciones. Para sugerencias o reportes de errores, por favor crea un issue en el repositorio.

## 📄 Licencia

Proyecto educativo de código abierto.

---

**QUIZ5** - Una experiencia de aprendizaje visual interactiva 🎨✨
