import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from converter_stub import (  # noqa: E402
    add_ids_and_gaps,
    detect_call_context,
    detect_checkpoint_signals,
    detect_searches,
    extract_entities,
)


def make_entry(speaker: str, text: str, start_ms: int, duration: int = 1000):
    return {
        "speaker": speaker,
        "text": text,
        "start_ms": start_ms,
        "end_ms": start_ms + duration,
    }


def test_closing_thanks_final_block_only():
    entries = [
        make_entry("agent", "Владимир, вы из какого города звоните?", 0),
        make_entry("customer", "Из Челябинска.", 1500),
        make_entry("agent", "Спасибо за ожидание. Размеры сверяю. 205, 55, R16 зимние.", 3000),
        make_entry("customer", "Хорошо.", 5000),
        make_entry("agent", "Спасибо за заказ. Всего вам доброго. До свидания.", 7000),
        make_entry("customer", "До свидания.", 9000),
    ]
    entries = add_ids_and_gaps(entries)
    closing = detect_checkpoint_signals(entries)["closing"]
    assert closing["thanks"] is True
    assert closing["goodbye"] is True
    assert closing["thanks_in_last_block"] is True
    assert closing["goodbye_in_last_block"] is True
    assert 3 in closing["matched_utterance_ids"]
    assert 5 in closing["matched_utterance_ids"]
    assert 6 in closing["matched_utterance_ids"]


def test_city_question_guard_and_within_first_five():
    entries = [
        make_entry("agent", "Владимир, вы из какого города звоните?", 0),
        make_entry("customer", "Из Екатеринбурга.", 1500),
        make_entry("agent", "Карла Маркса, Трёхгорный, Сим, почему-то показывают эти города.", 3000),
    ]
    entries = add_ids_and_gaps(entries)
    city = detect_checkpoint_signals(entries)["city"]
    assert city["asked_city"] is True
    assert city["within_first_five"] is True
    assert city["matched_utterance_ids"] == [1]


def test_needs_questions_and_price_guard():
    entries = [
        make_entry("agent", "Сейчас я вам их, вам сколько штук надо их?", 0),
        make_entry("agent", "И зима, лето? Шипы без шипов?", 1500),
        make_entry("agent", "По сумме будет 16 тысяч 360 рублей.", 3000),
    ]
    entries = add_ids_and_gaps(entries)
    needs = detect_checkpoint_signals(entries)["needs"]
    assert needs["quantity_asked"] is True
    assert needs["season_asked"] is True
    assert needs["parameters_asked"] is False
    assert 3 not in needs["matched_utterance_ids"]


def test_reservation_cue_only():
    entries = [
        make_entry("agent", "Мы можем сейчас вам забронировать, то есть резерв держится два дня.", 0),
        make_entry("agent", "Все, вот заказ оформился.", 1500),
    ]
    entries = add_ids_and_gaps(entries)
    reservation = detect_checkpoint_signals(entries)["reservation_offered"]
    assert reservation["offered"] is True
    assert reservation["matched_utterance_ids"] == [1]


def test_search_with_chained_holds():
    entries = [
        make_entry("agent", "Минуту, пожалуйста.", 0, 1000),
        make_entry("agent", "Сейчас проверим информацию. Минуту.", 7000, 1000),
        make_entry("agent", "Спасибо за ожидание. Подскажите, пожалуйста, год выпуска автомобиля.", 15000, 2000),
    ]
    entries = add_ids_and_gaps(entries)
    searches = detect_searches(entries)
    assert len(searches) == 1
    search = searches[0]
    assert search["announced_at_ms"] == 0
    assert search["ended_at_ms"] == 15000
    assert search["thanks_given"] is True


def test_search_short_return_without_strong_end():
    entries = [
        make_entry("agent", "Минуту, сейчас посмотрю.", 0, 1000),
        make_entry("agent", "Есть.", 12000, 1000),
        make_entry("customer", "Отлично, тогда беру.", 14000, 1000),
    ]
    entries = add_ids_and_gaps(entries)
    searches = detect_searches(entries)
    assert len(searches) == 1
    search = searches[0]
    assert search["announced_at_ms"] == 0
    assert search["ended_at_ms"] == 12000
    assert search["thanks_given"] is False


def test_extract_entities_spaced_sizes_and_filters():
    entries = [
        make_entry("agent", "205, 55, R16 зимние.", 0),
        make_entry("customer", "225 на 55, радиус 19.", 1500),
        make_entry("agent", "Крепеж 4 x 98, литой диск R19.", 3000),
        make_entry("agent", "Нужно 4 колеса.", 4500),
        make_entry("agent", "Код 96 39 18, по сумме будет 16 тысяч.", 6000),
        make_entry("agent", "Не зимняя, всесезонка.", 7500),
    ]
    data = extract_entities(entries)
    assert "205/55 R16" in data["tire_sizes"]
    assert "225/55 R19" in data["tire_sizes"]
    assert "R19" in data["rim_sizes"]
    assert "4X98" in data["bolt_patterns"]
    assert data["quantities"] == [4]
    assert "winter" not in data["seasons"]
    assert "allseason" in data["seasons"]


