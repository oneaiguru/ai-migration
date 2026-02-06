"""
Конфигурация ценообразования для конкретных заведений с автоопределением.

Каждое заведение может использовать разные стратегии ценообразования:
- time_based: Цена варьируется по времени суток (например, Lunda)
- flat: Единая цена, используется price_min из API
- default: Неизвестное заведение, откат на цену API

Возможности:
- Явная конфигурация для известных заведений
- Автоопределение из названий тарифов каталога
- Универсальный откат на цену API

Использование:
    from config.venue_pricing import get_pricing_config, get_venue_price, get_universal_price

    config = get_pricing_config('b1280372')  # Получить конфигурацию Lunda
    price = get_venue_price('b1280372', '14:30', catalog)  # Получить цену на время

    # Универсальное: автоопределяется из каталога, если нет явной конфигурации
    price = get_universal_price('bNEW_ID', '14:30', catalog, 'API_PRICE')
"""

import re
from typing import Dict, Optional, Tuple, Any
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# ПАТТЕРНЫ АВТООПРЕДЕЛЕНИЯ - Для распознавания периодов времени по названиям тарифов
# ============================================================================

TIME_PERIOD_PATTERNS = {
    'evening': {
        'patterns': [
            r'прайм',  # Russian: prime
            r'prime[-\s]?time',
            r'вечер',  # Russian: evening
            r'evening',
            r'ночь',  # Russian: night
            r'night',
            r'после\s*18',  # After 18:00
            r'18[-:]\d{2}',
        ],
        'hours': (18, 6),  # Wraps around midnight
    },
    'morning': {
        'patterns': [
            r'оптимальн',  # Russian: optimal
            r'optimal',
            r'утр[оа]?',  # Russian: morning
            r'morning',
            r'до\s*12',  # Until 12:00
            r'6[-:]\d{2}\s*[-–]',  # Starts at 6:00
        ],
        'hours': (6, 12),
    },
    'midday': {
        'patterns': [
            r'смешан',  # Russian: mixed
            r'mixed',
            r'день',  # Russian: day
            r'day',
            r'дневн',  # Russian: daytime
            r'afternoon',
            r'12[-:]\d{2}\s*[-–]',  # Starts at 12:00
        ],
        'hours': (12, 18),
    },
}


def detect_hours_from_name(tariff_name: str) -> Optional[Tuple[int, int]]:
    """
    Автоопределение диапазона часов из названия тарифа с использованием совпадения паттернов.

    Примеры:
        "Прайм-тайм" → (18, 6)
        "Оптимальный" → (6, 12)
        "Смешанный" → (12, 18)
        "Unknown Name" → None
    """
    if not tariff_name:
        return None

    name_lower = tariff_name.lower()

    for period_info in TIME_PERIOD_PATTERNS.values():
        for pattern in period_info['patterns']:
            if re.search(pattern, name_lower):
                return period_info['hours']

    return None


def auto_build_pricing_rules(catalog: Dict[str, Dict[int, str]]) -> Optional[Dict[str, Any]]:
    """
    Автоматически построить ценовые правила из полученного каталога.

    Анализирует названия услуг и цены для определения структуры ценообразования.
    Требует как минимум 2 распознаваемых тарифа.

    Args:
        catalog: Каталог услуг в виде {'Прайм-тайм': {60: '6 500 ₽'}, ...}

    Returns:
        Автоопределенный словарь конфигурации или None, если паттерн не распознан
    """
    if not catalog or len(catalog) < 2:
        return None

    detected_tariffs = {}

    for tariff_name, durations in catalog.items():
        # Попытаться определить диапазон часов из названия
        hours = detect_hours_from_name(tariff_name)

        if hours and 60 in durations:
            detected_tariffs[tariff_name] = {
                'hours': hours,
                'price_1h': durations[60]
            }

    # Возвращать только если определено как минимум 2 тарифа
    if len(detected_tariffs) >= 2:
        logger.info(f"🤖 [AUTO-DETECT] Найдено {len(detected_tariffs)} тарифов: {list(detected_tariffs.keys())}")
        return {
            'type': 'time_based',
            'tariffs': detected_tariffs,
            'auto_detected': True
        }

    return None


