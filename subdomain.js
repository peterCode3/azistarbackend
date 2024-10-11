const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

async function getPagesFromDomain(mainDomain) {
    const visited = new Set();
    const pages = new Set();

    async function fetchPage(url) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error fetching ${url}:`, error.message);
            return null;
        }
    }

    function extractLinks(html, baseUrl) {
        const $ = cheerio.load(html);
        const links = [];
        $('a').each((i, element) => {
            const href = $(element).attr('href');
            if (href) {
                const fullUrl = url.resolve(baseUrl, href);
                if (fullUrl.startsWith(baseUrl) && !visited.has(fullUrl)) {
                    links.push(fullUrl);
                }
            }
        });
        return links;
    }

    async function crawl(baseUrl) {
        if (visited.has(baseUrl)) {
            return;
        }

        visited.add(baseUrl);
        console.log(`Crawling ${baseUrl}`);

        const html = await fetchPage(baseUrl);
        if (!html) {
            return;
        }

        pages.add(baseUrl);

        const links = extractLinks(html, baseUrl);
        for (const link of links) {
            await crawl(link);
        }
    }

    await crawl(mainDomain);
    return Array.from(pages);
}

module.exports = getPagesFromDomain;
