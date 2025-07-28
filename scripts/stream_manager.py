#!/usr/bin/env python3
"""
Kitsune Stream Manager
Script para gestionar streams personalizados en la API de Kitsune

Uso:
    python stream_manager.py add --anime "one-piece" --episode 1 --url "http://yaichi-anime.ddns.net:8080/stream/11588?f02a7c"
    python stream_manager.py list --anime "one-piece"
    python stream_manager.py bulk-add --file streams.json
    python stream_manager.py stats
"""

import requests
import json
import argparse
import sys
from typing import Dict, List, Optional
from dataclasses import dataclass
from urllib.parse import urljoin

@dataclass
class StreamData:
    anime_id: str
    episode_number: int
    stream_url: str
    quality: str = "1080p"
    language: str = "sub"
    server_id: str = "yaichi-anime"

class KitsuneStreamManager:
    def __init__(self, base_url: str = "http://localhost:3000"):
        """
        Inicializa el gestor de streams
        
        Args:
            base_url: URL base de tu aplicación Kitsune
        """
        self.base_url = base_url.rstrip('/')
        self.api_url = f"{self.base_url}/api/admin/streams"
        self.search_url = f"{self.base_url}/api/admin/search"
        
    def add_stream(self, stream: StreamData) -> bool:
        """
        Agrega un stream individual
        
        Args:
            stream: Datos del stream a agregar
            
        Returns:
            bool: True si se agregó exitosamente
        """
        payload = {
            "animeId": stream.anime_id,
            "episodeNumber": stream.episode_number,
            "streamUrl": stream.stream_url,
            "quality": stream.quality,
            "language": stream.language,
            "serverId": stream.server_id
        }
        
        try:
            response = requests.post(
                self.api_url,
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Stream agregado: {stream.anime_id} Ep.{stream.episode_number}")
                print(f"   ID: {result.get('stream', {}).get('id', 'N/A')}")
                return True
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                return False
                
        except requests.RequestException as e:
            print(f"❌ Error de conexión: {e}")
            return False
    
    def bulk_add_streams(self, streams: List[StreamData]) -> bool:
        """
        Agrega múltiples streams de una vez
        
        Args:
            streams: Lista de streams a agregar
            
        Returns:
            bool: True si se agregaron exitosamente
        """
        payload = {
            "bulk": True,
            "streams": [
                {
                    "animeId": s.anime_id,
                    "episodeNumber": s.episode_number,
                    "streamUrl": s.stream_url,
                    "quality": s.quality,
                    "language": s.language
                }
                for s in streams
            ]
        }
        
        try:
            response = requests.post(
                self.api_url,
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ {len(streams)} streams agregados exitosamente")
                return True
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                return False
                
        except requests.RequestException as e:
            print(f"❌ Error de conexión: {e}")
            return False
    
    def get_stats(self) -> Optional[Dict]:
        """
        Obtiene estadísticas de streams
        
        Returns:
            Dict con estadísticas o None si hay error
        """
        try:
            response = requests.get(
                f"{self.api_url}?action=stats",
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json().get('stats')
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                return None
                
        except requests.RequestException as e:
            print(f"❌ Error de conexión: {e}")
            return None
    
    def remove_stream(self, stream_id: str) -> bool:
        """
        Elimina un stream
        
        Args:
            stream_id: ID del stream a eliminar
            
        Returns:
            bool: True si se eliminó exitosamente
        """
        try:
            response = requests.delete(
                f"{self.api_url}?streamId={stream_id}",
                timeout=30
            )
            
            if response.status_code == 200:
                print(f"✅ Stream {stream_id} eliminado")
                return True
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                return False
                
        except requests.RequestException as e:
            print(f"❌ Error de conexión: {e}")
            return False
    
    def search_anime(self, query: str, page: int = 1) -> Optional[Dict]:
        """
        Busca anime por nombre usando HiAnime
        
        Args:
            query: Término de búsqueda
            page: Número de página
            
        Returns:
            Dict con resultados de búsqueda o None si hay error
        """
        try:
            response = requests.get(
                f"{self.search_url}?q={query}&page={page}",
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                return None
                
        except requests.RequestException as e:
            print(f"❌ Error de conexión: {e}")
            return None
    
    def interactive_anime_search(self, query: str) -> Optional[str]:
        """
        Búsqueda interactiva de anime con selección
        
        Args:
            query: Término de búsqueda
            
        Returns:
            ID del anime seleccionado o None si se cancela
        """
        print(f"🔍 Buscando '{query}'...")
        
        search_result = self.search_anime(query)
        if not search_result:
            return None
        
        results = search_result.get('results', {})
        animes = results.get('animes', []) if isinstance(results, dict) else results
        
        if not animes:
            print("❌ No se encontraron animes con ese nombre")
            return None
        
        print(f"\n📺 Resultados encontrados ({len(animes)}):")
        print("-" * 60)
        
        # Mostrar lista de resultados
        for i, anime in enumerate(animes[:10], 1):  # Mostrar máximo 10
            title = anime.get('name', anime.get('title', 'Sin título'))
            anime_id = anime.get('id', 'N/A')
            year = anime.get('releaseDate', anime.get('year', ''))
            episodes = anime.get('totalEpisodes', anime.get('episodes', ''))
            
            print(f"{i:2d}. {title}")
            print(f"    ID: {anime_id}")
            if year:
                print(f"    Año: {year}")
            if episodes:
                print(f"    Episodios: {episodes}")
            print()
        
        # Selección interactiva
        while True:
            try:
                selection = input("🎯 Selecciona un anime (1-10) o 0 para cancelar: ").strip()
                
                if selection == "0":
                    print("❌ Búsqueda cancelada")
                    return None
                
                index = int(selection) - 1
                if 0 <= index < len(animes) and index < 10:
                    selected_anime = animes[index]
                    anime_id = selected_anime.get('id')
                    anime_title = selected_anime.get('name', selected_anime.get('title'))
                    
                    print(f"\n✅ Seleccionado: {anime_title}")
                    print(f"   ID: {anime_id}")
                    
                    return anime_id
                else:
                    print("❌ Selección inválida. Intenta de nuevo.")
                    
            except ValueError:
                print("❌ Por favor ingresa un número válido.")
            except KeyboardInterrupt:
                print("\n❌ Operación cancelada")
                return None

class StreamFileManager:
    """Gestor de archivos JSON para streams"""
    
    @staticmethod
    def load_streams_from_file(file_path: str) -> List[StreamData]:
        """
        Carga streams desde un archivo JSON
        
        Args:
            file_path: Ruta al archivo JSON
            
        Returns:
            Lista de StreamData
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            streams = []
            for item in data:
                stream = StreamData(
                    anime_id=item['anime_id'],
                    episode_number=item['episode_number'],
                    stream_url=item['stream_url'],
                    quality=item.get('quality', '1080p'),
                    language=item.get('language', 'sub'),
                    server_id=item.get('server_id', 'yaichi-anime')
                )
                streams.append(stream)
            
            return streams
            
        except FileNotFoundError:
            print(f"❌ Archivo no encontrado: {file_path}")
            return []
        except json.JSONDecodeError as e:
            print(f"❌ Error al leer JSON: {e}")
            return []
        except KeyError as e:
            print(f"❌ Campo requerido faltante en JSON: {e}")
            return []
    
    @staticmethod
    def create_sample_file(file_path: str = "streams_sample.json"):
        """
        Crea un archivo de ejemplo
        
        Args:
            file_path: Ruta donde crear el archivo
        """
        sample_data = [
            {
                "anime_id": "one-piece",
                "episode_number": 1,
                "stream_url": "http://yaichi-anime.ddns.net:8080/stream/11588?f02a7c",
                "quality": "1080p",
                "language": "sub"
            },
            {
                "anime_id": "one-piece", 
                "episode_number": 2,
                "stream_url": "http://yaichi-anime.ddns.net:8080/stream/11589?f02a7c",
                "quality": "1080p",
                "language": "sub"
            },
            {
                "anime_id": "naruto",
                "episode_number": 1,
                "stream_url": "http://yaichi-anime.ddns.net:8080/stream/12001?f02a7c",
                "quality": "720p",
                "language": "dub"
            }
        ]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Archivo de ejemplo creado: {file_path}")

def generate_series_streams(
    anime_id: str, 
    total_episodes: int, 
    starting_stream_id: int,
    base_url: str = "http://yaichi-anime.ddns.net:8080/stream",
    token: str = "f02a7c"
) -> List[StreamData]:
    """
    Genera streams para una serie completa
    
    Args:
        anime_id: ID del anime
        total_episodes: Número total de episodios
        starting_stream_id: ID inicial del stream
        base_url: URL base del servidor
        token: Token de acceso
        
    Returns:
        Lista de StreamData generados
    """
    streams = []
    
    for episode in range(1, total_episodes + 1):
        stream_id = starting_stream_id + episode - 1
        stream_url = f"{base_url}/{stream_id}?{token}"
        
        stream = StreamData(
            anime_id=anime_id,
            episode_number=episode,
            stream_url=stream_url,
            quality="1080p",
            language="sub"
        )
        streams.append(stream)
    
    return streams

def print_stats(stats: Dict):
    """Imprime estadísticas de manera legible"""
    print("\n📊 Estadísticas de Streams:")
    print(f"   Total de streams: {stats.get('totalStreams', 0)}")
    print(f"   Streams activos: {stats.get('activeStreams', 0)}")
    
    streams_by_server = stats.get('streamsByServer', {})
    if streams_by_server:
        print("   Streams por servidor:")
        for server, count in streams_by_server.items():
            print(f"     - {server}: {count}")

def main():
    parser = argparse.ArgumentParser(
        description="Gestor de streams para Kitsune",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  %(prog)s add --anime "one-piece" --episode 1 --url "http://yaichi-anime.ddns.net:8080/stream/11588?f02a7c"
  %(prog)s bulk-add --file streams.json
  %(prog)s generate --anime "one-piece" --episodes 50 --start-id 11588
  %(prog)s stats
  %(prog)s sample-file
        """
    )
    
    parser.add_argument(
        '--base-url', 
        default='http://localhost:3000',
        help='URL base de la aplicación Kitsune (default: http://localhost:3000)'
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Comandos disponibles')
    
    # Comando: add
    add_parser = subparsers.add_parser('add', help='Agregar un stream individual')
    add_parser.add_argument('--anime', required=True, help='ID del anime')
    add_parser.add_argument('--episode', type=int, required=True, help='Número de episodio')
    add_parser.add_argument('--url', required=True, help='URL del stream')
    add_parser.add_argument('--quality', default='1080p', choices=['480p', '720p', '1080p', '1440p', '4K'])
    add_parser.add_argument('--language', default='sub', choices=['sub', 'dub', 'raw'])
    
    # Comando: bulk-add
    bulk_parser = subparsers.add_parser('bulk-add', help='Agregar streams desde archivo JSON')
    bulk_parser.add_argument('--file', required=True, help='Ruta al archivo JSON')
    
    # Comando: generate
    gen_parser = subparsers.add_parser('generate', help='Generar streams para una serie completa')
    gen_parser.add_argument('--anime', required=True, help='ID del anime')
    gen_parser.add_argument('--episodes', type=int, required=True, help='Número total de episodios')
    gen_parser.add_argument('--start-id', type=int, required=True, help='ID inicial del stream')
    gen_parser.add_argument('--save-file', help='Guardar en archivo JSON (opcional)')
    gen_parser.add_argument('--upload', action='store_true', help='Subir directamente a la API')
    
    # Comando: search
    search_parser = subparsers.add_parser('search', help='Buscar anime por nombre')
    search_parser.add_argument('--query', required=True, help='Nombre del anime a buscar')
    search_parser.add_argument('--page', type=int, default=1, help='Página de resultados')
    
    # Comando: add-interactive
    add_int_parser = subparsers.add_parser('add-interactive', help='Agregar stream con búsqueda interactiva')
    add_int_parser.add_argument('--search', required=True, help='Nombre del anime a buscar')
    add_int_parser.add_argument('--episode', type=int, required=True, help='Número de episodio')
    add_int_parser.add_argument('--url', required=True, help='URL del stream')
    add_int_parser.add_argument('--quality', default='1080p', choices=['480p', '720p', '1080p', '1440p', '4K'])
    add_int_parser.add_argument('--language', default='sub', choices=['sub', 'dub', 'raw'])
    
    # Comando: stats
    subparsers.add_parser('stats', help='Ver estadísticas de streams')
    
    # Comando: remove
    remove_parser = subparsers.add_parser('remove', help='Eliminar un stream')
    remove_parser.add_argument('--id', required=True, help='ID del stream a eliminar')
    
    # Comando: sample-file
    sample_parser = subparsers.add_parser('sample-file', help='Crear archivo de ejemplo')
    sample_parser.add_argument('--output', default='streams_sample.json', help='Nombre del archivo')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    manager = KitsuneStreamManager(args.base_url)
    
    if args.command == 'add':
        stream = StreamData(
            anime_id=args.anime,
            episode_number=args.episode,
            stream_url=args.url,
            quality=args.quality,
            language=args.language
        )
        manager.add_stream(stream)
        
    elif args.command == 'bulk-add':
        streams = StreamFileManager.load_streams_from_file(args.file)
        if streams:
            manager.bulk_add_streams(streams)
            
    elif args.command == 'generate':
        streams = generate_series_streams(
            args.anime, 
            args.episodes, 
            args.start_id
        )
        
        print(f"📺 Generados {len(streams)} streams para '{args.anime}'")
        
        if args.save_file:
            # Guardar en archivo
            stream_data = [
                {
                    "anime_id": s.anime_id,
                    "episode_number": s.episode_number,
                    "stream_url": s.stream_url,
                    "quality": s.quality,
                    "language": s.language
                }
                for s in streams
            ]
            
            with open(args.save_file, 'w', encoding='utf-8') as f:
                json.dump(stream_data, f, indent=2, ensure_ascii=False)
            print(f"💾 Guardado en: {args.save_file}")
        
        if args.upload:
            print("📤 Subiendo streams...")
            manager.bulk_add_streams(streams)
    
    elif args.command == 'search':
        result = manager.search_anime(args.query, args.page)
        if result:
            results = result.get('results', {})
            animes = results.get('animes', []) if isinstance(results, dict) else results
            
            if animes:
                print(f"\n📺 Resultados para '{args.query}' (Página {args.page}):")
                print("-" * 60)
                
                for i, anime in enumerate(animes, 1):
                    title = anime.get('name', anime.get('title', 'Sin título'))
                    anime_id = anime.get('id', 'N/A')
                    year = anime.get('releaseDate', anime.get('year', ''))
                    episodes = anime.get('totalEpisodes', anime.get('episodes', ''))
                    
                    print(f"{i:2d}. {title}")
                    print(f"    ID: {anime_id}")
                    if year:
                        print(f"    Año: {year}")
                    if episodes:
                        print(f"    Episodios: {episodes}")
                    print()
            else:
                print("❌ No se encontraron resultados")
    
    elif args.command == 'add-interactive':
        anime_id = manager.interactive_anime_search(args.search)
        if anime_id:
            stream = StreamData(
                anime_id=anime_id,
                episode_number=args.episode,
                stream_url=args.url,
                quality=args.quality,
                language=args.language
            )
            manager.add_stream(stream)
            
    elif args.command == 'stats':
        stats = manager.get_stats()
        if stats:
            print_stats(stats)
            
    elif args.command == 'remove':
        manager.remove_stream(args.id)
        
    elif args.command == 'sample-file':
        StreamFileManager.create_sample_file(args.output)

if __name__ == "__main__":
    main()