# Ценовые правила заведений
# Ключи - это ID заведений (часть 'bXXXXXXX' из URL YClients)
VENUE_PRICING_RULES: Dict[str, Dict[str, Any]] = {
    # Lunda - ценообразование по времени с 3 тарифами и 3 длительностями
    'b1280372': {
        'name': 'Lunda',
        'type': 'time_based',
        'tariffs': {
            'Оптимальный': {
                'hours': (6, 12),  # 06:00 - 11:59 (Утро)
                'prices': {
                    60: '6 000 ₽',
                    90: '9 000 ₽',
                    120: '12 000 ₽'
                }
            },
            'Смешанный': {
                'hours': (12, 18),  # 12:00 - 17:59 (День)
                'prices': {
                    60: '6 250 ₽',
                    90: '9 375 ₽',
                    120: '12 500 ₽'
                }
            },
            'Прайм-тайм': {
                'hours': (18, 6),  # 18:00 - 05:59 (Вечер, переходит через полночь)
                'prices': {
                    60: '6 500 ₽',
                    90: '9 750 ₽',
                    120: '13 000 ₽'
                }
            },
        }
    },

    # Padel Friends - flat pricing, use API price
    'b861100': {
        'name': 'Padel Friends',
        'type': 'flat',
        'price_1h': None  # Use API price_min
    },

    # Default for unknown venues
    'default': {
        'name': 'Unknown Venue',
        'type': 'flat',
        'price_1h': None  # Use API price_min
    }
}


def extract_venue_id(url: str) -> str:
    """
    Extract venue ID (bXXXXXXX) from YClients URL.

    Examples:
        https://b1280372.yclients.com/... -> 'b1280372'
        https://n1168982.yclients.com/... -> 'n1168982'
    """
    match = re.search(r'https?://([bn]\d+)\.yclients\.com', url)
    if match:
        return match.group(1)
    return 'default'


def get_pricing_config(venue_id: str) -> Dict[str, Any]:
    """
    Get pricing configuration for a venue.

    Args:
        venue_id: Venue ID like 'b1280372' or 'default'

    Returns:
        Pricing config dict with 'type', 'tariffs' (if time_based), etc.
    """
    return VENUE_PRICING_RULES.get(venue_id, VENUE_PRICING_RULES['default'])


def get_tariff_for_time(hour: int, config: Dict[str, Any]) -> Optional[str]:
    """
    Определить, какой тариф применяется для заданного часа.

    Args:
        hour: Час дня (0-23)
        config: Конфигурация ценообразования заведения

    Returns:
        Название тарифа или None, если не ценообразование по времени
    """
    if config.get('type') != 'time_based':
        return None

    tariffs = config.get('tariffs', {})
    for tariff_name, tariff_info in tariffs.items():
        start_hour, end_hour = tariff_info['hours']

        # Обработать диапазон, переходящий через полночь (например, 18-6 = 18:00 - 05:59)
        if start_hour < end_hour:
            # Обычный диапазон (например, 6-12)
            if start_hour <= hour < end_hour:
                return tariff_name
        else:
            # Диапазон через полночь (например, 18-6 = 18-23 ИЛИ 0-5)
            if hour >= start_hour or hour < end_hour:
                return tariff_name

    return None


