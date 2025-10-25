from PIL import Image

# Open the EPS file
image = Image.open("face.eps")

# Convert to RGB (EPS uses a different color mode)
image = image.convert("RGB")

# Save as JPEG
image.save("face.jpg", "JPEG")