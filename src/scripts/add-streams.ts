/**
 * Script de ejemplo para agregar stream links personalizados
 * Úsalo para configurar tus propios enlaces de streaming
 */

// Ejemplo de cómo agregar un stream individual
export async function addSingleStream() {
  const response = await fetch('/api/admin/streams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      animeId: 'one-piece', // Tu ID interno del anime
      episodeNumber: 1,
      streamUrl: 'http://yaichi-anime.ddns.net:8080/stream/11588?f02a7c',
      quality: '1080p',
      language: 'sub'
    })
  });

  const result = await response.json();
  console.log('Stream agregado:', result);
}

// Ejemplo de cómo agregar múltiples streams de una vez
export async function addBulkStreams() {
  const streams = [
    {
      animeId: 'one-piece',
      episodeNumber: 1,
      streamUrl: 'http://yaichi-anime.ddns.net:8080/stream/11588?f02a7c',
      quality: '1080p' as const,
      language: 'sub' as const
    },
    {
      animeId: 'one-piece',
      episodeNumber: 2,
      streamUrl: 'http://yaichi-anime.ddns.net:8080/stream/11589?f02a7c',
      quality: '1080p' as const,
      language: 'sub' as const
    },
    {
      animeId: 'naruto',
      episodeNumber: 1,
      streamUrl: 'http://yaichi-anime.ddns.net:8080/stream/12001?f02a7c',
      quality: '720p' as const,
      language: 'dub' as const
    }
  ];

  const response = await fetch('/api/admin/streams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bulk: true,
      streams
    })
  });

  const result = await response.json();
  console.log('Streams agregados:', result);
}

// Ejemplo de cómo obtener estadísticas
export async function getStreamStats() {
  const response = await fetch('/api/admin/streams?action=stats');
  const result = await response.json();
  console.log('Estadísticas de streams:', result.stats);
}

// Función helper para generar URLs de tu servidor
export function generateStreamUrl(streamId: string, token: string = 'f02a7c') {
  return `http://yaichi-anime.ddns.net:8080/stream/${streamId}?${token}`;
}

// Ejemplo de configuración por lotes para una serie completa
export function generateSeriesStreams(
  seriesName: string, 
  totalEpisodes: number, 
  startingStreamId: number
) {
  const streams = [];
  
  for (let episode = 1; episode <= totalEpisodes; episode++) {
    streams.push({
      animeId: seriesName.toLowerCase().replace(/\s+/g, '-'),
      episodeNumber: episode,
      streamUrl: generateStreamUrl((startingStreamId + episode - 1).toString()),
      quality: '1080p' as const,
      language: 'sub' as const
    });
  }
  
  return streams;
}

// Ejemplo de uso:
// const onePieceStreams = generateSeriesStreams('One Piece', 50, 11588);
// console.log('Streams generados para One Piece:', onePieceStreams);

export default {
  addSingleStream,
  addBulkStreams,
  getStreamStats,
  generateStreamUrl,
  generateSeriesStreams
};
