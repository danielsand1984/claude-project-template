"""Minimal Redis Streams consumer skeleton.

Delete this folder if the project has no Python workers. Otherwise use it as
the base for any new worker — subclass or replace `handler_fn` with the actual
job logic.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from typing import Callable, Iterable

import redis

log = logging.getLogger(__name__)


@dataclass
class Message:
    id: str
    fields: dict[str, str]


Handler = Callable[[Message], None]


class RedisQueueConsumer:
    def __init__(
        self,
        redis_url: str,
        topic: str,
        group: str,
        consumer_name: str,
        block_ms: int = 5000,
    ) -> None:
        self.client = redis.from_url(redis_url, decode_responses=True)
        self.stream_key = f"queue:{topic}"
        self.group = group
        self.consumer_name = consumer_name
        self.block_ms = block_ms
        self._ensure_group()

    def _ensure_group(self) -> None:
        try:
            self.client.xgroup_create(
                self.stream_key, self.group, id="0", mkstream=True
            )
        except redis.ResponseError as exc:
            if "BUSYGROUP" not in str(exc):
                raise

    def consume(self, handler: Handler) -> None:
        log.info("consumer.start", extra={"topic": self.stream_key, "group": self.group})
        while True:
            entries: Iterable = self.client.xreadgroup(
                groupname=self.group,
                consumername=self.consumer_name,
                streams={self.stream_key: ">"},
                count=10,
                block=self.block_ms,
            )
            for _, messages in entries or []:
                for msg_id, fields in messages:
                    msg = Message(id=msg_id, fields=fields)
                    try:
                        handler(msg)
                        self.client.xack(self.stream_key, self.group, msg_id)
                    except Exception:
                        log.exception("handler.failed", extra={"msg_id": msg_id})


def parse_payload(msg: Message) -> dict:
    raw = msg.fields.get("payload", "{}")
    return json.loads(raw)
