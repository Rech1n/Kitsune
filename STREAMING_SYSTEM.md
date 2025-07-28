# Sistema de Streaming Híbrido

Este sistema combina **HiAnime** para obtener metadatos de anime con tu propio sistema de streaming personalizado.

## 🚨 Soluciones Rápidas a Errores Comunes

### Error: "Cannot read properties of undefined (reading 'length')"
Si ves este error, es porque el sistema está buscando streams pero no encuentra ninguno:

#### 1. Agregar streams de prueba:
```bash
# Método 1: Script interactivo (recomendado)
python scripts/interactive_manager.py
# → Opción 4: Buscar anime por nombre
# → Buscar el anime que estás viendo
# → Agregar streams para los episodios

# Método 2: Línea de comandos rápida
python scripts/stream_manager.py add-interactive \
  --search "nombre del anime" \
  --episode 1 \
  --url "http://yaichi-anime.ddns.net:8080/stream/11588?f02a7c"
```

#### 2. Verificar que funciona:
- Actualiza la página del anime
- El error debería desaparecer
- Ahora debería usar TU stream personalizado

### Error: "Cannot find module '/root/.../lib/worker.js'"
Este error se produce por problemas con HLS.js workers en Next.js:

#### ✅ Solución implementada (COMPLETA):

**1. Next.js Configuration (next.config.mjs):**
```javascript
webpack: (config, { isServer, webpack }) => {
  if (!isServer) {
    // Deshabilitar TODOS los workers de HLS.js
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /worker/i,
        contextRegExp: /hls\.js/,
      })
    );
    
    // Variable de entorno para deshabilitar workers
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.HLS_DISABLE_WORKER': JSON.stringify('true'),
      })
    );
  }
}
```

**2. Configuración HLS centralizada (src/lib/hls-config.ts):**
```typescript
export function createWorkerFreeHlsConfig() {
  return {
    enableWorker: false,           // Deshabilitar workers
    workerPath: undefined,         // Sin path de worker
    enableWebVTT: false,          // Sin WebVTT worker
    enableIMSC1: false,           // Sin IMSC1 worker
    enableCEA708Captions: false,  // Sin caption worker
    // ... configuración optimizada
  };
}
```

**3. Para aplicar los cambios:**
```bash
# Limpiar cache de Next.js y reiniciar
rm -rf .next && npm run dev
```

### HiAnime no aparece por defecto
**✅ Solucionado**: HiAnime ahora siempre aparece como servidor por defecto, incluso si no hay streams disponibles.

---#### ⚡ Línea de comandos (Para automatización):
```bash
# Buscar anime por nombre
python scripts/stream_manager.py search --query "attack on titan"

# Agregar stream con búsqueda interactiva  
python scripts/stream_manager.py add-interactive \
  --search "one piece" \
  --episode 1 \
  --url "http://yaichi-anime.ddns.net:8080/stream/11588?f02a7c"

# Agregar un stream individual (si ya sabes el ID)
python scripts/stream_manager.py add \
  --anime "one-piece" \
  --episode 1 \
  --url "http://yaichi-anime.ddns.net:8080/stream/11588?f02a7c"

# Generar serie completa  
python scripts/stream_manager.py generate \
  --anime "one-piece" \
  --episodes 50 \
  --start-id 11588 \
  --upload

# Agregar desde archivo JSON
python scripts/stream_manager.py bulk-add --file streams.json
``` de anime con tu propio sistema de streaming personalizado.

## 🏗️ Arquitectura

### Principios aplicados:
- **Single Responsibility Principle (SRP)**: Cada servicio tiene una responsabilidad específica
- **Open/Closed Principle**: Fácil extensión sin modificar código existente
- **Dependency Inversion**: Interfaces bien definidas
- **DRY**: Código reutilizable y sin duplicación

### Servicios:

1. **HiAnime** → Metadatos de anime (títulos, episodios, horarios, búsquedas)
2. **CustomStreamService** → Gestión de tus stream links
3. **HybridStreamingService** → Combina ambos de manera elegante

## 🚀 Cómo usar

### 1. Agregar un stream individual

```typescript
// Usando la API directamente
const response = await fetch('/api/admin/streams', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    animeId: 'one-piece',
    episodeNumber: 1,
    streamUrl: 'http://yaichi-anime.ddns.net:8080/stream/11588?f02a7c',
    quality: '1080p',
    language: 'sub'
  })
});
```

### 2. Agregar múltiples streams

```typescript
const streams = [
  {
    animeId: 'one-piece',
    episodeNumber: 1,
    streamUrl: 'http://example.com:8080/stream/11588?f02a7c',
    quality: '1080p',
    language: 'sub'
  },
  {
    animeId: 'one-piece',
    episodeNumber: 2,
    streamUrl: 'http://example.com:8080/stream/11589?f02a7c',
    quality: '1080p',
    language: 'sub'
  }
];

const response = await fetch('/api/admin/streams', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ bulk: true, streams })
});
```

