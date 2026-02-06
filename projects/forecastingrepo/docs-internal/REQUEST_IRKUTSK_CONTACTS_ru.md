# Запрос локальных данных и консультаций (Иркутская область)

**Контекст.** Мы строим POC‑прогнозы объёмов ТКО по районам (день/месяц) и готовим Phase‑2 с учётом погоды. Для корректной привязки метеоданных к районам (и проверки влияния орографии) нам нужны локальные источники и консультации.

**Что просим предоставить (минимальный пакет, 2022–2024):**
1. **Границы районов** — актуальные полигоны (GeoJSON/GeoPackage) с идентификаторами, совпадающими с отчётами клиента.
2. **Станции метеонаблюдений** в радиусе 150 км от Иркутска: WMO/ICAO коды, lat/lon, высота, набор переменных (Tavg/Tmin/Tmax, осадки, снежный покров), **полнота данных** по дням, лицензия/условия использования. Формат: CSV‑каталог + daily CSV по станциям.
3. **Орофография** — DEM (30–90 м) и короткая записка об орографических особенностях (где возможна наветренная/подветренная тень и «катабатика»).
4. **Календарь эксплуатации** — даты отопительного сезона (официальный порог и правила запуска/остановки), производственные/праздничные дни, крупные события/перебои.
5. **Аномалии** — журнал сильных погодных явлений (ледяной дождь, сильный снег, оттепели), ЧС и ограничения на вывоз (по датам/районам).
6. **Право использования** — письмо/соглашение, разрешающее внутреннее моделирование (без распространения «как есть» сторонних данных).

**Зачем это нужно.**
— Сопоставить районы со станциями и/или сеткой ERA5‑Land; сравнить методы (IDW p=2, Thiessen, среднее по ячейкам) на **плоском** и **горном** районах; настроить параметры и подтвердить стабильность признаков (HDD/CDD, осадки).
— Уточнить базовую температуру **HDD** для отопительного порога в Иркутске (обычно 18 °C, попросим подтвердить локально).
— Обеспечить детерминизм и юридическую чистоту (лицензии, атрибуция).

**Формат.** CSV/GeoJSON/GeoPackage, кодировка UTF‑8. В каждом файле — «provenance» (источник, ответственный, дата, лицензия).

**С кем готовы обсудить.**
- ИНЦ СО РАН (Лимнологический институт), Байкальский филиал — гидрология/орография.
- Росгидромет (Иркутское УГМС) — станции/нормали/снег.
- Географический факультет ИГУ / БГУ (Улан‑Удэ) — локальные особенности осадков и ветров.
- Эксперты по ЖКХ/отоплению — базовая температура, регламенты запуска/остановки отопления.

**Контакты нашей команды:**
— Технический координатор: [ФИО] · [email] · [тел].
— Формат передачи: ссылкой на архив/облако или Git‑репозиторий с данными.

Спасибо! Мы используем данные **только** для внутреннего моделирования и атрибутируем источники согласно лицензии.
```

---

### What else I learned + next moves (concise)

* **Licensing**: ERA5/ERA5‑Land moving to **CC‑BY** (safe with attribution); Meteostat **CC‑BY‑NC** (fine for modeling; don’t ship raw); geoBoundaries **CC‑BY 4.0**. ([Forum][1])
* **Method choice**: In Poland and surrounding regions, **IDW/kriging generally outperform Thiessen**, and IDW parameters (power, grid) **matter in mountains**—this matches our Irkutsk plan (IDW baseline; ERA5‑Land fallback; Thiessen only as contrast). ([MDPI][2])
* **Regional context**: Selenga/Baikal studies confirm complex circulation/orographic effects—good justification for our **flat vs mountainous** A/B. ([MDPI][3])
* **Climate analogs**: Irkutsk **Dwb/Dwc**; close analogs include **Ulaanbaatar (Dwc)**, **Harbin (Dwa/Dwb region)**, **Yakutsk (Dfc/Dfd)**—useful for priors and stress tests. ([Wikipedia][4])

**Recommendation:** No 200+ web‑search sprint needed now. We have enough to proceed to **PR‑Weather‑A/B Study** and to request **local Irkutsk data** (message above). If you want GUI‑heavy scraping (e.g., station maps, ERA5 Land explorer), we can spin an **agent‑mode** task—but it’s optional.

If you want me to also add a one‑liner to **CI** (workflow) to run `.tools/docs_check.py` explicitly (step name “docs‑ok”), I can prepare that patch in the same style.

[1]: https://forum.ecmwf.int/t/cc-by-licence-to-replace-licence-to-use-copernicus-products-on-02-july-2025/13464?utm_source=chatgpt.com "CC-BY licence to replace Licence to use Copernicus ..."
[2]: https://www.mdpi.com/2072-4292/13/5/1039?utm_source=chatgpt.com "Improvement of Spatial Interpolation of Precipitation ..."
[3]: https://www.mdpi.com/2073-4441/15/1/197?utm_source=chatgpt.com "Trend Analysis of Precipitation, Runoff and Major Ions for ..."
[4]: https://en.wikipedia.org/wiki/Irkutsk?utm_source=chatgpt.com "Irkutsk"