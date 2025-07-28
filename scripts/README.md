# 🐍 Scripts Python para Gestión de Streams

Estos scripts te permiten administrar tus streams personalizados de manera fácil y eficiente desde Python.

## 📁 Archivos incluidos

- **`stream_manager.py`** - Script de línea de comandos completo
- **`interactive_manager.py`** - Interfaz interactiva fácil de usar  
- **`config.json`** - Archivo de configuración
- **`streams_example.json`** - Archivo de ejemplo con streams

## 🚀 Instalación

### 1. Instalar dependencias

```bash
pip install requests
```

### 2. Configurar tu servidor

Edita `config.json` con la URL de tu aplicación Kitsune:

```json
{
  "server": {
    "base_url": "http://localhost:3000"
  },
  "yaichi_server": {
    "base_url": "http://yaichi-anime.ddns.net:8080/stream",
    "default_token": "f02a7c"
  }
}
```

## 🎯 Uso Rápido - Modo Interactivo (Recomendado)

```bash
python interactive_manager.py
```

Este script te guiará paso a paso con un menú interactivo:

```
🦊 KITSUNE STREAM MANAGER
==================================================
1. 📺 Agregar stream individual
2. 📁 Agregar múltiples streams  
3. 🎬 Generar serie completa
4. � Buscar anime por nombre
5. �📊 Ver estadísticas
6. 🗑️  Eliminar stream
7. 📄 Crear archivo de ejemplo
8. ⚙️  Configurar URL del servidor
0. 🚪 Salir
```

### Ejemplos del modo interactivo:

#### ✨ Agregar un stream individual:
```
🎌 ID del anime: one-piece
📺 Número de episodio: 1
🔗 Opciones para URL del stream:
1. Usar formato Yaichi (solo ID del stream)  # ← Más fácil
2. URL completa personalizada

🆔 ID del stream en Yaichi: 11588
🔑 Token (Enter para usar 'f02a7c'): [Enter]
📽️ Calidad (Enter para 1080p): [Enter]
🗣️ Idioma (Enter para sub): [Enter]

✅ Stream agregado exitosamente!
```

#### 🎬 Generar serie completa:
```
🎌 ID del anime: one-piece
📺 Número total de episodios: 50
🆔 ID inicial en Yaichi: 11588

📋 Se generarán 50 streams para 'one-piece'
   Episodios: 1-50
   IDs Yaichi: 11588-11637

✅ ¿Continuar? (s/N): s
✅ 50 streams agregados exitosamente!
```

#### 🔍 **Buscar anime por nombre:**
```
🎌 Nombre del anime a buscar: attack on titan

📺 Resultados encontrados (5):
--------------------------------------------------
 1. Attack on Titan
    ID: attack-on-titan
    Año: 2013
    Episodios: 25

 2. Attack on Titan Season 2  
    ID: attack-on-titan-season-2
    Año: 2017
    Episodios: 12

🎯 Selecciona un anime (1-10) o 0 para cancelar: 1

✅ Seleccionado: Attack on Titan
   ID: attack-on-titan

¿Qué deseas hacer?
1. 📺 Agregar stream para un episodio
2. 🎬 Generar serie completa  
3. 📋 Solo mostrar información
```

## ⚡ Uso Línea de Comandos - Para Automatización

### Buscar anime por nombre:
```bash
python stream_manager.py search --query "attack on titan"
```

### Agregar stream con búsqueda interactiva:
```bash
python stream_manager.py add-interactive \
  --search "one piece" \
  --episode 1 \
  --url "http://yaichi-anime.ddns.net:8080/stream/11588?f02a7c"
```

### Agregar un stream individual:
```bash
python stream_manager.py add \
  --anime "one-piece" \
  --episode 1 \
  --url "http://yaichi-anime.ddns.net:8080/stream/11588?f02a7c" \
  --quality "1080p" \
  --language "sub"
```

### Generar serie completa:
```bash
python stream_manager.py generate \
  --anime "one-piece" \
  --episodes 50 \
  --start-id 11588 \
  --upload
```

### Agregar desde archivo JSON:
```bash
python stream_manager.py bulk-add --file streams_example.json
```

### Ver estadísticas:
```bash
python stream_manager.py stats
```

### Crear archivo de ejemplo:
```bash
python stream_manager.py sample-file --output mis_streams.json
```

