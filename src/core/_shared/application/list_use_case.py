from dataclasses import dataclass, field
from typing import Generic, TypeVar

from src import config


@dataclass
class ListRequest:
    order_by: str = "name"
    current_page: int = 1


@dataclass
class ListOutputMeta:
    current_page: int = 1
    per_page: int = config.DEFAULT_PAGINATION_SIZE
    total: int = 0


T = TypeVar("T")


@dataclass
class ListOutput(Generic[T]):
    data: list[T] = field(default_factory=list)
    meta: ListOutputMeta = field(default_factory=ListOutputMeta)
