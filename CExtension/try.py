headers = ["Hekk", "How", "are"]

# Check if any header contains 'email' (case insensitive)
if any("email" not in header.lower() for header in headers):
    print("Found a header containing 'email'")
else:
    print("No header containing 'email'")