def get_venue_price(
    venue_id: str,
    time_str: str,
    catalog: Optional[Dict[str, Dict[int, str]]] = None,
    fallback_price: Optional[str] = None,
    duration: int = 60
) -> str:
    """
    Получить правильную цену для комбинации заведение/время.

    Приоритет:
    1. Если заведение имеет конфигурацию time_based И каталог имеет цену тарифа -> использовать каталог
    2. Если заведение имеет конфигурацию time_based со статической ценой -> использовать цену конфига
    3. Если заведение имеет конфигурацию flat -> использовать fallback_price (цена API)
    4. Неизвестное заведение -> использовать fallback_price (цена API)

    Args:
        venue_id: ID заведения в виде 'b1280372'
        time_str: Время в виде "14:30" или "22:00"
        catalog: Каталог услуг из capture_service_catalog()
        fallback_price: Цена из API, используемая как откат
        duration: Длительность бронирования в минутах (по умолчанию 60)

    Returns:
        Строка цены в виде "6 500 ₽" или откат
    """
    config = get_pricing_config(venue_id)

    # Единая цена - просто возвращаем откат
    if config.get('type') == 'flat':
        logger.debug(f"[VENUE-PRICE] {venue_id} использует единую цену, используем цену API: {fallback_price}")
        return fallback_price or "Цена не найдена"

    # Ценообразование по времени
    if config.get('type') == 'time_based':
        try:
            hour = int(time_str.split(':')[0])
            tariff = get_tariff_for_time(hour, config)

            if tariff:
                # Попробовать каталог сначала (динамические цены)
                if catalog and tariff in catalog:
                    if duration in catalog[tariff]:
                        price = catalog[tariff][duration]
                        logger.info(f"💰 [VENUE-PRICE] {venue_id} {time_str} → {tariff} → {price} (каталог)")
                        return price
                    elif catalog[tariff]:
                        # Откат на первую доступную длительность
                        price = list(catalog[tariff].values())[0]
                        logger.info(f"💰 [VENUE-PRICE] {venue_id} {time_str} → {tariff} → {price} (откат каталога)")
                        return price

                # Использовать статическую цену из конфига
                tariff_info = config['tariffs'].get(tariff, {})
                # Support both old (price_1h) and new (prices dict) structure
                prices_dict = tariff_info.get('prices', {})
                static_price = prices_dict.get(duration) or prices_dict.get(60) or tariff_info.get('price_1h')
                if static_price:
                    logger.info(f"💰 [VENUE-PRICE] {venue_id} {time_str} → {tariff} → {static_price} (конфиг)")
                    return static_price

            logger.warning(f"💰 [VENUE-PRICE] {venue_id} {time_str}: тариф не найден, используем откат")

        except Exception as e:
            logger.error(f"💰 [VENUE-PRICE] Ошибка для {venue_id} {time_str}: {e}")

    # Окончательный откат
    return fallback_price or "Цена не найдена"


def get_tariff_name_for_time(venue_id: str, time_str: str) -> str:
    """
    Get the tariff name for a given time (for display purposes).

    Args:
        venue_id: Venue ID like 'b1280372'
        time_str: Time like "14:30"

    Returns:
        Tariff name like "Прайм-тайм" or empty string
    """
    config = get_pricing_config(venue_id)

    if config.get('type') != 'time_based':
        return ''

    try:
        hour = int(time_str.split(':')[0])
        return get_tariff_for_time(hour, config) or ''
    except Exception:
        return ''


def get_price_from_service_name(service_name: Optional[str], catalog: Dict[str, Dict[int, str]], duration: int = 60) -> Optional[str]:
    """
    Match service name to catalog entry and return price.

    This is more accurate than time-based guessing because the service name
    often contains the tariff name, giving us the exact price for that slot.

    Args:
        service_name: Service name like "Падел корт 1 час Прайм-тайм"
        catalog: Service catalog like {'Прайм-тайм': {60: '6 500 ₽'}, ...}
        duration: Booking duration in minutes (default 60)

    Returns:
        Price string if match found, None otherwise
    """
    if not service_name or not catalog:
        return None

    service_lower = service_name.lower()

    # Try to find exact tariff name match in service description
    for tariff_name, durations in catalog.items():
        tariff_lower = tariff_name.lower()

        # Check if tariff name appears in service name
        if tariff_lower in service_lower:
            # Found tariff in service name - use its price
            if duration in durations:
                price = durations[duration]
                logger.info(f"💰 [SERVICE-MATCH] '{service_name}' → {tariff_name} → {price}")
                return price
            elif durations:
                # Fallback to first available duration
                price = list(durations.values())[0]
                logger.info(f"💰 [SERVICE-MATCH] '{service_name}' → {tariff_name} → {price} (duration fallback)")
                return price

    return None


