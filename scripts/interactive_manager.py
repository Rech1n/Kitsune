#!/usr/bin/env python3
"""
Kitsune Stream Manager - Modo Interactivo
Script simple para gestionar streams sin línea de comandos

Solo ejecuta: python interactive_manager.py
"""

import requests
import json
import os
from typing import Dict, List

class InteractiveStreamManager:
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.api_url = f"{self.base_url}/api/admin/streams"
        self.search_url = f"{self.base_url}/api/admin/search"
        self.config = self.load_config()
        
    def load_config(self) -> Dict:
        """Carga configuración desde config.json"""
        config_path = os.path.join(os.path.dirname(__file__), 'config.json')
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return {
                "yaichi_server": {
                    "base_url": "http://yaichi-anime.ddns.net:8080/stream",
                    "default_token": "f02a7c"
                }
            }
    
    def show_menu(self):
        """Muestra el menú principal"""
        print("\n" + "="*50)
        print("🦊 KITSUNE STREAM MANAGER")
        print("="*50)
        print("1. 📺 Agregar stream individual")
        print("2. 📁 Agregar múltiples streams")
        print("3. 🎬 Generar serie completa")
        print("4. � Buscar anime por nombre")
        print("5. �📊 Ver estadísticas")
        print("6. 🗑️  Eliminar stream")
        print("7. 📄 Crear archivo de ejemplo")
        print("8. ⚙️  Configurar URL del servidor")
        print("0. 🚪 Salir")
        print("="*50)
    
    def add_single_stream(self):
        """Agregar un stream individual de forma interactiva"""
        print("\n📺 AGREGAR STREAM INDIVIDUAL")
        print("-" * 30)
        
        anime_id = input("🎌 ID del anime (ej: one-piece): ").strip()
        if not anime_id:
            print("❌ ID del anime es requerido")
            return
            
        try:
            episode = int(input("📺 Número de episodio: ").strip())
        except ValueError:
            print("❌ Número de episodio inválido")
            return
            
        print("\n🔗 Opciones para URL del stream:")
        print("1. Usar formato Yaichi (solo ID del stream)")
        print("2. URL completa personalizada")
        
        url_option = input("Selecciona opción (1-2): ").strip()
        
        if url_option == "1":
            stream_id = input("🆔 ID del stream en Yaichi: ").strip()
            if not stream_id:
                print("❌ ID del stream es requerido")
                return
            token = input(f"🔑 Token (Enter para usar '{self.config['yaichi_server']['default_token']}'): ").strip()
            if not token:
                token = self.config['yaichi_server']['default_token']
            
            stream_url = f"{self.config['yaichi_server']['base_url']}/{stream_id}?{token}"
        else:
            stream_url = input("🔗 URL completa del stream: ").strip()
            if not stream_url:
                print("❌ URL del stream es requerida")
                return
        
        quality = input("📽️  Calidad (Enter para 1080p): ").strip() or "1080p"
        language = input("🗣️  Idioma [sub/dub/raw] (Enter para sub): ").strip() or "sub"
        
        # Confirmar datos
        print(f"\n📋 CONFIRMAR DATOS:")
        print(f"   Anime: {anime_id}")
        print(f"   Episodio: {episode}")
        print(f"   URL: {stream_url}")
        print(f"   Calidad: {quality}")
        print(f"   Idioma: {language}")
        
        confirm = input("\n✅ ¿Confirmar? (s/N): ").strip().lower()
        if confirm not in ['s', 'si', 'sí', 'y', 'yes']:
            print("❌ Operación cancelada")
            return
        
        # Enviar a la API
        payload = {
            "animeId": anime_id,
            "episodeNumber": episode,
            "streamUrl": stream_url,
            "quality": quality,
            "language": language
        }
        
        try:
            print("📤 Enviando...")
            response = requests.post(
                self.api_url,
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Stream agregado exitosamente!")
                print(f"   ID generado: {result.get('stream', {}).get('id', 'N/A')}")
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                
        except requests.RequestException as e:
            print(f"❌ Error de conexión: {e}")
    
    def generate_series(self):
        """Generar streams para una serie completa"""
        print("\n🎬 GENERAR SERIE COMPLETA")
        print("-" * 30)
        
        anime_id = input("🎌 ID del anime: ").strip()
        if not anime_id:
            print("❌ ID del anime es requerido")
            return
            
        try:
            total_episodes = int(input("📺 Número total de episodios: ").strip())
            starting_id = int(input("🆔 ID inicial en Yaichi: ").strip())
        except ValueError:
            print("❌ Los números deben ser válidos")
            return
        
        token = input(f"🔑 Token (Enter para '{self.config['yaichi_server']['default_token']}'): ").strip()
        if not token:
            token = self.config['yaichi_server']['default_token']
        
        quality = input("📽️  Calidad (Enter para 1080p): ").strip() or "1080p"
        language = input("🗣️  Idioma (Enter para sub): ").strip() or "sub"
        
        # Generar streams
        streams = []
        base_url = self.config['yaichi_server']['base_url']
        
        for episode in range(1, total_episodes + 1):
            stream_id = starting_id + episode - 1
            stream_url = f"{base_url}/{stream_id}?{token}"
            
            streams.append({
                "animeId": anime_id,
                "episodeNumber": episode,
                "streamUrl": stream_url,
                "quality": quality,
                "language": language
            })
        
        print(f"\n📋 Se generarán {len(streams)} streams para '{anime_id}'")
        print(f"   Episodios: 1-{total_episodes}")
        print(f"   IDs Yaichi: {starting_id}-{starting_id + total_episodes - 1}")
        
        confirm = input("\n✅ ¿Continuar? (s/N): ").strip().lower()
        if confirm not in ['s', 'si', 'sí', 'y', 'yes']:
            print("❌ Operación cancelada")
            return
        
        # Enviar a la API
        payload = {
            "bulk": True,
            "streams": streams
        }
        
        try:
            print("📤 Enviando streams...")
            response = requests.post(
                self.api_url,
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                print(f"✅ {len(streams)} streams agregados exitosamente!")
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                
        except requests.RequestException as e:
            print(f"❌ Error de conexión: {e}")
    
    def show_stats(self):
        """Mostrar estadísticas"""
        try:
            response = requests.get(f"{self.api_url}?action=stats", timeout=30)
            
            if response.status_code == 200:
                stats = response.json().get('stats', {})
                print("\n📊 ESTADÍSTICAS DE STREAMS")
                print("-" * 30)
                print(f"Total de streams: {stats.get('totalStreams', 0)}")
                print(f"Streams activos: {stats.get('activeStreams', 0)}")
                
                streams_by_server = stats.get('streamsByServer', {})
                if streams_by_server:
                    print("\nStreams por servidor:")
                    for server, count in streams_by_server.items():
                        print(f"  - {server}: {count}")
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                
        except requests.RequestException as e:
            print(f"❌ Error de conexión: {e}")
    
    def search_anime_by_name(self):
        """Buscar anime por nombre y seleccionar de la lista"""
        print("\n🔍 BUSCAR ANIME POR NOMBRE")
        print("-" * 30)
        
        search_query = input("🎌 Nombre del anime a buscar: ").strip()
        if not search_query:
            print("❌ Nombre del anime es requerido")
            return
        
        try:
            print("🔍 Buscando...")
            response = requests.get(
                f"{self.search_url}?q={search_query}",
                timeout=30
            )
            
            if response.status_code != 200:
                print(f"❌ Error {response.status_code}: {response.text}")
                return
            
            data = response.json()
            results = data.get('results', {})
            animes = results.get('animes', []) if isinstance(results, dict) else results
            
            if not animes:
                print("❌ No se encontraron animes con ese nombre")
                return
            
            print(f"\n📺 Resultados encontrados ({len(animes)}):")
            print("-" * 50)
            
            # Mostrar lista de resultados
            for i, anime in enumerate(animes[:10], 1):  # Mostrar máximo 10
                title = anime.get('name', anime.get('title', 'Sin título'))
                anime_id = anime.get('id', 'N/A')
                year = anime.get('releaseDate', anime.get('year', ''))
                status = anime.get('status', '')
                episodes = anime.get('totalEpisodes', anime.get('episodes', ''))
                
                print(f"{i:2d}. {title}")
                print(f"    ID: {anime_id}")
                if year:
                    print(f"    Año: {year}")
                if status:
                    print(f"    Estado: {status}")
                if episodes:
                    print(f"    Episodios: {episodes}")
                print()
            
            # Selección
            try:
                selection = input("🎯 Selecciona un anime (1-10) o 0 para cancelar: ").strip()
                
                if selection == "0":
                    print("❌ Búsqueda cancelada")
                    return
                
                index = int(selection) - 1
                if 0 <= index < len(animes) and index < 10:
                    selected_anime = animes[index]
                    anime_id = selected_anime.get('id')
                    anime_title = selected_anime.get('name', selected_anime.get('title'))
                    
                    print(f"\n✅ Seleccionado: {anime_title}")
                    print(f"   ID: {anime_id}")
                    
                    # Preguntar qué hacer con el anime seleccionado
                    print("\n¿Qué deseas hacer?")
                    print("1. 📺 Agregar stream para un episodio")
                    print("2. 🎬 Generar serie completa")
                    print("3. 📋 Solo mostrar información")
                    
                    action = input("Selecciona acción (1-3): ").strip()
                    
                    if action == "1":
                        self.add_stream_for_selected_anime(anime_id, anime_title)
                    elif action == "2":
                        self.generate_series_for_selected_anime(anime_id, anime_title)
                    elif action == "3":
                        self.show_anime_info(selected_anime)
                    else:
                        print("❌ Opción inválida")
                else:
                    print("❌ Selección inválida")
                    
            except ValueError:
                print("❌ Número inválido")
                
        except requests.RequestException as e:
            print(f"❌ Error de conexión: {e}")
    
    def add_stream_for_selected_anime(self, anime_id: str, anime_title: str):
        """Agregar stream para anime seleccionado"""
        print(f"\n📺 AGREGAR STREAM PARA: {anime_title}")
        print("-" * 50)
        
        try:
            episode = int(input("📺 Número de episodio: ").strip())
        except ValueError:
            print("❌ Número de episodio inválido")
            return
        
        # URL del stream
        print("\n🔗 Opciones para URL del stream:")
        print("1. Usar formato Yaichi (solo ID del stream)")
        print("2. URL completa personalizada")
        
        url_option = input("Selecciona opción (1-2): ").strip()
        
        if url_option == "1":
            stream_id = input("🆔 ID del stream en Yaichi: ").strip()
            if not stream_id:
                print("❌ ID del stream es requerido")
                return
            token = input(f"🔑 Token (Enter para usar '{self.config['yaichi_server']['default_token']}'): ").strip()
            if not token:
                token = self.config['yaichi_server']['default_token']
            
            stream_url = f"{self.config['yaichi_server']['base_url']}/{stream_id}?{token}"
        else:
            stream_url = input("🔗 URL completa del stream: ").strip()
            if not stream_url:
                print("❌ URL del stream es requerida")
                return
        
        quality = input("📽️  Calidad (Enter para 1080p): ").strip() or "1080p"
        language = input("🗣️  Idioma [sub/dub/raw] (Enter para sub): ").strip() or "sub"
        
        # Enviar a la API
        payload = {
            "animeId": anime_id,
            "episodeNumber": episode,
            "streamUrl": stream_url,
            "quality": quality,
            "language": language
        }
        
        try:
            print("📤 Enviando...")
            response = requests.post(
                self.api_url,
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Stream agregado exitosamente!")
                print(f"   Anime: {anime_title}")
                print(f"   Episodio: {episode}")
                print(f"   ID generado: {result.get('stream', {}).get('id', 'N/A')}")
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                
        except requests.RequestException as e:
            print(f"❌ Error de conexión: {e}")
    
    def generate_series_for_selected_anime(self, anime_id: str, anime_title: str):
        """Generar serie completa para anime seleccionado"""
        print(f"\n🎬 GENERAR SERIE COMPLETA PARA: {anime_title}")
        print("-" * 50)
        
        try:
            total_episodes = int(input("📺 Número total de episodios: ").strip())
            starting_id = int(input("🆔 ID inicial en Yaichi: ").strip())
        except ValueError:
            print("❌ Los números deben ser válidos")
            return
        
        token = input(f"🔑 Token (Enter para '{self.config['yaichi_server']['default_token']}'): ").strip()
        if not token:
            token = self.config['yaichi_server']['default_token']
        
        quality = input("📽️  Calidad (Enter para 1080p): ").strip() or "1080p"
        language = input("🗣️  Idioma (Enter para sub): ").strip() or "sub"
        
        # Generar streams
        streams = []
        base_url = self.config['yaichi_server']['base_url']
        
        for episode in range(1, total_episodes + 1):
            stream_id = starting_id + episode - 1
            stream_url = f"{base_url}/{stream_id}?{token}"
            
            streams.append({
                "animeId": anime_id,
                "episodeNumber": episode,
                "streamUrl": stream_url,
                "quality": quality,
                "language": language
            })
        
        print(f"\n📋 Se generarán {len(streams)} streams para '{anime_title}'")
        print(f"   ID del anime: {anime_id}")
        print(f"   Episodios: 1-{total_episodes}")
        print(f"   IDs Yaichi: {starting_id}-{starting_id + total_episodes - 1}")
        
        confirm = input("\n✅ ¿Continuar? (s/N): ").strip().lower()
        if confirm not in ['s', 'si', 'sí', 'y', 'yes']:
            print("❌ Operación cancelada")
            return
        
        # Enviar a la API
        payload = {
            "bulk": True,
            "streams": streams
        }
        
        try:
            print("📤 Enviando streams...")
            response = requests.post(
                self.api_url,
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                print(f"✅ {len(streams)} streams agregados exitosamente!")
                print(f"   Anime: {anime_title}")
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                
        except requests.RequestException as e:
            print(f"❌ Error de conexión: {e}")
    
    def show_anime_info(self, anime: dict):
        """Mostrar información detallada del anime"""
        print(f"\n📋 INFORMACIÓN DEL ANIME")
        print("-" * 30)
        
        title = anime.get('name', anime.get('title', 'Sin título'))
        anime_id = anime.get('id', 'N/A')
        year = anime.get('releaseDate', anime.get('year', ''))
        status = anime.get('status', '')
        episodes = anime.get('totalEpisodes', anime.get('episodes', ''))
        rating = anime.get('rating', '')
        genres = anime.get('genres', [])
        description = anime.get('description', anime.get('synopsis', ''))
        
        print(f"📺 Título: {title}")
        print(f"🆔 ID: {anime_id}")
        if year:
            print(f"📅 Año: {year}")
        if status:
            print(f"📊 Estado: {status}")
        if episodes:
            print(f"🔢 Episodios: {episodes}")
        if rating:
            print(f"⭐ Rating: {rating}")
        if genres:
            print(f"🏷️  Géneros: {', '.join(genres)}")
        if description:
            # Limitar descripción a 200 caracteres
            desc = description[:200] + "..." if len(description) > 200 else description
            print(f"📝 Descripción: {desc}")
    
    def configure_server(self):
        """Configurar URL del servidor"""
        print(f"\n⚙️  URL actual: {self.base_url}")
        new_url = input("🌐 Nueva URL (Enter para mantener actual): ").strip()
        
        if new_url:
            self.base_url = new_url.rstrip('/')
            self.api_url = f"{self.base_url}/api/admin/streams"
            self.search_url = f"{self.base_url}/api/admin/search"
            print(f"✅ URL actualizada: {self.base_url}")
    
    def create_sample_file(self):
        """Crear archivo de ejemplo"""
        sample_data = [
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
        
        filename = "streams_example.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(sample_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Archivo de ejemplo creado: {filename}")
    
    def run(self):
        """Ejecutar el gestor interactivo"""
        while True:
            self.show_menu()
            choice = input("\n🎯 Selecciona una opción: ").strip()
            
            if choice == "1":
                self.add_single_stream()
            elif choice == "2":
                filename = input("📁 Archivo JSON: ").strip()
                if os.path.exists(filename):
                    print(f"📁 Archivo encontrado: {filename}")
                    # Aquí iría la lógica para cargar desde archivo
                    print("⚠️  Funcionalidad en desarrollo")
                else:
                    print("❌ Archivo no encontrado")
            elif choice == "3":
                self.generate_series()
            elif choice == "4":
                self.search_anime_by_name()
            elif choice == "5":
                self.show_stats()
            elif choice == "6":
                stream_id = input("🗑️  ID del stream a eliminar: ").strip()
                if stream_id:
                    # Aquí iría la lógica para eliminar
                    print("⚠️  Funcionalidad en desarrollo")
            elif choice == "7":
                self.create_sample_file()
            elif choice == "8":
                self.configure_server()
            elif choice == "0":
                print("👋 ¡Hasta luego!")
                break
            else:
                print("❌ Opción inválida")
            
            input("\n⏸️  Presiona Enter para continuar...")

if __name__ == "__main__":
    manager = InteractiveStreamManager()
    manager.run()