### 3. Usando scripts Python (Recomendado)

#### 🐍 Modo Interactivo (Más fácil):
```bash
python scripts/interactive_manager.py
```

#### ⚡ Línea de comandos (Para automatización):
```bash
# Agregar un stream individual
python scripts/stream_manager.py add \
  --anime "one-piece" \
  --episode 1 \
  --url "http://example:8080/stream/11588?f02a7c"

# Generar serie completa  
python scripts/stream_manager.py generate \
  --anime "one-piece" \
  --episodes 50 \
  --start-id 11588 \
  --upload

# Agregar desde archivo JSON
python scripts/stream_manager.py bulk-add --file streams.json
```

#### 📄 Ver documentación completa:
- **[Scripts Python README](scripts/README.md)** - Guía completa de los scripts

## 📡 Endpoints de la API

### `/api/episode/sources` (Actualizado)
Obtiene streams personalizados + fallback de HiAnime:

```
GET /api/episode/sources?animeEpisodeId=one-piece-episode-1&animeId=one-piece&episodeNumber=1&category=sub
```

**Respuesta:**
```json
{
  "data": {
    "episodeId": "one-piece-episode-1",
    "animeId": "one-piece", 
    "episodeNumber": 1,
    "availableStreams": [
      {
        "id": "one-piece-1-example-anime-1234567890",
        "streamUrl": "http://example.com:8080/stream/11588?f02a7c",
        "quality": { "resolution": "1080p" },
        "language": { "type": "sub" },
        "server": "yaichi-anime"
      }
    ],
    "fallbackStreams": [...] // HiAnime streams como backup
  }
}
```

### `/api/admin/streams` (Nuevo)

#### Agregar stream:
```
POST /api/admin/streams
{
  "animeId": "one-piece",
  "episodeNumber": 1,
  "streamUrl": "http://example.com:8080/stream/11588?f02a7c",
  "quality": "1080p",
  "language": "sub"
}
```

#### Obtener estadísticas:
```
GET /api/admin/streams?action=stats
```

#### Eliminar stream:
```
DELETE /api/admin/streams?streamId=one-piece-1-example-anime-1234567890
```

## 🔄 Flujo de funcionamiento

1. **Cliente solicita episodio** → `/api/episode/sources`
2. **Sistema busca streams personalizados** → Prioridad alta
3. **Si no hay custom streams** → Fallback a HiAnime
4. **Retorna ambos** → Cliente decide cuál usar

## 🛠️ Ventajas del diseño

### ✅ Limpio y mantenible
- **Separación de responsabilidades**: HiAnime para metadatos, tu sistema para streams
- **Fácil testing**: Cada servicio es independiente
- **Escalable**: Fácil agregar nuevos tipos de servidores

### ✅ Flexible
- **Fallback automático**: Si tu stream falla, usa HiAnime
- **Múltiples calidades**: 480p, 720p, 1080p, 4K
- **Múltiples idiomas**: sub, dub, raw
- **Múltiples servidores**: Fácil agregar más servidores

### ✅ Robusto
- **Error handling**: Manejo de errores en cada capa
- **Validación**: Parámetros validados
- **Logging**: Errores registrados para debugging

## 🎯 Ejemplo práctico

```typescript
// 1. HiAnime te da la info del anime
const animeInfo = await hybridStreamingService.getAnimeInfo('one-piece');

// 2. HiAnime te da los episodios disponibles  
const episodes = await hybridStreamingService.getAnimeEpisodes('one-piece');

// 3. Tú agregas tus streams personalizados
const customStream = await hybridStreamingService.addCustomStream(
  'one-piece',
  1,
  'http://example.com:8080/stream/11588?f02a7c',
  { quality: '1080p', language: 'sub' }
);

// 4. Cuando el usuario ve el episodio, obtiene TUS streams primero
const streamData = await hybridStreamingService.getEpisodeStreams(
  'one-piece-episode-1',
  'one-piece', 
  1,
  'sub'
);
// streamData.availableStreams = [tu stream personalizado]
// streamData.fallbackStreams = [streams de HiAnime como backup]
```

## 🔐 Seguridad

Para producción, considera agregar:
- Autenticación en `/api/admin/streams`
- Rate limiting
- Validación de URLs
- Encriptación de tokens de stream

## 📈 Próximos pasos

1. **Base de datos**: Persistir streams en BD en lugar de memoria
2. **Cache**: Cache de metadatos de HiAnime
3. **Monitoreo**: Health checks de tus servidores
4. **Dashboard**: UI para gestionar streams
5. **Analytics**: Estadísticas de uso