def test_extract_entities_spelled_quantity_with_inflected_context():
    entries = [
        make_entry("customer", "четыре. и мне надо еще, я заказывала шину.", 0),
    ]
    data = extract_entities(entries)
    assert data["quantities"] == [4]
    assert "четыре" in data["quantity_matches"]


def test_greeting_asked_how_to_address_first_agent():
    entries = [
        make_entry("agent", "Здравствуйте, компания 74 колеса, как вас зовут?", 0),
        make_entry("customer", "Владимир.", 1500),
    ]
    entries = add_ids_and_gaps(entries)
    greeting = detect_checkpoint_signals(entries)["greeting"]
    assert greeting["asked_how_to_address"] is True
    assert greeting["first_agent_company"] is True


def test_advantage_excludes_plain_price_line():
    entries = [
        make_entry("agent", "стоимостью 3200, но здесь 100 процентов предоплата нужна.", 0),
        make_entry("agent", "Расширенная гарантия. Топливо в подарок 15 литров.", 1500),
    ]
    entries = add_ids_and_gaps(entries)
    cp = detect_checkpoint_signals(entries)
    advantages = cp["advantages_used"]
    assert 2 in advantages["matched_utterance_ids"]
    assert 1 not in advantages["matched_utterance_ids"]


def test_call_type_precedence_and_marketplace_other():
    order_entries = [
        make_entry("agent", "Оформляю заказ, номер заказа 7654321 записал.", 0),
        make_entry("customer", "Адрес для доставки Ленина 10, оформляйте.", 1500),
    ]
    status_entries = [
        make_entry("customer", "Подскажите статус заказа 1234567, он готов?", 0),
        make_entry("agent", "Уточню по заказу.", 1500),
    ]
    tire_entries = [make_entry("customer", "Нужна запись на шиномонтаж завтра.", 0)]
    marketplace_entries = [make_entry("customer", "Я с озон, где забрать?", 0)]
    order_ctx = detect_call_context(order_entries)
    status_ctx = detect_call_context(status_entries)
    tire_ctx = detect_call_context(tire_entries)
    other_ctx = detect_call_context(marketplace_entries)
    assert order_ctx["call_type"] == "ORDER"
    assert status_ctx["call_type"] == "STATUS_INQUIRY"
    assert tire_ctx["call_type"] == "TIRE_SERVICE"
    assert other_ctx["call_type"] == "OTHER"


def test_order_numbers_and_disk_diameter_filters():
    entries = [
        make_entry("customer", "+7 999 123 45 67, это телефон.", 0),
        make_entry("agent", "Номер заказа 1234567, записал.", 1500),
        make_entry("agent", "Есть литые диски R18 в наличии.", 3000),
        make_entry("agent", "205/55 R16 зимние, без дисков.", 4500),
    ]
    data = extract_entities(entries)
    assert data["order_numbers"] == ["1234567"]
    assert data["disk_diameter"] == 18


def test_needs_brand_price_delivery_and_wheel_type():
    entries = add_ids_and_gaps(
        [
            make_entry("agent", "По бренду предпочтения есть или не важно?", 0),
            make_entry("agent", "В какой бюджет хотите уложиться?", 1500),
            make_entry("agent", "Доставка или самовывоз удобнее?", 3000),
            make_entry("agent", "Литые или штампованные диски интересуют?", 4500),
        ]
    )
    needs = detect_checkpoint_signals(entries)["needs"]
    assert needs["brand_asked"] is True
    assert needs["price_range_asked"] is True
    assert needs["delivery_preference_asked"] is True
    assert needs["wheel_type_asked"] is True


def test_upsell_offer_signals():
    entries = add_ids_and_gaps(
        [
            make_entry("agent", "Также могу предложить секретки на колеса.", 0),
            make_entry("agent", "Нужны будут датчики давления?", 1500),
            make_entry("agent", "Крепеж тоже можем добавить в заказ.", 3000),
        ]
    )
    upsell = detect_checkpoint_signals(entries)["upsell_offer"]
    assert upsell["offered"] is True
    assert upsell["sekretki_mentioned"] is True
    assert upsell["datchiki_mentioned"] is True
    assert upsell["krepezh_mentioned"] is True


def test_order_status_signals():
    entries = add_ids_and_gaps(
        [
            make_entry("agent", "Скажите номер заказа или телефон, чтобы проверить статус.", 0),
            make_entry("agent", "Ваш заказ готов, можно забирать завтра.", 1500),
            make_entry("agent", "СМС отправим, оплатить можно при получении.", 3000),
        ]
    )
    status = detect_checkpoint_signals(entries)["order_status"]
    assert status["order_or_phone_requested"] is True
    assert status["status_communicated"] is True
    assert status["next_steps_explained"] is True