## 📄 Formato del archivo JSON

```json
[
  {
    "animeId": "one-piece",
    "episodeNumber": 1,
    "streamUrl": "http://yaichi-anime.ddns.net:8080/stream/11588?f02a7c",
    "quality": "1080p",
    "language": "sub"
  },
  {
    "animeId": "one-piece", 
    "episodeNumber": 2,
    "streamUrl": "http://yaichi-anime.ddns.net:8080/stream/11589?f02a7c",
    "quality": "1080p",
    "language": "sub"
  }
]
```

## 🛠️ Casos de Uso Comunes

### 1. 📺 Agregar nueva temporada completa

```bash
# Generar streams para toda la temporada
python stream_manager.py generate \
  --anime "attack-on-titan-season-4" \
  --episodes 24 \
  --start-id 15001 \
  --save-file "aot-s4.json"

# Revisar antes de subir
cat aot-s4.json

# Subir a la API
python stream_manager.py bulk-add --file "aot-s4.json"
```

### 2. 🔄 Actualizar streams existentes

```bash
# Ver estadísticas actuales
python stream_manager.py stats

# Eliminar stream específico (si es necesario)
python stream_manager.py remove --id "one-piece-1-yaichi-anime-1234567890"

# Agregar nuevo stream
python stream_manager.py add --anime "one-piece" --episode 1 --url "nueva-url"
```

### 3. 📊 Monitoreo

```bash
# Ver estadísticas
python stream_manager.py stats

# Salida esperada:
# 📊 Estadísticas de Streams:
#    Total de streams: 125
#    Streams activos: 125
#    Streams por servidor:
#      - yaichi-anime: 125
```

## 🎯 Flujo de Trabajo Recomendado

### Para administradores nuevos:
1. **Usar modo interactivo** → `python interactive_manager.py`
2. **Agregar streams de prueba** → Opción 1 del menú
3. **Ver estadísticas** → Opción 4 del menú

### Para administradores avanzados:
1. **Crear archivo JSON** con todos los streams
2. **Usar línea de comandos** para automatización
3. **Integrar en scripts** de deployment

## 🔧 Personalización

### Agregar nuevos servidores:

Edita `config.json`:
```json
{
  "servers": {
    "yaichi": {
      "base_url": "http://yaichi-anime.ddns.net:8080/stream",
      "default_token": "f02a7c"
    },
    "mi_servidor": {
      "base_url": "http://mi-servidor.com/video",
      "default_token": "abc123"
    }
  }
}
```

### Mapeos de anime:

```json
{
  "anime_mappings": {
    "op": "one-piece",
    "aot": "attack-on-titan",
    "naruto": "naruto-shippuden"
  }
}
```

## ⚠️ Troubleshooting

### Error de conexión:
```bash
❌ Error de conexión: Connection refused
```
**Solución**: Verifica que tu aplicación Kitsune esté ejecutándose en `http://localhost:3000`

### Error 404:
```bash
❌ Error 404: Not Found
```
**Solución**: Verifica que el endpoint `/api/admin/streams` exista en tu aplicación

### Archivo JSON inválido:
```bash
❌ Error al leer JSON: Expecting ',' delimiter
```
**Solución**: Verifica la sintaxis de tu archivo JSON con un validador online

## 🚀 Automatización con Scripts

### Script para subir temporada completa:
```bash
#!/bin/bash
# upload_season.sh

ANIME_ID="$1"
TOTAL_EPISODES="$2" 
START_ID="$3"

echo "📺 Subiendo temporada completa de $ANIME_ID"

python stream_manager.py generate \
  --anime "$ANIME_ID" \
  --episodes "$TOTAL_EPISODES" \
  --start-id "$START_ID" \
  --upload

echo "✅ Temporada subida exitosamente!"
```

Uso:
```bash
./upload_season.sh "demon-slayer-season-3" 12 20001
```

## 📈 Próximas Mejoras

- [ ] **GUI con Tkinter** para administración visual
- [ ] **Validación de URLs** antes de subir
- [ ] **Backup automático** de configuraciones
- [ ] **Batch processing** con progreso visual
- [ ] **Integración con bases de datos** externas

¡Ya tienes todo listo para gestionar tus streams de manera profesional! 🎉
