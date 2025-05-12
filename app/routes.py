from flask import Blueprint, render_template, request
from weather import get_weather_by_city
from weather import generate_recommendations

bp = Blueprint('main', __name__)

@bp.route("/", methods=["GET", "POST"])
def index():
    city = None
    forecast = None
    recommendation = None

    if request.method == "POST":
        city = request.form.get("cityInput")
        print(f"City received: {city}")  # Отладочное сообщение

        forecast = get_weather_by_city(city)
        if forecast:
            print(f"Forecast received: {forecast}")

            # Проверяем, что в forecast есть данные и что 'temp_max' существует в forecast[0]
            if forecast and len(forecast) > 0 and 'temp_max' in forecast[0]:
                recommendation = generate_recommendations(forecast[0]['temp_max'], city)

                print(f"Recommendation generated!!!!: {recommendation}")  # Отладочное сообщение
            else:
                print("Error: No 'temp_max' found in forecast.")
        else:
            print("Error: No forecast data received.")

    # Передаем все переменные в шаблон и выводим отладочную информацию
    print(f"City: {city}, Forecast: {forecast}, Recommendation: {recommendation}")

    return render_template("index.html", city=city, forecast=forecast, recommendation=recommendation)