def test_tire_service_signals():
    entries = add_ids_and_gaps(
        [
            make_entry("agent", "Записала вас на шиномонтаж на завтра.", 0),
            make_entry("agent", "СМС придёт с подтверждением записи.", 1500),
            make_entry("agent", "Приезжайте к 10 утра, чуть раньше.", 3000),
            make_entry("agent", "Работаем только с легковыми, без грузовых.", 4500),
            make_entry("agent", "Машина должна быть пустая внутри.", 6000),
            make_entry("agent", "Есть скидка 20% на монтаж.", 7500),
            make_entry("agent", "При покупке комплекта шиномонтаж бесплатный.", 9000),
        ]
    )
    ts = detect_checkpoint_signals(entries)["tire_service"]
    assert ts["booking_confirmed"] is True
    assert ts["sms_mentioned"] is True
    assert ts["arrival_time_stated"] is True
    assert ts["vehicle_restriction_stated"] is True
    assert ts["empty_vehicle_stated"] is True
    assert ts["mount_discount_mentioned"] is True
    assert ts["free_mount_mentioned"] is True


def test_conditional_triggers():
    entries = add_ids_and_gaps(
        [
            make_entry("agent", "Если что, оставьте номер для перезвона.", 0),
            make_entry("customer", "ООО Ромашка, ИНН 1234567890.", 1500),
            make_entry("customer", "Нужно записаться на шиномонтаж.", 3000),
            make_entry("agent", "Может забрать третье лицо по доверенности?", 4500),
        ]
    )
    triggers = detect_checkpoint_signals(entries)["conditional_triggers"]
    assert triggers["callback_phone_asked"] is True
    assert triggers["legal_entity_detected"] is True
    assert triggers["tire_service_requested"] is True
    assert triggers["third_party_pickup_asked"] is True


def test_order_number_hyphenated_and_phone_guard():
    entries = [
        make_entry("agent", "Номер заказа 96-30-84 записал.", 0),
        make_entry("customer", "+7 999 123 45 67, это телефон для связи.", 1500),
    ]
    ctx = detect_call_context(entries)
    data = extract_entities(entries)
    assert ctx["call_type"] == "ORDER"
    assert data["order_numbers"] == ["963084"]


def test_status_precedence_over_order_with_status_keywords():
    entries = [
        make_entry("customer", "Статус заказа 1234567 подскажите, когда будет готов?", 0),
        make_entry("agent", "Уточню статус заказа и вернусь.", 1500),
    ]
    ctx = detect_call_context(entries)
    assert ctx["call_type"] == "STATUS_INQUIRY"


def test_disk_diameter_requires_wheel_context():
    entries = [
        make_entry("customer", "205/55 R16 зимние шины ищу.", 0),
        make_entry("agent", "Без дисков, только резина.", 1500),
    ]
    data = extract_entities(entries)
    assert data["disk_diameter"] is None
    assert "R16" in data["rim_sizes"]


def test_quantity_filter_prefers_reasonable_values():
    entries = [
        make_entry("agent", "Нужно четыре комплекта колес.", 0),
        make_entry("agent", "двенадцать", 1500),
        make_entry("agent", "семьдесят четыре колеса не нужно.", 3000),
    ]
    data = extract_entities(entries)
    assert data["quantities"] == [4]


def test_legal_marker_precision():
    entries = [
        make_entry("customer", "нужна цена для юридически значимых лиц", 0),
        make_entry("customer", "ИНН 1234567890", 1500),
    ]
    data = extract_entities(entries)
    assert "ИНН" in data["legal_entity_markers"]
    assert "ЮР ЛИЦО" not in data["legal_entity_markers"]
    assert "ООО" not in data["legal_entity_markers"]


def test_marketplace_price_reference_stays_product():
    entries = [
        make_entry("customer", "На яндекс маркете цена ниже, хочу узнать наличие.", 0),
    ]
    ctx = detect_call_context(entries)
    assert ctx["call_type"] == "OTHER"


def test_call_type_order_with_new_number():
    entries = [
        make_entry("customer", "Хочу оформить заказ, номер заказа 123456 оформляю сейчас.", 0),
    ]
    ctx = detect_call_context(entries)
    assert ctx["call_type"] == "ORDER"


def test_call_type_status_with_existing_number():
    entries = [
        make_entry("customer", "Подскажите статус заказа 654321, когда будет готов?", 0),
    ]
    ctx = detect_call_context(entries)
    assert ctx["call_type"] == "STATUS_INQUIRY"


def test_call_type_order_intent_with_tire_service_reference():
    entries = [
        make_entry("customer", "Давайте оформим заказ и сразу записать на шиномонтаж.", 0),
    ]
    ctx = detect_call_context(entries)
    assert ctx["call_type"] == "ORDER"
