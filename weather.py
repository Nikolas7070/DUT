import requests
import locale
from datetime import datetime
from collections import defaultdict
from config import API_KEY

try:
    locale.setlocale(locale.LC_TIME, 'en_US.UTF-8')
except locale.Error:
    locale.setlocale(locale.LC_TIME, 'C')


def get_weather_by_city(city):
    url = f'https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units=metric&lang=ru'
    response = requests.get(url)
    data = response.json()

    if response.status_code != 200 or 'list' not in data:
        return None

    forecast_by_day = defaultdict(list)

    for item in data['list']:
        date_str = item['dt_txt']
        date = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
        day_name = date.strftime('%A')

        temp = item['main']['temp']
        icon = item['weather'][0]['icon']  

        forecast_by_day[day_name].append({
            'temp': temp,
            'icon': icon
        })

    weekdays_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    today = datetime.today().strftime('%A')
    start_index = weekdays_order.index(today)
    ordered_days = weekdays_order[start_index:] + weekdays_order[:start_index]

    result = []
    for day in ordered_days:
        if day in forecast_by_day:
            temps = [item['temp'] for item in forecast_by_day[day]]
            icons = [item['icon'] for item in forecast_by_day[day]]


            most_common_icon = max(set(icons), key=icons.count)

            day_data = {
                'day': day[:3],
                'temp_max': round(max(temps)),
                'temp_min': round(min(temps)),
                'icon': most_common_icon
            }
            result.append(day_data)

        if len(result) == 5:
            break

    return result
