import requests
import time

base_url = "https://api.assemblyai.com"

headers = {
    # Replace with your chosen API key, this is the "default" account api key
    "authorization": "7a651461efee4ce8ba1557eb2a6c403e"
}

# URL of the file to transcribe
FILE_URL = "https://cdn.assemblyai.com/upload/8e4cb7be-2599-4c4a-96da-d003bbaae2c2"

# You can set additional parameters for the transcription
config = {
  "audio_url": FILE_URL,
  "speaker_labels":True,
  "format_text":True,
  "punctuate":True,
  "speech_model":"universal",
  "language_detection":True
}
config["speech_understanding"] = {
  "request": {
    "speaker_identification": {
      "speaker_type": "role",
      "known_values": [
        "Agent, Customer"
      ]
    }
  }
}
config["keyterms_prompt"] = [
  "Кусвы",
  "Качканар",
  "Ускотов",
  "Усть-Катав",
  "Кировский",
  "Красноуфимск",
  "Камешково",
  "Камешкова",
  "Челябинска",
  "Yokohama",
  "Йокохама",
  "Йоко Хама",
  "Kumho",
  "Кумхо",
  "Pirelli",
  "Пирелли",
  "Пирели",
  "Goodyear",
  "Гудер",
  "Bridgestone",
  "Бридстон",
  "Бриджстоун",
  "Hankook",
  "Ханкука",
  "Ханкук",
  "Cordiant",
  "Кордиант",
  "Nokian",
  "Нокен Политеро",
  "Fortune Polaris",
  "Форчуна Поларо Айс",
  "Triangle",
  "Sailun Atrezzo",
  "Sailun Azura",
  "Wintercraft",
  "Toyo Observe",
  "Icon Autograph",
  "Икон Автограф",
  "KAMA Irbis",
  "Кама Ирбис",
  "Haval",
  "Хавала Стрим",
  "Citroen Jumpy",
  "Пежо Эксперт",
  "Hyundai Elantra",
  "Хюндай Элантра",
  "Renault Sandero Stepway",
  "Сандеро Степвей",
  "74колеса.ру",
  "трейд-ин",
  "трейдин",
  "штампованные диски",
  "литые диски",
  "шиномонтаж",
  "разболтовка",
  "балансировка",
  "вылет",
  "ступица",
  "протектор",
  "Яндекс.Пэй",
  "Яндекс.Заправки",
  "рассрочка",
  "Tinkoff",
  "Синькоф",
  "Шевская",
  "Серафима Дерябина",
  "самовывоз",
  "предоплата",
  "липучка",
  "шипованная",
  "фрикционная",
  "перебортовка",
  "Магнитогорск",
  "Курган",
  "Самара",
  "Пермь",
  "Уфы",
  "УФЕ",
  "Владимирская область",
  "Ковров",
  "Ковровье",
  "Тюмени",
  "Васильево",
  "Пермь-Васильево",
  "Василия Васильева",
  "ВАЗ Веста",
  "Vesta",
  "Haval M6",
  "М6",
  "Пежо Джамп",
  "Jump",
  "Gislaved",
  "Гисловед",
  "Ningba",
  "Требл",
  "Treble",
  "Sonic Winter",
  "Formula Ice",
  "Формула Айс",
  "Ice Guard",
  "Айс Гард",
  "ASGORS",
  "IG55",
  "IG65",
  "Road Tour",
  "Гравити",
  "Трунтур",
  "СУФ",
  "SUV",
  "TIC KILIF",
  "транспортная компания Кит",
  "КИТ",
  "Луч компания",
  "Адвента",
  "вокзальная",
  "Щербакова",
  "Армавирская",
  "Машиностроителей",
  "Токаре",
  "Волгоградская",
  "Белореченской",
  "зоологической",
  "Карла Маркса",
  "строителей",
  "ВЖН склад",
  "посадочный диаметр",
  "заболтовка",
  "секрета",
  "безналом",
  "протектора",
  "тредовая",
  "расчетного счета",
  "уценка",
  "бронь",
  "резерв",
  "страд-ин",
  "сдать комплект",
  "послезавтра",
  "заказ оформлен",
  "номер брони",
  "купон бесплатный",
  "расширенная гарантия",
  "топливо в подарок",
  "пятнадцать литров",
  "защита проколов"
]

url = base_url + "/v2/transcript"
response = requests.post(url, json=config, headers=headers)

transcript_id = response.json()['id']
polling_endpoint = base_url + "/v2/transcript/" + transcript_id

while True:
  transcription_result = requests.get(polling_endpoint, headers=headers).json()
  transcription_text = transcription_result['text']

  if transcription_result['status'] == 'completed':
    print(f"Transcript Text:", transcription_text)
    break

  elif transcription_result['status'] == 'error':
    raise RuntimeError(f"Transcription failed: {transcription_result['error']}")

  else:
    time.sleep(3)
  