def get_universal_price(
    venue_id: str,
    time_str: str,
    catalog: Optional[Dict[str, Dict[int, str]]] = None,
    fallback_price: Optional[str] = None,
    duration: int = 60,
    auto_detected_rules: Optional[Dict[str, Any]] = None,
    service_name: Optional[str] = None
) -> str:
    """
    Universal pricing with 4-tier fallback strategy:
    1. Service name matching (most accurate - if service_name contains tariff)
    2. Explicit config (VENUE_PRICING_RULES)
    3. Auto-detected from catalog (if not in config)
    4. API price (always works)

    This makes the system work for ANY venue:
    - Service names often contain tariff (e.g., "Падел Прайм-тайм")
    - Known venues use explicit config (Lunda, etc.)
    - New venues with recognizable patterns auto-detect
    - Anything else falls back to API price

    Args:
        venue_id: Venue ID like 'b1280372'
        time_str: Time like "14:30"
        catalog: Service catalog from capture_service_catalog()
        fallback_price: Price from API
        duration: Booking duration in minutes (default 60)
        auto_detected_rules: Pre-computed auto-detected rules (if any)
        service_name: Service name like "Падел корт 1 час Прайм-тайм"

    Returns:
        Price string like "6 500 ₽"
    """
    # Tier 1: Try service name matching (most accurate)
    if service_name and catalog:
        price = get_price_from_service_name(service_name, catalog, duration)
        if price:
            return price

    # Tier 2: Try explicit config
    explicit_config = get_pricing_config(venue_id)

    if explicit_config.get('type') == 'time_based' and venue_id in VENUE_PRICING_RULES:
        price = get_venue_price(
            venue_id=venue_id,
            time_str=time_str,
            catalog=catalog,
            fallback_price=None,
            duration=duration
        )
        if price and price != "Цена не найдена":
            logger.info(f"💰 [UNIVERSAL] {venue_id} {time_str} → {price} (explicit config)")
            return price

    # Tier 3: Try auto-detection from catalog
    if auto_detected_rules is None and catalog:
        auto_detected_rules = auto_build_pricing_rules(catalog)

    if auto_detected_rules and auto_detected_rules.get('type') == 'time_based':
        try:
            hour = int(time_str.split(':')[0])
            tariff = get_tariff_for_time(hour, auto_detected_rules)

            if tariff:
                # Try catalog first
                if tariff in catalog and duration in catalog[tariff]:
                    price = catalog[tariff][duration]
                    logger.info(f"💰 [UNIVERSAL] {venue_id} {time_str} → {price} (auto-detected + catalog)")
                    return price

                # Try static price from auto-detected config
                tariff_info = auto_detected_rules['tariffs'].get(tariff, {})
                prices_dict = tariff_info.get('prices', {})
                static_price = prices_dict.get(60) or tariff_info.get('price_1h')
                if static_price:
                    logger.info(f"💰 [UNIVERSAL] {venue_id} {time_str} → {static_price} (auto-detected)")
                    return static_price
        except Exception as e:
            logger.debug(f"💰 [UNIVERSAL] Auto-detect lookup failed: {e}")

    # Tier 4: Fall back to API price (always works)
    logger.info(f"💰 [UNIVERSAL] {venue_id} {time_str} → {fallback_price} (API fallback)")
    return fallback_price or "Цена не найдена"
