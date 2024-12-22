from flask import Flask, send_file, request
from PIL import Image, ImageDraw, ImageFont
import io
import logging

app = Flask(__name__)
logging.basicConfig(filename="tracking.log", level=logging.INFO)


@app.route("/track.png")
def track():
    name = request.args.get("name", "Ashok")

    logging.info(
        f"Email opened by IP: {request.remote_addr}, "
        f"Time: {request.date}, "
        f"User-Agent: {request.user_agent}, "
        f"Name displayed on image: {name}"
    )

    img = Image.new("RGB", (200, 100), color="white")
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except IOError:
        font = ImageFont.load_default()
    text = name
    bbox = draw.textbbox((0, 0), text, font=font)
    textwidth = bbox[2] - bbox[0]
    textheight = bbox[3] - bbox[1]
    position = ((200 - textwidth) / 2, (100 - textheight) / 2)
    draw.text(position, text, (0, 0, 0), font=font)
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="PNG")
    img_byte_arr.seek(0)
    return send_file(img_byte_arr, mimetype="image/png")


if __name__ == "__main__":
    app.run(port=5000)
