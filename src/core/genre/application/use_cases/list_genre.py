from dataclasses import dataclass
from uuid import UUID

from src import config
from src.core._shared.application.list_use_case import ListOutput, ListOutputMeta, ListRequest
from src.core.genre.domain.genre_repository import GenreRepository


@dataclass
class GenreOutput:
    id: UUID
    name: str
    categories: set[UUID]
    is_active: bool


@dataclass
class ListGenreRequest(ListRequest):
    pass


@dataclass
class ListGenreResponse(ListOutput[GenreOutput]):
    pass


class ListGenre:
    def __init__(self, repository: GenreRepository):
        self.repository = repository

    Input = ListGenreRequest
    Output = ListGenreResponse

    def execute(self, input: ListGenreRequest) -> ListGenreResponse:
        genres = self.repository.list()
        ordered_genres = sorted(
            genres,
            key=lambda genre: getattr(genre, input.order_by),
        )
        page_offset = (input.current_page - 1) * config.DEFAULT_PAGINATION_SIZE
        genres_page = ordered_genres[page_offset:page_offset + config.DEFAULT_PAGINATION_SIZE]

        return ListGenreResponse(
            data=[
                GenreOutput(
                    id=genre.id,
                    name=genre.name,
                    categories=genre.categories,
                    is_active=genre.is_active,
                )
                for genre in genres_page
            ],
            meta=ListOutputMeta(
                current_page=input.current_page,
                per_page=config.DEFAULT_PAGINATION_SIZE,
                total=len(genres),
            ),
        )
