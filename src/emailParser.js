const playWright = require('playwright')

const getEmail = async (url) => {
    const browser = await playWright['chromium'].launch({headless: true})
    const context = await browser.newContext()
    const page = await context.newPage()

    try {
        await page.goto(url, {timeout: 1200000})
    } catch(err){
        console.error(`Ошибка при загрузке${url}`)
    }

    await page.waitForSelector('body')
    await page.waitForLoadState('domcontentloaded')

    const parsedHtml = await page.content()

    const emails = new Set(parsedHtml.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g) || []) || []

    const technicalPrefixes = ['info', 'contact', 'admin', 'support', 'user', 'hello', 'no-reply']
    const technicalDomains = ['wixpress.com', 'sentry.wixpress.com', 'sentry-next.wixpress.com', 'sentry.io']

    const filteredEmails = new Set()

    for (const e of emails){
        const emailLower = e.toLowerCase().trim()
        if(
            !technicalPrefixes.some(prefix => emailLower.startsWith(prefix + '@')) &&
            !technicalDomains.some(domain => emailLower.endsWith('@' + domain))
        ){
            filteredEmails.add(emailLower)
        }
    }

    await context.close()
    await browser.close()

    return filteredEmails
}

module.exports ={ getEmail }