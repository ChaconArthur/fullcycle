from uuid import UUID

from rest_framework import viewsets
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST

from src.core._shared.events.message_bus import MessageBus
from src.core._shared.infrastructure.storage.local_storage import LocalStorage
from src.core.video.application.use_cases.create_video_without_media import CreateVideoWithoutMedia
from src.core.video.application.use_cases.exceptions import InvalidVideo, RelatedEntitiesNotFound, VideoNotFound
from src.core.video.application.use_cases.upload_video import UploadVideo
from src.core.video.domain.value_objects import Rating
from src.django_project.cast_member_app.repository import DjangoORMCastMemberRepository
from src.django_project.category_app.repository import DjangoORMCategoryRepository
from src.django_project.genre_app.repository import DjangoORMGenreRepository
from src.django_project.video_app.repository import DjangoORMVideoRepository
from src.django_project.video_app.serializers import (
    CreateVideoWithoutMediaInputSerializer,
    CreateVideoWithoutMediaOutputSerializer,
)


class VideoViewSet(viewsets.ViewSet):

    def list(self, request: Request) -> Response:
        raise NotImplementedError

    def create(self, request: Request) -> Response:
        serializer = CreateVideoWithoutMediaInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        use_case = CreateVideoWithoutMedia(
            video_repository=DjangoORMVideoRepository(),
            category_repository=DjangoORMCategoryRepository(),
            genre_repository=DjangoORMGenreRepository(),
            cast_member_repository=DjangoORMCastMemberRepository(),
        )
        try:
            output = use_case.execute(
                CreateVideoWithoutMedia.Input(
                    title=data["title"],
                    description=data["description"],
                    launch_year=data["year_launched"],
                    opened=data["opened"],
                    duration=data["duration"],
                    rating=Rating(data["rating"]),
                    categories=data["categories_id"],
                    genres=data["genres_id"],
                    cast_members=data["cast_members_id"],
                )
            )
        except (InvalidVideo, RelatedEntitiesNotFound) as error:
            return Response(
                status=HTTP_400_BAD_REQUEST,
                data={"error": str(error)},
            )

        return Response(
            status=HTTP_201_CREATED,
            data=CreateVideoWithoutMediaOutputSerializer(output).data,
        )

    def destroy(self, request: Request, pk: UUID = None):
        raise NotImplementedError

    def update(self, request: Request, pk: UUID = None):
        raise NotImplementedError

    def partial_update(self, request: Request, pk: UUID = None):
        file = request.FILES["video_file"]
        content = file.read()
        content_type = file.content_type

        upload_video = UploadVideo(
            repository=DjangoORMVideoRepository(),
            storage_service=LocalStorage(),
            message_bus=MessageBus(),
        )
        try:
            upload_video.execute(
                UploadVideo.Input(
                    video_id=pk,
                    file_name=file.name,
                    content=content,
                    content_type=content_type
                )
            )
        except VideoNotFound:
            return Response(status=404)

        return Response(status=200)
