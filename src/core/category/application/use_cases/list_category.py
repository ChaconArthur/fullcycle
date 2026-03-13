from dataclasses import dataclass
from uuid import UUID

from src import config
from src.core._shared.application.list_use_case import ListOutput, ListOutputMeta, ListRequest
from src.core.category.domain.category_repository import CategoryRepository


@dataclass
class CategoryOutput:
    id: UUID
    name: str
    description: str
    is_active: bool


@dataclass
class ListCategoryRequest(ListRequest):
    pass


@dataclass
class ListCategoryResponse(ListOutput[CategoryOutput]):
    pass


class ListCategory:
    def __init__(self, repository: CategoryRepository) -> None:
        self.repository = repository

    def execute(self, request: ListCategoryRequest) -> ListCategoryResponse:
        categories = self.repository.list()
        ordered_categories = sorted(
            categories,
            key=lambda category: getattr(category, request.order_by),
        )
        page_offset = (request.current_page - 1) * config.DEFAULT_PAGINATION_SIZE
        categories_page = ordered_categories[page_offset:page_offset + config.DEFAULT_PAGINATION_SIZE]

        return ListCategoryResponse(
            data=sorted(
                [
                    CategoryOutput(
                        id=category.id,
                        name=category.name,
                        description=category.description,
                        is_active=category.is_active,
                    ) for category in categories_page
                ],
                key=lambda category: getattr(category, request.order_by),
            ),
            meta=ListOutputMeta(
                current_page=request.current_page,
                per_page=config.DEFAULT_PAGINATION_SIZE,
                total=len(categories),
            ),
        )
