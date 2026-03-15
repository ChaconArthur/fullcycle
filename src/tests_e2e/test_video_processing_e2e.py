import json
import threading
import time
import uuid
from unittest.mock import patch

import pika
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from src.core.video.domain.value_objects import MediaStatus
from src.core.video.infra.video_converted_rabbitmq_consumer import VideoConvertedRabbitMQConsumer
from src.django_project.category_app.views import CategoryViewSet
from src.django_project.video_app.repository import DjangoORMVideoRepository


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.mark.django_db(transaction=True)
class TestVideoFullProcessingE2E:
    def test_video_is_fully_processed_after_conversion(self, api_client: APIClient) -> None:
        # 1. Criar Category via API (bypass autenticação)
        with patch.object(CategoryViewSet, "permission_classes", []):
            category_response = api_client.post(
                "/api/categories/",
                {"name": "Action", "description": "Action movies"},
                format="json",
            )
        assert category_response.status_code == 201
        category_id = category_response.data["id"]

        # 2. Criar Genre via API
        genre_response = api_client.post(
            "/api/genres/",
            {"name": "Drama", "is_active": True, "categories": [category_id]},
            format="json",
        )
        assert genre_response.status_code == 201
        genre_id = genre_response.data["id"]

        # 3. Criar CastMember via API
        cast_member_response = api_client.post(
            "/api/cast_members/",
            {"name": "John Doe", "type": "ACTOR"},
            format="json",
        )
        assert cast_member_response.status_code == 201
        cast_member_id = cast_member_response.data["id"]

        # 4. Criar Video via API
        video_response = api_client.post(
            "/api/videos/",
            {
                "title": "Test Video E2E",
                "description": "Full processing flow test",
                "year_launched": 2024,
                "opened": True,
                "rating": "L",
                "duration": 90,
                "categories_id": [category_id],
                "genres_id": [genre_id],
                "cast_members_id": [cast_member_id],
            },
            format="json",
        )
        assert video_response.status_code == 201
        video_id = video_response.data["id"]

        # 5. Fazer upload de mídia via API
        video_file = SimpleUploadedFile(
            name="test_video.mp4",
            content=b"fake video content for testing",
            content_type="video/mp4",
        )
        upload_response = api_client.patch(
            f"/api/videos/{video_id}/",
            data={"video_file": video_file},
            format="multipart",
        )
        assert upload_response.status_code == 200

        # 6. Iniciar consumer em thread em background
        consumer = VideoConvertedRabbitMQConsumer()
        consumer_thread = threading.Thread(target=consumer.start, daemon=True)
        consumer_thread.start()

        # Aguarda o consumer estar pronto para receber mensagens
        time.sleep(1)

        # 7. Publicar evento na fila videos.converted simulando o retorno do transcoder
        connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
        channel = connection.channel()
        channel.queue_declare(queue="videos.converted")
        message = json.dumps({
            "error": "",
            "video": {
                "resource_id": f"{video_id}.VIDEO",
                "encoded_video_folder": "/path/to/encoded/video",
            },
            "status": "COMPLETED",
        })
        channel.basic_publish(
            exchange="",
            routing_key="videos.converted",
            body=message,
        )
        connection.close()

        # 8. Aguardar processamento (polling com timeout de 10 segundos)
        timeout = 10
        start = time.time()
        video = None
        while time.time() - start < timeout:
            video = DjangoORMVideoRepository().get_by_id(uuid.UUID(str(video_id)))
            if video and video.video and video.video.status == MediaStatus.COMPLETED:
                break
            time.sleep(0.5)

        # 9. Encerrar consumer
        try:
            consumer.channel.stop_consuming()
        except Exception:
            pass

        # 10. Verificar que o video.video foi processado com COMPLETED
        assert video is not None
        assert video.video is not None
        assert video.video.status == MediaStatus.COMPLETED
        assert video.published is True
