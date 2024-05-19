from bs4 import BeautifulSoup
from urllib.parse import urljoin

def scrape_html(html):
    # Create a BeautifulSoup object
    soup = BeautifulSoup(html, 'html.parser')

    # Extract all the text
    text = soup.get_text(separator=' ')
    text = text.replace('\n', ' ').strip()

    # Extract all the links and their alt text
    links = []
    for link in soup.find_all('a'):
        href = link.get('href')
        if href:
            # Convert relative URLs to absolute URLs
            absolute_url = urljoin(soup.base_url, href)
            links.append((absolute_url))

    # Extract all the image alt text
    alt_text = []
    for img in soup.find_all('img'):
        alt = img.get('alt')
        if alt:
            alt_text.append(alt)

    return text, links, alt_text