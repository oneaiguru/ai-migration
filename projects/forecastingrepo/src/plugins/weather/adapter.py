"""Adapter stub for weather source (PR-0, no behavior)."""

class WeatherAdapter:
    def __init__(self, **kwargs):
        self._cfg = kwargs

    def ingest(self):  # pragma: no cover - stub only
        raise NotImplementedError("Weather adapter is a stub in PR-0")

